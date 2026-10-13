/*
 * NEXERA's business details, exactly as on its Google Business Profile — shown in the footer, on the
 * Contact page and the homepage contact section, and written as structured data (src/seo/routes.js).
 *
 * The phone number is read at build time from VITE_CONTACT_PHONE (set for the deploy build in
 * .github/workflows/deploy.yml; locally, in .env.local); without it, no phone number is shown.
 */
const ENV = import.meta.env ?? {};

/** The name on the Google Business Profile. */
export const BUSINESS_NAME = "NEXERA Power Tech";
export const ADDRESS = "2nd Floor, 31, 9th Main Road, Chowdappa Layout, Hampi Nagar, Vijayanagar 2nd Stage, Bengaluru, Karnataka 560104";
/** The same address in schema.org PostalAddress parts. */
export const ADDRESS_PARTS = {
  street: "2nd Floor, 31, 9th Main Road, Chowdappa Layout, Hampi Nagar, Vijayanagar 2nd Stage",
  locality: "Bengaluru",
  region: "Karnataka",
  postalCode: "560104",
  country: "IN",
};
export const PHONE = (ENV.VITE_CONTACT_PHONE || "").trim();
/** "+91 97423 53341" → "tel:+919742353341" */
export const phoneHref = (phone) => `tel:${phone.replace(/[^\d+]/g, "")}`;
/** Opening hours (as on the Business Profile): Monday to Saturday, 09:00–18:00. */
export const HOURS = { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], opens: "09:00", closes: "18:00" };
