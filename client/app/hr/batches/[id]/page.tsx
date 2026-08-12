"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Upload, Loader2, FileText, ExternalLink, GitCompare, CheckCircle2, XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useHrAuth } from "@/lib/hr-auth-context";
import {
  getScreeningBatch, bulkUploadResumes, compareCandidates,
  type ScreeningBatch, type ScreenedResume, type BulkUploadResult,
} from "@/lib/api";
import { cn } from "@/lib/utils";

function parseJsonArray(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function scoreColor(score: number | null) {
  if (score === null) return "text-muted-foreground";
  if (score >= 80) return "text-success";
  if (score >= 60) return "text-warning";
  return "text-destructive";
}

export default function BatchDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { callAuthed } = useHrAuth();

  const [batch, setBatch] = React.useState<ScreeningBatch | null>(null);
  const [candidates, setCandidates] = React.useState<ScreenedResume[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadResults, setUploadResults] = React.useState<BulkUploadResult[] | null>(null);

  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [compareOpen, setCompareOpen] = React.useState(false);
  const [compareData, setCompareData] = React.useState<ScreenedResume[] | null>(null);
  const [isComparing, setIsComparing] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      const res = await callAuthed((token) => getScreeningBatch(token, params.id));
      setBatch(res.data.batch);
      setCandidates(res.data.candidates);
    } catch {
      setError("Couldn't load this batch. It may not exist or may not belong to your organization.");
    } finally {
      setIsLoading(false);
    }
  }, [callAuthed, params.id]);

  React.useEffect(() => {
    load();
  }, [load]);

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    if (files.length > 20) {
      setError("You can upload up to 20 resumes at a time.");
      return;
    }
    setIsUploading(true);
    setError(null);
    setUploadResults(null);
    try {
      const res = await callAuthed((token) => bulkUploadResumes(token, params.id, files));
      setUploadResults(res.data.results);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCompare = async () => {
    if (selectedIds.size < 2) {
      setError("Select at least 2 candidates to compare.");
      return;
    }
    setIsComparing(true);
    setError(null);
    try {
      const res = await callAuthed((token) => compareCandidates(token, params.id, Array.from(selectedIds)));
      setCompareData(res.data);
      setCompareOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't compare these candidates.");
    } finally {
      setIsComparing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/hr/batches")}>
          <ArrowLeft className="h-4 w-4" /> Back to Batches
        </Button>
        <Card>
          <CardContent className="py-10 text-center text-sm text-destructive">
            {error ?? "Batch not found."}
          </CardContent>
        </Card>
      </div>
    );
  }

  const sortedCandidates = [...candidates].sort((a, b) => (b.atsScore ?? 0) - (a.atsScore ?? 0));

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" onClick={() => router.push("/hr/batches")}>
          <ArrowLeft className="h-4 w-4" /> Back to Batches
        </Button>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground">{batch.jobTitle}</h1>
        <p className="text-muted-foreground">{candidates.length} candidates screened</p>
      </div>

      {batch.jobDescription && (
        <Card>
          <CardContent className="p-5">
            <p className="mb-2 text-sm font-semibold text-foreground">Job Description</p>
            <p className="max-h-32 overflow-y-auto text-sm text-muted-foreground">{batch.jobDescription}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-foreground">Bulk Upload Resumes</p>
              <p className="text-sm text-muted-foreground">Up to 20 PDFs at once — each is scored independently.</p>
            </div>
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                multiple
                className="hidden"
                onChange={handleFilesSelected}
              />
              <Button onClick={handleUploadClick} disabled={isUploading}>
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Upload Resumes
              </Button>
              <Button
                variant="outline"
                onClick={handleCompare}
                disabled={selectedIds.size < 2 || isComparing}
              >
                {isComparing ? <Loader2 className="h-4 w-4 animate-spin" /> : <GitCompare className="h-4 w-4" />}
                Compare Selected ({selectedIds.size})
              </Button>
            </div>
          </div>

          {isUploading && (
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Extracting text and scoring each resume — this can take a moment for larger batches.
            </div>
          )}

          {uploadResults && !isUploading && (
            <div className="mt-4 space-y-1.5 rounded-lg border border-border bg-muted/30 p-3">
              <p className="mb-2 text-xs font-semibold text-foreground">Upload results</p>
              {uploadResults.map((r, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  {r.success ? (
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 shrink-0 text-destructive" />
                  )}
                  <span className="text-foreground">{r.fileName}</span>
                  {!r.success && <span className="text-muted-foreground">— {r.error}</span>}
                </div>
              ))}
            </div>
          )}

          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      {sortedCandidates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <FileText className="mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No resumes uploaded to this batch yet.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="w-10 p-3"></th>
                    <th className="p-3">Candidate</th>
                    <th className="p-3">Score</th>
                    <th className="p-3">Matched Skills</th>
                    <th className="p-3">Gaps</th>
                    <th className="p-3">Resume</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedCandidates.map((c, i) => (
                    <tr key={c.id} className="border-b border-border last:border-0">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(c.id)}
                          onChange={() => toggleSelected(c.id)}
                          className="h-4 w-4 rounded border-input"
                        />
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {i === 0 && <span className="text-xs">🏆</span>}
                          <span className="font-medium text-foreground">{c.candidateName ?? "Unnamed"}</span>
                        </div>
                      </td>
                      <td className={cn("p-3 font-semibold", scoreColor(c.atsScore))}>
                        {c.atsScore !== null ? `${c.atsScore}%` : "—"}
                      </td>
                      <td className="max-w-[200px] p-3 text-xs text-muted-foreground">
                        {parseJsonArray(c.matchedSkills).slice(0, 3).join(", ") || "—"}
                      </td>
                      <td className="max-w-[200px] p-3 text-xs text-muted-foreground">
                        {parseJsonArray(c.gaps).slice(0, 3).join(", ") || "—"}
                      </td>
                      <td className="p-3">
                        <a href={c.fileUrl} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Candidate Comparison</DialogTitle>
            <DialogDescription>Side-by-side view of your selected candidates.</DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-x-auto overflow-y-auto">
            {compareData && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="p-2">Candidate</th>
                    <th className="p-2">Score</th>
                    <th className="p-2">Matched Skills</th>
                    <th className="p-2">Gaps</th>
                  </tr>
                </thead>
                <tbody>
                  {compareData
                    .sort((a, b) => (b.atsScore ?? 0) - (a.atsScore ?? 0))
                    .map((c) => (
                      <tr key={c.id} className="border-b border-border last:border-0 align-top">
                        <td className="p-2 font-medium text-foreground">{c.candidateName ?? "Unnamed"}</td>
                        <td className={cn("p-2 font-semibold", scoreColor(c.atsScore))}>
                          {c.atsScore !== null ? `${c.atsScore}%` : "—"}
                        </td>
                        <td className="p-2 text-xs text-muted-foreground">
                          {parseJsonArray(c.matchedSkills).join(", ") || "—"}
                        </td>
                        <td className="p-2 text-xs text-muted-foreground">
                          {parseJsonArray(c.gaps).join(", ") || "—"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
