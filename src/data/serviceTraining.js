/*
 * Service & Training FAQ — rendered on the page (pages/ServiceTraining.jsx) and written as FAQPage
 * structured data (src/seo/routes.js → scripts/seo-pages.mjs) from this one list, so the two are
 * always word for word the same. Answers only restate the page's own copy.
 */
export const SERVICE_TRAINING_FAQ = [
  {
    q: "Where can EPC technicians get hands-on BESS training in South India?",
    a: "At NEXERA's Kalaburagi Technician Training Centre, a hands-on BESS training centre for EPC technicians opening in 2027. Technicians will train on live TCL and Hithium hardware, not manuals and PDFs: installation and commissioning practice, electrical safety, and fault diagnosis and troubleshooting on live systems, with a certification path for field-ready technicians.",
  },
];

/**
 * NEXERA's support in four points — Service & Training and How It Works, in their own words. Shown on
 * the Bengaluru page ("How we support local projects") and every product page ("NEXERA support in India").
 */
export const SUPPORT_POINTS = [
  {
    key: "sizing",
    title: "Sizing",
    // Service & Training: "Every partner gets our engineering team for sizing, single-line diagrams, …"
    text: "Every partner gets our engineering team for sizing and single-line diagrams.",
  },
  {
    key: "commissioning",
    title: "Commissioning support",
    // Service & Training: "…on-site support with BESS installation and BESS commissioning."
    // How It Works, stage 04: "Our engineers work your first sizing and commissioning with you."
    text: "On-site support with BESS installation and BESS commissioning. Our engineers work your first sizing and commissioning with you.",
  },
  {
    key: "training",
    title: "Technician training",
    // Service & Training: Kalaburagi Technician Training Centre (opening 2027).
    text: "From 2027, BESS technician training in Kalaburagi will happen on live TCL and Hithium hardware — not manuals and PDFs.",
  },
  {
    key: "after-sales",
    title: "After-sales & warranty",
    // Service & Training: After-Sales & Warranty.
    text: "Local-first warranty handling — we manage the OEM relationship so your customer relationship stays intact.",
  },
];
