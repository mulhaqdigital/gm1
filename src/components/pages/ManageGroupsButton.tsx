"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Settings2, X, Users, SearchX } from "lucide-react";

interface GroupItem {
  id: string;
  name: string;
}

export function ManageGroupsButton({
  pageId,
  linkedGroups,
}: {
  pageId: string;
  linkedGroups: GroupItem[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<GroupItem[]>(linkedGroups);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<GroupItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);

  async function searchGroups(q: string) {
    setSearch(q);
    if (!q.trim()) { setResults([]); return; }
    setSearching(true);
    const res = await fetch(`/api/groups?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setResults(data);
    setSearching(false);
  }

  async function patch(newGroups: GroupItem[]) {
    setSaving(true);
    const res = await fetch(`/api/pages/${pageId}/groups`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupIds: newGroups.map((g) => g.id) }),
    });
    setSaving(false);
    if (!res.ok) { toast.error("Failed to update groups"); return false; }
    return true;
  }

  async function handleAdd(group: GroupItem) {
    if (current.some((g) => g.id === group.id)) return;
    const next = [...current, group];
    if (await patch(next)) {
      setCurrent(next);
      setSearch("");
      setResults([]);
      toast.success(`Linked "${group.name}"`);
      router.refresh();
    }
  }

  async function handleRemove(groupId: string) {
    const next = current.filter((g) => g.id !== groupId);
    if (await patch(next)) {
      setCurrent(next);
      toast.success("Group unlinked");
      router.refresh();
    }
  }

  const linkedIds = new Set(current.map((g) => g.id));
  const filteredResults = results.filter((g) => !linkedIds.has(g.id));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 px-2">
          <Settings2 className="h-3.5 w-3.5 mr-1" />
          Manage groups
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">

        <div className="px-6 pt-5 pb-6 space-y-4">
        <DialogHeader>
          <DialogTitle>Linked groups</DialogTitle>
        </DialogHeader>

        {/* Current linked groups */}
        <div className="space-y-2">
          {current.length === 0 ? (
            <div className="flex items-center gap-2 text-muted-foreground py-1">
              <Users className="h-4 w-4 opacity-40" />
              <p className="text-sm">No groups linked yet</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {current.map((g) => (
                <Badge key={g.id} variant="secondary" className="gap-1 pr-1">
                  {g.name}
                  <button
                    onClick={() => handleRemove(g.id)}
                    disabled={saving}
                    className="ml-1 rounded hover:text-destructive transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Search to add */}
        <div className="space-y-2 pt-2 border-t">
          <Input
            placeholder="Search groups to link…"
            value={search}
            onChange={(e) => searchGroups(e.target.value)}
            autoFocus
          />
          <div className="max-h-52 overflow-y-auto space-y-1">
            {searching ? (
              <p className="text-sm text-muted-foreground py-2 text-center">Searching…</p>
            ) : filteredResults.length > 0 ? (
              filteredResults.map((g) => (
                <div
                  key={g.id}
                  className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-muted"
                >
                  <span className="text-sm">{g.name}</span>
                  <Button size="sm" variant="secondary" disabled={saving} onClick={() => handleAdd(g)}>
                    Link
                  </Button>
                </div>
              ))
            ) : search && !searching ? (
              <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
                <SearchX className="h-7 w-7 opacity-30" />
                <p className="text-sm">No groups found</p>
              </div>
            ) : null}
          </div>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
