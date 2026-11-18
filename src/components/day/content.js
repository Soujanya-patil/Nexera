/*
 * Copy for the home story ("One Day on Site"). From the approved concept, with the director's edits:
 * our hero sub-line and buttons, the X5's cooling described as a cooling system (it is air-cooled),
 * "within 20 milliseconds", "a generator" (no fuel named), and the W10's range as 261 kWh to 6.3 MWh.
 * Every figure is on the product pages (src/data/products.js).
 */

// The page's only h1: identical to the home route's h1 in src/seo/routes.js (the build checks it).
export const H1 = "Battery Energy Storage Systems (BESS) for India’s Homes, Businesses and Grids";

export const HERO = {
  display: "Your solar stops at sunset. Your power doesn’t have to.",
  sub: "Nexera Powertech is the authorised distributor of TCL and Hithium battery energy storage in India, with local stock, system design, commissioning and service.",
  primary: { label: "Explore BESS Solutions", to: "/solutions" },
  secondary: { label: "Become a Partner", to: "/become-a-partner" },
  partner: "Authorised partner for TCL and Hithium.",
  hint: "Scroll to open the cabinet",
};

export const CHAPTERS = [
  {
    id: "open",
    time: "06:10",
    tag: "Open the cabinet",
    h: "A battery is a cabinet of cells, and the systems that look after them.",
    p: "Lithium iron phosphate cells sit in packs. A cooling system keeps every pack in its safe temperature range. A battery management system reads each cell’s voltage and temperature. A power conversion system turns the stored DC into the AC your site runs on.",
    li: ["Battery packs of LFP cells", "Cooling system", "Power conversion system (PCS)", "Energy management system (EMS)", "Fire detection and suppression"],
  },
  {
    id: "noon",
    time: "12:40",
    tag: "Charge",
    h: "At noon your panels make more than you use. The battery takes the rest.",
    p: "Rooftop solar peaks in the middle of the day, when many sites cannot use all of it. Storage keeps that surplus on your side of the meter instead of sending it away.",
    li: ["Solar self-consumption", "Charging from the grid in low-tariff hours"],
  },
  {
    id: "peak",
    time: "19:00",
    tag: "Discharge",
    h: "At 7 pm the sun is gone and the tariff is at its highest. The battery pays out.",
    p: "Evening is when most factories and buildings draw hardest, and when time-of-day tariffs charge the most. The battery feeds your load in exactly those hours, so the meter turns slower when each unit costs more.",
    li: ["Peak shaving", "Time-of-day shifting", "Lower demand spikes"],
  },
  {
    id: "outage",
    time: "02:15",
    tag: "Grid down",
    h: "When the grid drops, the site holds.",
    p: "The TCL BlueArk X5 moves from grid to battery within 20 milliseconds. It works alongside a generator and can restart a site that has no grid at all.",
    li: ["Backup for critical loads", "Shorter generator runtime", "Off-grid and remote sites"],
  },
  {
    id: "scale",
    tag: "Scale",
    h: "One cabinet, or a field of them.",
    p: "A single TCL BlueArk W10 holds 261 kWh, and W10 cabinets expand from 261 kWh to 6.3 MWh. For solar parks and utilities, one Hithium ∞Power container holds 6.25 MWh.",
    li: ["Homes: 8 to 128 kWh", "Factories: 100 kWh to 6.3 MWh", "Utility: 6.25 MWh per container"],
  },
  {
    id: "signed",
    tag: "Handover",
    h: "Every system, signed off.",
    p: "A battery that is sized wrong or commissioned badly is a problem with a warranty card. So nothing is handed over until six things are true.",
    checks: [
      "Load profile studied, system sized",
      "Single-line diagram approved",
      "Installed to the maker’s manual",
      "Commissioned with our engineer on site",
      "Your technicians trained on it",
      "Warranty registered with the maker",
    ],
    ctas: [
      { label: "Start a project", to: "/contact" },
      { label: "How it works", to: "/how-it-works" },
    ],
  },
];

// Labels on the open cabinet (desktop 3D, and on the "open" still).
export const CALLOUTS = [
  ["packs", "Battery packs"],
  ["cells", "LFP cells"],
  ["cool", "Cooling"],
  ["ems", "EMS and protection"],
  ["pcs", "Power conversion (PCS)"],
];

export const HUD = {
  soc: "State of charge",
  modes: ["Standby", "Charging", "Discharging", "Backup", "Standby"],
  note: "Illustration",
};
export const PAUSE = ["Pause motion", "Play motion"];

// The clock (minutes) and state of charge along the story, by progress 0…6. The clock reads each
// chapter's time chip when that chapter is centred (06:10, 12:40, 19:00, 02:15).
export const CLOCK = [[0, 340], [1, 370], [2, 760], [3, 1140], [4, 1575], [5, 1730], [6, 1810]];
export const SOC = [[0, 0.32], [1.5, 0.3], [2.6, 0.96], [3, 0.9], [3.9, 0.45], [4.7, 0.24], [5.2, 0.24], [6, 0.5]];
export const modeAt = (p) => (p < 1.6 ? 0 : p < 2.6 ? 1 : p < 3.95 ? 2 : p < 4.7 ? 3 : 4);
export const table = (t, x) => {
  for (let i = 0; i < t.length - 1; i++)
    if (x <= t[i + 1][0]) return t[i][1] + (t[i + 1][1] - t[i][1]) * Math.max(0, (x - t[i][0]) / (t[i + 1][0] - t[i][0]));
  return t[t.length - 1][1];
};
export const clockAt = (p) => {
  const m = Math.round(table(CLOCK, p)) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60 - (m % 5)).padStart(2, "0")}`;
};
