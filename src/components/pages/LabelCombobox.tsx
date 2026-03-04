"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface LabelOption {
  id: string;
  name: string;
}

interface LabelComboboxProps {
  value: LabelOption | null;
  onChange: (label: LabelOption) => void;
}

export function LabelCombobox({ value, onChange }: LabelComboboxProps) {
  const [query, setQuery] = useState(value?.name ?? "");
  const [results, setResults] = useState<LabelOption[]>([]);
  const [creating, setCreating] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/api/labels?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data);
    }, 200);
  }, [query]);

  const exactMatch = results.some((r) => r.name.toLowerCase() === query.trim().toLowerCase());
  const showCreate = query.trim().length > 0 && !exactMatch;

  async function handleCreate() {
    setCreating(true);
    const res = await fetch("/api/labels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: query.trim() }),
    });
    const label = await res.json();
    setCreating(false);
    onChange(label);
  }

  return (
    <div className="space-y-2">
      <Input
        placeholder="Search or create a label…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
      />
      <div className="max-h-48 overflow-y-auto space-y-1">
        {results.map((label) => (
          <button
            key={label.id}
            type="button"
            className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-muted text-left"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onChange(label)}
          >
            <span className="text-sm">{label.name}</span>
            {value?.id === label.id && (
              <span className="text-xs text-muted-foreground">selected</span>
            )}
          </button>
        ))}
        {showCreate && (
          <Button
            size="sm"
            variant="ghost"
            className="w-full justify-start gap-2"
            disabled={creating}
            onClick={handleCreate}
          >
            <Plus className="h-3.5 w-3.5" />
            Create &quot;{query.trim()}&quot;
          </Button>
        )}
      </div>
    </div>
  );
}
