import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import CVPreview from "../components/CVPreview";
import { api, errMsg } from "../lib/api";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, AlertTriangle } from "lucide-react";

const SECTIONS = [
  ["profile", "Perfil profissional"],
  ["experience", "Experiência"],
  ["education", "Formação"],
  ["skills", "Competências"],
  ["courses", "Cursos"],
  ["languages", "Idiomas"],
  ["projects", "Projectos"],
  ["references", "Referências"],
  ["availability", "Disponibilidade"],
];

function hasData(content, key) {
  switch (key) {
    case "profile": return !!(content.profile?.text || "").trim();
    case "experience": return (content.experiences || []).some((e) => (e.role || "").trim());
    case "education": return (content.education || []).some((e) => (e.course || e.level || "").trim());
    case "skills": return (content.skills || []).length > 0;
    case "courses": return (content.courses || []).some((c) => (c.name || "").trim());
    case "languages": return (content.languages || []).some((l) => (l.language || "").trim());
    case "projects": return (content.projects || []).some((p) => (p.name || "").trim());
    case "availability": { const d = content.availability || {}; return !!(d.type || d.note || d.zone); }
    case "references": {
      const r = content.references || {};
      if (r.mode === "on_request") return true;
      return r.mode === "list" && (r.items || []).some((x) => x && x.consent === true && (x.name || "").trim());
    }
    default: return false;
  }
}

export default function Review() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try { const { data } = await api.get(`/drafts/${token}`); setContent(data.content); }
      catch { toast.error("Rascunho não encontrado."); navigate("/criar"); }
      finally { setLoading(false); }
    })();
  }, [token, navigate]);

  const toggle = async (key) => {
    const vis = { ...(content.section_visibility || {}) };
    vis[key] = vis[key] === false ? true : false;
    const next = { ...content, section_visibility: vis };
    setContent(next);
    try { await api.put(`/drafts/${token}`, { content: next }); } catch { /* ignore */ }
  };

  const createOrder = async () => {
    const p = content.personal || {};
    if (!(p.first_name || "").trim() || !(p.phone || "").trim()) {
      toast.error("Preencha pelo menos o primeiro nome e o telefone antes de finalizar.");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post("/orders", { draft_token: token });
      localStorage.setItem(`kp_order_${data.order_code}`, data.access_token);
      localStorage.setItem("kp_last_order", data.order_code);
      navigate(`/pagamento/${data.order_code}`);
    } catch (e) {
      toast.error(errMsg(e));
      setSubmitting(false);
    }
  };

  const deleteCv = async () => {
    if (!window.confirm("Tem a certeza que quer apagar este currículo? Esta acção não pode ser anulada.")) return;
    try { await api.delete(`/drafts/${token}`); } catch { /* ignore */ }
    localStorage.removeItem("kp_draft_token");
    toast.success("Currículo apagado.");
    navigate("/");
  };

  if (loading || !content) return <Layout><div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-[#2563EB]" /></div></Layout>;

  return (
    <Layout full>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <button onClick={() => navigate(`/criar/${token}`)} className="text-sm text-slate-500 hover:text-[#1C2D42]">← Voltar ao editor</button>
        <h1 className="mt-2 font-head text-2xl sm:text-3xl font-extrabold text-[#1C2D42]">Rever e finalizar</h1>
        <p className="text-slate-600 mt-1">Escolha as secções a incluir. Secções sem informação não aparecem no PDF.</p>

        <div className="mt-6 grid lg:grid-cols-2 gap-6">
          <div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h2 className="font-head font-bold text-[#1C2D42]">Secções a incluir</h2>
              <div className="mt-4 space-y-2">
                {SECTIONS.map(([key, label]) => {
                  const present = hasData(content, key);
                  const visible = (content.section_visibility || {})[key] !== false;
                  return (
                    <div key={key} className={`flex items-center justify-between rounded-xl border px-4 py-3 ${present ? "border-slate-200" : "border-slate-100 bg-slate-50"}`}>
                      <div>
                        <span className={`font-medium ${present ? "text-slate-800" : "text-slate-400"}`}>{label}</span>
                        {!present && <span className="block text-xs text-slate-400">Sem informação — não será incluída</span>}
                      </div>
                      {present && (
                        <button data-testid={`toggle-${key}`} onClick={() => toggle(key)}
                          className={`flex items-center gap-1 text-sm font-semibold ${visible ? "text-[#059669]" : "text-slate-400"}`}>
                          {visible ? <><Eye className="w-4 h-4" /> Mostrar</> : <><EyeOff className="w-4 h-4" /> Oculto</>}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 bg-[#EFF6FF] rounded-2xl border border-[#2563EB]/30 p-5">
              <p className="text-sm text-slate-700">A pré-visualização mostra a marca de água <b>“PRÉ-VISUALIZAÇÃO — PAGAMENTO PENDENTE”</b>. O PDF final, sem marca de água, fica disponível depois da confirmação do pagamento (900 Kz).</p>
              <button data-testid="review-finalize" onClick={createOrder} disabled={submitting}
                className="mt-4 w-full px-6 py-3.5 rounded-full bg-[#1C2D42] text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />} Finalizar e pagar 900 Kz
              </button>
            </div>

            <button data-testid="review-delete" onClick={deleteCv}
              className="mt-4 flex items-center gap-2 text-sm text-red-500 hover:text-red-600">
              <AlertTriangle className="w-4 h-4" /> Apagar este currículo
            </button>
          </div>

          <div>
            <div className="cv-scale-wrap">
              <div className="cv-zoom">
                <CVPreview content={content} watermark />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
