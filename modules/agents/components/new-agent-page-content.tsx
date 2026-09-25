"use client";

import { AppIcon } from "@/components/app-icon";
import { TemplateCard } from "@/modules/agents/components/template-card";
import { useCreateBlankAgent } from "@/modules/agents/hooks/use-agents";
import { templates } from "@/modules/agents/lib/templates";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function NewAgentPageContent() {
  const createBlank = useCreateBlankAgent();

  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold">Create Agent</h1>
        <p className="text-muted-foreground text-sm">
          Start from a template or build from scratch.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AppIcon name="blank" badge />
              Blank Agent
            </CardTitle>
            <CardDescription>Start with empty instructions and add tools later.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">Good if you know exactly what you want.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => createBlank.mutate()} disabled={createBlank.isPending}>
              {createBlank.isPending ? "Creating..." : "Start blank"}
            </Button>
          </CardFooter>
        </Card>

        {templates.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>
    </div>
  );
}
