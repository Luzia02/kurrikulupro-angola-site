import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { api, errMsg } from "../lib/api";
import { toast } from "sonner";
import { Loader2, Download, Clock, CheckCircle2, XCircle, FileSearch } from "lucide-react";

const STATUS_INFO = {
  aguarda_pagamento: { label: "Aguarda pagamento", color: "text-amber-600", bg: "bg-amber-50 border-amber-200", icon: Clock },
  comprovativo_recebido: { label: "Comprovativo recebido", color: "text-blue-600", bg: "bg-blue-50 border-blue-200", icon: FileSearch },
  em_verificacao: { label: "Em verificação", color: "text-blue-600", bg: "bg-blue-50 border-blue-200", icon: FileSearch },
  aprovado: { label: "Aprovado", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", icon: CheckCircle2 },
  rejeitado: { label: "Rejeitado", color: "text-red-600", bg: "bg-red-50 border-red-200", icon: XCircle },
  cancelado: { label: "Cancelado", color: "text-slate-500", bg: "bg-slate-50 border-slate-200", icon: XCircle },
};

export default function OrderStatus() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [input, setInput] = useState(localStorage.getItem("kp_last_order") || "");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(!!code);
  const [downloading, setDownloading] = useState(false);

  const load = async (c) => {
    const token = localStorage.getItem(`kp_order_${c}`);
    if (!token) { toast.error("Não encontrámos o acesso a este pedido neste dispositivo."); setLoading(false); return; }
    setLoading(true);
    try { const { data } = await api.get(`/orders/${c}`, { params: { access_token: token } }); setOrder(data); }
    catch (e) { toast.error(errMsg(e)); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (code) load(code); /* eslint-disable-next-line */ }, [code]);

  const download = async () => {
    const token = localStorage.getItem(`kp_order_${code}`);
    setDownloading(true);
    try {
      const res = await api.get(`/orders/${code}/pdf`, { params: { access_token: token }, responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url; a.download = `Curriculo_${code}.pdf`; a.click();
      URL.revokeObjectURL(url);
    } catch (e) { toast.error("Ainda não disponível. O PDF é libertado após a aprovação."); }
    finally { setDownloading(false); }
  };

  if (!code) {
    return (
      <Layout>
        <div className="max-w-md mx-auto py-10">
          <h1 className="font-head text-2xl font-extrabold text-[#1C2D42]">Acompanhar pedido</h1>
          <p className="text-slate-600 mt-1">Introduza o código do pedido (ex.: KP-ABC123).</p>
          <div className="mt-5 flex gap-2">
            <input data-testid="status-code-input" value={input} onChange={(e) => setInput(e.target.value.toUpperCase())}
              placeholder="KP-XXXXXX" className="flex-1 rounded-xl border border-slate-300 px-3 py-2.5 font-mono focus:ring-2 focus:ring-[#2563EB] outline-none" />
            <button data-testid="status-lookup" onClick={() => input && navigate(`/pedido/${input.trim()}`)}
              className="px-5 rounded-xl bg-[#1C2D42] text-white font-semibold">Ver</button>
          </div>
        </div>
      </Layout>
    );
  }

  if (loading) return <Layout><div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-[#2563EB]" /></div></Layout>;

  if (!order) {
    return <Layout><div className="max-w-md mx-auto text-center py-20"><h1 className="font-head text-2xl font-bold text-[#1C2D42]">Pedido não encontrado</h1><button onClick={() => navigate("/pedido")} className="mt-5 px-5 py-3 rounded-full bg-[#1C2D42] text-white font-semibold">Tentar outro código</button></div></Layout>;
  }

  const info = STATUS_INFO[order.status] || STATUS_INFO.aguarda_pagamento;
  const Icon = info.icon;

  return (
    <Layout>
      <div className="max-w-xl mx-auto py-6">
        <h1 className="font-head text-2xl sm:text-3xl font-extrabold text-[#1C2D42]">O meu pedido</h1>
        <p className="font-mono text-slate-500 mt-1" data-testid="status-order-code">{order.order_code}</p>

        <div className={`mt-5 rounded-2xl border p-5 flex items-center gap-3 ${info.bg}`} data-testid="status-badge">
          <Icon className={`w-7 h-7 ${info.color}`} />
          <div>
            <p className={`font-head font-bold ${info.color}`}>{info.label}</p>
            {order.status === "rejeitado" && order.reject_reason && <p className="text-sm text-red-600 mt-0.5">Motivo: {order.reject_reason}</p>}
          </div>
        </div>

        {order.status === "aprovado" ? (
          <div className="mt-5 bg-white rounded-2xl border border-slate-200 p-5">
            <p className="text-slate-700">O seu pagamento foi confirmado. Pode descarregar o currículo final sem marca de água.</p>
            <button data-testid="download-pdf-btn" onClick={download} disabled={downloading}
              className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#059669] text-white font-semibold disabled:opacity-60">
              {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Descarregar PDF
            </button>
            <button onClick={() => window.print()} className="mt-3 w-full px-6 py-3 rounded-full border border-slate-300 text-[#1C2D42] font-semibold" data-testid="print-btn">Imprimir / partilhar</button>
          </div>
        ) : (
          <div className="mt-5 bg-white rounded-2xl border border-slate-200 p-5 text-sm text-slate-600">
            <p>O currículo final fica disponível para descarregar <b>apenas após a aprovação</b> do pagamento. Nenhum clique ou envio de comprovativo liberta o PDF automaticamente.</p>
            {order.status === "aguarda_pagamento" && (
              <button data-testid="status-to-payment" onClick={() => navigate(`/pagamento/${code}`)} className="mt-4 px-5 py-2.5 rounded-full bg-[#2563EB] text-white font-semibold">Ir para pagamento</button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
