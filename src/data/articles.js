/*
 * Articles (/blog/:slug, pages/Article.jsx) — listed on /blog and, the latest, on /resources. Each article is
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
 *   { ul: Item[] } / { ol: Item[] }     a list; an Item is Rich, or { lead, text: Rich, link: { label, to } }
 *   { terms: [{ term, text }] }         "Key term" callouts
 *   { table: { cols, rows } }           a comparison table (stacked cards on phones); each row is a step
 *   { callout: { label, blocks } }      a labelled callout ("Key point") holding paragraphs and lists
 *   { actions: [{ label, to, primary }] }  buttons / links at the end of a section
 * Rich: a string, or an array of strings and { b: "bold" } / { a: "label", to: "/path" } pieces.
 * `card` (optional): the scene in the article's featured Guides card (resources/GuidesBento).
 *
 * readingTime is computed from the word count (200 words a minute).
 */

/**
 * "LFP vs NMC at a glance" — the table, and the words its scene shows row by row (article/scenes/
 * GlanceRows), so the two always match. `cols`: the header row (the first, the row labels', is empty).
 */
export const LFP_NMC_GLANCE = {
  cols: ["", "LFP (lithium iron phosphate)", "NMC (nickel manganese cobalt)"],
  rows: [
    ["Thermal stability", "Higher: more resistant to overheating", "Lower: needs stricter thermal management"],
    ["Cycle life", "Generally longer", "Generally shorter"],
    ["Energy density", "Lower: larger and heavier for the same energy", "Higher: more compact and lighter"],
    ["Nominal cell voltage", "About 3.2 V", "About 3.6–3.7 V"],
    ["Cathode materials", "Iron and phosphate; no nickel or cobalt", "Nickel, manganese and cobalt"],
    ["Typical use", "Stationary energy storage", "Electric vehicles and portable devices"],
  ],
};

/** "AC-coupled vs DC-coupled at a glance" — the table, and the words its scene shows (GlanceRows). */
export const AC_DC_GLANCE = {
  cols: ["", "DC-coupled", "AC-coupled"],
  rows: [
    ["Where the battery connects", "DC side, sharing a hybrid inverter with solar", "AC side, with its own inverter (PCS)"],
    ["Conversions when storing solar", "None between DC and AC", "Two (DC → AC → DC)"],
    ["Adding to an existing solar plant", "Usually means changing the inverter", "Added alongside the existing system"],
    ["Sizing", "Battery and solar sized together", "Battery sized independently"],
    ["Typical fit", "New solar + storage projects", "Retrofits and larger commercial sites"],
  ],
};

/**
 * Draft articles (`draft: true`): written and kept here, but not published. They exist only in
 * development (`npm run dev`), where each can be reviewed at its own URL; a production build leaves
 * them out entirely (import.meta.env.DEV is false there, so the draft — text and all — is compiled
 * away): no page, no pre-render, no sitemap entry, not on /blog, the Resources strip, the footer, the
 * Blog's structured data or any Related links, and a link to one in an article's text shows as plain
 * text. To publish one: remove its `draft: true` and move it from DRAFTS into the ALL list.
 */
