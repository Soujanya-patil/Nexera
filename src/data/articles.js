/*
 * Articles (/resources/:slug, pages/Article.jsx) — the guides listed on /resources. Each article is
 * data, so the page, its structured data (src/seo/routes.js → scripts/seo-pages.mjs: Article and
 * FAQPage) and the Resources cards all read the same words.
 *
 * An article:
 *   slug, title (with " | NEXERA", < 60), description (< 155), shortTitle (breadcrumb), eyebrow, h1,
 *   intro, datePublished / dateModified (ISO 8601, IST), sections, faqs, related.
 * A section: { id, h2, visual, blocks }. `visual` names the animated scene beside it (or under its
 * heading on phones) from components/article/scenes — reusable by any article. The scene follows the
 * reader: each list item, numbered question or Key term in the section is one step of it. Blocks:
 *   { p: Rich }                         a paragraph
 *   { ul: Item[] } / { ol: Item[] }     a list; an Item is Rich, or { lead, text, link: { label, to } }
 *   { terms: [{ term, text }] }         "Key term" callouts
 *   { actions: [{ label, to, primary }] }  buttons / links at the end of a section
 * Rich: a string, or an array of strings and { b: "bold" } / { a: "label", to: "/path" } pieces.
 *
 * readingTime is computed from the word count (200 words a minute).
 */

