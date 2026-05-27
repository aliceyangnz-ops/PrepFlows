import {
  pgTable,
  text,
  integer,
  boolean,
  jsonb,
  timestamp,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const functionStatusEnum = pgEnum("function_status", [
  "upcoming",
  "active",
  "completed",
]);
export const functionTypeEnum = pgEnum("function_type", [
  "A-la-carte",
  "Buffet",
  "Cocktail",
  "Canapés",
  "Canapés + A-la-carte",
  "School Ball",
  "Set Menu",
  "High Tea",
]);
export const importStatusEnum = pgEnum("import_status", [
  "pending",
  "processing",
  "completed",
  "failed",
]);

export const kitchenFunctionsTable = pgTable("kitchen_functions", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  room: text("room").notNull().default(""),
  floor: text("floor").notNull().default(""),
  functionType: functionTypeEnum("function_type")
    .notNull()
    .default("A-la-carte"),
  date: text("date"),
  startTime: text("start_time").notNull().default(""),
  endTime: text("end_time").notNull().default(""),
  guestCount: integer("guest_count").notNull().default(0),
  status: functionStatusEnum("status").notNull().default("upcoming"),
  menu: jsonb("menu").$type<string[]>().notNull().default([]),
  dietaryRequirements: jsonb("dietary_requirements")
    .$type<Array<{ name: string; count: number; note?: string }>>()
    .notNull()
    .default([]),
  serviceTimes: jsonb("service_times").$type<Record<string, string>>(),
  serviceEvents:
    jsonb("service_events").$type<Array<{ time: string; label: string }>>(),
  teamIds: jsonb("team_ids").$type<string[]>().notNull().default([]),
  timeline: jsonb("timeline")
    .$type<
      Array<{
        id: string;
        time: string;
        task: string;
        category: string;
        completed: boolean;
      }>
    >()
    .notNull()
    .default([]),
  chefInCharge: text("chef_in_charge"),
  importJobId: text("import_job_id"),
  sourceSystem: text("source_system"),
  // Workspace / auth columns — nullable until multi-tenancy is enabled
  workspaceId: uuid("workspace_id"),
  createdBy: uuid("created_by"),
  updatedBy: uuid("updated_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const importJobsTable = pgTable("import_jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  status: importStatusEnum("status").notNull().default("pending"),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull().default(0),
  uploadedBy: text("uploaded_by").notNull().default("unknown"),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  totalRows: integer("total_rows").notNull().default(0),
  importedRows: integer("imported_rows").notNull().default(0),
  failedRows: integer("failed_rows").notNull().default(0),
  sourceSystem: text("source_system").notNull().default("moments_explorer"),
  columnMapping: jsonb("column_mapping").$type<Record<string, string>>(),
  errors: jsonb("errors")
    .$type<Array<{ row: number; field: string; message: string }>>()
    .notNull()
    .default([]),
  warnings: jsonb("warnings")
    .$type<Array<{ row: number; field: string; message: string }>>()
    .notNull()
    .default([]),
  rawPreview: jsonb("raw_preview").$type<Record<string, unknown>[]>(),
  workspaceId: uuid("workspace_id"),
  createdBy: uuid("created_by"),
});

export const insertKitchenFunctionSchema = createInsertSchema(
  kitchenFunctionsTable,
);
export const selectKitchenFunctionSchema = createSelectSchema(
  kitchenFunctionsTable,
);
export type KitchenFunctionRow = typeof kitchenFunctionsTable.$inferSelect;
export type InsertKitchenFunctionRow =
  typeof kitchenFunctionsTable.$inferInsert;

export const insertImportJobSchema = createInsertSchema(importJobsTable);
export const selectImportJobSchema = createSelectSchema(importJobsTable);
export type ImportJobRow = typeof importJobsTable.$inferSelect;
export type InsertImportJobRow = typeof importJobsTable.$inferInsert;

export const ParsedImportRowSchema = z.object({
  name: z.string(),
  date: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  venue: z.string().optional(),
  room: z.string().optional(),
  floor: z.string().optional(),
  pax: z.number().optional(),
  menu: z.string().optional(),
  dietaryNotes: z.string().optional(),
  eventNotes: z.string().optional(),
  functionType: z.string().optional(),
  chefInCharge: z.string().optional(),
});
export type ParsedImportRow = z.infer<typeof ParsedImportRowSchema>;
