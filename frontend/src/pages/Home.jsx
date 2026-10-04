import React, { useState } from "react";
import Layout from "../components/Layout";
import { Link, useNavigate } from "react-router-dom";
import { PATHWAYS } from "../lib/pathways";
import { ShieldCheck, FileCheck2, Clock, ChevronDown } from "lucide-react";

const FAQ = [
  { q: "Preciso de criar conta?", a: "Não. Pode criar e rever o currículo sem conta. O rascunho fica guardado no seu dispositivo." },
  { q: "Tenho de escolher uma profissão?", a: "Não é obrigatório. Pode fazer um currículo geral para enviar a empresas e, se quiser, adaptá-lo a uma vaga específica." },
  { q: "Quanto custa?", a: "O currículo final custa 900 Kz, pagamento único. A pré-visualização é gratuita; o PDF sem marca de água é libertado após a confirmação do pagamento." },
  { q: "Como pago?", a: "Por enquanto o pagamento é confirmado manualmente: envia o comprovativo e a nossa equipa aprova o pedido. Os dados de pagamento são confirmados pelo proprietário antes de ficarem públicos." },
  { q: "Os meus dados estão seguros?", a: "Guardamos apenas o necessário para criar e entregar o currículo. Os comprovativos ficam em armazenamento privado." },
];

function Faq() {
  const [open, setOpen] = useState(null);
  return (
    <div className="divide-y divide-slate-200 border border-slate-200 rounded-2xl bg-white overflow-hidden">
      {FAQ.map((f, i) => (
        <div key={i}>
          <button data-testid={`faq-q-${i}`} onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-slate-50">
            <span className="font-medium text-slate-800">{f.q}</span>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${open === i ? "rotate-180" : ""}`} />
          </button>
          {open === i && <div className="px-5 pb-4 text-slate-600 text-[15px]" data-testid={`faq-a-${i}`}>{f.a}</div>}
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const resume = typeof window !== "undefined" ? localStorage.getItem("kp_draft_token") : null;

  return (
    <Layout full>
      {/* Hero */}
      <section className="bg-gradient-to-b from-white to-[#F4F6FA] border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-14 sm:py-20 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] text-sm font-semibold">Feito para Angola</span>
            <h1 className="mt-4 font-head text-4xl sm:text-5xl font-extrabold text-[#1C2D42] leading-tight">
              Um currículo profissional, <span className="text-[#2563EB]">verdadeiro</span> e pronto a enviar.
            </h1>
            <p className="mt-4 text-lg text-slate-600 max-w-xl">
              Sem obrigar a escolher uma vaga. Você informa o que é verdade, confirma as competências e nós organizamos tudo num currículo claro.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/criar" data-testid="hero-start-btn" className="px-6 py-3.5 rounded-full bg-[#1C2D42] text-white font-semibold hover:bg-[#0B132B] transition-colors shadow-lg shadow-[#1C2D42]/20">
                Criar o meu currículo
              </Link>
              {resume && (
                <button data-testid="hero-resume-btn" onClick={() => navigate(`/criar/${resume}`)}
                  className="px-6 py-3.5 rounded-full bg-white border border-slate-300 text-[#1C2D42] font-semibold hover:bg-slate-50">
                  Continuar o meu rascunho
                </button>
              )}
            </div>
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-slate-600">
              <span className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-[#059669]" /> Sem dados inventados</span>
              <span className="flex items-center gap-2"><FileCheck2 className="w-5 h-5 text-[#059669]" /> PDF A4 pesquisável</span>
              <span className="flex items-center gap-2"><Clock className="w-5 h-5 text-[#059669]" /> Rápido no telemóvel</span>
            </div>
          </div>
          <div className="relative">
            <img src="https://images.unsplash.com/photo-1657449036184-4fb912035102?crop=entropy&cs=srgb&fm=jpg&q=80&w=900"
              alt="Profissional angolana" className="rounded-3xl shadow-2xl object-cover w-full h-[420px]" loading="lazy" />
          </div>
        </div>
      </section>

      {/* Pathways */}
      <section className="max-w-6xl mx-auto px-4 py-14">
        <h2 className="font-head text-2xl sm:text-3xl font-bold text-[#1C2D42]">Por onde quer começar?</h2>
        <p className="text-slate-600 mt-2">Escolha o caminho que melhor descreve a sua situação. Pode mudar depois.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {PATHWAYS.map((p) => {
            const Icon = p.icon;
            return (
              <Link key={p.id} to={`/criar?percurso=${p.id}`} data-testid={`home-pathway-${p.id}`}
                className="group bg-white rounded-2xl border border-slate-200 p-6 hover:border-[#2563EB] hover:shadow-lg transition-all">
                <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] flex items-center justify-center group-hover:bg-[#2563EB] transition-colors">
                  <Icon className="w-6 h-6 text-[#2563EB] group-hover:text-white transition-colors" />
                </div>
                <span className="inline-block mt-4 text-xs font-semibold text-[#D97706]">{p.badge}</span>
                <h3 className="mt-1 font-head font-bold text-[#1C2D42] text-lg">{p.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{p.desc}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-14">
          <h2 className="font-head text-2xl sm:text-3xl font-bold text-[#1C2D42]">Como funciona</h2>
          <div className="grid sm:grid-cols-4 gap-6 mt-8">
            {[
              ["1", "Escolhe o caminho", "Seis opções simples, incluindo “não sei qual escolher”."],
              ["2", "Preenche o que é verdade", "Formulários claros, com pré-visualização ao lado."],
              ["3", "Revê e confirma", "Decide que secções mostrar antes de exportar."],
              ["4", "Paga e descarrega", "Após a confirmação, o PDF fica sem marca de água."],
            ].map(([n, t, d]) => (
              <div key={n}>
                <span className="w-10 h-10 rounded-full bg-[#1C2D42] text-white font-bold flex items-center justify-center">{n}</span>
                <h3 className="mt-3 font-semibold text-[#1C2D42]">{t}</h3>
                <p className="mt-1 text-sm text-slate-600">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 py-14">
        <h2 className="font-head text-2xl sm:text-3xl font-bold text-[#1C2D42]">Perguntas frequentes</h2>
        <div className="mt-8"><Faq /></div>
        <div className="mt-10 text-center">
          <Link to="/criar" data-testid="faq-start-btn" className="px-6 py-3.5 rounded-full bg-[#2563EB] text-white font-semibold hover:bg-[#1d4ed8] inline-block">Começar agora</Link>
        </div>
      </section>
    </Layout>
  );
}
