"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderKanban, Users } from "lucide-react";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/hr", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/hr/batches", label: "Screening Batches", icon: FolderKanban },
  { href: "/hr/team", label: "Team", icon: Users },
];

export function HrSidebar() {
  const pathname = usePathname();

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
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
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
    </aside>
  );
}