const LFP_VS_NMC = {
  slug: "lfp-vs-nmc",
  // Waiting for the director's review: not published (see DRAFTS above ARTICLES).
  draft: true,
  title: "LFP vs NMC Batteries for Energy Storage | NEXERA",
  description:
    "LFP vs NMC: how lithium iron phosphate (LiFePO4) and NMC batteries compare on safety, cycle life, energy density and cost for home and business storage.",
  shortTitle: "LFP vs NMC",
  eyebrow: "Guide",
  h1: "LFP vs NMC: Which Battery Chemistry Suits Energy Storage?",
  intro: "A plain comparison of the two most common lithium-ion battery chemistries, and why most stationary storage systems use LFP.",
  // The Guides card's scene when this is the featured guide (components/resources/GuidesBento).
  card: "cells",
  datePublished: "2026-10-13T06:04:00+05:30",
  dateModified: "2026-10-13T06:04:00+05:30",
  sections: [
    {
      id: "what-is-lfp",
      visual: "cells-lfp",
      h2: "What is an LFP (LiFePO4) battery?",
      blocks: [
        {
          p: [
            { b: "LFP stands for lithium iron phosphate (LiFePO₄)." },
            " It is a type of lithium-ion battery whose cathode is made from iron phosphate. LFP cells contain no nickel or cobalt, and they are known for thermal stability and long cycle life. That is why LFP is widely used in home, commercial and utility-scale battery energy storage systems.",
          ],
        },
      ],
    },
    {
      id: "what-is-nmc",
      visual: "cells-nmc",
      h2: "What is an NMC battery?",
      blocks: [
        {
          p: [
            { b: "NMC stands for nickel manganese cobalt." },
            " It is also a lithium-ion battery, but its cathode uses a mix of nickel, manganese and cobalt. NMC packs more energy into the same weight and space, which is why it is widely used in electric vehicles, where every kilogram matters.",
          ],
        },
      ],
    },
    {
      id: "is-lfp-lithium-ion",
      visual: "cells-family",
      h2: "Is LFP a lithium-ion battery?",
      blocks: [
        {
          p: 'Yes. LFP and NMC are both lithium-ion batteries. "Lithium-ion" describes the family; LFP and NMC describe the cathode chemistry inside the cell. So the real comparison is not "LFP vs lithium-ion" but LFP vs other lithium-ion chemistries such as NMC.',
        },
      ],
    },
    {
      id: "at-a-glance",
      visual: "glance-rows",
      h2: "LFP vs NMC at a glance",
      blocks: [{ table: LFP_NMC_GLANCE }],
    },
    {
      id: "why-lfp",
      visual: "why-lfp",
      h2: "Why most energy storage systems use LFP",
      blocks: [
        {
          p: "A battery energy storage system usually sits in one place, at a home, a factory or a grid site, so a little extra size and weight matter less than in a car. What matters more is:",
        },
        {
          ul: [
            [{ b: "Safety:" }, " LFP's thermal stability suits batteries installed near people and buildings."],
            [{ b: "Long life:" }, " storage systems often charge and discharge every day, so cycle life drives the cost over the system's lifetime."],
            [{ b: "Materials:" }, " no nickel or cobalt in the cathode."],
          ],
        },
      ],
    },
    {
      id: "how-long",
      visual: "cycle-loop",
      h2: "How long does an LFP battery last?",
      blocks: [
        {
          p: [
            "Battery life is measured in ",
            { b: "cycles" },
            ": one full charge and discharge. How many cycles a battery delivers depends on the cell model, the depth of discharge, the temperature and how the system is operated. Always check the specification of the exact product.",
          ],
        },
        { p: "For example, on our product pages:" },
        {
          ul: [
            [{ a: "TCL BlueArk W10", to: "/products/tcl-blueark-w10" }, " lists an 8,000-cycle specification at 70% state of health, with 95% depth of discharge."],
            [{ a: "Hithium", to: "/partners/hithium" }, "'s cell portfolio includes cycle-life specifications of up to 11,000 cycles, depending on the cell model."],
          ],
        },
      ],
    },
    {
      id: "indoor-safety",
      visual: "safety-layers",
      h2: "Is LFP safer than NMC for indoor installation?",
      blocks: [
        {
          callout: {
            label: "Key point",
            blocks: [
              {
                p: [
                  "LFP cells are more thermally stable than NMC cells, which is an advantage for batteries installed in or near buildings. But safety depends on the ",
                  { b: "whole system" },
                  ", not the chemistry alone:",
                ],
              },
              {
                ul: [
                  "a Battery Management System (BMS) that monitors every cell;",
                  "thermal management (liquid or air cooling);",
                  "fire detection and suppression;",
                  "correct installation, following the manufacturer's requirements and local rules.",
                ],
              },
            ],
          },
        },
      ],
    },
    {
      id: "nexera-lfp",
      visual: "nexera-lfp",
      h2: "Which NEXERA systems use LFP?",
      blocks: [
        { p: "Many of the systems NEXERA offers use LFP cells, including:" },
        {
          ul: [
            [{ b: "TCL BlueArk W10" }, " (314 Ah LFP cells);"],
            [{ b: "Hithium ∞BLOCK C&I" }, " (314 Ah LFP cells);"],
            [{ b: "Midea home batteries" }, " (LiFePO₄ cells)."],
          ],
        },
        { p: "Check each product page for its exact specification." },
        {
          actions: [
            { label: "Talk to an expert", to: "/#contact?interest=ci", primary: true },
            { label: "Browse BESS products", to: "/products" },
          ],
        },
      ],
    },
  ],
  faqs: [
    {
      q: "What is the full form of LFP?",
      a: "LFP stands for lithium iron phosphate (LiFePO₄), a lithium-ion battery chemistry with an iron phosphate cathode.",
    },
    {
      q: "Is LFP better than NMC?",
      a: "It depends on the use. For stationary energy storage, LFP is usually preferred for its thermal stability and longer cycle life. NMC is preferred where compact size and low weight matter most, such as in electric vehicles.",
    },
    {
      q: "Is an LFP battery a lithium-ion battery?",
      a: "Yes. LFP is one type of lithium-ion battery. NMC is another.",
    },
    {
      q: "How long does an LFP battery last?",
      a: "It depends on the cell model, depth of discharge, temperature and operation. Battery life is measured in cycles, so check the cycle-life specification of the exact product.",
    },
    {
      q: "Is LFP safer than NMC for a battery installed indoors?",
      a: "LFP is more thermally stable than NMC. But overall safety depends on the complete system, including the BMS, thermal management, fire protection and correct installation.",
    },
  ],
  related: [
    { label: "What Is a BESS?", to: "/blog/what-is-bess" },
    { label: "Home battery storage", to: "/solutions/residential" },
    { label: "C&I battery storage", to: "/solutions/commercial-industrial" },
    { label: "BESS products", to: "/products" },
  ],
};
const AC_VS_DC = {
  slug: "ac-vs-dc-coupled",
  // Waiting for the director's review: not published (see DRAFTS above ARTICLES). Dates: set at publish.
  draft: true,
  title: "AC-Coupled vs DC-Coupled Battery Storage | NEXERA",
  description:
    "AC-coupled vs DC-coupled battery storage explained: how each connects to solar, efficiency, retrofits, hybrid inverters and which suits your project.",
  shortTitle: "AC vs DC Coupled",
  eyebrow: "Guide",
  h1: "AC-Coupled vs DC-Coupled Battery Storage: Which Fits Your Project?",
  intro: "Two ways to connect a battery to a solar system, and how to choose between them for a new or existing plant.",
  datePublished: "2026-10-13T12:00:00+05:30",
  dateModified: "2026-10-13T12:00:00+05:30",
  sections: [
    {
      id: "what-is-coupling",
      visual: "coupling",
      h2: 'What does "coupling" mean?',
      blocks: [
        {
          p: [
            "Solar panels produce DC (direct current) electricity. Batteries also store energy as DC. But homes, factories and the grid run on AC (alternating current). ",
            { b: '"Coupling" describes where the battery connects to the system: on the DC side, before the inverter, or on the AC side, after it.' },
            " That choice affects efficiency, cost and how easily storage can be added.",
          ],
        },
      ],
    },
    {
      id: "dc-coupled",
      visual: "dc-coupled",
      h2: "What is DC-coupled battery storage?",
      blocks: [
        {
          p: [
            "In a DC-coupled system, the solar panels and the battery connect on the DC side and share one inverter, usually a ",
            { b: "hybrid inverter" },
            ". Solar power can charge the battery directly as DC, without first being converted to AC.",
          ],
        },
        {
          ul: [
            "Fewer conversions between DC and AC, so less energy is lost when storing solar power.",
            "One inverter manages both solar and battery.",
            "Best planned from the start, because the inverter must be designed for both.",
          ],
        },
      ],
    },
    {
      id: "ac-coupled",
      visual: "ac-coupled",
      h2: "What is AC-coupled battery storage?",
      blocks: [
        {
          p: "In an AC-coupled system, the battery has its own inverter (a Power Conversion System, or PCS) and connects on the AC side, alongside the existing solar inverter. Solar power is converted to AC first, then converted back to DC to charge the battery.",
        },
        {
          ul: [
            "Two extra conversion steps when storing solar power: DC to AC, then back to DC.",
            ["The battery system is independent of the solar inverter, so it can be ", { b: "added to an existing solar plant" }, " without replacing the solar inverter."],
            "The battery can also charge from the grid, and its size can be chosen separately from the solar system.",
          ],
        },
      ],
    },
    {
      id: "at-a-glance",
      visual: "glance-acdc",
      h2: "AC-coupled vs DC-coupled at a glance",
      blocks: [{ table: AC_DC_GLANCE }],
    },
    {
      id: "existing-plant",
      visual: "existing-plant",
      h2: "Which is better for an existing solar plant?",
      blocks: [
        {
          p: [
            "For a plant that is already running, ",
            { b: "AC-coupled storage is usually the simpler choice" },
            ". The existing solar inverter stays in place, and the battery system connects on the AC side with its own PCS. This is why many commercial and industrial sites add storage this way.",
          ],
        },
      ],
    },
    {
      id: "new-project",
      visual: "dc-coupled",
      h2: "Which is better for a new solar + storage project?",
      blocks: [
        {
          p: [
            "For a new project designed from day one, ",
            { b: "DC-coupled storage with a hybrid inverter" },
            " can store solar energy with fewer conversions, and one inverter handles both jobs. AC-coupled designs remain a good option when the battery needs to be sized or expanded separately, or charged from the grid.",
          ],
        },
      ],
    },
    {
      id: "hybrid-system",
      visual: "hybrid-system",
      h2: "What is a hybrid energy storage system?",
      blocks: [
        {
          p: [
            "A hybrid energy storage system usually means ",
            { b: "solar, a battery and a hybrid inverter working together" },
            ": the inverter manages solar generation, battery charging and discharging, and the connection to the grid and your loads. Hybrid systems are a common form of DC-coupled storage, especially for homes.",
          ],
        },
      ],
    },
    {
      id: "nexera-fit",
      visual: "coupling",
      h2: "Both options in NEXERA's C&I range",
      blocks: [
        {
          p: [
            "NEXERA's C&I range includes both approaches. The ",
            { a: "Hithium ∞BLOCK C&I", to: "/products/hithium-block-261" },
            " cabinet has a built-in 125 kW PCS and a 400 V AC connection, so it connects on the AC side. The ",
            { a: "TCL BlueArk X5", to: "/products/tcl-blueark-x5" },
            " is an all-in-one, DC-coupled system for small and medium C&I sites.",
          ],
        },
        {
          actions: [
            { label: "Talk to an expert", to: "/#contact?interest=ci", primary: true },
            { label: "C&I battery storage", to: "/solutions/commercial-industrial" },
          ],
        },
      ],
    },
  ],
  faqs: [
    {
      q: "What is the difference between AC-coupled and DC-coupled batteries?",
      a: "It is where the battery connects. A DC-coupled battery shares a hybrid inverter with the solar panels on the DC side. An AC-coupled battery has its own inverter and connects on the AC side.",
    },
    {
      q: "Can I add a battery to my existing solar plant?",
      a: "Usually, yes. AC-coupled storage connects alongside the existing solar inverter, so the solar system can stay as it is.",
    },
    {
      q: "Is DC-coupled storage more efficient?",
      a: "When storing solar energy, DC-coupled storage involves fewer conversions between DC and AC, so less energy is lost in conversion.",
    },
    {
      q: "What is a hybrid inverter?",
      a: "A hybrid inverter manages both solar panels and a battery in one unit, converting power between DC and AC for your loads and the grid.",
    },
    {
      q: "Which coupling is better for a factory or commercial site?",
      a: "It depends on whether solar is already installed and how the battery will be used. AC-coupled storage is common for existing sites. Our engineers can help you choose.",
    },
  ],
  related: [
    { label: "What Is a BESS?", to: "/blog/what-is-bess" },
    { label: "C&I battery storage", to: "/solutions/commercial-industrial" },
    { label: "Home battery storage", to: "/solutions/residential" },
    { label: "BESS products", to: "/products" },
  ],
};
const DRAFTS = import.meta.env.DEV ? [LFP_VS_NMC, AC_VS_DC] : [];

