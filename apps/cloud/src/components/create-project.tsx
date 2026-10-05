"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Label } from "@prdgenz/ui";

export function CreateProjectButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && !dialog?.open) dialog?.showModal();
    if (!open && dialog?.open) dialog.close();
  }, [open]);

  async function create(event: FormEvent) {
    event.preventDefault();
    if (loading) return;
    if (!name.trim()) {
      setError("Project name is required.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Failed to create project.");
        return;
      }
      setOpen(false);
      setName("");
      router.refresh();
    } catch {
      setError("Could not connect. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button variant="outline" onClick={() => { setError(null); setOpen(true); }}>New Project</Button>
      <dialog ref={dialogRef} aria-labelledby="create-project-title"
        onCancel={() => setOpen(false)} onClose={() => setOpen(false)}
        className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-lg border bg-card p-6 text-foreground backdrop:bg-foreground/40">
          <form onSubmit={create} className="space-y-4">
            <h2 id="create-project-title" className="text-lg font-semibold">New Project</h2>
            <div className="space-y-2">
              <Label htmlFor="project-name">Name</Label>
              <Input
                id="project-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Mobile App Revamp"
                autoFocus
              />
            </div>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating…" : "Create"}
              </Button>
            </div>
          </form>
      </dialog>
    </>
  );
}
