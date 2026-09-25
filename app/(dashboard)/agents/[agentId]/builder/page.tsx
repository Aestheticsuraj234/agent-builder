import { BuilderPageContent } from "@/modules/agents/components/builder-page-content";

export default async function BuilderPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const { agentId } = await params;
  return <BuilderPageContent agentId={agentId} />;
}
