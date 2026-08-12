"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderKanban, Users, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

export const navItems = [
  { href: "/hr", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/hr/batches", label: "Screening Batches", icon: FolderKanban },
  { href: "/hr/team", label: "Team", icon: Users },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-1 p-4">
      {navItems.map((item) => {
        const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function HrSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-card/50 lg:flex lg:flex-col">
      <div className="flex h-16 items-center border-b border-border px-6">
        <Link href="/hr">
          <div className="flex items-center gap-2">
            <Logo showWordmark={false} />
            <div>
              <p className="text-sm font-semibold leading-tight text-foreground">ApplyWise</p>
              <p className="text-xs leading-tight text-muted-foreground">HR Portal</p>
            </div>
          </div>
        </Link>
      </div>
      <SidebarContent />
    </aside>
  );
}

export function HrMobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden" onClick={onClose} />
      <div className="animate-slide-in-right fixed left-0 top-0 z-50 flex h-full w-[280px] flex-col border-r border-border bg-card shadow-2xl lg:hidden">
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <Link href="/hr" onClick={onClose}>
            <div className="flex items-center gap-2">
              <Logo showWordmark={false} />
              <div>
                <p className="text-sm font-semibold leading-tight text-foreground">ApplyWise</p>
                <p className="text-xs leading-tight text-muted-foreground">HR Portal</p>
              </div>
            </div>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <SidebarContent onNavigate={onClose} />
      </div>
    </>
  );
}
