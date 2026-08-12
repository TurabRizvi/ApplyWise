"use client";

import * as React from "react";
import { Plus, Loader2, Trash2, Pencil, ExternalLink, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth-context";
import {
  listApplications, createApplication, updateApplication, deleteApplication,
  type JobApplication, type ApplicationStatus,
} from "@/lib/api";
import { cn } from "@/lib/utils";

const statuses: { key: ApplicationStatus; label: string }[] = [
  { key: "WISHLIST", label: "Wishlist" },
  { key: "APPLIED", label: "Applied" },
  { key: "ASSESSMENT", label: "Assessment" },
  { key: "INTERVIEW", label: "Interview" },
  { key: "OFFER", label: "Offer" },
  { key: "ACCEPTED", label: "Accepted" },
  { key: "REJECTED", label: "Rejected" },
];

const emptyForm = {
  companyName: "", position: "", jobUrl: "", location: "", salary: "",
  status: "WISHLIST" as ApplicationStatus, notes: "", dateApplied: "",
};

export default function ApplicationsPage() {
  const { callAuthed } = useAuth();
  const [applications, setApplications] = React.useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<JobApplication | null>(null);
  const [form, setForm] = React.useState(emptyForm);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<JobApplication | null>(null);
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  const load = React.useCallback(
    async (searchTerm?: string) => {
      setIsLoading(true);
      try {
        const res = await callAuthed((token) => listApplications(token, searchTerm ? { search: searchTerm } : undefined));
        setApplications(res.data);
      } finally {
        setIsLoading(false);
      }
    },
    [callAuthed]
  );

  React.useEffect(() => {
    load();
  }, [load]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    load(search);
  };

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setError(null);
    setDialogOpen(true);
  };

  const openEdit = (app: JobApplication) => {
    setEditing(app);
    setForm({
      companyName: app.companyName,
      position: app.position,
      jobUrl: app.jobUrl ?? "",
      location: app.location ?? "",
      salary: app.salary ?? "",
      status: app.status,
      notes: app.notes ?? "",
      dateApplied: app.dateApplied?.slice(0, 10) ?? "",
    });
    setError(null);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.companyName.trim() || !form.position.trim()) {
      setError("Company and position are required");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const payload = {
        companyName: form.companyName.trim(),
        position: form.position.trim(),
        jobUrl: form.jobUrl.trim() || undefined,
        location: form.location.trim() || undefined,
        salary: form.salary.trim() || undefined,
        status: form.status,
        notes: form.notes.trim() || undefined,
        dateApplied: form.dateApplied || undefined,
      };
      if (editing) {
        await callAuthed((token) => updateApplication(token, editing.id, payload as any));
      } else {
        await callAuthed((token) => createApplication(token, payload as any));
      }
      setDialogOpen(false);
      await load(search);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save this application");
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (app: JobApplication, status: ApplicationStatus) => {
    setPendingId(app.id);
    try {
      await callAuthed((token) => updateApplication(token, app.id, { status }));
      setApplications((prev) => prev.map((a) => (a.id === app.id ? { ...a, status } : a)));
    } finally {
      setPendingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setPendingId(deleteTarget.id);
    try {
      await callAuthed((token) => deleteApplication(token, deleteTarget.id));
      setApplications((prev) => prev.filter((a) => a.id !== deleteTarget.id));
    } finally {
      setPendingId(null);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Application Tracker</h1>
          <p className="text-muted-foreground">Track every application from wishlist to offer.</p>
        </div>
        <div className="flex gap-2">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search company or role..."
                className="w-56 pl-8"
              />
            </div>
          </form>
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" /> Add Application
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 overflow-x-auto sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {statuses.map((s) => {
            const items = applications.filter((a) => a.status === s.key);
            return (
              <div key={s.key} className="min-w-[220px]">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">{s.label}</p>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.map((app) => (
                    <Card key={app.id} className={cn(pendingId === app.id && "opacity-60")}>
                      <CardContent className="p-3">
                        <div className="mb-1.5 flex items-start justify-between gap-1">
                          <p className="text-sm font-medium text-foreground">{app.position}</p>
                          {app.jobUrl && (
                            <a href={app.jobUrl} target="_blank" rel="noreferrer" className="shrink-0 text-muted-foreground hover:text-primary">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                        <p className="mb-2 text-xs text-muted-foreground">{app.companyName}</p>
                        <select
                          value={app.status}
                          onChange={(e) => handleStatusChange(app, e.target.value as ApplicationStatus)}
                          className="mb-2 w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
                          disabled={pendingId === app.id}
                        >
                          {statuses.map((opt) => (
                            <option key={opt.key} value={opt.key}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(app)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDeleteTarget(app)}>
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit application" : "Add application"}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Company</Label>
                <Input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Position</Label>
                <Input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Job URL</Label>
              <Input value={form.jobUrl} onChange={(e) => setForm({ ...form, jobUrl: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Location</Label>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Salary</Label>
                <Input value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Status</Label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as ApplicationStatus })}
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                >
                  {statuses.map((s) => (
                    <option key={s.key} value={s.key}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Date applied</Label>
                <Input type="date" value={form.dateApplied} onChange={(e) => setForm({ ...form, dateApplied: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
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

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this application?</DialogTitle>
            <DialogDescription>This can&apos;t be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button variant="destructive" onClick={handleDelete} disabled={pendingId === deleteTarget?.id}>
              {pendingId === deleteTarget?.id && <Loader2 className="h-4 w-4 animate-spin" />} Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
