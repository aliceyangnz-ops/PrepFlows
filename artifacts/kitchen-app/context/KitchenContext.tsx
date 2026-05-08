import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface TimelineItem {
  id: string;
  time: string;
  task: string;
  category: "setup" | "venue" | "service" | "brief" | "close";
  completed: boolean;
}

export interface DietaryRequirement {
  name: string;
  count: number;
  note?: string;
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
  floor: string;
  functionType: FunctionType;
  startTime: string;
  endTime: string;
  guestCount: number;
  status: "upcoming" | "active" | "completed";
  menu: string[];
  dietaryRequirements: DietaryRequirement[];
  serviceTimes?: ServiceTimes;
  teamIds: string[];
  timeline: TimelineItem[];
}

export type PrepTeam = "Cold Larder" | "Pastry" | "Hot Kitchen" | "Function Team" | "Butchery";
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
  staffNumber: string;
  name: string;
  role: "Head Chef" | "Sous Chef" | "Pastry Chef" | "Function Captain" | "Casual";
  shiftStart: string;
  shiftEnd: string;
  functionIds: string[];
  teamLeadFor?: PrepTeam;
  section?: PrepTeam;
}

export interface BroadcastMessage {
  id: string;
  text: string;
  senderName: string;
  senderRole: string;
  sentAt: string;
}

const SAMPLE_STAFF: StaffMember[] = [
  { id: "s1", staffNumber: "#0001", name: "Marco Ricci",   role: "Head Chef",        shiftStart: "05:00", shiftEnd: "14:00", functionIds: ["f1","f2","f3"], teamLeadFor: "Hot Kitchen",   section: "Hot Kitchen" },
  { id: "s2", staffNumber: "#0002", name: "Sarah Chen",    role: "Sous Chef",        shiftStart: "07:00", shiftEnd: "16:00", functionIds: ["f1","f3"],      teamLeadFor: "Cold Larder",   section: "Cold Larder" },
  { id: "s3", staffNumber: "#0047", name: "Jake Morrison", role: "Casual",           shiftStart: "09:00", shiftEnd: "17:00", functionIds: ["f1","f2","f3"],                                section: "Function Team" },
  { id: "s4", staffNumber: "#0003", name: "Amara Osei",    role: "Pastry Chef",      shiftStart: "06:00", shiftEnd: "15:00", functionIds: ["f1","f2","f3"], teamLeadFor: "Pastry",        section: "Pastry" },
  { id: "s5", staffNumber: "#0063", name: "Liam Walsh",    role: "Casual",           shiftStart: "10:00", shiftEnd: "18:00", functionIds: ["f1","f2","f3"],                                section: "Function Team" },
  { id: "s6", staffNumber: "#0012", name: "David Park",    role: "Function Captain", shiftStart: "08:00", shiftEnd: "22:00", functionIds: ["f1","f2","f3"], teamLeadFor: "Function Team", section: "Function Team" },
];

