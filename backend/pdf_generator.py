"""Gerador de PDF A4 (Proposta 02) com WeasyPrint.

Texto seleccionável, fontes incorporadas. O HTML aqui replica o estilo da
pré-visualização do site. O PDF só é gerado para pedidos aprovados (limpo).
"""
import re
import html as _html
from weasyprint import HTML

NAVY = "#1C2D42"
BLUE = "#2563EB"
RULE = "#CBD5E1"
BODY = "#334155"
META = "#64748B"
PILL_BG = "#F1F5F9"
PILL_BORDER = "#CBD5E1"
GOLD = "#D97706"

EDU_STATUS = {
    "a_frequentar": "Em curso",
    "concluido": "Concluída",
    "interrompido": "Interrompida",
}


def esc(v):
    return _html.escape(str(v)) if v is not None else ""


def _tem(v):
    return bool(v and str(v).strip())


def safe_filename(content: dict, order_code: str) -> str:
    personal = content.get("personal") or {}
    nome = f"{personal.get('first_name','')} {personal.get('last_name','')}".strip()
    nome = re.sub(r"[^A-Za-zÀ-ÿ0-9 ]", "", nome).strip().replace(" ", "_")
    if not nome:
        nome = "Curriculo"
    return f"Curriculo_{nome}_{order_code}.pdf"


def _periodo(item):
    ini = item.get("start") or ""
    if item.get("current"):
        fim = "Actual"
    else:
        fim = item.get("end") or ""
    if ini and fim:
        return f"{esc(ini)} — {esc(fim)}"
    return esc(ini or fim)


def _section(title, inner):
    if not inner:
        return ""
    return f"""
    <div class="section">
      <div class="sec-title">{esc(title)}</div>
      {inner}
    </div>"""


