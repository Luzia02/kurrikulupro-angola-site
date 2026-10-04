import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api, errMsg } from "../../lib/api";
import { FileText, Loader2 } from "lucide-react";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/auth/me").then(() => navigate("/admin")).catch(() => {});
  }, [navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await api.post("/auth/login", { email, password });
      navigate("/admin");
    } catch (err) {
      setError(errMsg(err));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B132B] px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center gap-2 justify-center">
          <span className="w-10 h-10 rounded-lg bg-[#1C2D42] flex items-center justify-center"><FileText className="w-5 h-5 text-white" /></span>
          <span className="font-head font-extrabold text-[#1C2D42] text-lg">Administração</span>
        </div>
        <p className="text-center text-sm text-slate-500 mt-2">Acesso restrito à equipa KurrikuluPro.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input data-testid="admin-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 focus:ring-2 focus:ring-[#2563EB] outline-none" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Palavra-passe</span>
            <input data-testid="admin-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 focus:ring-2 focus:ring-[#2563EB] outline-none" />
          </label>
          {error && <p className="text-sm text-red-500" data-testid="admin-login-error">{error}</p>}
          <button data-testid="admin-login-btn" disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#1C2D42] text-white font-semibold disabled:opacity-60">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />} Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
