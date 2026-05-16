/**
 * Supabase sync helpers for KitchenCommand.
 *
 * Each write helper is fire-and-forget: it awaits the Supabase response,
 * checks the .error field (Supabase JS never throws), and warns on failure.
 * The app always continues from AsyncStorage whether Supabase fails or not.
 * Mappers convert between app camelCase types and DB snake_case column names
 * returned by the Supabase REST layer.
 */
import { supabase } from "./supabase";
import type {
  KitchenFunction,
  StaffMember,
  PrepItem,
  BroadcastMessage,
  FunctionType,
  TimelineItem,
  DietaryRequirement,
  ServiceTimes,
  ServiceEvent,
  PrepTeam,
  PrepDay,
  AccessLevel,
} from "../context/KitchenContext";

// ── App → DB row mappers ─────────────────────────────────────────────────────

function fnToRow(fn: KitchenFunction): Record<string, unknown> {
  return {
    id: fn.id,
    name: fn.name,
    room: fn.room,
    floor: fn.floor,
    function_type: fn.functionType,
    date: fn.date ?? null,
    start_time: fn.startTime,
    end_time: fn.endTime,
    guest_count: fn.guestCount,
    status: fn.status,
    menu: fn.menu,
    dietary_requirements: fn.dietaryRequirements,
    service_times: fn.serviceTimes ?? null,
    service_events: fn.serviceEvents ?? null,
    team_ids: fn.teamIds,
    timeline: fn.timeline,
    chef_in_charge: fn.chefInCharge ?? null,
  };
}

function staffToRow(m: StaffMember): Record<string, unknown> {
  return {
    id: m.id,
    staff_number: m.staffNumber,
    name: m.name,
    role: m.role,
    phone: m.phone ?? null,
    pin: m.pin ?? null,
    shift_start: m.shiftStart,
    shift_end: m.shiftEnd,
    function_ids: m.functionIds,
    team_lead_for: m.teamLeadFor ?? null,
    section: m.section ?? null,
    access_level: m.accessLevel ?? null,
  };
}

function prepToRow(item: PrepItem): Record<string, unknown> {
  return {
    id: item.id,
    function_id: item.functionId,
    category: item.category,
    team: item.team,
    dish: item.dish,
    quantity: item.quantity,
    deadline: item.deadline,
    prep_day: item.prepDay,
    note: item.note,
    completed: item.completed,
  };
}

function broadcastToRow(msg: BroadcastMessage): Record<string, unknown> {
  return {
    id: msg.id,
    text: msg.text,
    sender_name: msg.senderName,
    sender_role: msg.senderRole,
    sent_at: msg.sentAt,
    is_active: true,
  };
}

// ── DB row → App type mappers ────────────────────────────────────────────────

function rowToFn(row: Record<string, unknown>): KitchenFunction {
  return {
    id: row.id as string,
    name: (row.name as string) ?? "",
    room: (row.room as string) ?? "",
    floor: (row.floor as string) ?? "",
    functionType: (row.function_type as FunctionType) ?? "A-la-carte",
    date: row.date as string | undefined,
    startTime: (row.start_time as string) ?? "",
    endTime: (row.end_time as string) ?? "",
    guestCount: (row.guest_count as number) ?? 0,
    status: (row.status as KitchenFunction["status"]) ?? "upcoming",
    menu: (row.menu as string[]) ?? [],
    dietaryRequirements: (row.dietary_requirements as DietaryRequirement[]) ?? [],
    serviceTimes: row.service_times as ServiceTimes | undefined,
    serviceEvents: row.service_events as ServiceEvent[] | undefined,
    teamIds: (row.team_ids as string[]) ?? [],
    timeline: (row.timeline as TimelineItem[]) ?? [],
    chefInCharge: row.chef_in_charge as string | undefined,
  };
}

function rowToStaff(row: Record<string, unknown>): StaffMember {
  return {
    id: row.id as string,
    staffNumber: (row.staff_number as string) ?? "",
    name: (row.name as string) ?? "",
    role: row.role as StaffMember["role"],
    phone: row.phone as string | undefined,
    pin: row.pin as string | undefined,
    shiftStart: (row.shift_start as string) ?? "",
    shiftEnd: (row.shift_end as string) ?? "",
    functionIds: (row.function_ids as string[]) ?? [],
    teamLeadFor: row.team_lead_for as PrepTeam | undefined,
    section: row.section as PrepTeam | undefined,
    accessLevel: row.access_level as AccessLevel | undefined,
  };
}

