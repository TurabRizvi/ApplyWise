"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, FolderKanban, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { useHrAuth } from "@/lib/hr-auth-context";
import { createScreeningBatch, listScreeningBatches, type ScreeningBatch } from "@/lib/api";

export default function ScreeningBatchesPage() {
  const { callAuthed } = useHrAuth();
  const [batches, setBatches] = React.useState<ScreeningBatch[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [jobTitle, setJobTitle] = React.useState("");
  const [jobDescription, setJobDescription] = React.useState("");
  const [isCreating, setIsCreating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadBatches = React.useCallback(async () => {
    try {
      const res = await callAuthed((token) => listScreeningBatches(token));
      setBatches(res.data);
    } finally {
      setIsLoading(false);
    }
  }, [callAuthed]);

  React.useEffect(() => {
    loadBatches();
  }, [loadBatches]);

  const handleCreate = async () => {
    if (!jobTitle.trim() || jobDescription.trim().length < 20) {
      setError("Job title is required, and the description should be at least 20 characters.");
      return;
    }
    setIsCreating(true);
    setError(null);
    try {
      await callAuthed((token) =>
        createScreeningBatch(token, { jobTitle: jobTitle.trim(), jobDescription: jobDescription.trim() })
      );
      setJobTitle("");
      setJobDescription("");
      setDialogOpen(false);
      await loadBatches();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create this batch");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Screening Batches</h1>
          <p className="text-muted-foreground">Each batch is a job description you&apos;re screening candidates against.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" /> New Batch
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a screening batch</DialogTitle>
              <DialogDescription>Paste the job description — you&apos;ll upload resumes to screen against it next.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Job title</Label>
                <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Frontend Developer" />
              </div>
              <div className="space-y-1.5">
                <Label>Job description</Label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={6}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
              <Button onClick={handleCreate} disabled={isCreating}>
                {isCreating && <Loader2 className="h-4 w-4 animate-spin" />} Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : batches.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <FolderKanban className="mb-4 h-10 w-10 text-muted-foreground" />
            <h3 className="mb-1 font-semibold text-foreground">No screening batches yet</h3>
            <p className="mb-6 max-w-sm text-sm text-muted-foreground">
              Create one, paste the job description, then bulk-upload resumes to have them scored and ranked automatically.
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4" /> Create Your First Batch
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {batches.map((batch) => (
            <Link key={batch.id} href={`/hr/batches/${batch.id}`}>
              <Card className="transition-colors hover:border-primary/50">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium text-foreground">{batch.jobTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      {batch._count?.candidates ?? 0} candidates · Created{" "}
                      {new Date(batch.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
