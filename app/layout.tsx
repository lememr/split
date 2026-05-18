import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { LayoutDashboard, FileText, Settings, LogOut } from "lucide-react";
import "./globals.css";
import LogoutButton from "./components/LogoutButton";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Split Admin",
  description: "Painel admin para sistema Split - Load Balancer de paginas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <div className="flex flex-col md:flex-row min-h-screen bg-[#F8FAFF]">
          <aside className="w-full md:w-64 md:h-screen md:fixed md:left-0 md:top-0 bg-white border-b md:border-b-0 md:border-r border-[#E2E8F0] flex-shrink-0 z-20">
            <div className="p-4 md:p-6 border-b border-[#E2E8F0]">
              <h1 className="text-lg md:text-xl font-bold text-[#0053FD]">
                Split Admin
              </h1>
            </div>
            <nav className="flex md:flex-col p-2 md:p-4 gap-1 overflow-x-auto">
              <Link
                href="/"
                className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-lg text-[#1E293B] hover:bg-[#F8FAFF] transition-colors whitespace-nowrap text-sm md:text-base"
              >
                <LayoutDashboard size={18} />
                <span className="font-medium">Dashboard</span>
              </Link>
              <Link
                href="/"
                className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-lg text-[#1E293B] hover:bg-[#F8FAFF] transition-colors whitespace-nowrap text-sm md:text-base"
              >
                <FileText size={18} />
                <span className="font-medium">Paginas</span>
              </Link>
              <Link
                href="/config"
                className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-lg text-[#1E293B] hover:bg-[#F8FAFF] transition-colors whitespace-nowrap text-sm md:text-base"
              >
                <Settings size={18} />
                <span className="font-medium">Configuracoes</span>
              </Link>
            </nav>
            <div className="hidden md:block mt-auto p-4 border-t border-[#E2E8F0]">
              <LogoutButton />
            </div>
          </aside>

          <main className="flex-1 md:ml-64 min-w-0">
            <header className="bg-white/80 backdrop-blur-sm border-b border-[#E2E8F0] px-4 md:px-8 py-4 sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-base md:text-lg font-semibold text-[#1E293B]">
                  Painel de Controle
                </h2>
                <div className="text-xs md:text-sm text-[#64748B]">
                  Split Load Balancer
                </div>
              </div>
            </header>
            <div className="p-4 md:p-8">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