const SAMPLE_FUNCTIONS: KitchenFunction[] = [
  {
    id: "f1",
    name: "Harrison Wedding Luncheon",
    room: "Ballroom A",
    floor: "Level 1",
    functionType: "A-la-carte",
    startTime: "12:00",
    endTime: "15:00",
    guestCount: 280,
    status: "upcoming",
    dietaryRequirements: [
      { name: "Gluten Free", count: 12, note: "Separate plating — GF label on pass. No croutons, GF gratin." },
      { name: "Vegan", count: 4, note: "Portobello mushroom main. Panna cotta — coconut milk set, check berry coulis." },
      { name: "Nut Allergy", count: 3, note: "SEVERE — no shared boards. Check truffle gratin (contains pine nuts). Epinephrine on site." },
      { name: "Dairy Free", count: 2, note: "No béarnaise. DF margarine sub. Panna cotta coconut milk — confirm with Pastry." },
      { name: "Shellfish Allergy", count: 1, note: "No prawn cocktail. Replace with smoked salmon alternative — confirm with Head Chef." },
    ],
    serviceTimes: {
      entree: "12:00",
      main: "12:35",
      dessert: "13:30",
    },
    menu: [
      "Entrée: Tiger Prawn Cocktail — 5 poached tiger prawns, Marie Rose, iceberg lettuce, lemon | GF | Alt: smoked salmon (shellfish allergy)",
      "Main: Roasted MSA Eye Fillet 220g — béarnaise sauce, truffle potato gratin, charred broccolini | GF | Alt: portobello mushroom stack (V, GF, DF)",
      "Dessert: Vanilla Panna Cotta — berry coulis, micro herbs, shortbread tuile | GF (without tuile) | Alt: poached pear (V, GF, DF)",
    ],
    teamIds: ["s1", "s2", "s3", "s6"],
    timeline: [
      { id: "t1",  time: "06:00", task: "KITCHEN OPEN — Mise en place. All stations set, benches clear, HACCP sheets started. Cold room temp check.", category: "setup", completed: true },
      { id: "t2",  time: "08:00", task: "Eye fillet: trim sinew, truss, portion 220g × 280. Season. Hold chilled on trays. GF gratin trays labelled.", category: "setup", completed: true },
      { id: "t3",  time: "10:00", task: "Béarnaise reduction on. Gratin into deck oven 180°C/45min. Marie Rose & cocktail sauce bottled. Allergen alternates prepped.", category: "setup", completed: false },
      { id: "t4",  time: "11:30", task: "VENUE CHECK — Ballroom A: crockery polished, mise en place on pass, lamps on. Table numbers confirmed vs seating chart.", category: "venue", completed: false },
      { id: "t5",  time: "11:45", task: "PRE-SERVICE BRIEF — All team. Runner sections confirmed. Allergen plan reviewed. Kitchen radio comms check. Head Chef to sign off.", category: "brief", completed: false },
      { id: "t6",  time: "12:00", task: "GUESTS ARRIVE — Ballroom A, Level 1. Function Captain David Park at entrance. Dietary alternates on separate tray — labelled & ready.", category: "service", completed: false },
      { id: "t7",  time: "12:00", task: "ENTRÉE AWAY — Prawn cocktail × 268 standard + 1 × salmon (shellfish alt). Fire all simultaneously. Garnish: lemon wedge, paprika dust.", category: "service", completed: false },
      { id: "t8",  time: "12:35", task: "FIRE MAINS — Sear fillet clarified butter all sides. Finish 180°C/54°C core. Rest 3min tented. GF plates: no truffle crouton.", category: "service", completed: false },
      { id: "t9",  time: "13:30", task: "DESSERT AWAY — Panna cotta × 276 standard + 4 × poached pear (V alt). Garnish: berry coulis, micro herbs. GF: no shortbread.", category: "service", completed: false },
      { id: "t10", time: "14:30", task: "Last covers cleared. Pass broken down. Leftover food labelled & chilled for HACCP. Function Captain signs off room with Events.", category: "close", completed: false },
      { id: "t11", time: "15:00", task: "KITCHEN CLEAR — All surfaces sanitised. HACCP sheets completed & signed off by Head Chef. Waste logged.", category: "close", completed: false },
    ],
  },
  {
    id: "f2",
    name: "Corporate Boardroom Lunch",
    room: "Suite 3",
    floor: "Level 2",
    functionType: "A-la-carte",
    startTime: "13:00",
    endTime: "14:30",
    guestCount: 18,
    status: "upcoming",
    dietaryRequirements: [
      { name: "Vegetarian", count: 2, note: "Mushroom risotto main. Antipasto: remove prosciutto & salami. EVOO & giardiniera OK." },
      { name: "Gluten Free", count: 1, note: "No grissini on platter. GF bread roll available. Confirm fondant — use GF flour sub." },
      { name: "Halal", count: 1, note: "No prosciutto, no salami. Replace with halal chicken/roasted capsicum on platter. Confirm with Events Manager." },
    ],
    serviceTimes: {
      entree: "13:00",
      main: "13:25",
      dessert: "14:05",
    },
    menu: [
      "Starter: Antipasto Sharing Platter — cured meats, giardiniera, grissini, EVOO, olives, marinated artichoke | GF on request (no grissini) | V: remove cured meats | Halal: halal meats only",
      "Main: Chicken Supreme 200g — airline breast, jus lié, pomme purée, seasonal greens | GF | Alt: wild mushroom risotto (V, GF)",
      "Dessert: Chocolate Fondant — Valrhona 70%, crème anglaise, vanilla bean ice cream | Alt: seasonal fruit plate (V, GF, DF)",
    ],
    teamIds: ["s1", "s3", "s6"],
    timeline: [
      { id: "t12", time: "09:00", task: "KITCHEN OPEN — Fondant batter made & chilled. Chicken trimmed & portioned 200g × 18 + 2 spares. Mushroom risotto base on.", category: "setup", completed: true },
      { id: "t13", time: "10:00", task: "Dietary alternates: GF fondant batter made (separate bowl, labelled). Halal antipasto tray prepped & wrapped. Vegetarian risotto portioned.", category: "setup", completed: false },
      { id: "t14", time: "12:30", task: "VENUE CHECK — Suite 3: white linen runner, polished crockery, 5-piece cutlery, water goblet. Client seating cards per Events list.", category: "venue", completed: false },
      { id: "t15", time: "12:45", task: "PRE-SERVICE BRIEF — 3 staff: Function Captain David Park, plus runners. Allergen seats confirmed (GF seat 4, V seats 7 & 12, Halal seat 15).", category: "brief", completed: false },
      { id: "t16", time: "12:50", task: "Function Captain greets client in Level 2 lobby. Welcome drinks poured. Still & sparkling water on table.", category: "venue", completed: false },
      { id: "t17", time: "13:00", task: "CLIENT SEATED — Suite 3, Level 2. Antipasto platters pre-set on table. Halal platter to seat 15, V platter centre.", category: "service", completed: false },
      { id: "t18", time: "13:25", task: "FIRE MAINS — Chicken sear skin-down 3min (do not move), flip, 180°C/74°C core. Rest 5min. Risotto reheated, adjust seasoning.", category: "service", completed: false },
      { id: "t19", time: "14:05", task: "FIRE DESSERT — Fondants 200°C/8min to order. Jiggly centre only. GF fondant in separate ramekin (clearly marked). Plate immediately.", category: "service", completed: false },
      { id: "t20", time: "14:30", task: "SERVICE COMPLETE — Room cleared. Client farewell. HACCP sheets signed. Suite 3 reset for next booking.", category: "close", completed: false },
    ],
  },
  {
    id: "f3",
    name: "Gala Dinner",
    room: "Grand Ballroom",
    floor: "Ground Floor",
    functionType: "A-la-carte",
    startTime: "19:00",
    endTime: "23:00",
    guestCount: 450,
    status: "upcoming",
    dietaryRequirements: [
      { name: "Gluten Free", count: 28, note: "Wellington: deconstructed fillet + duxelles, no filo. GF trays clearly labelled. Separate pass section for GF." },
      { name: "Vegan", count: 12, note: "Mushroom Wellington (V, GF). No bisque — tomato consommé. No wagyu amuse — beet tartare. Check croquembouche (contains egg)." },
      { name: "Nut Allergy", count: 8, note: "SEVERE — check all sauces. Truffle oil OK. Pine nuts in duxelles — REMOVE for nut allergy plates. Epinephrine on site, notify Function Captain." },
      { name: "Dairy Free", count: 6, note: "No crème anglaise, no butter sauces. DF margarine for searing. Bisque: coconut cream sub. Croquembouche: no crème pât — sorbet alt." },
      { name: "Shellfish Allergy", count: 4, note: "No scallop entrée — mushroom bruschetta alt. No bisque — tomato consommé. Check Madeira jus (shellfish-free stock confirmed)." },
      { name: "Halal", count: 2, note: "Halal beef fillet confirmed with supplier. No alcohol sauces (brandy bisque replaced with tomato consommé). Confirm with Head Chef." },
    ],
    serviceTimes: {
      amuse: "19:00",
      entree: "19:30",
      main: "20:30",
      dessert: "21:45",
    },
    menu: [
      "Amuse-bouche: Wagyu Beef Tartare — shallot, capers, Dijon, quail yolk, crostini | Alt: roasted beet tartare (V, GF)",
      "Entrée: Seared U10 Scallop — cauliflower purée, crispy pancetta, micro watercress | Alt: mushroom bruschetta (V, shellfish allergy)",
      "Soup: Lobster Bisque — roasted shell base, brandy flambe, 35% cream | Alt: tomato consommé (V, GF, shellfish & alcohol alt)",
      "Main: Beef Wellington — MSA fillet, wild mushroom duxelles, filo pastry, Madeira jus | GF: deconstructed | Alt: mushroom Wellington (V, GF)",
      "Dessert: Croquembouche — choux, crème pâtissière, spun toffee (30 pax per tower) | Alt: dark chocolate fondant (GF) | DF: mango sorbet",
    ],
    teamIds: ["s1", "s2", "s4", "s5", "s6"],
    timeline: [
      { id: "t21", time: "07:00", task: "KITCHEN OPEN — Wellington: sear fillet smoking pan 30sec/side. Deep Maillard crust. Chill to 4°C before wrapping. Duxelles on (no pine nuts for nut allergy batch).", category: "setup", completed: false },
      { id: "t22", time: "09:00", task: "Duxelles reduce bone dry — zero moisture or pastry weeps. Wellingtons wrapped filo, seam-down, chilled. Allergen batch labelled & separated.", category: "setup", completed: false },
      { id: "t23", time: "10:00", task: "Pastry: choux puffs baked 200°C/18min — NO peeking. Cool on rack. Fill crème pât cooled < 5°C. GF fondant batter prepared (separate bowl).", category: "setup", completed: false },
      { id: "t24", time: "13:00", task: "Bisque: roast lobster shells 220°C/20min. Sweat mirepoix, brandy flambe, add stock, reduce by 1/3. Strain fine chinois. Taste & season.", category: "setup", completed: false },
      { id: "t25", time: "15:00", task: "Scallops dry on paper towel minimum 2h — CRITICAL for sear. Cauliflower purée blended smooth, seasoned. Vegan amuse (beet tartare) prepped.", category: "setup", completed: false },
      { id: "t26", time: "17:00", task: "VENUE CHECK — Grand Ballroom: 53 rounds set (50 × 9 + 3 VIP × 10). Charger plates, gold overlay, 4-glass set, menu & name cards on VIP tables.", category: "venue", completed: false },
      { id: "t27", time: "18:00", task: "PRE-SERVICE BRIEF — Function Captain David Park leads. Full allergen seat map reviewed. Runner sections × 5 (90 covers each). Kitchen radio test. Head Chef sign-off.", category: "brief", completed: false },
      { id: "t28", time: "18:30", task: "Croquembouche towers placed: 15 towers × 30 pax. Minimum 2 people per tower — carry flat board. Spun toffee facing guests. Candelabras lit.", category: "venue", completed: false },
      { id: "t29", time: "19:00", task: "GUESTS ARRIVE — Grand Ballroom, Ground Floor. Allergen alternates on separate labelled tray at pass. Amuse-bouche away: wagyu × 438, beet × 12 (V/GF).", category: "service", completed: false },
      { id: "t30", time: "19:30", task: "ENTRÉE AWAY — Scallops: sear smoking clarified butter 90sec each side, do NOT move. Alt plates (mushroom bruschetta) fired simultaneously. 5-min window per 90 covers.", category: "service", completed: false },
      { id: "t31", time: "20:00", task: "SOUP COURSE AWAY — Bisque finish with 35% cream, 75°C+. Alt: tomato consommé for V/shellfish/halal (22 covers). Serve simultaneously.", category: "service", completed: false },
      { id: "t32", time: "20:30", task: "FIRE MAINS — Wellingtons: 220°C/12min to 54°C core. Rest 5min tented. GF deconstructed batch (28): fillet + duxelles, no filo, separately plated.", category: "service", completed: false },
      { id: "t33", time: "21:45", task: "DESSERT AWAY — Croquembouche portioned tableside by Pastry Chef Amara Osei. GF fondant (28) fired simultaneously. DF mango sorbet (6) pre-scooped.", category: "service", completed: false },
      { id: "t34", time: "22:30", task: "Last covers cleared. Pass broken down. Leftovers labelled & chilled. Function Captain signs off room with Events Manager.", category: "close", completed: false },
      { id: "t35", time: "23:00", task: "KITCHEN CLEAR — All surfaces sanitised. HACCP sheets completed & signed by Head Chef. Waste logged. Cold room final temp check.", category: "close", completed: false },
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

  // ── FUNCTION TEAM — f1 Harrison Wedding ─────────────────────────────────
  {
    id: "p_f1a", functionId: "f1", category: "Room Setup",
    team: "Function Team",
    dish: "Ballroom A — Room Setup & Linen",
    quantity: "35 rounds × 8 covers = 280 total. 35 tablecloths, 280 napkins",
    deadline: "09:30",
    prepDay: "day-of",
    note: "Set white damask tablecloths — pressed, no creases. Bishop's hat napkin fold per cover. Gold centrepiece candelabra × 35. Wedding menu cards at each place setting. All chairs level and equal spacing. Head Chef to sign off before 11:00.",
    completed: true,
  },
  {
    id: "p_f1b", functionId: "f1", category: "Room Setup",
    team: "Function Team",
    dish: "Crockery, Cutlery & Glassware — Polish & Set",
    quantity: "280 covers × full set: entrée plate + main plate + dessert plate + 5-piece cutlery + 2 glasses",
    deadline: "11:00",
    prepDay: "day-of",
    note: "Polish all crockery and glassware with lint-free cloth — no smears or lipstick marks. 5-piece cutlery per cover (fish knife/fork for prawn). Water goblet + white wine glass. Inspection standard: hold to light. Function Captain to sign off.",
    completed: false,
  },
  {
    id: "p_f1c", functionId: "f1", category: "Service",
    team: "Function Team",
    dish: "Pass Setup, Food Assembly & Runner Brief",
    quantity: "Pass for 280 covers — 4 runners, 3 sections",
    deadline: "11:30",
    prepDay: "day-of",
    note: "Set hot pass lamps. Garnish mise en place on pass: watercress, lemon wedges cut to 8ths, paprika. Béarnaise squeeze bottles from Hot Kitchen. Pre-service brief 11:45: course order (entrée 12:00 → main 12:35 → dessert 13:30), runner sections, kitchen radio comms check.",
    completed: false,
  },

  // ── FUNCTION TEAM — f2 Corporate Boardroom ──────────────────────────────
  {
    id: "p_f2a", functionId: "f2", category: "Room Setup",
    team: "Function Team",
    dish: "Suite 3 — Boardroom Setup",
    quantity: "18 covers — 1 boardroom table, 1 linen runner",
    deadline: "11:30",
    prepDay: "day-of",
    note: "Crisp white linen runner centred. 5-piece cutlery per cover. Water goblet + red wine glass. Client name cards per seating list (provided by Events Manager). Low floral centrepiece. Still water poured at 12:30. Function Captain to greet client on arrival.",
    completed: true,
  },
  {
    id: "p_f2b", functionId: "f2", category: "Service",
    team: "Function Team",
    dish: "Antipasto Platters & Bread Service — Assembly",
    quantity: "3 sharing platters (6 covers each). Grissini × 36. Ciabatta 18 slices",
    deadline: "12:45",
    prepDay: "day-of",
    note: "Cold Larder to supply cured meats, giardiniera, olives. Function Team to arrange on slate platters. EVOO in ramekins. Slice ciabatta, fill bread baskets. Pre-set platters at 12:45 — antipasto on table before client seated. Dessert: Pastry to deliver fondants to pass at 14:00.",
    completed: false,
  },

  // ── FUNCTION TEAM — f3 Gala Dinner ──────────────────────────────────────
  {
    id: "p_f3a", functionId: "f3", category: "Room Setup",
    team: "Function Team",
    dish: "Grand Ballroom — Gala Dinner Setup",
    quantity: "50 rounds × 9 covers (450 total) + 3 VIP rounds × 10 covers",
    deadline: "15:00",
    prepDay: "day-of",
    note: "Gold charger plates at every cover. White tablecloth + gold satin overlay. 5-piece cutlery PLUS fish knife & fork (scallop entrée). 4 glasses per cover: water, white wine, red wine, dessert wine. Menu cards & name cards on VIP tables. Candelabras lit at 18:30.",
    completed: false,
  },
  {
    id: "p_f3b", functionId: "f3", category: "Room Setup",
    team: "Function Team",
    dish: "Croquembouche — Table Placement",
    quantity: "15 towers — 1 per 2 rounds (30 pax per tower). Do NOT move once set",
    deadline: "18:45",
    prepDay: "day-of",
    note: "Coordinate with Pastry Chef (Amara Osei) before moving any tower. Carry on flat board — minimum 2 people per tower. Position centred on round. Spun toffee to face guests. Brief wait staff: towers are display AND service, do NOT pre-cut — Pastry Chef will portion at table.",
    completed: false,
  },
  {
    id: "p_f3c", functionId: "f3", category: "Service",
    team: "Function Team",
    dish: "Service Runners & Pass Communication Brief",
    quantity: "15 runners — 3 runners per section (5 sections of 90 covers each)",
    deadline: "18:30",
    prepDay: "day-of",
    note: "Pre-service brief at 18:00 sharp (Function Captain David Park leads). Course order: amuse-bouche 19:00 → entrée 19:30 → bisque 20:00 → main 20:30 → dessert 21:45. Head Chef calls 'away' via radio — runners pick up at main pass within 2min. 5-min window per 50 covers. No course goes before Head Chef 'away' call.",
    completed: false,
  },
];

export const MANAGER_ROLES = ["Head Chef", "Sous Chef", "Pastry Chef", "Function Captain"] as const;

interface KitchenContextType {
  functions: KitchenFunction[];
  prepItems: PrepItem[];
  staff: StaffMember[];
  sickStaffIds: string[];
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
  updateFunction: (id: string, updates: Partial<Omit<KitchenFunction, "id" | "timeline">>) => void;
  markStaffSick: (staffId: string, sick: boolean) => void;
  todayDate: string;
}

const KitchenContext = createContext<KitchenContextType | null>(null);

const STORAGE_KEY_FUNCTIONS = "@kitchen_functions_v3";
const STORAGE_KEY_SICK = "@kitchen_sick_v1";
const STORAGE_KEY_PREP = "@kitchen_prep_v3";
const STORAGE_KEY_CURRENT_STAFF = "@kitchen_current_staff";
const STORAGE_KEY_NOTIFS = "@kitchen_notifs_enabled";
const STORAGE_KEY_BROADCAST = "@kitchen_broadcast";
const STORAGE_KEY_DISMISSED = "@kitchen_dismissed_broadcast";

export function KitchenProvider({ children }: { children: React.ReactNode }) {
  const [functions, setFunctions] = useState<KitchenFunction[]>(SAMPLE_FUNCTIONS);
  const [prepItems, setPrepItems] = useState<PrepItem[]>(SAMPLE_PREP);
  const [staff] = useState<StaffMember[]>(SAMPLE_STAFF);
  const [sickStaffIds, setSickStaffIds] = useState<string[]>([]);
  const [currentStaffId, setCurrentStaffIdState] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [broadcastMessage, setBroadcastState] = useState<BroadcastMessage | null>(null);
  const [dismissedBroadcastId, setDismissedBroadcastId] = useState<string | null>(null);

  const today = new Date();
  const todayDate = today.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" });

  useEffect(() => {
    (async () => {
      try {
        const [storedFunctions, storedPrep, storedStaff, storedNotifs, storedBroadcast, storedDismissed, storedSick] =
          await Promise.all([
            AsyncStorage.getItem(STORAGE_KEY_FUNCTIONS),
            AsyncStorage.getItem(STORAGE_KEY_PREP),
            AsyncStorage.getItem(STORAGE_KEY_CURRENT_STAFF),
            AsyncStorage.getItem(STORAGE_KEY_NOTIFS),
            AsyncStorage.getItem(STORAGE_KEY_BROADCAST),
            AsyncStorage.getItem(STORAGE_KEY_DISMISSED),
            AsyncStorage.getItem(STORAGE_KEY_SICK),
          ]);
        if (storedFunctions) setFunctions(JSON.parse(storedFunctions));
        if (storedPrep) setPrepItems(JSON.parse(storedPrep));
        if (storedStaff) setCurrentStaffIdState(storedStaff);
        if (storedNotifs) setNotificationsEnabled(storedNotifs === "true");
        if (storedBroadcast) setBroadcastState(JSON.parse(storedBroadcast));
        if (storedDismissed) setDismissedBroadcastId(storedDismissed);
        if (storedSick) setSickStaffIds(JSON.parse(storedSick));
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

  const updateFunction = useCallback((id: string, updates: Partial<Omit<KitchenFunction, "id" | "timeline">>) => {
    setFunctions((prev) => {
      const updated = prev.map((fn) => fn.id === id ? { ...fn, ...updates } : fn);
      AsyncStorage.setItem(STORAGE_KEY_FUNCTIONS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const markStaffSick = useCallback((staffId: string, sick: boolean) => {
    setSickStaffIds((prev) => {
      const updated = sick ? [...prev.filter((x) => x !== staffId), staffId] : prev.filter((x) => x !== staffId);
      AsyncStorage.setItem(STORAGE_KEY_SICK, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <KitchenContext.Provider
      value={{
        functions, prepItems, staff, sickStaffIds,
        currentStaffId, notificationsEnabled,
        broadcastMessage, dismissedBroadcastId,
        setCurrentStaff, setBroadcast, clearBroadcast, dismissBroadcast,
        togglePrepItem, toggleTimelineItem, updateFunction, markStaffSick, todayDate,
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
