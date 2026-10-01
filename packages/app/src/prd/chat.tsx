"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AIChatBubble, Button, Textarea } from "@prdgenz/ui";
import type { PRDContent } from "@prdgenz/shared";
import { useGenerationSetup } from "../wizard/use-generation-setup";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Ask the model questions until it has enough to write the document.
 *
 * The transcript is a plain ruled column, not a chat app: left/right
 * alignment and avatars are for people talking to each other, and here there
 * is one reader and one drafting model.
 */
export function Chat() {
  const router = useRouter();
  const setup = useGenerationSetup();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamText]);

  /**
   * The model signals a finished document by replying with a JSON body. The
   * shape is checked before saving, because a reply that merely starts with a
   * brace is a malformed PRD, not a document.
   */
  function looksLikePRD(text: string): boolean {
    if (!text.trim().startsWith("{")) return false;
    try {
      const parsed = JSON.parse(text) as PRDContent;
      return Boolean(parsed?.title && Array.isArray(parsed?.features));
    } catch {
      return false;
    }
  }

  async function saveAsPRD(history: ChatMessage[]) {
    const res = await fetch("/api/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: setup.language,
        mode: "CHAT",
        provider: setup.provider,
        model: setup.model,
        input: history,
      }),
    });
    const data = await res.json().catch(() => null);
    if (data?.saved?.prdId) router.push(`/prd/${data.saved.prdId}`);
  }

  async function send() {
    const text = draft.trim();
    if (!text || streaming) return;
    setError(null);
    setDraft("");
    const history: ChatMessage[] = [
      ...messages,
      { role: "user", content: text },
    ];
    setMessages(history);
    setStreaming(true);
    setStreamText("");
    const abort = new AbortController();
    abortRef.current = abort;

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abort.signal,
        body: JSON.stringify({
          language: setup.language,
          provider: setup.provider,
          model: setup.model,
          messages: history,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Chat request failed");
      }
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let full = "";
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
            full += evt.text;
            setStreamText(full);
          } else if (evt.type === "done") {
            const reply = evt.full ?? full;
            setMessages((m) => [...m, { role: "assistant", content: reply }]);
            setStreamText("");
            if (looksLikePRD(reply)) await saveAsPRD(history);
          } else if (evt.type === "error") {
            throw new Error(evt.error);
          }
        }
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") setError((e as Error).message);
    } finally {
      setStreaming(false);
    }
  }
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col px-6 py-10">
      <header className="mb-6 space-y-4">
        <div>
          <p className="mb-2 font-mono text-xs uppercase tracking-wide text-muted-foreground">
            Interview
          </p>
          <h1 className="font-display text-3xl leading-tight">Chat</h1>
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
            Answer the model&apos;s questions. It drafts the PRD once it has
            enough to work from.
          </p>
        </div>
        {setup.config}
      </header>

      <div className="spec-rule flex min-h-0 flex-1 flex-col pl-6">
        <div className="flex-1 space-y-4 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="py-8 text-sm text-muted-foreground">
              Start by describing the product.
            </p>
          ) : (
            messages.map((m, i) => (
              <AIChatBubble key={i} role={m.role} content={m.content} />
            ))
          )}
          {streaming ? (
            <AIChatBubble
              role="assistant"
              content={streamText || "…"}
              streaming
            />
          ) : null}
          <div ref={bottomRef} />
        </div>

        {error ? (
          <p role="alert" className="mt-4 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <div className="mt-4 flex gap-2 border-t pt-4">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
            placeholder="Type a message. Enter to send, Shift+Enter for a new line."
            rows={2}
            disabled={streaming}
          />
          {streaming ? (
            <Button variant="outline" onClick={() => abortRef.current?.abort()}>
              Stop
            </Button>
          ) : (
            <Button onClick={() => void send()} disabled={!draft.trim()}>
              Send
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
