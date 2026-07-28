import Link from "next/link";
import { ArrowRight, FileText, Sparkles, Mic, Mail, KanbanSquare, Users, ScanSearch, GitCompare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

const candidateFeatures = [
  { icon: FileText, title: "Resume Builder", desc: "Build a clean, structured resume section by section, or upload one you already have." },
  { icon: ScanSearch, title: "ATS Analyzer", desc: "See exactly how applicant tracking systems score your resume — formatting, keywords, grammar, action verbs." },
  { icon: Sparkles, title: "AI Rewrite", desc: "Get an ATS-optimized rewrite of your resume, without inventing facts you didn't already have." },
  { icon: Mic, title: "Interview Prep", desc: "Practice with questions generated from your actual resume, not generic question banks." },
  { icon: Mail, title: "Cover Letters", desc: "Generate a tailored cover letter for any job in seconds, ready to edit and send." },
  { icon: KanbanSquare, title: "Application Tracker", desc: "Track every application from wishlist to offer, all in one place." },
];

const hrFeatures = [
  { icon: Users, title: "Bulk Screening", desc: "Upload dozens of resumes at once — one bad file never blocks the rest of the batch." },
  { icon: ScanSearch, title: "AI Ranking", desc: "Every resume scored and ranked against your job description automatically." },
  { icon: GitCompare, title: "Candidate Comparison", desc: "Put your shortlist side by side — score, matched skills, and gaps at a glance." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-border">
        <div className="container flex h-16 items-center justify-between">
          <Logo />
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#candidates" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              For Candidates
            </a>
            <a href="#recruiters" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              For Recruiters
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-grid relative overflow-hidden border-b border-border">
        <div className="container grid gap-12 py-20 md:grid-cols-2 md:items-center md:py-28">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              AI-powered, for candidates and recruiters
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Resumes that pass the bots.
              <br />
              Hiring that isn&apos;t guesswork.
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted-foreground">
              ApplyWise scores and rewrites your resume for real ATS systems, preps you for
              interviews based on what&apos;s actually on it, and helps recruiters screen
              candidates in seconds instead of hours.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link href="/register">
                  Build my resume <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/register?type=hr">I&apos;m hiring</Link>
              </Button>
            </div>
          </div>

          {/* Signature visual: the resume score gauge, echoing the real
              product's dashboard — this is the platform's most concrete,
              trust-building moment, so it leads the page. */}
          <div className="relative mx-auto w-full max-w-sm">
            <Card className="shadow-xl">
              <CardContent className="p-6">
                <p className="mb-1 text-sm font-medium text-muted-foreground">Resume Score</p>
                <p className="mb-4 text-xs text-muted-foreground">Last analyzed just now</p>
                <div className="flex items-center gap-6">
                  <div className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-[6px] border-success/25">
                    <div className="absolute inset-0 rounded-full border-[6px] border-transparent border-t-success border-r-success" />
                    <div className="text-center">
                      <p className="text-3xl font-bold text-foreground">86</p>
                      <p className="text-[10px] font-medium text-success">Very Good</p>
                    </div>
                  </div>
                  <div className="flex-1 space-y-2.5">
                    {[
                      { label: "Formatting", value: 90 },
                      { label: "Keywords", value: 85 },
                      { label: "Action Verbs", value: 80 },
                    ].map((row) => (
                      <div key={row.label}>
                        <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                          <span>{row.label}</span>
                          <span className="font-medium text-foreground">{row.value}/100</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-muted">
                          <div
                            className="h-1.5 rounded-full bg-success"
                            style={{ width: `${row.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Candidate features */}
      <section id="candidates" className="container py-20">
        <div className="mb-12 max-w-xl">
          <p className="mb-2 text-sm font-medium text-primary">For candidates</p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Everything you need to land the interview
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {candidateFeatures.map((f) => (
            <Card key={f.title}>
              <CardContent className="p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-1.5 font-semibold text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* HR features */}
      <section id="recruiters" className="border-t border-border bg-muted/30 py-20">
        <div className="container">
          <div className="mb-12 max-w-xl">
            <p className="mb-2 text-sm font-medium text-primary">For recruiters</p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Screen candidates in seconds, not hours
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {hrFeatures.map((f) => (
              <Card key={f.title}>
                <CardContent className="p-6">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mb-1.5 font-semibold text-foreground">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-10">
            <Button size="lg" asChild>
              <Link href="/register?type=hr">
                Start screening candidates <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="container flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Logo />
          <p className="text-sm text-muted-foreground">© 2026 ApplyWise. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
