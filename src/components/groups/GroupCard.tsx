import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { GroupAvatar } from "@/components/groups/GroupAvatar";

interface GroupCardProps {
  group: {
    id: string;
    name: string;
    description?: string | null;
    logoUrl?: string | null;
    memberships?: { userId: string }[];
    myRole?: string;
  };
}

export function GroupCard({ group }: GroupCardProps) {
  const memberCount = group.memberships?.length ?? 0;

  return (
    <Link href={`/groups/${group.id}`}>
      <div className="border rounded-lg p-4 hover:border-foreground/30 hover:shadow-sm transition-all bg-card cursor-pointer">
        <div className="flex items-start gap-3">
          <GroupAvatar name={group.name} logoUrl={group.logoUrl} className="h-16 w-16" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold truncate">{group.name}</p>
              {group.myRole === "admin" && (
                <Badge variant="secondary" className="text-xs shrink-0">Admin</Badge>
              )}
            </div>
            {group.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{group.description}</p>
            )}
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>{memberCount} {memberCount === 1 ? "member" : "members"}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
