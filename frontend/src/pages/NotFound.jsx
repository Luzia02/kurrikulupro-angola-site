import React from "react";
import Layout from "../components/Layout";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <Layout>
      <div className="max-w-lg mx-auto text-center py-16">
        <p className="font-head text-6xl font-extrabold text-[#1C2D42]">404</p>
        <h1 className="mt-4 text-xl font-semibold text-slate-800">Página não encontrada</h1>
        <p className="mt-2 text-slate-500">A página que procura não existe ou foi movida.</p>
        <Link to="/" data-testid="notfound-home" className="inline-block mt-8 px-5 py-3 rounded-full bg-[#1C2D42] text-white font-semibold">Voltar ao início</Link>
      </div>
    </Layout>
  );
}
