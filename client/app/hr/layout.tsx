"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { HrSidebar } from "@/components/hr/sidebar";
import { HrTopbar } from "@/components/hr/topbar";
import { useHrAuth } from "@/lib/hr-auth-context";

export default function HrLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { accessToken, isInitializing } = useHrAuth();

  React.useEffect(() => {
    if (!isInitializing && !accessToken) {
      router.replace("/login?type=hr");
    }
  }, [isInitializing, accessToken, router]);

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!accessToken) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <HrSidebar />
      <div className="flex flex-1 flex-col">
        <HrTopbar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
