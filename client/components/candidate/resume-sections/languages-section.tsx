"use client";

import * as React from "react";
import { Plus, X, Loader2, Languages as LanguagesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth-context";
import { addLanguage, deleteLanguage, type Language } from "@/lib/api";

export function LanguagesSection({
  resumeId,
  items,
  onChange,
}: {
  resumeId: string;
  items: Language[];
  onChange: () => void;
}) {
  const { callAuthed } = useAuth();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [form, setForm] = React.useState({ name: "", proficiency: "" });
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [removingId, setRemovingId] = React.useState<string | null>(null);

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError("Language name is required");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      await callAuthed((token) =>
        addLanguage(token, resumeId, { name: form.name.trim(), proficiency: form.proficiency.trim() || null })
      );
      setForm({ name: "", proficiency: "" });
      setDialogOpen(false);
      onChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save this language");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async (id: string) => {
    setRemovingId(id);
    try {
      await callAuthed((token) => deleteLanguage(token, resumeId, id));
      onChange();
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Languages</h3>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" /> Add Language
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-border py-10 text-center">
          <LanguagesIcon className="mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No languages added yet</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((lang) => (
            <span
              key={lang.id}
              className="flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1.5 text-sm text-foreground"
            >
              {lang.name}
              {lang.proficiency && <span className="text-xs text-muted-foreground">({lang.proficiency})</span>}
              <button onClick={() => handleRemove(lang.id)} disabled={removingId === lang.id}>
                {removingId === lang.id ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                )}
              </button>
            </span>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add language</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Language</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Proficiency (optional)</Label>
              <Input placeholder="Native, Fluent, Conversational..." value={form.proficiency} onChange={(e) => setForm({ ...form, proficiency: e.target.value })} />
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
    </div>
  );
}
