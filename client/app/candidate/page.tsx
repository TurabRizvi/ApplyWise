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
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { getDashboardStats, type DashboardStats } from "@/lib/api";

const statCards = [
  { key: "resumeCount", label: "Resumes", icon: FileText, bg: "bg-primary/10", color: "text-primary" },
  { key: "applicationsSent", label: "Applications", icon: Send, bg: "bg-blue-500/10", color: "text-blue-500" },
  { key: "interviewsScheduled", label: "Interviews", icon: Calendar, bg: "bg-warning/10", color: "text-warning" },
  { key: "offers", label: "Offers", icon: Briefcase, bg: "bg-success/10", color: "text-success" },
  { key: "rejections", label: "Rejections", icon: XCircle, bg: "bg-destructive/10", color: "text-destructive" },
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

function scoreLabel(score: number) {
  if (score >= 85) return { label: "Excellent", color: "text-success", ring: "border-t-success border-r-success" };
  if (score >= 70) return { label: "Very Good", color: "text-success", ring: "border-t-success border-r-success" };
  if (score >= 50) return { label: "Needs Work", color: "text-warning", ring: "border-t-warning border-r-warning" };
  return { label: "Poor", color: "text-destructive", ring: "border-t-destructive border-r-destructive" };
}

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

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
  const score = stats?.latestScore;
  const overall = score?.overallScore != null ? scoreLabel(score.overallScore) : null;

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
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {statCards.map((card, index) => (
              <Card
                key={card.key}
                className="animate-card-rise border-0 bg-card/95 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <CardContent className="p-4">
                  <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-lg ${card.bg} ${card.color}`}>
                    <card.icon className="h-4.5 w-4.5" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stats?.[card.key] ?? 0}</p>
                  <p className="text-xs text-muted-foreground">{card.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Resume Score — real data from the most recent ATS analysis run */}
            <Card className="animate-card-rise lg:col-span-2 border-0 bg-card/95 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg" style={{ animationDelay: "120ms" }}>
              <CardContent className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <p className="font-semibold text-foreground">Resume Score</p>
                  {score && (
                    <p className="text-xs text-muted-foreground">
                      Last analyzed {timeAgo(score.analyzedAt)}
                    </p>
                  )}
                </div>

                {!score || score.overallScore == null ? (
                  <div className="flex flex-col items-center py-8 text-center">
                    <ScanSearch className="mb-3 h-8 w-8 text-muted-foreground" />
                    <p className="mb-4 text-sm text-muted-foreground">
                      You haven&apos;t run an ATS analysis yet.
                    </p>
                    <Button asChild size="sm">
                      <Link href="/candidate/ats-analyzer">Run ATS Analysis</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-6 sm:flex-row">
                    <div className={`relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-[6px] border-muted ${overall?.ring}`}>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-foreground">{score.overallScore}</p>
                        <p className={`text-xs font-medium ${overall?.color}`}>{overall?.label}</p>
                      </div>
                    </div>
                    <div className="grid flex-1 grid-cols-2 gap-3">
                      {[
                        { label: "Formatting", value: score.formattingScore },
                        { label: "Keywords", value: score.keywordScore },
                        { label: "Grammar", value: score.grammarScore },
                        { label: "Action Verbs", value: score.actionVerbScore },
                      ].map((row) => (
                        <div key={row.label}>
                          <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                            <span>{row.label}</span>
                            <span className="font-medium text-foreground">{row.value ?? "—"}/100</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-muted">
                            <div className="h-1.5 rounded-full bg-success" style={{ width: `${row.value ?? 0}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity — real AiHistory entries, not decorative */}
            <Card className="animate-card-rise border-0 bg-card/95 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg" style={{ animationDelay: "180ms" }}>
              <CardContent className="p-6">
                <p className="mb-4 font-semibold text-foreground">Recent Activity</p>
                {stats?.recentActivity.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No AI activity yet — try one of the features below.</p>
                ) : (
                  <div className="space-y-3">
                    {stats?.recentActivity.map((item, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-foreground">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{timeAgo(item.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action, index) => (
            <Link key={action.label} href={action.href}>
              <Card className="animate-card-rise transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg" style={{ animationDelay: `${index * 70}ms` }}>
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
