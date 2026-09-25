/*
 * The NEXERA product catalogue — the single source of truth for /products and /products/:id.
 *
 * NEXERA is the solution provider and distributor; every system here is designed and manufactured
 * by the named technology partner. Nothing below is estimated or rounded: each value is copied from
 * the partner document listed in that product's `sources`. Where a document is silent, the field is
 * simply absent — the UI hides empty groups, highlights and comparison cells rather than filling them.
 *
 * Images are transparent cutouts of the partners' own product renders (src/assets/catalogue/), made
 * from Downloads/TCL_photos.zip, Hithium_photos.zip and CLOU_photos.
 *
 * Not listed, deliberately:
 *   - Hithium 5.016 MWh liquid-cooled ESS: specified in the Hithium brochure, but the only render is
 *     a 288px thumbnail — too small to present as a product image.
 *   - CLOU Aqua-X-261-125-2h: no product image in the CLOU material (its datasheet pages show only a
 *     background and a container that can't be tied to this model).
 *
 * Adding a product: append an entry with the same shape. `specs` groups render as the Technical
 * Information tabs (only non-empty groups show), `keySpecs` are the headline figures, `compare` holds
 * the comparison-table values, and `hotspots` enables the interactive view — only add hotspots whose
 * component names AND locations are confirmed by a partner reference.
 */
import tclLogo from "../assets/partners/tcl-logo.png";
import hithiumLogo from "../assets/partners/hithium-logo.png";
import clouLogo from "../assets/partners/clou-logo.png";
import imgX1 from "../assets/catalogue/tcl-blueark-x1.webp";
import imgX5 from "../assets/catalogue/tcl-blueark-x5.webp";
import imgW10 from "../assets/catalogue/tcl-blueark-w10.webp";
import imgW10Open from "../assets/catalogue/tcl-blueark-w10-open.webp";
import imgBlock261 from "../assets/catalogue/hithium-block-261.webp";
import imgCabinet1022 from "../assets/catalogue/hithium-power-cabinet-1022.webp";
import imgPower625 from "../assets/catalogue/hithium-power-625.webp";
import imgClouC25s from "../assets/catalogue/clou-aqua-c25s.webp";

export const APPLICATIONS = [
  { id: "residential", label: "Residential" },
  { id: "ci", label: "C&I" },
  { id: "utility", label: "Utility" },
];
export const applicationLabel = (id) => APPLICATIONS.find((a) => a.id === id)?.label ?? id;

