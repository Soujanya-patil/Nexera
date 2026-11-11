import { Fragment, useEffect, useRef, useState } from "react";
import { ChartNoAxesColumnIncreasing, Leaf, Zap } from "lucide-react";
import MagneticButton from "./ui/MagneticButton";
import { loadGsap } from "../lib/motion";
import { isFirstLoad } from "../lib/firstLoad";
import { DUR, EASE, STAGGER } from "../lib/tokens";

// The three proof points (director's Final Copy), each pre-broken into the lines it shows.
const trust = [
  { icon: ChartNoAxesColumnIncreasing, lines: ["Cut peak-hour", "power costs"] },
  { icon: Leaf, lines: ["Reduce diesel", "generator use"] },
  { icon: Zap, lines: ["Keep operations", "running through", "outages"] },
];

// The headline, pre-split into its three lines and their words (so there is no runtime splitting,
// no reflow and no flash of unstyled text). The line breaks are the ones the heading already had at
// every width.
const LINES = [
  { words: ["for", "India’s"] },
  { words: ["Homes,", "Businesses"] },
  { words: ["and", "Grids"], accent: true },
];

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Home hero copy: the text column only (layout, copy, colours and type unchanged).
 *
 * ENTRANCE — one GSAP timeline on load (weighted easing, no bounce):
 *   0.00 eyebrow  ·  0.15 / 0.28 headline lines 1–2, word by word (~55 ms apart)
 *   0.41 "and Grids" — slightly stronger: longer rise, 0.97 → 1 scale and a soft green glow
 *        that fades as it lands  ·  0.65 paragraph as one block  ·  0.85 / 0.95 CTAs  ·  trust row last.
 *   Words and blocks go opacity + y + a small blur → sharp; every inline style is cleared when done.
 *   Until GSAP has built the timeline the animated parts are held at opacity 0 by [data-intro] CSS;
 *   if it doesn't load within 2.5 s they are simply shown.
 *
 * ALIVE — layers kept separate so no two animations fight over one `transform`:
 *   column  → ScrollTrigger: as the hero scrolls away it lifts 30 px, dims to 0.85, scales to 0.98;
 *   inner   → dims a little while the cabinet is open, so product and hotspots lead;
 *   heading → pointer depth from the section's --mx/--my (set by HomeHero): ~3 px, the green line ~5 px,
 *             halved below 1280 px, off for touch;
 *   words / paragraph / button wrappers → the entrance.
 *   The green line brightens and lifts 2 px on hover, with a single highlight sweep (no idle shimmer).
 *
 * In the desktop scroll story (`story`) the scroll-away lift is off: HomeHero's wrapper steps the whole
 * copy back and forward instead, driven by the story's progress.
 *
 * HOVER — Explore BESS Solutions: magnetic pull, arrow nudge, and a soft light that follows the pointer
 * across the green; Become a Partner (/become-a-partner): magnetic pull and a short
 * green light travelling around its border. Trust points: the icon lifts and fills green, a small green rule draws under the text and
 * the text brightens.
 *
 * prefers-reduced-motion: text shows immediately; no entrance, depth or scroll motion; hover states stay.
 */
