import React, { useState } from "react";
import Layout from "../components/Layout";
import { useNavigate, Link } from "react-router-dom";
import { defaultContent } from "../lib/pathways";
import { api, errMsg } from "../lib/api";
import { toast } from "sonner";

const QUESTIONS = [
  { key: "feito", q: "O que já fez, mesmo que de forma informal?", placeholder: "Ex.: ajudei numa loja, cuidei de crianças, fiz biscates de electricidade..." },
  { key: "sabe", q: "O que sabe e gosta de fazer?", placeholder: "Ex.: cozinhar, consertar coisas, atender pessoas, usar o computador..." },
  { key: "estudos", q: "Que estudos ou cursos tem (mesmo que incompletos)?", placeholder: "Ex.: a estudar Contabilidade, 9.ª classe, curso de informática..." },
];

const PREFS = [
  { id: "procurar_emprego", label: "Emprego numa empresa" },
  { id: "prestar_servicos", label: "Prestar serviços / trabalho por conta própria" },
  { id: "trabalhar_casa", label: "Trabalhar numa casa (tarefas domésticas)" },
  { id: "baba_cuidador", label: "Cuidar de crianças ou idosos" },
];

function recommend(answers, pref) {
  const recs = [];
  if (pref) recs.push(pref);
  const txt = (answers.feito + " " + answers.sabe).toLowerCase();
  const add = (id) => { if (!recs.includes(id)) recs.push(id); };
  if (/cozinh|limp|roupa|casa|domést/.test(txt)) add("trabalhar_casa");
  if (/crian|bebé|bebe|idoso|cuidar/.test(txt)) add("baba_cuidador");
  if (/electr|canaliz|mecân|mecanic|pintur|conserto|biscate|serviç/.test(txt)) add("prestar_servicos");
  if (answers.estudos.trim()) add("curriculo_pessoal");
  add("procurar_emprego");
  return recs.slice(0, 3);
}

const LABELS = {
  procurar_emprego: "Currículo geral para empresas",
  curriculo_pessoal: "Currículo pessoal (estudante / 1.º emprego)",
  prestar_servicos: "Prestar serviços",
  trabalhar_casa: "Trabalhar numa casa",
  baba_cuidador: "Babá / Cuidador(a)",
};
const WHY = {
  procurar_emprego: "Serve para enviar a várias empresas sem ter de escolher já um cargo.",
  curriculo_pessoal: "Bom se ainda está a estudar ou procura o primeiro emprego.",
  prestar_servicos: "Indicado se trabalha por conta própria para clientes.",
  trabalhar_casa: "Para tarefas domésticas, com as competências que confirmar.",
  baba_cuidador: "Para cuidar de crianças ou idosos, de forma segura e respeitosa.",
};

export default function Guided() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ feito: "", sabe: "", estudos: "" });
  const [pref, setPref] = useState("");
  const [loading, setLoading] = useState(false);

  const recs = recommend(answers, pref);

  async function choose(pathwayId) {
    setLoading(true);
    try {
      const { data } = await api.post("/drafts", { content: defaultContent(pathwayId) });
      localStorage.setItem("kp_draft_token", data.token);
      navigate(`/criar/${data.token}`);
    } catch (e) {
      toast.error(errMsg(e));
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="max-w-xl mx-auto">
        <Link to="/criar" className="text-sm text-slate-500 hover:text-[#1C2D42]">← Voltar aos caminhos</Link>
        <h1 className="mt-3 font-head text-3xl font-extrabold text-[#1C2D42]">Vamos descobrir juntos</h1>
        <p className="text-slate-600 mt-2">Uma pergunta de cada vez. Nós não escolhemos nem adicionamos nada por si.</p>

        <div className="mt-6 h-2 rounded-full bg-slate-200 overflow-hidden">
          <div className="h-full bg-[#2563EB] transition-all" style={{ width: `${((step + 1) / (QUESTIONS.length + 2)) * 100}%` }} />
        </div>

        <div className="mt-8 bg-white rounded-2xl border border-slate-200 p-6">
          {step < QUESTIONS.length && (
            <div>
              <label className="font-head font-semibold text-[#1C2D42] text-lg">{QUESTIONS[step].q}</label>
              <textarea data-testid={`guided-input-${QUESTIONS[step].key}`}
                value={answers[QUESTIONS[step].key]}
                onChange={(e) => setAnswers({ ...answers, [QUESTIONS[step].key]: e.target.value })}
                placeholder={QUESTIONS[step].placeholder} rows={4}
                className="mt-3 w-full rounded-xl border border-slate-300 p-3 focus:ring-2 focus:ring-[#2563EB] outline-none" />
              <div className="mt-5 flex justify-between">
                <button data-testid="guided-back" disabled={step === 0} onClick={() => setStep(step - 1)}
                  className="px-4 py-2 rounded-full border border-slate-300 text-slate-600 disabled:opacity-40">Voltar</button>
                <button data-testid="guided-next" onClick={() => setStep(step + 1)}
                  className="px-5 py-2 rounded-full bg-[#1C2D42] text-white font-semibold">Continuar</button>
              </div>
            </div>
          )}

          {step === QUESTIONS.length && (
            <div>
              <label className="font-head font-semibold text-[#1C2D42] text-lg">O que prefere?</label>
              <div className="mt-4 space-y-2">
                {PREFS.map((p) => (
                  <button key={p.id} data-testid={`guided-pref-${p.id}`} onClick={() => setPref(p.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl border ${pref === p.id ? "border-[#2563EB] bg-[#EFF6FF]" : "border-slate-300"}`}>
                    {p.label}
                  </button>
                ))}
              </div>
              <div className="mt-5 flex justify-between">
                <button onClick={() => setStep(step - 1)} className="px-4 py-2 rounded-full border border-slate-300 text-slate-600">Voltar</button>
                <button data-testid="guided-see-rec" onClick={() => setStep(step + 1)} className="px-5 py-2 rounded-full bg-[#1C2D42] text-white font-semibold">Ver sugestões</button>
              </div>
            </div>
          )}

          {step === QUESTIONS.length + 1 && (
            <div>
              <h2 className="font-head font-bold text-[#1C2D42] text-xl">As nossas sugestões</h2>
              <p className="text-sm text-slate-600 mt-1">Pode escolher uma, ou seguir com o currículo pessoal. A decisão é sua.</p>
              <div className="mt-4 space-y-3">
                {recs.map((id) => (
                  <div key={id} className="rounded-xl border border-slate-200 p-4">
                    <h3 className="font-semibold text-[#1C2D42]">{LABELS[id]}</h3>
                    <p className="text-sm text-slate-600 mt-1">{WHY[id]}</p>
                    <button data-testid={`guided-choose-${id}`} disabled={loading} onClick={() => choose(id)}
                      className="mt-3 px-4 py-2 rounded-full bg-[#2563EB] text-white text-sm font-semibold">Seguir este caminho</button>
                  </div>
                ))}
              </div>
              <button data-testid="guided-choose-curriculo_pessoal-fallback" onClick={() => choose("curriculo_pessoal")}
                className="mt-5 text-sm text-[#2563EB] font-semibold">Prefiro um currículo pessoal simples →</button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
