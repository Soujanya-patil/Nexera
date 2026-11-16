/*
 * The legal pages (Privacy Policy, Terms of Use) and their review switch.
 *
 * LEGAL_REVIEW = true ("hidden review"): the pages are live so the director can read them online, but
 * hidden — robots "noindex, nofollow", not in the sitemap, and no page links to them (the footer Legal row,
 * the forms' and the cookie banner's Privacy Policy links are off; the forms say "See our Privacy Policy."
 * as plain text and the banner links to /contact, as before Step 6). Only the Terms page's own link to the
 * Privacy Policy stays. scripts/check-legal-review.mjs fails the build if any of that is broken.
 *
 * When the director approves: set LEGAL_REVIEW to false — the pages are indexed, in the sitemap and
 * linked from the footer, the forms and the cookie banner.
 */
export const LEGAL_REVIEW = true;

export const PRIVACY_PATH = "/privacy-policy";
export const TERMS_PATH = "/terms-of-use";
export const LEGAL_PATHS = [PRIVACY_PATH, TERMS_PATH];

/** The robots tag a page in review gets (pre-rendered HTML and client-side navigation alike). */
export const REVIEW_ROBOTS = "noindex, nofollow";
