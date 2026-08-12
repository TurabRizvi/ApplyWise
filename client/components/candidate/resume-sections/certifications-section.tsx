"use client";

import * as React from "react";
import { Plus, Trash2, Loader2, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth-context";
import { addCertification, deleteCertification, type Certification } from "@/lib/api";
import { EmptyState } from "./education-section";

export function CertificationsSection({
  resumeId,
  items,
  onChange,
}: {
  resumeId: string;
  items: Certification[];
  onChange: () => void;
}) {
  const { callAuthed } = useAuth();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [form, setForm] = React.useState({ name: "", issuer: "", issueDate: "" });
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [removingId, setRemovingId] = React.useState<string | null>(null);

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError("Certification name is required");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      await callAuthed((token) =>
        addCertification(token, resumeId, {
          name: form.name.trim(),
          issuer: form.issuer.trim() || null,
          issueDate: form.issueDate || null,
        })
      );
      setForm({ name: "", issuer: "", issueDate: "" });
      setDialogOpen(false);
      onChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save this certification");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async (id: string) => {
    setRemovingId(id);
    try {
      await callAuthed((token) => deleteCertification(token, resumeId, id));
      onChange();
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Certifications</h3>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" /> Add Certification
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState icon={Award} label="No certifications added yet" />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-foreground">{item.name}</p>
                  {item.issuer && <p className="text-sm text-muted-foreground">{item.issuer}</p>}
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleRemove(item.id)} disabled={removingId === item.id}>
                  {removingId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add certification</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Issuer</Label>
              <Input value={form.issuer} onChange={(e) => setForm({ ...form, issuer: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Issue date</Label>
              <Input type="date" value={form.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value })} />
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
