"use client";

import { useUpdateAgent } from "@/modules/agents/hooks/use-agents";
import type { AgentDefinition } from "@/modules/agents/lib/definition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type AgentSettingsFormProps = {
  agent: { id: string; name: string; description: string };
  definition: AgentDefinition;
};

export function AgentSettingsForm({ agent, definition }: AgentSettingsFormProps) {
  const updateAgent = useUpdateAgent(agent.id);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        updateAgent.mutate({
          name: formData.get("name") as string,
          description: formData.get("description") as string,
          instructions: formData.get("instructions") as string,
        });
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={agent.name} key={agent.name} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          name="description"
          defaultValue={agent.description}
          key={agent.description}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="instructions">Instructions</Label>
        <Textarea
          id="instructions"
          name="instructions"
          rows={8}
          defaultValue={definition.instructions}
          key={definition.instructions}
        />
      </div>
      <Button type="submit" disabled={updateAgent.isPending}>
        {updateAgent.isPending ? "Saving..." : "Save"}
      </Button>
      {updateAgent.isSuccess && (
        <p className="text-muted-foreground text-xs">Saved!</p>
      )}
    </form>
  );
}
