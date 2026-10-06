import { PARTNERS, PRODUCTS, getProduct } from "../../data/products";
import { SOLUTION_PAGES } from "../../data/solutions";

/*
 * Home v2's figures. Product numbers are computed from data/products.js only (each product's own
 * rated energy, its `compare.capacity` — the first figure, so "expandable to …" notes are ignored);
 * partner figures are ones the site already shows (source noted on each).
 */

/** "8–128 kWh", "100 kWh (expandable to 1 MWh)", "5.016 MWh" → { lo, hi } with units and kWh. */
function parseEnergy(capacity) {
  const m = capacity.match(/^([\d.]+)(?:–([\d.]+))?\s*(kWh|MWh)/);
  if (!m) return null;
  const k = m[3] === "MWh" ? 1000 : 1;
  const at = (s) => ({ value: Number(s), unit: m[3], kwh: Number(s) * k });
  return { lo: at(m[1]), hi: at(m[2] ?? m[1]), text: `${m[2] ? `${m[1]}–${m[2]}` : m[1]} ${m[3]}` };
}
const format = ({ value, unit }) => `${value.toLocaleString("en-US")} ${unit}`;

/** A segment's systems: how many, the energy range across them, and the partners that make them. */
function segment(app) {
  const items = PRODUCTS.filter((p) => p.applications.includes(app));
  const energies = items.map((p) => parseEnergy(p.compare?.capacity ?? "")).filter(Boolean);
  let energy;
  if (energies.length === 1) energy = energies[0].text;
  else {
    const lo = energies.reduce((a, e) => (e.lo.kwh < a.kwh ? e.lo : a), energies[0].lo);
    const hi = energies.reduce((a, e) => (e.hi.kwh > a.kwh ? e.hi : a), energies[0].hi);
    energy = `${format(lo)} – ${format(hi)}`;
  }
  const brands = PARTNERS.filter((b) => items.some((p) => p.partner === b.id)).map((b) => b.name);
  return { count: items.length, energy, brands };
}

/** The three BESS Products tiles: one real catalogue cut-out per segment. */
export const PRODUCT_TILES = [
  { app: "residential", name: "Residential", product: getProduct("tcl-blueark-x1") },
  { app: "ci", name: "Commercial & Industrial", product: getProduct("tcl-blueark-w10") },
  { app: "utility", name: "Utility-Scale", product: getProduct("hithium-power-625") },
].map((t) => ({ ...t, ...segment(t.app) }));

/** Energy Storage for Every Scale: the three segment pages, with their hero photos. */
export const SCALE_CARDS = [
  {
    id: "residential",
    title: "Residential",
    text: "Home battery systems that store your solar and keep essential loads running during outages.",
    page: SOLUTION_PAGES.residential.path,
    img: "res-house",
    alt: "Rendering of a home at night with rooftop solar and a wall-mounted TCL battery beside the garage",
  },
  {
    id: "ci",
    title: "Commercial & Industrial",
    text: "Reliable and efficient energy storage for factories, offices, hospitals, data centres and more.",
    page: SOLUTION_PAGES.ci.path,
    img: "ci-industrial",
    alt: "TCL floor-standing battery cabinets and inverter beside an industrial building",
  },
  {
    id: "utility",
    title: "Utility Scale",
    text: "Large-scale BESS for grid stability, renewable integration and peak demand management.",
    page: SOLUTION_PAGES.utility.path,
    // The utility page's own hero photo, so the card morphs into it.
    img: "utility-solar",
    alt: "Utility-scale battery energy storage containers beside a solar plant",
  },
];

/**
 * Technology partners: one figure each that the site already shows, and where its link goes.
 *   TCL      — /solutions/commercial-industrial: "160+ · countries and regions"
 *   Hithium  — /solutions/commercial-industrial and /utility-scale: "56.6 GWh · energy-storage battery sales (2025)"
 *   CLOU     — both segment pages: "16 GWh · contracted and delivered systems"
 *   Midea    — /solutions/residential: "US$64.3 billion · revenue (2025)"
 */
export const PARTNER_CARDS = [
  { id: "tcl", figure: "160+", label: "countries and regions", link: { to: "/products?partner=tcl", text: "View TCL systems" } },
  { id: "hithium", figure: "56.6 GWh", label: "energy-storage battery sales (2025)", link: { to: "/products?partner=hithium", text: "View Hithium systems" } },
  { id: "clou", figure: "16 GWh", label: "contracted and delivered systems", link: { to: "/products?partner=clou", text: "View CLOU systems" } },
  { id: "midea", name: "Midea", figure: "US$64.3 billion", label: "revenue (2025)", link: { to: "/contact?intent=residential&brand=midea", text: "Explore Midea Residential Solutions" } },
];
