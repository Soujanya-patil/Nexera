/*
 * Home page FAQ — rendered on the page (components/HomeBelow.jsx, FaqList) and written as FAQPage
 * structured data (src/seo/routes.js → scripts/seo-pages.mjs) from this one list, so the two are always
 * word for word the same. Text from the director's "Nexera_Website_Final_Copy".
 */
export const HOME_FAQ = [
  {
    q: "What is a BESS?",
    a: "A battery energy storage system stores electricity from solar or the grid in batteries and releases it when you need it, such as in the evening peak or during an outage.",
  },
  {
    q: "Which battery brands does Nexera Powertech supply?",
    a: "Nexera is an authorised distributor of TCL and Hithium energy storage in India.",
  },
  {
    // Added 2026-11-26 (SEO audit). Product pages' FAQ: "available in India through NEXERA, an authorised
    // TCL distributor. TCL designs and manufactures the system; NEXERA supplies it and provides design,
    // commissioning, training and after-sales support"; the catalogue's four TCL BlueArk systems.
    q: "Is TCL BlueArk available in India, and who supports it?",
    a: "Yes. The TCL BlueArk X1, X5, W10 and X10 are available in India through Nexera, an authorised TCL distributor. TCL designs and manufactures the systems; Nexera supplies them and provides design, commissioning, training and after-sales support.",
  },
  {
    q: "Can battery storage reduce diesel generator use?",
    a: "Yes. A BESS can supply backup power during outages, so the generator runs less. The saving depends on your load and how often the grid fails.",
  },
  {
    q: "How do I know what size system I need?",
    a: "Size depends on your load profile, power tariff and solar capacity. Send your bills and load profile, and Nexera will return a sizing check and single-line diagram.",
  },
  {
    q: "Does Nexera help with installation and service?",
    a: "Nexera provides design support, commissioning or supervised commissioning, warranty-claim filing with the manufacturer, and installer training. EPC partners carry out the installation.",
  },
  {
    q: "What warranty does the TCL BlueArk X5 carry in India?",
    a: "TCL's Limited Warranty V1.3 lists India as an applicable country. It covers battery packs for 10 years and the hybrid inverter (PCS) for 5 years, subject to the warranty conditions. Ask us for the full terms.",
  },
  {
    // Added 2026-11-26 (SEO audit); no warranty years. About: "We register every system and handle claims
    // with the manufacturer on your behalf"; Service & Training: "Local-first warranty handling — we manage
    // the OEM relationship so your customer relationship stays intact"; Home partners: spares stock in India.
    q: "Who handles the warranty if an imported BESS fails in India?",
    a: "Nexera does. We register every system and handle warranty claims with the manufacturer on your behalf. Warranty handling is local-first: we manage the OEM relationship so your customer relationship stays intact, and we hold spares stock in India.",
  },
];
