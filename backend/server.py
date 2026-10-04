from dotenv import load_dotenv
from pathlib import Path
import os

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import logging
import secrets
import string
import random
import re
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Annotated

import jwt
import bcrypt
from bson import ObjectId
from fastapi import FastAPI, APIRouter, Request, Response, HTTPException, Depends, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, BeforeValidator, ConfigDict
import io

from data.professions import get_catalog, FAMILY_NAMES, FAMILIES
from profile_generator import generate_profile
from pdf_generator import generate_pdf_bytes, safe_filename

# ---------------------------------------------------------------- setup
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALG = "HS256"
UPLOAD_DIR = Path(os.environ.get("UPLOAD_DIR", str(ROOT_DIR / "uploads")))
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_RECEIPT = {"image/jpeg", "image/png", "image/webp", "application/pdf"}
MAX_RECEIPT_BYTES = 5 * 1024 * 1024

ORDER_STATES = ["rascunho", "aguarda_pagamento", "comprovativo_recebido", "em_verificacao", "aprovado", "rejeitado", "cancelado"]

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("kurrikulupro")

app = FastAPI(title="KurrikuluPro Angola")
api = APIRouter(prefix="/api")

PyObjectId = Annotated[str, BeforeValidator(lambda v: str(v))]


def now_iso():
    return datetime.now(timezone.utc).isoformat()


# ---------------------------------------------------------------- auth helpers
def hash_password(p: str) -> str:
    return bcrypt.hashpw(p.encode(), bcrypt.gensalt()).decode()


def verify_password(p: str, h: str) -> bool:
    try:
        return bcrypt.checkpw(p.encode(), h.encode())
    except Exception:
        return False


def create_access_token(uid: str, email: str) -> str:
    return jwt.encode({"sub": uid, "email": email, "type": "access",
                       "exp": datetime.now(timezone.utc) + timedelta(hours=8)}, JWT_SECRET, algorithm=JWT_ALG)


async def get_admin(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(401, "Sessão não iniciada")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
        if payload.get("type") != "access":
            raise HTTPException(401, "Token inválido")
        user = await db.admins.find_one({"_id": ObjectId(payload["sub"])})
        if not user or user.get("role") != "admin":
            raise HTTPException(401, "Acesso negado")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Sessão expirada")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Token inválido")


async def audit(admin_email: str, action: str, order_code: str = None, detail: str = ""):
    await db.audit_log.insert_one({
        "admin": admin_email, "action": action, "order_code": order_code,
        "detail": detail, "at": now_iso(),
    })


# ---------------------------------------------------------------- models
class LoginBody(BaseModel):
    email: str
    password: str


class DraftBody(BaseModel):
    model_config = ConfigDict(extra="allow")
    content: dict


class ProfileBody(BaseModel):
    content: dict


class OrderCreate(BaseModel):
    draft_token: str


class SettingsBody(BaseModel):
    price_kz: int
    multicaixa_number: str
    reference_entity: str
    reference_number: str
    support_whatsapp: str
    iban: str
    bank_name: str
    published: bool


class ProfessionCreate(BaseModel):
    name: str
    family: str
    pathway: str = "procurar_emprego"
    aliases: List[str] = []
    skill_groups: List[str] = []


# ---------------------------------------------------------------- order code
def gen_order_code() -> str:
    return "KP-" + "".join(random.choices(string.ascii_uppercase + string.digits, k=6))


# ---------------------------------------------------------------- draft endpoints
@api.post("/drafts")
async def create_draft(body: DraftBody):
    token = secrets.token_urlsafe(24)
    doc = {"token": token, "content": body.content, "created_at": now_iso(), "updated_at": now_iso()}
    await db.drafts.insert_one(doc)
    return {"token": token, "content": body.content}


@api.get("/drafts/{token}")
async def get_draft(token: str):
    d = await db.drafts.find_one({"token": token}, {"_id": 0})
    if not d:
        raise HTTPException(404, "Rascunho não encontrado")
    return d


@api.put("/drafts/{token}")
async def update_draft(token: str, body: DraftBody):
    res = await db.drafts.update_one({"token": token}, {"$set": {"content": body.content, "updated_at": now_iso()}})
    if res.matched_count == 0:
        raise HTTPException(404, "Rascunho não encontrado")
    return {"ok": True}


@api.delete("/drafts/{token}")
async def delete_draft(token: str):
    await db.drafts.delete_one({"token": token})
    return {"ok": True}


