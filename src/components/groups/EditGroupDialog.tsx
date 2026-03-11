"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Props {
  groupId: string;
  initial: { name: string; description?: string | null; logoUrl?: string | null };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (updated: { name: string; description?: string | null; logoUrl?: string | null }) => void;
}

export function EditGroupDialog({ groupId, initial, open, onOpenChange, onSaved }: Props) {
  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    const res = await fetch(`/api/groups/${groupId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), description: description.trim() || null }),
    });
    if (res.ok) {
      const updated = await res.json();
      toast.success("Group updated");
      onSaved(updated);
      onOpenChange(false);
    } else {
      toast.error("Failed to update group");
    }
    setSaving(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit group</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="group-name">Name</Label>
            <Input
              id="group-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Group name"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="group-desc">Description</Label>
            <Textarea
              id="group-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this group about?"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !name.trim()}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
