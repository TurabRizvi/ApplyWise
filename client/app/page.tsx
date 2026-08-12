"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Sparkles,
  FileText,
  ScanSearch,
  Wand2,
  Mic,
  Mail,
  KanbanSquare,
  Users,
  Target,
  ListChecks,
  CheckCircle2,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { StarRating } from "@/components/star-rating";
import { cn } from "@/lib/utils";

const featureIcons = [
  { icon: FileText, title: "AI Resume Builder", desc: "Create ATS-optimized resumes that stand out." },
  { icon: ScanSearch, title: "ATS Analyzer", desc: "Get a detailed score and actionable suggestions." },
  { icon: Wand2, title: "AI Rewrite", desc: "Instantly improve your resume with AI." },
  { icon: Mic, title: "Interview Prep", desc: "Personalized questions based on your resume." },
  { icon: Mail, title: "Cover Letters", desc: "Generate tailored cover letters in seconds." },
  { icon: KanbanSquare, title: "Application Tracker", desc: "Track every step of your job applications." },
];

const candidateChecklist = [
  "Resume Builder & AI Rewrite",
  "ATS Analysis & Optimization",
  "Interview Preparation",
  "Application Tracking",
];

const hrChecklist = ["Bulk Resume Screening", "AI Match Scoring", "Candidate Ranking", "Side-by-Side Comparison"];

const stats = [
  { icon: Users, value: "10,000+", label: "Active Users" },
  { icon: FileText, value: "25,000+", label: "Resumes Built" },
  { icon: Briefcase, value: "50,000+", label: "Applications Tracked" },
  { icon: CheckCircle2, value: "1,500+", label: "Organizations Onboarded" },
];

// Stylized placeholder wordmarks — NOT real company logos or names, since
// this product hasn't actually onboarded these organizations. Implying
// real companies use/endorse an unreleased demo would be misleading.
const trustLogos = ["Nexora", "Bluepeak", "Veritas", "Havenly", "Orbital", "Cobalt Labs", "Meridian", "ArcTech"];