# ---------------------------------------------------------------- professions
@api.get("/professions")
async def list_professions(search: str = "", family: str = ""):
    query = {"status": "published"}
    if family:
        query["family"] = family
    docs = await db.professions.find(query, {"_id": 0}).to_list(2000)
    if search:
        s = search.strip().lower()
        def match(p):
            hay = " ".join([p.get("name", "")] + p.get("aliases", []) + [p.get("family", "")]).lower()
            return s in hay
        docs = [p for p in docs if match(p)]
    docs.sort(key=lambda p: p.get("name", ""))
    return {"families": [{"id": fid, "name": name} for fid, name in FAMILIES], "professions": docs}


@api.get("/professions/{pid}")
async def get_profession(pid: str):
    p = await db.professions.find_one({"id": pid}, {"_id": 0})
    if not p:
        raise HTTPException(404, "Profissão não encontrada")
    return p


# ---------------------------------------------------------------- profile generation
@api.post("/profile/generate")
async def profile_generate(body: ProfileBody):
    return {"text": generate_profile(body.content)}


# ---------------------------------------------------------------- public settings
async def get_settings_doc():
    s = await db.settings.find_one({"_id": "payment"})
    if not s:
        s = {
            "_id": "payment", "price_kz": 900,
            "multicaixa_number": "925 702 270",
            "reference_entity": "10116", "reference_number": "925702270",
            "support_whatsapp": "+244 958 826 913",
            "iban": "", "bank_name": "",
            "published": False,
        }
        await db.settings.insert_one(s)
    return s


@api.get("/settings/public")
async def public_settings():
    s = await get_settings_doc()
    out = {"price_kz": s.get("price_kz", 900), "support_whatsapp": s.get("support_whatsapp", ""), "published": s.get("published", False)}
    if s.get("published"):
        out.update({
            "multicaixa_number": s.get("multicaixa_number", ""),
            "reference_entity": s.get("reference_entity", ""),
            "reference_number": s.get("reference_number", ""),
            "iban": s.get("iban", ""),
            "bank_name": s.get("bank_name", ""),
        })
    return out


# ---------------------------------------------------------------- orders (public)
@api.post("/orders")
async def create_order(body: OrderCreate):
    draft = await db.drafts.find_one({"token": body.draft_token})
    if not draft:
        raise HTTPException(404, "Rascunho não encontrado")
    existing = await db.orders.find_one({"draft_token": body.draft_token, "status": {"$nin": ["cancelado", "rejeitado"]}})
    if existing:
        return {"order_code": existing["order_code"], "access_token": existing["access_token"], "status": existing["status"]}
    s = await get_settings_doc()
    content = draft["content"]
    personal = content.get("personal") or {}
    code = gen_order_code()
    while await db.orders.find_one({"order_code": code}):
        code = gen_order_code()
    access_token = secrets.token_urlsafe(24)
    doc = {
        "order_code": code, "access_token": access_token, "draft_token": body.draft_token,
        "content_snapshot": content, "pathway": content.get("pathway"),
        "phone": personal.get("phone", ""), "amount": s.get("price_kz", 900),
        "method": "manual", "status": "aguarda_pagamento",
        "receipt": None, "reject_reason": None,
        "created_at": now_iso(), "updated_at": now_iso(),
    }
    await db.orders.insert_one(doc)
    return {"order_code": code, "access_token": access_token, "status": doc["status"]}


async def _require_order(order_code: str, access_token: str):
    o = await db.orders.find_one({"order_code": order_code})
    if not o or o.get("access_token") != access_token:
        raise HTTPException(404, "Pedido não encontrado")
    return o


@api.get("/orders/{order_code}")
async def order_status(order_code: str, access_token: str):
    o = await _require_order(order_code, access_token)
    return {
        "order_code": o["order_code"], "status": o["status"], "amount": o["amount"],
        "has_receipt": bool(o.get("receipt")), "reject_reason": o.get("reject_reason"),
        "pdf_available": o["status"] == "aprovado", "updated_at": o["updated_at"],
    }


@api.post("/orders/{order_code}/receipt")
async def upload_receipt(order_code: str, access_token: str = Form(...), file: UploadFile = File(...)):
    o = await _require_order(order_code, access_token)
    if o["status"] in ("aprovado",):
        raise HTTPException(400, "Pedido já aprovado")
    if file.content_type not in ALLOWED_RECEIPT:
        raise HTTPException(400, "Tipo de ficheiro não permitido. Use JPG, PNG, WEBP ou PDF.")
    data = await file.read()
    if len(data) > MAX_RECEIPT_BYTES:
        raise HTTPException(400, "O ficheiro é demasiado grande (máx. 5 MB).")
    ext = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "application/pdf": ".pdf"}[file.content_type]
    fname = f"{order_code}_{secrets.token_hex(8)}{ext}"
    (UPLOAD_DIR / fname).write_bytes(data)
    await db.orders.update_one({"order_code": order_code}, {"$set": {
        "receipt": {"filename": fname, "content_type": file.content_type, "uploaded_at": now_iso()},
        "status": "comprovativo_recebido", "updated_at": now_iso(),
    }})
    return {"ok": True, "status": "comprovativo_recebido"}


