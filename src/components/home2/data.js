import { PARTNERS, PRODUCTS, getProduct } from "../../data/products";
import { SOLUTION_PAGES } from "../../data/solutions";

/*
 * Home v2's content. Product numbers are computed from data/products.js only; partner figures are
 * the ones the site already shows, with their exact labels; the journey has no dates (year: "" —
 * the year element is hidden while empty).
 */

/** "8–128 kWh", "100 kWh (expandable to 1 MWh)", "5.016 MWh" → rated energy in kWh (first figure). */
export function parseEnergy(capacity = "") {
  const m = capacity.match(/^([\d.]+)(?:–([\d.]+))?\s*(kWh|MWh)/);
  if (!m) return null;
  const k = m[3] === "MWh" ? 1000 : 1;
  const at = (s) => ({ value: Number(s), unit: m[3], kwh: Number(s) * k });
  return { lo: at(m[1]), hi: at(m[2] ?? m[1]), text: `${m[2] ? `${m[1]}–${m[2]}` : m[1]} ${m[3]}` };
}
const format = ({ value, unit }) => `${value.toLocaleString("en-US")} ${unit}`;
const listOf = (names) => (names.length < 2 ? names.join("") : `${names.slice(0, -1).join(", ")} & ${names.at(-1)}`);

// ---- 3. Partner ledger ----------------------------------------------------------------------------
// What NEXERA brings from each: product family names as they appear in products.js (Midea has no
// catalogue product, so no family is named).
export const LEDGER = [
  { id: "tcl", name: "TCL", figure: "160+", label: "countries and regions", brings: "BlueArk residential and C&I systems", link: { to: "/products?partner=tcl", text: "View TCL systems" } },
  { id: "hithium", name: "Hithium", figure: "56.6 GWh", label: "energy-storage battery sales (2025)", brings: "∞BLOCK C&I cabinets and ∞Power utility-scale systems", link: { to: "/products?partner=hithium", text: "View Hithium systems" } },
  { id: "clou", name: "CLOU", figure: "16 GWh", label: "contracted and delivered systems", brings: "Aqua C&I and containerised utility-scale systems", link: { to: "/products?partner=clou", text: "View CLOU systems" } },
  { id: "midea", name: "Midea", figure: "US$64.3 billion", label: "revenue (2025)", brings: "Residential energy storage, by enquiry", link: { to: "/contact?intent=residential&brand=midea", text: "Explore Midea residential solutions" } },
];

// ---- 4. BESS cross -----------------------------------------------------------------------------------
export const CROSS = [
  { id: "solar", label: "Solar", file: "arm-solar.png", flow: "in", text: "Store the solar you generate on homes and rooftops and use it after sunset.", to: SOLUTION_PAGES.residential.path, cta: "Residential storage" },
  { id: "industry", label: "Industry", file: "arm-industry.png", flow: "out", text: "Peak shaving, solar self-consumption and backup power for factories and plants.", to: SOLUTION_PAGES.ci.path, cta: "Commercial & industrial storage" },
  { id: "commercial", label: "Commercial", file: "arm-commercial.png", flow: "out", text: "Reliable storage for offices, hospitals, data centres and commercial buildings.", to: SOLUTION_PAGES.ci.path, cta: "Commercial & industrial storage" },
  { id: "utility", label: "Utility", file: "arm-utility.png", flow: "out", text: "Grid-scale BESS for renewable integration, grid stability and peak demand.", to: SOLUTION_PAGES.utility.path, cta: "Utility-scale storage" },
];

