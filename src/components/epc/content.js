/*
 * For EPCs — page content. Every statement here restates something the site already establishes
 * (About, Become a Partner, How It Works, Service & Training, Where We Operate, the Home "Why
 * NEXERA" steps, and the product data). Nothing is added: no counts, capacities, certifications,
 * response times or guarantees. NEXERA is the authorized partner and solution provider — TCL,
 * Hithium and CLOU design and manufacture the systems.
 *
 * Sources, by claim:
 *   authorized TCL / Hithium / CLOU access, no separate brand negotiation  About, Become a Partner
 *   add storage without building a supply chain from scratch             Become a Partner
 *   engineers on sizing, single-line diagrams, on-site commissioning      Service & Training
 *   "our engineers work your first sizing and commissioning with you"     Become a Partner, Resources
 *   after-sales, warranty handling, "we manage the OEM relationship"      Become a Partner, Service & Training
 *   technician training on live TCL and Hithium hardware in Kalaburagi    Service & Training
 *   region formally mapped and protected once onboarded                   Become a Partner
 *   "Built by an EPC, for EPCs" / site-level problem                      About
 *   offices: Bangalore HQ, Kalaburagi regional office, Nagpur + Delhi planned  Where We Operate, Footer
 */
import {
  Boxes,
  ClipboardCheck,
  DraftingCompass,
  GraduationCap,
  PlugZap,
  Route,
  SlidersHorizontal,
  Wrench,
  TrendingUp,
  Truck,
} from "lucide-react";

/** Hero → "why partner" lifecycle strip, in project order. */
export const LIFECYCLE = [
  "Technology access",
  "Product selection",
  "Design support",
  "Project execution",
  "Commissioning",
  "Training",
  "After-sales",
  "Long-term partnership",
];

/**
 * Partnership journey. `image` is a scene photo (lib/scenes) or a catalogue cutout (`cutout`), shown
 * as the stage's visual — partner product imagery, never presented as a NEXERA project.
 */
export const JOURNEY = [
  {
    n: "01",
    title: "Select",
    icon: SlidersHorizontal,
    copy: "Choose from TCL, Hithium and CLOU systems across residential, C&I and utility-scale.",
    detail:
      "Direct, authorized access to our technology partners' storage — the right system sized to your load, with no separate brand negotiation on your side.",
    scene: "storage-tcl",
    alt: "TCL BlueArk energy storage range: battery modules, floor-standing cabinets, wall-mounted units and inverters",
  },
  {
    n: "02",
    title: "Design",
    icon: DraftingCompass,
    copy: "Sizing and single-line diagrams, worked with our engineers.",
    detail: "Every partner gets our engineering team for sizing and single-line diagrams — we work your first system design with you.",
    scene: "tech-cabinet",
    alt: "Hithium battery cabinet with its doors open, showing stacked liquid-cooled battery modules",
  },
  {
    n: "03",
    title: "Deploy",
    icon: Truck,
    copy: "Add battery storage without building a supply chain from scratch.",
    detail: "Your systems come through NEXERA as an authorized TCL, Hithium and CLOU partner, so your team can focus on the project on site.",
    scene: "utility-yard",
    alt: "Rows of Hithium battery storage containers at a large storage site",
  },
  {
    n: "04",
    title: "Commission",
    icon: PlugZap,
    copy: "On-site commissioning support from our engineers.",
    detail: "Our engineers work your first commissioning with you, on site — as part of onboarding, not as a one-off session.",
    cutout: "tcl-blueark-w10",
    alt: "TCL BlueArk W10 cabinet with its door open, showing battery packs and protection components",
  },
  {
    n: "05",
    title: "Support",
    icon: Wrench,
    copy: "After-sales and warranty handling — we manage the OEM relationship.",
    detail: "After-sales support is included, so warranty issues don't become your problem. Local-first warranty handling keeps your customer relationship intact.",
    scene: "hithium-block",
    alt: "Hithium DC block battery cabinet",
  },
  {
    n: "06",
    title: "Scale",
    icon: TrendingUp,
    copy: "Grow into new projects with a protected territory.",
    detail: "Once you're onboarded, your region is formally mapped and protected — and technician training in Kalaburagi helps your team take on more storage work.",
    scene: "energy-night",
    alt: "City at night seen from above, its lights forming a connected network",
  },
];