function rowToPrep(row: Record<string, unknown>): PrepItem {
  return {
    id: row.id as string,
    functionId: (row.function_id as string) ?? "",
    category: (row.category as string) ?? "",
    team: (row.team as PrepTeam) ?? "Function Team",
    dish: (row.dish as string) ?? "",
    quantity: (row.quantity as string) ?? "",
    deadline: (row.deadline as string) ?? "",
    prepDay: (row.prep_day as PrepDay) ?? "day-of",
    note: (row.note as string) ?? "",
    completed: (row.completed as boolean) ?? false,
  };
}

function rowToBroadcast(row: Record<string, unknown>): BroadcastMessage {
  return {
    id: row.id as string,
    text: (row.text as string) ?? "",
    senderName: (row.sender_name as string) ?? "",
    senderRole: (row.sender_role as string) ?? "",
    sentAt: (row.sent_at as string) ?? "",
  };
}

// ── Load all kitchen data from Supabase ──────────────────────────────────────

export async function loadFromSupabase(): Promise<{
  functions: KitchenFunction[];
  staff: StaffMember[];
  prepItems: PrepItem[];
  broadcast: BroadcastMessage | null;
}> {
  if (!supabase) return { functions: [], staff: [], prepItems: [], broadcast: null };

  const [fns, staffRows, prepRows, broadcastRows] = await Promise.all([
    supabase.from("kitchen_functions").select("*"),
    supabase.from("staff_members").select("*"),
    supabase.from("prep_items").select("*"),
    supabase
      .from("broadcast_messages")
      .select("*")
      .eq("is_active", true)
      .limit(1),
  ]);

  // Throw so the caller (KitchenContext hydration) can fall back to AsyncStorage
  const errs = [
    fns.error         && `kitchen_functions: ${fns.error.message}`,
    staffRows.error   && `staff_members: ${staffRows.error.message}`,
    prepRows.error    && `prep_items: ${prepRows.error.message}`,
    broadcastRows.error && `broadcast_messages: ${broadcastRows.error.message}`,
  ].filter(Boolean);
  if (errs.length > 0) throw new Error(`Supabase load failed: ${errs.join("; ")}`);

  return {
    functions: ((fns.data ?? []) as Record<string, unknown>[]).map(rowToFn),
    staff: ((staffRows.data ?? []) as Record<string, unknown>[]).map(rowToStaff),
    prepItems: ((prepRows.data ?? []) as Record<string, unknown>[]).map(rowToPrep),
    broadcast:
      broadcastRows.data && broadcastRows.data.length > 0
        ? rowToBroadcast(broadcastRows.data[0] as Record<string, unknown>)
        : null,
  };
}

// ── One-time migration: push all local data to Supabase ──────────────────────

export async function migrateToSupabase(data: {
  functions: KitchenFunction[];
  staff: StaffMember[];
  prepItems: PrepItem[];
  broadcast: BroadcastMessage | null;
}): Promise<void> {
  if (!supabase) return;

  // Supabase builders are PromiseLike — wrap with Promise.resolve and check error field
  // (Supabase JS never throws; errors are returned in the .error property)
  type PostgREST = { error: { message: string } | null };
  const run = (label: string, builder: PromiseLike<PostgREST>): Promise<void> =>
    Promise.resolve(builder).then(({ error }) => {
      if (error) throw new Error(`${label}: ${error.message}`);
    });

  const tasks: Array<Promise<void>> = [];

  if (data.functions.length > 0) {
    tasks.push(run("kitchen_functions",
      supabase.from("kitchen_functions").upsert(data.functions.map(fnToRow), { onConflict: "id" }),
    ));
  }
  if (data.staff.length > 0) {
    tasks.push(run("staff_members",
      supabase.from("staff_members").upsert(data.staff.map(staffToRow), { onConflict: "id" }),
    ));
  }
  if (data.prepItems.length > 0) {
    tasks.push(run("prep_items",
      supabase.from("prep_items").upsert(data.prepItems.map(prepToRow), { onConflict: "id" }),
    ));
  }
  if (data.broadcast) {
    const broadcast = data.broadcast;
    tasks.push(run("broadcast_messages",
      supabase.from("broadcast_messages").upsert([broadcastToRow(broadcast)], { onConflict: "id" }),
    ));
  }

  // Throws on any write failure — KitchenContext will NOT set the migration-complete flag
  await Promise.all(tasks);
}

// ── Write helper ─────────────────────────────────────────────────────────────
// Awaits a Supabase PromiseLike, checks the .error field, and warns on failure.
// Never throws — safe for fire-and-forget callers in KitchenContext.

