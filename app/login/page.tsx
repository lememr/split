"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (data.success) {
        router.push("/");
        router.refresh();
      } else {
        setError("Senha incorreta");
      }
    } catch {
      setError("Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFF] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg border border-[#E2E8F0] p-8 md:p-12 w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <div className="w-16 h-16 bg-[#0053FD]/10 rounded-full flex items-center justify-center">
            <Lock size={32} className="text-[#0053FD]" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-[#1E293B] text-center mb-2">Split Admin</h1>
        <p className="text-sm text-[#64748B] text-center mb-8">Painel de controle protegido</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#64748B] mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite a senha"
              className="w-full px-4 py-3 rounded-lg border border-[#E2E8F0] text-[#1E293B] focus:ring-2 focus:ring-[#0053FD]/20 focus:border-[#0053FD] outline-none transition-all"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-sm text-[#EF4444] bg-[#EF4444]/10 rounded-lg px-4 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#0053FD] text-white rounded-lg font-medium hover:bg-[#0042CA] transition-colors disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <p className="text-xs text-[#94A3B8] text-center mt-6">
          Senha padrão: <code className="bg-[#F8FAFF] px-2 py-1 rounded">split2024</code>
          <br />
          Altere em Settings &gt; Environment Variables
        </p>
      </div>
    </div>
  );
}
