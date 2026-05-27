/**
 * Culinary Lexicon Service
 *
 * Professional kitchen terminology database covering:
 *   — Classic French culinary vocabulary (Brigade de Cuisine standard)
 *   — Australian & New Zealand hospitality English
 *   — Māori food vocabulary (Te Reo Māori)
 *   — Allergen inference rules from dish/ingredient names
 *   — HACCP critical control point rules (aligned with FSANZ Food Safety Standards)
 *   — Cooking method → prep team assignment
 *
 * Used by the AI parse pipeline to normalize terminology, infer allergens
 * from menu items, and generate HACCP-aware prep and timeline tasks.
 */

// ─── Type definitions ──────────────────────────────────────────────────────

export type PrepTeam =
  | "Hot Kitchen"
  | "Cold Larder"
  | "Pastry"
  | "Function Team";
export type AllergenSeverity = "definite" | "likely" | "possible";

export interface CulinaryTerm {
  term: string;
  language: "french" | "maori" | "aunz" | "english";
  english: string;
  category:
    | "technique"
    | "cut"
    | "sauce"
    | "ingredient"
    | "course"
    | "concept"
    | "equipment";
  prepTeam?: PrepTeam;
  allergens?: string[];
  haccpNote?: string;
}

export interface AllergenFlag {
  dish: string;
  allergens: string[];
  severity: AllergenSeverity;
  note: string;
}

export interface HACCPNote {
  rule: string;
  priority: "critical" | "major" | "minor";
  minTemp?: number;
  context: string;
}

// ─── French culinary glossary ──────────────────────────────────────────────
// Covers Brigade de Cuisine standard terminology, classic sauce & technique names,
// and French dish names commonly appearing on ANZ hospitality menus.

