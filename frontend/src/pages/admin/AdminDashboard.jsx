import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api, errMsg } from "../../lib/api";
import { toast } from "sonner";
import {
  Loader2, LogOut, RefreshCw, FileText, Check, X, Eye, ShieldCheck,
  ClipboardList, Settings as SettingsIcon, Briefcase,
} from "lucide-react";

const STATUS_LABELS = {
  rascunho: "Rascunho", aguarda_pagamento: "Aguarda pagamento", comprovativo_recebido: "Comprovativo recebido",
  em_verificacao: "Em verificação", aprovado: "Aprovado", rejeitado: "Rejeitado", cancelado: "Cancelado",
};
const STATUS_COLOR = {
  aguarda_pagamento: "bg-amber-100 text-amber-700", comprovativo_recebido: "bg-blue-100 text-blue-700",
  em_verificacao: "bg-blue-100 text-blue-700", aprovado: "bg-emerald-100 text-emerald-700",
  rejeitado: "bg-red-100 text-red-700", cancelado: "bg-slate-100 text-slate-500", rascunho: "bg-slate-100 text-slate-500",
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [tab, setTab] = useState("orders");
  const [stats, setStats] = useState({});
  const [orders, setOrders] = useState([]);
  const [filters, setFilters] = useState({ status: "", q: "" });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get("/auth/me").then((r) => setMe(r.data)).catch(() => navigate("/admin/login"));
  }, [navigate]);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/orders", { params: { status: filters.status, q: filters.q } });
      setOrders(data.orders);
      const s = await api.get("/admin/stats"); setStats(s.data);
    } catch (e) { toast.error(errMsg(e)); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { if (me) loadOrders(); }, [me, loadOrders]);

  const logout = async () => { await api.post("/auth/logout"); navigate("/admin/login"); };

  if (!me) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#2563EB]" /></div>;

  return (
    <div className="min-h-screen bg-[#F4F6FA]">
      <header className="bg-[#1C2D42] text-white">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            <span className="font-head font-bold">KurrikuluPro · Administração</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden sm:inline text-white/70">{me.email}</span>
            <button data-testid="admin-logout" onClick={logout} className="flex items-center gap-1 hover:text-white/80"><LogOut className="w-4 h-4" /> Sair</button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[["orders", "Pedidos", ClipboardList], ["audit", "Auditoria", ShieldCheck], ["professions", "Profissões", Briefcase], ["settings", "Definições", SettingsIcon]].map(([id, label, Icon]) => (
            <button key={id} data-testid={`admin-tab-${id}`} onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${tab === id ? "bg-[#1C2D42] text-white" : "bg-white border border-slate-200 text-slate-600"}`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {tab === "orders" && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
              {[["total", "Total"], ["aguarda_pagamento", "Aguardam"], ["comprovativo_recebido", "A verificar"], ["aprovado", "Aprovados"]].map(([k, l]) => (
                <div key={k} className="bg-white rounded-xl border border-slate-200 p-4">
                  <p className="text-2xl font-extrabold text-[#1C2D42]" data-testid={`stat-${k}`}>{stats[k] ?? 0}</p>
                  <p className="text-xs text-slate-500">{l}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 mt-5">
              <select data-testid="filter-status" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="rounded-xl border border-slate-300 px-3 py-2 bg-white text-sm">
                <option value="">Todos os estados</option>
                {Object.entries(STATUS_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
              <input data-testid="filter-q" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                placeholder="Nome, código ou telefone" className="rounded-xl border border-slate-300 px-3 py-2 text-sm flex-1 min-w-[160px]" />
              <button data-testid="refresh-orders" onClick={loadOrders} className="flex items-center gap-1 px-4 py-2 rounded-xl bg-[#2563EB] text-white text-sm font-semibold"><RefreshCw className="w-4 h-4" /> Actualizar</button>
            </div>

            <div className="mt-4 bg-white rounded-2xl border border-slate-200 overflow-hidden">
              {loading ? (
                <div className="py-16 flex justify-center"><Loader2 className="w-7 h-7 animate-spin text-[#2563EB]" /></div>
              ) : orders.length === 0 ? (
                <div className="py-16 text-center text-slate-400" data-testid="orders-empty">Sem pedidos para mostrar.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-500 text-left">
                      <tr>
                        <th className="px-4 py-3">Código</th><th className="px-4 py-3">Nome</th>
                        <th className="px-4 py-3 hidden sm:table-cell">Percurso</th><th className="px-4 py-3">Estado</th>
                        <th className="px-4 py-3 hidden sm:table-cell">Comprovativo</th><th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orders.map((o) => (
                        <tr key={o.id} data-testid={`order-row-${o.order_code}`} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-mono font-semibold text-[#1C2D42]">{o.order_code}</td>
                          <td className="px-4 py-3">{o.name || "—"}</td>
                          <td className="px-4 py-3 hidden sm:table-cell text-slate-500">{o.pathway}</td>
                          <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLOR[o.status]}`}>{STATUS_LABELS[o.status]}</span></td>
                          <td className="px-4 py-3 hidden sm:table-cell">{o.has_receipt ? <span className="text-emerald-600">Sim</span> : <span className="text-slate-400">Não</span>}</td>
                          <td className="px-4 py-3 text-right">
                            <button data-testid={`view-order-${o.order_code}`} onClick={() => setSelected(o.id)} className="text-[#2563EB] font-semibold flex items-center gap-1 ml-auto"><Eye className="w-4 h-4" /> Ver</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {tab === "audit" && <AuditTab />}
        {tab === "professions" && <ProfessionsTab />}
        {tab === "settings" && <SettingsTab />}
      </div>

      {selected && <OrderDrawer id={selected} onClose={() => setSelected(null)} onChanged={loadOrders} />}
    </div>
  );
}

