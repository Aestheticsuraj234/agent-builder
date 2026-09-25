import prisma from "@/lib/db";
import { ChatPanel } from "@/modules/playground/components/chat-panel";
import { getPublishedAgent } from "@/modules/agents/actions/publish";

export default async function PublicChatPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const { agentId } = await params;
  const published = await getPublishedAgent(agentId);

  if (!published) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <p className="text-muted-foreground">This agent is not published yet.</p>
      </div>
    );
  }

  const agent = published.agent;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border px-4 py-3">
        <h1 className="font-heading text-lg font-semibold">{agent.name}</h1>
        <p className="text-muted-foreground text-xs">Published v{published.version}</p>
      </header>
      <div className="min-h-0 flex-1">
        <ChatPanel
          agentId={agent.id}
          definition={published.definition}
          welcomeMessage={agent.welcomeMessage}
          starterPrompts={(agent.starterPrompts as string[]) ?? []}
        />
      </div>
    </div>
  );
}