export const FRENCH_GLOSSARY: CulinaryTerm[] = [
  // ── Courses ────────────────────────────────────────────────────────────────
  {
    term: "amuse-bouche",
    language: "french",
    english: "one-bite appetiser",
    category: "course",
    prepTeam: "Function Team",
  },
  {
    term: "amuse bouche",
    language: "french",
    english: "one-bite appetiser",
    category: "course",
    prepTeam: "Function Team",
  },
  {
    term: "entrée",
    language: "french",
    english: "starter/first course",
    category: "course",
    prepTeam: "Cold Larder",
  },
  {
    term: "entremets",
    language: "french",
    english: "between-course sweet",
    category: "course",
    prepTeam: "Pastry",
  },
  {
    term: "plat principal",
    language: "french",
    english: "main course",
    category: "course",
    prepTeam: "Hot Kitchen",
  },
  {
    term: "fromage",
    language: "french",
    english: "cheese course",
    category: "course",
    allergens: ["Dairy"],
    prepTeam: "Cold Larder",
  },
  {
    term: "mignardise",
    language: "french",
    english: "petit fours/sweet bites",
    category: "course",
    prepTeam: "Pastry",
  },
  {
    term: "pré-dessert",
    language: "french",
    english: "pre-dessert palate cleanser",
    category: "course",
    prepTeam: "Pastry",
  },

  // ── Techniques ─────────────────────────────────────────────────────────────
  {
    term: "mise en place",
    language: "french",
    english: "everything in its place — advance preparation",
    category: "technique",
    prepTeam: "Hot Kitchen",
  },
  {
    term: "sauté",
    language: "french",
    english: "quick-fry in fat over high heat",
    category: "technique",
    prepTeam: "Hot Kitchen",
  },
  {
    term: "braisé",
    language: "french",
    english: "braised — slow-cooked in liquid",
    category: "technique",
    prepTeam: "Hot Kitchen",
    haccpNote:
      "Braise to 90°C+ for collagen breakdown; hold at 63°C+ or cool below 5°C within 4h",
  },
  {
    term: "confit",
    language: "french",
    english: "slow-cooked submerged in fat",
    category: "technique",
    prepTeam: "Hot Kitchen",
    haccpNote:
      "Duck/pork confit: cook to 74°C+ core; store covered in fat at ≤4°C",
  },
  {
    term: "poché",
    language: "french",
    english: "poached — cooked gently in liquid",
    category: "technique",
    prepTeam: "Hot Kitchen",
    haccpNote:
      "Poach at 70-80°C; core must reach safe temp: 63°C seafood, 74°C poultry",
  },
  {
    term: "rôti",
    language: "french",
    english: "roasted",
    category: "technique",
    prepTeam: "Hot Kitchen",
  },
  {
    term: "grillé",
    language: "french",
    english: "grilled",
    category: "technique",
    prepTeam: "Hot Kitchen",
  },
  {
    term: "flambé",
    language: "french",
    english: "flamed with alcohol",
    category: "technique",
    prepTeam: "Hot Kitchen",
    haccpNote:
      "Flame safely; confirm with Head Chef before service. Alcohol is NOT a halal concern if burned off but confirm per policy.",
  },
  {
    term: "blanchir",
    language: "french",
    english: "blanched — briefly boiled then shocked in ice water",
    category: "technique",
    prepTeam: "Hot Kitchen",
  },
  {
    term: "réduire",
    language: "french",
    english: "reduced — concentrated by simmering",
    category: "technique",
    prepTeam: "Hot Kitchen",
  },
  {
    term: "monter au beurre",
    language: "french",
    english: "finishing with cold butter for gloss",
    category: "technique",
    allergens: ["Dairy"],
    prepTeam: "Hot Kitchen",
  },
  {
    term: "en papillote",
    language: "french",
    english: "cooked in a sealed parchment parcel",
    category: "technique",
    prepTeam: "Hot Kitchen",
  },
  {
    term: "sous vide",
    language: "french",
    english: "vacuum-sealed low-temperature water bath cooking",
    category: "technique",
    prepTeam: "Hot Kitchen",
    haccpNote:
      "Sous vide: log all times/temps. Proteins must reach pasteurisation temp at stated time. Refrigerate immediately after cooling bath — never hold in danger zone.",
  },
  {
    term: "bain-marie",
    language: "french",
    english: "water bath — gentle indirect heat or hot holding",
    category: "technique",
    prepTeam: "Hot Kitchen",
    haccpNote: "Hold bain-marie above 63°C. Check with probe every 30 min.",
  },
  {
    term: "au gratin",
    language: "french",
    english: "topped with breadcrumbs/cheese then browned",
    category: "technique",
    allergens: ["Dairy", "Gluten"],
    prepTeam: "Hot Kitchen",
  },
  {
    term: "en croûte",
    language: "french",
    english: "encased in pastry",
    category: "technique",
    allergens: ["Gluten", "Dairy", "Egg"],
    prepTeam: "Hot Kitchen",
  },
  {
    term: "à la plancha",
    language: "french",
    english: "griddled on a flat steel plate",
    category: "technique",
    prepTeam: "Hot Kitchen",
  },
  {
    term: "nappe",
    language: "french",
    english: "sauced to coat evenly (nappage)",
    category: "technique",
    prepTeam: "Hot Kitchen",
  },
  {
    term: "liaison",
    language: "french",
    english: "thickening agent — cream/egg yolk or starch",
    category: "technique",
    allergens: ["Dairy", "Egg"],
    prepTeam: "Hot Kitchen",
  },

  // ── Knife cuts ─────────────────────────────────────────────────────────────
  {
    term: "brunoise",
    language: "french",
    english: "2mm dice",
    category: "cut",
    prepTeam: "Hot Kitchen",
  },
  {
    term: "julienne",
    language: "french",
    english: "1mm×1mm×6cm matchstick strips",
    category: "cut",
    prepTeam: "Hot Kitchen",
  },
  {
    term: "chiffonade",
    language: "french",
    english: "finely shredded leaves",
    category: "cut",
    prepTeam: "Cold Larder",
  },
  {
    term: "paysanne",
    language: "french",
    english: "1cm flat irregular cuts",
    category: "cut",
    prepTeam: "Hot Kitchen",
  },
  {
    term: "batonnet",
    language: "french",
    english: "6mm×6mm×6cm sticks",
    category: "cut",
    prepTeam: "Hot Kitchen",
  },
  {
    term: "tourné",
    language: "french",
    english: "seven-sided barrel-cut vegetable",
    category: "cut",
    prepTeam: "Hot Kitchen",
  },
  {
    term: "ciseler",
    language: "french",
    english: "fine-diced shallot or onion",
    category: "cut",
    prepTeam: "Hot Kitchen",
  },

  // ── Sauces & bases ─────────────────────────────────────────────────────────
  {
    term: "beurre blanc",
    language: "french",
    english: "white butter sauce — shallot, white wine, butter",
    category: "sauce",
    allergens: ["Dairy"],
    prepTeam: "Hot Kitchen",
  },
  {
    term: "hollandaise",
    language: "french",
    english: "emulsified butter & egg yolk sauce",
    category: "sauce",
    allergens: ["Dairy", "Egg"],
    prepTeam: "Hot Kitchen",
    haccpNote:
      "Hollandaise: emulsify at 62-65°C; hold above 60°C, do NOT hold >2h; never cool and reheat.",
  },
  {
    term: "béarnaise",
    language: "french",
    english: "hollandaise with tarragon reduction",
    category: "sauce",
    allergens: ["Dairy", "Egg"],
    prepTeam: "Hot Kitchen",
    haccpNote:
      "See hollandaise rules — tarragon reduction must cool before incorporation.",
  },
  {
    term: "velouté",
    language: "french",
    english: "white stock-based sauce thickened with roux",
    category: "sauce",
    allergens: ["Dairy", "Gluten"],
    prepTeam: "Hot Kitchen",
  },
  {
    term: "espagnole",
    language: "french",
    english: "dark brown roux-based sauce",
    category: "sauce",
    allergens: ["Gluten"],
    prepTeam: "Hot Kitchen",
  },
  {
    term: "béchamel",
    language: "french",
    english: "white sauce — butter, flour, milk",
    category: "sauce",
    allergens: ["Dairy", "Gluten"],
    prepTeam: "Hot Kitchen",
  },
  {
    term: "jus lié",
    language: "french",
    english: "thickened roasting jus",
    category: "sauce",
    prepTeam: "Hot Kitchen",
  },
  {
    term: "demi-glace",
    language: "french",
    english: "rich reduced brown stock sauce",
    category: "sauce",
    prepTeam: "Hot Kitchen",
  },
  {
    term: "beurre noisette",
    language: "french",
    english: "browned butter — nutty aroma",
    category: "sauce",
    allergens: ["Dairy"],
    prepTeam: "Hot Kitchen",
  },
  {
    term: "gastrique",
    language: "french",
    english: "caramelised sugar/vinegar reduction",
    category: "sauce",
    prepTeam: "Hot Kitchen",
  },
  {
    term: "coulis",
    language: "french",
    english: "smooth purée sauce — fruit or vegetable",
    category: "sauce",
    prepTeam: "Cold Larder",
  },
  {
    term: "vinaigrette",
    language: "french",
    english: "oil and acid dressing",
    category: "sauce",
    prepTeam: "Cold Larder",
  },
  {
    term: "aïoli",
    language: "french",
    english: "garlic mayonnaise",
    category: "sauce",
    allergens: ["Egg"],
    prepTeam: "Cold Larder",
  },
  {
    term: "remoulade",
    language: "french",
    english: "cold mayo-based sauce with capers/cornichons",
    category: "sauce",
    allergens: ["Egg"],
    prepTeam: "Cold Larder",
  },

  // ── Preparations & concepts ────────────────────────────────────────────────
  {
    term: "mirepoix",
    language: "french",
    english: "diced onion, carrot, celery — aromatic base",
    category: "concept",
    prepTeam: "Hot Kitchen",
  },
  {
    term: "bouquet garni",
    language: "french",
    english: "tied herb bundle for stocks/braises",
    category: "concept",
    prepTeam: "Hot Kitchen",
  },
  {
    term: "duxelles",
    language: "french",
    english: "finely chopped sautéed mushroom paste",
    category: "concept",
    allergens: ["Dairy"],
    prepTeam: "Hot Kitchen",
  },
  {
    term: "farce",
    language: "french",
    english: "forcemeat stuffing",
    category: "concept",
    prepTeam: "Hot Kitchen",
  },
  {
    term: "fumet",
    language: "french",
    english: "concentrated fish or mushroom stock",
    category: "concept",
    prepTeam: "Hot Kitchen",
  },
  {
    term: "fond",
    language: "french",
    english: "stock (fond brun = brown stock, fond blanc = white)",
    category: "concept",
    prepTeam: "Hot Kitchen",
  },

  // ── Classic dishes (commonly seen on ANZ menus) ────────────────────────────
  {
    term: "panna cotta",
    language: "french",
    english: "set cream dessert",
    category: "ingredient",
    allergens: ["Dairy"],
    prepTeam: "Pastry",
    haccpNote: "Set at ≤4°C; do not hold >4h at room temp.",
  },
  {
    term: "crème brûlée",
    language: "french",
    english: "baked cream custard with caramelised sugar crust",
    category: "ingredient",
    allergens: ["Dairy", "Egg"],
    prepTeam: "Pastry",
    haccpNote:
      "Bake to 75°C+ at centre; chill to ≤4°C before service. Brûlée top-side up at last moment.",
  },
  {
    term: "soufflé",
    language: "french",
    english: "baked egg-white risen dish",
    category: "ingredient",
    allergens: ["Egg", "Dairy", "Gluten"],
    prepTeam: "Pastry",
    haccpNote: "Fire to order only — 12-14 min. Core must reach 70°C.",
  },
  {
    term: "profiterole",
    language: "french",
    english: "choux pastry filled with cream",
    category: "ingredient",
    allergens: ["Gluten", "Dairy", "Egg"],
    prepTeam: "Pastry",
  },
  {
    term: "mille-feuille",
    language: "french",
    english: "layered puff pastry with cream",
    category: "ingredient",
    allergens: ["Gluten", "Dairy", "Egg"],
    prepTeam: "Pastry",
  },
  {
    term: "tarte tatin",
    language: "french",
    english: "upside-down caramelised apple tart",
    category: "ingredient",
    allergens: ["Gluten", "Dairy", "Egg"],
    prepTeam: "Pastry",
  },
  {
    term: "croquembouche",
    language: "french",
    english: "choux puff tower with spun toffee",
    category: "ingredient",
    allergens: ["Gluten", "Dairy", "Egg"],
    prepTeam: "Pastry",
    haccpNote:
      "Cream filling must be below 5°C until service. Assemble max 1h before service. Carry with two people — no trolley at height.",
  },
  {
    term: "carpaccio",
    language: "french",
    english: "thin-sliced raw protein (beef, fish, vegetable)",
    category: "ingredient",
    prepTeam: "Cold Larder",
    haccpNote:
      "Raw protein: source from approved supplier, slice same-day, keep at ≤2°C. Serve within 2h. Labelled allergen risk.",
  },
  {
    term: "tartare",
    language: "french",
    english: "raw chopped protein seasoned and served cold",
    category: "ingredient",
    prepTeam: "Cold Larder",
    haccpNote:
      "Steak tartare: use whole muscle beef, hand-cut same-day, hold at ≤2°C. Never for immune-compromised guests, pregnant women, or children. Always declare on menu.",
  },
  {
    term: "terrine",
    language: "french",
    english: "moulded forcemeat or layered preparation",
    category: "ingredient",
    prepTeam: "Cold Larder",
    haccpNote: "Cook to 70°C+ core; press and chill. Slice to order from ≤4°C.",
  },
  {
    term: "galantine",
    language: "french",
    english: "boned, stuffed, and poached poultry roll",
    category: "ingredient",
    prepTeam: "Cold Larder",
    haccpNote: "Poultry: cook to 74°C+ core; cool rapidly and hold ≤4°C.",
  },
  {
    term: "bisque",
    language: "french",
    english: "creamy shellfish soup",
    category: "ingredient",
    allergens: ["Shellfish", "Dairy"],
    prepTeam: "Hot Kitchen",
    haccpNote:
      "Shellfish bisque: hold above 63°C or cool to ≤5°C within 2h. Never reuse leftover bisque next day.",
  },
  {
    term: "consommé",
    language: "french",
    english: "clarified crystal-clear broth",
    category: "ingredient",
    prepTeam: "Hot Kitchen",
    haccpNote:
      "Serve at 70°C+. Clarification raft contains raw protein — discard safely.",
  },
  {
    term: "velouté soup",
    language: "french",
    english: "cream-finished smooth vegetable soup",
    category: "ingredient",
    allergens: ["Dairy"],
    prepTeam: "Hot Kitchen",
  },
  {
    term: "bouillabaisse",
    language: "french",
    english: "Provençal fish stew",
    category: "ingredient",
    allergens: ["Fish", "Shellfish"],
    prepTeam: "Hot Kitchen",
    haccpNote: "Seafood: use same-day, cook to 63°C+ core.",
  },
  {
    term: "ratatouille",
    language: "french",
    english: "Provençal vegetable stew",
    category: "ingredient",
    prepTeam: "Hot Kitchen",
  },
  {
    term: "duck à l'orange",
    language: "french",
    english: "roast duck with orange gastrique",
    category: "ingredient",
    prepTeam: "Hot Kitchen",
    haccpNote:
      "Duck: roast to 74°C core (whole bird) or 63°C+3min rest (breast only).",
  },
  {
    term: "coq au vin",
    language: "french",
    english: "chicken braised in red wine",
    category: "ingredient",
    allergens: ["Sulphites"],
    prepTeam: "Hot Kitchen",
    haccpNote:
      "Poultry must reach 74°C at thickest point. Wine reduces allergen risk but declare sulphites.",
  },
  {
    term: "boeuf bourguignon",
    language: "french",
    english: "beef braised in Burgundy wine with lardons",
    category: "ingredient",
    allergens: ["Sulphites"],
    prepTeam: "Hot Kitchen",
    haccpNote:
      "Braise to 90°C+; hold at 63°C+ or cool to ≤5°C within 2h. Reheat once to 74°C+.",
  },
  {
    term: "blanquette",
    language: "french",
    english: "white veal or chicken stew with cream sauce",
    category: "ingredient",
    allergens: ["Dairy", "Gluten", "Egg"],
    prepTeam: "Hot Kitchen",
  },
  {
    term: "quenelle",
    language: "french",
    english: "delicate poached dumpling of fish or meat mousse",
    category: "ingredient",
    allergens: ["Egg", "Dairy", "Gluten"],
    prepTeam: "Hot Kitchen",
    haccpNote:
      "Poach to 70°C+ core. Fish mousse: allergen declare — fish, egg, dairy.",
  },
];

