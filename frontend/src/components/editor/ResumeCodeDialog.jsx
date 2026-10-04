import React, { useState, useEffect } from "react";
import { api, errMsg } from "../../lib/api";
import { toast } from "sonner";
import { Smartphone, X, Copy, Loader2, Trash2 } from "lucide-react";

export function ResumeCodeDialog({ token, onClose }) {
  const [pin, setPin] = useState("");
  const [existing, setExisting] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { api.get(`/drafts/${token}/resume-code`).then((r) => setExisting(r.data.code ? r.data : null)).catch(() => {}); }, [token]);

  const create = async () => {
    if (!/^\d{4}$/.test(pin)) { toast.error("O PIN deve ter 4 dígitos."); return; }
    setBusy(true);
    try { const { data } = await api.post(`/drafts/${token}/resume-code`, { pin }); setExisting(data); setPin(""); toast.success("Código criado."); }
    catch (e) { toast.error(errMsg(e)); }
    finally { setBusy(false); }
  };
  const revoke = async () => {
    setBusy(true);
    try { await api.delete(`/drafts/${token}/resume-code`); setExisting(null); toast.success("Código desactivado."); }
    catch (e) { toast.error(errMsg(e)); }
    finally { setBusy(false); }
  };
  const copy = () => { navigator.clipboard.writeText(existing.code); toast.success("Código copiado."); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-2xl p-6" onClick={(e) => e.stopPropagation()} data-testid="resume-code-dialog">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2"><Smartphone className="w-5 h-5 text-[#2563EB]" /><h2 className="font-head font-bold text-[#1C2D42] text-lg">Continuar noutro telemóvel</h2></div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600" data-testid="resume-code-close"><X className="w-5 h-5" /></button>
        </div>
        <p className="text-sm text-slate-600 mt-2">O rascunho fica guardado <b>temporariamente no servidor (30 dias)</b>. Noutro telemóvel, abra “Retomar rascunho” e introduza o código e o PIN. Não é preciso criar conta.</p>

        {existing ? (
          <div className="mt-4 space-y-3">
            <div className="rounded-xl bg-[#EFF6FF] border border-[#2563EB]/30 p-4 text-center">
              <p className="text-xs text-slate-500">O seu código</p>
              <button onClick={copy} className="mt-1 font-mono text-2xl font-extrabold text-[#1C2D42] flex items-center gap-2 mx-auto" data-testid="resume-code-value">{existing.code} <Copy className="w-4 h-4 text-slate-400" /></button>
              <p className="text-xs text-slate-500 mt-1">Válido até {new Date(existing.expires_at).toLocaleDateString("pt-PT")}. O PIN não é mostrado — guarde-o.</p>
            </div>
            <button data-testid="resume-code-revoke" onClick={revoke} disabled={busy} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-red-200 text-red-600 text-sm font-semibold disabled:opacity-60"><Trash2 className="w-4 h-4" /> Desactivar este código</button>
            <p className="text-xs text-slate-500">Para apagar o rascunho do servidor, use “Apagar este currículo” na página Rever.</p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <label className="block"><span className="text-sm font-medium text-slate-700">Escolha um PIN de 4 dígitos</span>
              <input data-testid="resume-pin-input" inputMode="numeric" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                placeholder="••••" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-mono text-lg tracking-widest focus:ring-2 focus:ring-[#2563EB] outline-none" /></label>
            <button data-testid="resume-code-create" onClick={create} disabled={busy || pin.length !== 4} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-[#1C2D42] text-white font-semibold disabled:opacity-50">
              {busy && <Loader2 className="w-4 h-4 animate-spin" />} Gerar código
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
