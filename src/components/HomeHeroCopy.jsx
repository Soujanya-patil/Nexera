import { Fragment, useEffect, useRef, useState } from "react";
import { ChartNoAxesColumnIncreasing, Leaf, Zap } from "lucide-react";
import MagneticButton from "./ui/MagneticButton";
import { loadGsap } from "../lib/motion";

const trust = [
  { icon: Zap, lines: ["Cleaner Energy", "Round the Clock"] },
  { icon: ChartNoAxesColumnIncreasing, lines: ["Lower Costs", "Higher Reliability"] },
  { icon: Leaf, lines: ["A Stronger,", "Greener India"] },
];

// The headline, pre-split into its three lines and their words (so there is no runtime splitting,
// no reflow and no flash of unstyled text). The line breaks are the ones the heading already had at
// every width.
const LINES = [
  { words: ["Powering", "India’s"] },
  { words: ["Transition", "to"] },
  { words: ["Smart", "Energy", "Storage"], accent: true },
];

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Home hero copy: the text column only (layout, copy, colours and type unchanged).
 *
 * ENTRANCE — one GSAP timeline on load (weighted easing, no bounce):
 *   0.00 eyebrow  ·  0.15 / 0.28 headline lines 1–2, word by word (~55 ms apart)
 *   0.41 "Smart Energy Storage" — slightly stronger: longer rise, 0.97 → 1 scale and a soft green glow
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
 * prefers-reduced-motion: text shows immediately; no entrance, depth or scroll motion; hover states stay.
 */
export default function HomeHeroCopy({ parallax, subdued }) {
  const column = useRef(null);
  const [intro, setIntro] = useState(() => (reducedMotion() ? "done" : "pending"));

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
          const tl = gsap.timeline({ defaults: { ease: "power3.out" }, onComplete: () => setIntro("done") });
          const from = (targets, vars, at) =>
            tl.fromTo(targets, { opacity: 0, ...vars.from }, { opacity: 1, ...vars.to, clearProps: "all" }, at);

          from(q('[data-a="eyebrow"]'), { from: { y: 20 }, to: { y: 0, duration: 0.6 } }, 0);
          from(q('[data-line="0"] [data-word]'), { from: { y: 50, filter: "blur(6px)" }, to: { y: 0, filter: "blur(0px)", duration: 0.85, stagger: 0.055 } }, 0.15);
          from(q('[data-line="1"] [data-word]'), { from: { y: 50, filter: "blur(6px)" }, to: { y: 0, filter: "blur(0px)", duration: 0.85, stagger: 0.055 } }, 0.28);
          from(
            q('[data-line="2"] [data-word]'),
            {
              from: { y: 58, scale: 0.97, filter: "blur(8px)", textShadow: "0 0 28px rgba(144,217,136,0.65)" },
              to: { y: 0, scale: 1, filter: "blur(0px)", textShadow: "0 0 0px rgba(144,217,136,0)", duration: 1.05, stagger: 0.06, ease: "expo.out" },
            },
            0.41
          );
          from(q('[data-a="para"]'), { from: { y: 18, filter: "blur(4px)" }, to: { y: 0, filter: "blur(0px)", duration: 0.5, ease: "power2.out" } }, 0.65);
          from(q('[data-a="cta"]'), { from: { y: 14, scale: 0.96 }, to: { y: 0, scale: 1, duration: 0.6, stagger: 0.1 } }, 0.85);
          from(q('[data-a="trust"]'), { from: { y: 10 }, to: { y: 0, duration: 0.6, ease: "power2.out" } }, 1.05);
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
    if (!el || reducedMotion()) return;
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
  }, []);

  const depth = (k) =>
    parallax
      ? {
          transform: `translate3d(calc(var(--mx, 0) * ${k}px * var(--depth)), calc(var(--my, 0) * ${k * 0.6}px * var(--depth)), 0)`,
          transition: "transform 1000ms cubic-bezier(0.22, 1, 0.36, 1)",
        }
      : undefined;

  return (
    <div ref={column} data-intro={intro} className="max-w-xl origin-left lg:max-w-none">
      <div className={`transition-opacity duration-700 ease-out ${subdued ? "lg:opacity-75" : "opacity-100"}`}>
        <p data-a="eyebrow" className="text-xs font-medium uppercase tracking-[0.22em] text-ice/80">
          Battery Energy Storage Systems
        </p>
        <h1
          style={depth(3)}
          className="mt-5 text-[clamp(2.1rem,3.9vw,3.2rem)] font-semibold leading-[1.1] tracking-tight [--depth:0.5] xl:[--depth:1]"
        >
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
              return (
                <span key={i} data-line={i} className="block">
                  {words}
                </span>
              );
            }
            return (
              // Extra depth on the focal line (its transform), hover lift on `translate` — separate
              // properties, so the two never override each other.
              <span key={i} data-line={i} className="block" style={depth(2)}>
                <span
                  className={`inline-block text-signal transition-[filter,translate] duration-500 ease-out hover:-translate-y-0.5 hover:brightness-110 ${
                    intro === "done" ? "hero-accent-sheen" : ""
                  }`}
                >
                  {words}
                </span>
              </span>
            );
          })}
        </h1>
        <p data-a="para" className="mt-6 max-w-md text-base leading-relaxed text-ice/80">
          Bridging world-class BESS technology with India&rsquo;s solar ecosystem through distribution, design,
          training and service.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <span data-a="cta" className="inline-block">
            <MagneticButton to="/solutions" arrow className="hover:scale-[1.02]">
              Explore Solutions
            </MagneticButton>
          </span>
          <span data-a="cta" className="inline-block">
            <MagneticButton to="/become-a-partner" variant="outline" className="hover:-translate-y-0.5">
              Partner with Us
            </MagneticButton>
          </span>
        </div>
        <ul data-a="trust" className="mt-10 grid max-w-xl grid-cols-3 divide-x divide-white/15">
          {trust.map(({ icon: Icon, lines }) => (
            <li
              key={lines[0]}
              className="flex flex-col items-start gap-2 px-3 first:pl-0 sm:flex-row sm:items-center sm:gap-3 sm:px-4 lg:flex-col lg:items-start lg:gap-2 xl:flex-row xl:items-center xl:gap-3"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-signal/70 text-signal">
                <Icon aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
              </span>
              <span className="whitespace-nowrap text-xs leading-snug text-ice/85">
                {lines[0]}
                <br />
                {lines[1]}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