// ─── Māori food vocabulary ─────────────────────────────────────────────────
// Te Reo Māori terms for food, ingredients, and cooking methods commonly
// encountered in New Zealand hospitality, marae catering, and contemporary
// Māori cuisine (Kai Māori).

export const MAORI_GLOSSARY: CulinaryTerm[] = [
  {
    term: "kai",
    language: "maori",
    english: "food / to eat",
    category: "concept",
  },
  {
    term: "kaimoana",
    language: "maori",
    english: "seafood",
    category: "ingredient",
    allergens: ["Fish", "Shellfish"],
  },
  {
    term: "hāngī",
    language: "maori",
    english: "earth oven feast — food slow-cooked on heated stones underground",
    category: "technique",
    prepTeam: "Hot Kitchen",
    haccpNote:
      "Hāngī: core temp must reach 74°C+ (poultry) or 63°C+ (other proteins). Monitor with probe at thickest point before lifting.",
  },
  {
    term: "hangi",
    language: "maori",
    english: "earth oven feast (alternate spelling)",
    category: "technique",
    prepTeam: "Hot Kitchen",
    haccpNote: "See hāngī HACCP rules.",
  },
  {
    term: "kūmara",
    language: "maori",
    english: "sweet potato (NZ variety — purple, red, or orange)",
    category: "ingredient",
    prepTeam: "Hot Kitchen",
  },
  {
    term: "kumara",
    language: "maori",
    english: "sweet potato (alternate spelling)",
    category: "ingredient",
    prepTeam: "Hot Kitchen",
  },
  {
    term: "rewena",
    language: "maori",
    english: "Māori potato sourdough bread",
    category: "ingredient",
    allergens: ["Gluten"],
    prepTeam: "Pastry",
  },
  {
    term: "pūhā",
    language: "maori",
    english: "sow thistle (leafy bitter green)",
    category: "ingredient",
    prepTeam: "Cold Larder",
  },
  {
    term: "puha",
    language: "maori",
    english: "sow thistle (alternate spelling)",
    category: "ingredient",
    prepTeam: "Cold Larder",
  },
  {
    term: "mānuka",
    language: "maori",
    english:
      "tea tree — mānuka honey is premium NZ honey; mānuka wood used for smoking",
    category: "ingredient",
  },
  {
    term: "manuka",
    language: "maori",
    english: "tea tree (alternate spelling)",
    category: "ingredient",
  },
  {
    term: "horopito",
    language: "maori",
    english: "NZ bush pepper — pungent pepper-like spice leaf",
    category: "ingredient",
    prepTeam: "Hot Kitchen",
  },
  {
    term: "kawakawa",
    language: "maori",
    english: "NZ pepper leaf — heart-shaped aromatic herb",
    category: "ingredient",
  },
  {
    term: "pikopiko",
    language: "maori",
    english: "native fern fronds (fiddle heads)",
    category: "ingredient",
    prepTeam: "Cold Larder",
  },
  {
    term: "pāua",
    language: "maori",
    english: "New Zealand abalone — iridescent blue-green shellfish",
    category: "ingredient",
    allergens: ["Shellfish"],
    prepTeam: "Cold Larder",
    haccpNote:
      "Pāua: store live at 10-14°C in seawater or moist, not submerged in fresh water. Cook to 63°C+ or serve raw — declare allergen.",
  },
  {
    term: "paua",
    language: "maori",
    english: "NZ abalone (alternate spelling)",
    category: "ingredient",
    allergens: ["Shellfish"],
  },
  {
    term: "kina",
    language: "maori",
    english: "New Zealand sea urchin — briny gonads served raw",
    category: "ingredient",
    allergens: ["Shellfish"],
    prepTeam: "Cold Larder",
    haccpNote:
      "Kina: serve same-day, hold at ≤2°C. Declare shellfish allergen.",
  },
  {
    term: "tūatua",
    language: "maori",
    english: "NZ surf clam",
    category: "ingredient",
    allergens: ["Shellfish"],
    prepTeam: "Hot Kitchen",
    haccpNote:
      "Clams: cook to 63°C — shells must open. Discard any that do not open.",
  },
  {
    term: "tuatua",
    language: "maori",
    english: "NZ surf clam (alternate spelling)",
    category: "ingredient",
    allergens: ["Shellfish"],
  },
  {
    term: "toheroa",
    language: "maori",
    english:
      "rare NZ surf clam (historically used; now protected — verify source)",
    category: "ingredient",
    allergens: ["Shellfish"],
  },
  {
    term: "ika",
    language: "maori",
    english: "fish",
    category: "ingredient",
    allergens: ["Fish"],
  },
  {
    term: "wheke",
    language: "maori",
    english: "octopus",
    category: "ingredient",
    allergens: ["Shellfish"],
    prepTeam: "Hot Kitchen",
  },
  {
    term: "koura",
    language: "maori",
    english: "freshwater crayfish (NZ yabby)",
    category: "ingredient",
    allergens: ["Shellfish"],
  },
  {
    term: "tī kōuka",
    language: "maori",
    english: "cabbage tree shoots / heart",
    category: "ingredient",
    prepTeam: "Hot Kitchen",
  },
  {
    term: "taro",
    language: "maori",
    english: "taro root — starchy tuber (also Pacific Islands staple)",
    category: "ingredient",
    prepTeam: "Hot Kitchen",
    haccpNote:
      "Taro must be cooked thoroughly — raw taro contains calcium oxalate crystals, which are a skin/mouth irritant.",
  },
  {
    term: "watercress",
    language: "maori",
    english: "kōkihi / watercress used in traditional Māori cooking",
    category: "ingredient",
    prepTeam: "Cold Larder",
  },
  {
    term: "hue",
    language: "maori",
    english: "gourd / calabash — used in traditional cooking",
    category: "ingredient",
  },
  {
    term: "marae",
    language: "maori",
    english: "communal gathering place — large-scale catering context",
    category: "concept",
  },
];

// ─── Australian & New Zealand hospitality English ──────────────────────────
// Common informal and regional terms used by kitchen staff, booking staff,
// and clients across Australian and New Zealand hospitality operations.

