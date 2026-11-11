/*
 * The NEXERA product catalogue — the single source of truth for /products and /products/:id.
 *
 * NEXERA is the solution provider and distributor; every system here is designed and manufactured
 * by the named technology partner. Nothing below is estimated or rounded: each value is copied from
 * the partner document listed in that product's `sources`. Where a document is silent, the field is
 * simply absent — the UI hides empty groups, highlights and comparison cells rather than filling them.
 *
 * Images are transparent cutouts of the partners' own product renders (src/assets/catalogue/), made
 * from Downloads/TCL_photos.zip and Hithium_photos.zip.
 *
 * Listed without a product photo (`imageFallback: true` — `image` is the partner's logo, shown
 * small on the usual plinth, and never used as a product image in search or share data):
 *   - Hithium ∞Power 5.016 MWh: no image in the repo or the Hithium brochure is labelled as this system
 *     (the brochure's ∞Power container renders carry no capacity), so it is also left out of the
 *     /products listing (`listed: false`). Its product page, and the Utility page's link to it, remain.
 * Their data comes from the director-approved Solutions content (checked against the Hithium
 * brochure), and is limited to what that content states.
 *
 * `imageSize` is the image file's own width and height (set on every <img> so nothing moves while it loads).
 * `datasheet` is the product's datasheet PDF in public/datasheets/ (a download), or null (sent on request).
 * `shareImage` (optional) is the page's 1200x630 JPG for link previews, made by scripts/share-images.py
 * (public/og/); without one the page shares the default image.
 *
 * Adding a product: append an entry with the same shape. `specs` groups render as the Technical
 * Information tabs (only non-empty groups show), `keySpecs` are the headline figures, `compare` holds
 * the comparison-table values, and `hotspots` enables the interactive view — only add hotspots whose
 * component names AND locations are confirmed by a partner reference.
 */
import tclLogo from "../assets/partners/tcl-logo.png";
import hithiumLogo from "../assets/partners/hithium-logo.png";
import imgX1 from "../assets/catalogue/tcl-blueark-x1.webp";
import imgX5 from "../assets/catalogue/tcl-blueark-x5.webp";
import imgW10 from "../assets/catalogue/tcl-blueark-w10.webp";
import imgW10Open from "../assets/catalogue/tcl-blueark-w10-open.webp";
import imgX10 from "../assets/catalogue/tcl-blueark-x10-640.webp";
import imgX10Webp320 from "../assets/catalogue/tcl-blueark-x10-320.webp";
import imgX10Avif320 from "../assets/catalogue/tcl-blueark-x10-320.avif";
import imgX10Avif640 from "../assets/catalogue/tcl-blueark-x10-640.avif";
import imgCabinet1022 from "../assets/catalogue/hithium-power-cabinet-1022.webp";
import imgPower625 from "../assets/catalogue/hithium-power-625.webp";

export const APPLICATIONS = [
  { id: "residential", label: "Residential" },
  { id: "ci", label: "C&I" },
  { id: "utility", label: "Utility" },
];
export const applicationLabel = (id) => APPLICATIONS.find((a) => a.id === id)?.label ?? id;

export const PARTNERS = [
  { id: "tcl", name: "TCL", logo: tclLogo, logoSize: [86, 31], logoClass: "h-5" },
  { id: "hithium", name: "Hithium", logo: hithiumLogo, logoSize: [355, 89], logoClass: "h-5" },
];
export const partnerOf = (id) => PARTNERS.find((p) => p.id === id);

/** Technical Information tabs, in display order. */
export const SPEC_GROUPS = [
  { id: "system", label: "System" },
  { id: "battery", label: "Battery" },
  { id: "safety", label: "Safety" },
  { id: "control", label: "Control" },
  { id: "installation", label: "Installation" },
];

/** Comparison rows, in display order. A row shows only if at least one compared product has it. */
export const COMPARE_FIELDS = [
  { id: "capacity", label: "Capacity" },
  { id: "power", label: "Power" },
  { id: "configuration", label: "Configuration" },
  { id: "cell", label: "Battery cell" },
  { id: "cooling", label: "Cooling" },
  { id: "protection", label: "Protection" },
  { id: "dimensions", label: "Dimensions (L×W×H)" },
  { id: "weight", label: "Weight" },
];

