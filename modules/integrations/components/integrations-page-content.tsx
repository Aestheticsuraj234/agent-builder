"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useCreateMcpConnection,
  useDeleteMcpConnection,
  useMcpConnections,
  useTestMcpConnection,
  useToggleMcpConnection,
} from "@/modules/integrations/hooks/use-mcp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

const catalog = [
  {
    id: "github",
    name: "GitHub",
    type: "OAuth",
    note: "Sign in with GitHub. Tools appear automatically for repo/PR agents.",
  },
  {
    id: "tavily",
    name: "Tavily (Web Search)",
    type: "API key",
    note: "Set TAVILY_API_KEY in .env for web_search tool.",
  },
  {
    id: "openai",
    name: "OpenAI",
    type: "API key",
    note: "Set OPENAI_API_KEY in .env for models and generate_image.",
  },
  {
    id: "mcp",
    name: "MCP (generic)",
    type: "HTTP URL",
    note: "Connect any MCP server below. Tools load dynamically in Agent settings.",
  },
];

export function IntegrationsPageContent() {
  const { data: connections, isLoading } = useMcpConnections();
  const createConnection = useCreateMcpConnection();
  const deleteConnection = useDeleteMcpConnection();
  const toggleConnection = useToggleMcpConnection();
  const testMcp = useTestMcpConnection();

  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [authHeader, setAuthHeader] = useState("");
  const [testResult, setTestResult] = useState("");

  async function handleTest() {
    setTestResult("Testing...");
    try {
      const result = await testMcp.mutateAsync({ url, authHeader: authHeader || undefined });
      setTestResult(`OK — ${result.toolCount} tools: ${result.tools.join(", ")}`);
    } catch (err: any) {
      setTestResult(`Failed: ${err?.message ?? "connection error"}`);
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Spinner />
      </div>
    );
  }

  const list = connections ?? [];

  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold">Integrations</h1>
        <p className="text-muted-foreground text-sm">
          Catalog of supported integrations and MCP connections.
        </p>
      </div>

      <div className="mb-8 grid gap-3 sm:grid-cols-2">
        {catalog.map((item) => (
          <div key={item.id} className="rounded-xl border border-border p-4">
            <p className="font-medium">{item.name}</p>
            <p className="text-muted-foreground text-xs">{item.type}</p>
            <p className="text-muted-foreground mt-2 text-sm">{item.note}</p>
          </div>
        ))}
      </div>

      <div className="mb-8 max-w-lg space-y-4 rounded-2xl border border-border p-4">
        <h2 className="text-sm font-medium">Add MCP server</h2>
        <div className="space-y-2">
          <Label htmlFor="mcp-name">Name</Label>
          <Input id="mcp-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="my-server" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="mcp-url">URL</Label>
          <Input id="mcp-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/mcp" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="mcp-auth">Auth header (optional)</Label>
          <Input id="mcp-auth" value={authHeader} onChange={(e) => setAuthHeader(e.target.value)} placeholder="Bearer token123" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleTest} disabled={!url || testMcp.isPending}>
            Test
          </Button>
          <Button
            onClick={() =>
              createConnection.mutate(
                { name, url, authHeader: authHeader || undefined },
                {
                  onSuccess: () => {
                    setName("");
                    setUrl("");
                    setAuthHeader("");
                    setTestResult("");
                  },
                }
              )
            }
            disabled={!name || !url || createConnection.isPending}
          >
            Save connection
          </Button>
        </div>
        {testResult && <p className="text-muted-foreground text-xs">{testResult}</p>}
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-medium">Your MCP connections</h2>
        {list.length === 0 ? (
          <p className="text-muted-foreground text-sm">No MCP servers yet.</p>
        ) : (
          list.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-muted-foreground text-xs">{c.url}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => toggleConnection.mutate({ id: c.id, enabled: !c.enabled })}>
                  {c.enabled ? "Disable" : "Enable"}
                </Button>
                <Button variant="outline" size="sm" onClick={() => deleteConnection.mutate(c.id)}>
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <p className="text-muted-foreground mt-6 text-xs">
        Attach MCP servers on any Agent node in the{" "}
        <Link href="/agents" className="text-primary underline">
          builder
        </Link>
        .
      </p>
    </div>
  );
}
