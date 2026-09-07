"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, LayoutDashboard, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/contacts", label: "Contacts & Dialer", icon: Users },
];

export function Sidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  return (
    <aside className="card hidden w-60 shrink-0 flex-col gap-1 p-3 md:flex">
      <div className="mb-3 flex items-center gap-2 px-2 py-1">
        <span className="grad-text text-lg font-bold">CRM Hub</span>
      </div>
      {links.map((l) => {
        const Icon = l.icon;
        return (
          <Link key={l.href} href={l.href} className={`navlink ${pathname === l.href ? "active" : ""}`}>
            <Icon size={16} />
            {l.label}
          </Link>
        );
      })}
      <div className="mt-auto flex flex-col gap-2 border-t border-[var(--line)] pt-3">
        <div className="px-2 text-xs text-[var(--muted)] truncate">{email}</div>
        <button onClick={logout} className="navlink">
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </aside>
  );
}