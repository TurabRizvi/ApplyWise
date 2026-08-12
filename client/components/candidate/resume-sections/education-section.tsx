"use client";

import * as React from "react";
import { Plus, Pencil, Trash2, Loader2, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth-context";
import { addEducation, updateEducation, deleteEducation, type Education } from "@/lib/api";

const emptyForm = { institution: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "", description: "" };

export function EducationSection({
  resumeId,
  items,
  onChange,
}: {
  resumeId: string;
  items: Education[];
  onChange: () => void;
}) {
  const { callAuthed } = useAuth();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Education | null>(null);
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

  const openEdit = (item: Education) => {
    setEditing(item);
    setForm({
      institution: item.institution,
      degree: item.degree,
      fieldOfStudy: item.fieldOfStudy ?? "",
      startDate: item.startDate?.slice(0, 10) ?? "",
      endDate: item.endDate?.slice(0, 10) ?? "",
      description: item.description ?? "",
    });
    setError(null);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.institution.trim() || !form.degree.trim()) {
      setError("Institution and degree are required");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const payload = {
        institution: form.institution.trim(),
        degree: form.degree.trim(),
        fieldOfStudy: form.fieldOfStudy.trim() || undefined,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        description: form.description.trim() || undefined,
      };
      if (editing) {
        await callAuthed((token) => updateEducation(token, resumeId, editing.id, payload as any));
      } else {
        await callAuthed((token) => addEducation(token, resumeId, payload as any));
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
      await callAuthed((token) => deleteEducation(token, resumeId, deleteId));
      onChange();
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Education</h3>
        <Button size="sm" onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add Education
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState icon={GraduationCap} label="No education added yet" />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex items-start justify-between gap-4 p-4">
                <div>
                  <p className="font-medium text-foreground">{item.degree}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.institution}
                    {item.fieldOfStudy ? ` · ${item.fieldOfStudy}` : ""}
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
            <DialogTitle>{editing ? "Edit education" : "Add education"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Institution</Label>
              <Input value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Degree</Label>
              <Input value={form.degree} onChange={(e) => setForm({ ...form, degree: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Field of study</Label>
              <Input value={form.fieldOfStudy} onChange={(e) => setForm({ ...form, fieldOfStudy: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Start date</Label>
                <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>End date</Label>
                <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
              </div>
            </div>
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

export function EmptyState({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center py-10 text-center">
        <Icon className="mb-2 h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}