def build_html(content: dict) -> str:
    personal = content.get("personal") or {}
    vis = content.get("section_visibility") or {}

    def shown(key):
        return vis.get(key, True)

    nome = f"{personal.get('first_name','')} {personal.get('last_name','')}".strip() or "O SEU NOME"
    titulo = ""
    target = content.get("target_profession") or {}
    if _tem(target.get("name")):
        titulo = target["name"]

    # contactos
    contactos = []
    if _tem(personal.get("city")):
        contactos.append(esc(personal["city"]))
    if _tem(personal.get("phone")):
        contactos.append(esc(personal["phone"]))
    if _tem(personal.get("email")):
        contactos.append(esc(personal["email"]))
    contacto_line = "&nbsp;&nbsp;|&nbsp;&nbsp;".join(contactos)

    body = ""

    # Perfil
    profile = (content.get("profile") or {}).get("text", "")
    if shown("profile") and _tem(profile):
        body += _section("Perfil Profissional", f'<p class="para">{esc(profile)}</p>')

    # Experiência
    exps = [e for e in (content.get("experiences") or []) if _tem(e.get("role"))]
    if shown("experience") and exps:
        inner = ""
        for e in exps:
            local = " · ".join([x for x in [esc(e.get("entity")), esc(e.get("location"))] if x])
            tarefas = "".join(f"<li>{esc(t)}</li>" for t in (e.get("tasks") or []) if _tem(t))
            resultados = ""
            if _tem(e.get("results")):
                resultados = f'<li>{esc(e.get("results"))}</li>'
            lista = f"<ul>{tarefas}{resultados}</ul>" if (tarefas or resultados) else ""
            inner += f"""
            <div class="item">
              <div class="item-head">
                <span class="item-role">{esc(e.get('role'))}</span>
                <span class="item-period">{_periodo(e)}</span>
              </div>
              {f'<div class="item-sub">{local}</div>' if local else ''}
              {lista}
            </div>"""
        body += _section("Experiência Profissional", inner)

    # Formação
    edus = [e for e in (content.get("education") or []) if _tem(e.get("course")) or _tem(e.get("level"))]
    if shown("education") and edus:
        inner = ""
        for e in edus:
            titulo_edu = " · ".join([x for x in [esc(e.get("course")), EDU_STATUS.get(e.get("status"), "")] if x])
            sub = " · ".join([x for x in [esc(e.get("level")), esc(e.get("institution"))] if x])
            inner += f"""
            <div class="item">
              <div class="item-head">
                <span class="item-role">{titulo_edu}</span>
                <span class="item-period">{_periodo(e)}</span>
              </div>
              {f'<div class="item-sub">{sub}</div>' if sub else ''}
            </div>"""
        body += _section("Formação", inner)

    # Competências
    skills = [s for s in (content.get("skills") or []) if _tem(s)]
    if shown("skills") and skills:
        pills = "".join(f'<span class="pill">{esc(s)}</span>' for s in skills)
        body += _section("Competências Confirmadas", f'<div class="pills">{pills}</div>')

    # Cursos
    cursos = [c for c in (content.get("courses") or []) if _tem(c.get("name"))]
    if shown("courses") and cursos:
        inner = ""
        for c in cursos:
            sub = " · ".join([x for x in [esc(c.get("entity")), esc(c.get("date"))] if x])
            inner += f"""
            <div class="item">
              <div class="item-role">{esc(c.get('name'))}</div>
              {f'<div class="item-sub">{sub}</div>' if sub else ''}
            </div>"""
        body += _section("Formação Complementar", inner)

    # Idiomas
    idiomas = [l for l in (content.get("languages") or []) if _tem(l.get("language"))]
    if shown("languages") and idiomas:
        inner = '<div class="langs">'
        for l in idiomas:
            inner += f'<div class="lang"><b>{esc(l.get("language"))}</b> <span class="meta">{esc(l.get("level"))}</span></div>'
        inner += "</div>"
        body += _section("Idiomas", inner)

    # Projectos
    projs = [p for p in (content.get("projects") or []) if _tem(p.get("name"))]
    if shown("projects") and projs:
        inner = ""
        for p in projs:
            inner += f"""
            <div class="item">
              <div class="item-role">{esc(p.get('name'))}</div>
              {f'<div class="item-sub">{esc(p.get("description"))}</div>' if _tem(p.get('description')) else ''}
            </div>"""
        body += _section("Projectos", inner)

    # Disponibilidade
    disp = content.get("availability") or {}
    if shown("availability") and (_tem(disp.get("type")) or _tem(disp.get("note")) or _tem(disp.get("zone"))):
        partes = " · ".join([x for x in [esc(disp.get("type")), esc(disp.get("zone")), esc(disp.get("note"))] if x])
        body += _section("Disponibilidade", f'<p class="para">{partes}</p>')

    html_doc = f"""<!DOCTYPE html>
<html lang="pt"><head><meta charset="utf-8"><style>
@page {{ size: A4; margin: 16mm 15mm; }}
* {{ box-sizing: border-box; }}
body {{ font-family: Arial, Helvetica, sans-serif; color: {BODY}; font-size: 10.5pt; line-height: 1.45; margin: 0; }}
.top-bar {{ height: 5px; background: {NAVY}; margin-bottom: 14px; }}
.name {{ font-size: 22pt; font-weight: 800; color: {NAVY}; letter-spacing: .5px; text-transform: uppercase; margin: 0; }}
.title {{ font-size: 12pt; font-weight: 700; color: {BLUE}; margin: 4px 0 0; }}
.contacts {{ color: {META}; font-size: 9.5pt; margin-top: 8px; padding-bottom: 10px; border-bottom: 2px solid {NAVY}; }}
.section {{ margin-top: 16px; }}
.sec-title {{ font-size: 11pt; font-weight: 800; color: {NAVY}; text-transform: uppercase; letter-spacing: .6px; border-bottom: 1px solid {RULE}; padding-bottom: 4px; margin-bottom: 8px; }}
.para {{ margin: 0; text-align: justify; }}
.item {{ margin-bottom: 10px; }}
.item-head {{ display: flex; justify-content: space-between; align-items: baseline; }}
.item-role {{ font-weight: 700; color: {NAVY}; font-size: 10.5pt; }}
.item-period {{ color: {META}; font-size: 9pt; white-space: nowrap; padding-left: 10px; }}
.item-sub {{ color: {META}; font-size: 9.5pt; margin-top: 1px; }}
ul {{ margin: 5px 0 0; padding-left: 16px; }}
li {{ margin-bottom: 2px; }}
.pills {{ }}
.pill {{ display: inline-block; background: {PILL_BG}; border: 1px solid {PILL_BORDER}; color: {NAVY}; border-radius: 999px; padding: 3px 11px; font-size: 9pt; font-weight: 600; margin: 0 6px 6px 0; }}
.langs {{ }}
.lang {{ display: inline-block; margin-right: 26px; }}
.meta {{ color: {META}; }}
</style></head>
<body>
  <div class="top-bar"></div>
  <div class="name">{esc(nome)}</div>
  {f'<div class="title">{esc(titulo)}</div>' if titulo else ''}
  <div class="contacts">{contacto_line}</div>
  {body}
</body></html>"""
    return html_doc


def generate_pdf_bytes(content: dict) -> bytes:
    return HTML(string=build_html(content)).write_pdf()
