import { useRef } from "react";
import { Link } from "react-router-dom";
import { FEATHER, useMotion, useScrollScene } from "../lib/motion";
import SceneImg from "./SceneImg";

/**
 * Scene 3 — PRODUCT CATEGORIES. One pinned stage, three chapters, escalating rather than tabbed:
 *  - subject: a single home -> an industrial site -> a grid-scale yard (the photography itself widens)
 *  - typography: headline size steps up each chapter
 *  - camera: each incoming chapter starts pushed-in and pulls back to its wide frame
 * Copy is the approved Solutions copy; no capacity figures beyond what that copy already states.
 * Anchor target for the Hero's "Explore Our Systems" CTA (`id="systems"`).
 */
const chapters = [
  {
    id: "residential",
    rail: "Residential BESS",
    name: "Residential BESS",
    headline: "Home Battery Storage — Powered by TCL BlueArk",
    copy: "Backup power, load-shifting, and EV-ready storage for Indian homes.",
    points: ["Backup during outages", "Load-shifting to cut evening costs", "EV-ready configurations"],
    cta: "Explore Residential",
    // TODO(india-imagery): src/assets/scenes/res-house-{800,1500}.webp is a CGI render of a generic non-Indian house; replace with an Indian home, update `alt`.
    img: "res-house",
    alt: "Rendering of a home at night with rooftop solar and a wall-mounted TCL battery beside the garage",
    position: "50% 62%",
    shade: "linear-gradient(90deg, rgba(6,13,22,.78) 0%, rgba(6,13,22,.35) 50%, rgba(6,13,22,.1) 100%)",
    size: "clamp(2rem, 3.6vw, 3.5rem)",
    sizeLight: "clamp(1.75rem, 7vw, 2.25rem)",
    measure: "max-w-2xl",
  },
  {
    id: "ci",
    rail: "Commercial & Industrial",
    name: "Commercial & Industrial (C&I) BESS",
    headline: "C&I Battery Storage for Bangalore & South India",
    copy: "Cut demand charges. Add resilience. Own your load curve.",
    points: ["Peak shaving", "Demand charge reduction", "Backup for critical loads", "Pairs with rooftop solar"],
    cta: "Explore C&I",
    // TODO(india-imagery): review. src/assets/scenes/ci-industrial-{800,1500,1895}.webp is a generic industrial site (no signage) that is not identifiably Indian.
    img: "ci-industrial",
    alt: "TCL floor-standing battery cabinets and inverter beside an industrial building",
    position: "50% 55%",
    shade: "linear-gradient(90deg, rgba(6,13,22,.9) 0%, rgba(6,13,22,.55) 48%, rgba(6,13,22,.12) 100%)",
    size: "clamp(2.4rem, 5vw, 5rem)",
    sizeLight: "clamp(2rem, 8vw, 2.75rem)",
    measure: "max-w-4xl",
  },
  {
    id: "utility",
    rail: "Utility-Scale",
    name: "Utility-Scale BESS",
    headline: "Grid-Scale Storage, Delivered and Commissioned",
    copy: "Hithium 5MWh/6.25MWh DC blocks for grid balancing and renewable firming.",
    points: ["Grid balancing", "Renewable firming", "DISCOM-scale project support"],
    cta: "Explore Utility",
    // TODO(india-imagery): src/assets/scenes/utility-yard-{800,1280,1920}.webp shows Chinese-language signage on a plant gantry; replace with an Indian utility-scale site, update `alt`.
    img: "utility-yard",
    alt: "Aerial view of rows of Hithium battery storage containers at a large site",
    position: "50% 60%",
    shade: "linear-gradient(90deg, rgba(6,13,22,.88) 0%, rgba(6,13,22,.5) 55%, rgba(6,13,22,.15) 100%)",
    size: "clamp(2.8rem, 6.6vw, 7rem)",
    sizeLight: "clamp(2.25rem, 9vw, 3.25rem)",
    measure: "max-w-5xl",
  },
];

const STORY = 210 / 310; // share of the 310vh pin used by this scene's own story; the last 100vh is Product Showcase rising over it

