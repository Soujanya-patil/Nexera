import { BLOG_POST_META } from "./blogPostMeta";
import { PUBLISH, REVIEW_SUFFIX } from "./publish";

/*
 * Article metadata — what every page except the article itself needs: the /blog list and its cards, the
 * Resources strip, the Solutions pages' guide link, the product pages' guide link and the route table.
 * Titles, slugs, category, dates, status and reading time, plus each article's contents list (`toc`, for
 * the featured card's "Start here"); never the text. The text is in data/articles.js (and
 * data/blogPosts.js), which only the article page loads — getArticle() there joins the two by `key`.
 *
 * Status: "published", or "review" for a Step 11 post that isn't published yet (data/publish.js: live at
 * its URL for the director, hidden everywhere else). Drafts (`draft: true`) exist in development only.
 */

/** The live "What Is a BESS?" (published 8 October 2026). The Step 11 refresh replaces it once approved. */
const WHAT_IS_BESS_V1 = {
  key: "what-is-bess-v1",
  slug: "what-is-bess",
  title: "What Is a BESS? Battery Energy Storage Explained | Nexera",
  description: "How battery energy storage systems (BESS) work and where they pay off for Indian homes, businesses and utilities.",
  shortTitle: "What Is a BESS?",
  eyebrow: "Guide",
  // The Solutions pages that link to it as their guide (FaqList `guide`).
  segments: ["residential", "ci", "utility"],
  // Link-preview image (1200x630 JPG, scripts/share-images.py).
  shareImage: "/og/blog-what-is-bess.jpg",
  h1: "What Is a BESS? A Plain Guide to Battery Energy Storage",
  datePublished: "2026-10-08T17:39:00+05:30",
  dateModified: "2026-10-08T17:39:00+05:30",
  // Counted from its text (data/articles.js warns in development if the text changes the count).
  readingTime: 4,
  toc: [
    { id: "bess-full-form", h2: "BESS full form" },
    { id: "how-a-bess-works", h2: "How does a BESS work?" },
    { id: "main-parts", h2: "The main parts of a BESS" },
    { id: "key-terms", h2: "Key terms, explained simply" },
    { id: "types-by-scale", h2: "Types of BESS by scale" },
    { id: "uses", h2: "What is a BESS used for?" },
    { id: "choosing", h2: "How to choose the right BESS" },
  ],
};

/**
 * Draft articles: written and kept in data/articles.js, but not published. They exist only in development
 * (`npm run dev`), where each can be reviewed at its own URL; a production build leaves them out entirely
 * (import.meta.env.DEV is false there): no page, no pre-render, no sitemap entry, not on /blog, the
 * Resources strip, the Blog's structured data or any Related links, and a link to one in an article's text
 * shows as plain text.
 */
const DRAFTS = import.meta.env.DEV
  ? [
      {
        key: "lfp-vs-nmc",
        slug: "lfp-vs-nmc",
        draft: true,
        title: "LFP vs NMC Batteries for Energy Storage | NEXERA",
        description:
          "LFP vs NMC: how lithium iron phosphate (LiFePO4) and NMC batteries compare on safety, cycle life, energy density and cost for home and business storage.",
        shortTitle: "LFP vs NMC",
        eyebrow: "Guide",
        h1: "LFP vs NMC: Which Battery Chemistry Suits Energy Storage?",
        // The Guides card's scene when this is the featured guide (components/resources/GuidesBento).
        card: "cells",
        datePublished: "2026-10-13T06:04:00+05:30",
        dateModified: "2026-10-13T06:04:00+05:30",
        toc: [
          { id: "what-is-lfp", h2: "What is an LFP (LiFePO4) battery?" },
          { id: "what-is-nmc", h2: "What is an NMC battery?" },
          { id: "is-lfp-lithium-ion", h2: "Is LFP a lithium-ion battery?" },
          { id: "at-a-glance", h2: "LFP vs NMC at a glance" },
          { id: "why-lfp", h2: "Why most energy storage systems use LFP" },
          { id: "how-long", h2: "How long does an LFP battery last?" },
          { id: "indoor-safety", h2: "Is LFP safer than NMC for indoor installation?" },
          { id: "nexera-lfp", h2: "Which NEXERA systems use LFP?" },
        ],
      },
      {
        key: "bess-safety-standards-india",
        slug: "bess-safety-standards-india",
        // Waiting for the director's review and a final check of the official CEA notification.
        draft: true,
        title: "BESS Safety Standards & Certification in India | NEXERA",
        description:
          "BESS safety in India explained: BIS registration, IEC 62619, IEC 62933, UL 9540A fire testing and the CEA safety rules for battery energy storage.",
        shortTitle: "BESS Safety Standards",
        eyebrow: "Guide",
        h1: "BESS Safety Standards and Certification in India",
        datePublished: "2026-10-14T12:00:00+05:30",
        dateModified: "2026-10-14T12:00:00+05:30",
        toc: [
          { id: "why-safety-matters", h2: "Why BESS safety matters" },
          { id: "safety-standards", h2: "The main safety standards for battery storage" },
          { id: "bis-certification", h2: "BIS certification for lithium batteries in India" },
          { id: "cea-rules", h2: "The CEA safety rules for BESS" },
          { id: "safety-features", h2: "Safety features to look for in a BESS" },
          { id: "supplier-questions", h2: "What to ask your BESS supplier" },
          { id: "a-note", h2: "A note on this guide" },
        ],
      },
    ]
  : [];