export const AUNZ_GLOSSARY: CulinaryTerm[] = [
  // Ingredients / produce
  {
    term: "capsicum",
    language: "aunz",
    english: "bell pepper",
    category: "ingredient",
  },
  {
    term: "rockmelon",
    language: "aunz",
    english: "cantaloupe / muskmelon",
    category: "ingredient",
  },
  {
    term: "beetroot",
    language: "aunz",
    english: "beet",
    category: "ingredient",
  },
  {
    term: "silverbeet",
    language: "aunz",
    english: "Swiss chard",
    category: "ingredient",
  },
  {
    term: "choko",
    language: "aunz",
    english: "chayote squash",
    category: "ingredient",
  },
  {
    term: "swede",
    language: "aunz",
    english: "rutabaga / turnip",
    category: "ingredient",
  },
  {
    term: "cos",
    language: "aunz",
    english: "romaine lettuce",
    category: "ingredient",
  },
  {
    term: "spring onion",
    language: "aunz",
    english: "scallion / green onion",
    category: "ingredient",
  },
  {
    term: "chook",
    language: "aunz",
    english: "chicken",
    category: "ingredient",
    haccpNote: "Poultry (chook): cook to 74°C+ core temperature.",
  },
  {
    term: "snag",
    language: "aunz",
    english: "sausage",
    category: "ingredient",
    haccpNote:
      "Sausages: cook to 71°C+ — raw sausages are minced meat and must reach safe temp throughout.",
  },
  {
    term: "barramundi",
    language: "aunz",
    english: "Australian sea bass — premium native fish",
    category: "ingredient",
    allergens: ["Fish"],
    haccpNote:
      "Cook to 63°C+ core; or serve as sashimi/raw — use sushi-grade, previously frozen stock.",
  },
  {
    term: "bugs",
    language: "aunz",
    english: "Balmain bugs / Moreton Bay bugs — flat lobster",
    category: "ingredient",
    allergens: ["Shellfish"],
    haccpNote: "Cook to 63°C+. Serve same-day once cooked.",
  },
  {
    term: "balmain bugs",
    language: "aunz",
    english: "flat-headed lobster / shovel-nosed lobster",
    category: "ingredient",
    allergens: ["Shellfish"],
  },
  {
    term: "moreton bay bugs",
    language: "aunz",
    english: "deep-sea shovel-nosed lobster",
    category: "ingredient",
    allergens: ["Shellfish"],
  },
  {
    term: "yabbies",
    language: "aunz",
    english: "freshwater crayfish (small lobster)",
    category: "ingredient",
    allergens: ["Shellfish"],
  },
  {
    term: "marron",
    language: "aunz",
    english: "WA freshwater crayfish — large and prized",
    category: "ingredient",
    allergens: ["Shellfish"],
  },
  {
    term: "mud crab",
    language: "aunz",
    english: "Queensland mud crab — large robust crab",
    category: "ingredient",
    allergens: ["Shellfish"],
  },
  {
    term: "pipis",
    language: "aunz",
    english: "small clams / surf clams (NZ & Aus)",
    category: "ingredient",
    allergens: ["Shellfish"],
  },
  {
    term: "witlof",
    language: "aunz",
    english: "Belgian endive / chicory",
    category: "ingredient",
  },
  {
    term: "pawpaw",
    language: "aunz",
    english: "papaya",
    category: "ingredient",
  },
  {
    term: "passionfruit",
    language: "aunz",
    english: "passion fruit — common in ANZ desserts",
    category: "ingredient",
    prepTeam: "Pastry",
  },
  {
    term: "feijoa",
    language: "aunz",
    english: "feijoa — tropical green fruit (common NZ)",
    category: "ingredient",
  },
  {
    term: "tamarillo",
    language: "aunz",
    english: "tree tomato — tart red/yellow fruit",
    category: "ingredient",
  },
  {
    term: "lemon myrtle",
    language: "aunz",
    english: "native Australian aromatic leaf",
    category: "ingredient",
  },
  {
    term: "quandong",
    language: "aunz",
    english: "native Australian desert peach",
    category: "ingredient",
  },
  {
    term: "wattleseed",
    language: "aunz",
    english: "roasted ground acacia seed — nutty/coffee flavour",
    category: "ingredient",
  },
  {
    term: "finger lime",
    language: "aunz",
    english: "native Australian citrus pearls",
    category: "ingredient",
  },
  {
    term: "muntries",
    language: "aunz",
    english: "native Australian cranberry / kutjera",
    category: "ingredient",
  },
  {
    term: "davidson plum",
    language: "aunz",
    english: "native Australian sour plum",
    category: "ingredient",
  },
  {
    term: "riberry",
    language: "aunz",
    english: "native Australian lilly pilly berry",
    category: "ingredient",
  },
  {
    term: "bush tomato",
    language: "aunz",
    english: "native Australian dried tomato — intense flavour",
    category: "ingredient",
  },
  {
    term: "kakadu plum",
    language: "aunz",
    english: "highest known vitamin C content fruit — native Australian",
    category: "ingredient",
  },
  {
    term: "sea parsley",
    language: "aunz",
    english: "sea celery / native Australian coastal herb",
    category: "ingredient",
  },

  // Service & hospitality terms
  {
    term: "brekky",
    language: "aunz",
    english: "breakfast",
    category: "concept",
  },
  {
    term: "brekkie",
    language: "aunz",
    english: "breakfast",
    category: "concept",
  },
  {
    term: "arvo tea",
    language: "aunz",
    english: "afternoon tea",
    category: "course",
  },
  {
    term: "smoko",
    language: "aunz",
    english: "kitchen break / staff break",
    category: "concept",
  },
  {
    term: "smorgasbord",
    language: "aunz",
    english: "buffet / self-service spread (very common NZ)",
    category: "concept",
  },
  {
    term: "cutlery run",
    language: "aunz",
    english: "pre-service cutlery polishing and setup",
    category: "concept",
  },
  {
    term: "bump in",
    language: "aunz",
    english: "venue setup / load-in before event",
    category: "concept",
  },
  {
    term: "bump out",
    language: "aunz",
    english: "venue packdown / load-out after event",
    category: "concept",
  },
  {
    term: "on the fly",
    language: "aunz",
    english: "rushed/immediate — re-fire a dish urgently",
    category: "concept",
  },
  {
    term: "81",
    language: "aunz",
    english: "kitchen term: customer/guest in the building (AU shorthand)",
    category: "concept",
  },
  {
    term: "fire",
    language: "aunz",
    english: "begin cooking a dish now (fire the entrées!)",
    category: "concept",
  },
  {
    term: "away",
    language: "aunz",
    english: "dishes ready to go to table (entrées away!)",
    category: "concept",
  },
  {
    term: "running",
    language: "aunz",
    english: "service runner — carries food from kitchen to table",
    category: "concept",
  },
  {
    term: "expo",
    language: "aunz",
    english: "expediter — quality-checks dishes before they leave kitchen",
    category: "concept",
  },
  {
    term: "mise",
    language: "aunz",
    english: "short for mise en place — prep work",
    category: "concept",
  },
  {
    term: "beo",
    language: "aunz",
    english: "Banquet Event Order — the function brief document",
    category: "concept",
  },
  {
    term: "eo",
    language: "aunz",
    english: "Event Order (alternate abbreviation)",
    category: "concept",
  },
  {
    term: "f&b",
    language: "aunz",
    english: "Food & Beverage — the catering department",
    category: "concept",
  },
  {
    term: "pax",
    language: "aunz",
    english: "number of guests / covers",
    category: "concept",
  },
  {
    term: "covers",
    language: "aunz",
    english: "number of guests / servings required",
    category: "concept",
  },
  {
    term: "re-fire",
    language: "aunz",
    english: "cook a replacement dish for a returned plate",
    category: "concept",
  },
  {
    term: "killed it",
    language: "aunz",
    english: "overcooked a dish beyond recovery",
    category: "concept",
  },
  {
    term: "86",
    language: "aunz",
    english: "item is sold out / not available",
    category: "concept",
  },
  {
    term: "in the weeds",
    language: "aunz",
    english: "overwhelmed / behind during service",
    category: "concept",
  },
];

// ─── Allergen inference database ───────────────────────────────────────────
// Maps dish/ingredient keywords to likely allergens.
// Used to automatically flag dishes that likely contain allergens,
// even when the dietary section is not explicitly listed in the BEO.

export interface AllergenRule {
  keywords: string[];
  allergen: string;
  severity: AllergenSeverity;
  note: string;
}

