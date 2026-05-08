import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface TimelineItem {
  id: string;
  time: string;
  task: string;
  completed: boolean;
}

export type FunctionType =
  | "A-la-carte"
  | "Buffet"
  | "Cocktail"
  | "Canapés"
  | "Canapés + A-la-carte"
  | "School Ball"
  | "Set Menu"
  | "High Tea";

export interface ServiceTimes {
  amuse?: string;
  entree?: string;
  main?: string;
  dessert?: string;
  supper?: string;
}

export interface KitchenFunction {
  id: string;
  name: string;
  room: string;
  functionType: FunctionType;
  startTime: string;
  endTime: string;
  guestCount: number;
  status: "upcoming" | "active" | "completed";
  menu: string[];
  serviceTimes?: ServiceTimes;
  teamIds: string[];
  timeline: TimelineItem[];
}

export type PrepTeam = "Cold Larder" | "Pastry" | "Hot Kitchen" | "Catering" | "Butchery";
export type PrepDay = "day-before" | "day-of";

export interface PrepItem {
  id: string;
  functionId: string;
  category: string;
  team: PrepTeam;
  dish: string;
  quantity: string;
  deadline: string;
  prepDay: PrepDay;
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
    functionType: "A-la-carte",
    startTime: "12:00",
    endTime: "15:00",
    guestCount: 280,
    status: "upcoming",
    serviceTimes: {
      entree: "12:00",
      main: "12:35",
      dessert: "13:30",
    },
    menu: [
      "Entrée: Prawn Cocktail — tiger prawns, Marie Rose, iceberg, lemon",
      "Main: Roasted MSA Eye Fillet — béarnaise, truffle gratin, broccolini",
      "Dessert: Vanilla Panna Cotta — berry coulis, micro herbs",
    ],
    teamIds: ["s1", "s2", "s3"],
    timeline: [
      { id: "t1", time: "06:00", task: "Mise en place — all stations set, benches clear, HACCP sheets started", completed: true },
      { id: "t2", time: "08:00", task: "Eye fillet: trim sinew, truss, portion 220g × 280. Season & hold chilled", completed: true },
      { id: "t3", time: "10:00", task: "Béarnaise reduction on. Gratin into deck oven 180°C. Cocktail sauce bottled", completed: false },
      { id: "t4", time: "11:30", task: "Ballroom A service check — crockery polished, mise en place on pass", completed: false },
      { id: "t5", time: "12:00", task: "Entrée away — prawn cocktail plated & fired", completed: false },
      { id: "t6", time: "12:35", task: "Fire mains — sear fillet in clarified butter, finish 180°C to 54°C core", completed: false },
      { id: "t7", time: "13:30", task: "Dessert away — panna cotta garnished & plated", completed: false },
    ],
  },
  {
    id: "f2",
    name: "Corporate Boardroom Lunch",
    room: "Suite 3",
    functionType: "A-la-carte",
    startTime: "13:00",
    endTime: "14:30",
    guestCount: 18,
    status: "upcoming",
    serviceTimes: {
      entree: "13:00",
      main: "13:25",
      dessert: "14:05",
    },
    menu: [
      "Starter: Antipasto — cured meats, giardiniera, grissini, EVOO",
      "Main: Chicken Supreme — airline breast, jus lié, pomme purée, seasonal greens",
      "Dessert: Chocolate Fondant — Valrhona 70%, crème anglaise, vanilla ice cream",
    ],
    teamIds: ["s1"],
    timeline: [
      { id: "t8", time: "09:00", task: "Mise en place — fondant batter made & chilled. Chicken trimmed & portioned 200g", completed: true },
      { id: "t9", time: "12:30", task: "Suite 3 set — crockery & cutlery polished, water poured", completed: false },
      { id: "t10", time: "13:00", task: "Fire entrée — antipasto platters dressed & away", completed: false },
      { id: "t11", time: "13:25", task: "Fire mains — sear chicken skin-down 3min, flip, finish 180°C to 74°C core. Rest 5min", completed: false },
      { id: "t12", time: "14:05", task: "Fire fondants 200°C/8min to order — jiggly centre only. Plate immediately", completed: false },
    ],
  },
  {
    id: "f3",
    name: "Gala Dinner",
    room: "Grand Ballroom",
    functionType: "A-la-carte",
    startTime: "19:00",
    endTime: "23:00",
    guestCount: 450,
    status: "upcoming",
    serviceTimes: {
      amuse: "19:00",
      entree: "19:30",
      main: "20:30",
      dessert: "21:45",
    },
    menu: [
      "Amuse-bouche: Wagyu Tartare — shallot, capers, Dijon, quail yolk, crostini",
      "Entrée: Seared Scallop — U10, cauliflower purée, crispy pancetta, micro watercress",
      "Soup: Lobster Bisque — roasted shell base, brandy flambe, 35% cream",
      "Main: Beef Wellington — MSA fillet, duxelles, filo, Madeira jus",
      "Dessert: Croquembouche — choux, crème pât, spun toffee (30 pax per tower)",
    ],
    teamIds: ["s1", "s2", "s4", "s5"],
    timeline: [
      { id: "t13", time: "07:00", task: "Wellington: sear fillet all sides smoking pan 30sec/side. Chill to 4°C. Duxelles on", completed: false },
      { id: "t14", time: "09:00", task: "Duxelles reduce dry — no moisture. Assemble Wellingtons, wrap filo, chill", completed: false },
      { id: "t15", time: "10:00", task: "Pastry: choux batter, bake 200°C/18min no peeking. Fill with crème pât < 5°C", completed: false },
      { id: "t16", time: "13:00", task: "Bisque: roast shells, flambe brandy, add stock, reduce by 1/3. Strain. Taste & season", completed: false },
      { id: "t17", time: "15:00", task: "Scallops dry on paper towel — critical for sear. Cauliflower purée blended smooth", completed: false },
      { id: "t18", time: "17:00", task: "Grand Ballroom set — all crockery polished, pass mise en place complete", completed: false },
      { id: "t19", time: "18:30", task: "Croquembouche assembly. 15 towers × 30 pax. Keep dry — NO humidity", completed: false },
      { id: "t20", time: "19:00", task: "Amuse away — wagyu tartare plated × 450", completed: false },
      { id: "t21", time: "19:30", task: "Fire entrée — scallops: sear smoking clarified butter 90sec/side, do NOT move", completed: false },
      { id: "t22", time: "20:30", task: "Fire Wellingtons: 220°C/12min to 54°C core. Rest 5min tented. Madeira jus reheated", completed: false },
      { id: "t23", time: "21:45", task: "Dessert away — croquembouche on tables, spun toffee on last", completed: false },
    ],
  },
];