// The Step 11 posts (data/blogPostMeta.js), each in review until data/publish.js gives it a date.
const ist = (date) => `${date}T09:00:00+05:30`;
const STEP11 = BLOG_POST_META.map(({ minutes, ...p }) => {
  const date = PUBLISH[p.slug];
  if (date !== null && !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error(`PUBLISH["${p.slug}"]: null or a "YYYY-MM-DD" date, not ${date}`);
  const post = { ...p, key: p.slug, readingTime: minutes, status: date ? "published" : "review" };
  if (p.slug !== WHAT_IS_BESS_V1.slug) return date ? { ...post, datePublished: ist(date), dateModified: ist(date) } : post;
  // The refresh of the live article: in review it is read at /blog/what-is-bess-review; once dated it
  // takes the live article's URL, its guide links, share image and published date.
  const carried = { segments: WHAT_IS_BESS_V1.segments, shareImage: WHAT_IS_BESS_V1.shareImage };
  return date
    ? { ...post, ...carried, datePublished: WHAT_IS_BESS_V1.datePublished, dateModified: ist(date) }
    : { ...post, slug: p.slug + REVIEW_SUFFIX, refreshOf: p.slug };
});
const refreshLive = STEP11.some((a) => a.slug === WHAT_IS_BESS_V1.slug);

const ALL = [...(refreshLive ? [] : [{ ...WHAT_IS_BESS_V1, status: "published" }]), ...STEP11, ...DRAFTS];

/** The published articles: the ones /blog, the Resources strip, the sitemap and the routes list. */
export const ARTICLES = ALL.filter((a) => !a.draft && a.status !== "review");
/** The articles in review (Step 11): live at their URL for the director, hidden everywhere else. */
export const REVIEW_ARTICLES = ALL.filter((a) => a.status === "review");
/** The drafts (development only; none in a production build). */
export const DRAFT_ARTICLES = ALL.filter((a) => a.draft);

/** The published article a Solutions segment page links to as its guide (`segments`), if any. */
export const guideFor = (segment) => ARTICLES.find((a) => a.segments?.includes(segment));

/** The metadata for a URL slug — any letter case, surrounding slashes ignored (slugs are lowercase). */
export const getArticleMeta = (slug = "") => {
  const s = slug.replace(/^\/+|\/+$/g, "").toLowerCase();
  return ALL.find((a) => a.slug === s);
};

/**
 * Whether a site path is an article no page may link to: one that isn't published (in review, a draft, or
 * none at all). Links to it show as plain text and Related cards leave it out.
 */
export const isHiddenArticle = (to = "") => {
  if (!to.startsWith("/blog/")) return false;
  const slug = to.slice("/blog/".length).split(/[?#]/)[0].replace(/\/+$/, "").toLowerCase();
  return !ARTICLES.some((a) => a.slug === slug);
};

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
/** "2026-10-08T16:45:00+05:30" → "8 October 2026" (read from the ISO text itself, so the server and the browser agree). */
export function formatDate(iso) {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}
