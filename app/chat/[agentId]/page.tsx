import { redirect } from "next/navigation";
import { ChatPanel } from "@/modules/playground/components/chat-panel";
import { requireAuth } from "@/modules/auth/actions";
import { getPublishedAgentForOwner } from "@/modules/agents/actions/publish";

export default async function OwnerChatPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  await requireAuth();
  const { agentId } = await params;
  const published = await getPublishedAgentForOwner(agentId);

  if (!published) {
    redirect(`/agents/${agentId}/builder`);
  }

  const agent = published.agent;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border px-4 py-3">
        <h1 className="font-heading text-lg font-semibold">{agent.name}</h1>
        <p className="text-muted-foreground text-xs">
          Published chat · v{published.version} (draft changes won&apos;t apply here)
        </p>
      </header>
      <div className="min-h-0 flex-1">
        <ChatPanel
          agentId={agent.id}
          definition={published.definition}
          publishedVersion={published.version}
          welcomeMessage={agent.welcomeMessage}
          starterPrompts={(agent.starterPrompts as string[]) ?? []}
        />
      </div>
    </div>
  );
}
