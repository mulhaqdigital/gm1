import {
  pgTable,
  uuid,
  text,
  timestamp,
  primaryKey,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ------------------------------------------------------------------
// Profiles (extends Supabase auth.users)
// ------------------------------------------------------------------
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(), // matches auth.users.id
  name: text("name").notNull(),
  phone: text("phone"),
  pictureUrl: text("picture_url"),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ------------------------------------------------------------------
// Groups
// ------------------------------------------------------------------
export const groups = pgTable("groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  logoUrl: text("logo_url"),
  createdBy: uuid("created_by").references(() => profiles.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ------------------------------------------------------------------
// Group Memberships
// ------------------------------------------------------------------
export const groupMemberships = pgTable(
  "group_memberships",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    groupId: uuid("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    role: text("role").$type<"admin" | "member">().notNull().default("member"),
    joinedAt: timestamp("joined_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.groupId] })]
);

// ------------------------------------------------------------------
// Pages
// ------------------------------------------------------------------
export const pages = pgTable("pages", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  pictureUrl: text("picture_url"),
  parentPageId: uuid("parent_page_id"), // self-reference added via relations
  sortOrder: integer("sort_order").default(0).notNull(),
  labelId: uuid("label_id").references(() => labels.id),
  createdBy: uuid("created_by").references(() => profiles.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ------------------------------------------------------------------
// Labels
// ------------------------------------------------------------------
export const labels = pgTable("labels", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ------------------------------------------------------------------
// Page <-> Group links
// ------------------------------------------------------------------
export const pageGroups = pgTable(
  "page_groups",
  {
    pageId: uuid("page_id")
      .notNull()
      .references(() => pages.id, { onDelete: "cascade" }),
    groupId: uuid("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.pageId, t.groupId] })]
);

// ------------------------------------------------------------------
// Group Invites
// ------------------------------------------------------------------
export const groupInvites = pgTable("group_invites", {
  id: uuid("id").primaryKey().defaultRandom(),
  groupId: uuid("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  invitedBy: uuid("invited_by").notNull().references(() => profiles.id),
  email: text("email").notNull(),
  token: uuid("token").defaultRandom().notNull().unique(),
  status: text("status").$type<"pending" | "accepted" | "declined">().default("pending").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ------------------------------------------------------------------
// Relations
// ------------------------------------------------------------------
export const profilesRelations = relations(profiles, ({ many }) => ({
  groupMemberships: many(groupMemberships),
  createdGroups: many(groups),
  createdPages: many(pages),
}));

export const groupsRelations = relations(groups, ({ one, many }) => ({
  creator: one(profiles, { fields: [groups.createdBy], references: [profiles.id] }),
  memberships: many(groupMemberships),
  pageGroups: many(pageGroups),
  invites: many(groupInvites),
}));

export const groupInvitesRelations = relations(groupInvites, ({ one }) => ({
  group: one(groups, { fields: [groupInvites.groupId], references: [groups.id] }),
  inviter: one(profiles, { fields: [groupInvites.invitedBy], references: [profiles.id] }),
}));

export const groupMembershipsRelations = relations(groupMemberships, ({ one }) => ({
  user: one(profiles, { fields: [groupMemberships.userId], references: [profiles.id] }),
  group: one(groups, { fields: [groupMemberships.groupId], references: [groups.id] }),
}));

export const labelsRelations = relations(labels, ({ many }) => ({
  pages: many(pages),
}));

export const pagesRelations = relations(pages, ({ one, many }) => ({
  parent: one(pages, { fields: [pages.parentPageId], references: [pages.id], relationName: "pageHierarchy" }),
  children: many(pages, { relationName: "pageHierarchy" }),
  creator: one(profiles, { fields: [pages.createdBy], references: [profiles.id] }),
  label: one(labels, { fields: [pages.labelId], references: [labels.id] }),
  pageGroups: many(pageGroups),
}));

export const pageGroupsRelations = relations(pageGroups, ({ one }) => ({
  page: one(pages, { fields: [pageGroups.pageId], references: [pages.id] }),
  group: one(groups, { fields: [pageGroups.groupId], references: [groups.id] }),
}));

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------
export type Profile = typeof profiles.$inferSelect;
export type Group = typeof groups.$inferSelect;
export type GroupMembership = typeof groupMemberships.$inferSelect;
export type Page = typeof pages.$inferSelect;
export type PageGroup = typeof pageGroups.$inferSelect;
export type Label = typeof labels.$inferSelect;

export type NewGroup = typeof groups.$inferInsert;
export type NewPage = typeof pages.$inferInsert;
export type GroupInvite = typeof groupInvites.$inferSelect;
