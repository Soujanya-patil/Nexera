/*
 * Become a Partner (/become-a-partner): the distributor FAQ and the five steps. The FAQ is shown on the
 * page (FaqList) and, word for word, as its FAQPage structured data (seo/routes.js). `links` only turn
 * words of an answer into links.
 *
 * Content rule: nothing new. Each answer restates the site (sources beside each one). No eligibility
 * criteria, investment, margins, fees or other commercial terms; no prices; no warranty years.
 */
export const BECOME_PARTNER_FAQ = [
  {
    // How It Works: the five stages (application and fit assessment, brand and segment onboarding,
    // territory mapping, design and commissioning support); Where We Operate: Bengaluru head office.
    q: "How do I become a battery storage distributor in Karnataka?",
    a: "Apply through the partner enquiry form on this page. We review your region, business and segment, onboard you on the TCL and Hithium product lines that match your market, map your territory and formally protect it, then our engineers work your first sizing and commissioning with you. Our head office is in Bengaluru.",
  },
  {
    // NEXERA (2026-11-26): distributors are appointed all over India. How It Works: "Your region formally protected."
    q: "Do you appoint distributors outside Karnataka?",
    a: "Yes. We appoint BESS distributors all over India, not only in Karnataka, and each distributor's region is formally protected.",
  },
  {
    // Resources FAQ, word for word (data/resources.js).
    q: "Do I need BESS experience?",
    a: "No. Most of our partners come from a solar EPC background with strong PV experience but limited battery storage exposure — that's exactly the gap our training and design support exist to close.",
  },
  {
    // About: "We register every system and handle claims with the manufacturer on your behalf."
    // Service & Training: "Local-first warranty handling — we manage the OEM relationship so your customer
    // relationship stays intact." Home partners: "We hold spares stock in India."
    q: "Who handles the warranty if an imported BESS fails in India?",
    a: "NEXERA does. We register every system and handle warranty claims with the manufacturer on your behalf. Warranty handling is local-first: we manage the OEM relationship so your customer relationship stays intact, and we hold spares stock in India.",
  },
  {
    // data/products.js applications; How It Works: "Trained only on the product lines matching your market."
    q: "Which segments can I sell: residential, C&I, utility?",
    a: "All three. Residential: the TCL BlueArk X1. Commercial and industrial: the TCL BlueArk X5, W10 and X10, and the Hithium ∞Power 1022 kWh Cabinet. Utility-scale: the Hithium ∞Power 6.25 MWh and the 1022 kWh Cabinet. You are onboarded on the product lines that match your market.",
  },
  {
    // Home: "installer training and certification"; Resources: "our engineers work your first sizing and
    // commissioning alongside you as part of onboarding"; Service & Training: the Kalaburagi centre (2027).
    q: "What training do you provide?",
    a: "Installer training and certification as part of onboarding, with our engineers working your first sizing and commissioning alongside you. From 2027, technicians will also train on live TCL and Hithium hardware at our Kalaburagi Technician Training Centre: installation and commissioning practice, electrical safety, and fault diagnosis and troubleshooting.",
    links: [{ text: "Kalaburagi Technician Training Centre", to: "/service-training#training" }],
  },
];

/** The five stages of How It Works, in short (the section "How to Become a BESS Distributor in 5 Steps"). */
export const DISTRIBUTOR_STEPS = [
  { title: "Apply", copy: "We review your region, business and segment." },
  { title: "Onboard", copy: "Training on the TCL and Hithium product lines that match your market." },
  { title: "Secure your territory", copy: "Your region is mapped and formally protected." },
  { title: "Deliver your first project", copy: "Our engineers work your first sizing and commissioning with you." },
  { title: "Grow with support", copy: "After-sales and warranty handling, with NEXERA managing the OEM relationship." },
];
