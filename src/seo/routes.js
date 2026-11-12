/*
 * Per-route SEO metadata — the single source of truth for every URL (the build writes dist/sitemap.xml
 * from it: every route except a `noindex` one).
 *
 * Read in two places:
 *   - at runtime by <Seo> (components/Seo.jsx), which renders the route's <title>, description and
 *     canonical so they follow client-side navigation;
 *   - at build time by scripts/seo-pages.mjs, which writes one HTML file per route with these tags
 *     (plus Open Graph / Twitter) already in <head>, for crawlers that don't run JavaScript. That
 *     script also checks every entry against the limits below (and that every path is lowercase),
 *     and fails the build if anything is off.
 *
 * Positioning: NEXERA is the authorised distributor / solution provider; TCL and Hithium design
 * and manufacture the systems. Descriptions only restate what the page itself says.
 *
 * Limits: title < 60 characters, unique, ending "| NEXERA"; description < 155 characters, unique;
 * canonical = SITE_URL + path, no trailing slash (the homepage is the bare domain with its "/").
 *
 * `label`: the page's short name (as in the nav) for its breadcrumb in structured data, where the
 * title is written for search results; without one, the breadcrumb uses the title minus " | NEXERA".
 *
 * `h1`: the page's one heading, as it renders. The build checks each pre-rendered page has exactly this
 * one <h1> (scripts/seo-pages.mjs), so a page that stops rendering its heading fails the build.
 */
import { PRODUCTS, partnerOf, productLabel, applicationLabel } from "../data/products";
import { SOLUTION_PAGES, UTILITY_FAQ, CI_FAQ, RESIDENTIAL_FAQ } from "../data/solutions";
import { SERVICE_TRAINING_FAQ } from "../data/serviceTraining";
import { partnerFaq } from "../data/partners";
import { ARTICLES, DRAFT_ARTICLES } from "../data/articles";
import { BENGALURU_FAQ, BENGALURU_PATH } from "../data/locations";
import { productPage as productContent } from "../data/productPages";
import { ADDRESS_PARTS, BUSINESS_NAME, EMAIL, HOURS, PHONE } from "../data/business";
import { HOME_FAQ } from "../data/home";

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
 * site itself states: the address and phone are the Footer's (data/business, as on the Google
 * Business Profile), and the email is the one the site shows (sales@nexerapower.com); no social profiles. On the homepage,
 * the contact page and the Bengaluru page (`localBusiness` routes) the same node is also the
 * LocalBusiness, with the opening hours. Every page names the business the same way (structured data
 * only; the visible brand is unchanged): name and legalName "Nexera Powertech Private Limited" (the
 * footer's legal line; the director's Final Copy) and, as alternateName, the site's brand name, the
 * Business Profile's name ("NexEra PowerTech Pvt Ltd") and its earlier spelling. The phone is written
 * +91-97423-53341. The logo is the NEXERA wordmark (the header's own file, src/assets/brand/
 * nexera-logo.svg) at a stable address, public/nexera-logo.svg.
 */
export const LOCAL_BUSINESS = { hours: HOURS };
/** The site's own name (the homepage's WebSite node): the visible brand, not the business name. */
export const SITE_NAME = "NEXERA Powertech";
export const ORGANIZATION = {
  name: "Nexera Powertech Private Limited",
  legalName: "Nexera Powertech Private Limited",
  alternateName: [SITE_NAME, "NexEra PowerTech Pvt Ltd", BUSINESS_NAME],
  description:
    "Authorised distributor and solution provider for TCL and Hithium battery energy storage systems in India, with design, commissioning, training and after-sales support.",
  address: ADDRESS_PARTS,
  // "+91 97423 53341" → "+91-97423-53341".
  telephone: PHONE.replace(/\s+/g, "-"),
  email: EMAIL,
  logo: "/nexera-logo.svg",
};

