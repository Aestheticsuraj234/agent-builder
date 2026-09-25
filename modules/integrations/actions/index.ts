"use server";

import prisma from "@/lib/db";
import { requireAuth } from "@/modules/auth/actions";
import { testMcpConnection } from "@/modules/integrations/lib/mcp-client";

export async function listMcpConnections() {
  const user = await requireAuth();

  return prisma.mcpConnection.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
}

export async function createMcpConnection(data: {
  name: string;
  url: string;
  authHeader?: string;
}) {
  const user = await requireAuth();

  const headers: Record<string, string> = {};
  if (data.authHeader) {
    headers.Authorization = data.authHeader;
  }

  return prisma.mcpConnection.create({
    data: {
      userId: user.id,
      name: data.name,
      url: data.url,
      headers: headers as any,
    },
  });
}

export async function deleteMcpConnection(id: string) {
  const user = await requireAuth();

  await prisma.mcpConnection.deleteMany({
    where: { id, userId: user.id },
  });
}

export async function toggleMcpConnection(id: string, enabled: boolean) {
  const user = await requireAuth();

  return prisma.mcpConnection.updateMany({
    where: { id, userId: user.id },
    data: { enabled },
  });
}

export async function testConnection(url: string, authHeader?: string) {
  await requireAuth();

  const headers: Record<string, string> = {};
  if (authHeader) headers.Authorization = authHeader;

  return testMcpConnection(url, headers);
}
