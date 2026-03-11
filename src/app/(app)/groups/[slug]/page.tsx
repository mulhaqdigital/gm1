"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GroupAvatar } from "@/components/groups/GroupAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Users, FileText, LayoutGrid, List, Settings, Pencil, LogOut, Trash2 } from "lucide-react";
import { ShareButton } from "@/components/ShareButton";
import { extractUuid, groupUrl, pageUrl } from "@/lib/slugify";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageCover } from "@/components/pages/PageCover";
import { PageTree } from "@/components/pages/PageTree";
import { LinkPageButton } from "@/components/groups/LinkPageButton";
import { InviteMemberButton } from "@/components/groups/InviteMemberButton";
import { EditGroupDialog } from "@/components/groups/EditGroupDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { getAvatarColor, getDiceBearUrl } from "@/lib/avatar-color";
import { useLoginDialog } from "@/components/auth/LoginDialogProvider";

interface FlatPage { id: string; title: string; pictureUrl?: string | null; parentPageId?: string | null; children?: FlatPage[] }

function buildPageTree(pages: FlatPage[]): FlatPage[] {
  const map = new Map(pages.map((p) => [p.id, { ...p, children: [] as FlatPage[] }]));
  const roots: FlatPage[] = [];
  for (const page of map.values()) {
    const parent = page.parentPageId ? map.get(page.parentPageId) : null;
    if (parent) parent.children!.push(page);
    else roots.push(page);
  }
  return roots;
}

export default function GroupPage() {
  const { slug } = useParams<{ slug: string }>();
  const id = extractUuid(slug) ?? "";
  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null | undefined>(undefined); // undefined = auth loading
  const router = useRouter();
  const { openLoginDialog } = useLoginDialog();
  const [joining, setJoining] = useState(false);
  const [pagesView, setPagesView] = useState<"grid" | "tree">("grid");
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null));
    fetch(`/api/groups/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setGroup(data);
        // Redirect to canonical slug URL if name changed or bare UUID was used
        if (data?.id && data?.name) {
          const canonical = groupUrl(data.id, data.name).slice("/groups/".length);
          if (slug !== canonical) router.replace(groupUrl(data.id, data.name));
        }
      })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const myMembership = group?.memberships?.find((m: any) => m.userId === currentUserId);
  const isMember = !!myMembership;
  const isCreator = group?.createdBy === currentUserId;

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

  // Auto-join after sign-in redirect
  useEffect(() => {
    const autoJoin = new URLSearchParams(window.location.search).get("autoJoin");
    if (autoJoin !== "1") return;
    if (currentUserId === undefined || loading) return; // still loading
    if (!currentUserId) return; // not signed in
    if (isMember) return; // already a member
    router.replace(group ? groupUrl(group.id, group.name) : `/groups/${slug}`); // clean URL
    handleJoin();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId, loading]);

  async function handleDelete() {
    if (!confirm(`Delete "${group.name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/groups/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Group deleted");
      router.push("/groups");
    } else {
      toast.error("Failed to delete group");
    }
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

        {/* Header row: avatar + gear */}
        <div className="flex items-start justify-between">
          <GroupAvatar name={group.name} logoUrl={group.logoUrl} className="h-14 w-14" rounded="xl" />
          {currentUserId && (isMember || isCreator) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                {myMembership?.role === "admin" && (
                  <DropdownMenuItem onClick={() => setEditOpen(true)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit group
                  </DropdownMenuItem>
                )}
                {isMember && !isCreator && (
                  <DropdownMenuItem onClick={handleLeave} disabled={joining}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Leave group
                  </DropdownMenuItem>
                )}
                {isCreator && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleDelete}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete group
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

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

        {/* Join — guests only */}
        {currentUserId === undefined ? null : currentUserId === null ? (
          <Button size="sm" className="w-full" onClick={() => openLoginDialog(`/groups/${slug}?autoJoin=1`)}>
            Join group
          </Button>
        ) : !isMember ? (
          <Button size="sm" className="w-full" onClick={handleJoin} disabled={joining}>
            {joining ? "…" : "Join group"}
          </Button>
        ) : null}

        {/* Share */}
        <ShareButton
          title={group?.name ?? "Group"}
          description={group?.description}
          variant="ghost"
          className="w-full text-muted-foreground justify-start"
        />
      </aside>

      {/* Edit dialog */}
      {editOpen && (
        <EditGroupDialog
          groupId={id}
          initial={{ name: group.name, description: group.description, logoUrl: group.logoUrl }}
          open={editOpen}
          onOpenChange={setEditOpen}
          onSaved={(updated) => setGroup((g: any) => ({ ...g, ...updated }))}
        />
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-8">

        {/* Members grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Members ({group.memberships?.length ?? 0})</h2>
            {myMembership?.role === "admin" && <InviteMemberButton groupId={id} />}
          </div>
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
              Linked pages ({group.pageGroups?.length ?? 0})
            </h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center border rounded-md overflow-hidden">
                <button
                  onClick={() => setPagesView("grid")}
                  className={`p-1.5 transition-colors ${pagesView === "grid" ? "bg-muted" : "hover:bg-muted/50"}`}
                  title="Grid view"
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setPagesView("tree")}
                  className={`p-1.5 transition-colors ${pagesView === "tree" ? "bg-muted" : "hover:bg-muted/50"}`}
                  title="Tree view"
                >
                  <List className="h-3.5 w-3.5" />
                </button>
              </div>
              <LinkPageButton
                groupId={id}
                linkedPages={group.pageGroups.map((pg: any) => ({ id: pg.page.id, title: pg.page.title }))}
              />
            </div>
          </div>

          {group.pageGroups?.length === 0 && (
            <p className="text-sm text-muted-foreground">No pages linked yet.</p>
          )}

          {pagesView === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {group.pageGroups?.map((pg: any) => (
                <Link key={pg.page.id} href={pageUrl(pg.page.id, pg.page.title)}>
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
          ) : (
            <div className="border rounded-lg p-3">
              <PageTree pages={buildPageTree((group.pageGroups ?? []).map((pg: any) => pg.page))} />
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