@api.get("/orders/{order_code}/pdf")
async def download_pdf(order_code: str, access_token: str):
    o = await _require_order(order_code, access_token)
    if o["status"] != "aprovado":
        raise HTTPException(403, "O currículo só fica disponível após a aprovação do pagamento.")
    pdf = generate_pdf_bytes(o["content_snapshot"])
    fname = safe_filename(o["content_snapshot"], order_code)
    return StreamingResponse(io.BytesIO(pdf), media_type="application/pdf",
                             headers={"Content-Disposition": f'attachment; filename="{fname}"'})


# ---------------------------------------------------------------- admin auth
@api.post("/auth/login")
async def login(body: LoginBody, response: Response):
    email = body.email.strip().lower()
    user = await db.admins.find_one({"email": email})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(401, "Email ou palavra-passe incorrectos")
    token = create_access_token(str(user["_id"]), email)
    response.set_cookie("access_token", token, httponly=True, secure=True, samesite="none", max_age=28800, path="/")
    return {"email": email, "role": user.get("role"), "name": user.get("name")}


@api.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"ok": True}


@api.get("/auth/me")
async def me(admin: dict = Depends(get_admin)):
    return {"email": admin["email"], "role": admin["role"], "name": admin.get("name")}


# ---------------------------------------------------------------- admin orders
@api.get("/admin/orders")
async def admin_orders(status: str = "", method: str = "", q: str = "", date_from: str = "", date_to: str = "",
                       admin: dict = Depends(get_admin)):
    query = {}
    if status:
        query["status"] = status
    if method:
        query["method"] = method
    if date_from or date_to:
        rng = {}
        if date_from:
            rng["$gte"] = date_from
        if date_to:
            rng["$lte"] = date_to + "T23:59:59"
        query["created_at"] = rng
    docs = await db.orders.find(query).sort("created_at", -1).to_list(1000)
    out = []
    for o in docs:
        p = o.get("content_snapshot", {}).get("personal", {})
        nome = f"{p.get('first_name','')} {p.get('last_name','')}".strip()
        if q and q.strip().lower() not in (nome.lower() + " " + o["order_code"].lower() + " " + (o.get("phone") or "")):
            continue
        out.append({
            "id": str(o["_id"]), "order_code": o["order_code"], "name": nome,
            "phone": o.get("phone"), "pathway": o.get("pathway"), "amount": o.get("amount"),
            "status": o["status"], "method": o.get("method"), "has_receipt": bool(o.get("receipt")),
            "created_at": o["created_at"], "updated_at": o["updated_at"],
        })
    return {"orders": out}


@api.get("/admin/orders/{oid}")
async def admin_order_detail(oid: str, admin: dict = Depends(get_admin)):
    o = await db.orders.find_one({"_id": ObjectId(oid)})
    if not o:
        raise HTTPException(404, "Pedido não encontrado")
    o["id"] = str(o.pop("_id"))
    o.pop("access_token", None)
    return o


@api.get("/admin/orders/{oid}/receipt")
async def admin_receipt(oid: str, admin: dict = Depends(get_admin)):
    o = await db.orders.find_one({"_id": ObjectId(oid)})
    if not o or not o.get("receipt"):
        raise HTTPException(404, "Comprovativo não encontrado")
    r = o["receipt"]
    path = UPLOAD_DIR / r["filename"]
    if not path.exists():
        raise HTTPException(404, "Ficheiro não encontrado")
    return StreamingResponse(io.BytesIO(path.read_bytes()), media_type=r["content_type"])


@api.post("/admin/orders/{oid}/approve")
async def admin_approve(oid: str, admin: dict = Depends(get_admin)):
    o = await db.orders.find_one({"_id": ObjectId(oid)})
    if not o:
        raise HTTPException(404, "Pedido não encontrado")
    await db.orders.update_one({"_id": ObjectId(oid)}, {"$set": {"status": "aprovado", "reject_reason": None, "updated_at": now_iso()}})
    await audit(admin["email"], "aprovar", o["order_code"])
    return {"ok": True, "status": "aprovado"}


@api.post("/admin/orders/{oid}/reject")
async def admin_reject(oid: str, reason: str = Form(...), admin: dict = Depends(get_admin)):
    o = await db.orders.find_one({"_id": ObjectId(oid)})
    if not o:
        raise HTTPException(404, "Pedido não encontrado")
    await db.orders.update_one({"_id": ObjectId(oid)}, {"$set": {"status": "rejeitado", "reject_reason": reason, "updated_at": now_iso()}})
    await audit(admin["email"], "rejeitar", o["order_code"], reason)
    return {"ok": True, "status": "rejeitado"}


