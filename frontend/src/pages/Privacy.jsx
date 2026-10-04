import React from "react";
import Layout from "../components/Layout";
import { Link } from "react-router-dom";

export default function Privacy() {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto prose-slate">
        <h1 className="font-head text-3xl font-extrabold text-[#1C2D42]">Política de Privacidade</h1>
        <p className="text-slate-600 mt-4">Esta página é um rascunho para revisão do proprietário. Não contém entidades legais, moradas ou garantias inventadas.</p>
        <div className="mt-6 space-y-4 text-slate-700 text-[15px] leading-relaxed">
          <p><b>Que dados recolhemos.</b> Apenas os dados que a pessoa introduz para criar e entregar o currículo (nome, contacto, cidade, formação, experiência e competências) e, quando aplicável, o comprovativo de pagamento.</p>
          <p><b>Para que servem.</b> Criar o PDF do currículo e processar o pedido de pagamento. Não vendemos dados.</p>
          <p><b>Rascunho no dispositivo.</b> O rascunho é guardado de forma associada a um código no seu dispositivo. Pode corrigir ou apagar o rascunho a qualquer momento.</p>
          <p><b>Comprovativos.</b> São guardados em armazenamento privado e só são acedidos pela administração para verificar o pagamento. Não são publicados.</p>
          <p><b>Segurança.</b> Validamos os dados no servidor e limitamos o tamanho e tipo dos ficheiros. Não guardamos palavras-passe nem dados de pagamento nos registos técnicos.</p>
          <p><b>Eliminação.</b> Pode pedir a eliminação do seu rascunho e dados através do contacto de suporte.</p>
        </div>
        <Link to="/" className="inline-block mt-8 text-[#2563EB] font-semibold">← Voltar ao início</Link>
      </div>
    </Layout>
  );
}
