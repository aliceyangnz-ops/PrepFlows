import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface TimelineItem {
  id: string;
  time: string;
  task: string;
  completed: boolean;
}

export interface KitchenFunction {
  id: string;
  name: string;
  room: string;
  startTime: string;
  endTime: string;
  guestCount: number;
  status: "upcoming" | "active" | "completed";
  menu: string[];
  teamIds: string[];
  timeline: TimelineItem[];
}

export interface PrepItem {
  id: string;
  functionId: string;
  category: string;
  dish: string;
  quantity: string;
  note: string;
  completed: boolean;
}

export interface StaffMember {
  id: string;
  name: string;
  role: "Head Chef" | "Sous Chef" | "Pastry Chef" | "Casual";
  shiftStart: string;
  shiftEnd: string;
  functionIds: string[];
}

export interface BroadcastMessage {
  id: string;
  text: string;
  senderName: string;
  senderRole: string;
  sentAt: string;
}

const SAMPLE_STAFF: StaffMember[] = [
  { id: "s1", name: "Marco Ricci", role: "Head Chef", shiftStart: "05:00", shiftEnd: "14:00", functionIds: ["f1", "f2", "f3"] },
  { id: "s2", name: "Sarah Chen", role: "Sous Chef", shiftStart: "07:00", shiftEnd: "16:00", functionIds: ["f1", "f3"] },
  { id: "s3", name: "Jake Morrison", role: "Casual", shiftStart: "09:00", shiftEnd: "17:00", functionIds: ["f1"] },
  { id: "s4", name: "Amara Osei", role: "Pastry Chef", shiftStart: "06:00", shiftEnd: "15:00", functionIds: ["f3"] },
  { id: "s5", name: "Liam Walsh", role: "Casual", shiftStart: "10:00", shiftEnd: "18:00", functionIds: ["f3"] },
];

const SAMPLE_FUNCTIONS: KitchenFunction[] = [
  {
    id: "f1",
    name: "Harrison Wedding Luncheon",
    room: "Ballroom A",
    startTime: "12:00",
    endTime: "15:00",
    guestCount: 280,
    status: "upcoming",
    menu: ["Entrée: Prawn Cocktail", "Main: Roasted Eye Fillet", "Side: Truffle Potato Gratin", "Dessert: Panna Cotta"],
    teamIds: ["s1", "s2", "s3"],
    timeline: [
      { id: "t1", time: "06:00", task: "Mise en place", completed: true },
      { id: "t2", time: "08:00", task: "Main protein prep", completed: true },
      { id: "t3", time: "10:00", task: "Sauces & garnishes", completed: false },
      { id: "t4", time: "11:30", task: "Ballroom A setup", completed: false },
      { id: "t5", time: "12:00", task: "Service begins", completed: false },
    ],
  },
  {
    id: "f2",
    name: "Corporate Boardroom Lunch",
    room: "Suite 3",
    startTime: "13:00",
    endTime: "14:30",
    guestCount: 18,
    status: "upcoming",
    menu: ["Starter: Antipasto Platter", "Main: Chicken Supreme", "Dessert: Chocolate Fondant"],
    teamIds: ["s1"],
    timeline: [
      { id: "t6", time: "09:00", task: "Prep all courses", completed: true },
      { id: "t7", time: "12:30", task: "Suite 3 setup", completed: false },
      { id: "t8", time: "13:00", task: "Service begins", completed: false },
    ],
  },
  {
    id: "f3",
    name: "Gala Dinner",
    room: "Grand Ballroom",
    startTime: "19:00",
    endTime: "23:00",
    guestCount: 450,
    status: "upcoming",
    menu: ["Amuse-bouche: Wagyu Tartare", "Entrée: Seared Scallop", "Soup: Lobster Bisque", "Main: Beef Wellington", "Dessert: Croquembouche"],
    teamIds: ["s1", "s2", "s4", "s5"],
    timeline: [
      { id: "t9", time: "07:00", task: "Begin Beef Wellington prep", completed: false },
      { id: "t10", time: "10:00", task: "Pastry & desserts", completed: false },
      { id: "t11", time: "14:00", task: "Sauces & reductions", completed: false },
      { id: "t12", time: "17:00", task: "Grand Ballroom setup", completed: false },
      { id: "t13", time: "19:00", task: "Gala service begins", completed: false },
    ],
  },
];

