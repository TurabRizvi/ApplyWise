"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LogOut, UserCircle, ChevronDown, Sparkles, Menu } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { AiAssistantPanel } from "@/components/candidate/ai-assistant-panel";
import { CandidateMobileSidebar } from "@/components/candidate/sidebar";

export function CandidateTopbar() {
  const router = useRouter();
  const { profile, logout } = useAuth();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = React.useState(false);
  const [assistantOpen, setAssistantOpen] = React.useState(false);

  const handleLogout = async () => {
    setAccountMenuOpen(false);
    await logout();
    router.push("/login");
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/90 px-3 backdrop-blur-sm sm:px-6">
        <div className="flex items-center gap-2 lg:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-foreground transition-colors hover:bg-accent"
            aria-label="Open navigation"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAssistantOpen(true)}
            className="px-2 sm:px-3"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="hidden sm:inline">AI Assistant</span>
          </Button>
          <ThemeToggle />
          <div className="relative">
            <button
              onClick={() => setAccountMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-accent"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UserCircle className="h-5 w-5" />
              </div>
              <span className="hidden font-medium text-foreground sm:inline">
                {profile?.fullName ?? "Account"}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>

            {accountMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setAccountMenuOpen(false)} />
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
      </header>

      <CandidateMobileSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <AiAssistantPanel open={assistantOpen} onClose={() => setAssistantOpen(false)} />
    </>
  );
}
