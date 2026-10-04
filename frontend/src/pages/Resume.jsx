import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Layout from "../components/Layout";
import { api, errMsg } from "../lib/api";
import { toast } from "sonner";
import { Loader2, Smartphone } from "lucide-react";

export default function Resume() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const { data } = await api.post("/drafts/resume", { code: code.trim(), pin });
      localStorage.setItem("kp_draft_token", data.token);
      toast.success("Rascunho recuperado.");
      navigate(`/criar/${data.token}`);
    } catch (err) { setError(errMsg(err)); }
    finally { setBusy(false); }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto py-10">
        <div className="flex items-center gap-2"><Smartphone className="w-6 h-6 text-[#2563EB]" /><h1 className="font-head text-2xl font-extrabold text-[#1C2D42]">Retomar rascunho</h1></div>
        <p className="text-slate-600 mt-2">Introduza o código gerado no editor (“Continuar noutro telemóvel”) e o PIN de 4 dígitos que escolheu. Sem conta, sem login.</p>
        <form onSubmit={submit} className="mt-6 bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <label className="block"><span className="text-sm font-medium text-slate-700">Código</span>
            <input data-testid="resume-code-input" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="KP-XXXXXX" autoComplete="off"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-mono focus:ring-2 focus:ring-[#2563EB] outline-none" /></label>
          <label className="block"><span className="text-sm font-medium text-slate-700">PIN</span>
            <input data-testid="resume-pin" type="password" inputMode="numeric" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} placeholder="••••"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-mono tracking-widest focus:ring-2 focus:ring-[#2563EB] outline-none" /></label>
          {error && <p className="text-sm text-red-600" data-testid="resume-error">{error}</p>}
          <button type="submit" data-testid="resume-submit" disabled={busy || !code.trim() || pin.length !== 4}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#1C2D42] text-white font-semibold disabled:opacity-50">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />} Abrir o meu rascunho
          </button>
        </form>
        <p className="text-xs text-slate-500 mt-4">Após 5 tentativas falhadas o código fica bloqueado durante 15 minutos. Os códigos expiram ao fim de 30 dias.</p>
        <Link to="/criar" className="inline-block mt-4 text-sm text-[#2563EB] font-semibold">Não tenho código — começar novo currículo</Link>
      </div>
    </Layout>
  );
}