export const PARTNERS = [
  { id: "tcl", name: "TCL", logo: tclLogo, logoClass: "h-5" },
  { id: "hithium", name: "Hithium", logo: hithiumLogo, logoClass: "h-5" },
  { id: "clou", name: "CLOU", logo: clouLogo, logoClass: "h-7" },
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

export const PRODUCTS = [
  {
    id: "tcl-blueark-x1",
    partner: "tcl",
    name: "BlueArk X1",
    type: "Residential Hybrid Energy Storage System",
    applications: ["residential"],
    image: imgX1,
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
    datasheet: null,
    sources: [`${TCL_BROCHURE}: BlueArk X1, X1 Inverter, X1 Battery, Safety Design and Excellent Performance pages`],
  },
  {
    id: "tcl-blueark-x5",
    partner: "tcl",
    name: "BlueArk X5",
    type: "Industrial Hybrid Energy Storage Solution",
    applications: ["ci"],
    image: imgX5,
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
      ],
      battery: [
        { label: "Battery cell", value: "314 Ah" },
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
    datasheet: null,
    sources: [`${TCL_BROCHURE}: BlueArk X5, All-in-one C&I ESS, Flexible Expansion and Safety & Adaptability pages`],
  },
  {
    id: "tcl-blueark-w10",
    partner: "tcl",
    name: "BlueArk W10",
    type: "Energy Storage Cabinet",
    applications: ["ci"],
    image: imgW10,
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
      ],
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
    },
    // The open-cabinet view is the held final frame of the Home hero footage (this cabinet design);
    // the five points are the same pixel-centroid anchors verified there against TCL's
    // Protection Architecture slide. Only parts visible in this frame are marked.
    hotspots: {
      image: imgW10Open,
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
    datasheet: null,
    sources: [`${TCL_BROCHURE}: Flexible Scalability page`, "TCL Protection Architecture slide"],
  },
  {
    id: "hithium-block-261",
    partner: "hithium",
    name: "∞BLOCK C&I All-in-One ESS",
    model: "HCL 125kW-261kWh-400",
    type: "Liquid-cooled C&I energy storage cabinet",
    applications: ["ci"],
    image: imgBlock261,
    imageAlt: "Hithium ∞BLOCK 261 kWh energy storage cabinet",
    imageNote: "Pictured: Hithium ∞BLOCK 261 kWh cabinet. Exterior may vary by configuration.",
    summary: "A liquid-cooled 261 kWh cabinet with an integrated, adjustable 125 kW PCS for commercial and industrial sites.",
    cardSpecs: ["125 kW", "261 kWh"],
    keySpecs: [
      { label: "Rated energy", value: "261 kWh" },
      { label: "PCS", value: "125 kW (adjustable)" },
      { label: "Battery cell", value: "314 Ah" },
      { label: "Protection", value: "IP55" },
    ],
    specsNote: "Specifications as listed for the HCL 125kW-261kWh-400 C&I all-in-one configuration.",
    specs: {
      system: [
        { label: "Rated energy", value: "261 kWh" },
        { label: "PCS", value: "125 kW (adjustable)" },
        { label: "Rated AC voltage", value: "400 Vac, 3W+N+PE" },
        { label: "Rated charge/discharge", value: "0.5P / 0.5P" },
      ],
      battery: [
        { label: "Cell", value: "314 Ah" },
        { label: "Series-parallel mode", value: "1P260S" },
        { label: "Battery modules", value: "5" },
        { label: "Rated DC voltage", value: "832 V" },
        { label: "Cooling", value: "Liquid-cooled" },
      ],
      installation: [
        { label: "Dimensions (L×W×H)", value: "1000 × 1350 × 2380 mm" },
        { label: "Weight", value: "≤2.7 t" },
        { label: "Protection", value: "IP55" },
      ],
    },
    highlights: [
      { icon: "Snowflake", title: "Liquid-cooled", text: "A liquid-cooled battery built on 314 Ah cells in five modules." },
      { icon: "Cpu", title: "Integrated PCS", text: "An adjustable 125 kW PCS in the same cabinet, connecting at 400 Vac." },
      { icon: "ShieldCheck", title: "Outdoor-rated", text: "IP55 protection in a 1000 × 1350 mm footprint." },
    ],
    compare: {
      capacity: "261 kWh",
      power: "125 kW PCS (adjustable)",
      configuration: "All-in-one with PCS",
      cell: "314 Ah",
      cooling: "Liquid",
      protection: "IP55",
      dimensions: "1000 × 1350 × 2380 mm",
      weight: "≤2.7 t",
    },
    datasheet: null,
    sources: [`${HITHIUM_BROCHURE}: C&I All-in-One Energy Storage System table`, "Hithium DS ESS 261kWh datasheet (product image)"],
  },
  {
    id: "hithium-power-cabinet-1022",
    partner: "hithium",
    name: "∞Power 1022 kWh Cabinet",
    type: "Liquid-cooled cabinet system",
    applications: ["ci", "utility"],
    image: imgCabinet1022,
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
    id: "hithium-power-625",
    partner: "hithium",
    name: "∞Power 6.25 MWh",
    type: "Liquid-cooled energy storage system",
    applications: ["utility"],
    image: imgPower625,
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
    sources: [`${HITHIUM_BROCHURE}: Liquid-Cooled Energy Storage System table`, "Hithium DS ESS ∞Power 6.25MWh 4h datasheet (product image)"],
  },
  {
    id: "clou-aqua-c25s",
    partner: "clou",
    name: "Aqua C2.5S",
    model: "Aqua C2.5S-2089-500-4h",
    type: "Containerised energy storage system",
    applications: ["utility"],
    image: imgClouC25s,
    imageAlt: "CLOU Aqua C2.5S containerised energy storage system",
    summary: "A containerised energy storage system from CLOU for utility-scale applications.",
    cardSpecs: [],
    keySpecs: [
      { label: "Model", value: "Aqua C2.5S-2089-500-4h" },
      { label: "Format", value: "Containerised" },
    ],
    specsNote: "Detailed specifications for this system are available from NEXERA on request.",
    specs: {},
    highlights: [],
    compare: {
      configuration: "Containerised",
    },
    datasheet: null,
    sources: ["CLOU Aqua C2.5S-2089-500-4h IEC datasheet (product image and model designation)"],
  },
];

export const getProduct = (id) => PRODUCTS.find((p) => p.id === id);
export const productLabel = (p) => `${partnerOf(p.partner).name} ${p.name}`;
