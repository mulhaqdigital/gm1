import type { Metadata } from "next";
import { db } from "@/db";
import { groups } from "@/db/schema";
import { eq } from "drizzle-orm";
import { extractUuid, groupUrl } from "@/lib/slugify";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const id = extractUuid(slug);
  if (!id) return { title: "Group not found | GM1" };

  const group = await db.query.groups.findFirst({
    where: eq(groups.id, id),
    columns: { id: true, name: true, description: true, logoUrl: true },
  });
  if (!group) return { title: "Group not found | GM1" };

  const url = `${BASE_URL}${groupUrl(group.id, group.name)}`;
  const description = group.description ?? "Join this group on GM1";

  return {
    title: `${group.name} | GM1`,
    description,
    openGraph: {
      title: group.name,
      description,
      url,
      siteName: "GM1",
      type: "website",
      ...(group.logoUrl && {
        images: [{ url: group.logoUrl, width: 400, height: 400, alt: group.name }],
      }),
    },
  };
}

export default function GroupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
