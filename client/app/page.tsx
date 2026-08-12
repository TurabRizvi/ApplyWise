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
    <div className="min-h-screen bg-background">
      <header className="animate-fade-in-up sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Logo />
          <nav className="hidden items-center gap-7 md:flex">
            <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Features
            </a>
            <a href="#candidates" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              For Candidates
            </a>
            <a href="#hr" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              For HR
            </a>
            <a href="#cta" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Pricing
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
              <Link href="/login">Log in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="hero-glow relative overflow-hidden border-b border-border">
        <div className="container py-16 md:py-24">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              AI-Powered Career &amp; Hiring Platform
            </div>

            <div className="inline-flex rounded-full border border-border bg-card p-1 animate-fade-in-up" style={{ animationDelay: "90ms" }}>
              <button
                onClick={() => setAudience("candidate")}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  audience === "candidate" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                )}
              >
                For Candidates
              </button>
              <button
                onClick={() => setAudience("hr")}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  audience === "hr" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                )}
              >
                For HR Teams
              </button>
            </div>
          </div>

          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div>
              <h1 className="animate-fade-in-up text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
                Better Resumes.
                <br />
                Smarter Hiring.
                <br />
                <span className="bg-brand-gradient bg-clip-text text-transparent">Stronger Futures.</span>
              </h1>
              <p className="mt-6 max-w-lg animate-fade-in-up text-lg text-muted-foreground" style={{ animationDelay: "120ms" }}>
                ApplyWise uses AI to help candidates create ATS-friendly resumes, prep for
                interviews, and track applications — while helping HR teams screen and rank
                candidates faster and more accurately.
              </p>
              <div className="mt-8 flex flex-wrap gap-3 animate-fade-in-up" style={{ animationDelay: "180ms" }}>
                <Button size="lg" asChild>
                  <Link href={audience === "hr" ? "/register?type=hr" : "/register"}>
                    Get Started Free <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="#cta">
                    <Calendar className="mr-1 h-4 w-4" /> Book a Demo
                  </a>
                </Button>
              </div>
              <div className="mt-8 flex items-center gap-3 animate-fade-in-up" style={{ animationDelay: "240ms" }}>
                <div className="flex -space-x-2">
                  {["#7C5CFC", "#4F7CFF", "#22C55E", "#F59E0B"].map((color, i) => (
                    <div
                      key={i}
                      className="h-8 w-8 rounded-full border-2 border-background"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div>
                  <StarRating />
                  <p className="text-xs text-muted-foreground">Trusted by 10,000+ users worldwide</p>
                </div>
              </div>
            </div>

            <div className="relative mx-auto flex w-full max-w-md animate-hero-float flex-col items-start gap-4 xl:max-w-2xl xl:flex-row">
              <div className="animate-fade-in-up w-full xl:flex-1">
                <AtsScoreCard label={audience === "hr" ? "Candidate Match Score" : "Resume Score"} />
              </div>
              <div className="animate-fade-in-up w-full xl:flex-1 [animation-delay:120ms]">
                {audience === "hr" ? <HrSideCard /> : <CandidateSideCard />}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container flex items-center gap-4 py-12">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border" />
        <p className="max-w-[26rem] text-center text-lg font-semibold leading-snug text-foreground sm:max-w-none sm:whitespace-nowrap">
          Everything you need to <span className="text-primary">get hired</span> and
          <br className="sm:hidden" /> <span className="text-primary">hire top talent</span>
        </p>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border" />
      </div>

      <section id="features" className="container pb-20">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {featureIcons.map((f, index) => (
            <div
              key={f.title}
              className="animate-card-rise text-center transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="animate-glow mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-transform duration-200 hover:scale-105">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <p className="mb-1 text-sm font-semibold text-foreground">{f.title}</p>
              <p className="text-xs text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-muted/20 py-20">
        <div className="container">
          <h2 className="mb-12 text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Built for every step of your career &amp; hiring journey
          </h2>

          <div className="relative grid gap-8 md:grid-cols-2 md:gap-16">
            <div className="pointer-events-none absolute inset-x-0 top-1/2 hidden -translate-y-1/2 items-center justify-center md:flex">
              <div className="h-px w-full border-t border-dashed border-border" />
              <div className="absolute flex h-14 w-14 items-center justify-center rounded-full border border-border bg-background shadow-md">
                <Logo showWordmark={false} />
              </div>
            </div>

            <Card id="candidates" className="relative animate-card-rise transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <CardContent className="p-7">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-1.5 text-lg font-semibold text-foreground">For Candidates</h3>
                <p className="mb-5 text-sm text-muted-foreground">
                  Build better resumes, prepare with confidence, and land your dream job.
                </p>
                <ul className="mb-6 space-y-2.5">
                  {candidateChecklist.map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm text-foreground">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button asChild>
                  <Link href="/register">
                    Explore Candidate Features <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card id="hr" className="relative animate-card-rise transition-all duration-300 hover:-translate-y-1 hover:shadow-xl" style={{ animationDelay: "120ms" }}>
              <CardContent className="p-7">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
                  <ListChecks className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-1.5 text-lg font-semibold text-foreground">For HR Teams</h3>
                <p className="mb-5 text-sm text-muted-foreground">
                  Screen, rank, and compare candidates with AI — faster and smarter.
                </p>
                <ul className="mb-6 space-y-2.5">
                  {hrChecklist.map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm text-foreground">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button asChild>
                  <Link href="/register?type=hr">
                    Explore HR Features <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="container py-20">
        <p className="mb-10 text-center text-sm font-medium text-muted-foreground">
          Trusted by thousands of candidates and HR teams
        </p>
        <div className="mb-14 grid grid-cols-2 gap-8 sm:grid-cols-4">
          {stats.map((s, index) => (
            <div key={s.label} className="animate-card-rise text-center" style={{ animationDelay: `${index * 80}ms` }}>
              <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                <s.icon className="h-4 w-4 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-50 grayscale">
          {trustLogos.map((name) => (
            <span key={name} className="text-lg font-bold tracking-tight text-foreground">
              {name}
            </span>
          ))}
        </div>
      </section>

      <section id="cta" className="container pb-24">
        <div className="animate-card-rise rounded-2xl border border-border bg-muted/30 p-8 shadow-sm sm:p-12">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-2xl font-bold tracking-tight text-foreground">Ready to take the next step?</h3>
              <p className="mt-2 text-muted-foreground">
                Join ApplyWise today and experience the power of AI in your career or hiring journey.
              </p>
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success" /> No credit card required
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success" /> Free forever plan
                </span>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link href="/register">
                  Get Started Free <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#cta">
                  <Calendar className="mr-1 h-4 w-4" /> Book a Demo
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-10">
        <div className="container flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Logo />
          <p className="text-sm text-muted-foreground">© 2026 ApplyWise. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
