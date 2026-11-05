/*
 * For EPCs — page content. Every statement here restates something the site already establishes
 * (About, Become a Partner, How It Works, Service & Training, Where We Operate, the Home "Why
 * NEXERA" steps, and the product data). Nothing is added: no counts, capacities, certifications,
 * response times or guarantees. NEXERA is the authorised partner and solution provider — TCL
 * and Hithium design and manufacture the systems.
 *
 * Sources, by claim:
 *   authorised TCL / Hithium access, no separate brand negotiation  About, Become a Partner
 *   add storage without building a supply chain from scratch             Become a Partner
 *   engineers on sizing, single-line diagrams, on-site commissioning      Service & Training
 *   "our engineers work your first sizing and commissioning with you"     Become a Partner, Resources
 *   after-sales, warranty handling, "we manage the OEM relationship"      Become a Partner, Service & Training
 *   technician training on live TCL and Hithium hardware in Kalaburagi, from 2027  Service & Training
 *   region formally mapped and protected once onboarded                   Become a Partner
 *   "Built by an EPC, for EPCs" / site-level problem                      About
 *   offices: Bengaluru head office, Kalaburagi training centre opening 2027  Where We Operate, Footer
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
 * Partnership journey. `photo` names the stage photo (journeyImages.js). `focus` is the object-position
 * that keeps the people and equipment in frame when the photo is cropped to the desktop gallery's
 * square cards (phones show each photo whole).
 */
export const JOURNEY = [
  {
    n: "01",
    title: "Select",
    icon: SlidersHorizontal,
    copy: "Choose from TCL and Hithium systems across residential, C&I and utility-scale.",
    detail:
      "Direct, authorised access to our technology partners' storage — the right system sized to your load, with no separate brand negotiation on your side.",
    photo: "select",
    focus: "60% 50%",
    alt: "Consultant presenting battery storage options to a business owner",
  },
  {
    n: "02",
    title: "Design",
    icon: DraftingCompass,
    copy: "Sizing and single-line diagrams, worked with our engineers.",
    detail: "Every partner gets our engineering team for sizing and single-line diagrams — we work your first system design with you.",
    photo: "design",
    focus: "45% 50%",
    alt: "Engineers reviewing an electrical design for a battery storage system",
  },
  {
    n: "03",
    title: "Deploy",
    icon: Truck,
    copy: "Add battery storage without building a supply chain from scratch.",
    detail: "Your systems come through NEXERA as an authorised TCL and Hithium partner, so your team can focus on the project on site.",
    photo: "deploy",
    focus: "80% 50%",
    alt: "Crane placing a battery storage container on site",
  },
  {
    n: "04",
    title: "Commission",
    icon: PlugZap,
    copy: "On-site commissioning support from our engineers.",
    detail: "Our engineers work your first commissioning with you, on site — as part of onboarding, not as a one-off session.",
    photo: "commission",
    focus: "15% 50%",
    alt: "Engineer commissioning a battery cabinet with a laptop",
  },
  {
    n: "05",
    title: "Support",
    icon: Wrench,
    copy: "After-sales and warranty handling — we manage the OEM relationship.",
    detail: "After-sales support is included, so warranty issues don't become your problem. Local-first warranty handling keeps your customer relationship intact.",
    photo: "support",
    focus: "10% 50%",
    alt: "Technician servicing a home battery with the homeowner",
  },
  {
    n: "06",
    title: "Scale",
    icon: TrendingUp,
    copy: "Grow into new projects with a protected territory.",
    detail: "Once you're onboarded, your region is formally mapped and protected — and from 2027, technician training in Kalaburagi will help your team take on more storage work.",
    photo: "scale",
    focus: "50% 60%",
    alt: "Aerial view of a solar farm with battery storage containers",
  },
];

/** "One partner. Through the project." capability cards. */
export const CAPABILITIES = [
  {
    title: "Technology Partners",
    icon: Boxes,
    copy: "Authorised access to TCL and Hithium battery storage technology.",
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
    copy: "From 2027, technicians will train on live TCL and Hithium hardware in Kalaburagi.",
    to: "/service-training",
    cta: "Training centre",
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
    copy: "Selected from TCL and Hithium storage, and sized to your load with our engineers.",
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
    copy: "A lithium battery distributorship with direct, authorised access to TCL and Hithium — no separate brand negotiation on your side.",
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
  {
    id: "kalaburagi",
    city: "Kalaburagi (Gulbarga)",
    role: "Technician training centre",
    detail: "",
    status: "opening",
    lat: 17.33,
    lon: 76.83,
  },
  {
    id: "bangalore",
    city: "Bengaluru",
    role: "Head office",
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
