"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Users, LayoutDashboard, LogOut, MessageSquareText } from "lucide-react";

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
    <>
      {/* Desktop rail */}
      <aside className="card hidden w-60 shrink-0 flex-col gap-1 p-3 md:flex">
        <div className="mb-3 flex items-center gap-2 px-2 py-1">
          <MessageSquareText size={18} className="grad-text" />
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

      {/* Mobile top bar */}
      <header className="card sticky top-0 z-20 flex items-center gap-2 p-2 md:hidden">
        <span className="px-2 text-sm font-bold grad-text">
          <MessageSquareText size={16} className="inline-block align-[-2px]" /> CRM Hub
        </span>
        <nav className="ml-auto flex items-center gap-1">
          {links.map((l) => {
            const Icon = l.icon;
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`navlink ${active ? "active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{l.label.split(" ")[0]}</span>
              </Link>
            );
          })}
          <button onClick={logout} className="navlink" aria-label="Sign out">
            <LogOut size={16} />
          </button>
        </nav>
      </header>
    </>
  );
}