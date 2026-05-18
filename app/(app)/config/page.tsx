"use client";

import { useState, useEffect } from "react";
import { Save, Globe, SlidersHorizontal, Link2 } from "lucide-react";

interface Config {
  baseUrl: string;
  modo: "round-robin" | "peso";
  trackingParams: string;
}

export default function ConfigPage() {
  const [config, setConfig] = useState<Config>({
    baseUrl: "",
    modo: "peso",
    trackingParams: "",
  });
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function buscar() {
      try {
        const res = await fetch("/api/config");
        const dados = await res.json();
        setConfig({
          baseUrl: dados.baseUrl || "",
          modo: dados.modo || "peso",
          trackingParams: dados.trackingParams || "",
        });
      } catch {
        // mantem defaults
      } finally {
        setCarregando(false);
      }
    }
    buscar();
  }, []);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    try {
      await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      setSalvo(true);
      setTimeout(() => setSalvo(false), 2500);
    } catch {
      alert("Erro ao salvar configuracoes");
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-xl p-8 shadow-sm border border-[#E2E8F0] text-center text-[#64748B] text-sm">
        Carregando configuracoes...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 md:space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg md:text-xl font-bold text-[#1E293B]">Configuracoes do Sistema</h2>
      </div>

      <form onSubmit={salvar} className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] overflow-hidden">
        <div className="p-4 md:p-6 space-y-5 md:space-y-6">
          {/* URL Base */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-[#1E293B] mb-2">
              <Globe size={16} className="text-[#0053FD]" />
              URL Base do Sistema
            </label>
            <p className="text-xs text-[#64748B] mb-2">
              URL principal usada para gerar links e redirecionamentos.
            </p>
            <input
              type="url"
              value={config.baseUrl}
              onChange={(e) => setConfig((c) => ({ ...c, baseUrl: e.target.value }))}
              placeholder="https://seudominio.com"
              className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-sm focus:ring-2 focus:ring-[#0053FD]/20"
            />
          </div>

          {/* Modo de Distribuicao */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-[#1E293B] mb-2">
              <SlidersHorizontal size={16} className="text-[#0053FD]" />
              Modo de Distribuicao
            </label>
            <p className="text-xs text-[#64748B] mb-2">
              Como o trafego sera distribuido entre as paginas cadastradas.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setConfig((c) => ({ ...c, modo: "peso" }))}
                className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                  config.modo === "peso"
                    ? "border-[#0053FD] bg-[#0053FD]/5 text-[#0053FD]"
                    : "border-[#E2E8F0] text-[#64748B] hover:border-[#CBD5E1]"
                }`}
              >
                Por Peso
                <span className="block text-xs font-normal mt-1 opacity-70">
                  Distribuicao proporcional ao peso definido
                </span>
              </button>
              <button
                type="button"
                onClick={() => setConfig((c) => ({ ...c, modo: "round-robin" }))}
                className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                  config.modo === "round-robin"
                    ? "border-[#0053FD] bg-[#0053FD]/5 text-[#0053FD]"
                    : "border-[#E2E8F0] text-[#64748B] hover:border-[#CBD5E1]"
                }`}
              >
                Round-Robin
                <span className="block text-xs font-normal mt-1 opacity-70">
                  Alterna sequencialmente entre as paginas
                </span>
              </button>
            </div>
          </div>

          {/* Tracking Parameters */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-[#1E293B] mb-2">
              <Link2 size={16} className="text-[#0053FD]" />
              Parametros de Tracking
            </label>
            <p className="text-xs text-[#64748B] mb-2">
              Parametros UTM ou outros que devem ser preservados nos redirecionamentos (separados por virgula).
            </p>
            <input
              type="text"
              value={config.trackingParams}
              onChange={(e) => setConfig((c) => ({ ...c, trackingParams: e.target.value }))}
              placeholder="utm_source, utm_medium, utm_campaign, fbclid"
              className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-sm focus:ring-2 focus:ring-[#0053FD]/20"
            />
          </div>
        </div>

        <div className="px-4 md:px-6 py-4 border-t border-[#E2E8F0] flex items-center justify-between">
          {salvo && (
            <span className="text-sm text-[#10B981] font-medium">Configuracoes salvas com sucesso!</span>
          )}
          <div className="ml-auto">
            <button
              type="submit"
              disabled={salvando}
              className="flex items-center gap-2 px-5 py-2 bg-[#0053FD] text-white rounded-lg text-sm font-medium hover:bg-[#0042CA] transition-colors disabled:opacity-60"
            >
              <Save size={16} />
              {salvando ? "Salvando..." : "Salvar Configuracoes"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
