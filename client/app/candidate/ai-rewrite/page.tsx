"use client";

import * as React from "react";
import { Wand2, Loader2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { runAtsRewrite, type AtsRewriteResult } from "@/lib/api";
import { useResumeList, ResumeSelect, ResumeListLoading } from "@/components/candidate/resume-select";

export default function AiRewritePage() {
  const { callAuthed } = useAuth();
  const { resumes, isLoading: loadingResumes } = useResumeList();
  const [selectedId, setSelectedId] = React.useState("");
  const [result, setResult] = React.useState<AtsRewriteResult | null>(null);
  const [isRunning, setIsRunning] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  const handleRun = async () => {
    if (!selectedId) return;
    setIsRunning(true);
    setError(null);
    setResult(null);
    try {
      const res = await callAuthed((token) => runAtsRewrite(token, selectedId));
      setResult(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Rewrite failed. Please try again.");
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.rewrittenResume);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">AI Rewrite</h1>
        <p className="text-muted-foreground">
          Get an ATS-optimized rewrite of your resume — stronger verbs, clearer structure, no invented facts.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4 p-5">
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">Choose a resume to rewrite</p>
            {loadingResumes ? (
              <ResumeListLoading />
            ) : (
              <ResumeSelect resumes={resumes} value={selectedId} onChange={setSelectedId} />
            )}
          </div>
          <Button onClick={handleRun} disabled={!selectedId || isRunning}>
            {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            Rewrite with AI
          </Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      {isRunning && (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Rewriting your resume, this takes a few seconds...</p>
          </CardContent>
        </Card>
      )}

      {result && !isRunning && (
        <>
          <Card>
            <CardContent className="p-5">
              <p className="mb-2 text-sm font-semibold text-foreground">Summary of Changes</p>
              <ul className="space-y-1.5">
                {result.summaryOfChanges.map((item, i) => (
                  <li key={i} className="text-sm text-muted-foreground">
                    • {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">Rewritten Resume</p>
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
              <div className="whitespace-pre-wrap rounded-lg bg-muted/40 p-4 text-sm text-foreground">
                {result.rewrittenResume}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