// ---- 5. Inside the BESS (top → bottom of the exploded stack) --------------------------------------
export const COMPONENTS = [
  { id: "fire", title: "Fire Protection", sub: "Multi-level safety mechanisms", text: "Multi-level detection and suppression designed to identify and isolate faults early.", bullets: ["Gas, smoke and temperature detection", "Fire suppression", "Pressure relief"], motif: "shield" },
  { id: "thermal", title: "Thermal Management", sub: "Maintains ideal operating temperature", text: "Liquid or air cooling keeps cells within their ideal temperature range.", bullets: ["Liquid or air cooling", "Even cell temperatures", "Supports long battery life"], motif: "fan" },
  { id: "ems", title: "Energy Management System (EMS)", sub: "Optimizes performance and control", text: "The EMS decides when to charge and discharge, based on tariffs, solar generation and site demand.", bullets: ["Charge/discharge scheduling", "Peak shaving and solar self-consumption", "Remote monitoring"], motif: "chart" },
  { id: "pcs", title: "Power Conversion System (PCS)", sub: "Converts DC to AC and vice versa", text: "Converts DC power from the battery to AC power for use in your facility or the grid, and back again to charge.", bullets: ["Bi-directional power flow", "High efficiency", "Grid support capabilities"], motif: "wave" },
  { id: "bms", title: "Battery Management System (BMS)", sub: "Monitors and protects the battery", text: "The BMS monitors cell voltage, current and temperature, and protects the battery from unsafe conditions.", bullets: ["Cell-level monitoring", "Cell balancing", "Protection and alarms"], motif: "circuit" },
  { id: "modules", title: "Battery Modules", sub: "Cells that store the energy", text: "Battery cells are grouped into modules and racks that store the system's energy.", bullets: ["Cells grouped into modules and racks", "Sized in kWh / MWh", "LFP chemistry in the systems NEXERA offers"], motif: "cells" },
];

// ---- 6. Capacity scale ------------------------------------------------------------------------------
export const SEGMENTS = [
  { id: "residential", label: "Residential", name: "Residential", cutout: "tcl-blueark-x1" },
  { id: "ci", label: "C&I", name: "Commercial & Industrial", cutout: "tcl-blueark-w10" },
  { id: "utility", label: "Utility-Scale", name: "Utility-Scale", cutout: "hithium-power-625" },
];
/** Every catalogue product on the scale: its rated energy (a bar for a range) and segment (its first application). */
export const SCALE_ITEMS = PRODUCTS.map((p) => ({ product: p, energy: parseEnergy(p.compare?.capacity), seg: p.applications[0] }))
  .filter((x) => x.energy)
  .sort((a, b) => SEGMENTS.findIndex((s) => s.id === a.seg) - SEGMENTS.findIndex((s) => s.id === b.seg) || a.energy.lo.kwh - b.energy.lo.kwh);
/** A segment's systems (any product listing that application): count, energy range, partners. */
export function segmentSummary(app) {
  const items = PRODUCTS.filter((p) => p.applications.includes(app));
  const es = items.map((p) => parseEnergy(p.compare?.capacity)).filter(Boolean);
  const lo = es.reduce((a, e) => (e.lo.kwh < a.kwh ? e.lo : a), es[0].lo);
  const hi = es.reduce((a, e) => (e.hi.kwh > a.kwh ? e.hi : a), es[0].hi);
  const energy = es.length === 1 ? es[0].text : `${format(lo)} – ${format(hi)}`;
  const brands = PARTNERS.filter((b) => items.some((p) => p.partner === b.id)).map((b) => b.name);
  return { count: items.length, energy, lo: lo.kwh, hi: hi.kwh, systems: `${items.length} ${items.length === 1 ? "system" : "systems"} from ${listOf(brands)}` };
}
export const cutoutOf = (seg) => getProduct(SEGMENTS.find((s) => s.id === seg).cutout);

// ---- 7. Journey (no dates: year stays "" until verified) ------------------------------------------
export const JOURNEY = [
  { year: "", title: "The experience", text: "A founding team with 15+ years each in India's solar and new-energy industry." },
  { year: "", title: "The problem we lived", text: "As a solar EPC, getting reliable battery storage into Indian projects, backed by service that shows up, was hard." },
  { year: "", title: "NEXERA Powertech is founded", text: "Headquartered in Bangalore, to build India's distribution, service and technical backbone for BESS." },
  { year: "", title: "Global partners", text: "Authorized distributor and solutions partner for TCL, Hithium, CLOU and Midea in India." },
  { year: "", title: "Kalaburagi", text: "Regional office and hands-on technician training center, where technicians train on live hardware." },
  { year: "", title: "Next: Nagpur and Delhi", text: "Expanding the network north (planned)." },
  { year: "", title: "Tomorrow", text: "A trained, pan-India network of BESS distributors, deploying storage reliably at every scale." },
];
