"use client";

import * as React from "react";
import { Mail, Loader2, Copy, Check, ChevronDown, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { generateCoverLetter, listCoverLetters, type CoverLetterRecord } from "@/lib/api";
import { useResumeList, ResumeSelect, ResumeListLoading } from "@/components/candidate/resume-select";

export default function CoverLettersPage() {
  const { callAuthed } = useAuth();
  const { resumes, isLoading: loadingResumes } = useResumeList();
  const [resumeId, setResumeId] = React.useState("");
  const [companyName, setCompanyName] = React.useState("");
  const [jobTitle, setJobTitle] = React.useState("");
  const [jobDescription, setJobDescription] = React.useState("");
  const [content, setContent] = React.useState<string | null>(null);
  const [isRunning, setIsRunning] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  const [history, setHistory] = React.useState<CoverLetterRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = React.useState(true);

  const loadHistory = React.useCallback(async () => {
    try {
      const res = await callAuthed((token) => listCoverLetters(token));
      setHistory(res.data);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [callAuthed]);

  React.useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const canGenerate = resumeId && companyName.trim() && jobTitle.trim() && jobDescription.trim().length >= 20;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setIsRunning(true);
    setError(null);
    setContent(null);
    try {
      const res = await callAuthed((token) =>
        generateCoverLetter(token, {
          resumeId,
          companyName: companyName.trim(),
          jobTitle: jobTitle.trim(),
          jobDescription: jobDescription.trim(),
        })
      );
      setContent(res.data.content);
      await loadHistory(); // refresh so the new one shows up below immediately
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't generate a cover letter. Please try again.");
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Cover Letters</h1>
        <p className="text-muted-foreground">Generate a tailored cover letter from a job description in seconds.</p>
      </div>

      <Card>
        <CardContent className="space-y-4 p-5">
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">Resume to base this on</p>
            {loadingResumes ? (
              <ResumeListLoading />
            ) : (
              <ResumeSelect resumes={resumes} value={resumeId} onChange={setResumeId} />
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Company name</Label>
              <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Acme Corp" />
            </div>
            <div className="space-y-1.5">
              <Label>Job title</Label>
              <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Frontend Developer" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Job description</Label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={6}
              placeholder="Paste the job description here..."
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <Button onClick={handleGenerate} disabled={!canGenerate || isRunning}>
            {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
            Generate Cover Letter
          </Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      {isRunning && (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Writing your cover letter...</p>
          </CardContent>
        </Card>
      )}

      {content && !isRunning && (
        <Card>
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Your Cover Letter</p>
              <Button variant="outline" size="sm" onClick={() => handleCopy(content)}>
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <div className="whitespace-pre-wrap rounded-lg bg-muted/40 p-4 text-sm text-foreground">{content}</div>
          </CardContent>
        </Card>
      )}

      <div>
        <div className="mb-3 flex items-center gap-2">
          <History className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground">Previously Generated</h2>
        </div>
        {isLoadingHistory ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading history...
          </div>
        ) : history.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              You haven&apos;t generated any cover letters yet.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {history.map((letter) => (
              <CoverLetterHistoryItem key={letter.id} letter={letter} onCopy={handleCopy} copied={copied} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CoverLetterHistoryItem({
  letter,
  onCopy,
  copied,
}: {
  letter: CoverLetterRecord;
  onCopy: (text: string) => void;
  copied: boolean;
}) {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <Card>
      <button
        className="flex w-full items-center justify-between p-4 text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <div>
          <p className="text-sm font-medium text-foreground">
            {letter.jobTitle} — {letter.companyName}
          </p>
          <p className="text-xs text-muted-foreground">{new Date(letter.createdAt).toLocaleDateString()}</p>
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>
      {expanded && (
        <CardContent className="pt-0">
          <div className="mb-2 flex justify-end">
            <Button variant="outline" size="sm" onClick={() => onCopy(letter.content)}>
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <div className="whitespace-pre-wrap rounded-lg bg-muted/40 p-4 text-sm text-foreground">
            {letter.content}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
