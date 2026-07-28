import Link from "next/link";
import { CheckCircle2, Sparkles } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { StarRating } from "@/components/star-rating";

const highlights = [
  "AI-powered ATS scoring & resume rewrites",
  "Interview prep personalized to your resume",
  "One-click cover letters and application tracking",
];

export function AuthSplitLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel — hidden on small screens to keep the form the focus on mobile */}
      <div className="hero-glow relative hidden flex-col justify-between overflow-hidden bg-muted/30 p-10 lg:flex">
        <Link href="/">
          <Logo />
        </Link>

        <div className="max-w-md">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            AI-Powered Career &amp; Hiring Platform
          </div>
          <h2 className="mb-6 text-3xl font-bold leading-tight tracking-tight text-foreground">
            Better resumes. Smarter hiring.{" "}
            <span className="bg-brand-gradient bg-clip-text text-transparent">Stronger futures.</span>
          </h2>
          <ul className="space-y-3">
            {highlights.map((h) => (
              <li key={h} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {h}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {["#7C5CFC", "#4F7CFF", "#22C55E", "#F59E0B"].map((color, i) => (
              <div key={i} className="h-8 w-8 rounded-full border-2 border-background" style={{ backgroundColor: color }} />
            ))}
          </div>
          <div>
            <StarRating />
            <p className="text-xs text-muted-foreground">Trusted by 10,000+ users worldwide</p>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="relative flex flex-col items-center justify-center px-4 py-12">
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>
        <Link href="/" className="mb-8 lg:hidden">
          <Logo />
        </Link>
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
