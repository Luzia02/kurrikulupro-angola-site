import React, { useState } from "react";
import Layout from "../components/Layout";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { PATHWAYS, defaultContent } from "../lib/pathways";
import { api, errMsg } from "../lib/api";
import { toast } from "sonner";

export default function Choose() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const preset = params.get("percurso");
  const [loading, setLoading] = useState(false);

  async function start(pathwayId) {
    if (pathwayId === "nao_sei_escolher") {
      navigate("/orientar");
      return;
    }
    setLoading(true);
    try {
      const content = defaultContent(pathwayId);
      const { data } = await api.post("/drafts", { content });
      localStorage.setItem("kp_draft_token", data.token);
      navigate(`/criar/${data.token}`);
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setLoading(false);
    }
  }

  // auto-start if preset passed
  React.useEffect(() => {
    if (preset && PATHWAYS.some((p) => p.id === preset)) {
      start(preset);
    }
    // eslint-disable-next-line
  }, [preset]);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="text-sm text-slate-500 hover:text-[#1C2D42]">← Início</Link>
        <h1 className="mt-3 font-head text-3xl font-extrabold text-[#1C2D42]">Escolha o seu caminho</h1>
        <p className="text-slate-600 mt-2">Cada caminho tem perguntas próprias. Pode começar sem criar conta.</p>

        <div className="grid sm:grid-cols-2 gap-4 mt-8">
          {PATHWAYS.map((p) => {
            const Icon = p.icon;
            return (
              <button key={p.id} data-testid={`choose-pathway-${p.id}`} disabled={loading}
                onClick={() => start(p.id)}
                className="text-left bg-white rounded-2xl border border-slate-200 p-6 hover:border-[#2563EB] hover:shadow-lg transition-all disabled:opacity-60">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] flex items-center justify-center">
                    <Icon className="w-6 h-6 text-[#2563EB]" />
                  </div>
                  <span className="text-xs font-semibold text-[#D97706]">{p.badge}</span>
                </div>
                <h3 className="mt-4 font-head font-bold text-[#1C2D42] text-lg">{p.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{p.desc}</p>
              </button>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
