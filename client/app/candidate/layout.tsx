"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { CandidateSidebar } from "@/components/candidate/sidebar";
import { CandidateTopbar } from "@/components/candidate/topbar";
import { useAuth } from "@/lib/auth-context";

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { accessToken, isInitializing } = useAuth();

  // Wait for the silent session-restore attempt (lib/auth-context.tsx) to
  // finish before deciding whether to redirect — otherwise a logged-in user
  // would get bounced to /login for a split second on every page reload,
  // before their refresh cookie has had a chance to restore the session.
  React.useEffect(() => {
    if (!isInitializing && !accessToken) {
      router.replace("/login");
    }
  }, [isInitializing, accessToken, router]);

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!accessToken) {
    // Redirect is in flight (see effect above) — render nothing rather than
    // flashing protected content for a frame.
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <CandidateSidebar />
      <div className="flex flex-1 flex-col">
        <CandidateTopbar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