/** "One partner. Through the project." capability cards. */
export const CAPABILITIES = [
  {
    title: "Technology Partners",
    icon: Boxes,
    copy: "Authorized access to TCL, Hithium and CLOU battery storage technology.",
    to: "/products",
    cta: "View products",
  },
  {
    title: "Product Selection",
    icon: SlidersHorizontal,
    copy: "The right system sized to your load, residential through utility scale.",
    to: "/products",
    cta: "Explore systems",
  },
  {
    title: "Design Support",
    icon: DraftingCompass,
    copy: "Our engineers support sizing and single-line diagrams for your project.",
    to: "/service-training",
    cta: "Service & training",
  },
  {
    title: "Commissioning",
    icon: ClipboardCheck,
    copy: "Hands-on, on-site commissioning support alongside your team.",
    to: "/service-training",
    cta: "Service & training",
  },
  {
    title: "Training",
    icon: GraduationCap,
    copy: "Technicians train on live TCL and Hithium hardware in Kalaburagi.",
    to: "/service-training",
    cta: "Training center",
  },
  {
    title: "After-Sales Support",
    icon: Wrench,
    copy: "Warranty handling and after-sales — we manage the OEM relationship.",
    to: "/service-training",
    cta: "After-sales",
  },
];

/** Scroll story: project requirement → BESS system → deployment → support. */
export const STORY = [
  {
    label: "Project requirement",
    title: "It starts with your site.",
    copy: "The load, the application and the scale — residential, commercial & industrial or utility.",
  },
  {
    label: "BESS system",
    title: "The right system for it.",
    copy: "Selected from TCL, Hithium and CLOU storage, and sized to your load with our engineers.",
  },
  {
    label: "Deployment",
    title: "Designed and commissioned.",
    copy: "Single-line diagrams and on-site commissioning support as the system goes in.",
  },
  {
    label: "Support",
    title: "Supported after handover.",
    copy: "Technician training, after-sales and warranty handling — we manage the OEM relationship.",
  },
];

/** "A BESS partner built around your project" value points. */
export const VALUES = [
  {
    title: "Technology Access",
    icon: Boxes,
    copy: "Direct, authorized access to TCL, Hithium and CLOU — no separate brand negotiation on your side.",
  },
  {
    title: "Design & Technical Support",
    icon: DraftingCompass,
    copy: "Not just sales — our engineers work your first sizing and commissioning with you.",
  },
  {
    title: "Built by EPCs",
    icon: Route,
    copy: "Founded by a solar EPC team that understands the site-level problem of getting storage into Indian projects.",
  },
  {
    title: "Long-Term Service",
    icon: Wrench,
    copy: "After-sales support included, so warranty issues don't become your problem. We manage the OEM relationship.",
  },
];

/**
 * Offices, as listed on Where We Operate and in the Footer. `lat`/`lon` place the point on the
 * network schematic (true relative positions, no country outline is drawn).
 */
export const OFFICES = [
  { id: "delhi", city: "Delhi", role: "Planned expansion", detail: "", status: "planned", lat: 28.61, lon: 77.21 },
  { id: "nagpur", city: "Nagpur", role: "Planned expansion", detail: "", status: "planned", lat: 21.15, lon: 79.09 },
  {
    id: "kalaburagi",
    city: "Kalaburagi (Gulbarga)",
    role: "Regional office",
    detail: "Service support and technician training center",
    status: "active",
    lat: 17.33,
    lon: 76.83,
  },
  {
    id: "bangalore",
    city: "Bangalore",
    role: "Headquarters",
    detail: "Strategy, brand partnerships and sales support",
    status: "active",
    lat: 12.97,
    lon: 77.59,
  },
];

export const ENQUIRY_TYPES = ["EPC / Project Partnership", "Distributor application"];
export const COMPANY_TYPES = ["EPC", "Project developer", "Other"];
export const PROJECT_APPLICATIONS = [
  { id: "residential", label: "Residential" },
  { id: "ci", label: "Commercial & Industrial" },
  { id: "utility", label: "Utility-Scale" },
  { id: "multiple", label: "More than one / not sure yet" },
];