const SAMPLE_PREP: PrepItem[] = [
  { id: "p1", functionId: "f1", category: "Proteins", dish: "Eye Fillet", quantity: "280 portions × 220g", note: "Trim, tie, rest at room temp 30min before", completed: true },
  { id: "p2", functionId: "f1", category: "Proteins", dish: "Prawn Cocktail", quantity: "280 portions × 5 prawns", note: "Poach, chill overnight", completed: true },
  { id: "p3", functionId: "f1", category: "Sauces", dish: "Béarnaise Sauce", quantity: "12 litres", note: "Hold at 60°C, make fresh", completed: false },
  { id: "p4", functionId: "f1", category: "Sauces", dish: "Cocktail Sauce", quantity: "5 litres", note: "Refrigerate", completed: true },
  { id: "p5", functionId: "f1", category: "Sides", dish: "Truffle Potato Gratin", quantity: "280 portions", note: "Bake at 180°C 45min, portion before service", completed: false },
  { id: "p6", functionId: "f1", category: "Pastry", dish: "Panna Cotta", quantity: "290 portions (10 spare)", note: "Set overnight, garnish AM", completed: true },
  { id: "p7", functionId: "f2", category: "Proteins", dish: "Chicken Supreme", quantity: "20 portions × 200g", note: "Pan-sear, finish in oven", completed: true },
  { id: "p8", functionId: "f2", category: "Pastry", dish: "Chocolate Fondant", quantity: "20 portions", note: "Bake to order — 8 min at 200°C", completed: false },
  { id: "p9", functionId: "f3", category: "Proteins", dish: "Beef Wellington", quantity: "450 portions × 180g", note: "Prep duxelles, wrap in filo, freeze briefly before service", completed: false },
  { id: "p10", functionId: "f3", category: "Proteins", dish: "Seared Scallop", quantity: "900 pieces (2 per portion)", note: "Dry scallops on paper towel 2h before", completed: false },
  { id: "p11", functionId: "f3", category: "Sauces", dish: "Lobster Bisque", quantity: "200 litres", note: "Reduce by 1/3 before service", completed: false },
  { id: "p12", functionId: "f3", category: "Pastry", dish: "Croquembouche", quantity: "15 towers (30 guests per tower)", note: "Assemble day-of, keep dry", completed: false },
];

interface KitchenContextType {
  functions: KitchenFunction[];
  prepItems: PrepItem[];
  staff: StaffMember[];
  currentStaffId: string | null;
  notificationsEnabled: boolean;
  broadcastMessage: BroadcastMessage | null;
  dismissedBroadcastId: string | null;
  setCurrentStaff: (id: string | null, notificationsOn: boolean) => void;
  setBroadcast: (msg: BroadcastMessage) => void;
  clearBroadcast: () => void;
  dismissBroadcast: (id: string) => void;
  togglePrepItem: (id: string) => void;
  toggleTimelineItem: (functionId: string, timelineId: string) => void;
  todayDate: string;
}

const KitchenContext = createContext<KitchenContextType | null>(null);

const STORAGE_KEY_FUNCTIONS = "@kitchen_functions";
const STORAGE_KEY_PREP = "@kitchen_prep";
const STORAGE_KEY_CURRENT_STAFF = "@kitchen_current_staff";
const STORAGE_KEY_NOTIFS = "@kitchen_notifs_enabled";
const STORAGE_KEY_BROADCAST = "@kitchen_broadcast";
const STORAGE_KEY_DISMISSED = "@kitchen_dismissed_broadcast";

