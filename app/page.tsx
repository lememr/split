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
  name: string;
  url: string;
  weight: number;
  visits: number;
  conversions: number;
  rate: number;
  status: "ativo" | "inativo";
}

interface FormData {
  name: string;
  url: string;
  weight: string;
}

const sortColumns = [
  { key: "name", label: "Name" },
  { key: "visits", label: "Visits" },
  { key: "conversions", label: "Conversions" },
  { key: "rate", label: "Rate %" },
  { key: "weight", label: "Weight" },
  { key: "status", label: "Status" },
] as const;

type SortKey = (typeof sortColumns)[number]["key"];

export default function Dashboard() {
  const [pages, setPages] = useState<Pagina[]>([]);
  const [form, setForm] = useState<FormData>({ name: "", url: "", weight: "50" });
  const [editing, setEditing] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "visits",
    dir: "desc",
  });
  const [loading, setLoading] = useState(true);

  const loadPages = useCallback(async () => {
    try {
      const res = await fetch("/api/pages");
      const data = await res.json();
      setPages(data.pages || []);
    } catch {
      setPages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPages();
  }, [loadPages]);

  const totalPages = pages.length;
  const totalVisits = pages.reduce((s, p) => s + p.visits, 0);
  const totalConversions = pages.reduce((s, p) => s + p.conversions, 0);
  const avgRate =
    totalVisits > 0 ? Number(((totalConversions / totalVisits) * 100).toFixed(2)) : 0;

  const splitUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/api/redirect`;

  async function savePage(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.url.trim()) return;
    const payload = { ...form, weight: Number(form.weight) || 50 };
    if (editing) {
      await fetch(`/api/pages/${editing}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    setForm({ name: "", url: "", weight: "50" });
    setEditing(null);
    loadPages();
  }

  async function deletePage(id: string) {
    if (!confirm("Delete this page?")) return;
    await fetch(`/api/pages/${id}`, { method: "DELETE" });
    loadPages();
  }

  async function resetCounters(id: string) {
    if (!confirm("Reset counters for this page?")) return;
    await fetch(`/api/pages/${id}/reset`, { method: "POST" });
    loadPages();
  }

  async function toggleStatus(id: string, statusAtual: string) {
    const novo = statusAtual === "ativo" ? "inativo" : "ativo";
    await fetch(`/api/pages/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: novo }),
    });
    loadPages();
  }

  function startEditing(p: Pagina) {
    setForm({ name: p.name, url: p.url, weight: String(p.weight) });
    setEditing(p.id);
  }

  function copyUrl() {
    navigator.clipboard.writeText(splitUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function sortBy(key: SortKey) {
    setSort((curr) => ({
      key,
      dir: curr.key === key && curr.dir === "desc" ? "asc" : "desc",
    }));
  }

  const sortedPages = [...pages].sort((a, b) => {
    let va = a[sort.key];
    let vb = b[sort.key];
    if (typeof va === "string") va = va.toLowerCase();
    if (typeof vb === "string") vb = vb.toLowerCase();
    if (va < vb) return sort.dir === "asc" ? -1 : 1;
    if (va > vb) return sort.dir === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <div className="space-y-6 md:space-y-8 max-w-6xl">
      {/* Cards de metricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-[#E2E8F0]">
          <div className="flex items-center gap-2 mb-2">
            <FileTextIcon />
            <span className="text-xs md:text-sm text-[#64748B]">Pages</span>
          </div>
          <p className="text-xl md:text-3xl font-bold text-[#1E293B]">{totalPages}</p>
        </div>
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-[#E2E8F0]">
          <div className="flex items-center gap-2 mb-2">
            <Eye size={16} className="text-[#0053FD]" />
            <span className="text-xs md:text-sm text-[#64748B]">Visits</span>
          </div>
          <p className="text-xl md:text-3xl font-bold text-[#1E293B]">{totalVisits.toLocaleString("pt-BR")}</p>
        </div>
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-[#E2E8F0]">
          <div className="flex items-center gap-2 mb-2">
            <MousePointerClick size={16} className="text-[#10B981]" />
            <span className="text-xs md:text-sm text-[#64748B]">Conversions</span>
          </div>
          <p className="text-xl md:text-3xl font-bold text-[#1E293B]">{totalConversions.toLocaleString("pt-BR")}</p>
        </div>
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-[#E2E8F0]">
          <div className="flex items-center gap-2 mb-2">
            {avgRate >= 0 ? (
              <TrendingUp size={16} className="text-[#10B981]" />
            ) : (
              <TrendingDown size={16} className="text-[#EF4444]" />
            )}
            <span className="text-xs md:text-sm text-[#64748B]">Avg Rate</span>
          </div>
          <p className="text-xl md:text-3xl font-bold text-[#1E293B]">{avgRate}%</p>
        </div>
      </div>

      {/* Botao copiar URL */}
      <div className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-[#E2E8F0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs md:text-sm text-[#64748B] mb-1">URL generica do Split</p>
          <code className="block text-sm text-[#0053FD] font-mono break-all">{splitUrl}</code>
        </div>
        <button
          onClick={copyUrl}
          className="flex items-center gap-2 px-4 py-2 bg-[#0053FD] text-white rounded-lg text-sm font-medium hover:bg-[#0042CA] transition-colors shrink-0"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? "Copied" : "Copy URL"}
        </button>
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-[#E2E8F0]">
        <h3 className="text-base md:text-lg font-semibold text-[#1E293B] mb-4">
          {editing ? "Edit Page" : "Register New Page"}
        </h3>
        <form onSubmit={savePage} className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4 items-end">
          <div className="md:col-span-1">
            <label className="block text-xs md:text-sm font-medium text-[#64748B] mb-1">Nome</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
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
              value={form.weight}
              onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-sm focus:ring-2 focus:ring-[#0053FD]/20"
            />
          </div>
          <div className="flex gap-2 md:col-span-1">
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-[#0053FD] text-white rounded-lg text-sm font-medium hover:bg-[#0042CA] transition-colors w-full justify-center"
            >
              <Plus size={16} />
              {editing ? "Save" : "Register"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setForm({ name: "", url: "", weight: "50" });
                }}
                className="px-3 py-2 bg-[#E2E8F0] text-[#1E293B] rounded-lg text-sm font-medium hover:bg-[#CBD5E1] transition-colors shrink-0"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Tabela + Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] overflow-hidden">
        <div className="p-4 md:p-6 border-b border-[#E2E8F0]">
          <h3 className="text-base md:text-lg font-semibold text-[#1E293B]">Registered Pages</h3>
        </div>

        {loading ? (
          <div className="p-8 text-center text-[#64748B] text-sm">Loading...</div>
        ) : pages.length === 0 ? (
          <div className="p-8 text-center text-[#64748B] text-sm">No pages registered.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8FAFF]">
                  {sortColumns.map((col) => (
                    <th
                      key={col.key}
                      onClick={() => sortBy(col.key)}
                      className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] cursor-pointer select-none whitespace-nowrap"
                    >
                      <span className="flex items-center gap-1">
                        {col.label}
                        <ArrowUpDown size={12} className={sort.key === col.key ? "text-[#0053FD]" : "opacity-40"} />
                      </span>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] whitespace-nowrap">Chart</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {sortedPages.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F8FAFF]/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-[#1E293B] whitespace-nowrap">{p.name}</td>
                    <td className="px-4 py-3 text-[#64748B] max-w-[160px] md:max-w-[220px] truncate">{p.url}</td>
                    <td className="px-4 py-3 text-[#1E293B] whitespace-nowrap">{p.visits.toLocaleString("pt-BR")}</td>
                    <td className="px-4 py-3 text-[#1E293B] whitespace-nowrap">{p.conversions.toLocaleString("pt-BR")}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={p.rate >= 0 ? "text-[#10B981]" : "text-[#EF4444]"}>{p.rate}%</span>
                    </td>
                    <td className="px-4 py-3 text-[#1E293B] whitespace-nowrap">{p.weight}%</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        onClick={() => toggleStatus(p.id, p.status)}
                        className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                          p.status === "ativo"
                            ? "bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20"
                            : "bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444]/20"
                        }`}
                      >
                        {p.status === "ativo" ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 md:w-24 bg-[#E2E8F0] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#0053FD] rounded-full transition-all"
                            style={{
                              width: `${totalVisits > 0 ? (p.visits / totalVisits) * 100 : 0}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-[#64748B]">
                          {totalVisits > 0 ? ((p.visits / totalVisits) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEditing(p)}
                          title="Editar"
                          className="p-1.5 rounded-md text-[#0053FD] hover:bg-[#0053FD]/10 transition-colors"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => resetCounters(p.id)}
                          title="Reset counters"
                          className="p-1.5 rounded-md text-[#64748B] hover:bg-[#F8FAFF] transition-colors"
                        >
                          <RotateCcw size={14} />
                        </button>
                        <button
                          onClick={() => deletePage(p.id)}
                          title="Delete"
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
