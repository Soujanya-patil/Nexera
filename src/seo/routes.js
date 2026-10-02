/*
 * Per-route SEO metadata — the single source of truth for every URL in public/sitemap.xml.
 *
 * Read in two places:
 *   - at runtime by <Seo> (components/Seo.jsx), which renders the route's <title>, description and
 *     canonical so they follow client-side navigation;
 *   - at build time by scripts/seo-pages.mjs, which writes one HTML file per route with these tags
 *     (plus Open Graph / Twitter) already in <head>, for crawlers that don't run JavaScript. That
 *     script also checks every entry against sitemap.xml and the limits below, and fails the build
 *     if anything is off.
 *
 * Positioning: NEXERA is the authorized distributor / solution provider; TCL, Hithium and CLOU design
 * and manufacture the systems. Descriptions only restate what the page itself says.
 *
 * Limits: title < 60 characters, unique, ending "| NEXERA"; description < 155 characters, unique;
 * canonical = SITE_URL + path, no trailing slash (the homepage is the bare domain with its "/").
 */
import { PRODUCTS, partnerOf, productLabel, applicationLabel } from "../data/products";
import { SOLUTION_PAGES, UTILITY_FAQ, CI_FAQ, RESIDENTIAL_FAQ } from "../data/solutions";

export const SITE_URL = "https://nexerapower.com";
export const TITLE_SUFFIX = " | NEXERA";
export const TITLE_MAX = 60;
export const DESCRIPTION_MAX = 155;

/**
 * Any other URL: the server answers with 404.html (a 404 status) and <Seo> renders this title plus
 * a noindex; no description or canonical.
 */
export const NOT_FOUND_TITLE = "Page not found | NEXERA";

/**
 * The Organization for structured data (scripts/seo-pages.mjs puts it on every page). Only facts the
 * site itself states: the address is the Footer's; the site shows no email, phone or social
 * profiles, so none are given. The logo is the NEXERA mark (the wordmark's green X on the ink
 * ground) as the 180x180 public/apple-touch-icon.png, the same mark as public/favicon.svg.
 */
export const ORGANIZATION = {
  name: "NEXERA Powertech",
  description:
    "Authorized distributor and solution provider for TCL, Hithium, CLOU and Midea battery energy storage systems in India, with design, commissioning, training and after-sales support.",
  address: { locality: "Bangalore", region: "Karnataka", country: "IN" },
  logo: "/apple-touch-icon.png",
};

/** 1200x630 share image (public/og-default.jpg): the NEXERA wordmark and cabinet on the dark green. */
export const DEFAULT_OG_IMAGE = "/og-default.jpg";
/** A product page shares its own product image only if it is at least this wide (checked at build). */
export const OG_IMAGE_MIN_WIDTH = 600;

