/*
 * The Step 11 blog posts' metadata (data/articleMeta.js): what the Blog list, the Resources strip, the
 * Solutions and product pages and the route table need — never the text. `minutes` and `eyebrow` (category)
 * come from each post's SEO table; `toc` is its sections (id, heading) for the featured card's "Start here".
 * The posts' text is in data/blogPosts.js, loaded by the article page only.
 */
export const BLOG_POST_META = [
  {
    "slug": "what-is-bess",
    "title": "What Is a BESS? Battery Energy Storage Guide for India",
    "description": "BESS explained simply: what a battery energy storage system is, how it works, its main parts, types and uses for homes, factories and the grid in India.",
    "shortTitle": "What Is a BESS?",
    "eyebrow": "BESS Fundamentals",
    "minutes": 7,
    "h1": "What Is a BESS? A Complete Guide to Battery Energy Storage Systems in India",
    "toc": [
      {
        "id": "bess-full-form",
        "h2": "BESS full form"
      },
      {
        "id": "how-does-a-bess-work",
        "h2": "How does a BESS work?"
      },
      {
        "id": "the-main-parts-of-a-bess",
        "h2": "The main parts of a BESS"
      },
      {
        "id": "types-of-bess-by-scale",
        "h2": "Types of BESS by scale"
      },
      {
        "id": "types-of-bess-by-battery-chemistry",
        "h2": "Types of BESS by battery chemistry"
      },
      {
        "id": "what-is-a-bess-used-for",
        "h2": "What is a BESS used for?"
      },
      {
        "id": "key-terms-explained-simply",
        "h2": "Key terms, explained simply"
      },
      {
        "id": "advantages-and-limits-of-bess",
        "h2": "Advantages and limits of BESS"
      },
      {
        "id": "how-to-choose-the-right-bess",
        "h2": "How to choose the right BESS"
      },
      {
        "id": "talk-to-nexera",
        "h2": "Talk to Nexera"
      }
    ]
  },
  {
    "slug": "why-india-needs-battery-energy-storage",
    "title": "Why India Needs Battery Energy Storage (BESS)",
    "description": "Solar is booming, but evening peaks, curtailment and ToD tariffs are rising. See why India needs battery energy storage and what it means for business.",
    "shortTitle": "Why India Needs BESS",
    "eyebrow": "BESS Fundamentals",
    "minutes": 6,
    "h1": "Why India Needs Battery Energy Storage: Solar Growth, Evening Peaks and Grid Stability",
    "toc": [
      {
        "id": "solar-is-growing-faster-than-the-grid-can-use-it",
        "h2": "Solar is growing faster than the grid can use it"
      },
      {
        "id": "the-evening-and-night-problem",
        "h2": "The evening and night problem"
      },
      {
        "id": "how-much-storage-does-india-need",
        "h2": "How much storage does India need?"
      },
      {
        "id": "why-storage-matters-for-businesses-and-factories",
        "h2": "Why storage matters for businesses and factories"
      },
      {
        "id": "why-storage-matters-for-homes",
        "h2": "Why storage matters for homes"
      },
      {
        "id": "what-this-means-for-solar-epc-companies",
        "h2": "What this means for solar EPC companies"
      },
      {
        "id": "challenges-to-be-honest-about",
        "h2": "Challenges to be honest about"
      },
      {
        "id": "talk-to-nexera",
        "h2": "Talk to Nexera"
      }
    ]
  },
  {
    "slug": "dc-coupled-vs-ac-coupled-vs-hybrid-bess",
    "title": "DC-Coupled vs AC-Coupled vs Hybrid BESS Explained",
    "description": "DC-coupled, AC-coupled or hybrid? Compare efficiency, retrofit, cost and backup for solar plus battery storage in India, with TCL and Hithium examples.",
    "shortTitle": "DC vs AC vs Hybrid BESS",
    "eyebrow": "System Architecture",
    "minutes": 8,
    "h1": "DC-Coupled vs AC-Coupled vs Hybrid BESS: Which Is Right for Your Solar Project?",
    "toc": [
      {
        "id": "why-coupling-matters",
        "h2": "Why coupling matters"
      },
      {
        "id": "ac-coupled-bess",
        "h2": "AC-coupled BESS"
      },
      {
        "id": "dc-coupled-bess",
        "h2": "DC-coupled BESS"
      },
      {
        "id": "hybrid-bess-hybrid-inverter-or-hybrid-pcs",
        "h2": "Hybrid BESS (hybrid inverter or hybrid PCS)"
      },
      {
        "id": "side-by-side-comparison",
        "h2": "Side-by-side comparison"
      },
      {
        "id": "examples-from-the-tcl-and-hithium-range",
        "h2": "Examples from the TCL and Hithium range"
      },
      {
        "id": "indian-site-checks-that-apply-to-every-architecture",
        "h2": "Indian site checks that apply to every architecture"
      },
      {
        "id": "how-to-choose-in-four-steps",
        "h2": "How to choose in four steps"
      },
      {
        "id": "talk-to-nexera",
        "h2": "Talk to Nexera"
      }
    ]
  },
  {
    "slug": "how-bess-is-designed-and-sized",
    "title": "How to Size a BESS: Step-by-Step Design Guide India",
    "description": "How a battery energy storage system is designed and sized: load profile, kW vs kWh, depth of discharge, degradation, site checks and a worked example.",
    "shortTitle": "Designing and Sizing a BESS",
    "eyebrow": "System Design",
    "minutes": 9,
    "h1": "How a BESS Is Designed and Sized: A Step-by-Step Guide for Indian Projects",
    "toc": [
      {
        "id": "step-1-define-the-job",
        "h2": "Step 1: Define the job"
      },
      {
        "id": "step-2-collect-the-right-data",
        "h2": "Step 2: Collect the right data"
      },
      {
        "id": "step-3-size-power-kw-and-energy-kwh",
        "h2": "Step 3: Size power (kW) and energy (kWh)"
      },
      {
        "id": "a-worked-example-hypothetical-numbers",
        "h2": "A worked example (hypothetical numbers)"
      },
      {
        "id": "step-4-choose-the-architecture-and-equipment",
        "h2": "Step 4: Choose the architecture and equipment"
      },
      {
        "id": "step-5-design-the-electrical-connection",
        "h2": "Step 5: Design the electrical connection"
      },
      {
        "id": "step-6-plan-the-civil-and-mechanical-work",
        "h2": "Step 6: Plan the civil and mechanical work"
      },
      {
        "id": "step-7-set-the-operating-strategy-and-commission",
        "h2": "Step 7: Set the operating strategy and commission"
      },
      {
        "id": "common-sizing-mistakes",
        "h2": "Common sizing mistakes"
      },
      {
        "id": "talk-to-nexera",
        "h2": "Talk to Nexera"
      }
    ]
  },
  {
    "slug": "inside-a-bess-bms-pcs-ems-cooling-fire-safety",
    "title": "BMS, PCS, EMS Explained: Inside a Battery Storage System",
    "description": "Understand BMS, PCS, EMS, liquid cooling and fire protection in a BESS, and why battery storage is a complex system that needs skilled design and service.",
    "shortTitle": "Inside a BESS",
    "eyebrow": "Battery Technology",
    "minutes": 9,
    "h1": "Inside a BESS: BMS, PCS, EMS, Cooling and Fire Safety, and Why It Is More Complex Than It Looks",
    "toc": [
      {
        "id": "from-cell-to-container-the-building-blocks",
        "h2": "From cell to container: the building blocks"
      },
      {
        "id": "bms-the-guardian-of-the-battery",
        "h2": "BMS: the guardian of the battery"
      },
      {
        "id": "pcs-the-translator-between-battery-and-grid",
        "h2": "PCS: the translator between battery and grid"
      },
      {
        "id": "ems-the-brain",
        "h2": "EMS: the brain"
      },
      {
        "id": "thermal-management-air-cooling-vs-liquid-cooling",
        "h2": "Thermal management: air cooling vs liquid cooling"
      },
      {
        "id": "fire-protection-and-safety",
        "h2": "Fire protection and safety"
      },
      {
        "id": "why-a-bess-is-more-complex-than-it-looks",
        "h2": "Why a BESS is more complex than it looks"
      },
      {
        "id": "talk-to-nexera",
        "h2": "Talk to Nexera"
      }
    ]
  },
  {
    "slug": "commercial-industrial-bess-india-guide",
    "title": "C&I Battery Storage in India: Complete Business Guide",
    "description": "A practical guide to commercial and industrial BESS in India: uses, sizing, costs, payback drivers and how factories, hospitals and malls choose storage.",
    "shortTitle": "C&I BESS in India",
    "eyebrow": "Commercial & Industrial",
    "minutes": 8,
    "h1": "Commercial and Industrial BESS in India: A Complete Guide for Businesses",
    "toc": [
      {
        "id": "who-uses-candi-battery-storage",
        "h2": "Who uses C&I battery storage?"
      },
      {
        "id": "the-five-main-business-cases",
        "h2": "The five main business cases"
      },
      {
        "id": "typical-candi-system-sizes",
        "h2": "Typical C&I system sizes"
      },
      {
        "id": "is-candi-bess-right-for-your-business-a-quick-checklist",
        "h2": "Is C&I BESS right for your business? A quick checklist"
      },
      {
        "id": "what-drives-the-cost-and-payback-of-a-bess",
        "h2": "What drives the cost and payback of a BESS?"
      },
      {
        "id": "how-a-candi-project-runs",
        "h2": "How a C&I project runs"
      },
      {
        "id": "what-to-ask-a-bess-supplier",
        "h2": "What to ask a BESS supplier"
      },
      {
        "id": "talk-to-nexera",
        "h2": "Talk to Nexera"
      }
    ]
  },
  {
    "slug": "tod-tariff-karnataka-battery-storage",
    "title": "ToD Tariff Karnataka: How Battery Storage Saves Money",
    "description": "What ToD tariff means for Karnataka businesses, how peak-hour charges work under KERC and BESCOM, and how battery storage can shift energy to cut cost.",
    "shortTitle": "ToD Tariff in Karnataka",
    "eyebrow": "Energy Tariffs & Savings",
    "minutes": 7,
    "h1": "ToD Tariff in Karnataka: How Battery Storage Helps Businesses Save on Peak-Hour Power",
    "toc": [
      {
        "id": "what-is-a-tod-tariff",
        "h2": "What is a ToD tariff?"
      },
      {
        "id": "tod-in-karnataka",
        "h2": "ToD in Karnataka"
      },
      {
        "id": "how-a-battery-uses-the-tariff-gap",
        "h2": "How a battery uses the tariff gap"
      },
      {
        "id": "illustrative-savings-hypothetical",
        "h2": "Illustrative savings (hypothetical)"
      },
      {
        "id": "charging-from-solar-makes-the-gap-wider",
        "h2": "Charging from solar makes the gap wider"
      },
      {
        "id": "checklist-before-you-decide",
        "h2": "Checklist before you decide"
      },
      {
        "id": "talk-to-nexera",
        "h2": "Talk to Nexera"
      }
    ]
  },
  {
    "slug": "peak-shaving-demand-charges-bess",
    "title": "Peak Shaving with BESS: Cut Demand Charges in India",
    "description": "How battery peak shaving works, how maximum demand and kVA charges are billed, and how to size a BESS for demand reduction, with a worked example.",
    "shortTitle": "Peak Shaving with BESS",
    "eyebrow": "Energy Tariffs & Savings",
    "minutes": 7,
    "h1": "Peak Shaving with BESS: How Batteries Cut Demand Charges for Indian Industries",
    "toc": [
      {
        "id": "how-demand-charges-work",
        "h2": "How demand charges work"
      },
      {
        "id": "how-a-battery-shaves-the-peak",
        "h2": "How a battery shaves the peak"
      },
      {
        "id": "what-a-peak-shaving-battery-must-be-good-at",
        "h2": "What a peak-shaving battery must be good at"
      },
      {
        "id": "worked-example-hypothetical-numbers",
        "h2": "Worked example (hypothetical numbers)"
      },
      {
        "id": "peak-shaving-plus-tod-stacking-the-benefits",
        "h2": "Peak shaving plus ToD: stacking the benefits"
      },
      {
        "id": "capacity-relief-avoiding-a-transformer-upgrade",
        "h2": "Capacity relief: avoiding a transformer upgrade"
      },
      {
        "id": "power-factor-and-kva",
        "h2": "Power factor and kVA"
      },
      {
        "id": "is-peak-shaving-right-for-you",
        "h2": "Is peak shaving right for you?"
      },
      {
        "id": "talk-to-nexera",
        "h2": "Talk to Nexera"
      }
    ]
  },
  {
    "slug": "solar-plus-storage-zero-export-epc-guide",
    "title": "Solar + Storage for EPCs: Win More C&I Solar Projects",
    "description": "How solar EPC companies in India can add battery storage to win more C&I projects: zero-export, curtailment, backup, sizing, installation and support.",
    "shortTitle": "Solar + Storage for EPCs",
    "eyebrow": "Solar + Storage",
    "minutes": 8,
    "h1": "Solar Plus Storage for EPC Companies: Zero Export, Backup and How to Win More C&I Projects",
    "toc": [
      {
        "id": "where-solar-only-proposals-lose",
        "h2": "Where solar-only proposals lose"
      },
      {
        "id": "zero-export-and-export-limited-sites",
        "h2": "Zero-export and export-limited sites"
      },
      {
        "id": "which-system-to-use-ac-coupled-or-hybrid",
        "h2": "Which system to use: AC-coupled or hybrid?"
      },
      {
        "id": "backup-and-generator-integration",
        "h2": "Backup and generator integration"
      },
      {
        "id": "sizing-a-solar-plus-storage-system",
        "h2": "Sizing a solar plus storage system"
      },
      {
        "id": "common-mistakes-to-avoid",
        "h2": "Common mistakes to avoid"
      },
      {
        "id": "what-epc-companies-should-expect-from-a-bess-supplier",
        "h2": "What EPC companies should expect from a BESS supplier"
      },
      {
        "id": "talk-to-nexera",
        "h2": "Talk to Nexera"
      }
    ]
  },
  {
    "slug": "tcl-blueark-hithium-bess-solutions-india",
    "title": "TCL BlueArk & Hithium BESS in India: Product Guide",
    "description": "Explore TCL BlueArk X5, W10 and Hithium C&I and utility-scale battery storage available in India through Nexera, with specs, uses and how to choose.",
    "shortTitle": "TCL BlueArk and Hithium in India",
    "eyebrow": "Product Insight",
    "minutes": 8,
    "h1": "TCL BlueArk and Hithium Battery Storage in India: A Product Guide for C&I and Utility Projects",
    "toc": [
      {
        "id": "the-range-at-a-glance",
        "h2": "The range at a glance"
      },
      {
        "id": "tcl-blueark-x5-the-all-in-one-hybrid",
        "h2": "TCL BlueArk X5: the all-in-one hybrid"
      },
      {
        "id": "tcl-blueark-w10-liquid-cooled-261-kwh-cabinet",
        "h2": "TCL BlueArk W10: liquid-cooled 261 kWh cabinet"
      },
      {
        "id": "hithium-candi-cabinet-and-power-blocks",
        "h2": "Hithium ∞Power 1022 kWh Cabinet and 6.25 MWh"
      },
      {
        "id": "what-the-tcl-warranty-looks-like",
        "h2": "What the TCL warranty looks like"
      },
      {
        "id": "which-product-should-i-choose",
        "h2": "Which product should I choose?"
      },
      {
        "id": "what-nexera-adds",
        "h2": "What Nexera adds"
      },
      {
        "id": "talk-to-nexera",
        "h2": "Talk to Nexera"
      }
    ]
  }
];