export function KitchenProvider({ children }: { children: React.ReactNode }) {
  const [functions, setFunctions] = useState<KitchenFunction[]>(SAMPLE_FUNCTIONS);
  const [prepItems, setPrepItems] = useState<PrepItem[]>(SAMPLE_PREP);
  const [staff] = useState<StaffMember[]>(SAMPLE_STAFF);
  const [currentStaffId, setCurrentStaffIdState] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [broadcastMessage, setBroadcastState] = useState<BroadcastMessage | null>(null);
  const [dismissedBroadcastId, setDismissedBroadcastId] = useState<string | null>(null);

  const today = new Date();
  const todayDate = today.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" });

  useEffect(() => {
    (async () => {
      try {
        const [storedFunctions, storedPrep, storedStaff, storedNotifs, storedBroadcast, storedDismissed] =
          await Promise.all([
            AsyncStorage.getItem(STORAGE_KEY_FUNCTIONS),
            AsyncStorage.getItem(STORAGE_KEY_PREP),
            AsyncStorage.getItem(STORAGE_KEY_CURRENT_STAFF),
            AsyncStorage.getItem(STORAGE_KEY_NOTIFS),
            AsyncStorage.getItem(STORAGE_KEY_BROADCAST),
            AsyncStorage.getItem(STORAGE_KEY_DISMISSED),
          ]);
        if (storedFunctions) setFunctions(JSON.parse(storedFunctions));
        if (storedPrep) setPrepItems(JSON.parse(storedPrep));
        if (storedStaff) setCurrentStaffIdState(storedStaff);
        if (storedNotifs) setNotificationsEnabled(storedNotifs === "true");
        if (storedBroadcast) setBroadcastState(JSON.parse(storedBroadcast));
        if (storedDismissed) setDismissedBroadcastId(storedDismissed);
      } catch {
        // use defaults
      }
    })();
  }, []);

  const setCurrentStaff = useCallback((id: string | null, notificationsOn: boolean) => {
    setCurrentStaffIdState(id);
    setNotificationsEnabled(notificationsOn);
    AsyncStorage.setItem(STORAGE_KEY_CURRENT_STAFF, id ?? "");
    AsyncStorage.setItem(STORAGE_KEY_NOTIFS, String(notificationsOn));
  }, []);

  const setBroadcast = useCallback((msg: BroadcastMessage) => {
    setBroadcastState(msg);
    AsyncStorage.setItem(STORAGE_KEY_BROADCAST, JSON.stringify(msg));
  }, []);

  const clearBroadcast = useCallback(() => {
    setBroadcastState(null);
    setDismissedBroadcastId(null);
    AsyncStorage.removeItem(STORAGE_KEY_BROADCAST);
    AsyncStorage.removeItem(STORAGE_KEY_DISMISSED);
  }, []);

  const dismissBroadcast = useCallback((id: string) => {
    setDismissedBroadcastId(id);
    AsyncStorage.setItem(STORAGE_KEY_DISMISSED, id);
  }, []);

  const togglePrepItem = useCallback((id: string) => {
    setPrepItems((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      );
      AsyncStorage.setItem(STORAGE_KEY_PREP, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const toggleTimelineItem = useCallback((functionId: string, timelineId: string) => {
    setFunctions((prev) => {
      const updated = prev.map((fn) =>
        fn.id === functionId
          ? {
              ...fn,
              timeline: fn.timeline.map((t) =>
                t.id === timelineId ? { ...t, completed: !t.completed } : t
              ),
            }
          : fn
      );
      AsyncStorage.setItem(STORAGE_KEY_FUNCTIONS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <KitchenContext.Provider
      value={{
        functions,
        prepItems,
        staff,
        currentStaffId,
        notificationsEnabled,
        broadcastMessage,
        dismissedBroadcastId,
        setCurrentStaff,
        setBroadcast,
        clearBroadcast,
        dismissBroadcast,
        togglePrepItem,
        toggleTimelineItem,
        todayDate,
      }}
    >
      {children}
    </KitchenContext.Provider>
  );
}

export function useKitchen() {
  const ctx = useContext(KitchenContext);
  if (!ctx) throw new Error("useKitchen must be used within KitchenProvider");
  return ctx;
}
