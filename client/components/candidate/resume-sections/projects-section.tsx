"use client";

import * as React from "react";
import { Plus, Pencil, Trash2, Loader2, FolderGit2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth-context";
import { addProject, updateProject, deleteProject, type ResumeProject } from "@/lib/api";
import { EmptyState } from "./education-section";

const emptyForm = { name: "", description: "", techStack: "", projectUrl: "" };

export function ProjectsSection({
  resumeId,
  items,
  onChange,
}: {
  resumeId: string;
  items: ResumeProject[];
  onChange: () => void;
}) {
  const { callAuthed } = useAuth();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<ResumeProject | null>(null);
  const [form, setForm] = React.useState(emptyForm);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setError(null);
    setDialogOpen(true);
  };

  const openEdit = (item: ResumeProject) => {
    setEditing(item);
    setForm({
      name: item.name,
      description: item.description ?? "",
      techStack: item.techStack ?? "",
      projectUrl: item.projectUrl ?? "",
    });
    setError(null);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError("Project name is required");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        techStack: form.techStack.trim() || undefined,
        projectUrl: form.projectUrl.trim() || undefined,
      };
      if (editing) {
        await callAuthed((token) => updateProject(token, resumeId, editing.id, payload as any));
      } else {
        await callAuthed((token) => addProject(token, resumeId, payload as any));
      }
      setDialogOpen(false);
      onChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save this project");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await callAuthed((token) => deleteProject(token, resumeId, deleteId));
      onChange();
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Projects</h3>
        <Button size="sm" onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add Project
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState icon={FolderGit2} label="No projects added yet" />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex items-start justify-between gap-4 p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{item.name}</p>
                    {item.projectUrl && (
                      <a href={item.projectUrl} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                  {item.techStack && <p className="text-sm text-muted-foreground">{item.techStack}</p>}
                  {item.description && <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>}
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteId(item.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit project" : "Add project"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Project name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Tech stack</Label>
              <Input placeholder="React, Node.js, PostgreSQL" value={form.techStack} onChange={(e) => setForm({ ...form, techStack: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Project URL (optional)</Label>
              <Input value={form.projectUrl} onChange={(e) => setForm({ ...form, projectUrl: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />} Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this project?</DialogTitle>
            <DialogDescription>This can&apos;t be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />} Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
