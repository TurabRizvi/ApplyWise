"use client";

import * as React from "react";
import Link from "next/link";
import {
  Plus,
  Upload,
  FileText,
  Copy,
  Trash2,
  Loader2,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth-context";
import {
  listResumes,
  createResume,
  deleteResume,
  duplicateResume,
  uploadResumeFile,
  type ResumeSummary,
} from "@/lib/api";

export default function MyResumesPage() {
  const { callAuthed } = useAuth();
  const [resumes, setResumes] = React.useState<ResumeSummary[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [newTitle, setNewTitle] = React.useState("");
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);
  const [createError, setCreateError] = React.useState<string | null>(null);

  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [pendingActionId, setPendingActionId] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<ResumeSummary | null>(null);

  const loadResumes = React.useCallback(async () => {
    try {
      const res = await callAuthed((token) => listResumes(token));
      setResumes(res.data);
    } catch {
      setError("Couldn't load your resumes. Please refresh.");
    } finally {
      setIsLoading(false);
    }
  }, [callAuthed]);

  React.useEffect(() => {
    loadResumes();
  }, [loadResumes]);

  const handleCreate = async () => {
    if (!newTitle.trim()) {
      setCreateError("Give your resume a title");
      return;
    }
    setIsCreating(true);
    setCreateError(null);
    try {
      await callAuthed((token) => createResume(token, newTitle.trim()));
      setNewTitle("");
      setIsCreateOpen(false);
      await loadResumes();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Couldn't create resume");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setUploadError(null);
    try {
      await callAuthed((token) => uploadResumeFile(token, file));
      await loadResumes();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDuplicate = async (id: string) => {
    setPendingActionId(id);
    try {
      await callAuthed((token) => duplicateResume(token, id));
      await loadResumes();
    } catch {
      setError("Couldn't duplicate that resume. Please try again.");
    } finally {
      setPendingActionId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setPendingActionId(deleteTarget.id);
    try {
      await callAuthed((token) => deleteResume(token, deleteTarget.id));
      setResumes((prev) => prev.filter((r) => r.id !== deleteTarget.id));
    } catch {
      setError("Couldn't delete that resume. Please try again.");
    } finally {
      setPendingActionId(null);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">My Resumes</h1>
          <p className="text-muted-foreground">Build a new one, or upload one you already have.</p>
        </div>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileSelected}
          />
          <Button variant="outline" onClick={handleUploadClick} disabled={isUploading}>
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Upload PDF
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4" /> New Resume
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a new resume</DialogTitle>
                <DialogDescription>Give it a title — you can change this later.</DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="resume-title">Title</Label>
                <Input
                  id="resume-title"
                  placeholder="e.g. Frontend Developer Resume"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                />
                {createError && <p className="text-xs text-destructive">{createError}</p>}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleCreate} disabled={isCreating}>
                  {isCreating && <Loader2 className="h-4 w-4 animate-spin" />}
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {uploadError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {uploadError}
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : resumes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-1 font-semibold text-foreground">No resumes yet</h3>
            <p className="mb-6 max-w-sm text-sm text-muted-foreground">
              Build your first resume from scratch, or upload a PDF you already have to get started.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleUploadClick}>
                <Upload className="h-4 w-4" /> Upload PDF
              </Button>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4" /> New Resume
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resumes.map((resume) => (
            <ResumeCard
              key={resume.id}
              resume={resume}
              isBusy={pendingActionId === resume.id}
              onDuplicate={() => handleDuplicate(resume.id)}
              onDelete={() => setDeleteTarget(resume)}
            />
          ))}
        </div>
      )}

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this resume?</DialogTitle>
            <DialogDescription>
              This will permanently delete &quot;{deleteTarget?.title}&quot; and everything in it. This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={confirmDelete} disabled={pendingActionId === deleteTarget?.id}>
              {pendingActionId === deleteTarget?.id && <Loader2 className="h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ResumeCard({
  resume,
  isBusy,
  onDuplicate,
  onDelete,
}: {
  resume: ResumeSummary;
  isBusy: boolean;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div className="relative">
            <button
              className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
              onClick={() => setMenuOpen((v) => !v)}
              disabled={isBusy}
            >
              {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" />}
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 z-20 mt-1 w-36 rounded-lg border border-border bg-card p-1 shadow-lg">
                  <button
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground hover:bg-accent"
                    onClick={() => {
                      setMenuOpen(false);
                      onDuplicate();
                    }}
                  >
                    <Copy className="h-3.5 w-3.5" /> Duplicate
                  </button>
                  <button
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete();
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        <h3 className="mb-1 truncate font-semibold text-foreground">{resume.title}</h3>
        <p className="mb-4 text-xs text-muted-foreground">
          {resume.isUploaded ? "Uploaded" : "Built"} · Updated {new Date(resume.updatedAt).toLocaleDateString()}
        </p>
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href={`/candidate/resumes/${resume.id}`}>Open</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
