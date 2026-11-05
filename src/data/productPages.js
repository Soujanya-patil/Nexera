/*
 * Product pages (/products/:id): the search title and description, "Who it's for", "Typical
 * applications" and the FAQ for every listed product. Rendered by pages/ProductDetail.jsx; the title,
 * description and FAQ also go into the page's head and structured data (src/seo/routes.js).
 *
 * Content rule: nothing new. Every line restates a field of data/products.js or copy the site already
 * has (the source is noted beside each one). No prices, delivery times, warranty years, certifications
 * beyond the catalogue, customers or projects; the partner designs and manufactures every system and
 * NEXERA is its authorised distributor. A product kept off the catalogue (`listed: false`) has no entry.
 *
 * The FAQ text is built here once, so the visible FAQ and the FAQPage data are the same words; `links`
 * only turn words of an answer into links.
 */
import { getProduct, partnerOf, productLabel } from "./products";

/** "Typical applications": each one's line is the Solutions page's own, and links to that section. */
export const USES = {
  // Residential, "Why Add Solar Battery Storage to Your Home?" (Store the Solar You Generate)
  "home-solar": {
    title: "Solar self-consumption",
    text: "Use excess solar energy generated during the day instead of sending it back to the grid.",
    to: "/solutions/residential#why-home",
  },
  // Residential, "Solutions for Every Home" (Solar + Battery + Backup)
  "home-backup": {
    title: "Home battery backup",
    text: "Solar generates. Battery stores. The system automatically supports selected loads during grid outages.",
    to: "/solutions/residential#home-solutions",
  },
  // C&I, the peak shaving section and "Energy Storage Built Around Your Business" (Peak Shaving)
  "peak-shaving": {
    title: "Peak shaving",
    text: "Store energy when electricity is cheaper and discharge during high-demand periods.",
    to: "/solutions/commercial-industrial#peak-shaving",
  },
  // C&I, "Energy Storage Built Around Your Business" (Solar Self-Consumption)
  "ci-solar": {
    title: "Solar self-consumption",
    text: "Capture excess daytime solar and use it when your facility needs it.",
    to: "/solutions/commercial-industrial#why-ci",
  },
  // C&I, "Energy Storage Built Around Your Business" (Backup Power)
  "ci-backup": {
    title: "Backup power",
    text: "Keep critical loads operating during grid interruptions.",
    to: "/solutions/commercial-industrial#why-ci",
  },
  // Utility, "Store More. Shift More. Stabilise the Grid." (Renewable Energy Integration)
  "renewable-integration": {
    title: "Renewable energy integration",
    text: "Store excess solar and wind generation and dispatch it when renewable generation falls.",
    to: "/solutions/utility-scale#why-utility",
  },
  // Utility, "Store More. Shift More. Stabilise the Grid." (Peak Shifting)
  "peak-shifting": {
    title: "Peak shifting",
    text: "Move energy from low-demand periods to high-demand periods to improve asset utilisation and project economics.",
    to: "/solutions/utility-scale#why-utility",
  },
  // Utility, "Powering Multiple Use Cases" (Renewable Firming); the Utility FAQ: a 4-hour system "suits
  // longer evening peaks and renewable firming", so only systems with a 4-hour configuration list it.
  "renewable-firming": {
    title: "Renewable firming",
    text: "Increase renewable utilisation and reduce curtailment.",
    to: "/solutions/utility-scale#applications",
  },
};

// The C&I uses every C&I system lists: the C&I page — "Our commercial battery storage systems help
// businesses with: Peak Shaving, Solar Self-Consumption, …". Backup only where the catalogue shows
// on/off-grid switching or off-grid operation.
const CI = ["peak-shaving", "ci-solar"];
// Utility: renewable integration and peak shifting (the Utility page); firming for 4-hour systems.
const UTILITY_4H = ["renewable-integration", "peak-shifting", "renewable-firming"];

