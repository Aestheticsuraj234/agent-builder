import type { BuilderDefinition } from "@/modules/workflows/lib/schema";
import { loadBuilderDefinition } from "@/modules/workflows/lib/migrate-v1";
import { compileWorkflow } from "./compile-workflow";
import type { RunEvent } from "./run-agent";

export async function runWorkflowStream(
  rawDefinition: unknown,
  history: { role: string; content: string }[],
  userMessage: string,
  userId: string,
  onEvent: (event: RunEvent) => void
) {
  const definition = loadBuilderDefinition(rawDefinition);
  const effectiveHistory = definition.memory.enabled ? history : [];

  const graph = compileWorkflow(definition, { userId, onEvent });

  const run = graph.invoke({
    userMessage,
    history: effectiveHistory,
    output: "",
    stepCount: 0,
  });

  const timeoutMs = definition.limits.timeoutMs;

  try {
    const result = await Promise.race([
      run,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Workflow timed out")), timeoutMs)
      ),
    ]);

    return (result as any).output ?? "";
  } catch (err: any) {
    onEvent({ type: "run_failed", error: err?.message ?? "Workflow failed" });
    return "";
  }
}
