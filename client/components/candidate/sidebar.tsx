"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  ScanSearch,
  Wand2,
  Mic,
  Mail,
  KanbanSquare,
  UserCircle,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/candidate", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/candidate/resumes", label: "My Resumes", icon: FileText },
  { href: "/candidate/ats-analyzer", label: "ATS Analyzer", icon: ScanSearch },
  { href: "/candidate/ai-rewrite", label: "AI Rewrite", icon: Wand2 },
  { href: "/candidate/interview-prep", label: "Interview Prep", icon: Mic },
  { href: "/candidate/cover-letters", label: "Cover Letters", icon: Mail },
  { href: "/candidate/applications", label: "Applications", icon: KanbanSquare },
  { href: "/candidate/profile", label: "Profile", icon: UserCircle },
];

export function CandidateSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-card/50 lg:flex lg:flex-col">
      <div className="flex h-16 items-center border-b border-border px-6">
        <Link href="/candidate">
          <Logo />
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
