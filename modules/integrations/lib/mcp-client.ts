import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import prisma from "@/lib/db";

export async function getMcpTools(userId: string, connectionIds: string[]) {
  if (!connectionIds.length) return [];

  const connections = await prisma.mcpConnection.findMany({
    where: { userId, id: { in: connectionIds }, enabled: true },
  });

  if (!connections.length) return [];

  const mcpServers: Record<string, { url: string; headers?: Record<string, string> }> = {};

  for (const c of connections) {
    mcpServers[c.name] = {
      url: c.url,
      headers: (c.headers as Record<string, string>) ?? {},
    };
  }

  const client = new MultiServerMCPClient({
    mcpServers,
    onConnectionError: "ignore",
    throwOnLoadError: false,
  });

  try {
    return await client.getTools();
  } finally {
    await client.close();
  }
}

export async function testMcpConnection(url: string, headers: Record<string, string> = {}) {
  const client = new MultiServerMCPClient({
    mcpServers: {
      test: { url, headers },
    },
    onConnectionError: "throw",
  });

  try {
    const tools = await client.getTools();
    return { ok: true, toolCount: tools.length, tools: tools.map((t) => t.name) };
  } finally {
    await client.close();
  }
}
