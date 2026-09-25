"use client";

import { AppIcon } from "@/components/app-icon";
import { useCreateFromTemplate } from "@/modules/agents/hooks/use-agents";
import type { AgentTemplate } from "@/modules/agents/lib/templates";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function TemplateCard({ template }: { template: AgentTemplate }) {
  const createFromTemplate = useCreateFromTemplate();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AppIcon name={template.icon} badge />
          {template.name}
        </CardTitle>
        <CardDescription>{template.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">{template.welcomeMessage}</p>
        <ul className="text-muted-foreground mt-2 list-inside list-disc text-xs">
          {template.starterPrompts.slice(0, 2).map((prompt) => (
            <li key={prompt}>{prompt}</li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          onClick={() => createFromTemplate.mutate(template.id)}
          disabled={createFromTemplate.isPending}
        >
          {createFromTemplate.isPending ? "Creating..." : "Use template"}
        </Button>
      </CardFooter>
    </Card>
  );
}
