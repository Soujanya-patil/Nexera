import { PRODUCTS, productLabel } from "./products";

/*
 * Datasheets for systems that are not in the product catalogue (data/products.js): shown on /resources
 * only, with no product page, in the same shape as a catalogue entry. None at present (the TCL BlueArk
 * X10 started here and is now a catalogue product).
 */
export const DATASHEET_ONLY = [];

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