export const ALLERGEN_RULES: AllergenRule[] = [
  // ── Gluten (wheat, rye, barley, oats) ──────────────────────────────────────
  {
    keywords: [
      "wellington",
      "en croûte",
      "beef wellington",
      "salmon wellington",
    ],
    allergen: "Gluten",
    severity: "definite",
    note: "Pastry casing contains gluten — offer GF deconstructed alternative",
  },
  {
    keywords: ["tempura", "beer batter", "battered"],
    allergen: "Gluten",
    severity: "definite",
    note: "Tempura/batter contains wheat flour",
  },
  {
    keywords: [
      "pasta",
      "gnocchi",
      "ravioli",
      "tortellini",
      "tagliatelle",
      "fettuccine",
      "linguine",
      "pappardelle",
      "rigatoni",
      "spaghetti",
      "lasagne",
      "lasagna",
      "penne",
    ],
    allergen: "Gluten",
    severity: "definite",
    note: "Pasta contains wheat unless specified GF",
  },
  {
    keywords: [
      "crouton",
      "croutons",
      "bread",
      "brioche",
      "baguette",
      "sourdough",
      "flatbread",
      "naan",
      "roti",
      "focaccia",
      "crostini",
      "grissini",
    ],
    allergen: "Gluten",
    severity: "definite",
    note: "Bread products contain gluten",
  },
  {
    keywords: [
      "pie",
      "tart",
      "quiche",
      "strudel",
      "danish",
      "croissant",
      "éclair",
      "profiterole",
      "choux",
      "puff pastry",
      "shortcrust",
      "filo",
      "phyllo",
    ],
    allergen: "Gluten",
    severity: "definite",
    note: "Pastry contains gluten",
  },
  {
    keywords: ["mille-feuille", "croquembouche", "vol-au-vent"],
    allergen: "Gluten",
    severity: "definite",
    note: "Puff/choux pastry contains gluten",
  },
  {
    keywords: ["risotto"],
    allergen: "Gluten",
    severity: "possible",
    note: "Risotto is typically GF but verify parmesan rind stock and no flour-based thickener",
  },
  {
    keywords: [
      "soy sauce",
      "teriyaki",
      "hoisin",
      "oyster sauce",
      "black bean sauce",
    ],
    allergen: "Gluten",
    severity: "likely",
    note: "Standard soy sauce contains wheat — use tamari for GF",
  },
  {
    keywords: [
      "roux",
      "béchamel",
      "velouté",
      "espagnole",
      "au gratin",
      "gratin",
    ],
    allergen: "Gluten",
    severity: "definite",
    note: "Flour-based sauce/technique",
  },
  {
    keywords: ["breaded", "schnitzel", "crumbed", "panko", "breadcrumb"],
    allergen: "Gluten",
    severity: "definite",
    note: "Breadcrumb coating contains gluten",
  },
  {
    keywords: ["dumpling", "wonton", "gyoza", "pierogi", "gnocchi"],
    allergen: "Gluten",
    severity: "definite",
    note: "Dough wrappers contain wheat",
  },
  {
    keywords: ["beer", "ale", "lager", "stout", "wheat beer"],
    allergen: "Gluten",
    severity: "definite",
    note: "Beer contains gluten (barley/wheat)",
  },
  {
    keywords: [
      "cake",
      "muffin",
      "scone",
      "biscuit",
      "cookie",
      "brownie",
      "loaf",
      "trifle",
    ],
    allergen: "Gluten",
    severity: "definite",
    note: "Baked goods contain wheat flour",
  },
  {
    keywords: [
      "barley",
      "rye",
      "spelt",
      "kamut",
      "semolina",
      "couscous",
      "bulgur",
      "farro",
    ],
    allergen: "Gluten",
    severity: "definite",
    note: "Gluten-containing grain",
  },
  {
    keywords: ["miso", "shoyu"],
    allergen: "Gluten",
    severity: "likely",
    note: "Traditional miso and shoyu contain barley/wheat",
  },
  {
    keywords: ["seitan", "wheat protein", "vital wheat gluten"],
    allergen: "Gluten",
    severity: "definite",
    note: "Pure gluten — severe allergy risk",
  },

  // ── Dairy ──────────────────────────────────────────────────────────────────
  {
    keywords: [
      "cream",
      "double cream",
      "single cream",
      "heavy cream",
      "whipped cream",
      "crème fraîche",
      "sour cream",
    ],
    allergen: "Dairy",
    severity: "definite",
    note: "Contains dairy (lactose/casein)",
  },
  {
    keywords: ["butter", "beurre", "ghee", "clarified butter"],
    allergen: "Dairy",
    severity: "definite",
    note: "Butter contains dairy — use DF sub for dairy-free guests",
  },
  {
    keywords: [
      "cheese",
      "parmesan",
      "cheddar",
      "brie",
      "camembert",
      "gruyère",
      "gruyere",
      "emmental",
      "ricotta",
      "mozzarella",
      "pecorino",
      "grana padano",
      "stilton",
      "blue cheese",
      "fromage",
      "feta",
    ],
    allergen: "Dairy",
    severity: "definite",
    note: "All cheese contains dairy",
  },
  {
    keywords: [
      "milk",
      "full cream milk",
      "whole milk",
      "skim milk",
      "buttermilk",
      "condensed milk",
    ],
    allergen: "Dairy",
    severity: "definite",
    note: "Milk and milk products",
  },
  {
    keywords: ["yoghurt", "yogurt", "labneh", "kefir"],
    allergen: "Dairy",
    severity: "definite",
    note: "Fermented dairy",
  },
  {
    keywords: ["ice cream", "gelato", "sorbet with cream"],
    allergen: "Dairy",
    severity: "likely",
    note: "Ice cream contains dairy; sorbet usually DF — verify",
  },
  {
    keywords: [
      "panna cotta",
      "crème brûlée",
      "custard",
      "crème caramel",
      "pot de crème",
    ],
    allergen: "Dairy",
    severity: "definite",
    note: "Set cream/custard desserts",
  },
  {
    keywords: [
      "hollandaise",
      "béarnaise",
      "beurre blanc",
      "beurre noisette",
      "beurre noir",
    ],
    allergen: "Dairy",
    severity: "definite",
    note: "Butter-based sauce",
  },
  {
    keywords: ["béchamel", "mornay", "alfredo"],
    allergen: "Dairy",
    severity: "definite",
    note: "Milk/cream sauce",
  },
  {
    keywords: ["tiramisu", "cheesecake", "mousse"],
    allergen: "Dairy",
    severity: "definite",
    note: "Cream/mascarpone-based dessert",
  },
  {
    keywords: ["risotto"],
    allergen: "Dairy",
    severity: "likely",
    note: "Risotto finished with butter and parmesan — declare",
  },
  {
    keywords: ["gratin", "au gratin", "dauphinoise"],
    allergen: "Dairy",
    severity: "definite",
    note: "Cream and cheese topping",
  },

  // ── Eggs ───────────────────────────────────────────────────────────────────
  {
    keywords: [
      "mayonnaise",
      "mayo",
      "aioli",
      "aïoli",
      "remoulade",
      "tartare sauce",
    ],
    allergen: "Egg",
    severity: "definite",
    note: "Egg-based emulsified sauce",
  },
  {
    keywords: ["hollandaise", "béarnaise", "mouselline"],
    allergen: "Egg",
    severity: "definite",
    note: "Egg yolk emulsion sauce",
  },
  {
    keywords: [
      "crème brûlée",
      "custard",
      "crème caramel",
      "pot de crème",
      "flan",
    ],
    allergen: "Egg",
    severity: "definite",
    note: "Egg-set custard",
  },
  {
    keywords: ["soufflé", "meringue", "pavlova", "macaroon", "macaron"],
    allergen: "Egg",
    severity: "definite",
    note: "Egg white aerating technique",
  },
  {
    keywords: ["quiche", "frittata", "omelette", "omelet", "scotch egg"],
    allergen: "Egg",
    severity: "definite",
    note: "Egg is the primary ingredient",
  },
  {
    keywords: [
      "pasta",
      "egg pasta",
      "tagliatelle",
      "pappardelle",
      "ravioli",
      "tortellini",
    ],
    allergen: "Egg",
    severity: "likely",
    note: "Fresh pasta typically contains egg; verify if dried pasta is used",
  },
  {
    keywords: ["brioche", "choux", "profiterole", "éclair", "croquembouche"],
    allergen: "Egg",
    severity: "definite",
    note: "Brioche and choux pastry contain egg",
  },
  {
    keywords: ["cake", "muffin", "pancake", "waffle", "crêpe"],
    allergen: "Egg",
    severity: "likely",
    note: "Baked goods typically contain egg",
  },
  {
    keywords: ["tempura batter", "beer batter"],
    allergen: "Egg",
    severity: "likely",
    note: "Tempura batter may contain egg",
  },
  {
    keywords: ["caesar", "caesar salad"],
    allergen: "Egg",
    severity: "definite",
    note: "Caesar dressing contains raw egg and anchovies",
  },
  {
    keywords: ["carbonara"],
    allergen: "Egg",
    severity: "definite",
    note: "Carbonara sauce is egg and cheese based",
  },

  // ── Fish ───────────────────────────────────────────────────────────────────
  {
    keywords: ["anchovy", "anchovies", "boquerones"],
    allergen: "Fish",
    severity: "definite",
    note: "Anchovies are a major fish allergen source — hidden in Caesar, Nicoise, Worcestershire",
  },
  {
    keywords: ["worcestershire sauce", "worcester sauce"],
    allergen: "Fish",
    severity: "likely",
    note: "Traditional Worcestershire contains anchovies",
  },
  {
    keywords: ["caesar dressing", "caesar salad"],
    allergen: "Fish",
    severity: "definite",
    note: "Caesar dressing contains anchovies and egg",
  },
  {
    keywords: [
      "fish",
      "salmon",
      "tuna",
      "snapper",
      "barramundi",
      "ika",
      "tarakihi",
      "hapuka",
      "kingfish",
      "john dory",
      "swordfish",
      "cod",
      "sole",
      "halibut",
      "trout",
      "sardine",
      "mackerel",
      "whitebait",
      "flounder",
    ],
    allergen: "Fish",
    severity: "definite",
    note: "Fin fish allergen",
  },
  {
    keywords: [
      "bouillabaisse",
      "fumet",
      "fish stock",
      "fish sauce",
      "nam pla",
      "nuoc mam",
    ],
    allergen: "Fish",
    severity: "definite",
    note: "Fish-derived liquid condiment",
  },
  {
    keywords: [
      "gravlax",
      "smoked salmon",
      "cold smoked",
      "hot smoked fish",
      "smoked trout",
    ],
    allergen: "Fish",
    severity: "definite",
    note: "Cured/smoked fish products",
  },
  {
    keywords: ["sushi", "sashimi", "nigiri", "temaki"],
    allergen: "Fish",
    severity: "definite",
    note: "Raw fish — also raw shellfish risk. Use sushi-grade, previously frozen.",
  },

  // ── Shellfish / Crustaceans / Molluscs ─────────────────────────────────────
  {
    keywords: [
      "prawn",
      "shrimp",
      "prawn cocktail",
      "tiger prawn",
      "king prawn",
      "banana prawn",
    ],
    allergen: "Shellfish",
    severity: "definite",
    note: "Crustacean shellfish — major allergen",
  },
  {
    keywords: [
      "lobster",
      "crayfish",
      "cray",
      "bugs",
      "balmain bugs",
      "moreton bay bugs",
      "langoustine",
      "languste",
    ],
    allergen: "Shellfish",
    severity: "definite",
    note: "Crustacean shellfish",
  },
  {
    keywords: [
      "crab",
      "blue swimmer crab",
      "mud crab",
      "spanner crab",
      "crab cakes",
      "crab bisque",
    ],
    allergen: "Shellfish",
    severity: "definite",
    note: "Crustacean shellfish",
  },
  {
    keywords: ["scallop", "scallops", "coquille st-jacques"],
    allergen: "Shellfish",
    severity: "definite",
    note: "Mollusc shellfish — check if roe is included",
  },
  {
    keywords: ["oyster", "oysters", "oyster blade"],
    allergen: "Shellfish",
    severity: "definite",
    note: "Mollusc shellfish — oyster blade steak does NOT contain shellfish",
  },
  {
    keywords: ["mussel", "mussels", "green lipped mussel", "moules"],
    allergen: "Shellfish",
    severity: "definite",
    note: "Mollusc shellfish",
  },
  {
    keywords: [
      "clam",
      "clams",
      "pipis",
      "vongole",
      "littleneck",
      "tuatua",
      "tūatua",
    ],
    allergen: "Shellfish",
    severity: "definite",
    note: "Mollusc shellfish",
  },
  {
    keywords: ["squid", "calamari", "octopus", "wheke", "cuttlefish"],
    allergen: "Shellfish",
    severity: "definite",
    note: "Cephalopod mollusc — shellfish allergen category",
  },
  {
    keywords: ["pāua", "paua", "abalone", "kina", "sea urchin", "uni"],
    allergen: "Shellfish",
    severity: "definite",
    note: "NZ shellfish — declare allergen",
  },
  {
    keywords: ["bisque", "shellfish bisque", "lobster bisque", "prawn bisque"],
    allergen: "Shellfish",
    severity: "definite",
    note: "Shellfish-based soup",
  },
  {
    keywords: ["laksa", "pad thai", "tom yum", "tom kha"],
    allergen: "Shellfish",
    severity: "likely",
    note: "South-East Asian soups often contain shrimp paste or prawns",
  },
  {
    keywords: ["shrimp paste", "belacan", "bagoong", "kapi"],
    allergen: "Shellfish",
    severity: "definite",
    note: "Fermented shrimp condiment — hidden allergen",
  },

  // ── Tree nuts & Peanuts ────────────────────────────────────────────────────
  {
    keywords: ["pesto", "basil pesto", "rocket pesto"],
    allergen: "Tree Nuts",
    severity: "definite",
    note: "Traditional pesto contains pine nuts",
  },
  {
    keywords: ["satay", "satay sauce", "peanut sauce", "gado gado"],
    allergen: "Peanuts",
    severity: "definite",
    note: "Peanut-based sauce — SEVERE allergy risk",
  },
  {
    keywords: ["pad thai", "nasi goreng", "mee goreng"],
    allergen: "Peanuts",
    severity: "likely",
    note: "Common Asian dishes often contain peanuts or peanut oil",
  },
  {
    keywords: ["praline", "brittle", "nougatine", "croquant"],
    allergen: "Tree Nuts",
    severity: "definite",
    note: "Caramelised nut confection",
  },
  {
    keywords: ["baklava", "turkish delight", "pistachio cake"],
    allergen: "Tree Nuts",
    severity: "definite",
    note: "Middle Eastern nut-based pastry",
  },
  {
    keywords: ["waldorf", "waldorf salad"],
    allergen: "Tree Nuts",
    severity: "definite",
    note: "Waldorf salad contains walnuts",
  },
  {
    keywords: ["mole", "romesco"],
    allergen: "Tree Nuts",
    severity: "likely",
    note: "Romesco/mole sauces typically contain almonds or other tree nuts",
  },
  {
    keywords: ["dukkah"],
    allergen: "Tree Nuts",
    severity: "definite",
    note: "Dukkah contains hazelnuts/almonds — also sesame",
  },
  {
    keywords: [
      "almond",
      "almonds",
      "macadamia",
      "walnut",
      "cashew",
      "pecan",
      "pistachio",
      "hazelnut",
      "pine nut",
      "pine nuts",
      "brazil nut",
      "chestnut",
    ],
    allergen: "Tree Nuts",
    severity: "definite",
    note: "Tree nut — severe allergy possible",
  },
  {
    keywords: ["peanut", "peanuts", "groundnut", "monkey nuts", "arachis oil"],
    allergen: "Peanuts",
    severity: "definite",
    note: "Peanut — anaphylaxis risk. Separate from tree nuts.",
  },
  {
    keywords: ["marzipan", "frangipane", "financier", "amaretti"],
    allergen: "Tree Nuts",
    severity: "definite",
    note: "Almond-based confection",
  },
  {
    keywords: ["wattleseed"],
    allergen: "Tree Nuts",
    severity: "possible",
    note: "Wattleseed is from the acacia family — cross-reactivity with peanut (legume) possible; check with allergist",
  },

  // ── Soy ───────────────────────────────────────────────────────────────────
  {
    keywords: [
      "tofu",
      "silken tofu",
      "firm tofu",
      "edamame",
      "tempeh",
      "miso",
      "natto",
    ],
    allergen: "Soy",
    severity: "definite",
    note: "Soy protein — declare for soy allergy",
  },
  {
    keywords: [
      "soy sauce",
      "tamari",
      "ponzu",
      "teriyaki",
      "hoisin",
      "black bean paste",
    ],
    allergen: "Soy",
    severity: "definite",
    note: "Soy-based sauce",
  },
  {
    keywords: ["soy milk", "soy cream", "soy butter", "soy yoghurt"],
    allergen: "Soy",
    severity: "definite",
    note: "Soy-based dairy alternatives — paradoxically an allergen",
  },

  // ── Sesame ─────────────────────────────────────────────────────────────────
  {
    keywords: ["tahini", "hummus", "baba ghanoush", "baba ganoush"],
    allergen: "Sesame",
    severity: "definite",
    note: "Tahini is sesame paste — sesame is a top allergen",
  },
  {
    keywords: [
      "sesame oil",
      "sesame seeds",
      "sesame seed bun",
      "sesame crusted",
      "furikake",
    ],
    allergen: "Sesame",
    severity: "definite",
    note: "Sesame oil and seeds",
  },
  {
    keywords: ["dukkah"],
    allergen: "Sesame",
    severity: "definite",
    note: "Dukkah contains sesame seeds",
  },
  {
    keywords: ["middle eastern", "falafel", "shawarma", "kebab"],
    allergen: "Sesame",
    severity: "likely",
    note: "Middle Eastern dishes commonly use sesame — verify tahini sauce",
  },
  {
    keywords: ["asian dressing", "goma", "gomae", "gomaae"],
    allergen: "Sesame",
    severity: "definite",
    note: "Japanese sesame dressing",
  },

  // ── Sulphites / Sulphur dioxide (SO₂) ─────────────────────────────────────
  {
    keywords: [
      "wine",
      "red wine",
      "white wine",
      "rosé",
      "champagne",
      "prosecco",
      "cava",
      "sherry",
      "port",
      "madeira",
      "marsala",
      "vermouth",
    ],
    allergen: "Sulphites",
    severity: "definite",
    note: "All wine contains sulphites as preservative — react in sensitive individuals",
  },
  {
    keywords: [
      "dried fruit",
      "dried apricot",
      "sultana",
      "raisin",
      "prune",
      "currant",
      "dried mango",
    ],
    allergen: "Sulphites",
    severity: "likely",
    note: "Commercially dried fruit typically treated with SO₂",
  },
  {
    keywords: ["vinegar", "balsamic", "wine vinegar", "cider vinegar"],
    allergen: "Sulphites",
    severity: "possible",
    note: "Some vinegars contain residual sulphites — check with severe allergy",
  },
  {
    keywords: [
      "sausage",
      "salami",
      "chorizo",
      "pepperoni",
      "prosciutto",
      "bacon",
      "ham",
      "deli meat",
    ],
    allergen: "Sulphites",
    severity: "likely",
    note: "Processed meats often contain sulphite preservatives",
  },

  // ── Lupin ─────────────────────────────────────────────────────────────────
  {
    keywords: ["lupin", "lupini", "lupin flour"],
    allergen: "Lupin",
    severity: "definite",
    note: "Lupin is a legume allergen — cross-reacts with peanut. Found in some gluten-free flours.",
  },

  // ── Celery ─────────────────────────────────────────────────────────────────
  {
    keywords: [
      "celery",
      "celeriac",
      "celery salt",
      "celery seed",
      "celery root",
    ],
    allergen: "Celery",
    severity: "definite",
    note: "Celery and celeriac are regulated allergens (EU/UK standard, aware in ANZ)",
  },

  // ── Mustard ────────────────────────────────────────────────────────────────
  {
    keywords: [
      "mustard",
      "dijon",
      "grain mustard",
      "english mustard",
      "hot mustard",
      "mustard seed",
      "mustard oil",
    ],
    allergen: "Mustard",
    severity: "definite",
    note: "Mustard is a regulated allergen",
  },
];

