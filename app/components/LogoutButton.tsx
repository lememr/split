"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-lg text-[#64748B] hover:bg-[#EF4444]/10 hover:text-[#EF4444] transition-colors whitespace-nowrap text-sm md:text-base w-full"
    >
      <LogOut size={18} />
      <span className="font-medium">Sair</span>
    </button>
  );
}
