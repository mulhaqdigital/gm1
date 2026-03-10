"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { UserPlus, X, RotateCcw, MailOpen } from "lucide-react";

interface Invite {
  id: string;
  email: string;
  status: string;
  expiresAt: string;
  createdAt: string;
}

export function InviteMemberButton({ groupId }: { groupId: string }) {
  const [open, setOpen] = useState(false);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loadingInvites, setLoadingInvites] = useState(false);
  const [input, setInput] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [canceling, setCanceling] = useState<string | null>(null);
  const [resending, setResending] = useState<string | null>(null);

  async function handleOpen(val: boolean) {
    setOpen(val);
    if (val) {
      setLoadingInvites(true);
      const res = await fetch(`/api/groups/${groupId}/invites`);
      if (res.ok) setInvites(await res.json());
      setLoadingInvites(false);
    } else {
      setInput("");
      setEmails([]);
    }
  }

  function addEmail(raw: string) {
    const trimmed = raw.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return;
    if (!emails.includes(trimmed)) setEmails((prev) => [...prev, trimmed]);
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addEmail(input);
    } else if (e.key === "Backspace" && !input) {
      setEmails((prev) => prev.slice(0, -1));
    }
  }

  async function handleSend() {
    const toSend = [...emails];
    if (input.trim()) toSend.push(input.trim().toLowerCase());
    if (toSend.length === 0) return;

    setSending(true);
    const results = await Promise.all(
      toSend.map((email) =>
        fetch(`/api/groups/${groupId}/invites`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }).then(async (res) => ({ email, ok: res.ok, data: await res.json() }))
      )
    );

    const succeeded = results.filter((r) => r.ok);
    const failed = results.filter((r) => !r.ok);

    if (succeeded.length > 0) {
      toast.success(`Invite${succeeded.length > 1 ? "s" : ""} sent to ${succeeded.map((r) => r.email).join(", ")}`);
      setInvites((prev) => [...succeeded.map((r) => r.data), ...prev]);
    }
    failed.forEach((r) => toast.error(`${r.email}: ${r.data.error ?? "Failed"}`));

    setEmails([]);
    setInput("");
    setSending(false);
  }

  async function handleResend(invite: Invite) {
    setResending(invite.id);
    const res = await fetch(`/api/groups/${groupId}/invites/${invite.id}/resend`, { method: "POST" });
    if (res.ok) {
      toast.success(`Invite resent to ${invite.email}`);
    } else {
      const data = await res.json();
      toast.error(data.error ?? "Failed to resend invite");
    }
    setResending(null);
  }

  async function handleCancel(invite: Invite) {
    setCanceling(invite.id);
    const res = await fetch(`/api/groups/${groupId}/invites/${invite.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success(`Invite to ${invite.email} cancelled`);
      setInvites((prev) => prev.filter((i) => i.id !== invite.id));
    } else {
      toast.error("Failed to cancel invite");
    }
    setCanceling(null);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus className="h-4 w-4 mr-1" />
          Invite member
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md p-0 overflow-hidden">

        <div className="px-6 pt-5 pb-6 space-y-4">
        <DialogHeader>
          <DialogTitle>Invite member</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="invite">
          <TabsList className="w-full">
            <TabsTrigger value="invite" className="flex-1">Invite</TabsTrigger>
            <TabsTrigger value="pending" className="flex-1">
              Pending ({invites.length})
            </TabsTrigger>
          </TabsList>

          {/* Send invite tab */}
          <TabsContent value="invite" className="space-y-3 mt-2">
            <div
              className="flex flex-wrap gap-1.5 min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 cursor-text"
              onClick={() => document.getElementById("invite-email-input")?.focus()}
            >
              {emails.map((e) => (
                <span key={e} className="flex items-center gap-1 bg-secondary text-secondary-foreground rounded px-2 py-0.5 text-sm">
                  {e}
                  <button
                    type="button"
                    className="hover:text-destructive"
                    onClick={() => setEmails((prev) => prev.filter((x) => x !== e))}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <input
                id="invite-email-input"
                type="email"
                placeholder={emails.length === 0 ? "user@example.com" : "Add another…"}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => addEmail(input)}
                className="flex-1 min-w-32 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                autoFocus
              />
            </div>
            <p className="text-xs text-muted-foreground">Press Enter or , to add multiple emails.</p>
            <Button
              className="w-full"
              disabled={(!input.trim() && emails.length === 0) || sending}
              onClick={handleSend}
            >
              {sending ? "Sending…" : `Send invite${emails.length > 1 ? `s (${emails.length})` : ""}`}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Invites expire after 7 days.
            </p>
          </TabsContent>

          {/* Pending invites tab */}
          <TabsContent value="pending" className="mt-2">
            <div className="max-h-64 overflow-y-auto space-y-1">
              {loadingInvites ? (
                <p className="text-sm text-muted-foreground py-6 text-center">Loading…</p>
              ) : invites.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
                  <MailOpen className="h-8 w-8 opacity-30" />
                  <p className="text-sm">No pending invites</p>
                </div>
              ) : (
                invites.map((invite) => (
                  <div key={invite.id} className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-muted">
                    <div className="min-w-0">
                      <p className="text-sm truncate">{invite.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Expires {new Date(invite.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <Badge variant="secondary" className="text-xs">pending</Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        disabled={resending === invite.id}
                        onClick={() => handleResend(invite)}
                        title="Resend invite"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive h-7 w-7 p-0"
                        disabled={canceling === invite.id}
                        onClick={() => handleCancel(invite)}
                        title="Cancel invite"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