export default function HomeHeroCopy({ parallax, subdued, story = false }) {
  const column = useRef(null);
  // A first load shows the copy as pre-rendered (no entrance: it is the first screen and the LCP);
  // the entrance plays on client-side navigations.
  const [intro, setIntro] = useState(() => (typeof window === "undefined" || isFirstLoad() || reducedMotion() ? "done" : "pending"));

  useEffect(() => {
    if (intro === "done") return;
    const el = column.current;
    let cancelled = false;
    let ctx;
    // Never leave the copy hidden if GSAP is slow or fails.
    const safety = setTimeout(() => !cancelled && setIntro("done"), 2500);

    loadGsap()
      .then(({ gsap }) => {
        if (cancelled || !el) return;
        clearTimeout(safety);
        const q = gsap.utils.selector(el);
        ctx = gsap.context(() => {
          const tl = gsap.timeline({ defaults: { ease: EASE.emphasized }, onComplete: () => setIntro("done") });
          const from = (targets, vars, at) =>
            tl.fromTo(targets, { opacity: 0, ...vars.from }, { opacity: 1, ...vars.to, clearProps: "all" }, at);

          from(q('[data-a="eyebrow"]'), { from: { y: 20 }, to: { y: 0, duration: DUR.base } }, 0);
          from(q('[data-line="0"] [data-word]'), { from: { y: 50 }, to: { y: 0, duration: DUR.slow, stagger: STAGGER } }, 0.15);
          from(q('[data-line="1"] [data-word]'), { from: { y: 50 }, to: { y: 0, duration: DUR.slow, stagger: STAGGER } }, 0.28);
          from(
            q('[data-line="2"] [data-word]'),
            {
              from: { y: 58, scale: 0.97 },
              to: { y: 0, scale: 1, duration: DUR.slow, stagger: STAGGER, ease: EASE.emphasized },
            },
            0.41
          );
          from(q('[data-a="para"]'), { from: { y: 18 }, to: { y: 0, duration: DUR.base, ease: EASE.standard } }, 0.65);
          from(q('[data-a="cta"]'), { from: { y: 14, scale: 0.96 }, to: { y: 0, scale: 1, duration: DUR.base, stagger: STAGGER } }, 0.85);
          from(q('[data-a="trust"]'), { from: { y: 10 }, to: { y: 0, duration: DUR.base, ease: EASE.standard } }, 1.05);
          setIntro("running");
        }, el);
      })
      .catch(() => !cancelled && setIntro("done"));

    return () => {
      cancelled = true;
      clearTimeout(safety);
      ctx?.revert();
    };
    // Runs once on mount; `intro` only moves forward from here.
  }, []);

  // Scroll-away: lift, dim and settle the column as the hero leaves (scrubbed, so it reverses).
  useEffect(() => {
    const el = column.current;
    if (!el || reducedMotion() || story) return;
    const small = window.matchMedia("(max-width: 1023px)").matches;
    let cancelled = false;
    let ctx;
    loadGsap().then(({ gsap }) => {
      if (cancelled) return;
      ctx = gsap.context(() => {
        gsap.fromTo(
          el,
          { y: 0, opacity: 1, scale: 1 },
          {
            y: small ? -18 : -30,
            opacity: 0.85,
            scale: 0.98,
            ease: "none",
            scrollTrigger: { trigger: el.closest("section"), start: "top top", end: "bottom top", scrub: 0.5 },
          }
        );
      }, el);
    });
    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [story]);

  const depth = (k) =>
    parallax
      ? {
          transform: `translate3d(calc(var(--mx, 0) * ${k}px * var(--depth)), calc(var(--my, 0) * ${k * 0.6}px * var(--depth)), 0)`,
          transition: "transform 1000ms cubic-bezier(0.22, 1, 0.36, 1)",
        }
      : undefined;

  return (
    <div ref={column} data-intro={intro} className="relative z-10 max-w-xl origin-left lg:max-w-none">
      <div className={`transition-opacity duration-slow ease-standard ${subdued ? "lg:opacity-75" : "opacity-100"}`}>
        {/* The eyebrow is the heading's first line (it names the page's subject, the headline doesn't);
            it looks as before. The h1 itself has no classes: leading/tracking set inherited variables
            that would reach the eyebrow, so the headline's styles sit on its own span. */}
        <h1>
          <span data-a="eyebrow" className="block eyebrow text-paper/80">
            Battery Energy Storage Systems (BESS)
          </span>{" "}
          <span
            style={depth(3)}
            className="mt-5 block text-h1 font-semibold [--depth:0.5] xl:[--depth:1]"
          >
            {/* From 1024 px each line stays one line (lg:whitespace-nowrap): in IBM Plex it always fits,
                but at 1024 the stand-in shown while the font loads is a few px wider and used to wrap,
                moving the whole hero once the font arrived. */}
            {LINES.map((line, i) => {
              // The space sits between the word spans, not inside them: trailing whitespace inside an
              // inline-block collapses, which would run the words together while they animate.
              const words = line.words.map((w, j) => (
                <Fragment key={w}>
                  {j > 0 && " "}
                  {/* inline-block only while the words animate; plain inline afterwards so the
                      accent's background-clipped sheen covers them as ordinary text. */}
                  <span data-word className={intro === "done" ? undefined : "inline-block"}>
                    {w}
                  </span>
                </Fragment>
              ));
              if (!line.accent) {
                // The trailing space keeps this line's last word apart from the next line's first in
                // the heading's text (what crawlers and screen readers read); at the end of a block
                // line it renders nothing.
                return (
                  <span key={i} data-line={i} className="block lg:whitespace-nowrap">
                    {words}{" "}
                  </span>
                );
              }
              return (
                // Extra depth on the focal line (its transform), hover lift on `translate` — separate
                // properties, so the two never override each other.
                <span key={i} data-line={i} className="block lg:whitespace-nowrap" style={depth(2)}>
                  <span
                    className={`inline-block text-accent transition-[filter,translate] duration-base ease-standard hover:-translate-y-0.5 focus-visible:-translate-y-0.5 hover:brightness-110 focus-visible:brightness-110 ${
                      intro === "done" ? "hero-accent-sheen" : ""
                    }`}
                  >
                    {words}
                  </span>
                </span>
              );
            })}
          </span>
        </h1>
        {/* The tagline (not a heading) and the sub-line arrive together, as the paragraph did. */}
        <div data-a="para" className="mt-6 max-w-md text-body">
          <p className="font-semibold text-white">Store today. Power tomorrow.</p>
          <p className="mt-2 text-paper/80">
            Nexera Powertech is the authorised distributor of TCL and Hithium battery energy storage in India, with
            local stock, system design, commissioning and service.
          </p>
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <span data-a="cta" className="inline-block">
            <MagneticButton to="/solutions" arrow spotlight>
              Explore BESS Solutions
            </MagneticButton>
          </span>
          <span data-a="cta" className="inline-block">
            <MagneticButton to="/become-a-partner" variant="outline" sweep>
              Become a Partner
            </MagneticButton>
          </span>
        </div>
        <ul data-a="trust" className="mt-10 grid max-w-xl grid-cols-3 divide-x divide-white/15">
          {trust.map(({ icon: Icon, lines }) => (
            <li
              key={lines[0]}
              className="group/trust flex flex-col items-start gap-2 px-3 first:pl-0 sm:flex-row sm:items-center sm:gap-3 sm:px-4 lg:flex-col lg:items-start lg:gap-2 xl:flex-row xl:items-center xl:gap-3"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/20 text-white transition-[background-color,color,translate] duration-base ease-standard group-hover/trust:-translate-y-0.5 group-focus-visible/trust:-translate-y-0.5 group-focus-within/trust:-translate-y-0.5 group-hover/trust:bg-accent group-focus-visible/trust:bg-accent group-focus-within/trust:bg-accent group-hover/trust:text-on-accent group-focus-visible/trust:text-on-accent group-focus-within/trust:text-on-accent">
                <Icon aria-hidden="true" className="h-4 w-4 transition-transform duration-base ease-standard group-hover/trust:scale-110 group-focus-visible/trust:scale-110 group-focus-within/trust:scale-110" strokeWidth={1.8} />
              </span>
              <span className="whitespace-nowrap text-micro text-paper/85 transition-colors duration-fast group-hover/trust:text-white group-focus-visible/trust:text-white group-focus-within/trust:text-white">
                {/* A space before each break keeps the words apart in the text that is read out. */}
                {lines.map((line, i) => (
                  <Fragment key={line}>
                    {i > 0 && (
                      <>
                        {" "}
                        <br />
                      </>
                    )}
                    {line}
                  </Fragment>
                ))}
                <span aria-hidden="true" className="mt-1.5 block h-px w-8 origin-left scale-x-0 bg-accent transition-[scale] duration-base ease-standard group-hover/trust:scale-x-100 group-focus-visible/trust:scale-x-100 group-focus-within/trust:scale-x-100" />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
