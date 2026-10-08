import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SceneImg from "../components/SceneImg";
import { ArrowUnderline, PartnerStrip, Spotlight } from "../components/solutions/Interactive";
import { SOLUTION_PAGES } from "../data/solutions";
import { loadGsap } from "../lib/motion";
import { useScrollReveal } from "../lib/scrollReveal";
import { useRouteTransition } from "../lib/viewTransition";
import { useMediaQuery } from "../lib/scrollSteps";
import { usePanels } from "../lib/panels";
import { isFirstLoad } from "../lib/firstLoad";

// The hero's crossfading segment ribbon: desktop only, its own chunk.
const SegmentRibbon = lazy(() => import("../components/solutions/SegmentRibbon"));

// The Solutions hub: one card per segment, each opening its own page. The card ids are the old
// section ids, so links such as /solutions#ci (Home's Solutions cards) still land on the right card.
const SEGMENTS = [
  {
    id: "residential",
    page: SOLUTION_PAGES.residential.path,
    title: "Residential Energy Storage",
    copy: "Solar power shouldn't stop when the sun goes down. Home battery systems from Midea and TCL.",
    cta: "Explore Residential Solutions",
    img: "res-house",
    alt: "Rendering of a home at night with rooftop solar and a wall-mounted TCL battery beside the garage",
  },
  {
    id: "ci",
    page: SOLUTION_PAGES.ci.path,
    title: "Commercial & Industrial Energy Storage",
    copy: "Reduce peak demand, store solar energy and keep critical loads running with TCL, Hithium and CLOU.",
    cta: "Explore C&I Solutions",
    img: "ci-industrial",
    alt: "TCL floor-standing battery cabinets and inverter beside an industrial building",
  },
  {
    id: "utility",
    page: SOLUTION_PAGES.utility.path,
    title: "Utility-Scale Energy Storage",
    copy: "Grid-scale battery storage from Hithium and CLOU for renewable integration, grid support and round-the-clock power.",
    cta: "Explore Utility Solutions",
    // The same photo the utility page's hero shows, so the card morphs into it.
    img: "utility-solar",
    alt: "Utility-scale battery energy storage containers beside a solar plant",
  },
];

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** The ribbon's footprint (its 4:3 photo box and the label line under it). */
const RibbonSpace = () => (
  <div aria-hidden="true">
    <div className="aspect-[4/3] rounded-2xl bg-deep ring-1 ring-white/10" />
    <div className="mt-4 h-5" />
  </div>
);

/**
 * The hub header (PageHeader's look) with the Solutions entrance: the eyebrow's letter-spacing settles
 * while its rule draws, the h1 is split into its rendered lines (GSAP SplitText, no ARIA changes) and
 * each slides up from behind its mask, then the subtitle fades up. The parts wait (hidden) only until
 * the entrance is ready, at most 2.5 s; reduced motion and arrival by View Transition show them at once.
 */