/** 1200x630 share image (public/og-default.jpg): the NEXERA wordmark and cabinet on the dark green. */
export const DEFAULT_OG_IMAGE = "/og-default.jpg";
/** A product page shares its own product image only if it is at least this wide (checked at build). */
export const OG_IMAGE_MIN_WIDTH = 600;

const PAGES = [
  {
    path: "/",
    localBusiness: true,
    h1: "Battery Energy Storage Systems (BESS) for India’s Homes, Businesses and Grids",
    faq: HOME_FAQ,
    title: "BESS in India: TCL & Hithium Energy Storage | Nexera",
    description:
      "Authorised TCL and Hithium distributor in India. Battery energy storage for homes, businesses and utilities, with design, commissioning and service.",
  },
  {
    path: "/solutions",
    h1: "Storage built for how you'll actually use it",
    label: "Solutions",
    title: "Energy Storage Solutions: Home, C&I & Utility | NEXERA",
    description:
      "Energy storage solutions for Indian homes, C&I sites and utility-scale projects: TCL and Hithium battery storage systems supplied by NEXERA.",
  },
  // The three Solutions pages: breadcrumb Home > Solutions > page (`crumbs`, after Home), and an FAQ
  // whose text the page renders from the same data (data/solutions.js) — written as FAQPage data.
  {
    path: SOLUTION_PAGES.utility.path,
    h1: "Utility-Scale Energy Storage Powering the Grid of Tomorrow.",
    title: "Utility-Scale BESS in India | Hithium DC Blocks | Nexera",
    description:
      "Hithium containerised battery storage for grid-connected projects in India, including the 6.25 MWh system. Supplied and supported by Nexera.",
    crumbs: [["Solutions", "/solutions"], [SOLUTION_PAGES.utility.label, SOLUTION_PAGES.utility.path]],
    faq: UTILITY_FAQ,
  },
  {
    path: SOLUTION_PAGES.ci.path,
    h1: "Commercial & Industrial Energy Solutions Power Your Business. Smarter.",
    title: "C&I Battery Energy Storage in India | Nexera Powertech",
    description:
      "Cut peak-hour power costs and diesel use with commercial and industrial battery storage from TCL and Hithium. Sizing and commissioning included.",
    crumbs: [["Solutions", "/solutions"], [SOLUTION_PAGES.ci.label, SOLUTION_PAGES.ci.path]],
    faq: CI_FAQ,
  },
  {
    path: SOLUTION_PAGES.residential.path,
    h1: "Residential Energy Solutions Power Your Home. Smarter.",
    title: "Home Battery Storage in India | TCL | Nexera Powertech",
    description:
      "Store your solar power for evenings and outages with TCL home battery storage. Supplied and supported in India by Nexera Powertech.",
    crumbs: [["Solutions", "/solutions"], [SOLUTION_PAGES.residential.label, SOLUTION_PAGES.residential.path]],
    faq: RESIDENTIAL_FAQ,
  },
  {
    path: "/products",
    h1: "Energy Storage, Built to Scale.",
    label: "Products",
    title: "BESS Products — TCL & Hithium Energy Storage | NEXERA",
    description:
      "Explore and compare TCL and Hithium battery energy storage systems for residential, C&I and utility-scale projects, available in India via NEXERA.",
  },
  // Partner pages (pages/Partner.jsx, content in data/partners.js): breadcrumb Home > Products >
  // partner, and an FAQ built from the catalogue — written as FAQPage data.
  ...[
    [
      "hithium",
      "Hithium",
      "Hithium Energy Storage in India | Cabinets & DC Blocks",
      "Hithium C&I cabinets and utility-scale DC blocks, supplied in India with design support and service by Nexera Powertech.",
    ],
    [
      "tcl",
      "TCL",
      "TCL Battery Storage in India | BlueArk X5, W10 | Nexera",
      "TCL BlueArk commercial and industrial storage and TCL home batteries, supplied in India with local spares and service by Nexera Powertech.",
    ],
  ].map(([id, name, title, description]) => ({
    path: `/partners/${id}`,
    h1: `${name} energy storage in India`,
    label: name,
    title,
    description,
    crumbs: [["Products", "/products"], [name, `/partners/${id}`]],
    faq: partnerFaq(id),
  })),
  {
    path: "/become-a-partner",
    h1: "Become a BESS Distributor Build More. Store Smarter.",
    label: "Become a Partner",
    title: "Become a BESS Distributor or EPC Partner in India | Nexera",
    description:
      "Join Nexera Powertech as an EPC or distributor. Get TCL and Hithium storage, project sizing, installer training and warranty-claim support.",
  },
  {
    path: "/about",
    label: "About",
    h1: "Built by an EPC, for EPCs",
    title: "About Us — Built by an EPC, for EPCs | NEXERA",
    description:
      "NEXERA is an authorised TCL and Hithium partner built by EPCs, with design and commissioning support and a Kalaburagi training centre opening 2027.",
  },
  {
    path: "/how-it-works",
    label: "How It Works",
    h1: "From First Call to Fully Operational Distributor",
    title: "How to Become a BESS Distributor in India | NEXERA",
    description:
      "How NEXERA's BESS distributor partnership works, step by step: from application and onboarding to technician training, commissioning and support.",
  },
  {
    path: "/service-training",
    h1: "We don't just supply the battery. We train the hands that install it.",
    label: "Service & Training",
    title: "BESS Installation, Commissioning & Training | NEXERA",
    description:
      "BESS installation and commissioning support, sizing, warranty service and technician training at NEXERA's Kalaburagi training centre from 2027.",
    faq: SERVICE_TRAINING_FAQ,
  },
  {
    path: "/where-we-operate",
    h1: "A growing footprint across India",
    label: "Where We Operate",
    title: "Where We Operate in India | Nexera Powertech",
    description:
      "NEXERA's head office is in Bengaluru, Karnataka, with a technician training centre opening in Kalaburagi in 2027.",
  },
  // The Bengaluru location page (pages/LocationBengaluru.jsx, content in data/locations.js): the same
  // LocalBusiness node as Home and Contact, breadcrumb Home > Where We Operate > Bengaluru, and its FAQ.
  {
    path: BENGALURU_PATH,
    localBusiness: true,
    h1: "Battery Energy Storage in Bengaluru & Karnataka",
    label: "Bengaluru",
    title: "Battery Energy Storage in Bengaluru | Nexera Powertech",
    description:
      "Nexera Powertech in Bengaluru: TCL and Hithium battery storage, design support and service for Karnataka projects.",
    crumbs: [["Where We Operate", "/where-we-operate"], ["Bengaluru", BENGALURU_PATH]],
    faq: BENGALURU_FAQ,
  },
  {
    path: "/resources",
    h1: "Datasheets, answers, and the latest from Nexera",
    label: "Resources",
    title: "BESS Guides, Datasheets & FAQs | NEXERA",
    description:
      "Battery energy storage datasheets and brochures, answers to common BESS questions, and news and insights from NEXERA for projects in India.",
  },
  // The Blog (pages/Blog.jsx): every article, newest first — written as a Blog with its BlogPostings.
  {
    path: "/blog",
    h1: "NEXERA Blog",
    label: "Blog",
    title: "BESS Blog: Guides on Battery Energy Storage | NEXERA",
    description:
      "Plain guides on battery energy storage in India: what a BESS is, battery chemistries, sizing, safety and costs, from NEXERA Powertech.",
    blog: [...ARTICLES]
      .sort((x, y) => y.datePublished.localeCompare(x.datePublished))
      .map((a) => ({ headline: a.h1, path: `/blog/${a.slug}`, datePublished: a.datePublished })),
  },
  // Articles (pages/Article.jsx, content in data/articles.js): breadcrumb Home > Blog > article,
  // Article structured data, and the article's FAQ as FAQPage data.
  ...ARTICLES.map((a) => ({
    path: `/blog/${a.slug}`,
    h1: a.h1,
    title: a.title,
    description: a.description,
    crumbs: [["Blog", "/blog"], [a.shortTitle, `/blog/${a.slug}`]],
    ogImage: a.shareImage ?? DEFAULT_OG_IMAGE,
    article: { headline: a.h1, datePublished: a.datePublished, dateModified: a.dateModified },
    faq: a.faqs,
  })),
  {
    path: "/contact",
    localBusiness: true,
    h1: "Talk to Nexera",
    label: "Contact",
    title: "Contact Nexera Powertech | BESS Enquiries, Bengaluru",
    description:
      "Talk to Nexera Powertech about battery storage for your project. Call +91 97423 53341 or send an enquiry.",
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
  const supplied = ` Supplied in India by NEXERA, authorised ${brand} distributor.`;
  // A listed product's own title, description and FAQ (data/productPages.js); the generated ones below
  // are the fallback (a product kept off the catalogue).
  const content = productContent(p.id);
  const available = " Available in India through NEXERA.";
  return {
    path: `/products/${p.id}`,
    // A product kept off the catalogue (`listed: false`, e.g. no product photo yet) keeps its page but
    // is not indexed: noindex, no canonical or structured data, and not in the sitemap.
    noindex: p.listed === false || undefined,
    h1: p.name,
    // Breadcrumb Home > Products > partner > product (named as on the page).
    label: p.name,
    crumbs: [["Products", "/products"], [brand, `/partners/${p.partner}`], [p.name, `/products/${p.id}`]],
    faq: content?.faq,
    title: content?.title ?? firstFitting(
      [`${label} — ${shortType}${TITLE_SUFFIX}`, `${label} — ${apps} Energy Storage${TITLE_SUFFIX}`, `${label}${TITLE_SUFFIX}`],
      TITLE_MAX
    ),
    // The product's own summary sentence where it fits, otherwise its type.
    description: content?.description ?? firstFitting(
      [
        `${label}: ${p.summary}${supplied}`,
        `${label}: ${p.summary}${available}`,
        `${label} — ${p.type}.${supplied}`,
        `${label} — ${p.type}.${available}`,
      ],
      DESCRIPTION_MAX
    ),
    // Its own 1200x630 share image (data/products.js `shareImage`) where it has one. Otherwise a
    // candidate only: the build keeps it if it is a JPG/PNG at least OG_IMAGE_MIN_WIDTH wide. A product
    // without a photo (`imageFallback`: its `image` is the partner's logo) shares the default image.
    ogImage: p.shareImage ?? (p.imageFallback ? DEFAULT_OG_IMAGE : p.image),
    // Structured data (Product): only what the catalogue states. The brand is the partner that makes
    // it — never NEXERA — and there are no offers, prices, ratings or specs; no image without a photo.
    // `model` (where the catalogue has one) is also the sku; `category` is the catalogue's type.
    product: { name: label, description: p.summary, image: p.imageFallback ? null : p.image, brand, model: p.model, category: p.type },
  };
}

const afterProducts = PAGES.findIndex((r) => r.path === "/products") + 1;
export const ROUTES = [...PAGES.slice(0, afterProducts), ...PRODUCTS.map(productPage), ...PAGES.slice(afterProducts)].map((r) => ({
  ogImage: DEFAULT_OG_IMAGE,
  ...r,
  canonical: SITE_URL + r.path,
}));

/**
 * Preview pages: real pages that are not part of the site yet (a director's comparison). Never in the
 * sitemap or ROUTES, never indexed: served with `noindex` and no canonical, description or JSON-LD.
 */
export const PREVIEW_ROUTES = [
  // Draft articles (data/articles.js), in development only: their own title and noindex for review.
  ...DRAFT_ARTICLES.map((a) => ({ path: `/blog/${a.slug}`, title: a.title, noindex: true })),
];

/** The route for a pathname ("/about" or "/about/"), or undefined. */
export function getRoute(pathname) {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return ROUTES.find((r) => r.path === path) ?? PREVIEW_ROUTES.find((r) => r.path === path);
}
