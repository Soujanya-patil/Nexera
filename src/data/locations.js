/*
 * The Bengaluru location page (/locations/bengaluru, pages/LocationBengaluru.jsx). Every line restates a
 * fact the site already states; the source is noted beside each one.
 *
 * The FAQ is rendered on the page and written as FAQPage structured data (src/seo/routes.js →
 * scripts/seo-pages.mjs) from this one list, so the two are word for word the same. `links` only turn
 * words of the answer into links (the first time each appears); they never add text.
 */
import { ADDRESS, HOURS, PHONE, phoneHref } from "./business";
import { SOLUTION_PAGES } from "./solutions";

export const BENGALURU_PATH = "/locations/bengaluru";

/** "Monday to Saturday, 09:00–18:00" (data/business: as on the Business Profile). */
export const HOURS_LINE = `${HOURS.days[0]} to ${HOURS.days[HOURS.days.length - 1]}, ${HOURS.opens}–${HOURS.closes}`;

/** "Get directions": Google Maps directions to the office's location (a plain link, new tab; no map embed). */
export const DIRECTIONS_HREF = "https://www.google.com/maps/dir/?api=1&destination=WeWork+Galaxy+43+Residency+Rd+Ashok+Nagar+Bengaluru+560025";

/** "What we offer in Karnataka": one line from each Solutions page. */
export const OFFERS = [
  {
    id: "residential",
    // SolutionsResidential hero: "…our residential systems give you a solar battery for home, designed to grow with your needs."
    line: "A solar battery for home, designed to grow with your needs.",
    cta: "Explore Residential Solutions",
  },
  {
    id: "ci",
    // SolutionsCI hero: "Reduce peak demand. Store solar energy. Improve energy resilience. …"
    line: "Reduce peak demand. Store solar energy. Improve energy resilience.",
    cta: "Explore C&I Solutions",
  },
  {
    id: "utility",
    // SolutionsUtility hero subheading: "Grid-Scale Battery Energy Storage Systems Built for Renewable Integration"
    line: "Grid-scale battery energy storage systems built for renewable integration.",
    cta: "Explore Utility Solutions",
  },
].map((o) => ({ ...o, ...SOLUTION_PAGES[o.id] }));

/** "How we support local projects": the shared support points (data/serviceTraining.js). */
export { SUPPORT_POINTS as SUPPORT } from "./serviceTraining";

export const BENGALURU_FAQ = [
  {
    q: "Where is NEXERA's office in Bengaluru?",
    // The footer addresses (data/business) and the hours; Where We Operate: Bengaluru, Head office and Branch office.
    a: `NEXERA's head office is at ${ADDRESS}. It is open ${HOURS_LINE}. We also have a branch office at 2nd Floor, 31, 9th Main Road, Chowdappa Layout, Hampi Nagar, Bengaluru 560104.`,
  },
  {
    q: "Which battery brands does NEXERA supply in Karnataka?",
    // Where We Operate: "an authorised distributor of TCL and Hithium battery energy storage systems";
    // the Solutions FAQs: "TCL and Hithium design and manufacture the systems. NEXERA supplies them in India …".
    a: "NEXERA is an authorised distributor of TCL and Hithium battery energy storage systems. TCL and Hithium design and manufacture the systems; NEXERA supplies them in India and provides design, commissioning, training and after-sales support.",
    links: [
      { text: "TCL", to: "/partners/tcl" },
      { text: "Hithium", to: "/partners/hithium" },
    ],
  },
  {
    q: "Do you support commercial and industrial sites in Karnataka?",
    // SolutionsCI hero, word for word.
    a: "Yes. NEXERA brings together advanced C&I Battery Energy Storage Systems from TCL and Hithium, engineered for demanding commercial and industrial applications. See our Commercial & Industrial solutions.",
    links: [{ text: "Commercial & Industrial solutions", to: SOLUTION_PAGES.ci.path }],
  },
  {
    q: "Do you help with sizing and commissioning?",
    // Service & Training (Design & Commissioning Support) and the C&I FAQ ("What information does NEXERA need to size a system?").
    a: "Yes. Every partner gets our engineering team for sizing, single-line diagrams, and on-site support with BESS installation and BESS commissioning. To size a C&I system, we need your monthly electricity bill, sanctioned load, a 15-minute load profile and any existing or planned solar capacity. More on Service & Training.",
    links: [{ text: "Service & Training", to: "/service-training" }],
  },
  {
    q: "How do I get a quote?",
    // Contact: "Tell us what you need — we'll route it to the right team."; the footer phone.
    a: `Tell us what you need through the contact form${PHONE ? ` or call ${PHONE}` : ""}, and we'll route it to the right team.`,
    links: [{ text: "contact form", to: "/contact" }, ...(PHONE ? [{ text: PHONE, href: phoneHref(PHONE) }] : [])],
  },
];
