import { db } from "@/db";
import { groupMemberships, profiles } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/** Get the currently authenticated user's ID. Returns null if unauthenticated. */
export async function getAuthUserId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/** Throw a 401 response if not authenticated, otherwise return userId. */
export async function requireAuth(): Promise<string> {
  const userId = await getAuthUserId();
  if (!userId) {
    throw NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return userId;
}

/** Returns true if user is a site-wide admin. */
export async function isSiteAdmin(userId: string): Promise<boolean> {
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, userId),
    columns: { isAdmin: true },
  });
  return profile?.isAdmin ?? false;
}

/** Returns true if user is an admin of the given group. */
export async function isGroupAdmin(userId: string, groupId: string): Promise<boolean> {
  const membership = await db.query.groupMemberships.findFirst({
    where: and(
      eq(groupMemberships.userId, userId),
      eq(groupMemberships.groupId, groupId),
      eq(groupMemberships.role, "admin")
    ),
  });
  return !!membership;
}

/** Returns true if user is a member (any role) of the given group. */
export async function isGroupMember(userId: string, groupId: string): Promise<boolean> {
  const membership = await db.query.groupMemberships.findFirst({
    where: and(
      eq(groupMemberships.userId, userId),
      eq(groupMemberships.groupId, groupId)
    ),
  });
  return !!membership;
}
