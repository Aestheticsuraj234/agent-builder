"use client";

import { useState } from "react";
import { useCreateSkill, useDeleteSkill, useSkills } from "@/modules/skills/hooks/use-skills";
import { toolsCatalog } from "@/modules/builder/lib/tools-catalog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";

export function SkillsPageContent() {
  const { data: skills, isLoading } = useSkills();
  const createSkill = useCreateSkill();
  const deleteSkill = useDeleteSkill();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [selectedTools, setSelectedTools] = useState<string[]>([]);

  function toggleTool(toolId: string) {
    setSelectedTools((prev) =>
      prev.includes(toolId) ? prev.filter((t) => t !== toolId) : [...prev, toolId]
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Spinner />
      </div>
    );
  }

  const list = skills ?? [];

  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold">Skills</h1>
        <p className="text-muted-foreground text-sm">
          Reusable instruction + tool bundles. Attach them to Agent nodes in the builder.
        </p>
      </div>

      <div className="mb-8 max-w-lg space-y-4 rounded-2xl border border-border p-4">
        <h2 className="text-sm font-medium">Create custom skill</h2>
        <div className="space-y-2">
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Instructions</Label>
          <Textarea rows={4} value={instructions} onChange={(e) => setInstructions(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Tools</Label>
          <div className="flex flex-wrap gap-1">
            {toolsCatalog.map((t) => (
              <Button
                key={t.id}
                type="button"
                size="xs"
                variant={selectedTools.includes(t.id) ? "default" : "outline"}
                onClick={() => toggleTool(t.id)}
              >
                {t.label}
              </Button>
            ))}
          </div>
        </div>
        <Button
          onClick={() =>
            createSkill.mutate(
              { name, description, instructions, toolIds: selectedTools },
              {
                onSuccess: () => {
                  setName("");
                  setDescription("");
                  setInstructions("");
                  setSelectedTools([]);
                },
              }
            )
          }
          disabled={!name || !instructions || createSkill.isPending}
        >
          Save skill
        </Button>
      </div>

      <div className="space-y-2">
        {list.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between rounded-xl border border-border px-4 py-3"
          >
            <div>
              <p className="font-medium">
                {s.name}{" "}
                {(s as any).builtin && (
                  <span className="text-muted-foreground text-xs">built-in</span>
                )}
              </p>
              <p className="text-muted-foreground text-xs">{s.description}</p>
            </div>
            {!(s as any).builtin && (
              <Button variant="outline" size="sm" onClick={() => deleteSkill.mutate(s.id)}>
                Delete
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
