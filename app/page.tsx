"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Trash2,
  Edit3,
  RotateCcw,
  Copy,
  Check,
  TrendingUp,
  TrendingDown,
  Eye,
  MousePointerClick,
  ArrowUpDown,
} from "lucide-react";

interface Pagina {
  id: string;
  nome: string;
  url: string;
  peso: number;
  visitas: number;
  conversoes: number;
  taxa: number;
  status: "ativo" | "inativo";
}

interface FormData {
  nome: string;
  url: string;
  peso: string;
}

const ordenacoes = [
  { chave: "nome", label: "Nome" },
  { chave: "visitas", label: "Visitas" },
  { chave: "conversoes", label: "Conversoes" },
  { chave: "taxa", label: "Taxa %" },
  { chave: "peso", label: "Peso" },
  { chave: "status", label: "Status" },
] as const;

type ChaveOrdenacao = (typeof ordenacoes)[number]["chave"];

export default function Dashboard() {
  const [paginas, setPaginas] = useState<Pagina[]>([]);
  const [form, setForm] = useState<FormData>({ nome: "", url: "", peso: "50" });
  const [editando, setEditando] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [ordem, setOrdem] = useState<{ chave: ChaveOrdenacao; dir: "asc" | "desc" }>({
    chave: "visitas",
    dir: "desc",
  });
  const [carregando, setCarregando] = useState(true);

  const buscarPaginas = useCallback(async () => {
    try {
      const res = await fetch("/api/paginas");
      const dados = await res.json();
      setPaginas(dados.paginas || []);
    } catch {
      setPaginas([]);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    buscarPaginas();
  }, [buscarPaginas]);

  const totalPaginas = paginas.length;
  const totalVisitas = paginas.reduce((s, p) => s + p.visitas, 0);
  const totalConversoes = paginas.reduce((s, p) => s + p.conversoes, 0);
  const taxaMedia =
    totalVisitas > 0 ? Number(((totalConversoes / totalVisitas) * 100).toFixed(2)) : 0;

  const splitUrl = process.env.NEXT_PUBLIC_SPLIT_URL || `${typeof window !== "undefined" ? window.location.origin : ""}/go`;

  async function salvarPagina(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome.trim() || !form.url.trim()) return;
    const payload = { ...form, peso: Number(form.peso) || 50 };
    if (editando) {
      await fetch(`/api/paginas/${editando}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/paginas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    setForm({ nome: "", url: "", peso: "50" });
    setEditando(null);
    buscarPaginas();
  }

  async function excluir(id: string) {
    if (!confirm("Excluir esta pagina?")) return;
    await fetch(`/api/paginas/${id}`, { method: "DELETE" });
    buscarPaginas();
  }

  async function resetarContadores(id: string) {
    if (!confirm("Resetar contadores desta pagina?")) return;
    await fetch(`/api/paginas/${id}/reset`, { method: "POST" });
    buscarPaginas();
  }

  async function toggleStatus(id: string, statusAtual: string) {
    const novo = statusAtual === "ativo" ? "inativo" : "ativo";
    await fetch(`/api/paginas/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: novo }),
    });
    buscarPaginas();
  }

  function iniciarEdicao(p: Pagina) {
    setForm({ nome: p.nome, url: p.url, peso: String(p.peso) });
    setEditando(p.id);
  }

  function copiarUrl() {
    navigator.clipboard.writeText(splitUrl).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  }

  function ordenarPor(chave: ChaveOrdenacao) {
    setOrdem((atual) => ({
      chave,
      dir: atual.chave === chave && atual.dir === "desc" ? "asc" : "desc",
    }));
  }

  const paginasOrdenadas = [...paginas].sort((a, b) => {
    let va = a[ordem.chave];
    let vb = b[ordem.chave];
    if (typeof va === "string") va = va.toLowerCase();
    if (typeof vb === "string") vb = vb.toLowerCase();
    if (va < vb) return ordem.dir === "asc" ? -1 : 1;
    if (va > vb) return ordem.dir === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <div className="space-y-6 md:space-y-8 max-w-6xl">
      {/* Cards de metricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-[#E2E8F0]">
          <div className="flex items-center gap-2 mb-2">
            <FileTextIcon />
            <span className="text-xs md:text-sm text-[#64748B]">Paginas</span>
          </div>
          <p className="text-xl md:text-3xl font-bold text-[#1E293B]">{totalPaginas}</p>
        </div>
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-[#E2E8F0]">
          <div className="flex items-center gap-2 mb-2">
            <Eye size={16} className="text-[#0053FD]" />
            <span className="text-xs md:text-sm text-[#64748B]">Visitas</span>
          </div>
          <p className="text-xl md:text-3xl font-bold text-[#1E293B]">{totalVisitas.toLocaleString("pt-BR")}</p>
        </div>
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-[#E2E8F0]">
          <div className="flex items-center gap-2 mb-2">
            <MousePointerClick size={16} className="text-[#10B981]" />
            <span className="text-xs md:text-sm text-[#64748B]">Conversoes</span>
          </div>
          <p className="text-xl md:text-3xl font-bold text-[#1E293B]">{totalConversoes.toLocaleString("pt-BR")}</p>
        </div>
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-[#E2E8F0]">
          <div className="flex items-center gap-2 mb-2">
            {taxaMedia >= 0 ? (
              <TrendingUp size={16} className="text-[#10B981]" />
            ) : (
              <TrendingDown size={16} className="text-[#EF4444]" />
            )}
            <span className="text-xs md:text-sm text-[#64748B]">Taxa Media</span>
          </div>
          <p className="text-xl md:text-3xl font-bold text-[#1E293B]">{taxaMedia}%</p>
        </div>
      </div>

      {/* Botao copiar URL */}
      <div className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-[#E2E8F0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs md:text-sm text-[#64748B] mb-1">URL generica do Split</p>
          <code className="block text-sm text-[#0053FD] font-mono break-all">{splitUrl}</code>
        </div>
        <button
          onClick={copiarUrl}
          className="flex items-center gap-2 px-4 py-2 bg-[#0053FD] text-white rounded-lg text-sm font-medium hover:bg-[#0042CA] transition-colors shrink-0"
        >
          {copiado ? <Check size={16} /> : <Copy size={16} />}
          {copiado ? "Copiado" : "Copiar URL"}
        </button>
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-[#E2E8F0]">
        <h3 className="text-base md:text-lg font-semibold text-[#1E293B] mb-4">
          {editando ? "Editar Pagina" : "Cadastrar Nova Pagina"}
        </h3>
        <form onSubmit={salvarPagina} className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4 items-end">
          <div className="md:col-span-1">
            <label className="block text-xs md:text-sm font-medium text-[#64748B] mb-1">Nome</label>
            <input
              type="text"
              value={form.nome}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              placeholder="Pagina A"
              className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-sm focus:ring-2 focus:ring-[#0053FD]/20"
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs md:text-sm font-medium text-[#64748B] mb-1">URL</label>
            <input
              type="url"
              value={form.url}
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              placeholder="https://exemplo.com"
              className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-sm focus:ring-2 focus:ring-[#0053FD]/20"
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs md:text-sm font-medium text-[#64748B] mb-1">Peso (%)</label>
            <input
              type="number"
              min={1}
              max={100}
              value={form.peso}
              onChange={(e) => setForm((f) => ({ ...f, peso: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-sm focus:ring-2 focus:ring-[#0053FD]/20"
            />
          </div>
          <div className="flex gap-2 md:col-span-1">
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-[#0053FD] text-white rounded-lg text-sm font-medium hover:bg-[#0042CA] transition-colors w-full justify-center"
            >
              <Plus size={16} />
              {editando ? "Salvar" : "Cadastrar"}
            </button>
            {editando && (
              <button
                type="button"
                onClick={() => {
                  setEditando(null);
                  setForm({ nome: "", url: "", peso: "50" });
                }}
                className="px-3 py-2 bg-[#E2E8F0] text-[#1E293B] rounded-lg text-sm font-medium hover:bg-[#CBD5E1] transition-colors shrink-0"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Tabela + Grafico */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] overflow-hidden">
        <div className="p-4 md:p-6 border-b border-[#E2E8F0]">
          <h3 className="text-base md:text-lg font-semibold text-[#1E293B]">Paginas Cadastradas</h3>
        </div>

        {carregando ? (
          <div className="p-8 text-center text-[#64748B] text-sm">Carregando...</div>
        ) : paginas.length === 0 ? (
          <div className="p-8 text-center text-[#64748B] text-sm">Nenhuma pagina cadastrada.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8FAFF]">
                  {ordenacoes.map((o) => (
                    <th
                      key={o.chave}
                      onClick={() => ordenarPor(o.chave)}
                      className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] cursor-pointer select-none whitespace-nowrap"
                    >
                      <span className="flex items-center gap-1">
                        {o.label}
                        <ArrowUpDown size={12} className={ordem.chave === o.chave ? "text-[#0053FD]" : "opacity-40"} />
                      </span>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] whitespace-nowrap">Grafico</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] whitespace-nowrap">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {paginasOrdenadas.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F8FAFF]/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-[#1E293B] whitespace-nowrap">{p.nome}</td>
                    <td className="px-4 py-3 text-[#64748B] max-w-[160px] md:max-w-[220px] truncate">{p.url}</td>
                    <td className="px-4 py-3 text-[#1E293B] whitespace-nowrap">{p.visitas.toLocaleString("pt-BR")}</td>
                    <td className="px-4 py-3 text-[#1E293B] whitespace-nowrap">{p.conversoes.toLocaleString("pt-BR")}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={p.taxa >= 0 ? "text-[#10B981]" : "text-[#EF4444]"}>{p.taxa}%</span>
                    </td>
                    <td className="px-4 py-3 text-[#1E293B] whitespace-nowrap">{p.peso}%</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        onClick={() => toggleStatus(p.id, p.status)}
                        className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                          p.status === "ativo"
                            ? "bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20"
                            : "bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444]/20"
                        }`}
                      >
                        {p.status === "ativo" ? "Ativo" : "Inativo"}
                      </button>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 md:w-24 bg-[#E2E8F0] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#0053FD] rounded-full transition-all"
                            style={{
                              width: `${totalVisitas > 0 ? (p.visitas / totalVisitas) * 100 : 0}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-[#64748B]">
                          {totalVisitas > 0 ? ((p.visitas / totalVisitas) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => iniciarEdicao(p)}
                          title="Editar"
                          className="p-1.5 rounded-md text-[#0053FD] hover:bg-[#0053FD]/10 transition-colors"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => resetarContadores(p.id)}
                          title="Resetar contadores"
                          className="p-1.5 rounded-md text-[#64748B] hover:bg-[#F8FAFF] transition-colors"
                        >
                          <RotateCcw size={14} />
                        </button>
                        <button
                          onClick={() => excluir(p.id)}
                          title="Excluir"
                          className="p-1.5 rounded-md text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function FileTextIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0053FD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}
