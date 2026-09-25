"use client";

import { AppIcon } from "@/components/app-icon";
import type { WorkflowTemplate } from "@/modules/agents/lib/workflow-templates";
import { useCreateFromWorkflowTemplate } from "@/modules/agents/hooks/use-agents";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function WorkflowTemplateCard({ template }: { template: WorkflowTemplate }) {
  const create = useCreateFromWorkflowTemplate();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AppIcon name={template.icon as any} badge />
          {template.name}
        </CardTitle>
        <CardDescription>{template.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-xs">Multi-agent workflow template</p>
      </CardContent>
      <CardFooter>
        <Button onClick={() => create.mutate(template.id)} disabled={create.isPending}>
          {create.isPending ? "Creating..." : "Use template"}
        </Button>
      </CardFooter>
    </Card>
  );
}