// ─── HACCP critical control point rules ───────────────────────────────────
// Aligned with FSANZ (Food Standards Australia New Zealand) Code,
// Australian Standard 4674 (Hospitality Food Safety), and
// MPI (Ministry for Primary Industries) NZ guidelines.

export const HACCP_RULES: Array<{
  keywords: string[];
  priority: "critical" | "major" | "minor";
  rule: string;
  minTemp?: number;
  maxHoldTime?: number;
}> = [
  // Critical — immediate safety risk
  {
    keywords: [
      "poultry",
      "chicken",
      "chook",
      "duck",
      "turkey",
      "quail",
      "guinea fowl",
    ],
    priority: "critical",
    rule: "Poultry CCP: Cook to 74°C+ at thickest point. No pink meat. HACCP log required.",
    minTemp: 74,
  },
  {
    keywords: [
      "ground beef",
      "mince",
      "minced beef",
      "hamburger",
      "burger patty",
      "beef patty",
    ],
    priority: "critical",
    rule: "Ground/minced beef: Cook to 71°C+ throughout. Pink centre is not acceptable for ground meat.",
    minTemp: 71,
  },
  {
    keywords: [
      "pork",
      "pork belly",
      "pork loin",
      "rack of pork",
      "ham",
      "bacon",
      "prosciutto crudo",
    ],
    priority: "critical",
    rule: "Pork CCP: Cook to 71°C+ core, or 63°C+3min rest for whole cuts. HACCP temp log required.",
    minTemp: 71,
  },
  {
    keywords: [
      "egg",
      "eggs",
      "poached egg",
      "fried egg",
      "soft boiled",
      "sous vide egg",
      "raw egg",
      "egg yolk",
    ],
    priority: "critical",
    rule: "Eggs (vulnerable guests): Cook to 74°C+ if serving to immune-compromised, elderly, pregnant, or children. Raw-egg sauces (hollandaise, mayo) must be held at 60°C+ or consumed immediately.",
    minTemp: 74,
  },
  {
    keywords: [
      "raw fish",
      "sashimi",
      "sushi",
      "ceviche",
      "carpaccio fish",
      "gravlax",
      "kingfish tartare",
    ],
    priority: "critical",
    rule: "Raw fish: Must be sushi-grade, previously frozen to −20°C for ≥24h (FSANZ standard). Hold at ≤2°C. Service within 2h.",
  },
  {
    keywords: ["steak tartare", "beef tartare", "raw beef", "beef carpaccio"],
    priority: "critical",
    rule: "Raw beef: Must be whole muscle (not ground). Cut same-day. Hold at ≤2°C. Serve within 2h. Declare risk on menu — not suitable for vulnerable guests.",
    maxHoldTime: 120,
  },
  {
    keywords: ["hollandaise", "béarnaise", "mousseline"],
    priority: "critical",
    rule: "Egg butter sauce: Prepare fresh each service. Hold at 60-65°C (not above). Discard after 2h on hold. Never cool and reheat.",
    maxHoldTime: 120,
  },
  {
    keywords: [
      "reheated",
      "reheat",
      "re-heated",
      "brought back",
      "carried over",
    ],
    priority: "critical",
    rule: "Reheated food: Must reach 74°C+ throughout. Reheat only once. Document in HACCP log.",
  },
  {
    keywords: [
      "seafood",
      "shellfish",
      "prawn",
      "lobster",
      "crab",
      "mussel",
      "oyster",
      "scallop",
      "clam",
    ],
    priority: "critical",
    rule: "Shellfish/seafood CCP: Cook to 63°C+ (molluscs: shells must open). Hold at 63°C+ or ≤5°C. Source from licensed supplier. Never use shellfish from unknown source.",
    minTemp: 63,
  },
  {
    keywords: [
      "buffet",
      "smorgasbord",
      "self service",
      "self-service",
      "bain marie",
      "bain-marie",
      "chafing dish",
    ],
    priority: "critical",
    rule: "Buffet HACCP: Hot food ≥63°C, cold food ≤5°C. Probe check every 30 min. Log times. Discard hot food >2h in danger zone. Replenish from kitchen — do NOT top up in-pan.",
    maxHoldTime: 120,
  },
  {
    keywords: ["taro", "raw taro"],
    priority: "critical",
    rule: "Taro must be fully cooked — raw taro contains oxalate crystals. Boil or steam until completely soft (core soft when probed).",
  },

  // Major — significant food safety concern
  {
    keywords: ["sous vide", "low temperature cooking", "ltc"],
    priority: "major",
    rule: "Sous vide: All times/temps must be logged and validated against pasteurisation tables. Use calibrated immersion circulator. Shock-chill immediately in ice bath after cooking.",
  },
  {
    keywords: [
      "beef",
      "lamb",
      "veal",
      "venison",
      "steak",
      "fillet",
      "tenderloin",
    ],
    priority: "major",
    rule: "Whole muscle red meat: 63°C+3min rest for medium-rare. Below 63°C is not food-safe — communicate to Head Chef. Must be HACCP logged.",
    minTemp: 63,
  },
  {
    keywords: ["hāngī", "hangi", "earth oven"],
    priority: "major",
    rule: "Hāngī: Probe all proteins before serving. Poultry 74°C+, pork 71°C+, lamb/beef 63°C+. If not at temp, return to heat source — do not serve undercooked hāngī.",
  },
  {
    keywords: ["cooling", "cool down", "cool blast", "blast chill", "shock"],
    priority: "major",
    rule: "Cooling CCP: Food must pass through 60→21°C within 2h, then 21→5°C within 4h. Blast chiller preferred. Log all times. Never cool at room temperature.",
  },
  {
    keywords: ["confit", "duck confit", "pork confit", "garlic confit"],
    priority: "major",
    rule: "Confit: Cook to 74°C+ (poultry) or 71°C+ (pork). Store fully submerged in fat at ≤4°C. Re-crisp to 74°C+ core before service.",
  },
  {
    keywords: ["fermented", "kimchi", "sauerkraut", "kombucha", "kefir"],
    priority: "major",
    rule: "Fermented foods: Must be from commercial FSANZ-approved supplier or produced under documented HACCP plan. pH must be ≤4.6 for shelf-stable products.",
  },
  {
    keywords: [
      "preserved",
      "pickled",
      "cured",
      "charcuterie",
      "salumi",
      "terrine",
      "pâté",
    ],
    priority: "major",
    rule: "Cured/preserved meats: Verify source has FSANZ approval. Hold at ≤5°C. Service within 4h of slicing.",
  },

  // Minor — best practice reminders
  {
    keywords: [
      "salad",
      "leafy greens",
      "mixed greens",
      "rocket",
      "spinach",
      "mesclun",
    ],
    priority: "minor",
    rule: "Salad greens: Wash in sanitised water. Spin dry. Hold at ≤5°C. Dress immediately before service. Do not pre-dress.",
  },
  {
    keywords: ["fruit", "fresh fruit", "fruit salad", "berries", "strawberry"],
    priority: "minor",
    rule: "Fresh fruit: Wash all produce. Hold at ≤5°C. Prepare within 4h of service.",
  },
  {
    keywords: [
      "allergen",
      "dietary",
      "gluten free",
      "dairy free",
      "nut allergy",
      "vegan",
    ],
    priority: "minor",
    rule: "Allergen separation: Use dedicated colour-coded boards, utensils and trays. Label all dietary alternative dishes before leaving kitchen. Verbal confirmation with runner before service.",
  },
  {
    keywords: ["oil", "cooking oil", "frying oil", "deep fry", "fryer"],
    priority: "minor",
    rule: "Frying oil: Monitor temperature (175-180°C). Check oil quality (colour, smoke point, taste). Change oil when degraded. Log oil changes.",
  },
  {
    keywords: [
      "knife",
      "cutting board",
      "chopping board",
      "cross contamination",
    ],
    priority: "minor",
    rule: "Cross-contamination: Use colour-coded boards — red (raw meat), blue (fish), yellow (poultry), green (veg/fruit), white (dairy/bakery). Sanitise between tasks.",
  },
];

