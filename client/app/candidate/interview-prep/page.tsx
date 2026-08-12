"use client";

import * as React from "react";
import { Mic, Loader2, Code2, Users, Laptop } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { runInterviewPrep, type InterviewQuestion } from "@/lib/api";
import { useResumeList, ResumeSelect, ResumeListLoading } from "@/components/candidate/resume-select";

const categoryMeta = {
  TECHNICAL: { label: "Technical", icon: Laptop },
  HR: { label: "HR", icon: Users },
  CODING: { label: "Coding", icon: Code2 },
} as const;

export default function InterviewPrepPage() {
  const { callAuthed } = useAuth();
  const { resumes, isLoading: loadingResumes } = useResumeList();
  const [selectedId, setSelectedId] = React.useState("");
  const [questions, setQuestions] = React.useState<InterviewQuestion[] | null>(null);
  const [isRunning, setIsRunning] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleRun = async () => {
    if (!selectedId) return;
    setIsRunning(true);
    setError(null);
    setQuestions(null);
    try {
      const res = await callAuthed((token) => runInterviewPrep(token, selectedId));
      setQuestions(res.data.questions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't generate questions. Please try again.");
    } finally {
      setIsRunning(false);
    }
  };

  const grouped = questions
    ? (["TECHNICAL", "HR", "CODING"] as const).map((cat) => ({
        category: cat,
        items: questions.filter((q) => q.category === cat),
      }))
    : [];

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Interview Prep</h1>
        <p className="text-muted-foreground">
          Practice with questions generated from your actual resume — not a generic question bank.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4 p-5">
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">Choose a resume</p>
            {loadingResumes ? (
              <ResumeListLoading />
            ) : (
              <ResumeSelect resumes={resumes} value={selectedId} onChange={setSelectedId} />
            )}
          </div>
          <Button onClick={handleRun} disabled={!selectedId || isRunning}>
            {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}
            Generate Questions
          </Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      {isRunning && (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Generating personalized questions...</p>
          </CardContent>
        </Card>
      )}

      {questions && !isRunning && (
        <div className="space-y-4">
          {grouped.map(
            (group) =>
              group.items.length > 0 && (
                <Card key={group.category}>
                  <CardContent className="p-5">
                    <div className="mb-3 flex items-center gap-2">
                      {React.createElement(categoryMeta[group.category].icon, { className: "h-4 w-4 text-primary" })}
                      <p className="font-semibold text-foreground">{categoryMeta[group.category].label} Questions</p>
                    </div>
                    <ol className="space-y-3">
                      {group.items.map((q, i) => (
                        <li key={i} className="flex gap-3 text-sm text-foreground">
                          <span className="font-medium text-muted-foreground">{i + 1}.</span>
                          {q.question}
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              )
          )}
        </div>
      )}
    </div>
  );
}
