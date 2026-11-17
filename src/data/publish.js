/*
 * Publishing the Step 11 blog posts (data/blogPosts.js) — one line per post.
 *
 *   null          in review: live at its URL so the director can read it by direct link, but hidden —
 *                 robots "noindex, nofollow", no canonical or structured data, not in the sitemap, not on
 *                 /blog, the Resources strip or any Related list, and no page links to it (a link to it in
 *                 another post's text shows as plain text until it is published).
 *   "2026-11-20"  published that day: indexed, in the sitemap and on /blog, with Article, BreadcrumbList
 *                 and FAQPage data, and that date as its published date.
 *
 * "what-is-bess" is the refresh of the live article (REFRESHES): while it is in review it is read at
 * /blog/what-is-bess-review and the live article stays as it is; its date swaps it in at /blog/what-is-bess,
 * keeping the original published date and showing the date given as "Updated".
 *
 * scripts/check-blog-review.mjs (part of npm run build) fails the build if a post in review is linked from
 * any other page or appears in the sitemap, or if a published one is missing from the sitemap.
 */
export const PUBLISH = {
  "what-is-bess": null,
  "why-india-needs-battery-energy-storage": null,
  "dc-coupled-vs-ac-coupled-vs-hybrid-bess": null,
  "how-bess-is-designed-and-sized": null,
  "inside-a-bess-bms-pcs-ems-cooling-fire-safety": null,
  "commercial-industrial-bess-india-guide": null,
  "tod-tariff-karnataka-battery-storage": null,
  "peak-shaving-demand-charges-bess": null,
  "solar-plus-storage-zero-export-epc-guide": null,
  "tcl-blueark-hithium-bess-solutions-india": null,
};

/** Refreshes of live articles: while in review they are read at /blog/<slug><REVIEW_SUFFIX>. */
export const REFRESHES = ["what-is-bess"];
export const REVIEW_SUFFIX = "-review";

/** The URL path a post is read at while in review. */
export const reviewPath = (slug) => `/blog/${slug}${REFRESHES.includes(slug) ? REVIEW_SUFFIX : ""}`;