export default function ScaleStory() {
  const { mode } = useMotion();
  const cine = mode === "cinematic";
  const root = useRef(null);

  useScrollScene(
    root,
    ({ gsap, q }) => {
      const $ = (name) => q(`[data-a="${name}"]`);
      const ch = $("chapter");
      const bg = $("chapter-bg");
      const tx = $("chapter-text");
      const ticks = $("tick");

      const P = (x) => x * STORY;

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: 0.5, invalidateOnRefresh: true },
      });

      // Chapter 1 settles into its frame as the stage pins
      tl.fromTo(bg[0], { scale: 1.14 }, { scale: 1, duration: P(0.22) }, 0);

      // Hand-offs: outgoing text leaves, outgoing frame drifts toward the camera and dissolves,
      // incoming frame starts pushed in and pulls back to its wider shot, incoming text rises
      [
        { i: 1, at: 0.28 },
        { i: 2, at: 0.62 },
      ].forEach(({ i, at }) => {
        tl.to(tx[i - 1], { autoAlpha: 0, y: -44, duration: P(0.07), ease: "power1.in" }, P(at))
          .to(bg[i - 1], { scale: 1.12, duration: P(0.2) }, P(at))
          .to(ch[i - 1], { autoAlpha: 0, duration: P(0.14) }, P(at + 0.04))
          .fromTo(ch[i], { autoAlpha: 0 }, { autoAlpha: 1, duration: P(0.14) }, P(at + 0.04))
          .fromTo(bg[i], { scale: 1.24 }, { scale: 1, duration: P(0.3) }, P(at + 0.04))
          .fromTo(tx[i], { autoAlpha: 0, y: 56 }, { autoAlpha: 1, y: 0, duration: P(0.1), ease: "power2.out" }, P(at + 0.14))
          .to(ticks[i - 1], { color: "rgba(242,240,234,0.4)", duration: P(0.05) }, P(at))
          .to(ticks[i], { color: "#F2F0EA", duration: P(0.05) }, P(at + 0.04));
      });

      // Energy line: amber fill tracks the story down the rail
      tl.fromTo($("rail-fill"), { scaleY: 0 }, { scaleY: 1, duration: P(1) }, 0);
      // Hold the final frame while the next scene rises over it; copy and rail leave first
      tl.to(tx[2], { autoAlpha: 0, y: -40, duration: 0.07, ease: "power1.in" }, STORY + 0.02)
        .to($("rail"), { autoAlpha: 0, duration: 0.05 }, STORY + 0.02)
        .to({}, { duration: 1 - P(1) }, P(1));
    },
    cine
  );

  return (
    <section id="systems" ref={root} className={cine ? "relative z-10 -mt-[100vh] h-[410vh] scroll-mt-16" : "relative scroll-mt-16"}>
      <div
        className={cine ? "sticky top-0 h-screen overflow-hidden bg-night text-bone" : "relative bg-night text-bone"}
        style={cine ? FEATHER : undefined}
      >
        {chapters.map((c, i) => (
          <article
            key={c.id}
            data-a="chapter"
            className={cine ? `absolute inset-0 ${i > 0 ? "invisible" : ""}` : "relative min-h-[82svh] overflow-hidden"}
          >
            <SceneImg
              data-a="chapter-bg"
              name={c.img}
              alt={c.alt}
              className="absolute inset-0 h-full w-full object-cover will-change-transform"
              style={{ objectPosition: c.position }}
            />
            <div aria-hidden="true" className="absolute inset-0" style={{ background: c.shade }} />
            <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-night/85 to-transparent" />
            <div
              className={`relative z-10 mx-auto flex max-w-6xl flex-col justify-end px-6 pb-16 pt-28 md:pb-24 ${
                cine ? "h-full" : "min-h-[82svh]"
              }`}
            >
              <div data-a="chapter-text" data-reveal className={`${c.measure} will-change-transform`}>
                <p className="text-sm text-bone/70">{c.name}</p>
                <h2
                  className="mt-3 font-serif font-semibold leading-[1.05] text-bone text-balance"
                  style={{ fontSize: cine ? c.size : c.sizeLight }}
                >
                  {c.headline}
                </h2>
                <p className="mt-5 max-w-xl text-base text-bone/80 md:text-lg">{c.copy}</p>
                <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-bone/75">
                  {c.points.map((p) => (
                    <li key={p} className="flex items-center gap-2">
                      <span aria-hidden="true" className="h-1 w-1 rounded-full bg-signal" />
                      {p}
                    </li>
                  ))}
                </ul>
                <Link
                  to={`/solutions#${c.id}`}
                  className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-signal transition-colors hover:text-bone"
                >
                  {c.cta}
                  <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3 8h9M8 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </div>
            </div>
          </article>
        ))}

        {cine && (
            <div data-a="rail" aria-hidden="true" className="pointer-events-none absolute right-6 top-1/2 z-20 hidden -translate-y-1/2 xl:block">
              <div className="relative rounded-md bg-night/40 py-3 pl-4 pr-5 text-right [text-shadow:0_1px_10px_rgba(6,13,22,0.9)]">
                <div className="absolute right-0 top-0 h-full w-px bg-bone/20" />
                <div data-a="rail-fill" className="absolute right-0 top-0 h-full w-px origin-top bg-amber" />
                <ul className="space-y-9 text-xs">
                  {chapters.map((c, i) => (
                    <li key={c.id} data-a="tick" style={{ color: i === 0 ? "#F2F0EA" : "rgba(242,240,234,0.4)" }}>
                      {c.rail}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
        )}
      </div>
    </section>
  );
}