type PostgRESTResult = { error: { message: string } | null };
const wb = (label: string, builder: PromiseLike<PostgRESTResult>): Promise<void> =>
  Promise.resolve(builder).then(({ error }) => {
    if (error) console.warn(`[supabase-sync] ${label}:`, error.message);
  });

// ── Individual upsert / delete helpers ──────────────────────────────────────

export async function upsertFunctionToSupabase(fn: KitchenFunction): Promise<void> {
  if (!supabase) return;
  await wb("upsertFunction",
    supabase.from("kitchen_functions").upsert(fnToRow(fn), { onConflict: "id" }),
  );
}

export async function deleteFunctionFromSupabase(id: string): Promise<void> {
  if (!supabase) return;
  await wb("deleteFunction",
    supabase.from("kitchen_functions").delete().eq("id", id),
  );
}

export async function upsertStaffToSupabase(member: StaffMember): Promise<void> {
  if (!supabase) return;
  await wb("upsertStaff",
    supabase.from("staff_members").upsert(staffToRow(member), { onConflict: "id" }),
  );
}

export async function deleteStaffFromSupabase(id: string): Promise<void> {
  if (!supabase) return;
  await wb("deleteStaff",
    supabase.from("staff_members").delete().eq("id", id),
  );
}

export async function upsertPrepItemToSupabase(item: PrepItem): Promise<void> {
  if (!supabase) return;
  await wb("upsertPrepItem",
    supabase.from("prep_items").upsert(prepToRow(item), { onConflict: "id" }),
  );
}

export async function upsertBroadcastToSupabase(msg: BroadcastMessage): Promise<void> {
  if (!supabase) return;
  await wb("upsertBroadcast",
    supabase.from("broadcast_messages").upsert(broadcastToRow(msg), { onConflict: "id" }),
  );
}

export async function clearBroadcastInSupabase(): Promise<void> {
  if (!supabase) return;
  await wb("clearBroadcast",
    supabase.from("broadcast_messages").update({ is_active: false }).eq("is_active", true),
  );
}

// ── Realtime subscriptions ───────────────────────────────────────────────────

export interface RealtimeChangeHandlers {
  onFunctionChange: (
    type: "INSERT" | "UPDATE" | "DELETE",
    fn: KitchenFunction,
    oldId?: string,
  ) => void;
  onStaffChange: (
    type: "INSERT" | "UPDATE" | "DELETE",
    member: StaffMember,
    oldId?: string,
  ) => void;
  onPrepChange: (
    type: "INSERT" | "UPDATE" | "DELETE",
    item: PrepItem,
    oldId?: string,
  ) => void;
  onBroadcastChange: (
    type: "INSERT" | "UPDATE" | "DELETE",
    msg: BroadcastMessage | null,
  ) => void;
}

export function subscribeToKitchenChanges(
  handlers: RealtimeChangeHandlers,
): { unsubscribe: () => void } {
  if (!supabase) return { unsubscribe: () => {} };

  const channel = supabase
    .channel("kitchen-ops-changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "kitchen_functions" },
      (payload) => {
        const type = payload.eventType;
        if (type === "DELETE") {
          const oldId = (payload.old as Record<string, unknown>)?.id as string;
          handlers.onFunctionChange("DELETE", {} as KitchenFunction, oldId);
        } else {
          handlers.onFunctionChange(
            type,
            rowToFn(payload.new as Record<string, unknown>),
          );
        }
      },
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "staff_members" },
      (payload) => {
        const type = payload.eventType;
        if (type === "DELETE") {
          const oldId = (payload.old as Record<string, unknown>)?.id as string;
          handlers.onStaffChange("DELETE", {} as StaffMember, oldId);
        } else {
          handlers.onStaffChange(
            type,
            rowToStaff(payload.new as Record<string, unknown>),
          );
        }
      },
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "prep_items" },
      (payload) => {
        const type = payload.eventType;
        if (type === "DELETE") {
          const oldId = (payload.old as Record<string, unknown>)?.id as string;
          handlers.onPrepChange("DELETE", {} as PrepItem, oldId);
        } else {
          handlers.onPrepChange(
            type,
            rowToPrep(payload.new as Record<string, unknown>),
          );
        }
      },
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "broadcast_messages" },
      (payload) => {
        const type = payload.eventType;
        if (type === "DELETE") {
          handlers.onBroadcastChange("DELETE", null);
        } else {
          const row = payload.new as Record<string, unknown>;
          const isActive = row.is_active as boolean;
          handlers.onBroadcastChange(type, isActive ? rowToBroadcast(row) : null);
        }
      },
    )
    .subscribe();

  return {
    unsubscribe: () => {
      supabase?.removeChannel(channel);
    },
  };
}
