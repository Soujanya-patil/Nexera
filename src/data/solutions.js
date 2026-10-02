/*
 * The three Solutions pages: their paths (by catalogue application id) and their FAQs.
 *
 * The FAQ text lives here, not in the pages, because two places must show exactly the same words:
 * the visible FAQ on each page and its FAQPage structured data (written at build time by
 * scripts/seo-pages.mjs through src/seo/routes.js). Copy is from the director-approved Solutions
 * content; CLOU's Aqua C2.5S is written the way the catalogue writes it.
 */

/** Solutions page for each catalogue application (data/products.js `applications`). */
export const SOLUTION_PAGES = {
  residential: { path: "/solutions/residential", label: "Residential" },
  ci: { path: "/solutions/commercial-industrial", label: "Commercial & Industrial" },
  utility: { path: "/solutions/utility-scale", label: "Utility-Scale" },
};

export const UTILITY_FAQ = [
  {
    q: "What is a utility-scale battery energy storage system?",
    a: "A grid-connected battery system, typically in the MWh range, that stores electricity from renewable plants or the grid and dispatches it when needed: for peak shifting, grid support or round-the-clock renewable power.",
  },
  {
    q: "What is the difference between a 2-hour and a 4-hour BESS?",
    a: "Duration is energy capacity divided by power rating. A 4-hour system can deliver its rated power for about four hours, which suits longer evening peaks and renewable firming.",
  },
  {
    q: "Which utility-scale platforms does NEXERA offer?",
    a: "NEXERA offers utility-scale systems from Hithium (∞Power 5.016 MWh and 6.25 MWh) and CLOU (Aqua C2.5S series).",
  },
  {
    q: "Can utility BESS work with an existing solar or wind plant?",
    a: "Yes. Storage can be added to existing or new renewable plants. The right configuration depends on the plant's generation profile, grid connection and operating objective, which NEXERA assesses at the start of the project.",
  },
  {
    q: "Does NEXERA manufacture these systems?",
    a: "No. Hithium and CLOU design and manufacture the systems. NEXERA supplies them in India and supports sizing, engineering, commissioning and lifecycle service.",
  },
];

export const CI_FAQ = [
  {
    q: "What is a C&I battery energy storage system?",
    a: "A system of batteries, power conversion and energy management that stores electricity for a commercial or industrial site and releases it when needed, for peak shaving, backup power or higher solar usage.",
  },
  {
    q: "How does peak shaving reduce electricity costs?",
    a: "The battery discharges during your highest-demand periods, lowering the peak drawn from the grid. Where your tariff includes demand charges, this can reduce your bill.",
  },
  {
    q: "What information does NEXERA need to size a system?",
    a: "Your monthly electricity bill, sanctioned load, a 15-minute load profile and any existing or planned solar capacity.",
  },
  {
    q: "Which brands does NEXERA offer for C&I projects?",
    a: "TCL (BlueArk X5 and W10), Hithium (261 kWh all-in-one) and CLOU (Aqua-E261).",
  },
  {
    q: "Does NEXERA manufacture these systems?",
    a: "No. TCL, Hithium and CLOU design and manufacture the systems. NEXERA supplies them in India and provides design, commissioning, training and after-sales support.",
  },
];

export const RESIDENTIAL_FAQ = [
  {
    q: "What is a home battery storage system?",
    a: "A battery that stores electricity, usually from rooftop solar, so you can use it later: in the evening, at night or during a power cut.",
  },
  {
    q: "Can I use solar power at night?",
    a: "Yes, with a battery. Excess solar from the day is stored and used after sunset, so you draw less from the grid.",
  },
  {
    q: "Will a home battery keep my appliances running during a power cut?",
    a: "A system with backup capability keeps selected essential loads such as lights, fans, refrigerators and Wi-Fi running. How long depends on battery size and connected load, which NEXERA helps you plan.",
  },
  {
    q: "Is there a government subsidy for rooftop solar?",
    a: "Under PM Surya Ghar: Muft Bijli Yojana, Central Financial Assistance is available for residential rooftop solar, as shown above. Check the National Portal for current rules.",
  },
  {
    q: "Which home battery brands does NEXERA offer?",
    a: "NEXERA offers residential energy storage from Midea and TCL (BlueArk X1).",
  },
];
