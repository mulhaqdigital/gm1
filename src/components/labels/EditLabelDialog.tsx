"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EditLabelDialogProps {
  label: { id: string; name: string };
}

export function EditLabelDialog({ label }: EditLabelDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(label.name);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRename() {
    if (!name.trim() || name.trim() === label.name) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/labels/${label.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? `Error ${res.status}`);
        return;
      }
      setOpen(false);
      router.refresh();
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/labels/${label.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? `Error ${res.status}`);
        return;
      }
      setOpen(false);
      router.refresh();
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => { setName(label.name); setError(""); setOpen(true); }}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
        aria-label={`Edit label ${label.name}`}
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Label</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="label-name">Name</Label>
              <Input
                id="label-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRename()}
                disabled={loading}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <DialogFooter className="flex-row justify-between sm:justify-between gap-2">
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
              size="sm"
            >
              Delete Label
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)} disabled={loading} size="sm">
                Cancel
              </Button>
              <Button onClick={handleRename} disabled={loading || !name.trim() || name.trim() === label.name} size="sm">
                Save
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
