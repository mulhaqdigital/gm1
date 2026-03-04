import Link from "next/link";
import Image from "next/image";
import { MemberAvatars } from "@/components/groups/MemberAvatars";
import { PageCover } from "@/components/pages/PageCover";

interface Member {
  id: string;
  name: string;
  pictureUrl?: string | null;
}

interface PageCardProps {
  page: {
    id: string;
    title: string;
    description?: string | null;
    pictureUrl?: string | null;
    pageGroups?: {
      group: {
        memberships?: { user: Member }[];
      };
    }[];
  };
}

export function PageCard({ page }: PageCardProps) {
  const allMembers: Member[] = [];
  const seen = new Set<string>();
  page.pageGroups?.forEach((pg) => {
    pg.group.memberships?.forEach((m) => {
      if (!seen.has(m.user.id)) {
        seen.add(m.user.id);
        allMembers.push(m.user);
      }
    });
  });

  return (
    <Link href={`/pages/${page.id}`}>
      <div className="border rounded-lg overflow-hidden hover:border-foreground/30 hover:shadow-sm transition-all bg-card cursor-pointer h-full flex flex-col">
        {/* Image top */}
        <div className="relative w-full aspect-square">
          {page.pictureUrl ? (
            <Image src={page.pictureUrl} alt={page.title} fill className="object-cover" />
          ) : (
            <PageCover title={page.title} className="w-full h-full flex items-center justify-center" />
          )}
        </div>

        {/* Content below */}
        <div className="p-3 flex flex-col gap-1 flex-1">
          <p className="font-semibold line-clamp-1 text-sm">{page.title}</p>
          {page.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">{page.description}</p>
          )}
          {allMembers.length > 0 && (
            <div className="mt-auto pt-2">
              <MemberAvatars members={allMembers} max={6} />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
