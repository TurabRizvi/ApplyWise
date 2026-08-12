"use client";

import * as React from "react";
import { Sparkles, Loader2, ScanSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { runAtsAnalysis, type AtsAnalysisResult } from "@/lib/api";
import { useResumeList, ResumeSelect, ResumeListLoading } from "@/components/candidate/resume-select";

const scoreRows = [
  { key: "formattingScore", label: "Formatting" },
  { key: "keywordScore", label: "Keywords" },
  { key: "grammarScore", label: "Grammar" },
  { key: "actionVerbScore", label: "Action Verbs" },
] as const;

function scoreLabel(score: number) {
  if (score >= 85) return { label: "Excellent", color: "text-success" };
  if (score >= 70) return { label: "Very Good", color: "text-success" };
  if (score >= 50) return { label: "Needs Work", color: "text-warning" };
  return { label: "Poor", color: "text-destructive" };
}

export default function AtsAnalyzerPage() {
  const { callAuthed } = useAuth();
  const { resumes, isLoading: loadingResumes } = useResumeList();
  const [selectedId, setSelectedId] = React.useState("");
  const [result, setResult] = React.useState<AtsAnalysisResult | null>(null);
  const [isRunning, setIsRunning] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleRun = async () => {
    if (!selectedId) return;
    setIsRunning(true);
    setError(null);
    setResult(null);
    try {
      const res = await callAuthed((token) => runAtsAnalysis(token, selectedId));
      setResult(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed. Please try again.");
    } finally {
      setIsRunning(false);
    }
  };

  const overall = result ? scoreLabel(result.overallScore) : null;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">ATS Analyzer</h1>
        <p className="text-muted-foreground">
          See how applicant tracking systems score your resume, with specific suggestions to improve it.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4 p-5">
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">Choose a resume to analyze</p>
            {loadingResumes ? (
              <ResumeListLoading />
            ) : (
              <ResumeSelect resumes={resumes} value={selectedId} onChange={setSelectedId} />
            )}
          </div>
          <Button onClick={handleRun} disabled={!selectedId || isRunning}>
            {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Run ATS Analysis
          </Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      {isRunning && (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Analyzing your resume, this takes a few seconds...</p>
          </CardContent>
        </Card>
      )}

      {result && !isRunning && (
        <Card>
          <CardContent className="p-6">
            <div className="mb-6 flex flex-col items-center gap-6 sm:flex-row">
              <div className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-[6px] border-success/20">
                <div className="absolute inset-0 rounded-full border-[6px] border-transparent border-t-success border-r-success" />
                <div className="text-center">
                  <p className="text-3xl font-bold text-foreground">{result.overallScore}</p>
                  <p className={`text-xs font-medium ${overall?.color}`}>{overall?.label}</p>
                </div>
              </div>
              <div className="grid flex-1 grid-cols-2 gap-4">
                {scoreRows.map((row) => (
                  <div key={row.key}>
                    <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                      <span>{row.label}</span>
                      <span className="font-medium text-foreground">{result[row.key]}/100</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted">
                      <div className="h-1.5 rounded-full bg-success" style={{ width: `${result[row.key]}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <SuggestionList title="Missing Keywords" items={result.missingKeywords} />
            <SuggestionList title="Weak Bullet Points" items={result.weakBulletPoints} />
            <SuggestionList title="Formatting Suggestions" items={result.formattingSuggestions} />
            <SuggestionList title="Grammar Suggestions" items={result.grammarSuggestions} />
            <SuggestionList title="Recommended Skills" items={result.recommendedSkills} />
          </CardContent>
        </Card>
      )}

      {!result && !isRunning && (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <ScanSearch className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Select a resume and run the analysis to see your score.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SuggestionList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mb-4 rounded-lg border border-border bg-muted/30 p-4">
      <p className="mb-2 text-sm font-semibold text-foreground">{title}</p>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
            <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