/** Per product: the search title and description, who it's for, its uses and the FAQ's product answers. */
const PAGES = {
  "tcl-blueark-x1": {
    title: "TCL BlueArk X1 Home Battery Storage India | NEXERA",
    description:
      "TCL BlueArk X1 home battery: 8–128 kWh stacked LFP battery with a hybrid inverter up to 15 kW. From NEXERA, TCL authorised distributor in India.",
    audience: [
      // RESIDENTIAL_BENEFITS "Store the Solar You Generate"; highlight "Made for solar" (3 MPPTs, 2× PV oversizing)
      "Homes with rooftop solar that want to store the solar they generate",
      // specs: AC output "On-grid, off-grid, generator backup", switch time "<10 ms (UPS function)"
      "Homes that need backup for essential loads during power cuts, switching in under 10 ms",
      // Residential "Solutions for Every Home", Solar + Battery: "Homes with significant evening and night-time consumption."
      "Homes with significant evening and night-time consumption",
      // highlight "Modular stacked battery": 8 kWh to 128 kWh; RESIDENTIAL_BENEFITS "Built to Scale"
      "Homes that want to start with the capacity they need today and add battery modules later, from 8 kWh up to 128 kWh",
    ],
    uses: ["home-solar", "home-backup"],
    // specs: capacity, inverter power, max. charge/discharge power
    capacity: {
      q: "What is the capacity and power of the TCL BlueArk X1?",
      a: "The TCL BlueArk X1 has a modular, stacked battery of 8–128 kWh and a hybrid inverter of 3–8 kW single phase or 5–15 kW three phase, with up to 15 kW charge/discharge in one system.",
    },
    // specs: "LFP, Tier 1 cells", "8,000 cycles"
    chemistry: "The TCL BlueArk X1 uses LFP (lithium iron phosphate) Tier 1 cells, rated for 8,000 cycles.",
    // highlight "Modular stacked battery"
    expansion: "Yes. Its battery is modular and stacked: it scales from 8 kWh to 128 kWh, with up to 15 kW charge/discharge in one system.",
  },
  "tcl-blueark-x5": {
    title: "TCL BlueArk X5 C&I Energy Storage India | NEXERA",
    description:
      "TCL BlueArk X5 all-in-one C&I storage: 50 kW / 100 kWh, expandable to 1 MWh, with direct PV access. From NEXERA, TCL authorised distributor in India.",
    audience: [
      // summary: "for small and medium C&I sites"
      "Small and medium commercial and industrial sites",
      // summary: "suited to new PV + storage projects"; specs: direct PV access, 6 MPPTs
      "New solar + storage projects, with direct PV access and 6 MPPTs",
      // C&I page: "businesses looking to combine solar, storage and backup power, with … diesel-generator integration"; specs: 20 ms switch
      "Businesses that want to combine solar, storage and backup power, including sites with a diesel generator",
      // specs: DC-side and AC-side expansion
      "Sites that expect to grow: up to 4 battery cabinets on the DC side, or up to 10 units in parallel to 500 kW / 1 MWh",
    ],
    // ci-backup: specs "On/off switch time 20 ms", "Diesel-generator interface"
    uses: [...CI, "ci-backup"],
    capacity: {
      q: "What is the capacity and power of the TCL BlueArk X5?",
      // specs: rated power, system capacity, DC-side and AC-side expansion
      a: "The TCL BlueArk X5 has 50 kW rated power and 100 kWh system capacity. With up to 4 parallel battery cabinets it expands to 50 kW / 400 kWh, and with up to 10 units in parallel to 500 kW / 1 MWh.",
    },
    // specs: battery cell 314 Ah, chemistry LFP, cycle life
    chemistry: "The TCL BlueArk X5 uses 314 Ah LFP (lithium iron phosphate) battery cells, with a cycle-life specification of up to 8,000 cycles.",
    // specs: DC-side and AC-side expansion
    expansion: "Yes. On the DC side it takes up to 4 parallel battery cabinets (50 kW / 100 kWh to 50 kW / 400 kWh); on the AC side, up to 10 units in parallel (to 500 kW / 1 MWh).",
  },
  "tcl-blueark-w10": {
    title: "TCL BlueArk W10 C&I Storage Cabinet India | NEXERA",
    description:
      "TCL BlueArk W10 C&I storage cabinet: 125 kW / 261 kWh, liquid-cooled, expandable to 6.3 MWh. From NEXERA, TCL authorised distributor in India.",
    audience: [
      // C&I page: "Designed for businesses requiring higher storage capacity in a compact footprint: 261 kWh in a single cabinet"
      "Businesses that need higher storage capacity in a compact footprint: 261 kWh in a single cabinet",
      // specs: grid
      "Sites with weak grids: three-phase operation, stable in weak-grid conditions, with three-phase imbalance correction",
      // specs: scalability
      "Projects that will grow: from 125 kW / 261 kWh, expandable to 6.3 MWh",
      // specs: monitoring
      "Operators who want remote visibility, with cloud-based monitoring and diagnostics",
    ],
    uses: CI,
    capacity: {
      q: "What is the capacity and power of the TCL BlueArk W10?",
      // specs: power, capacity, rated output, scalability
      a: "The TCL BlueArk W10 has 125 kW power and 261 kWh capacity, with 125 kVA rated output. It is expandable to 6.3 MWh.",
    },
    // specs: cell, cycle life, depth of discharge
    chemistry: "The TCL BlueArk W10 uses 314 Ah LFP (lithium iron phosphate) cells, with a specification of 8,000 cycles at 70% SOH and 95% depth of discharge.",
    // specs: scalability
    expansion: "Yes. It starts at 125 kW / 261 kWh and is expandable to 6.3 MWh.",
  },
  "hithium-block-261": {
    title: "Hithium ∞BLOCK C&I All-in-One ESS 261 kWh India | NEXERA",
    description:
      "Hithium ∞BLOCK C&I All-in-One ESS: 261 kWh, liquid-cooled, adjustable 125 kW PCS, IP55. From NEXERA, Hithium authorised distributor in India.",
    audience: [
      // C&I page: "combines battery storage, power conversion and system controls in a compact cabinet"; summary: "for commercial and industrial sites"
      "Commercial and industrial sites that want battery storage, power conversion and system controls in one compact cabinet",
      // specs: rated AC voltage, PCS
      "Sites connecting at 400 Vac (3W+N+PE), with an adjustable 125 kW PCS",
      // specs: protection, dimensions
      "Outdoor installations: IP55, in a 1000 × 1350 mm footprint",
    ],
    uses: CI,
    capacity: {
      q: "What is the capacity and power of the Hithium ∞BLOCK C&I All-in-One ESS?",
      // specs: rated energy, PCS, rated charge/discharge; model
      a: "The Hithium ∞BLOCK C&I All-in-One ESS (model HCL 125kW-261kWh-400) has 261 kWh rated energy and an adjustable 125 kW PCS, at 0.5P / 0.5P rated charge/discharge.",
    },
    // specs: cell, chemistry, series-parallel mode, modules
    chemistry: "It uses 314 Ah LFP (lithium iron phosphate) cells, in five liquid-cooled battery modules (1P260S).",
  },
  "hithium-power-cabinet-1022": {
    title: "Hithium ∞Power 1022 kWh Cabinet BESS India | NEXERA",
    description:
      "Hithium ∞Power 1022 kWh liquid-cooled cabinet for C&I and utility projects, 400 Vac. From NEXERA, Hithium authorised distributor in India.",
    audience: [
      // applications: ci, utility
      "Commercial and industrial sites and utility-scale projects",
      // specs: six-cabinet layout, land use
      "Sites where land is limited: six cabinets deliver ≈6 MWh in ≈33.6 m², up to 42.3% less land than a traditional 5 MWh container solution (Hithium comparison)",
      // specs: applications
      "Grid-tied, off-grid and solar-storage hybrid systems",
      // specs: grid connection
      "Projects using their own PCS: it connects at 400 Vac and is compatible with various PCS models",
    ],
    // ci-solar: "solar-storage hybrid"; ci-backup: "off-grid", "Automatic on-grid / off-grid switching"
    uses: [...CI, "ci-backup", "renewable-integration"],
    capacity: {
      q: "What is the capacity of the Hithium ∞Power 1022 kWh Cabinet?",
      // specs: rated energy, integration, grid connection
      a: "The Hithium ∞Power 1022 kWh Cabinet has 1022 kWh rated energy, with battery, thermal management and control in one liquid-cooled cabinet. It connects at 400 Vac and is compatible with various PCS models.",
    },
    // specs: six-cabinet layout
    expansion: "Yes. Hithium specifies a six-cabinet layout of ≈6 MWh in a minimum footprint of ≈33.6 m² (6.4 × 5.25 m).",
  },
  "hithium-power-625": {
    title: "Hithium ∞Power 6.25 MWh Utility BESS India | NEXERA",
    description:
      "Hithium ∞Power 6.25 MWh liquid-cooled utility BESS, 2-hour or 4-hour, IP55, 20-foot container. From NEXERA, Hithium authorised distributor in India.",
    audience: [
      // Utility page: "so project developers, IPPs, EPCs and utilities can select the BESS container architecture that best fits their project"
      "Project developers, IPPs, EPCs and utilities building utility-scale storage",
      // summary: "available in 2-hour and 4-hour configurations"; specs: 0.5P / 0.25P
      "Projects that need a 2-hour (0.5P) or 4-hour (0.25P) system",
      // Utility FAQ: "Storage can be added to existing or new renewable plants."
      "Existing or new solar and wind plants adding storage",
      // specs: protection, operating temperature, format
      "Outdoor sites: a 20-foot container with IP55 protection, operating from −30 °C to +55 °C",
    ],
    uses: UTILITY_4H,
    capacity: {
      q: "What is the capacity of the Hithium ∞Power 6.25 MWh?",
      // specs: rated energy, rated voltage, configurations
      a: "The Hithium ∞Power 6.25 MWh has 6.25 MWh rated energy at 1331.2 V rated voltage, in a 2-hour configuration (8P416S, 0.5P / 0.5P) or a 4-hour configuration (4P416S, 0.25P / 0.25P).",
    },
  },
};

