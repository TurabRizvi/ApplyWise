"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LogOut, Building2, ChevronDown, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useHrAuth } from "@/lib/hr-auth-context";
import { HrAiAssistantPanel } from "@/components/hr/ai-assistant-panel";

export function HrTopbar() {
  const router = useRouter();
  const { hrUser, logout } = useHrAuth();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [assistantOpen, setAssistantOpen] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/login?type=hr");
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-border px-6">
      <div />
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => setAssistantOpen(true)}>
          <Sparkles className="h-4 w-4 text-primary" />
          AI Assistant
        </Button>
        <ThemeToggle />
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-accent"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Building2 className="h-4 w-4" />
            </div>
            <div className="hidden text-left sm:block">
              <p className="font-medium leading-tight text-foreground">
                {hrUser?.organization.name ?? "Organization"}
              </p>
              <p className="text-xs leading-tight text-muted-foreground">{hrUser?.email}</p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-border bg-card p-1 shadow-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      <HrAiAssistantPanel open={assistantOpen} onClose={() => setAssistantOpen(false)} />
    </header>
  );
}
