"use client";

import * as React from "react";
import Link from "next/link";
import { FileText, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { listResumes, type ResumeSummary } from "@/lib/api";

export function useResumeList() {
  const { callAuthed } = useAuth();
  const [resumes, setResumes] = React.useState<ResumeSummary[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    callAuthed((token) => listResumes(token))
      .then((res) => !cancelled && setResumes(res.data))
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [callAuthed]);

  return { resumes, isLoading };
}

export function ResumeSelect({
  resumes,
  value,
  onChange,
}: {
  resumes: ResumeSummary[];
  value: string;
  onChange: (id: string) => void;
}) {
  if (resumes.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
        <FileText className="h-4 w-4 shrink-0" />
        You don&apos;t have any resumes yet.{" "}
        <Link href="/candidate/resumes" className="font-medium text-primary hover:underline">
          Create or upload one
        </Link>
        to get started.
      </div>
    );
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 w-full max-w-sm rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <option value="" disabled>
        Select a resume...
      </option>
      {resumes.map((r) => (
        <option key={r.id} value={r.id}>
          {r.title}
        </option>
      ))}
    </select>
  );
}

export function ResumeListLoading() {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" /> Loading your resumes...
    </div>
  );
}
