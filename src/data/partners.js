/*
 * Partner pages (/partners/:id, pages/Partner.jsx) — one entry per technology partner. Their titles
 * and descriptions are in src/seo/routes.js with every other page's.
 *
 * Content rule: nothing here is new. Every sentence and figure is copied word for word from a page
 * the site already has (source noted on each), and the systems come from the catalogue
 * (data/products.js). NEXERA is the authorized distributor and solutions partner; the partners design
 * and manufacture the systems. The FAQ text is built here once, so the visible FAQ and the page's
 * FAQPage structured data are the same words.
 */
import { PRODUCTS, partnerOf } from "./products";

/** The hero's one line, for every partner (the partner-page brief). */
export const PARTNER_LINE = "Available in India through NEXERA Powertech, an authorized distributor and solutions partner.";

export const PARTNER_PAGES = [
  {
    id: "hithium",
    name: "Hithium",
    interest: "ci", // the homepage contact form's "I'm interested in" for this page's Contact Us
    about: {
      copy: [
        // Utility-Scale page, Hithium card
        "Hithium is a specialist energy-storage company focused on battery cells, battery systems and large-scale energy storage.",
        // C&I page, Hithium card
        "Founded in 2019, Hithium focuses specifically on energy-storage batteries and systems, supplying customers in 40+ countries and regions.",
        // Utility-Scale page, Hithium card
        "Its utility portfolio includes 5 MWh-class and 6.25 MWh-class liquid-cooled systems, designed for high-density, long-duration applications.",
      ],
      // Utility-Scale page, Hithium card
      stats: [
        ["56.6 GWh", "energy-storage battery sales (2025)"],
        ["10.1 GWh", "energy-storage system sales (2025)"],
        ["4,700+", "global patents and patent applications"],
        ["40+", "countries and regions"],
      ],
    },
  },
  {
    id: "tcl",
    name: "TCL",
    interest: "ci",
    about: {
      copy: [
        // Residential page, TCL card
        "TCL has built capabilities across the PV value chain and expanded into energy storage, including PV, inverters and energy-storage systems.",
        // C&I page, TCL card
        "TCL's energy-storage portfolio covers residential, C&I and energy-management solutions, including the BlueArk X5 and BlueArk W10.",
      ],
      // C&I page, TCL card
      stats: [
        ["RMB 354+ billion", "total revenue (2025)"],
        ["160,000+", "employees"],
        ["1.3 billion+", "global users"],
        ["160+", "countries and regions"],
        ["RMB 60+ billion", "R&D investment (last six years)"],
        ["114,597", "patent applications"],
      ],
    },
  },
  {
    id: "clou",
    name: "CLOU",
    interest: "ci",
    about: {
      copy: [
        // C&I page, CLOU card
        "Founded in 1996, CLOU entered the energy-storage sector in 2009. Part of the Midea Group, it has developed its own BMS, PCS, EMS and battery-system technologies.",
      ],
      stats: [
        // C&I page, CLOU card
        ["16 GWh", "contracted and delivered systems"],
        ["8.6 GWh", "contracted and installed outside China"],
        ["100+", "countries active"],
        // Utility-Scale page, CLOU card
        ["30+ years", "in power electronics"],
      ],
    },
  },
  {
    id: "midea",
    name: "Midea",
    interest: "home",
    about: {
      copy: [
        // Residential page, Midea card: its heading, then its text
        "Midea — A global technology group founded in 1968.",
        "Midea operates across Smart Home, Industrial Technology, Building Technology, Robotics & Automation, Healthcare, Logistics and New Energy. Its New Energy business includes residential energy storage, inverters, distributed PV and utility/C&I energy storage.",
      ],
      // Residential page, Midea card
      stats: [
        ["US$64.3 billion", "revenue (2025)"],
        ["~190,000", "employees"],
        ["65", "production centres"],
        ["41", "R&D centres"],
        ["#231", "in the 2026 Fortune Global 500"],
      ],
    },
  },
];

export const getPartnerPage = (id) => PARTNER_PAGES.find((p) => p.id === id);
export const partnerProducts = (id) => PRODUCTS.filter((p) => p.partner === id);

/** "a, b, c and d" */
const listOf = (items) => (items.length > 1 ? `${items.slice(0, -1).join(", ")} and ${items.at(-1)}` : items[0]);

/**
 * "Why buy {Partner} through NEXERA": four points, each line from an existing page — About ("Why
 * Nexera"), Become a Partner ("Design & Technical Support") and Service & Training (After-Sales).
 */
export const PARTNER_WHY = [
  { title: "Authorized access", text: "Authorized TCL, Hithium, CLOU and Midea partner" },
  { title: "Design and sizing support", text: "Not just sales — our engineers work your first sizing and commissioning with you." },
  { title: "Technician training", text: "Hands-on technician training center in Kalaburagi" },
  { title: "After-sales and warranty", text: "Local-first warranty handling — we manage the OEM relationship so your customer relationship stays intact." },
];

/**
 * The page's FAQ, also its FAQPage data. Answers only restate the hero line, the Organization
 * description ("…with design, commissioning, training and after-sales support") and the catalogue's
 * product names; Midea's systems are "residential energy storage, by enquiry", as the site says.
 */
export function partnerFaq(id) {
  const page = getPartnerPage(id);
  const products = partnerProducts(id);
  const brand = partnerOf(id)?.name ?? page.name;
  const what = products.length ? `${brand} systems are` : `${brand} residential energy storage is`;
  return [
    {
      q: `Is ${page.name} available in India, and who supports it?`,
      a: `Yes. ${what} available in India through NEXERA Powertech, an authorized distributor and solutions partner, with design, commissioning, training and after-sales support.`,
    },
    {
      q: `Which ${page.name} systems does NEXERA offer?`,
      a: products.length
        ? `NEXERA offers these ${brand} systems: ${listOf(products.map((p) => p.name))}.`
        : `NEXERA offers ${brand} residential energy storage, by enquiry.`,
    },
  ];
}