// ─── Cooking method → prep team ────────────────────────────────────────────
// Used to assign prep team based on detected cooking technique in dish description.

export const METHOD_TEAM_MAP: Array<{ keywords: string[]; team: PrepTeam }> = [
  {
    keywords: [
      "ice cream",
      "gelato",
      "sorbet",
      "parfait",
      "semifreddo",
      "granita",
      "frozen dessert",
    ],
    team: "Pastry",
  },
  {
    keywords: [
      "cake",
      "tart",
      "torte",
      "gâteau",
      "gateau",
      "pavlova",
      "meringue",
      "macaron",
      "macaroon",
      "éclair",
      "eclair",
      "profiterole",
      "croquembouche",
      "mille-feuille",
      "soufflé",
      "souffle",
      "crème brûlée",
      "creme brulee",
      "panna cotta",
      "tiramisu",
      "cheesecake",
      "pudding",
      "trifle",
      "mousse dessert",
      "fondant cake",
      "fondant chocolate",
      "financier",
      "brownie",
      "madeleine",
      "doughnut",
      "danish pastry",
      "croissant",
      "brioche bun",
      "lamington",
      "pavlova",
      "baklava",
      "churro",
      "churros",
      "waffle dessert",
      "crêpe dessert",
      "crepe dessert",
      "panettone",
    ],
    team: "Pastry",
  },
  {
    keywords: [
      "bread roll",
      "dinner roll",
      "bread service",
      "sourdough bread",
      "focaccia service",
      "grissini",
    ],
    team: "Function Team",
  },
  {
    keywords: [
      "amuse-bouche",
      "amuse bouche",
      "canape",
      "canapé",
      "finger food",
      "blini",
      "bruschetta",
      "crostini",
      "vol-au-vent",
      "reception bite",
      "cocktail food",
    ],
    team: "Function Team",
  },
  {
    keywords: [
      "salad",
      "mixed greens",
      "garden salad",
      "caesar",
      "nicoise",
      "niçoise",
      "waldorf",
      "coleslaw",
      "cold antipasto",
      "charcuterie board",
      "cheese board",
      "fromage",
    ],
    team: "Cold Larder",
  },
  {
    keywords: [
      "carpaccio",
      "tartare",
      "ceviche",
      "crudo",
      "gravlax",
      "sashimi",
      "oyster",
      "cold terrine",
      "cold mousse",
      "cold smoked",
      "gazpacho",
      "cold soup",
      "prawn cocktail",
      "seafood cocktail",
    ],
    team: "Cold Larder",
  },
  {
    keywords: [
      "sauté",
      "saute",
      "braise",
      "braised",
      "roast",
      "roasted",
      "rôti",
      "grilled",
      "grillé",
      "pan-fried",
      "pan seared",
      "seared",
      "poached",
      "en papillote",
      "baked",
      "slow cooked",
      "confit",
      "sous vide",
      "fried",
      "deep fried",
      "stir fry",
      "stir-fry",
      "char grilled",
      "chargrilled",
      "bbq",
      "barbecued",
      "smoked hot",
      "hot smoked",
      "hāngī",
      "hangi",
    ],
    team: "Hot Kitchen",
  },
];

// ─── Exported utility functions ─────────────────────────────────────────────

/**
 * Normalize AU/NZ/Māori terminology in raw text to standard culinary English.
 * Also handles common OCR artefacts and encoding issues (é → e, etc.).
 */
