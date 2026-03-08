"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Suspense } from "react";

function InvitePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [userId, setUserId] = useState<string | null | undefined>(undefined); // undefined = loading
  const [accepting, setAccepting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  async function handleAccept() {
    if (!token) return;
    setAccepting(true);
    const res = await fetch(`/api/invites/${token}/accept`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      setDone(true);
      toast.success("You've joined the group!");
      setTimeout(() => router.push(`/groups/${data.groupId}`), 1500);
    } else {
      setError(data.error ?? "Failed to accept invite");
      toast.error(data.error ?? "Failed to accept invite");
    }
    setAccepting(false);
  }

  if (!token) {
    return <ErrorState message="Invalid invite link." />;
  }

  if (userId === undefined) {
    return <PageShell><Skeleton className="h-10 w-48" /></PageShell>;
  }

  if (done) {
    return (
      <PageShell>
        <p className="text-lg font-semibold">You're in!</p>
        <p className="text-muted-foreground text-sm">Redirecting to the group…</p>
      </PageShell>
    );
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!userId) {
    return (
      <PageShell>
        <p className="font-semibold text-lg">You've been invited to join a group</p>
        <p className="text-muted-foreground text-sm">Sign in to accept this invite.</p>
        <Button onClick={() => router.push(`/login?next=/invite?token=${token}`)}>
          Sign in to accept
        </Button>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <p className="font-semibold text-lg">You've been invited to join a group</p>
      <p className="text-muted-foreground text-sm">Click below to accept and join.</p>
      <Button onClick={handleAccept} disabled={accepting}>
        {accepting ? "Joining…" : "Accept invite"}
      </Button>
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="border rounded-xl p-10 max-w-sm w-full flex flex-col items-center gap-4 text-center shadow-sm">
        {children}
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <PageShell>
      <p className="font-semibold text-lg text-destructive">Invite invalid</p>
      <p className="text-muted-foreground text-sm">{message}</p>
    </PageShell>
  );
}

export default function InvitePageWrapper() {
  return (
    <Suspense>
      <InvitePage />
    </Suspense>
  );
}