/** "<name> by <Partner>, available in India through NEXERA, an authorised <Partner> distributor." */
export const introLine = (p) => {
  const brand = partnerOf(p.partner).name;
  return `${p.name} by ${brand}, available in India through NEXERA, an authorised ${brand} distributor.`;
};

/** The product's page content, or undefined (a product kept off the catalogue has none). */
export function productPage(id) {
  const page = PAGES[id];
  const p = getProduct(id);
  if (!page || !p || p.listed === false) return undefined;
  const brand = partnerOf(p.partner).name;
  const label = productLabel(p);
  const faq = [
    {
      q: `Is the ${label} available in India?`,
      // The brief's pattern; "designs and manufactures… supplies… design, commissioning, training and
      // after-sales support": the Solutions FAQs ("Does NEXERA manufacture these systems?").
      a: `Yes. The ${label} is available in India through NEXERA, an authorised ${brand} distributor. ${brand} designs and manufactures the system; NEXERA supplies it and provides design, commissioning, training and after-sales support. Contact NEXERA for a quote.`,
      links: [{ text: "Contact NEXERA for a quote", to: `/contact?product=${p.id}&intent=quote` }],
    },
    page.capacity,
    page.chemistry && { q: `What battery chemistry does the ${label} use?`, a: page.chemistry },
    page.expansion && { q: `Can the ${label} be expanded?`, a: page.expansion },
    {
      q: `Who installs and supports the ${label} in India?`,
      // Service & Training: Design & Commissioning Support, After-Sales & Warranty, the training centre.
      a: "NEXERA supports it in India. Every partner gets our engineering team for sizing, single-line diagrams, and on-site support with BESS installation and BESS commissioning; from 2027, technicians will train on live hardware at our Kalaburagi Technician Training Centre; and warranty handling is local-first, with NEXERA managing the OEM relationship. More on Service & Training.",
      links: [{ text: "Service & Training", to: "/service-training" }],
    },
  ].filter(Boolean);
  return { ...page, uses: page.uses.map((id) => ({ id, ...USES[id] })), faq };
}
