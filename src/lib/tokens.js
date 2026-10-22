/*
 * Motion tokens: the one set of durations, easings, staggers and distances every animation on the site
 * uses (GSAP here; CSS through the matching custom properties in index.css — `--dur-*`, `--ease-*`, and
 * the `duration-fast|base|slow`, `ease-standard|emphasized|in-out` utilities). Change a value here AND
 * in index.css's :root block; the pairs below are exact equivalents.
 *
 *   EASE.standard    power2.out  = cubic-bezier(0.33, 1, 0.68, 1)   reveals, hovers, small moves
 *   EASE.emphasized  expo.out    = cubic-bezier(0.16, 1, 0.3, 1)    hero entrances, heading masks, figures
 *   EASE.inOut       power2.inOut = cubic-bezier(0.65, 0, 0.35, 1)  reversible moves (curtains, panels)
 *
 * Long scroll-scrubbed timelines use ease "none" (their progress is the scroll position) and looping
 * ambient animations keep their own slow periods; nothing else defines its own timing.
 */
export const DUR = { fast: 0.2, base: 0.45, slow: 0.8 };
export const EASE = { standard: "power2.out", emphasized: "expo.out", inOut: "power2.inOut", in: "power2.in" };
/** Delay between items entering together (cards, list items, heading lines) … */
export const STAGGER = 0.06;
/** … and never more than this across one group, however many items it has. */
export const MAX_STAGGER = 0.3;
/** How far a revealed element rises (px). */
export const RISE = 20;
/** Smooth-scroll glides to an in-page target (Lenis scrollTo), the same everywhere. */
export const SCROLL_DUR = 1.1;
/** Count-ups (figures) run a little longer than a reveal so the digits can be followed. */
export const COUNT_DUR = 1;

/** Stagger per item for a group of `n` items entering together (capped at MAX_STAGGER overall). */
export const staggerFor = (n, step = STAGGER) => (n > 1 ? Math.min(step, MAX_STAGGER / (n - 1)) : 0);
