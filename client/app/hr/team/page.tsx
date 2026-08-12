"use client";

import * as React from "react";
import { Plus, Loader2, UserCircle, Shield, Ban, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { useHrAuth } from "@/lib/hr-auth-context";
import { listTeamMembers, addTeamMember, setTeamMemberActiveStatus, type TeamMember } from "@/lib/api";

export default function HrTeamPage() {
  const { hrUser, callAuthed } = useHrAuth();
  const isAdmin = hrUser?.role === "ORG_ADMIN";

  const [members, setMembers] = React.useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isAdding, setIsAdding] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    try {
      const res = await callAuthed((token) => listTeamMembers(token));
      setMembers(res.data);
    } finally {
      setIsLoading(false);
    }
  }, [callAuthed]);

  React.useEffect(() => {
    load();
  }, [load]);

  const handleAdd = async () => {
    if (!email.trim() || !password) {
      setError("Email and password are required");
      return;
    }
    setIsAdding(true);
    setError(null);
    try {
      await callAuthed((token) => addTeamMember(token, { email: email.trim(), password }));
      setEmail("");
      setPassword("");
      setDialogOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't add this team member");
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleActive = async (member: TeamMember) => {
    setPendingId(member.id);
    try {
      await callAuthed((token) => setTeamMemberActiveStatus(token, member.id, !member.isActive));
      await load();
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Team</h1>
          <p className="text-muted-foreground">Recruiters in your organization.</p>
        </div>
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4" /> Add Recruiter
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a recruiter</DialogTitle>
                <DialogDescription>
                  This creates their account directly — ApplyWise doesn&apos;t send an email invite yet, so
                  you&apos;ll need to share these credentials with them yourself.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="colleague@company.com" />
                </div>
                <div className="space-y-1.5">
                  <Label>Temporary password</Label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                  <p className="text-xs text-muted-foreground">At least 8 characters, with uppercase, lowercase, and a number.</p>
                </div>
                {error && <p className="text-xs text-destructive">{error}</p>}
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button onClick={handleAdd} disabled={isAdding}>
                  {isAdding && <Loader2 className="h-4 w-4 animate-spin" />} Add
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {!isAdmin && (
        <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          Only an organization admin can add or manage team members. You can still view the team below.
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-2">
          {members.map((member) => (
            <Card key={member.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <UserCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                      {member.email}
                      {member.role === "ORG_ADMIN" && (
                        <span className="flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                          <Shield className="h-2.5 w-2.5" /> Admin
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {member.isActive ? "Active" : "Deactivated"} · Joined{" "}
                      {new Date(member.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {isAdmin && member.role !== "ORG_ADMIN" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(member)}
                    disabled={pendingId === member.id}
                  >
                    {pendingId === member.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : member.isActive ? (
                      <Ban className="h-3.5 w-3.5" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    )}
                    {member.isActive ? "Deactivate" : "Reactivate"}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