export function normalizeTerminology(text: string): string {
  let out = text;

  // Fix common OCR encoding issues for accented French characters
  out = out.replace(/creme brulee/gi, "crème brûlée");
  out = out.replace(/entree/gi, "entrée");
  out = out.replace(/canapes?\b/gi, "canapés");
  out = out.replace(/a la carte/gi, "A-la-carte");
  out = out.replace(/saute/gi, "sauté");
  out = out.replace(/mise en place/gi, "mise en place");

  // AU/NZ → standard
  out = out.replace(/\bchook\b/gi, "chicken");
  out = out.replace(/\bsnags?\b/gi, "sausage");
  out = out.replace(/\bcapsicums?\b/gi, "capsicum (bell pepper)");
  out = out.replace(/\brockmelon\b/gi, "rockmelon (cantaloupe)");
  out = out.replace(/\bbugs\b/gi, "bugs (Balmain/Moreton Bay crustacean)");
  out = out.replace(/\bbrekky\b/gi, "breakfast");
  out = out.replace(/\bpax\b/gi, "guests");

  // Māori food terms → annotated English
  out = out.replace(/\bkūmara\b/gi, "kūmara (sweet potato)");
  out = out.replace(/\bkumara\b/gi, "kumara (sweet potato)");
  out = out.replace(/\bhāngī\b/gi, "hāngī (earth oven feast)");
  out = out.replace(/\bhangi\b/gi, "hangi (earth oven feast)");
  out = out.replace(/\bkaimoana\b/gi, "kaimoana (seafood)");
  out = out.replace(/\bpāua\b/gi, "pāua (NZ abalone)");
  out = out.replace(/\bpaua\b/gi, "paua (NZ abalone)");
  out = out.replace(/\bkina\b/gi, "kina (NZ sea urchin)");
  out = out.replace(/\brewena\b/gi, "rewena (Māori potato bread)");
  out = out.replace(/\bpūhā\b/gi, "pūhā (sow thistle green)");
  out = out.replace(/\bpuha\b/gi, "puha (sow thistle green)");
  out = out.replace(/\bhoropito\b/gi, "horopito (NZ bush pepper)");
  out = out.replace(/\bkawakawa\b/gi, "kawakawa (NZ pepper leaf)");
  out = out.replace(/\bpikopiko\b/gi, "pikopiko (native fern fronds)");
  out = out.replace(/\btūatua\b/gi, "tūatua (NZ surf clam)");
  out = out.replace(/\btuatua\b/gi, "tuatua (NZ surf clam)");
  out = out.replace(/\bwheke\b/gi, "wheke (octopus)");
  out = out.replace(/\bkoura\b/gi, "koura (freshwater crayfish)");

  return out;
}

/**
 * Assign a prep team based on dish description.
 * Checks METHOD_TEAM_MAP keywords, then falls back to ingredient-based heuristics.
 */
export function assignPrepTeamAdvanced(dish: string): PrepTeam {
  const lower = dish.toLowerCase();

  for (const { keywords, team } of METHOD_TEAM_MAP) {
    if (keywords.some((k) => lower.includes(k))) return team;
  }

  // Secondary heuristics
  const pastryIngredients = [
    "pastry",
    "tart shell",
    "sponge",
    "dacquoise",
    "choux",
    "madeleine",
    "praline",
    "ganache",
    "couverture",
    "valrhona",
    "callebaut",
  ];
  if (pastryIngredients.some((k) => lower.includes(k))) return "Pastry";

  const coldKeywords = [
    "cold",
    "raw",
    "smoked salmon",
    "oyster",
    "prawn cocktail",
    "terrine",
    "rillette",
    "pâté",
    "pate",
  ];
  if (coldKeywords.some((k) => lower.includes(k))) return "Cold Larder";

  const functionKeywords = [
    "canapé",
    "canape",
    "amuse",
    "blini",
    "bruschetta",
    "crostini",
    "bite",
    "roll",
    "bread",
  ];
  if (functionKeywords.some((k) => lower.includes(k))) return "Function Team";

  return "Hot Kitchen";
}

/**
 * Infer likely allergens from a menu item's description.
 * Returns array of AllergenFlag objects for any matches found.
 */
export function inferAllergens(menu: string[]): AllergenFlag[] {
  const flags: AllergenFlag[] = [];

  for (const item of menu) {
    const lower = item.toLowerCase();
    const dishAllergens: Map<
      string,
      { severity: AllergenSeverity; notes: string[] }
    > = new Map();

    for (const rule of ALLERGEN_RULES) {
      if (rule.keywords.some((kw) => lower.includes(kw))) {
        const existing = dishAllergens.get(rule.allergen);
        if (existing) {
          // Keep highest severity
          if (
            rule.severity === "definite" &&
            existing.severity !== "definite"
          ) {
            existing.severity = "definite";
          }
          existing.notes.push(rule.note);
        } else {
          dishAllergens.set(rule.allergen, {
            severity: rule.severity,
            notes: [rule.note],
          });
        }
      }
    }

    if (dishAllergens.size > 0) {
      flags.push({
        dish: item,
        allergens: Array.from(dishAllergens.keys()),
        severity: Array.from(dishAllergens.values()).some(
          (v) => v.severity === "definite",
        )
          ? "definite"
          : Array.from(dishAllergens.values()).some(
                (v) => v.severity === "likely",
              )
            ? "likely"
            : "possible",
        note: Array.from(dishAllergens.values())
          .flatMap((v) => v.notes)
          .filter((n, i, arr) => arr.indexOf(n) === i)
          .slice(0, 2)
          .join(" | "),
      });
    }
  }

  return flags;
}

/**
 * Generate HACCP critical control point notes for a given menu and function context.
 * Returns array of human-readable HACCP notes, prioritised critical first.
 */
export function generateHACCPNotes(
  menu: string[],
  functionType: string,
  guestCount: number,
): HACCPNote[] {
  const notes: HACCPNote[] = [];
  const seen = new Set<string>();
  const allText = [functionType, ...menu].join(" ").toLowerCase();

  for (const rule of HACCP_RULES) {
    if (rule.keywords.some((kw) => allText.includes(kw))) {
      const key = rule.rule.slice(0, 40);
      if (seen.has(key)) continue;
      seen.add(key);
      notes.push({
        rule: rule.rule,
        priority: rule.priority,
        minTemp: rule.minTemp,
        context: rule.keywords.find((kw) => allText.includes(kw)) ?? "",
      });
    }
  }

  // Universal rules for all functions
  if (!seen.has("Temperature logging")) {
    notes.push({
      rule: `Temperature log required — probe all proteins before service. Record in HACCP sheet: item, time, temp, initials.`,
      priority: "major",
      context: "all functions",
    });
  }

  if (guestCount > 100) {
    notes.push({
      rule: `Large function (${guestCount} covers): Stagger plating in batches of max 50. Hold finished plates ≤15 min. Use heat lamps or bain-marie to hold hot plates ≥63°C until service.`,
      priority: "major",
      context: "large function",
    });
  }

  if (functionType.toLowerCase().includes("buffet")) {
    notes.push({
      rule: `Buffet HACCP: Hot bain-marie ≥63°C checked and logged every 30 min. Cold display ≤5°C. Replenish from kitchen (never top up from same container). Discard hot food >2h in danger zone.`,
      priority: "critical",
      context: "buffet",
    });
  }

  // Sort critical first, then major, then minor
  return notes.sort((a, b) => {
    const order = { critical: 0, major: 1, minor: 2 };
    return order[a.priority] - order[b.priority];
  });
}

/**
 * Detect which cultural/linguistic terminology is present in the text.
 * Returns a list of recognised terms with their language and meaning.
 */
export function detectTerminology(text: string): Array<{
  term: string;
  language: string;
  meaning: string;
  category: string;
}> {
  const lower = text.toLowerCase();
  const found: Array<{
    term: string;
    language: string;
    meaning: string;
    category: string;
  }> = [];

  const allTerms: CulinaryTerm[] = [
    ...FRENCH_GLOSSARY,
    ...MAORI_GLOSSARY,
    ...AUNZ_GLOSSARY,
  ];
  for (const entry of allTerms) {
    if (lower.includes(entry.term.toLowerCase())) {
      found.push({
        term: entry.term,
        language:
          entry.language === "french"
            ? "French"
            : entry.language === "maori"
              ? "Te Reo Māori"
              : entry.language === "aunz"
                ? "AU/NZ"
                : "English",
        meaning: entry.english,
        category: entry.category,
      });
    }
  }

  // Deduplicate by term
  const seen = new Set<string>();
  return found.filter((f) => {
    if (seen.has(f.term)) return false;
    seen.add(f.term);
    return true;
  });
}

/**
 * Get HACCP note for a specific dish (used in prep item generation).
 */
export function getHACCPNoteForDish(dish: string): string | null {
  const lower = dish.toLowerCase();

  // Check French glossary first
  for (const term of [...FRENCH_GLOSSARY, ...MAORI_GLOSSARY]) {
    if (lower.includes(term.term.toLowerCase()) && term.haccpNote) {
      return term.haccpNote;
    }
  }

  // Check HACCP rules
  for (const rule of HACCP_RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      return rule.rule;
    }
  }

  return null;
}

/**
 * Full terminology lookup — returns all known information about a culinary term.
 */
export function lookupTerm(term: string): CulinaryTerm | null {
  const lower = term.toLowerCase().trim();
  const allTerms: CulinaryTerm[] = [
    ...FRENCH_GLOSSARY,
    ...MAORI_GLOSSARY,
    ...AUNZ_GLOSSARY,
  ];
  return allTerms.find((t) => t.term.toLowerCase() === lower) ?? null;
}
