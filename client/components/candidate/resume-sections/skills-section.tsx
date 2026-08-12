"use client";

import * as React from "react";
import { Plus, X, Loader2, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import { addSkill, deleteSkill, type Skill } from "@/lib/api";

export function SkillsSection({ resumeId, items, onChange }: { resumeId: string; items: Skill[]; onChange: () => void }) {
  const { callAuthed } = useAuth();
  const [value, setValue] = React.useState("");
  const [isAdding, setIsAdding] = React.useState(false);
  const [removingId, setRemovingId] = React.useState<string | null>(null);

  const handleAdd = async () => {
    if (!value.trim()) return;
    setIsAdding(true);
    try {
      await callAuthed((token) => addSkill(token, resumeId, value.trim()));
      setValue("");
      onChange();
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemove = async (id: string) => {
    setRemovingId(id);
    try {
      await callAuthed((token) => deleteSkill(token, resumeId, id));
      onChange();
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-foreground">Skills</h3>
      <div className="flex gap-2">
        <Input
          placeholder="e.g. TypeScript"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <Button onClick={handleAdd} disabled={isAdding || !value.trim()}>
          {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Add
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-border py-10 text-center">
          <Lightbulb className="mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No skills added yet</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((skill) => (
            <span
              key={skill.id}
              className="flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1.5 text-sm text-foreground"
            >
              {skill.name}
              <button onClick={() => handleRemove(skill.id)} disabled={removingId === skill.id}>
                {removingId === skill.id ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                )}
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
