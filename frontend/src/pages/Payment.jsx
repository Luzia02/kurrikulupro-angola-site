import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Layout from "../components/Layout";
import { api, errMsg } from "../lib/api";
import { toast } from "sonner";
import { Loader2, Upload, Copy, CheckCircle2, MessageCircle } from "lucide-react";

export default function Payment() {
  const { code } = useParams();
  const navigate = useNavigate();
  const accessToken = localStorage.getItem(`kp_order_${code}`);
  const [order, setOrder] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const load = async () => {
    try {
      const [o, s] = await Promise.all([
        api.get(`/orders/${code}`, { params: { access_token: accessToken } }),
        api.get("/settings/public"),
      ]);
      setOrder(o.data); setSettings(s.data);
    } catch (e) { toast.error(errMsg(e)); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (!accessToken) { setLoading(false); return; }
    load();
    // eslint-disable-next-line
  }, [code]);

  const upload = async (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Ficheiro demasiado grande (máx. 5 MB)."); return; }
    setUploading(true);
    const fd = new FormData();
    fd.append("access_token", accessToken);
    fd.append("file", file);
    try {
      await api.post(`/orders/${code}/receipt`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Comprovativo enviado. Vamos verificar o pagamento.");
      await load();
    } catch (e) { toast.error(errMsg(e)); }
    finally { setUploading(false); }
  };

  const copy = (txt) => { navigator.clipboard.writeText(txt); toast.success("Copiado."); };

  if (loading) return <Layout><div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-[#2563EB]" /></div></Layout>;

  if (!accessToken || !order) {
    return (
      <Layout>
        <div className="max-w-md mx-auto text-center py-20">
          <h1 className="font-head text-2xl font-bold text-[#1C2D42]">Pedido não encontrado</h1>
          <p className="text-slate-600 mt-2">Não encontrámos o acesso a este pedido neste dispositivo.</p>
          <Link to="/" className="inline-block mt-6 px-5 py-3 rounded-full bg-[#1C2D42] text-white font-semibold">Início</Link>
        </div>
      </Layout>
    );
  }

  const published = settings?.published;
  const price = settings?.price_kz || order.amount || 900;

  return (
    <Layout>
      <div className="max-w-xl mx-auto">
        <h1 className="font-head text-2xl sm:text-3xl font-extrabold text-[#1C2D42]">Pagamento</h1>
        <p className="text-slate-600 mt-1">Pagamento único de <b>{price} Kz</b>. Após enviar o comprovativo, a nossa equipa confirma e liberta o PDF sem marca de água.</p>

        <div className="mt-6 bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Código do pedido</span>
            <button onClick={() => copy(order.order_code)} className="flex items-center gap-1 font-mono font-bold text-[#1C2D42]" data-testid="order-code">
              {order.order_code} <Copy className="w-4 h-4 text-slate-400" />
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-1">Guarde este código para acompanhar o estado.</p>
        </div>

        {/* instruções de pagamento */}
        <div className="mt-5 bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-head font-bold text-[#1C2D42]">Como pagar</h2>
          {published ? (
            <div className="mt-3 space-y-2 text-sm">
              {settings.multicaixa_number && <Row label="Multicaixa Express" value={settings.multicaixa_number} onCopy={copy} />}
              {settings.reference_entity && <Row label="Entidade (referência)" value={settings.reference_entity} onCopy={copy} />}
              {settings.reference_number && <Row label="Referência" value={settings.reference_number} onCopy={copy} />}
              {settings.iban && <Row label="IBAN" value={settings.iban} onCopy={copy} />}
              {settings.bank_name && <Row label="Banco" value={settings.bank_name} onCopy={copy} />}
            </div>
          ) : (
            <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800" data-testid="payment-unpublished">
              Os dados de pagamento estão <b>a confirmar</b> e serão apresentados aqui assim que o proprietário os validar. Para já, pode falar com o suporte para concluir o pagamento.
            </div>
          )}
          {settings?.support_whatsapp && (
            <a data-testid="support-whatsapp" href={`https://wa.me/${settings.support_whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-[#059669] font-semibold text-sm">
              <MessageCircle className="w-4 h-4" /> Suporte via WhatsApp: {settings.support_whatsapp}
            </a>
          )}
        </div>

        {/* upload comprovativo */}
        <div className="mt-5 bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-head font-bold text-[#1C2D42]">Enviar comprovativo</h2>
          {order.has_receipt ? (
            <div className="mt-3 flex items-center gap-2 text-[#059669]" data-testid="receipt-sent">
              <CheckCircle2 className="w-5 h-5" /> Comprovativo recebido. Estado: <b>em verificação</b>.
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-600 mt-1">Envie uma foto ou PDF do comprovativo (máx. 5 MB). O envio não confirma o pagamento — a aprovação é feita pela nossa equipa.</p>
              <input ref={fileRef} type="file" accept="image/*,application/pdf" data-testid="upload-receipt-input" className="hidden"
                onChange={(e) => upload(e.target.files[0])} />
              <button data-testid="upload-receipt-btn" onClick={() => fileRef.current?.click()} disabled={uploading}
                className="mt-3 flex items-center gap-2 px-5 py-3 rounded-full bg-[#2563EB] text-white font-semibold disabled:opacity-60">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Escolher ficheiro
              </button>
            </>
          )}
        </div>

        <button data-testid="go-status" onClick={() => navigate(`/pedido/${code}`)}
          className="mt-6 w-full px-6 py-3 rounded-full border border-slate-300 text-[#1C2D42] font-semibold">Acompanhar o meu pedido</button>
      </div>
    </Layout>
  );
}

function Row({ label, value, onCopy }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5">
      <span className="text-slate-500">{label}</span>
      <button onClick={() => onCopy(value)} className="flex items-center gap-1 font-semibold text-[#1C2D42]">{value} <Copy className="w-3.5 h-3.5 text-slate-400" /></button>
    </div>
  );
}
