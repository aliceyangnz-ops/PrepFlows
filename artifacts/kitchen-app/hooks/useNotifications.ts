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

  const shiftStartDate = buildTriggerDate(member.shiftStart);
  const shiftWarningDate = buildTriggerDateOffset(member.shiftStart, 30);

  if (shiftWarningDate > now) {
    const firstFn = assignedFunctions[0];
    const body = firstFn
      ? `Head to ${firstFn.room} by ${member.shiftStart}${member.role === "Casual" ? " — " + firstFn.name : ""}`
      : `Your shift starts at ${member.shiftStart}`;
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Shift starting in 30 minutes, ${member.name.split(" ")[0]}`,
        body,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: shiftWarningDate,
      },
    });
    ids.push(id);
  }

  if (shiftStartDate > now) {
    const firstFn = assignedFunctions[0];
    const body = firstFn
      ? `Report to ${firstFn.room} now${member.role === "Casual" ? " for " + firstFn.name : ""}`
      : "Your shift has started — good luck today!";
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Shift started — let's go, ${member.name.split(" ")[0]}!`,
        body,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: shiftStartDate,
      },
    });
    ids.push(id);
  }

  for (const fn of assignedFunctions) {
    const fnWarning = buildTriggerDateOffset(fn.startTime, 30);
    if (fnWarning > now) {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: `${fn.name} in 30 minutes`,
          body: `Head to ${fn.room} — service starts at ${fn.startTime}`,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: fnWarning,
        },
      });
      ids.push(id);
    }

    const fnStart = buildTriggerDate(fn.startTime);
    if (fnStart > now) {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: `Service starting now — ${fn.room}`,
          body: `${fn.name} · ${fn.guestCount} guests`,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: fnStart,
        },
      });
      ids.push(id);
    }
  }

  return ids;
}

export async function cancelAllNotifications(): Promise<void> {
  if (Platform.OS === "web") return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}
