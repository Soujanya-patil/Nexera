import { partnerOf } from "../data/products";

/**
 * The two enquiry links a product offers (catalogue cards, product pages, /resources):
 *
 * docHref — the homepage contact form asking for the product's document: its segment preselects the
 *   interest, and `doc` (+ `kind` for a brochure) pre-fills the message (HomeContact) — "Please send me
 *   the datasheet for TCL BlueArk W10." — which the visitor can still edit. There are no datasheet files
 *   on the site: every datasheet is sent on request.
 *
 * discussHref — the contact page with the product pre-selected (/contact?product=<id>), the same as the
 *   product page's "Enquire About This System".
 */
export const docHref = (product, kind = "Datasheet") => {
  const interest = product.applications.includes("utility") && !product.applications.includes("ci") ? "utility" : "ci";
  const name = `${partnerOf(product.partner).name} ${product.name}`;
  const q = new URLSearchParams({ interest, doc: name });
  if (kind === "Brochure") q.set("kind", "brochure");
  return `/#contact?${q}`;
};

export const discussHref = (product) => `/contact?product=${product.id}`;