const ALL = [
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
                text: [
                  "battery cells grouped into modules and racks that store the energy. Many of the systems NEXERA offers, including TCL BlueArk W10, Hithium 261 and Midea home batteries, use ",
                  { a: "LFP (lithium iron phosphate)", to: "/blog/lfp-vs-nmc" },
                  " cells.",
                ],
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
  ...DRAFTS,
].map((a) => ({ ...a, readingTime: readingTime(a) }));

/** The published articles: the ones /blog, the Resources strip, the sitemap and the routes list. */
export const ARTICLES = ALL.filter((a) => !a.draft);
/** The drafts (development only; none in a production build). */
export const DRAFT_ARTICLES = ALL.filter((a) => a.draft);

/** Plain text of a Rich value (string, or strings and { b } / { a } pieces). */
export function richText(r) {
  return typeof r === "string" ? r : r.map((x) => (typeof x === "string" ? x : x.b ?? x.a)).join("");
}

/** Minutes to read, at 200 words a minute: intro, sections (headings, text, lists, terms, tables, callouts) and FAQ. */
function readingTime(a) {
  const parts = [a.intro];
  const blocks = (list) => {
    for (const b of list) {
      if (b.p) parts.push(richText(b.p));
      for (const it of b.ul ?? b.ol ?? []) parts.push(typeof it === "string" || Array.isArray(it) ? richText(it) : `${it.lead} ${richText(it.text)}`);
      for (const t of b.terms ?? []) parts.push(`${t.term} ${t.text}`);
      if (b.table) parts.push(...b.table.cols, ...b.table.rows.flat());
      if (b.callout) blocks(b.callout.blocks);
    }
  };
  for (const s of a.sections) {
    parts.push(s.h2);
    blocks(s.blocks);
  }
  for (const f of a.faqs) parts.push(`${f.q} ${f.a}`);
  const words = parts.join(" ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/**
 * The article for a URL slug — any letter case, surrounding slashes ignored (slugs are lowercase).
 * A draft is found only in development (it isn't in a production build at all).
 */
export const getArticle = (slug = "") => {
  const s = slug.replace(/^\/+|\/+$/g, "").toLowerCase();
  return ALL.find((a) => a.slug === s);
};
/** Whether a site path is an article that can't be shown (a draft, in a production build). */
export const isHiddenArticle = (to = "") => to.startsWith("/blog/") && !getArticle(to.slice("/blog/".length).split(/[?#]/)[0]);

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
/** "2026-10-08T16:45:00+05:30" → "8 October 2026" (read from the ISO text itself, so the server and the browser agree). */
export function formatDate(iso) {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}
