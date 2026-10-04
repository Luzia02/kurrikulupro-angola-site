import React from "react";
import Layout from "../components/Layout";
import { Link } from "react-router-dom";

export default function Terms() {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="font-head text-3xl font-extrabold text-[#1C2D42]">Termos de Utilização</h1>
        <p className="text-slate-600 mt-4">Rascunho para revisão do proprietário.</p>
        <div className="mt-6 space-y-4 text-slate-700 text-[15px] leading-relaxed">
          <p><b>O serviço.</b> O KurrikuluPro ajuda a organizar e a formatar um currículo com a informação verdadeira que a pessoa fornece. Não inventamos emprego, formação, competências ou certificados.</p>
          <p><b>Responsabilidade do utilizador.</b> A pessoa é responsável pela veracidade da informação que coloca no currículo.</p>
          <p><b>Pagamento.</b> O pagamento é único, no valor indicado (900 Kz). O currículo final sem marca de água só é libertado após a confirmação do pagamento pela administração.</p>
          <p><b>Reembolsos.</b> Condições a definir pelo proprietário.</p>
        </div>
        <Link to="/" className="inline-block mt-8 text-[#2563EB] font-semibold">← Voltar ao início</Link>
      </div>
    </Layout>
  );
}
