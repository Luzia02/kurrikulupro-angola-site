import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FileText } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" data-testid="logo-link" className="flex items-center gap-2">
          <span className="w-9 h-9 rounded-lg bg-[#1C2D42] flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </span>
          <span className="font-head font-extrabold text-[#1C2D42] text-lg leading-none">
            KurrikuluPro<span className="text-[#2563EB]"> Angola</span>
          </span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4 text-sm">
          <Link to="/criar" data-testid="nav-create" className="hidden sm:inline text-slate-600 hover:text-[#1C2D42]">Criar currículo</Link>
          <Link to="/pedido" data-testid="nav-order" className="text-slate-600 hover:text-[#1C2D42]">O meu pedido</Link>
          <Link to="/criar" data-testid="nav-start-btn" className="px-4 py-2 rounded-full bg-[#1C2D42] text-white font-semibold hover:bg-[#0B132B] transition-colors">Começar</Link>
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white mt-16">
      <div className="max-w-6xl mx-auto px-4 py-8 text-sm text-slate-500 flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <p className="font-head font-bold text-[#1C2D42]">KurrikuluPro Angola</p>
          <p className="mt-1 max-w-sm">Currículos profissionais verdadeiros, prontos para enviar a empresas em Angola.</p>
        </div>
        <div className="flex gap-6">
          <Link to="/privacidade" data-testid="footer-privacy" className="hover:text-[#1C2D42]">Privacidade</Link>
          <Link to="/termos" data-testid="footer-terms" className="hover:text-[#1C2D42]">Termos</Link>
          <Link to="/admin/login" data-testid="footer-admin" className="hover:text-[#1C2D42]">Administração</Link>
        </div>
      </div>
    </footer>
  );
}

export default function Layout({ children, full }) {
  useLocation();
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className={full ? "flex-1" : "flex-1 max-w-6xl w-full mx-auto px-4 py-8"}>{children}</main>
      <Footer />
    </div>
  );
}