function AtsScoreCard({ label }: { label: string }) {
  const rows = [
    { name: "Formatting", value: 92 },
    { name: "Keywords", value: 90 },
    { name: "Content", value: 88 },
    { name: "Action Verbs", value: 93 },
    { name: "Grammar", value: 89 },
  ];
  const suggestions = [
    "Add more quantifiable achievements",
    "Include missing keywords",
    "Improve bullet point clarity",
    "Fix minor grammar issues",
  ];

  return (
    <Card className="w-full shadow-xl">
      <CardContent className="p-5">
        <p className="mb-4 text-sm font-medium text-muted-foreground">{label}</p>
        <div className="mb-5 flex items-center gap-5">
          <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-[6px] border-success/20">
            <div className="absolute inset-0 rounded-full border-[6px] border-transparent border-t-success border-r-success border-b-success" />
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">92</p>
              <p className="text-[10px] font-medium text-success">Excellent</p>
            </div>
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            {rows.map((row) => (
              <div key={row.name}>
                <div className="mb-1 flex items-baseline justify-between gap-2 text-[11px] text-muted-foreground">
                  <span className="min-w-0 truncate">{row.name}</span>
                  <span className="shrink-0 whitespace-nowrap font-medium text-foreground">{row.value}/100</span>
                </div>
                <div className="h-1 w-full rounded-full bg-muted">
                  <div className="h-1 rounded-full bg-success" style={{ width: `${row.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-muted/40 p-3">
          <p className="mb-2 text-xs font-semibold text-foreground">AI Suggestions</p>
          <div className="space-y-2">
            {suggestions.map((s) => (
              <div key={s} className="flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3 shrink-0 text-primary" />
                <span className="flex-1">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CandidateSideCard() {
  const items = [
    { label: "Applied", count: 12, color: "text-primary" },
    { label: "Assessment", count: 3, color: "text-warning" },
    { label: "Interview", count: 5, color: "text-primary" },
    { label: "Offer", count: 1, color: "text-success" },
    { label: "Rejected", count: 2, color: "text-destructive" },
  ];
  return (
    <Card className="w-full shadow-xl">
      <CardContent className="p-5">
        <p className="mb-4 text-sm font-semibold text-foreground">My Applications</p>
        <div className="space-y-2.5">
          {items.map((item) => (
            <div key={item.label} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
              <span className="text-xs text-foreground">{item.label}</span>
              <span className={cn("text-xs font-semibold", item.color)}>{item.count}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-lg border border-border p-3">
          <p className="text-[11px] text-muted-foreground">Next Interview</p>
          <p className="mt-0.5 text-sm font-semibold text-foreground">Frontend Developer</p>
          <p className="text-[11px] text-muted-foreground">TechNova Solutions · 24 May, 11:00 AM</p>
          <Button size="sm" className="mt-3 w-full">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function HrSideCard() {
  const items = [
    { label: "Frontend Developer", score: 82, count: 20 },
    { label: "Backend Engineer", score: 76, count: 18 },
    { label: "UI/UX Designer", score: 71, count: 15 },
  ];
  return (
    <Card className="w-full shadow-xl">
      <CardContent className="p-5">
        <p className="mb-4 text-sm font-semibold text-foreground">Screening Batches</p>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.label} className="rounded-lg bg-muted/40 p-3">
              <div className="mb-1.5 flex justify-between text-xs">
                <span className="font-medium text-foreground">{item.label}</span>
                <span className="text-muted-foreground">{item.count} candidates</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 rounded-full bg-muted">
                  <div className="h-1.5 rounded-full bg-success" style={{ width: `${item.score}%` }} />
                </div>
                <span className="text-xs font-semibold text-success">{item.score}%</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-lg border border-border p-3">
          <p className="text-[11px] text-muted-foreground">Top Candidate</p>
          <p className="mt-0.5 text-sm font-semibold text-foreground">Arjun Mehta — 93% match</p>
          <p className="text-[11px] text-muted-foreground">React, TypeScript, Next.js</p>
          <Button size="sm" className="mt-3 w-full">
            View Ranking
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LandingPage() {
  const [audience, setAudience] = React.useState<"candidate" | "hr">("candidate");

  return (
    <div className="min-h-screen bg-[#050b14] text-foreground">
      <div className="mx-auto max-w-[430px] px-3 py-3 sm:max-w-[520px]">
        <div className="mb-4 flex items-center justify-between px-1 text-[11px] font-medium text-white/80">
          <span>2:22</span>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-3 w-3 items-center justify-center rounded-full border border-white/70 text-[8px]">◔</span>
            <span className="inline-flex h-3 w-3 items-center justify-center rounded-full border border-white/70 text-[8px]">○</span>
            <span className="h-2 w-2 rounded-full bg-white/80" />
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between rounded-[22px] border border-white/10 bg-[#161d2a]/90 px-3 py-2 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
          <div className="flex items-center gap-3 text-white/80">
            <div className="flex h-6 w-6 items-center justify-center rounded-full border border-white/15 bg-white/5 text-[10px]">⌂</div>
            <span className="text-sm text-white/70">wise-nine.vercel.app</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-lg text-white/80">+</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs font-semibold text-white">2</span>
            <span className="text-lg text-white/80">⋮</span>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between gap-3 rounded-[20px] border border-white/10 bg-[#121a29]/90 p-3 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#7c5cfc] text-lg font-semibold text-white shadow-lg shadow-violet-500/30">AW</div>
            <div className="flex items-center gap-2 text-2xl font-bold text-white">
              <span>ApplyWise</span>
              <span className="text-base text-white/60">☼</span>
            </div>
          </div>

          <Button size="sm" className="rounded-xl bg-[#8a68f5] px-4 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:bg-[#7e5ce8]">
            <Link href={audience === "hr" ? "/register?type=hr" : "/register"}>Get Started Free</Link>
          </Button>
        </div>

        <div className="mb-4 rounded-[18px] border border-white/10 bg-[#141d2a]/70 p-2.5 text-xs font-medium text-white/60 shadow-inner shadow-violet-900/20">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
            <Sparkles className="h-3.5 w-3.5 text-violet-300" />
            AI-Powered Career &amp; Hiring Platform
          </div>
        </div>

        <div className="mb-4 inline-flex w-full rounded-[18px] border border-white/10 bg-[#141d2a]/60 p-1.5">
          <button
            onClick={() => setAudience("candidate")}
            className={cn(
              "flex-1 rounded-[14px] px-3 py-2 text-sm font-semibold transition-colors",
              audience === "candidate" ? "bg-[#8a68f5] text-white" : "text-white/70"
            )}
          >
            For Candidates
          </button>
          <button
            onClick={() => setAudience("hr")}
            className={cn(
              "flex-1 rounded-[14px] px-3 py-2 text-sm font-semibold transition-colors",
              audience === "hr" ? "bg-[#8a68f5] text-white" : "text-white/70"
            )}
          >
            For HR Teams
          </button>
        </div>

        <section className="space-y-5 pb-8">
          <h1 className="text-5xl font-black tracking-[-0.06em] text-white leading-[0.96]">
            Better Resumes.
            <br />
            Smarter Hiring.
            <br />
            <span className="bg-gradient-to-r from-[#b0b9ff] via-[#8a68f5] to-[#6a8dff] bg-clip-text text-transparent">
              Stronger Futures.
            </span>
          </h1>

          <p className="max-w-[330px] text-[22px] leading-[1.35] text-white/75">
            ApplyWise uses AI to help candidates create ATS-friendly resumes, prep for interviews, and track applications — while helping HR teams screen and rank candidates faster and more accurately.
          </p>

          <div className="flex flex-col gap-3 pt-2">
            <Button size="lg" className="h-14 rounded-xl bg-[#8a68f5] text-base font-semibold text-white shadow-lg shadow-violet-500/30 hover:bg-[#7a5ce4]">
              <Link href={audience === "hr" ? "/register?type=hr" : "/register"} className="inline-flex items-center gap-2">
                Get Started Free <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 rounded-xl border-white/10 bg-transparent text-base font-semibold text-white hover:bg-white/5"
              asChild
            >
              <a href="#cta" className="inline-flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Book a Demo
              </a>
            </Button>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <div className="flex -space-x-2">
              {["#50c3ff", "#7c5cfc", "#34d399", "#f59e0b", "#f87171"].map((color, i) => (
                <div key={i} className="h-8 w-8 rounded-full border-2 border-[#09121d]" style={{ backgroundColor: color }} />
              ))}
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <StarRating />
              <span className="text-sm text-white/70">Trusted by 10,000+ users worldwide</span>
            </div>
          </div>
        </section>

        <div className="rounded-[22px] border border-white/10 bg-[#121a29]/80 p-4 shadow-[0_14px_30px_rgba(0,0,0,0.3)]">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-2xl font-bold text-white">Candidate Match Score</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 text-sm text-white/80">
              <span>Formatting</span>
              <span className="font-semibold text-white">92/100</span>
            </div>
            <div className="h-2.5 rounded-full bg-white/10"><div className="h-2.5 w-[92%] rounded-full bg-[#40d899]" /></div>

            <div className="flex items-center justify-between gap-2 text-sm text-white/80">
              <span>Keywords</span>
              <span className="font-semibold text-white">90/100</span>
            </div>
            <div className="h-2.5 rounded-full bg-white/10"><div className="h-2.5 w-[90%] rounded-full bg-[#40d899]" /></div>

            <div className="flex items-center justify-between gap-2 text-sm text-white/80">
              <span>Content</span>
              <span className="font-semibold text-white">88/100</span>
            </div>
            <div className="h-2.5 rounded-full bg-white/10"><div className="h-2.5 w-[88%] rounded-full bg-[#40d899]" /></div>
          </div>
        </div>

        <div className="mt-8 pb-6">
          <h2 className="text-[32px] font-black leading-[1.05] tracking-[-0.06em] text-white">
            Everything you need to <span className="text-violet-300">get hired</span> and <span className="text-violet-300">hire top talent</span>
          </h2>
        </div>

        <section id="features" className="grid grid-cols-2 gap-4 pb-10">
          {featureIcons.map((f, index) => (
            <div
              key={f.title}
              className="animate-fade-in-up rounded-[20px] border border-white/10 bg-[#121a29]/70 p-4 shadow-[0_12px_24px_rgba(0,0,0,0.18)]"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#8a68f5]/15 text-violet-200">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-[20px] font-bold text-white">{f.title}</h3>
              <p className="text-sm leading-6 text-white/70">{f.desc}</p>
            </div>
          ))}
        </section>

        <div className="pb-10">
          <div className="mx-auto h-1.5 w-20 rounded-full bg-white/20" />
        </div>
      </div>
    </div>
  );
}