const TCL_BROCHURE = "TCL Digital Power product brochure (EN)";
const HITHIUM_BROCHURE = "Hithium product brochure — all solutions and company presentation";
// Lines added from the director-approved Solutions content, which was checked against these decks.
const TCL_DECK = "NEXERA Solutions content, checked against the TCL Digital Power Introduction deck";
const HITHIUM_CONTENT = "NEXERA Solutions content";

export const PRODUCTS = [
  {
    id: "tcl-blueark-x1",
    partner: "tcl",
    name: "BlueArk X1",
    type: "Residential Hybrid Energy Storage System",
    applications: ["residential"],
    image: imgX1,
    imageSize: [389, 774],
    imageAlt: "TCL BlueArk X1 residential energy storage system: a stacked battery unit with an integrated hybrid inverter",
    summary: "A hybrid inverter paired with a modular, stacked LFP battery — from 8 kWh up to 128 kWh for the home.",
    cardSpecs: ["8–128 kWh", "Up to 15 kW"],
    keySpecs: [
      { label: "Battery capacity", value: "8–128 kWh" },
      { label: "Inverter, single phase", value: "3–8 kW" },
      { label: "Inverter, three phase", value: "5–15 kW" },
      { label: "Chemistry", value: "LFP" },
    ],
    specs: {
      system: [
        { label: "Inverter power, single phase", value: "3–8 kW" },
        { label: "Inverter power, three phase", value: "5–15 kW" },
        { label: "AC output", value: "On-grid, off-grid, generator backup" },
        { label: "On/off-grid switch time", value: "<10 ms (UPS function)" },
      ],
      battery: [
        { label: "Chemistry", value: "LFP, Tier 1 cells" },
        { label: "Cycle life", value: "8,000 cycles" },
        { label: "Capacity", value: "8–128 kWh, modular stacked" },
        { label: "Max. charge/discharge power", value: "15 kW in one system" },
        { label: "Voltage structure", value: "Low voltage (<60 V)" },
      ],
      safety: [
        { label: "Redundancy", value: "1+1 redundancy design" },
        { label: "Protection", value: "5 layers of protection" },
        { label: "Control", value: "Dual redundant MCU control" },
        { label: "Fire", value: "Fire suppression module" },
        { label: "Thermal", value: "Multi-module temperature sampling, thermal shield, heat module" },
      ],
      control: [
        { label: "MPPTs", value: "3 independent" },
        { label: "String current", value: "20 A" },
        { label: "PV oversizing", value: "2×" },
      ],
      installation: [
        { label: "Operating temperature", value: "−20 °C to 50 °C" },
        { label: "Battery protection degree", value: "IP66" },
        { label: "Grid", value: "Works with 1-phase and 3-phase systems" },
      ],
    },
    highlights: [
      { icon: "Layers", title: "Modular stacked battery", text: "Scale from 8 kWh to 128 kWh, with up to 15 kW charge/discharge in one system." },
      { icon: "ShieldCheck", title: "Safety and reliability", text: "Tier 1 LFP cells rated for 8,000 cycles, 1+1 redundancy and five layers of protection." },
      { icon: "Zap", title: "Backup-ready", text: "On-grid, off-grid and generator-backup output, switching in under 10 ms." },
      { icon: "Sun", title: "Made for solar", text: "Three independent MPPTs and 2× PV oversizing for high solar yields." },
      { icon: "Thermometer", title: "Harsh-environment ready", text: "IP66 battery protection and a −20 °C to 50 °C operating range." },
    ],
    compare: {
      capacity: "8–128 kWh",
      power: "3–8 kW (1-phase), 5–15 kW (3-phase)",
      configuration: "Hybrid inverter + stacked battery",
      cell: "LFP, Tier 1",
      protection: "IP66 (battery)",
    },
    datasheet: "/datasheets/tcl-blueark-x1-datasheet.pdf",
    sources: [`${TCL_BROCHURE}: BlueArk X1, X1 Inverter, X1 Battery, Safety Design and Excellent Performance pages`],
  },
  {
    id: "tcl-blueark-x5",
    partner: "tcl",
    name: "BlueArk X5",
    type: "Industrial Hybrid Energy Storage Solution",
    applications: ["ci"],
    image: imgX5,
    imageSize: [480, 900],
    imageAlt: "TCL BlueArk X5 all-in-one industrial energy storage cabinet",
    summary: "An all-in-one, DC-coupled system for small and medium C&I sites — suited to new PV + storage projects.",
    cardSpecs: ["50 kW", "100 kWh"],
    keySpecs: [
      { label: "Rated power", value: "50 kW" },
      { label: "System capacity", value: "100 kWh" },
      { label: "Battery cell", value: "314 Ah" },
      { label: "Protection", value: "IP55" },
    ],
    specs: {
      system: [
        { label: "Rated power", value: "50 kW" },
        { label: "System capacity", value: "100 kWh" },
        { label: "Architecture", value: "All-in-one, DC-coupled" },
        { label: "On/off switch time", value: "20 ms" },
        { label: "PV integration", value: "Direct PV access" },
        { label: "Generator", value: "Diesel-generator interface" },
      ],
      battery: [
        { label: "Battery cell", value: "314 Ah" },
        { label: "Chemistry", value: "LFP" },
        { label: "Cycle life", value: "Up to 8,000 cycles (specification)" },
        { label: "DC-side expansion", value: "Up to 4 parallel battery cabinets: 50 kW/100 kWh to 50 kW/400 kWh" },
      ],
      safety: [
        { label: "Surge protection", value: "Type II SPD on AC and DC sides" },
        { label: "Arc fault", value: "AFCI" },
        { label: "Detection", value: "Smoke detector, temperature sensor, combustible gas detector" },
        { label: "Alarm", value: "Audible and visual alarm" },
        { label: "Fire", value: "Aerosol fire extinguisher" },
      ],
      control: [
        { label: "MPPTs", value: "6" },
        { label: "String current", value: "22.5 A" },
      ],
      installation: [
        { label: "Protection", value: "IP55" },
        { label: "Inverter protection", value: "IP66" },
        { label: "Operating temperature", value: "−30 °C to 50 °C" },
        { label: "AC-side expansion", value: "Up to 10 parallel units: 50 kW/100 kWh to 500 kW/1 MWh" },
      ],
    },
    highlights: [
      { icon: "Boxes", title: "All-in-one, DC-coupled", text: "Designed for small and medium C&I sites and new PV + storage systems." },
      { icon: "Expand", title: "Scales both ways", text: "Up to 4 battery cabinets on the DC side, or up to 10 units in parallel on the AC side — to 500 kW / 1 MWh." },
      { icon: "Flame", title: "Detection and suppression", text: "Smoke, temperature and combustible-gas detection, an audible and visual alarm, and an aerosol fire extinguisher." },
      { icon: "ShieldCheck", title: "Outdoor-rated", text: "IP55, −30 °C to 50 °C, with Type II SPD on AC/DC sides and AFCI." },
    ],
    compare: {
      capacity: "100 kWh (expandable to 1 MWh)",
      power: "50 kW (expandable to 500 kW)",
      configuration: "All-in-one, DC-coupled",
      cell: "314 Ah",
      protection: "IP55",
    },
    datasheet: "/datasheets/tcl-blueark-x5-datasheet.pdf",
    sources: [`${TCL_BROCHURE}: BlueArk X5, All-in-one C&I ESS, Flexible Expansion and Safety & Adaptability pages`, TCL_DECK],
  },
  {
    id: "tcl-blueark-w10",
    partner: "tcl",
    name: "BlueArk W10",
    type: "Energy Storage Cabinet",
    applications: ["ci"],
    image: imgW10,
    imageSize: [380, 900],
    imageAlt: "TCL BlueArk W10 energy storage cabinet",
    summary: "A 125 kW / 261 kWh cabinet, expandable to 6.3 MWh, with a layered protection architecture.",
    cardSpecs: ["125 kW", "261 kWh"],
    keySpecs: [
      { label: "Power", value: "125 kW" },
      { label: "Capacity", value: "261 kWh" },
      { label: "Scalability", value: "Up to 6.3 MWh" },
    ],
    specs: {
      system: [
        { label: "Power", value: "125 kW" },
        { label: "Capacity", value: "261 kWh" },
        { label: "Scalability", value: "Expandable to 6.3 MWh" },
        { label: "Rated output", value: "125 kVA" },
        { label: "Current THD", value: "<2%" },
        { label: "Grid", value: "Three-phase operation, stable in weak-grid conditions, three-phase imbalance correction" },
        { label: "Integration", value: "Integrated BMS, PCS and EMS" },
      ],
      battery: [
        { label: "Cell", value: "314 Ah LFP" },
        { label: "Cooling", value: "Intelligent liquid cooling" },
        { label: "Cycle life", value: "8,000 cycles at 70% SOH (specification)" },
        { label: "Depth of discharge", value: "95% DOD" },
      ],
      control: [{ label: "Monitoring", value: "Cloud-based monitoring and diagnostics" }],
      installation: [{ label: "Protection", value: "IP55" }],
      safety: [
        { label: "Cabinet level", value: "Aerosol fire suppression, water fire protection system, explosion vent" },
        { label: "Detection", value: "Smoke detector, temperature sensor, combustible gas detector" },
        { label: "Pack level", value: "Pack-level fire protection, pack explosion relief valve" },
        { label: "Ventilation", value: "Exhaust valve and intake valve" },
      ],
    },
    highlights: [
      { icon: "Expand", title: "Expandable to 6.3 MWh", text: "Starts at 125 kW / 261 kWh and expands to 6.3 MWh." },
      { icon: "ShieldCheck", title: "Layered protection", text: "Cabinet-level aerosol and water fire protection, gas and smoke detection, plus pack-level fire protection." },
      { icon: "Flame", title: "Explosion management", text: "An explosion vent at cabinet level and explosion relief valves at pack level." },
    ],
    compare: {
      capacity: "261 kWh (expandable to 6.3 MWh)",
      power: "125 kW",
      cell: "314 Ah LFP",
      cooling: "Liquid",
      protection: "IP55",
    },
    // The open-cabinet view is the held final frame of the Home hero footage (this cabinet design);
    // the five points are the same pixel-centroid anchors verified there against TCL's
    // Protection Architecture slide. Only parts visible in this frame are marked.
    hotspots: {
      image: imgW10Open,
      imageSize: [1040, 864],
      imageAlt: "Open-cabinet view: door with fans and fire suppression unit, five battery packs, and the lower electrical rack",
      caption: "Open-cabinet view of this cabinet design. Component names and locations follow TCL's protection-architecture documentation.",
      points: [
        { id: "exhaust", label: "Exhaust Valve", anchor: [14.8, 28.9], text: "Upper valve on the inside of the cabinet door — part of the protection architecture." },
        { id: "aerosol", label: "Aerosol Fire Suppression", anchor: [26.8, 28.5], text: "Aerosol fire suppression unit mounted on the inside of the cabinet door." },
        { id: "pack-fire", label: "Pack-level Fire Protection", anchor: [38.5, 50.5], text: "Fire protection at battery-pack level." },
        { id: "relief", label: "Pack Explosion Relief Valve", anchor: [30.3, 51.8], text: "Explosion relief valve on the front of the battery pack." },
        { id: "intake", label: "Intake Valve", anchor: [14.7, 57.0], text: "Lower valve on the inside of the cabinet door — part of the protection architecture." },
      ],
    },
    datasheet: "/datasheets/tcl-blueark-w10-datasheet.pdf",
    sources: [`${TCL_BROCHURE}: Flexible Scalability page`, "TCL Protection Architecture slide", TCL_DECK],
  },
  {
    // Every value from TCL's BlueArk X10 datasheet (model X10-125K-261; public/datasheets/tcl-blueark-x10-datasheet.pdf).
    // Not the W10: the same 125 kW / 261 kWh, but a hybrid — PV input, a built-in generator ATS, on/off-grid
    // transfer < 20 ms and black start. The W10 has no PV input.
    id: "tcl-blueark-x10",
    partner: "tcl",
    name: "BlueArk X10",
    model: "X10-125K-261",
    type: "Hybrid C&I energy storage system",
    applications: ["ci"],
    image: imgX10,
    imageSize: [640, 1099],
    // The resources card's <picture> (AVIF / WebP at 320 and 640 px wide).
    sources: [
      { type: "image/avif", srcSet: `${imgX10Avif320} 320w, ${imgX10Avif640} 640w` },
      { type: "image/webp", srcSet: `${imgX10Webp320} 320w, ${imgX10} 640w` },
    ],
    imageAlt: "TCL BlueArk X10 C&I energy storage cabinet",
    summary: "A 125 kW / 261 kWh hybrid C&I system with PV input (up to 250 kWp at 1500 V, 8 MPPTs) and diesel-generator support.",
    cardSpecs: ["125 kW", "261 kWh"],
    keySpecs: [
      { label: "Rated output power", value: "125 kW" },
      { label: "Rated energy", value: "261 kWh" },
      { label: "Max. PV input", value: "250 kWp" },
      { label: "On/off-grid transfer", value: "<20 ms" },
    ],
    specsNote: "Specifications as listed in TCL's datasheet for model X10-125K-261. Specifications subject to change without notice.",
    specs: {
      system: [
        { label: "Model", value: "X10-125K-261" },
        { label: "Rated output power", value: "125 kW" },
        { label: "Max. output power", value: "125 kVA" },
        { label: "Rated voltage", value: "3L + N + PE, 380 V / 400 V" },
        { label: "Rated frequency", value: "50/60 Hz" },
        { label: "Power factor adjustment range", value: "-0.8 to +0.8" },
        { label: "Total harmonic distortion (THDi)", value: "<3%" },
        { label: "Topology", value: "Transformerless" },
        { label: "Max. PV input power (STC)", value: "250 kWp" },
        { label: "Max. PV input voltage", value: "1500 V" },
        { label: "MPPT voltage range", value: "300–1500 V" },
        { label: "Rated PV input voltage", value: "1050 V" },
        { label: "Start-up voltage", value: "400 V" },
        { label: "MPPTs", value: "Up to 8, with 2 PV strings per MPPT" },
        { label: "Max. PV input current", value: "8 × 40 A" },
        { label: "Max. PV short-circuit current", value: "8 × 55 A" },
        { label: "Off-grid output", value: "125 kVA max.; 1.1 × rated power continuous, 1.55 × rated power for 1 s" },
        { label: "Off-grid THDv (linear load)", value: "<3%" },
        { label: "Generator input", value: "Built-in ATS, 3L + N + PE, 380 V / 400 V, 50/60 Hz" },
        { label: "Grid-tied/off-grid transfer", value: "<20 ms" },
        { label: "ESS–genset transfer", value: "<20 ms, in standalone and parallel operation" },
      ],
      battery: [
        { label: "Battery type", value: "LiFePO4" },
        { label: "Rated energy", value: "261 kWh" },
        { label: "Battery voltage range", value: "728–936 V" },
        { label: "Max. charge/discharge current", value: "179 A" },
        { label: "Cooling", value: "Liquid cooling (battery) / smart air cooling (inverter)" },
      ],
      safety: [
        { label: "PV reverse polarity protection", value: "Integrated" },
        { label: "Anti-islanding protection", value: "Integrated" },
        { label: "AC overcurrent, short-circuit and overvoltage protection", value: "Integrated" },
        { label: "DC switch", value: "Integrated" },
        { label: "DC and AC surge protection", value: "Type II" },
        { label: "Arc-fault detection", value: "Integrated" },
        { label: "Rapid shutdown", value: "Optional" },
      ],
      control: [
        { label: "Communication", value: "Ethernet / RS485 / 4G" },
        { label: "Black start", value: "Supported, even without grid or PV power" },
        { label: "Parallel operation", value: "Multi-unit parallel operation for capacity expansion" },
        { label: "Management", value: "Centralised multi-site management" },
      ],
      installation: [
        { label: "Dimensions (W × D × H)", value: "1420 × 1350 × 2355 mm" },
        { label: "Weight", value: "Approx. 2.45 t" },
        { label: "Ingress protection", value: "Battery compartment IP55; inverter IP66" },
        { label: "Operating temperature", value: "-30 °C to +50 °C (derating from 45 °C to 50 °C)" },
        { label: "Operating humidity", value: "0–95%, non-condensing" },
        { label: "Max. operating altitude", value: "3,000 m" },
        { label: "Design", value: "All-in-one, factory pre-integrated" },
      ],
    },
    highlights: [
      { icon: "Sun", title: "Multi-energy integration", text: "Supports PV and diesel-generator inputs for grid-connected, off-grid and weak-grid applications." },
      { icon: "Zap", title: "High PV compatibility", text: "A 1500 V platform with a 300–1500 V MPPT range and up to 8 MPPTs, 2 strings each." },
      { icon: "Network", title: "Strong off-grid capability", text: "Up to 125 kVA off-grid output, transfer in under 20 ms, and black start without grid or PV power." },
    ],
    compare: {
      capacity: "261 kWh",
      power: "125 kW",
      configuration: "Hybrid all-in-one: PV input, built-in generator ATS",
      cell: "LiFePO4",
      cooling: "Liquid (battery) / smart air (inverter)",
      protection: "Battery IP55 / inverter IP66",
      dimensions: "1420 × 1350 × 2355 mm (W × D × H)",
      weight: "Approx. 2.45 t",
    },
    datasheet: "/datasheets/tcl-blueark-x10-datasheet.pdf",
    sources: ["TCL BlueArk X10 datasheet (model X10-125K-261), pages 1–2"],
  },
  {
    id: "hithium-power-cabinet-1022",
    partner: "hithium",
    name: "∞Power 1022 kWh Cabinet",
    type: "Liquid-cooled cabinet system",
    applications: ["ci", "utility"],
    image: imgCabinet1022,
    imageSize: [640, 900],
    shareImage: "/og/hithium-power-cabinet-1022.jpg",
    imageAlt: "Hithium ∞Power 1022 kWh liquid-cooled energy storage cabinet",
    summary: "A 1022 kWh liquid-cooled cabinet that integrates battery, thermal management and control in a compact footprint.",
    cardSpecs: ["1022 kWh", "Liquid-cooled"],
    keySpecs: [
      { label: "Rated energy", value: "1022 kWh" },
      { label: "Cooling", value: "Liquid-cooled" },
      { label: "Grid connection", value: "400 Vac" },
      { label: "Monitoring", value: "Built-in EMU" },
    ],
    specs: {
      system: [
        { label: "Rated energy", value: "1022 kWh" },
        { label: "Integration", value: "Battery, thermal management and control in one cabinet" },
        { label: "Grid connection", value: "400 Vac, compatible with various PCS models" },
        { label: "Applications", value: "Grid-tied, off-grid and solar-storage hybrid" },
      ],
      control: [
        { label: "Monitoring", value: "Built-in EMU for real-time monitoring and data analysis" },
        { label: "Switching", value: "Automatic on-grid / off-grid switching" },
        { label: "Alerts", value: "Instant alerts for abnormal events and faults" },
      ],
      installation: [
        { label: "Six-cabinet layout", value: "≈6 MWh in a minimum footprint of ≈33.6 m² (6.4 × 5.25 m)" },
        { label: "Land use", value: "Up to 42.3% less than a traditional 5 MWh container solution (Hithium comparison)" },
      ],
    },
    highlights: [
      { icon: "Minimize2", title: "More compact", text: "Battery, thermal management and control integrated in one cabinet." },
      { icon: "LandPlot", title: "Lower land use", text: "Six cabinets deliver ≈6 MWh in ≈33.6 m² — up to 42.3% less land than a traditional 5 MWh container layout." },
      { icon: "Network", title: "Multi-scenario ready", text: "Connects to a 400 Vac grid and works with various PCS models for grid-tied, off-grid and hybrid use." },
      { icon: "Monitor", title: "Smart management", text: "A built-in EMU for real-time monitoring, data analysis and instant fault alerts." },
    ],
    compare: {
      capacity: "1022 kWh",
      configuration: "Cabinet: battery + thermal management + control",
      cooling: "Liquid",
    },
    datasheet: null,
    sources: ["Hithium DC Block 1022kWh EU product material: 1022 Liquid-Cooled Cabinet System and Convenient High Usability pages"],
  },
  {
    id: "hithium-power-5016",
    partner: "hithium",
    name: "∞Power 5.016 MWh",
    type: "Liquid-cooled energy storage platform",
    applications: ["utility"],
    image: hithiumLogo,
    imageSize: [355, 89],
    imageFallback: true,
    listed: false,
    imageAlt: "Hithium logo (product photo not available)",
    summary: "A high-density, liquid-cooled energy storage platform for utility-scale applications.",
    cardSpecs: ["5.016 MWh", "Liquid-cooled"],
    keySpecs: [
      { label: "Rated energy", value: "5.016 MWh" },
      { label: "Cooling", value: "Liquid-cooled" },
    ],
    specsNote: "Detailed specifications for this system are available from NEXERA on request.",
    specs: {
      system: [{ label: "Rated energy", value: "5.016 MWh" }],
      battery: [{ label: "Cooling", value: "Liquid-cooled" }],
    },
    highlights: [],
    compare: {
      capacity: "5.016 MWh",
      cooling: "Liquid",
    },
    datasheet: null,
    sources: [`${HITHIUM_BROCHURE}: Liquid-Cooled Energy Storage System`, HITHIUM_CONTENT],
  },
  {
    id: "hithium-power-625",
    partner: "hithium",
    name: "∞Power 6.25 MWh",
    type: "Liquid-cooled energy storage system",
    applications: ["utility"],
    image: imgPower625,
    imageSize: [1404, 800],
    shareImage: "/og/hithium-power-625.jpg",
    imageAlt: "Hithium ∞Power 6.25 MWh liquid-cooled containerised energy storage system",
    summary: "A 6.25 MWh liquid-cooled system for utility-scale projects, available in 2-hour and 4-hour configurations.",
    cardSpecs: ["6.25 MWh", "2 h | 4 h"],
    keySpecs: [
      { label: "Rated energy", value: "6.25 MWh" },
      { label: "Duration", value: "2 h or 4 h" },
      { label: "Rated voltage", value: "1331.2 V" },
      { label: "Protection", value: "IP55" },
    ],
    specs: {
      system: [
        { label: "Rated energy", value: "6.25 MWh" },
        { label: "Rated voltage", value: "1331.2 V" },
        { label: "2 h configuration", value: "8P416S, 0.5P / 0.5P" },
        { label: "4 h configuration", value: "4P416S, 0.25P / 0.25P" },
      ],
      battery: [{ label: "Cooling", value: "Liquid-cooled" }],
      installation: [
        { label: "Dimensions (L×W×H)", value: "6058 × 2438 × 2896 mm" },
        { label: "Weight", value: "≤48 t" },
        { label: "Protection", value: "IP55" },
        { label: "Format", value: "20-foot container" },
        { label: "Operating temperature", value: "−30 °C to +55 °C" },
      ],
    },
    highlights: [
      { icon: "Gauge", title: "2 h or 4 h", text: "Two duration configurations — 0.5P or 0.25P — from the same 6.25 MWh system." },
      { icon: "Snowflake", title: "Liquid-cooled", text: "A liquid-cooled system at 1331.2 V rated voltage." },
      { icon: "ShieldCheck", title: "IP55", text: "Outdoor protection in a 6058 × 2438 × 2896 mm enclosure." },
    ],
    compare: {
      capacity: "6.25 MWh",
      configuration: "2 h (8P416S) | 4 h (4P416S)",
      cooling: "Liquid",
      protection: "IP55",
      dimensions: "6058 × 2438 × 2896 mm",
      weight: "≤48 t",
    },
    datasheet: null,
    sources: [`${HITHIUM_BROCHURE}: Liquid-Cooled Energy Storage System table`, "Hithium DS ESS ∞Power 6.25MWh 4h datasheet (product image)", HITHIUM_CONTENT],
  },
];

export const getProduct = (id) => PRODUCTS.find((p) => p.id === id);
/** The catalogue as listed on /products (without `listed: false` systems): every "N systems" count uses it. */
export const LISTED_PRODUCTS = PRODUCTS.filter((p) => p.listed !== false);
export const productLabel = (p) => `${partnerOf(p.partner).name} ${p.name}`;
