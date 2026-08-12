"use client";

import * as React from "react";
import { Plus, Pencil, Trash2, Loader2, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth-context";
import { addExperience, updateExperience, deleteExperience, type Experience } from "@/lib/api";
import { EmptyState } from "./education-section";

const emptyForm = { company: "", role: "", startDate: "", endDate: "", isCurrent: false, description: "" };

export function ExperienceSection({
  resumeId,
  items,
  onChange,
}: {
  resumeId: string;
  items: Experience[];
  onChange: () => void;
}) {
  const { callAuthed } = useAuth();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Experience | null>(null);
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

  const openEdit = (item: Experience) => {
    setEditing(item);
    setForm({
      company: item.company,
      role: item.role,
      startDate: item.startDate?.slice(0, 10) ?? "",
      endDate: item.endDate?.slice(0, 10) ?? "",
      isCurrent: item.isCurrent,
      description: item.description ?? "",
    });
    setError(null);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.company.trim() || !form.role.trim()) {
      setError("Company and role are required");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const payload = {
        company: form.company.trim(),
        role: form.role.trim(),
        startDate: form.startDate || undefined,
        endDate: form.isCurrent ? undefined : form.endDate || undefined,
        isCurrent: form.isCurrent,
        description: form.description.trim() || undefined,
      };
      if (editing) {
        await callAuthed((token) => updateExperience(token, resumeId, editing.id, payload as any));
      } else {
        await callAuthed((token) => addExperience(token, resumeId, payload as any));
      }
      setDialogOpen(false);
      onChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save this entry");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await callAuthed((token) => deleteExperience(token, resumeId, deleteId));
      onChange();
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Experience</h3>
        <Button size="sm" onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add Experience
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState icon={Briefcase} label="No experience added yet" />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex items-start justify-between gap-4 p-4">
                <div>
                  <p className="font-medium text-foreground">{item.role}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.company} {item.isCurrent && "· Current"}
                  </p>
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
            <DialogTitle>{editing ? "Edit experience" : "Add experience"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Company</Label>
              <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Start date</Label>
                <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>End date</Label>
                <Input
                  type="date"
                  value={form.endDate}
                  disabled={form.isCurrent}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={form.isCurrent}
                onChange={(e) => setForm({ ...form, isCurrent: e.target.checked })}
                className="h-4 w-4 rounded border-input"
              />
              I currently work here
            </label>
            <div className="space-y-1.5">
              <Label>Description (optional)</Label>
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
            <DialogTitle>Delete this entry?</DialogTitle>
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
