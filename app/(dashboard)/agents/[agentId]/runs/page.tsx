import { RunsPageContent } from "@/modules/agents/components/runs-page-content";

export default async function RunsPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const { agentId } = await params;
  return <RunsPageContent agentId={agentId} />;
}
