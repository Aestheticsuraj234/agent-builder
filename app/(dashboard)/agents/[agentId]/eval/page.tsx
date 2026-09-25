"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type TestCase = {
  id: string;
  input: string;
  expectContains: string;
};

export default function EvalPage() {
  const [cases, setCases] = useState<TestCase[]>([]);
  const [input, setInput] = useState("");
  const [expect, setExpect] = useState("");

  function addCase() {
    setCases([
      ...cases,
      { id: String(Date.now()), input, expectContains: expect },
    ]);
    setInput("");
    setExpect("");
  }

  return (
    <div className="flex flex-1 flex-col p-6">
      <h1 className="font-heading text-2xl font-semibold">Evals (dev)</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        Simple test cases for manual runs. Approval nodes coming later.
      </p>

      <div className="mb-6 max-w-lg space-y-3 rounded-xl border border-border p-4">
        <div className="space-y-2">
          <Label>Input</Label>
          <Textarea rows={2} value={input} onChange={(e) => setInput(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Response should contain</Label>
          <Input value={expect} onChange={(e) => setExpect(e.target.value)} />
        </div>
        <Button onClick={addCase} disabled={!input || !expect}>
          Add test case
        </Button>
      </div>

      <div className="space-y-2">
        {cases.map((c) => (
          <div key={c.id} className="rounded-lg border border-border p-3 text-sm">
            <p className="font-medium">Input: {c.input}</p>
            <p className="text-muted-foreground">Expect contains: {c.expectContains}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
