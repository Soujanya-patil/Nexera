/*
 * Home page FAQ — rendered on the page (components/HomeBelow.jsx, FaqList) and written as FAQPage
 * structured data (src/seo/routes.js → scripts/seo-pages.mjs) from this one list, so the two are always
 * word for word the same. Text from the director's "Nexera_Website_Final_Copy".
 *
 * SEO audit (2026-11-27): every answer is 40–60 words and starts with the direct answer (the original
 * sentence, unchanged); the added sentences restate wording the site already has (source beside each).
 */
export const HOME_FAQ = [
  {
    q: "What is a BESS?",
    // + C&I FAQ (data/solutions.js): "A system of batteries, power conversion and energy management".
    a: "A battery energy storage system stores electricity from solar or the grid in batteries and releases it when you need it, such as in the evening peak or during an outage. It combines batteries, power conversion and energy management in one system.",
  },
  {
    q: "Which battery brands does Nexera Powertech supply?",
    // + the catalogue (data/products.js: each product's partner and applications).
    a: "Nexera is an authorised distributor of TCL and Hithium energy storage in India. TCL supplies the BlueArk X1 for homes and the BlueArk X5, W10 and X10 for commercial and industrial sites. Hithium supplies the ∞Power 1022 kWh Cabinet and the ∞Power 6.25 MWh for larger and utility-scale projects.",
  },
  {
    // Added 2026-11-26 (SEO audit). Product pages' FAQ: "available in India through NEXERA, an authorised
    // TCL distributor. TCL designs and manufactures the system; NEXERA supplies it and provides design,
    // commissioning, training and after-sales support"; the catalogue's four TCL BlueArk systems.
    // + Home partners: "We hold spares stock in India".
    q: "Is TCL BlueArk available in India, and who supports it?",
    a: "Yes. The TCL BlueArk X1, X5, W10 and X10 are available in India through Nexera, an authorised TCL distributor. TCL designs and manufactures the systems; Nexera supplies them and provides design, commissioning, training and after-sales support. Nexera also holds spares stock in India.",
  },
  {
    q: "Can battery storage reduce diesel generator use?",
    // + products.js: the X5 works with a generator (datasheet AC input, generator); the X10 supports a
    // generator input. + the Home FAQ below: "Send your bills and load profile… a sizing check".
    a: "Yes. A BESS can supply backup power during outages, so the generator runs less. The saving depends on your load and how often the grid fails. The TCL BlueArk X5 and X10 can also work alongside a generator. Send your bills and load profile for a sizing check.",
  },
  {
    q: "How do I know what size system I need?",
    // + About, the support lifecycle: "Load analysis, right-sized configurations, and a project single-line
    // diagram, including earthing and neutral layout."
    a: "Size depends on your load profile, power tariff and solar capacity. Send your bills and load profile, and Nexera will return a sizing check and single-line diagram. The sizing covers load analysis, a right-sized configuration and a project single-line diagram, including earthing and neutral layout.",
  },
  {
    q: "Does Nexera help with installation and service?",
    // + About, the support lifecycle (remote diagnostics, technical guidance, India spares stock); Service &
    // Training: the Kalaburagi Technician Training Centre, from 2027, live TCL and Hithium hardware.
    a: "Nexera provides design support, commissioning or supervised commissioning, warranty-claim filing with the manufacturer, and installer training. EPC partners carry out the installation. Nexera also offers remote diagnostics, technical guidance and spares stock in India, and from 2027 technicians will train on live TCL and Hithium hardware at our Kalaburagi Technician Training Centre.",
  },
  {
    q: "What warranty does the TCL BlueArk X5 carry in India?",
    // First sentence and second: wording set by NEXERA (2026-11-27). + About: "We register every system and
    // handle claims with the manufacturer on your behalf"; Service & Training: local-first warranty handling.
    a: "The TCL BlueArk X5 carries a 5-year warranty in India, subject to TCL's warranty terms. Full terms are available on request. Nexera registers every system and handles warranty claims with TCL on your behalf; warranty handling is local-first, so your customer relationship stays intact.",
  },
  {
    // Added 2026-11-26 (SEO audit); no warranty years. About: "We register every system and handle claims
    // with the manufacturer on your behalf"; Service & Training: "Local-first warranty handling — we manage
    // the OEM relationship so your customer relationship stays intact"; Home partners: spares stock in India.
    // + About: "issue the commissioning report and warranty registration".
    q: "Who handles the warranty if an imported BESS fails in India?",
    a: "Nexera does. We register every system and handle warranty claims with the manufacturer on your behalf. Warranty handling is local-first: we manage the OEM relationship so your customer relationship stays intact, and we hold spares stock in India. At commissioning, Nexera issues the commissioning report and the warranty registration.",
  },
];
