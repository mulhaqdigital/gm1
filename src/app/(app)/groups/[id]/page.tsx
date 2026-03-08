"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Users, FileText } from "lucide-react";
import Link from "next/link";
import { PageCover } from "@/components/pages/PageCover";
import { LinkPageButton } from "@/components/groups/LinkPageButton";
import Image from "next/image";
import { getAvatarColor, getDiceBearUrl } from "@/lib/avatar-color";

export default function GroupPage() {
  const { id } = useParams<{ id: string }>();
  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null));
    fetch(`/api/groups/${id}`)
      .then((r) => r.json())
      .then(setGroup)
      .finally(() => setLoading(false));
  }, [id]);

  const myMembership = group?.memberships?.find((m: any) => m.userId === currentUserId);
  const isMember = !!myMembership;

  async function handleJoin() {
    setJoining(true);
    const res = await fetch(`/api/groups/${id}/join`, { method: "POST" });
    if (res.ok) {
      toast.success("Joined group!");
      setGroup((g: any) => ({
        ...g,
        memberships: [...(g.memberships ?? []), { userId: currentUserId, role: "member", user: { id: currentUserId, name: "You", pictureUrl: null } }],
      }));
    } else {
      toast.error("Failed to join");
    }
    setJoining(false);
  }

  async function handleLeave() {
    setJoining(true);
    const res = await fetch(`/api/groups/${id}/leave`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Left group");
      setGroup((g: any) => ({
        ...g,
        memberships: g.memberships.filter((m: any) => m.userId !== currentUserId),
      }));
    } else {
      toast.error("Failed to leave");
    }
    setJoining(false);
  }

  if (loading) {
    return (
      <div className="flex flex-col md:flex-row gap-6 md:items-start">
        <div className="w-full md:w-56 shrink-0 rounded-xl border p-5 space-y-4">
          <Skeleton className="h-14 w-14 rounded-xl" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-full" />
        </div>
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!group) return <p className="text-muted-foreground">Group not found.</p>;

  return (
    <div className="flex flex-col md:flex-row gap-6 md:items-start">
      {/* Sidebar */}
      <aside className="w-full md:w-56 shrink-0 rounded-xl border p-5 space-y-4 md:sticky md:top-20">
        <Avatar className="h-14 w-14 rounded-xl">
          <AvatarImage src={group.logoUrl} />
          <AvatarFallback className="rounded-xl text-lg font-bold text-white" style={{ background: getAvatarColor(group.name) }}>
            {group.name[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div>
          <h1 className="font-bold text-lg leading-tight">{group.name}</h1>
          {group.description && (
            <p className="text-muted-foreground text-sm mt-1">{group.description}</p>
          )}
        </div>

        <Separator />

        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{group.memberships?.length ?? 0} members</span>
        </div>

        {myMembership?.role === "admin" && (
          <Badge variant="secondary" className="w-fit">Admin</Badge>
        )}

        {currentUserId && (
          isMember ? (
            <Button variant="outline" size="sm" className="w-full" onClick={handleLeave} disabled={joining}>
              {joining ? "…" : "Leave group"}
            </Button>
          ) : (
            <Button size="sm" className="w-full" onClick={handleJoin} disabled={joining}>
              {joining ? "…" : "Join group"}
            </Button>
          )
        )}
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-8">

        {/* Members grid */}
        <div>
          <h2 className="font-semibold mb-4">Members ({group.memberships?.length ?? 0})</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {group.memberships?.map((m: any) => (
              <div key={m.userId} className="flex items-center gap-2.5 rounded-lg border p-3">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={m.user?.pictureUrl ?? getDiceBearUrl(m.userId)} />
                  <AvatarFallback className="text-xs text-white" style={{ background: getAvatarColor(m.user?.name ?? m.userId) }}>{m.user?.name?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{m.user?.name}</p>
                  {m.role === "admin" && (
                    <p className="text-xs text-muted-foreground">Admin</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Linked pages */}
        <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Linked pages ({group.pageGroups.length})
              </h2>
              <LinkPageButton
                groupId={id}
                linkedPages={group.pageGroups.map((pg: any) => ({ id: pg.page.id, title: pg.page.title }))}
              />
            </div>
          {group.pageGroups?.length === 0 && (
            <p className="text-sm text-muted-foreground">No pages linked yet.</p>
          )}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {group.pageGroups?.map((pg: any) => (
                <Link key={pg.page.id} href={`/pages/${pg.page.id}`}>
                  <div className="border rounded-md overflow-hidden hover:border-foreground/30 hover:shadow-sm transition-all bg-card cursor-pointer">
                    <div className="relative w-full aspect-square">
                      {pg.page.pictureUrl ? (
                        <Image src={pg.page.pictureUrl} alt={pg.page.title} fill className="object-cover" />
                      ) : (
                        <PageCover title={pg.page.title} className="w-full h-full flex items-center justify-center" />
                      )}
                    </div>
                    <div className="p-1.5">
                      <p className="text-xs font-medium line-clamp-1">{pg.page.title}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

      </div>
    </div>
  );
}
