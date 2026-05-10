import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { KitchenFunction, StaffMember } from "@/context/KitchenContext";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function buildTriggerDate(timeStr: string): Date {
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function buildTriggerDateOffset(timeStr: string, offsetMinutes: number): Date {
  const d = buildTriggerDate(timeStr);
  d.setMinutes(d.getMinutes() - offsetMinutes);
  return d;
}

function urgencyEmoji(minsOut: number): string {
  if (minsOut <= 15) return "🔴";
  if (minsOut <= 30) return "🟠";
  if (minsOut <= 60) return "🟡";
  return "🟢";
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function scheduleStaffNotifications(
  member: StaffMember,
  assignedFunctions: KitchenFunction[]
): Promise<string[]> {
  if (Platform.OS === "web") return [];

  const now = new Date();
  const ids: string[] = [];
  const firstName = member.name.split(" ")[0];

  // ── Shift alerts ──────────────────────────────────────────────────
  const shiftWarning30 = buildTriggerDateOffset(member.shiftStart, 30);
  const shiftStart = buildTriggerDate(member.shiftStart);

  if (shiftWarning30 > now) {
    const firstFn = assignedFunctions[0];
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `🟠 Shift in 30 min — ${firstName}`,
        body: firstFn
          ? `Head to ${firstFn.room} by ${member.shiftStart}${member.role === "Casual" ? " — " + firstFn.name : ""}`
          : `Your shift starts at ${member.shiftStart}. Have a great service!`,
        sound: true,
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: shiftWarning30 },
    });
    ids.push(id);
  }

  if (shiftStart > now) {
    const firstFn = assignedFunctions[0];
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `✅ Shift started — let's go, ${firstName}!`,
        body: firstFn
          ? `Report to ${firstFn.room} now${member.role === "Casual" ? " for " + firstFn.name : ""}`
          : "Your shift has started — good luck today!",
        sound: true,
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: shiftStart },
    });
    ids.push(id);
  }

  // ── Per-function alerts ───────────────────────────────────────────
  for (const fn of assignedFunctions) {
    const fnStartMins = fn.startTime.split(":").map(Number).reduce((h, m) => h * 60 + m, 0);
    const nowMins = now.getHours() * 60 + now.getMinutes();

    // 60-minute warning
    const fn60 = buildTriggerDateOffset(fn.startTime, 60);
    if (fn60 > now) {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: `🟡 ${fn.name} — 1 hour to go`,
          body: `${fn.guestCount} guests · ${fn.room} · Service at ${fn.startTime}. Start mise en place now.`,
          sound: true,
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fn60 },
      });
      ids.push(id);
    }

    // 30-minute warning
    const fn30 = buildTriggerDateOffset(fn.startTime, 30);
    if (fn30 > now) {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: `🟠 ${fn.name} — 30 minutes`,
          body: `${fn.guestCount} guests arriving at ${fn.startTime} · ${fn.room}. Final checks now.`,
          sound: true,
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fn30 },
      });
      ids.push(id);
    }

    // 15-minute warning
    const fn15 = buildTriggerDateOffset(fn.startTime, 15);
    if (fn15 > now) {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: `🔴 ${fn.name} — 15 minutes`,
          body: `${fn.room} · Get to your station now. ${fn.guestCount} guests arriving at ${fn.startTime}.`,
          sound: true,
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fn15 },
      });
      ids.push(id);
    }

    // Function start
    const fnStart = buildTriggerDate(fn.startTime);
    if (fnStart > now) {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: `🚨 Service starting NOW — ${fn.room}`,
          body: `${fn.name} · ${fn.guestCount} guests`,
          sound: true,
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fnStart },
      });
      ids.push(id);
    }

    // ── Course fire-time alerts ───────────────────────────────────
    if (fn.serviceTimes) {
      const courseMap: Array<{ key: keyof typeof fn.serviceTimes; label: string; prepOffset: number }> = [
        { key: "amuse",   label: "Amuse-bouche",  prepOffset: 10 },
        { key: "entree",  label: "Entrée",         prepOffset: 15 },
        { key: "main",    label: "Mains",          prepOffset: 20 },
        { key: "dessert", label: "Dessert",        prepOffset: 10 },
        { key: "supper",  label: "Supper",         prepOffset: 10 },
      ];

      for (const { key, label, prepOffset } of courseMap) {
        const courseTime = fn.serviceTimes[key];
        if (!courseTime) continue;

        // Prep warning (before fire time)
        const prepAlert = buildTriggerDateOffset(courseTime, prepOffset);
        if (prepAlert > now) {
          const id = await Notifications.scheduleNotificationAsync({
            content: {
              title: `🍽 ${label} prep — ${fn.name}`,
              body: `Fire ${label.toLowerCase()} at ${courseTime} · ${prepOffset} min to plate up. ${fn.guestCount} covers.`,
              sound: true,
            },
            trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: prepAlert },
          });
          ids.push(id);
        }

        // Fire time
        const fireAlert = buildTriggerDate(courseTime);
        if (fireAlert > now) {
          const courseMins = courseTime.split(":").map(Number).reduce((h, m) => h * 60 + m, 0);
          const emoji = urgencyEmoji(courseMins - nowMins);
          const id = await Notifications.scheduleNotificationAsync({
            content: {
              title: `${emoji} FIRE ${label.toUpperCase()} NOW — ${fn.name}`,
              body: `${fn.guestCount} covers · ${fn.room}. All sections go.`,
              sound: true,
            },
            trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fireAlert },
          });
          ids.push(id);
        }
      }
    }
  }

  return ids;
}

export async function cancelAllNotifications(): Promise<void> {
  if (Platform.OS === "web") return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}
