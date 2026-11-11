import { PRODUCTS, productLabel } from "./products";
import x10Avif320 from "../assets/catalogue/tcl-blueark-x10-320.avif";
import x10Avif640 from "../assets/catalogue/tcl-blueark-x10-640.avif";
import x10Webp320 from "../assets/catalogue/tcl-blueark-x10-320.webp";
import x10Webp640 from "../assets/catalogue/tcl-blueark-x10-640.webp";

/*
 * Datasheets for systems that are not in the product catalogue (data/products.js): shown on /resources
 * only, with no product page. Same shape as a catalogue entry where the datasheet card reads it.
 *
 * TCL BlueArk X10 (model X10-125K-261), from its datasheet (public/datasheets/tcl-blueark-x10-datasheet.pdf):
 * a hybrid C&I system — 125 kW / 261 kWh with a PV input (up to 250 kWp, 1500 V, 8 MPPTs) and a built-in
 * generator ATS. Not the BlueArk W10, which has the same power and energy but no PV input.
 * Its photo is TCL's own product render from page 1 of that datasheet (already a cut-out on a transparent
 * ground), trimmed and exported at 320 / 640 px wide as AVIF and WebP (`sources`, for a <picture>).
 */
export const DATASHEET_ONLY = [
  {
    id: "tcl-blueark-x10",
    partner: "tcl",
    name: "BlueArk X10",
    applications: ["ci"],
    image: x10Webp640,
    imageSize: [640, 1099],
    sources: [
      { type: "image/avif", srcSet: `${x10Avif320} 320w, ${x10Avif640} 640w` },
      { type: "image/webp", srcSet: `${x10Webp320} 320w, ${x10Webp640} 640w` },
    ],
    imageAlt: "TCL BlueArk X10 C&I energy storage cabinet",
    cardSpecs: ["125 kW", "261 kWh"],
    summary: "A 125 kW / 261 kWh hybrid C&I system with PV input (up to 250 kWp at 1500 V, 8 MPPTs) and diesel-generator support.",
    datasheet: "/datasheets/tcl-blueark-x10-datasheet.pdf",
  },
];

/*
 * The datasheet gate: a datasheet is never linked directly. Its button goes to /contact?datasheet=<id>;
 * the PDF downloads only once that form is sent (pages/Contact.jsx).
 */
/** A system with a datasheet PDF (catalogue or datasheet-only), by id — or null (unknown / no file). */
export function datasheetFor(id) {
  if (!id) return null;
  const p = PRODUCTS.find((x) => x.id === id && x.datasheet) ?? DATASHEET_ONLY.find((x) => x.id === id);
  if (!p) return null;
  const type = p.applications.includes("ci") ? "ci" : p.applications.includes("residential") ? "residential" : "utility";
  return { id: p.id, name: productLabel(p), short: p.name, file: p.datasheet, type };
}

/** The "Request Datasheet" link for a system with a datasheet PDF: the contact form, which then downloads it. */
export const datasheetHref = (p) => `/contact?datasheet=${p.id}`;
