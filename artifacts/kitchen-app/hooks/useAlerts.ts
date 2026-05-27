/**
 * useAlerts — live operational alert engine
 *
 * Computes kitchen alerts from local context every 30 s.
 * All logic runs client-side; no network calls needed.
 *
 * Alert categories:
 *   dietary  — severe allergens + complex dietary plans
 *   overlap  — same room, same date, overlapping times
 *   staffing — no staff assigned, sick callouts, staff:cover ratio
 *   timeline — overdue timeline items during active/upcoming service
 *   prep     — prep incomplete within 60–120 min of service start
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useKitchen } from "@/context/KitchenContext";

export type AlertSeverity = "critical" | "warning" | "info";
export type AlertCategory =
  | "dietary"
  | "overlap"
  | "staffing"
  | "timeline"
  | "prep";

export interface KitchenAlert {
  id: string;
  severity: AlertSeverity;
  category: AlertCategory;
  title: string;
  detail: string;
  functionId?: string;
  dismissible: boolean;
}

function toMins(t: string): number {
  const [h = 0, m = 0] = (t ?? "00:00").split(":").map(Number);
  return h * 60 + m;
}

function timesOverlap(s1: string, e1: string, s2: string, e2: string): boolean {
  return toMins(s1) < toMins(e2) && toMins(s2) < toMins(e1);
}

export function useAlerts(): {
  alerts: KitchenAlert[];
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  alertsByFunctionId: Map<string, KitchenAlert[]>;
  dismissAlert: (id: string) => void;
  dismissAll: () => void;
} {
  const { functions, prepItems, staff, sickStaffIds } = useKitchen();
  const [dismissed, setDismissed] = useState<ReadonlySet<string>>(new Set());
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const alerts = useMemo(() => {
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const today = now.toISOString().slice(0, 10);
    const result: KitchenAlert[] = [];

    // Functions happening today (or undated — treated as today)
    const todayFns = functions.filter(
      (f) => !f.date || f.date.slice(0, 10) === today,
    );

    // ── 1. Dietary risk ──────────────────────────────────────
    for (const fn of todayFns) {
      const severe = fn.dietaryRequirements.filter(
        (d) =>
          d.name.toLowerCase().includes("nut") ||
          d.name.toLowerCase().includes("shellfish"),
      );
      if (severe.length > 0) {
        result.push({
          id: `dietary-severe-${fn.id}`,
          severity: "critical",
          category: "dietary",
          title: `Severe allergen — ${fn.name}`,
          detail: `${severe.map((d) => `${d.count}× ${d.name}`).join(", ")} · ${fn.guestCount} covers · Service ${fn.startTime}`,
          functionId: fn.id,
          dismissible: true,
        });
      }
      if (fn.dietaryRequirements.length >= 4) {
        result.push({
          id: `dietary-complex-${fn.id}`,
          severity: "warning",
          category: "dietary",
          title: `Complex dietary plan — ${fn.name}`,
          detail: `${fn.dietaryRequirements.length} dietary types for ${fn.guestCount} covers. Verify all alternates before service.`,
          functionId: fn.id,
          dismissible: true,
        });
      }
    }

    // ── 2. Room / time overlap ────────────────────────────────
    for (let i = 0; i < todayFns.length; i++) {
      for (let j = i + 1; j < todayFns.length; j++) {
        const a = todayFns[i]!;
        const b = todayFns[j]!;
        if (
          a.room &&
          b.room &&
          a.room.trim().toLowerCase() === b.room.trim().toLowerCase() &&
          timesOverlap(a.startTime, a.endTime, b.startTime, b.endTime)
        ) {
          result.push({
            id: `overlap-${[a.id, b.id].sort().join("-")}`,
            severity: "critical",
            category: "overlap",
            title: `Room conflict — ${a.room}`,
            detail: `${a.name} (${a.startTime}–${a.endTime}) clashes with ${b.name} (${b.startTime}–${b.endTime})`,
            functionId: a.id,
            dismissible: false,
          });
        }
      }
    }

    // ── 3. Staff shortage ─────────────────────────────────────
    const sickSet = new Set(sickStaffIds);
    for (const fn of todayFns) {
      const fnMins = toMins(fn.startTime) - nowMins;
      // Only alert within 4 h before start (or during service)
      if (fnMins > 240 || toMins(fn.endTime) < nowMins) continue;

      if (fn.teamIds.length === 0) {
        result.push({
          id: `staffing-none-${fn.id}`,
          severity: "warning",
          category: "staffing",
          title: `No staff assigned — ${fn.name}`,
          detail: `${fn.guestCount} covers at ${fn.startTime}. Assign team from Roster.`,
          functionId: fn.id,
          dismissible: true,
        });
      } else {
        // Sick callout on this function
        const sickOnFn = fn.teamIds.filter((id) => sickSet.has(id));
        if (sickOnFn.length > 0) {
          const names = sickOnFn
            .map((id) => staff.find((s) => s.id === id)?.name ?? id)
            .join(", ");
          result.push({
            id: `staffing-sick-${fn.id}`,
            severity: "warning",
            category: "staffing",
            title: `Staff called in sick — ${fn.name}`,
            detail: `${sickOnFn.length} assigned staff out: ${names}. ${fn.teamIds.length - sickOnFn.length} remaining on shift.`,
            functionId: fn.id,
            dismissible: true,
          });
        }

        // Staff-to-cover ratio check
        const active = fn.teamIds.filter((id) => !sickSet.has(id)).length;
        const minStaff = Math.max(2, Math.ceil(fn.guestCount / 50));
        if (fn.guestCount > 50 && active < minStaff) {
          result.push({
            id: `staffing-ratio-${fn.id}`,
            severity: "warning",
            category: "staffing",
            title: `Understaffed — ${fn.name}`,
            detail: `${active} staff for ${fn.guestCount} covers (${minStaff}+ recommended). Service at ${fn.startTime}.`,
            functionId: fn.id,
            dismissible: true,
          });
        }
      }
    }

    // ── 4. Timeline delay ─────────────────────────────────────
    for (const fn of todayFns) {
      const fnMins = toMins(fn.startTime) - nowMins;
      const isActive = fnMins <= 0 && toMins(fn.endTime) > nowMins;
      const isUpcomingClose = fnMins > 0 && fnMins <= 120;
      if (!isActive && !isUpcomingClose) continue;

      const overdue = fn.timeline.filter(
        (item) => !item.completed && toMins(item.time) <= nowMins - 5,
      );
      if (overdue.length === 0) continue;

      const earliest = overdue.reduce((a, b) =>
        toMins(a.time) < toMins(b.time) ? a : b,
      );
      const late = nowMins - toMins(earliest.time);
      const shortTask =
        earliest.task.length > 58
          ? earliest.task.slice(0, 58) + "…"
          : earliest.task;

      result.push({
        id: `timeline-${fn.id}`,
        severity: isActive ? "critical" : "warning",
        category: "timeline",
        title: `Timeline delayed — ${fn.name}`,
        detail: `"${shortTask}" was due at ${earliest.time} (${late} min ago)${overdue.length > 1 ? ` · +${overdue.length - 1} more overdue` : ""}`,
        functionId: fn.id,
        dismissible: true,
      });
    }

    // ── 5. Prep at risk ───────────────────────────────────────
    for (const fn of todayFns) {
      const fnMins = toMins(fn.startTime) - nowMins;
      if (fnMins <= 0 || fnMins > 180) continue;
      const fnPrep = prepItems.filter((p) => p.functionId === fn.id);
      if (fnPrep.length === 0) continue;
      const done = fnPrep.filter((p) => p.completed).length;
      const pct = done / fnPrep.length;

      if (fnMins <= 60 && pct < 1) {
        result.push({
          id: `prep-incomplete-${fn.id}`,
          severity: "warning",
          category: "prep",
          title: `Prep incomplete — ${fn.name}`,
          detail: `${done}/${fnPrep.length} items done (${Math.round(pct * 100)}%) — service starts in ${fnMins} min.`,
          functionId: fn.id,
          dismissible: true,
        });
      } else if (fnMins <= 120 && pct < 0.5) {
        result.push({
          id: `prep-behind-${fn.id}`,
          severity: "info",
          category: "prep",
          title: `Prep behind schedule — ${fn.name}`,
          detail: `${Math.round(pct * 100)}% complete with ${fnMins} min to service start.`,
          functionId: fn.id,
          dismissible: true,
        });
      }
    }

    const ORDER: Record<AlertSeverity, number> = {
      critical: 0,
      warning: 1,
      info: 2,
    };
    return result
      .filter((a) => !dismissed.has(a.id))
      .sort((a, b) => ORDER[a.severity] - ORDER[b.severity]);
  }, [functions, prepItems, staff, sickStaffIds, dismissed, tick]);

  const alertsByFunctionId = useMemo(() => {
    const map = new Map<string, KitchenAlert[]>();
    for (const alert of alerts) {
      if (!alert.functionId) continue;
      const arr = map.get(alert.functionId) ?? [];
      map.set(alert.functionId, [...arr, alert]);
    }
    return map;
  }, [alerts]);

  const dismissAlert = useCallback((id: string) => {
    setDismissed((prev) => new Set([...prev, id]));
  }, []);

  const dismissAll = useCallback(() => {
    setDismissed(new Set(alerts.filter((a) => a.dismissible).map((a) => a.id)));
  }, [alerts]);

  const criticalCount = alerts.filter((a) => a.severity === "critical").length;
  const warningCount = alerts.filter((a) => a.severity === "warning").length;
  const infoCount = alerts.filter((a) => a.severity === "info").length;

  return {
    alerts,
    criticalCount,
    warningCount,
    infoCount,
    alertsByFunctionId,
    dismissAlert,
    dismissAll,
  };
}