export const ARTICLES = [
  {
    slug: "what-is-bess",
    title: "What Is a BESS? Battery Energy Storage Explained | NEXERA",
    description:
      "BESS full form: Battery Energy Storage System. Learn how a BESS works, its key components, kW vs kWh, and where homes, businesses and the grid use it.",
    shortTitle: "What Is a BESS?",
    eyebrow: "Guide",
    h1: "What Is a BESS? A Plain Guide to Battery Energy Storage",
    intro: "A simple explanation of battery energy storage systems: what they are, how they work and where they're used in India.",
    datePublished: "2026-10-08T17:39:00+05:30",
    dateModified: "2026-10-08T17:39:00+05:30",
    sections: [
      {
        id: "bess-full-form",
        visual: "bess-letters",
        h2: "BESS full form",
        blocks: [
          {
            p: [
              { b: "BESS stands for Battery Energy Storage System." },
              " It is a system that stores electricity in batteries and releases it when it is needed. A BESS lets you use energy at a different time from when it was produced, for example storing solar power generated at midday and using it after sunset.",
            ],
          },
        ],
      },
      {
        id: "how-a-bess-works",
        visual: "energy-flow",
        h2: "How does a BESS work?",
        blocks: [
          { p: "A BESS works in two directions:" },
          {
            ul: [
              {
                lead: "Charging:",
                text: "when there is spare electricity, from solar panels or from the grid at off-peak times, the system converts it and stores it in battery cells.",
              },
              {
                lead: "Discharging:",
                text: "when electricity is needed, for example in the evening, during a power cut or at peak tariff hours, the system converts the stored energy back into usable AC power for your home, facility or the grid.",
              },
            ],
          },
          { p: "Software decides when to charge and when to discharge, based on solar generation, electricity tariffs and demand." },
        ],
      },
      {
        id: "main-parts",
        visual: "cabinet-parts",
        h2: "The main parts of a BESS",
        blocks: [
          {
            ul: [
              {
                lead: "Battery modules:",
                text: "battery cells grouped into modules and racks that store the energy. Many of the systems NEXERA offers, including TCL BlueArk W10, Hithium 261 and Midea home batteries, use LFP (lithium iron phosphate) cells.",
              },
              {
                lead: "Battery Management System (BMS):",
                text: "monitors cell voltage, current and temperature, balances the cells and protects the battery from unsafe conditions.",
              },
              {
                lead: "Power Conversion System (PCS):",
                text: "converts DC power from the battery to AC power for use in your facility or on the grid, and converts AC back to DC to charge the battery.",
              },
              {
                lead: "Energy Management System (EMS):",
                text: 'the "brain" that decides when to charge and discharge, for example to shave peaks or use stored solar.',
              },
              { lead: "Thermal management:", text: "liquid or air cooling that keeps cells within their ideal temperature range." },
              { lead: "Fire protection:", text: "multi-level detection and suppression designed to identify and isolate faults early." },
            ],
          },
        ],
      },
      {
        id: "key-terms",
        visual: "key-terms",
        h2: "Key terms, explained simply",
        blocks: [
          {
            terms: [
              {
                term: "kWh (kilowatt-hour), energy capacity",
                text: "how much energy the battery can store. A bigger kWh number means it can supply power for longer.",
              },
              {
                term: "kW (kilowatt), power rating",
                text: "how fast the system can deliver energy at any moment. kW is how much at once; kWh is how much in total.",
              },
              {
                term: "C-rate",
                text: "how fast a battery charges or discharges relative to its capacity. At 1C a full battery discharges in about one hour; at 0.5C, in about two hours.",
              },
              { term: "Depth of discharge (DoD)", text: "how much of the battery's capacity is actually used in a cycle, shown as a percentage." },
              {
                term: "Cycle life",
                text: "how many charge-and-discharge cycles a battery can deliver before its capacity falls to a specified level.",
              },
              { term: "Round-trip efficiency", text: "the share of energy you get back out of the battery compared with what you put in." },
            ],
          },
        ],
      },
      {
        id: "types-by-scale",
        visual: "scale-morph",
        h2: "Types of BESS by scale",
        blocks: [
          {
            ul: [
              {
                lead: "Residential (home) storage:",
                text: "stores rooftop solar for use in the evening and keeps essential appliances running during power cuts.",
                link: { label: "Home battery storage", to: "/solutions/residential" },
              },
              {
                lead: "Commercial & industrial (C&I) storage:",
                text: "helps factories, offices, hospitals and data centres with peak shaving, solar self-consumption and backup power.",
                link: { label: "C&I battery storage", to: "/solutions/commercial-industrial" },
              },
              {
                lead: "Utility-scale storage:",
                text: "large containerised systems that support renewable integration, grid stability and peak demand.",
                link: { label: "Utility-scale BESS", to: "/solutions/utility-scale" },
              },
            ],
          },
        ],
      },
      {
        id: "uses",
        visual: "day-dial",
        h2: "What is a BESS used for?",
        blocks: [
          {
            ul: [
              "Storing solar power and using it after sunset",
              "Backup power during outages",
              "Peak shaving: using stored energy at the times of highest demand to reduce demand-related costs",
              "Shifting energy use to cheaper tariff periods, where time-of-day tariffs apply",
              "Integrating more solar and wind into the grid",
              "Supporting grid stability",
            ],
          },
        ],
      },
      {
        id: "choosing",
        visual: "choose-chips",
        h2: "How to choose the right BESS",
        blocks: [
          { p: "Start with four questions:" },
          {
            ol: [
              "How much energy do you need to store (kWh)?",
              "How much power do you need at once (kW)?",
              "What is it mainly for: solar self-consumption, backup, peak shaving or grid services?",
              "Where will it be installed: indoors, outdoors, on a rooftop or in a yard?",
            ],
          },
          { p: "NEXERA's engineers help with sizing, system design and commissioning, with systems from TCL, Hithium, CLOU and Midea." },
          {
            actions: [
              { label: "Talk to an expert", to: "/#contact", primary: true },
              { label: "Browse BESS products", to: "/products" },
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: "What is the full form of BESS?",
        a: "BESS stands for Battery Energy Storage System: a system that stores electricity in batteries and releases it when needed.",
      },
      {
        q: "What does a BESS do?",
        a: "It stores electricity when it is available, for example from solar panels or off-peak grid power, and supplies it later, during the evening, at peak times or in a power cut.",
      },
      {
        q: "What is the difference between kW and kWh in a BESS?",
        a: "kW is the power rating: how much electricity the system can deliver at once. kWh is the energy capacity: how much it can store in total.",
      },
      {
        q: "What is a PCS in a BESS?",
        a: "The Power Conversion System converts DC power from the battery into AC power for use, and converts AC back to DC to charge the battery.",
      },
      {
        q: "What battery chemistry do NEXERA's systems use?",
        a: "Many of the systems NEXERA offers, including TCL BlueArk W10, Hithium 261 and Midea home batteries, use LFP (lithium iron phosphate) cells. Check each product page for its exact specification.",
      },
    ],
    related: [
      { label: "Home battery storage", to: "/solutions/residential" },
      { label: "C&I battery storage", to: "/solutions/commercial-industrial" },
      { label: "Utility-scale BESS", to: "/solutions/utility-scale" },
      { label: "BESS products", to: "/products" },
    ],
  },
].map((a) => ({ ...a, readingTime: readingTime(a) }));

/** Plain text of a Rich value (string, or strings and { b } / { a } pieces). */
export function richText(r) {
  return typeof r === "string" ? r : r.map((x) => (typeof x === "string" ? x : x.b ?? x.a)).join("");
}

/** Minutes to read, at 200 words a minute: intro, sections (headings, text, lists, terms) and FAQ. */
function readingTime(a) {
  const parts = [a.intro];
  for (const s of a.sections) {
    parts.push(s.h2);
    for (const b of s.blocks) {
      if (b.p) parts.push(richText(b.p));
      for (const it of b.ul ?? b.ol ?? []) parts.push(typeof it === "string" || Array.isArray(it) ? richText(it) : `${it.lead} ${it.text}`);
      for (const t of b.terms ?? []) parts.push(`${t.term} ${t.text}`);
    }
  }
  for (const f of a.faqs) parts.push(`${f.q} ${f.a}`);
  const words = parts.join(" ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** The article for a URL slug — any letter case, surrounding slashes ignored (slugs are lowercase). */
export const getArticle = (slug = "") => {
  const s = slug.replace(/^\/+|\/+$/g, "").toLowerCase();
  return ARTICLES.find((a) => a.slug === s);
};

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
/** "2026-10-08T16:45:00+05:30" → "8 October 2026" (read from the ISO text itself, so the server and the browser agree). */
export function formatDate(iso) {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}