function OrderDrawer({ id, onClose, onChanged }) {
  const [order, setOrder] = useState(null);
  const [receiptUrl, setReceiptUrl] = useState(null);
  const [receiptType, setReceiptType] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get(`/admin/orders/${id}`).then((r) => setOrder(r.data)).catch((e) => toast.error(errMsg(e)));
  }, [id]);

  const viewReceipt = async () => {
    try {
      const res = await api.get(`/admin/orders/${id}/receipt`, { responseType: "blob" });
      setReceiptType(res.data.type);
      setReceiptUrl(URL.createObjectURL(res.data));
    } catch (e) { toast.error("Não foi possível abrir o comprovativo."); }
  };

  const act = async (action) => {
    setBusy(true);
    try {
      if (action === "reject") {
        if (!reason.trim()) { toast.error("Indique o motivo da rejeição."); setBusy(false); return; }
        const fd = new FormData(); fd.append("reason", reason);
        await api.post(`/admin/orders/${id}/reject`, fd);
      } else {
        await api.post(`/admin/orders/${id}/${action}`);
      }
      toast.success("Pedido actualizado.");
      onChanged(); onClose();
    } catch (e) { toast.error(errMsg(e)); setBusy(false); }
  };

  const p = order?.content_snapshot?.personal || {};

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
      <div className="w-full max-w-md bg-white h-full overflow-y-auto p-6" onClick={(e) => e.stopPropagation()} data-testid="order-drawer">
        {!order ? <div className="flex justify-center py-20"><Loader2 className="w-7 h-7 animate-spin text-[#2563EB]" /></div> : (
          <>
            <div className="flex items-center justify-between">
              <h2 className="font-head font-extrabold text-[#1C2D42] text-xl">{order.order_code}</h2>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <span className={`inline-block mt-2 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLOR[order.status]}`}>{STATUS_LABELS[order.status]}</span>

            <div className="mt-5 space-y-1 text-sm">
              <p><b>Nome:</b> {`${p.first_name || ""} ${p.last_name || ""}`.trim() || "—"}</p>
              <p><b>Telefone:</b> {order.phone || "—"}</p>
              <p><b>Cidade:</b> {p.city || "—"}</p>
              <p><b>Percurso:</b> {order.pathway}</p>
              <p><b>Valor:</b> {order.amount} Kz</p>
            </div>

            <div className="mt-5">
              <h3 className="font-semibold text-slate-700 text-sm">Comprovativo</h3>
              {order.receipt ? (
                <>
                  <button data-testid="drawer-view-receipt" onClick={viewReceipt} className="mt-2 flex items-center gap-2 px-4 py-2 rounded-full bg-[#2563EB] text-white text-sm font-semibold"><Eye className="w-4 h-4" /> Ver comprovativo</button>
                  {receiptUrl && (receiptType === "application/pdf"
                    ? <iframe title="comprovativo" src={receiptUrl} className="mt-3 w-full h-72 rounded-xl border" />
                    : <img src={receiptUrl} alt="comprovativo" className="mt-3 w-full rounded-xl border" />)}
                </>
              ) : <p className="text-sm text-slate-400 mt-1">Ainda sem comprovativo.</p>}
            </div>

            {order.reject_reason && <p className="mt-4 text-sm text-red-600">Motivo de rejeição: {order.reject_reason}</p>}

            {order.status !== "aprovado" && (
              <div className="mt-6 border-t border-slate-200 pt-5 space-y-3">
                <button data-testid="drawer-approve" onClick={() => act("approve")} disabled={busy}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#059669] text-white font-semibold disabled:opacity-60"><Check className="w-4 h-4" /> Aprovar e libertar PDF</button>
                <input data-testid="drawer-reject-reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Motivo da rejeição"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" />
                <button data-testid="drawer-reject" onClick={() => act("reject")} disabled={busy}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-red-500 text-white font-semibold disabled:opacity-60"><X className="w-4 h-4" /> Rejeitar</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function AuditTab() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get("/admin/audit").then((r) => setEntries(r.data.entries)).finally(() => setLoading(false)); }, []);
  return (
    <div className="mt-5 bg-white rounded-2xl border border-slate-200 p-5">
      <h2 className="font-head font-bold text-[#1C2D42]">Registo de acções</h2>
      {loading ? <div className="py-10 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#2563EB]" /></div> : (
        <div className="mt-3 divide-y divide-slate-100 text-sm" data-testid="audit-list">
          {entries.length === 0 && <p className="text-slate-400 py-6 text-center">Sem registos.</p>}
          {entries.map((e, i) => (
            <div key={i} className="py-2.5 flex justify-between gap-3">
              <span><b className="text-[#1C2D42]">{e.action}</b> {e.order_code && <span className="font-mono text-slate-500">{e.order_code}</span>} {e.detail && <span className="text-slate-500">— {e.detail}</span>}</span>
              <span className="text-slate-400 whitespace-nowrap">{new Date(e.at).toLocaleString("pt-PT")}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProfessionsTab() {
  const [data, setData] = useState({ families: [], professions: [] });
  const [form, setForm] = useState({ name: "", family: "", pathway: "procurar_emprego" });
  const load = () => api.get("/admin/professions").then((r) => setData(r.data));
  useEffect(() => { load(); }, []);
  const add = async () => {
    if (!form.name.trim() || !form.family) { toast.error("Indique o nome e a família."); return; }
    try { await api.post("/admin/professions", { ...form, aliases: [], skill_groups: [] }); toast.success("Profissão adicionada."); setForm({ name: "", family: "", pathway: "procurar_emprego" }); load(); }
    catch (e) { toast.error(errMsg(e)); }
  };
  const toggle = async (id) => { await api.patch(`/admin/professions/${id}/toggle`); load(); };
  return (
    <div className="mt-5 space-y-5">
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h2 className="font-head font-bold text-[#1C2D42]">Adicionar profissão</h2>
        <div className="grid sm:grid-cols-3 gap-3 mt-3">
          <input data-testid="prof-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm" />
          <select data-testid="prof-family" value={form.family} onChange={(e) => setForm({ ...form, family: e.target.value })} className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm bg-white">
            <option value="">Família…</option>
            {data.families.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
          <button data-testid="prof-add" onClick={add} className="rounded-xl bg-[#2563EB] text-white font-semibold text-sm">Adicionar</button>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h2 className="font-head font-bold text-[#1C2D42]">Catálogo ({data.professions.length})</h2>
        <div className="mt-3 max-h-[480px] overflow-y-auto divide-y divide-slate-100 text-sm">
          {data.professions.map((p) => (
            <div key={p.id} className="py-2.5 flex items-center justify-between gap-2">
              <span className={p.status === "published" ? "text-slate-800" : "text-slate-400 line-through"}>{p.name}</span>
              <button data-testid={`prof-toggle-${p.id}`} onClick={() => toggle(p.id)} className={`text-xs font-semibold px-2.5 py-1 rounded-full ${p.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                {p.status === "published" ? "Activa" : "Inactiva"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingsTab() {
  const [s, setS] = useState(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => { api.get("/admin/settings").then((r) => setS(r.data)); }, []);
  const save = async () => {
    setSaving(true);
    try { await api.put("/admin/settings", { ...s, price_kz: Number(s.price_kz) }); toast.success("Definições guardadas."); }
    catch (e) { toast.error(errMsg(e)); }
    finally { setSaving(false); }
  };
  if (!s) return <div className="py-16 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#2563EB]" /></div>;
  const F = (label, key, ph) => (
    <label className="block"><span className="text-sm font-medium text-slate-700">{label}</span>
      <input data-testid={`setting-${key}`} value={s[key] ?? ""} onChange={(e) => setS({ ...s, [key]: e.target.value })} placeholder={ph}
        className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></label>
  );
  return (
    <div className="mt-5 bg-white rounded-2xl border border-slate-200 p-5 max-w-lg">
      <h2 className="font-head font-bold text-[#1C2D42]">Definições de pagamento</h2>
      <p className="text-sm text-slate-500 mt-1">Estes dados só ficam visíveis para os candidatos quando marcar <b>“Publicar”</b>. Mantenha-os ocultos até confirmar que estão correctos.</p>
      <div className="mt-4 space-y-3">
        {F("Preço (Kz)", "price_kz")}
        {F("Multicaixa Express", "multicaixa_number")}
        {F("Entidade (referência)", "reference_entity")}
        {F("Referência", "reference_number")}
        {F("IBAN", "iban")}
        {F("Banco", "bank_name")}
        {F("WhatsApp de suporte", "support_whatsapp")}
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 bg-slate-50 rounded-xl px-4 py-3">
          <input type="checkbox" data-testid="setting-published" checked={!!s.published} onChange={(e) => setS({ ...s, published: e.target.checked })} />
          Publicar dados de pagamento para os candidatos
        </label>
        <button data-testid="setting-save" onClick={save} disabled={saving} className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#1C2D42] text-white font-semibold disabled:opacity-60">
          {saving && <Loader2 className="w-4 h-4 animate-spin" />} Guardar
        </button>
      </div>
    </div>
  );
}
