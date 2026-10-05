"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Label, Textarea } from "@prdgenz/ui";
import type { PRDContent } from "@prdgenz/shared";
import { useGenerationSetup } from "../wizard/use-generation-setup";

const MIN_IDEA_LENGTH = 10;

export interface OneShotProps {
  /** Cloud-only project picker. */
  projectId?: string;
  onProjectIdChange?: (id: string) => void;
}

/**
 * One input, one document. The streaming tail is raw monospace text rather
 * than a chat bubble, because nothing is being said yet: the model is
 * writing the file.
 */
export function OneShot({ projectId = "", onProjectIdChange }: OneShotProps) {
  const router = useRouter();
  const setup = useGenerationSetup();
  const [idea, setIdea] = useState("");
  const [constraints, setConstraints] = useState("");
  const [generating, setGenerating] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [result, setResult] = useState<PRDContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const ready = idea.trim().length >= MIN_IDEA_LENGTH;

  async function generate() {
    if (!ready) return;
    setError(null);
    setResult(null);
    setStreamText("");
    setGenerating(true);
    const abort = new AbortController();
    abortRef.current = abort;
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abort.signal,
        body: JSON.stringify({
          language: setup.language,
          mode: "ONESHOT",
          provider: setup.provider,
          model: setup.model,
          projectId: projectId || undefined,
          input: { idea, constraints: constraints || undefined },
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Generation failed");
      }
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";
        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith("data:")) continue;
          const evt = JSON.parse(line.slice(5).trim());
          if (evt.type === "delta") {
            setStreamText((t) => t + evt.text);
          } else if (evt.type === "done") {
            setResult(evt.content as PRDContent);
            setStreamText("");
            if (evt.saved?.prdId) {
              // Deferred so the finished state paints before the swap.
              setTimeout(() => router.push(`/prd/${evt.saved.prdId}`), 900);
            }
          } else if (evt.type === "error") {
            throw new Error(evt.error);
          }
        }
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") setError((e as Error).message);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <header className="mb-8">
        <p className="mb-2 font-mono text-xs uppercase tracking-wide text-muted-foreground">
          Single pass
        </p>
        <h1 className="font-display text-3xl leading-tight">One-Shot</h1>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
          One input, one complete PRD. Paste the idea and let it draft the rest.
        </p>
      </header>

      <div className="spec-rule space-y-6 pl-6">
        {setup.config}

        <div className="space-y-2">
          <Label htmlFor="idea">Idea / problem *</Label>
          <Textarea
            id="idea"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="e.g. A web app that turns a raw product idea into a full PRD, self-hostable with Docker."
            rows={6}
            disabled={generating}
          />
          <p className="font-mono text-xs text-muted-foreground">
            {idea.length} characters / {MIN_IDEA_LENGTH} minimum
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="constraints">Constraints (optional)</Label>
          <Textarea
            id="constraints"
            value={constraints}
            onChange={(e) => setConstraints(e.target.value)}
            placeholder="e.g. must run offline, budget $0, team of one, 4-week deadline"
            rows={3}
            disabled={generating}
          />
        </div>

        {onProjectIdChange ? (
          <div className="space-y-2">
            <Label htmlFor="project">Save into project (optional)</Label>
            <input
              id="project"
              value={projectId}
              onChange={(e) => onProjectIdChange(e.target.value)}
              placeholder="Project ID (leave blank to generate without saving)"
              disabled={generating}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        ) : null}

        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}

        {generating ? (
          <div className="space-y-2 border p-4">
            <p className="font-mono text-xs text-muted-foreground">
              Writing… {streamText.length} chars
            </p>
            <pre className="max-h-60 overflow-y-auto whitespace-pre-wrap break-words font-mono text-xs text-muted-foreground">
              {streamText.slice(-1500)}
            </pre>
            <Button
              variant="outline"
              size="sm"
              onClick={() => abortRef.current?.abort()}
            >
              Cancel
            </Button>
          </div>
        ) : null}

        {result ? (
          <div className="border-l-2 border-primary pl-4">
            <p className="font-medium text-primary">{result.title}</p>
            <p className="text-sm text-muted-foreground">
              {result.features.length} features · {result.userStories.length}{" "}
              user stories · opening…
            </p>
          </div>
        ) : null}

        <Button
          onClick={generate}
          disabled={!ready || generating}
          className="w-full"
        >
          {generating ? "Generating…" : "Generate PRD"}
        </Button>
      </div>
    </div>
  );
}