@api.post("/admin/orders/{oid}/verifying")
async def admin_verifying(oid: str, admin: dict = Depends(get_admin)):
    o = await db.orders.find_one({"_id": ObjectId(oid)})
    if not o:
        raise HTTPException(404, "Pedido não encontrado")
    await db.orders.update_one({"_id": ObjectId(oid)}, {"$set": {"status": "em_verificacao", "updated_at": now_iso()}})
    await audit(admin["email"], "em_verificacao", o["order_code"])
    return {"ok": True, "status": "em_verificacao"}


@api.get("/admin/audit")
async def admin_audit(admin: dict = Depends(get_admin)):
    docs = await db.audit_log.find({}, {"_id": 0}).sort("at", -1).to_list(500)
    return {"entries": docs}


@api.get("/admin/stats")
async def admin_stats(admin: dict = Depends(get_admin)):
    stats = {}
    for st in ORDER_STATES:
        stats[st] = await db.orders.count_documents({"status": st})
    stats["total"] = await db.orders.count_documents({})
    return stats


# ---------------------------------------------------------------- admin settings & professions
@api.get("/admin/settings")
async def admin_get_settings(admin: dict = Depends(get_admin)):
    s = await get_settings_doc()
    s.pop("_id", None)
    return s


@api.put("/admin/settings")
async def admin_put_settings(body: SettingsBody, admin: dict = Depends(get_admin)):
    await db.settings.update_one({"_id": "payment"}, {"$set": body.model_dump()}, upsert=True)
    await audit(admin["email"], "actualizar_definicoes", None, f"published={body.published}")
    return {"ok": True}


@api.get("/admin/professions")
async def admin_list_professions(admin: dict = Depends(get_admin)):
    docs = await db.professions.find({}, {"_id": 0}).sort("name", 1).to_list(3000)
    return {"families": [{"id": fid, "name": name} for fid, name in FAMILIES], "professions": docs}


@api.post("/admin/professions")
async def admin_add_profession(body: ProfessionCreate, admin: dict = Depends(get_admin)):
    pid = re.sub(r"[^a-z0-9]+", "_", body.name.strip().lower()).strip("_")
    if await db.professions.find_one({"id": pid}):
        pid = pid + "_" + secrets.token_hex(2)
    doc = {"id": pid, "family": body.family, "name": body.name.strip(), "aliases": body.aliases,
           "short_desc": "", "pathway": body.pathway, "skill_groups": body.skill_groups,
           "status": "published", "created_by": admin["email"], "created_at": now_iso()}
    await db.professions.insert_one(doc)
    await audit(admin["email"], "adicionar_profissao", None, body.name)
    return {"ok": True, "id": pid}


@api.patch("/admin/professions/{pid}/toggle")
async def admin_toggle_profession(pid: str, admin: dict = Depends(get_admin)):
    p = await db.professions.find_one({"id": pid})
    if not p:
        raise HTTPException(404, "Profissão não encontrada")
    new_status = "draft" if p.get("status") == "published" else "published"
    await db.professions.update_one({"id": pid}, {"$set": {"status": new_status}})
    await audit(admin["email"], "alternar_profissao", None, f"{pid}:{new_status}")
    return {"ok": True, "status": new_status}


# ---------------------------------------------------------------- health
@api.get("/")
async def root():
    return {"message": "KurrikuluPro Angola API", "status": "ok"}


app.include_router(api)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------- startup
@app.on_event("startup")
async def startup():
    await db.admins.create_index("email", unique=True)
    await db.drafts.create_index("token", unique=True)
    await db.orders.create_index("order_code", unique=True)
    await db.professions.create_index("id", unique=True)

    # seed admin
    email = os.environ["ADMIN_EMAIL"].strip().lower()
    pwd = os.environ["ADMIN_PASSWORD"]
    existing = await db.admins.find_one({"email": email})
    if not existing:
        await db.admins.insert_one({"email": email, "password_hash": hash_password(pwd),
                                    "name": "Administrador", "role": "admin", "created_at": now_iso()})
        logger.info("Admin seed criado.")
    elif not verify_password(pwd, existing["password_hash"]):
        await db.admins.update_one({"email": email}, {"$set": {"password_hash": hash_password(pwd)}})

    # seed professions
    if await db.professions.count_documents({}) == 0:
        await db.professions.insert_many(get_catalog())
        logger.info("Catálogo de profissões carregado.")

    await get_settings_doc()


@app.on_event("shutdown")
async def shutdown():
    client.close()
