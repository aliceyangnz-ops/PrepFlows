import {
  pgTable,
  text,
  boolean,
  jsonb,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { kitchenFunctionsTable } from "./kitchen";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

// ── workspaces ───────────────────────────────────────────────────────────────
// Future multi-property anchor — one workspace per kitchen operation.

export const workspacesTable = pgTable("workspaces", {
  id:        uuid("id").primaryKey().defaultRandom(),
  name:      text("name").notNull(),
  slug:      text("slug").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── profiles ─────────────────────────────────────────────────────────────────
// Auth bridge: maps a future auth.users row to a staff member + workspace.
// id is intentionally the same UUID as auth.users.id (enforced at app layer).

export const profilesTable = pgTable("profiles", {
  id:            uuid("id").primaryKey(),
  staffMemberId: text("staff_member_id"),
  workspaceId:   uuid("workspace_id"),
  createdAt:     timestamp("created_at").notNull().defaultNow(),
});

// ── staff_members ─────────────────────────────────────────────────────────────
// Normalised copy of AsyncStorage @kitchen_staff_v1.

export const staffMembersTable = pgTable("staff_members", {
  id:           text("id").primaryKey(),
  staffNumber:  text("staff_number").notNull().default(""),
  name:         text("name").notNull(),
  role:         text("role").notNull(),
  phone:        text("phone"),
  pin:          text("pin"),
  shiftStart:   text("shift_start").notNull().default(""),
  shiftEnd:     text("shift_end").notNull().default(""),
  functionIds:  jsonb("function_ids").$type<string[]>().notNull().default([]),
  teamLeadFor:  text("team_lead_for"),
  section:      text("section"),
  accessLevel:  text("access_level"),
  workspaceId:  uuid("workspace_id"),
  createdBy:    uuid("created_by"),
  updatedBy:    uuid("updated_by"),
  createdAt:    timestamp("created_at").notNull().defaultNow(),
  updatedAt:    timestamp("updated_at").notNull().defaultNow(),
});

// ── prep_items ───────────────────────────────────────────────────────────────
// Normalised copy of AsyncStorage @kitchen_prep_v4.

export const prepItemsTable = pgTable("prep_items", {
  id:           text("id").primaryKey(),
  functionId:   text("function_id").notNull().references(() => kitchenFunctionsTable.id, { onDelete: "cascade" }),
  category:     text("category").notNull().default(""),
  team:         text("team").notNull().default(""),
  dish:         text("dish").notNull().default(""),
  quantity:     text("quantity").notNull().default(""),
  deadline:     text("deadline").notNull().default(""),
  prepDay:      text("prep_day").notNull().default("day-of"),
  note:         text("note").notNull().default(""),
  completed:    boolean("completed").notNull().default(false),
  completedBy:  uuid("completed_by"),
  completedAt:  timestamp("completed_at"),
  workspaceId:  uuid("workspace_id"),
  createdAt:    timestamp("created_at").notNull().defaultNow(),
  updatedAt:    timestamp("updated_at").notNull().defaultNow(),
});

// ── broadcast_messages ───────────────────────────────────────────────────────
// Kitchen-wide announcements (maps to AsyncStorage @kitchen_broadcast).

export const broadcastMessagesTable = pgTable("broadcast_messages", {
  id:          text("id").primaryKey(),
  text:        text("text").notNull(),
  senderName:  text("sender_name").notNull().default(""),
  senderRole:  text("sender_role").notNull().default(""),
  /** Future auth link — maps to auth.users.id once auth is enabled */
  senderId:    uuid("sender_id"),
  sentAt:      text("sent_at").notNull().default(""),
  isActive:    boolean("is_active").notNull().default(true),
  /** Array of staff IDs (from staff_members.id) who have dismissed this broadcast */
  dismissedBy: jsonb("dismissed_by").$type<string[]>().default([]),
  workspaceId: uuid("workspace_id"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
});

// ── Zod schemas + inferred types ─────────────────────────────────────────────

export const insertWorkspaceSchema = createInsertSchema(workspacesTable);
export const selectWorkspaceSchema = createSelectSchema(workspacesTable);
export type WorkspaceRow = typeof workspacesTable.$inferSelect;
export type InsertWorkspaceRow = typeof workspacesTable.$inferInsert;

export const insertProfileSchema = createInsertSchema(profilesTable);
export const selectProfileSchema = createSelectSchema(profilesTable);
export type ProfileRow = typeof profilesTable.$inferSelect;
export type InsertProfileRow = typeof profilesTable.$inferInsert;

export const insertStaffMemberSchema = createInsertSchema(staffMembersTable);
export const selectStaffMemberSchema = createSelectSchema(staffMembersTable);
export type StaffMemberRow = typeof staffMembersTable.$inferSelect;
export type InsertStaffMemberRow = typeof staffMembersTable.$inferInsert;

export const insertPrepItemSchema = createInsertSchema(prepItemsTable);
export const selectPrepItemSchema = createSelectSchema(prepItemsTable);
export type PrepItemRow = typeof prepItemsTable.$inferSelect;
export type InsertPrepItemRow = typeof prepItemsTable.$inferInsert;

export const insertBroadcastMessageSchema = createInsertSchema(broadcastMessagesTable);
export const selectBroadcastMessageSchema = createSelectSchema(broadcastMessagesTable);
export type BroadcastMessageRow = typeof broadcastMessagesTable.$inferSelect;
export type InsertBroadcastMessageRow = typeof broadcastMessagesTable.$inferInsert;
