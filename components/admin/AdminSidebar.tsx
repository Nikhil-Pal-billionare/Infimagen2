"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Overview", icon: "⬡" },
  { href: "/admin/users", label: "Users", icon: "◎" },
  { href: "/admin/usage", label: "Usage", icon: "◈" },
  { href: "/admin/revenue", label: "Revenue", icon: "◇" },
  { href: "/admin/referrals", label: "Referrals", icon: "◉" },
  { href: "/admin/submissions", label: "Submissions", icon: "◫" },
  { href: "/admin/waitlist", label: "Waitlist", icon: "◬" },
  { href: "/admin/media", label: "Media Manager", icon: "◰" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-[#0f0f0f] border-r border-white/5 flex flex-col z-50">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">I</span>
          </div>
          <span className="text-white font-bold text-sm tracking-wider uppercase">InfiMagen</span>
        </div>
        <p className="text-xs text-white/30 mt-1 ml-9">Admin Console</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-semibold text-white/20 uppercase tracking-widest px-3 pb-2 pt-1">Dashboard</p>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group ${
                isActive
                  ? "bg-violet-600/20 text-violet-300 border border-violet-500/20"
                  : "text-white/40 hover:text-white/80 hover:bg-white/5"
              }`}
            >
              <span className={`text-base leading-none ${isActive ? "text-violet-400" : "text-white/25 group-hover:text-white/50"}`}>
                {item.icon}
              </span>
              <span className="font-medium">{item.label}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-4 py-4 border-t border-white/5">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-xs text-white/25 hover:text-white/60 transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5"
        >
          <span>←</span>
          <span>Back to App</span>
        </Link>
      </div>
    </aside>
  );
}