const PAGES = [
  {
    path: "/",
    title: "Battery Energy Storage Systems (BESS) in India | NEXERA",
    description:
      "Authorized distributor of TCL, Hithium, CLOU and Midea battery energy storage systems (BESS) in India — for residential, C&I and utility-scale projects.",
  },
  {
    path: "/solutions",
    title: "BESS Solutions for Homes, C&I and Utility-Scale | NEXERA",
    description:
      "Battery energy storage for Indian homes, C&I sites and utility-scale projects — TCL, Hithium, CLOU and Midea systems supplied by NEXERA.",
  },
  // The three Solutions pages: breadcrumb Home > Solutions > page (`crumbs`, after Home), and an FAQ
  // whose text the page renders from the same data (data/solutions.js) — written as FAQPage data.
  {
    path: SOLUTION_PAGES.utility.path,
    title: "Utility-Scale Battery Energy Storage (BESS) India | NEXERA",
    description:
      "Grid-scale BESS from Hithium and CLOU for solar, wind and grid projects in India, with sizing, engineering and commissioning support from NEXERA.",
    crumbs: [["Solutions", "/solutions"], [SOLUTION_PAGES.utility.label, SOLUTION_PAGES.utility.path]],
    faq: UTILITY_FAQ,
  },
  {
    path: SOLUTION_PAGES.ci.path,
    title: "C&I Battery Energy Storage Systems in India | NEXERA",
    description:
      "C&I battery energy storage for peak shaving, solar self-consumption and backup power. TCL, Hithium and CLOU systems, with project engineering by NEXERA.",
    crumbs: [["Solutions", "/solutions"], [SOLUTION_PAGES.ci.label, SOLUTION_PAGES.ci.path]],
    faq: CI_FAQ,
  },
  {
    path: SOLUTION_PAGES.residential.path,
    title: "Home Battery Storage & Solar Solutions in India | NEXERA",
    description:
      "Home battery storage from Midea and TCL: use solar after sunset, keep essential loads running in outages and cut grid dependence. Supplied by NEXERA.",
    crumbs: [["Solutions", "/solutions"], [SOLUTION_PAGES.residential.label, SOLUTION_PAGES.residential.path]],
    faq: RESIDENTIAL_FAQ,
  },
  {
    path: "/products",
    title: "Energy Storage Systems — TCL, Hithium & CLOU | NEXERA",
    description:
      "Explore and compare TCL, Hithium and CLOU battery energy storage systems for residential, C&I and utility-scale projects, available in India via NEXERA.",
  },
  {
    path: "/become-a-partner",
    title: "BESS Partnership for EPCs in India | NEXERA",
    description:
      "EPCs get authorized access to TCL, Hithium and CLOU battery storage through NEXERA — with design, commissioning, training and after-sales support.",
  },
  {
    path: "/about",
    title: "About Us — Built by an EPC, for EPCs | NEXERA",
    description:
      "NEXERA is an authorized TCL, Hithium, CLOU and Midea partner built by EPCs, with design and commissioning support and a Kalaburagi training center.",
  },
  {
    path: "/how-it-works",
    title: "How It Works — The Distributor Journey | NEXERA",
    description:
      "From first call to fully operational distributor: market review, product training, sizing and commissioning support, then after-sales and warranty.",
  },
  {
    path: "/service-training",
    title: "BESS Service, Support & Technician Training | NEXERA",
    description:
      "Design and commissioning support, after-sales and warranty service, and hands-on technician training at NEXERA's Kalaburagi training center.",
  },
  {
    path: "/where-we-operate",
    title: "Where We Operate in India | NEXERA",
    description:
      "NEXERA is headquartered in Bangalore, with a regional office and technician training center in Kalaburagi, and planned expansion to Nagpur and Delhi.",
  },
  {
    path: "/resources",
    title: "BESS Datasheets, FAQs & Insights | NEXERA",
    description:
      "Battery energy storage datasheets and brochures, answers to common BESS questions, and news and insights from NEXERA for projects in India.",
  },
  {
    path: "/contact",
    title: "Contact Us — Energy Storage Enquiries | NEXERA",
    description:
      "Talk to NEXERA about battery energy storage for your home, business or project. Tell us what you need and we'll route it to the right team.",
  },
];

/** The first candidate that fits the limit (candidates are ordered most to least informative). */
const firstFitting = (candidates, max) => candidates.find((c) => c.length < max) ?? candidates[candidates.length - 1];

/**
 * Product pages, built from the catalogue (partner brand + product name + the catalogue's own type,
 * applications and summary) — adding a product to data/products.js adds its entry.
 */
function productPage(p) {
  const brand = partnerOf(p.partner).name;
  const label = productLabel(p); // "TCL BlueArk X1"
  const shortType = p.type.replace(/energy storage system/i, "ESS");
  const apps = p.applications.map(applicationLabel).join(" & ");
  const supplied = ` Supplied in India by NEXERA, authorized ${brand} distributor.`;
  const available = " Available in India through NEXERA.";
  return {
    path: `/products/${p.id}`,
    title: firstFitting(
      [`${label} — ${shortType}${TITLE_SUFFIX}`, `${label} — ${apps} Energy Storage${TITLE_SUFFIX}`, `${label}${TITLE_SUFFIX}`],
      TITLE_MAX
    ),
    // The product's own summary sentence where it fits, otherwise its type.
    description: firstFitting(
      [
        `${label}: ${p.summary}${supplied}`,
        `${label}: ${p.summary}${available}`,
        `${label} — ${p.type}.${supplied}`,
        `${label} — ${p.type}.${available}`,
      ],
      DESCRIPTION_MAX
    ),
    // Candidate only: the build keeps it if the image is at least OG_IMAGE_MIN_WIDTH wide. A product
    // without a photo (`imageFallback`: its `image` is the partner's logo) shares the default image.
    ogImage: p.imageFallback ? DEFAULT_OG_IMAGE : p.image,
    // Structured data (Product): only what the catalogue states. The brand is the partner that makes
    // it — never NEXERA — and there are no offers, prices, ratings or specs; no image without a photo.
    product: { name: label, description: p.summary, image: p.imageFallback ? null : p.image, brand },
  };
}

const afterProducts = PAGES.findIndex((r) => r.path === "/products") + 1;
export const ROUTES = [...PAGES.slice(0, afterProducts), ...PRODUCTS.map(productPage), ...PAGES.slice(afterProducts)].map((r) => ({
  ogImage: DEFAULT_OG_IMAGE,
  ...r,
  canonical: SITE_URL + r.path,
}));

/** The route for a pathname ("/about" or "/about/"), or undefined. */
export function getRoute(pathname) {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return ROUTES.find((r) => r.path === path);
}
