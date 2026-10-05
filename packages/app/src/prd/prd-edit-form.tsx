"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Label } from "@prdgenz/ui";
import { DeletePRDButton } from "./prd-actions";

export interface PRDEditFormProps {
  prdId: string;
  initialTitle: string;
  initialLanguage: string;
  /** Cloud only: self-host has no delete affordance on this screen. */
  canDelete?: boolean;
  redirectTo: string;
}

/**
 * Edit metadata, not content. Content changes go through regeneration, which
 * is why this form has exactly two fields and says so.
 *
 * Cloud previously unwrapped its async params by calling setState during
 * render, then fetched the current values from the client. Both apps now pass
 * the values in, so there is no load flash and no render-phase setState.
 */
export function PRDEditForm({
  prdId,
  initialTitle,
  initialLanguage,
  canDelete = false,
  redirectTo,
}: PRDEditFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [language, setLanguage] = useState(
    initialLanguage === "ID" ? "ID" : "EN",
  );
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dirty = title !== initialTitle || language !== initialLanguage;

  async function save() {
    setSaving(true);
    setError(null);
    setNote(null);
    try {
      const res = await fetch(`/api/prd/${prdId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, language }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Save failed");
      }
      setNote("Saved.");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl px-6 py-10">
      <header className="mb-8">
        <p className="mb-2 font-mono text-xs uppercase tracking-wide text-muted-foreground">
          Metadata
        </p>
        <h1 className="font-display text-3xl leading-tight">Edit document</h1>
      </header>

      <div className="generation-panel space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lang">Output language</Label>
          <select
            id="lang"
            value={language}
            onChange={(e) => setLanguage(e.target.value as "EN" | "ID")}
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="EN">English</option>
            <option value="ID">Bahasa Indonesia</option>
          </select>
          <p className="text-xs text-muted-foreground">
            Applies to the next regenerated version.
          </p>
        </div>

        {note ? (
          <p role="status" className="text-sm text-primary">
            {note}
          </p>
        ) : null}
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <div className="flex items-center justify-between gap-4 border-t pt-4">
          <Button onClick={save} disabled={saving || !title.trim() || !dirty}>
            {saving ? "Saving…" : dirty ? "Save" : "No changes"}
          </Button>
          {canDelete ? (
            <DeletePRDButton prdId={prdId} redirectTo={redirectTo} />
          ) : null}
        </div>
      </div>

      <p className="mt-8 max-w-prose text-sm leading-relaxed text-muted-foreground">
        To change the content itself, use <strong>Regenerate</strong> on the
        document, or create a new version via Create from Scratch, Chat, or
        One-Shot. Every change is kept as a version you can restore.
      </p>
    </div>
  );
}
