"use client";

import type { CustomToolConfig, CustomToolParam } from "@/modules/builder/lib/custom-tool";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function CustomToolSettings({
  config,
  onChange,
  onRemove,
}: {
  config: CustomToolConfig;
  onChange: (config: CustomToolConfig) => void;
  onRemove: () => void;
}) {
  function updateConfig(partial: Partial<CustomToolConfig>) {
    onChange({ ...config, ...partial });
  }

  function updateParam(index: number, partial: Partial<CustomToolParam>) {
    const parameters = config.parameters.map((p, i) =>
      i === index ? { ...p, ...partial } : p
    );
    updateConfig({ parameters });
  }

  function addParam() {
    updateConfig({
      parameters: [
        ...config.parameters,
        { name: "param", type: "string", description: "", required: false },
      ],
    });
  }

  function removeParam(index: number) {
    updateConfig({ parameters: config.parameters.filter((_, i) => i !== index) });
  }

  function updateHeader(index: number, key: string, value: string) {
    const headers = config.headers.map((h, i) =>
      i === index ? { key, value } : h
    );
    updateConfig({ headers });
  }

  function addHeader() {
    updateConfig({ headers: [...config.headers, { key: "", value: "" }] });
  }

  function removeHeader(index: number) {
    updateConfig({ headers: config.headers.filter((_, i) => i !== index) });
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Tool name</Label>
        <Input
          value={config.name}
          onChange={(e) => updateConfig({ name: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Description (for the AI)</Label>
        <Textarea
          rows={3}
          value={config.description}
          onChange={(e) => updateConfig({ description: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>HTTP method</Label>
          <select
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            value={config.method}
            onChange={(e) =>
              updateConfig({ method: e.target.value as CustomToolConfig["method"] })
            }
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label>Timeout (ms)</Label>
          <Input
            type="number"
            value={config.timeoutMs}
            onChange={(e) => updateConfig({ timeoutMs: Number(e.target.value) })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>URL</Label>
        <Input
          value={config.url}
          placeholder="https://api.example.com/data?q={{query}}"
          onChange={(e) => updateConfig({ url: e.target.value })}
        />
        <p className="text-muted-foreground text-xs">
          Use {"{{paramName}}"} to insert AI-provided values.
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Headers</Label>
          <Button type="button" variant="outline" size="xs" onClick={addHeader}>
            Add header
          </Button>
        </div>
        {config.headers.map((header, i) => (
          <div key={i} className="flex gap-2">
            <Input
              placeholder="Key"
              value={header.key}
              onChange={(e) => updateHeader(i, e.target.value, header.value)}
            />
            <Input
              placeholder="Value"
              value={header.value}
              onChange={(e) => updateHeader(i, header.key, e.target.value)}
            />
            <Button type="button" variant="outline" size="icon-sm" onClick={() => removeHeader(i)}>
              ×
            </Button>
          </div>
        ))}
      </div>

      {config.method !== "GET" && (
        <div className="space-y-2">
          <Label>Request body (JSON)</Label>
          <Textarea
            rows={5}
            value={config.body}
            onChange={(e) => updateConfig({ body: e.target.value })}
            className="font-mono text-xs"
          />
          <p className="text-muted-foreground text-xs">
            Use {"{{paramName}}"} placeholders in the body too.
          </p>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Parameters (AI fills these in)</Label>
          <Button type="button" variant="outline" size="xs" onClick={addParam}>
            Add param
          </Button>
        </div>
        {config.parameters.map((param, i) => (
          <div key={i} className="space-y-2 rounded-lg border border-border p-3">
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Name"
                value={param.name}
                onChange={(e) => updateParam(i, { name: e.target.value })}
              />
              <select
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                value={param.type}
                onChange={(e) =>
                  updateParam(i, { type: e.target.value as CustomToolParam["type"] })
                }
              >
                <option value="string">string</option>
                <option value="number">number</option>
                <option value="boolean">boolean</option>
              </select>
            </div>
            <Input
              placeholder="Description"
              value={param.description}
              onChange={(e) => updateParam(i, { description: e.target.value })}
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={param.required}
                  onChange={(e) => updateParam(i, { required: e.target.checked })}
                />
                Required
              </label>
              <Button type="button" variant="outline" size="xs" onClick={() => removeParam(i)}>
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Button variant="outline" size="sm" onClick={onRemove}>
        Remove custom tool
      </Button>
    </div>
  );
}
