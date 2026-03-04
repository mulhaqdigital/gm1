"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { LabelCombobox } from "./LabelCombobox";
import { toast } from "sonner";
import { Tag } from "lucide-react";

interface LabelOption {
  id: string;
  name: string;
}

export function EditLabelButton({
  pageId,
  label,
}: {
  pageId: string;
  label: LabelOption | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleChange(newLabel: LabelOption) {
    setSaving(true);
    const res = await fetch(`/api/pages/${pageId}/label`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ labelId: newLabel.id }),
    });
    setSaving(false);
    if (!res.ok) {
      toast.error("Failed to update label");
      return;
    }
    toast.success(`Label set to "${newLabel.name}"`);
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
          disabled={saving}
        >
          <Tag className="h-3.5 w-3.5 text-muted-foreground" />
          {label ? (
            <Badge variant="outline" className="text-xs cursor-pointer">
              {label.name}
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground">Add label</span>
          )}
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set label</DialogTitle>
        </DialogHeader>
        <LabelCombobox value={label} onChange={handleChange} />
      </DialogContent>
    </Dialog>
  );
}