const SAMPLE_PREP: PrepItem[] = [
  {
    id: "p1", functionId: "f1", category: "Proteins",
    team: "Butchery",
    dish: "MSA Eye Fillet",
    quantity: "280 portions × 220g (62kg total)",
    deadline: "08:00",
    prepDay: "day-of",
    note: "Trim sinew & silverskin. Truss with butcher's twine. Portion 220g. Season sea salt both sides. Chill portioned on trays — do NOT sear until service. Sear in clarified butter all sides. Finish 180°C deck oven to 54°C core (med-rare). Rest 3min.",
    completed: true,
  },
  {
    id: "p2", functionId: "f1", category: "Proteins",
    team: "Cold Larder",
    dish: "Tiger Prawn Cocktail",
    quantity: "280 portions × 5 prawns (1,400 prawns, approx. 14kg)",
    deadline: "16:00 (previous day)",
    prepDay: "day-before",
    note: "Poach green tiger prawns @ 70°C/3min. Refresh ice bath immediately. Peel, devein, dry on paper towel. Refrigerate covered overnight. Day-of: arrange 5 prawns per boat over iceberg. Catering team to dress with Marie Rose at service.",
    completed: true,
  },
  {
    id: "p3", functionId: "f1", category: "Sauces",
    team: "Hot Kitchen",
    dish: "Béarnaise Sauce",
    quantity: "12L (approx. 40mL per serve + 20% buffer)",
    deadline: "11:45",
    prepDay: "day-of",
    note: "Classic white wine & tarragon reduction. Whisk egg yolks to ribbon stage over bain-marie. Stream in 8kg clarified butter. Hold in bain-marie at 60°C. Make fresh — do NOT batch > 2h pre-service. Discard if grainy or broken.",
    completed: false,
  },
  {
    id: "p4", functionId: "f1", category: "Sauces",
    team: "Cold Larder",
    dish: "Marie Rose Cocktail Sauce",
    quantity: "5L",
    deadline: "09:00",
    prepDay: "day-of",
    note: "Combine: mayo, tomato sauce, Worcestershire, Tabasco, lemon juice. Season. Fill squeeze bottles. Temp check < 5°C before service. Label & date. Catering team to dress prawn cocktails at service.",
    completed: true,
  },
  {
    id: "p5", functionId: "f1", category: "Sides",
    team: "Hot Kitchen",
    dish: "Truffle Potato Gratin",
    quantity: "280 portions — 8 full gastros × 35 portions each",
    deadline: "10:30",
    prepDay: "day-of",
    note: "Mandoline slice Nicola potatoes 1.5mm. Layer with truffle cream (300mL truffle oil per gastro) & gruyère. Bake 180°C/45min under foil, uncover last 10min. Rest 20min. Portion 4×7 cuts per gastro. Cover & hold in bain-marie 65°C.",
    completed: false,
  },
  {
    id: "p6", functionId: "f1", category: "Pastry",
    team: "Pastry",
    dish: "Vanilla Panna Cotta",
    quantity: "290 pots (10 spare) — 1L cream mix per 5 serves",
    deadline: "15:00 (previous day)",
    prepDay: "day-before",
    note: "3.5 gold gelatine leaves per litre. Warm cream to 60°C, dissolve gelatine. Vanilla bean split & scraped. Set overnight at 4°C. Day-of AM: garnish with berry coulis 20mL per pot, micro herbs. Temp check < 5°C.",
    completed: true,
  },
  {
    id: "p7", functionId: "f2", category: "Proteins",
    team: "Hot Kitchen",
    dish: "Chicken Supreme — Airline Breast",
    quantity: "20 portions × 200g (skin on)",
    deadline: "12:30",
    prepDay: "day-of",
    note: "Score skin. Season both sides. Sear skin-down in clarified butter 3min until golden — do NOT move. Flip, baste. Finish 180°C/8min to 74°C core (probe check). Rest 5min tented foil. Jus lié 30mL per serve, held at 80°C.",
    completed: true,
  },
  {
    id: "p8", functionId: "f2", category: "Pastry",
    team: "Pastry",
    dish: "Chocolate Fondant — Valrhona 70%",
    quantity: "20 portions + 4 spares for test bakes",
    deadline: "09:00",
    prepDay: "day-of",
    note: "Ganache centre — freeze solid -18°C minimum 4h. Batter: dark choc, butter, eggs, sugar, flour. Ramekins buttered & cocoa-dusted. Fire to order 200°C/8min — centre must jiggle. Pastry to test bake 1 at service start. Do NOT pre-bake.",
    completed: false,
  },
  {
    id: "p9", functionId: "f3", category: "Proteins",
    team: "Hot Kitchen",
    dish: "Beef Wellington — MSA Fillet",
    quantity: "450 portions × 180g (81kg fillet total)",
    deadline: "14:00",
    prepDay: "day-of",
    note: "Sear all sides smoking-hot pan, 30sec per side — deep Maillard crust. Chill to 4°C before wrapping. Duxelles: 200g per kg beef — button mushroom, shallot, thyme, reduce bone dry. Brush with Dijon. Wrap filo 3 sheets, seam-down. Chill wrapped. Fire: 220°C/12min to 54°C core. Rest 5min tented.",
    completed: false,
  },
  {
    id: "p10", functionId: "f3", category: "Seafood",
    team: "Cold Larder",
    dish: "Seared Scallop — U10",
    quantity: "900 pieces × 2 per serve (approx. 45kg). Cauliflower purée: 60g per plate",
    deadline: "17:00",
    prepDay: "day-of",
    note: "U10 scallops, roe off. Dry on paper towel minimum 2h — CRITICAL for sear. Cold larder to prep & hand to hot pass at service. Cauliflower purée: blended smooth, seasoned, held warm. Sear: smoking clarified butter 90sec each side — do NOT move.",
    completed: false,
  },
  {
    id: "p11", functionId: "f3", category: "Sauces",
    team: "Hot Kitchen",
    dish: "Lobster Bisque",
    quantity: "205L (450mL per serve + 10L buffer)",
    deadline: "17:00",
    prepDay: "day-of",
    note: "Roast lobster shells 220°C/20min. Sweat mirepoix, add shells, brandy flambe. Fish stock & tomato paste. Simmer 40min, strain fine chinois. Reduce by 1/3. Finish with 35% cream at service. Temp check 75°C+ before service. Hold in bain-marie.",
    completed: false,
  },
  {
    id: "p12", functionId: "f3", category: "Pastry",
    team: "Pastry",
    dish: "Croquembouche",
    quantity: "15 towers × 30 pax (450 total). Choux: approx. 2,700 puffs",
    deadline: "18:30",
    prepDay: "day-of",
    note: "Choux puffs: bake 200°C/18min — NO peeking. Cool on rack. Fill with crème pâtissière cooled to < 5°C. Toffee: 165°C amber. Dip puffs, build cone. Spun toffee wrap last. Assemble day-of, min. 30min pre-service. Keep dry — NO humidity or toffee weeps.",
    completed: false,
  },
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

const STORAGE_KEY_FUNCTIONS = "@kitchen_functions_v2";
const STORAGE_KEY_PREP = "@kitchen_prep_v2";
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
          ? { ...fn, timeline: fn.timeline.map((t) => t.id === timelineId ? { ...t, completed: !t.completed } : t) }
          : fn
      );
      AsyncStorage.setItem(STORAGE_KEY_FUNCTIONS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <KitchenContext.Provider
      value={{
        functions, prepItems, staff,
        currentStaffId, notificationsEnabled,
        broadcastMessage, dismissedBroadcastId,
        setCurrentStaff, setBroadcast, clearBroadcast, dismissBroadcast,
        togglePrepItem, toggleTimelineItem, todayDate,
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
