import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarColor } from "@/lib/avatar-color";

interface Member {
  id: string;
  name: string;
  pictureUrl?: string | null;
}

interface MemberAvatarsProps {
  members: Member[];
  max?: number;
}

export function MemberAvatars({ members, max = 8 }: MemberAvatarsProps) {
  const visible = members.slice(0, max);
  const overflow = members.length - max;

  return (
    <div className="flex items-center">
      {visible.map((member, i) => (
        <Avatar
          key={member.id}
          className="h-7 w-7 border-2 border-background"
          style={{ marginLeft: i === 0 ? 0 : -8 }}
          title={member.name}
        >
          <AvatarImage src={member.pictureUrl ?? undefined} />
          <AvatarFallback className="text-xs text-white" style={{ background: getAvatarColor(member.name) }}>{member.name[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
      ))}
      {overflow > 0 && (
        <div
          className="h-7 w-7 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs text-muted-foreground font-medium"
          style={{ marginLeft: -8 }}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
