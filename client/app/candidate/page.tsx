"use client";

import * as React from "react";
import Link from "next/link";
import {
  FileText,
  Send,
  Calendar,
  Briefcase,
  XCircle,
  Loader2,
  ScanSearch,
  Wand2,
  Mic,
  Mail,
  KanbanSquare,
  Upload,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { getDashboardStats, type DashboardStats } from "@/lib/api";

const statCards = [
  { key: "resumeCount", label: "Resumes", icon: FileText, color: "text-primary" },
  { key: "applicationsSent", label: "Applications", icon: Send, color: "text-primary" },
  { key: "interviewsScheduled", label: "Interviews", icon: Calendar, color: "text-warning" },
  { key: "offers", label: "Offers", icon: Briefcase, color: "text-success" },
  { key: "rejections", label: "Rejections", icon: XCircle, color: "text-destructive" },
] as const;

const quickActions = [
  { href: "/candidate/resumes", label: "Build New Resume", desc: "Create from scratch", icon: FileText },
  { href: "/candidate/resumes", label: "Upload Resume", desc: "Improve an existing one", icon: Upload },
  { href: "/candidate/ats-analyzer", label: "ATS Analyzer", desc: "Score your resume", icon: ScanSearch },
  { href: "/candidate/ai-rewrite", label: "AI Rewrite", desc: "Enhance with AI", icon: Wand2 },
  { href: "/candidate/interview-prep", label: "Interview Prep", desc: "Practice questions", icon: Mic },
  { href: "/candidate/cover-letters", label: "Cover Letter", desc: "Generate with AI", icon: Mail },
  { href: "/candidate/applications", label: "Track Applications", desc: "View all applications", icon: KanbanSquare },
];

export default function CandidateDashboardPage() {
  const { profile, callAuthed } = useAuth();
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await callAuthed((token) => getDashboardStats(token));
        if (!cancelled) setStats(res.data);
      } catch {
        if (!cancelled) setError("Couldn't load your dashboard stats. Please refresh.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [callAuthed]);

  const firstName = profile?.fullName?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome back, {firstName} 👋</h1>
        <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your job search.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {statCards.map((card) => (
            <Card key={card.key}>
              <CardContent className="p-4">
                <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 ${card.color}`}>
                  <card.icon className="h-4.5 w-4.5" />
                </div>
                <p className="text-2xl font-bold text-foreground">{stats?.[card.key] ?? 0}</p>
                <p className="text-xs text-muted-foreground">{card.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <Link key={action.label} href={action.href}>
              <Card className="transition-colors hover:border-primary/50">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <action.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{action.label}</p>
                    <p className="text-xs text-muted-foreground">{action.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