function HubHeader({ eyebrow, title, subtitle }) {
  const root = useRef(null);
  const wide = useMediaQuery("(min-width: 1024px)");
  // A first load shows the header as pre-rendered (no entrance); client-side navigations get it.
  const [state, setState] = useState(() =>
    typeof window === "undefined" || isFirstLoad() || reduced() || document.documentElement.dataset.vt === "true" ? "done" : "pending"
  );
  useEffect(() => {
    if (state === "done") return;
    const el = root.current;
    let cancelled = false;
    let split;
    let tl;
    const safety = setTimeout(() => !cancelled && setState("done"), 2500);
    Promise.all([loadGsap(), import("gsap/SplitText")])
      .then(([{ gsap }, { SplitText }]) => {
        if (cancelled) return;
        clearTimeout(safety);
        gsap.registerPlugin(SplitText);
        const h1 = el.querySelector("h1");
        split = new SplitText(h1, { type: "lines", mask: "lines", aria: "none", linesClass: "block" });
        const q = gsap.utils.selector(el);
        tl = gsap.timeline({
          onComplete: () => {
            split?.revert();
            split = null;
            if (!cancelled) setState("done");
          },
        });
        tl.fromTo(q('[data-a="eyebrow"]'), { opacity: 0, letterSpacing: "0.4em" }, { opacity: 1, letterSpacing: "normal", duration: 0.6, ease: "power2.out", clearProps: "all" }, 0)
          .fromTo(q('[data-a="rule"]'), { opacity: 1, scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "power2.out", clearProps: "all" }, 0)
          .set(h1, { opacity: 1 }, 0)
          .fromTo(split.lines, { yPercent: 100 }, { yPercent: 0, duration: 0.65, stagger: 0.09, ease: "expo.out" }, 0.1)
          .fromTo(q('[data-a="desc"]'), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", clearProps: "all" }, 0.27);
        setState("running");
      })
      .catch(() => !cancelled && setState("done"));
    return () => {
      cancelled = true;
      clearTimeout(safety);
      tl?.kill();
      split?.revert();
    };
    // Runs once, at mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section ref={root} className="relative overflow-hidden bg-ink text-white">
      <Spotlight />
      <div data-intro={state} className="relative container-site grid items-center gap-12 py-16 md:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
        <div>
          <p data-a="eyebrow" className="mb-3 flex items-center gap-3 text-sm font-medium text-signal">
            <span data-a="rule" aria-hidden="true" className="h-px w-8 origin-left bg-signal/70" />
            {eyebrow}
          </p>
          <h1 data-a="title" className="max-w-2xl font-sans text-3xl font-semibold md:text-4xl">
            {title}
          </h1>
          <p data-a="desc" className="mt-4 max-w-2xl leading-relaxed text-ice/75">
            {subtitle}
          </p>
          <p data-a="desc" className="mt-4 text-sm">
            <Link to="/resources/what-is-bess" className="group/new inline-flex items-center gap-1.5 font-semibold text-signal underline-offset-4 hover:underline">
              New to battery storage? Read: What Is a BESS?
              <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 transition-transform duration-300 group-hover/new:translate-x-0.5" />
            </Link>
          </p>
        </div>
        {/* The ribbon's space is always in the markup (desktop only, CSS), so the hero never changes size
            when the ribbon arrives — it is mounted into it on wide screens. */}
        <div className="hidden lg:block">
          {wide ? (
            <Suspense fallback={<RibbonSpace />}>
              <SegmentRibbon />
            </Suspense>
          ) : (
            <RibbonSpace />
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * A hub card: opening it morphs its photo into the segment hero's photo (the photo only: text never
 * morphs). On desktop it is one of the expanding panels (usePanels): its photo zooms a little as it
 * opens. Touch, small screens and reduced motion: the usual grid of cards.
 */
function SegmentCard({ s }) {
  const open = useRouteTransition(s.page, `[data-vt-hero="${s.id}"]`, { segment: s.id });
  return (
    <Link
      to={s.page}
      onClick={open}
      data-vt-card={s.id}
      className="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-2xl bg-night text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal md:aspect-[4/5]"
    >
      <div data-vt-img className="absolute inset-0 overflow-hidden">
        <SceneImg
          name={s.img}
          alt={s.alt}
          sizes="(min-width: 1024px) 45vw, (min-width: 768px) 33vw, 100vw"
          className="absolute inset-0 h-full w-full object-cover transition-[scale,translate] duration-700 ease-out group-hover:-translate-y-1.5 group-hover:scale-[1.05] group-focus-visible:scale-[1.05]"
        />
      </div>
      <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-night via-night/60 to-night/5" />
      <span aria-hidden="true" className="absolute inset-0 bg-night/0 transition-colors duration-500 group-hover:bg-night/35 group-focus-visible:bg-night/35" />
      {/* In the panels the card's own outline would be clipped by its window: the ring is drawn on the text. */}
      <div
        data-panel-text
        className="relative rounded-2xl p-6 group-focus-visible:outline-2 group-focus-visible:-outline-offset-4 group-focus-visible:outline-signal md:p-7"
      >
        <h2
          className="text-2xl font-semibold transition-colors duration-300 group-hover:text-signal group-focus-visible:text-signal"
        >
          {s.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ice/85">{s.copy}</p>
        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-signal">
          <ArrowUnderline group="card">{s.cta}</ArrowUnderline>
        </span>
      </div>
    </Link>
  );
}

export default function Solutions() {
  const grid = useRef(null);
  const reveal = useScrollReveal(grid, { stagger: 0.1 });
  usePanels(grid);
  return (
    <div className="solutions-page">
      <HubHeader
        eyebrow="Solutions"
        title="Storage built for how you'll actually use it"
        subtitle="Three segments, one supply chain — residential, commercial & industrial, and utility-scale."
      />

      {/* Same card treatment as For EPCs' application cards: partner imagery under a dark gradient. */}
      <section aria-label="Solutions by segment" className="bg-paper py-14 lg:py-20">
        <ul ref={grid} data-sr-state={reveal} className="seg-panels grid container-site gap-5 md:grid-cols-3">
          {SEGMENTS.map((s) => (
            <li key={s.id} id={s.id} data-sr className="scroll-mt-20">
              <SegmentCard s={s} />
            </li>
          ))}
        </ul>
        <PartnerStrip partners={["tcl", "hithium", "clou", "midea"]} className="container-site mt-14" />
      </section>
    </div>
  );
}
