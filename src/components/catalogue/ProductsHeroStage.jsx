import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Pause, Play } from "lucide-react";
import { getProduct, partnerOf } from "../../data/products";
import { isFirstLoad } from "../../lib/firstLoad";
import { COUNT_DUR } from "../../lib/tokens";

/*
 * /products hero, right side: one partner product at a time, small to large, standing on a glowing
 * green floor line with a warm dusk glow behind it, a contact shadow and a faint reflection. Under the
 * line: partner pill, product name (a link), the capacity counting up in green, and the segment.
 * Every name, figure and segment comes from data/products.js (`listed: false` products are skipped).
 *
 * ROTATION — each product holds ~3.5 s, then slides out to the left while the next rises in (0.9 s).
 *   The clock is the active partner's progress bar (a CSS animation, 4.4 s = hold + change); its
 *   animationend moves on. Pausing just pauses that animation, so it resumes where it stopped.
 *   Paused while: the pointer is over the carousel, keyboard focus is inside it, the tab is hidden,
 *   or the hero is off screen. The pause button stops it until pressed again (WCAG 2.2.2).
 * PARTNER LIST — tabs (vertical on the right from 1024 px, three horizontal tabs below that):
 *   click, arrow keys, Home/End, Enter/Space. Clicking the product or its name opens its page.
 * LIVE REGION — polite while the rotation is paused or stopped, so changes you make are announced;
 *   off while it runs on its own, so a screen reader isn't interrupted every few seconds (the ARIA
 *   carousel pattern).
 * REDUCED MOTION — no rotation, slide, count or glow animation; product 1 with all its labels, and
 *   the partner list switches instantly.
 * NO JS / PRE-RENDERED — product 1 with its name, figure and link; all three product links are in the
 *   HTML (the other two slides are hidden and inert).
 * PERFORMANCE — product 1's image is eager (high priority); 2 and 3 are only added after the page's
 *   load event. Every slide reserves its box, so nothing moves when they arrive. Only transform and
 *   opacity animate.
 */

// Rotation order (small to large) and each product's height on the stage relative to the tallest
// (a gentle progression, not a scale drawing). Image sizes are the catalogue cut-outs'.
const ROTATION = [
  { id: "tcl-blueark-x5", scale: 0.8, size: [480, 900] },
  { id: "hithium-power-cabinet-1022", scale: 0.92, size: [640, 900] },
  { id: "clou-aqua-c25s", scale: 1, size: [765, 640] },
];
const SEGMENT = { residential: "Residential", ci: "Commercial & Industrial", utility: "Utility-Scale" };

const files = import.meta.glob("../../assets/products-hero/*.{avif,webp}", { eager: true, query: "?url", import: "default" });
const widths = ([w]) => [Math.round(w / 2), Math.round((w * 3) / 4), w];

const ITEMS = ROTATION.map(({ id, scale, size }) => {
  const product = getProduct(id);
  if (!product || product.listed === false) return null;
  const k = (scale * size[0]) / size[1]; // product width per unit of stage height
  const ws = widths(size);
  const url = (w, ext) => (ext === "webp" && w === size[0] ? product.image : files[`../../assets/products-hero/${id}-${w}.${ext}`]);
  return {
    id,
    product,
    partner: partnerOf(product.partner),
    figure: product.cardSpecs.find((s) => /Wh$/.test(s)),
    segments: product.applications.map((a) => SEGMENT[a]),
    size,
    box: { width: `min(100%, calc(var(--stage-h) * ${k.toFixed(4)}))`, aspectRatio: `${size[0]} / ${size[1]}` },
    // Stage height: 15rem phones, 18rem from 640 px, at most 25rem from 1024 px.
    sizes: `(min-width: 1024px) ${Math.ceil(400 * k)}px, (min-width: 640px) ${Math.ceil(288 * k)}px, ${Math.ceil(240 * k)}px`,
    srcSet: (ext) => ws.map((w) => `${url(w, ext)} ${w}w`).join(", "),
    src: product.image,
  };
}).filter(Boolean);
const N = ITEMS.length;
const pad = (n) => String(n).padStart(2, "0");
const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function ProductPicture({ item, eager, className }) {
  return (
    <picture>
      <source type="image/avif" srcSet={item.srcSet("avif")} sizes={item.sizes} />
      <source type="image/webp" srcSet={item.srcSet("webp")} sizes={item.sizes} />
      <img
        src={item.src}
        alt={eager === "reflection" ? "" : item.product.imageAlt}
        width={item.size[0]}
        height={item.size[1]}
        loading="eager"
        fetchPriority={eager === true ? "high" : undefined}
        decoding="async"
        draggable="false"
        className={className}
      />
    </picture>
  );
}

/** The capacity, counting up from 0 each time `run` changes to a new non-zero token. */
function Figure({ value, run }) {
  const [, num, unit] = value.match(/^(\d[\d,]*(?:\.\d+)?)\s*(.*)$/) ?? [null, value, ""];
  const [shown, setShown] = useState(num);
  useLayoutEffect(() => {
    if (!run) return;
    const decimals = (num.split(".")[1] || "").length;
    const target = parseFloat(num.replace(/,/g, ""));
    setShown((0).toFixed(decimals));
    let raf = 0;
    const start = performance.now() + 120;
    const tick = (now) => {
      const p = Math.max(0, Math.min((now - start) / (COUNT_DUR * 1000), 1));
      setShown(p < 1 ? (target * (1 - Math.pow(1 - p, 3))).toFixed(decimals) : num);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      setShown(num);
    };
  }, [run, num]);
  return (
    <p className="mt-2 font-semibold text-accent">
      <span className="sr-only">{value}</span>
      <span aria-hidden="true">
        {/* The final value, invisible, holds the width; the count sits over it, left-aligned, so its
            first digit never moves (as in CountUp). */}
        <span className="inline-grid text-h2 tabular-nums">
          <span className="invisible col-start-1 row-start-1">{num}</span>
          <span className="col-start-1 row-start-1 text-left">{shown}</span>
        </span>
        {unit && <span className="ml-1.5 text-h4">{unit}</span>}
      </span>
    </p>
  );
}

export default function ProductsHeroStage() {
  const root = useRef(null);
  const tabs = useRef([]);
  // { index, prev }: the slide on show and the one leaving (for the slide-out).
  const [at, setAt] = useState({ index: 0, prev: -1 });
  // Count token: bumps on every change made with motion allowed; 0 = show the figure as it is. A
  // first load shows product 1's figure as pre-rendered; a client-side visit counts it in.
  const [count, setCount] = useState(() => (typeof window === "undefined" || isFirstLoad() || reduced() ? 0 : 1));
  const [motion, setMotion] = useState(false); // false until mounted (pre-render / no JS) and under reduced motion
  const [stopped, setStopped] = useState(false); // the pause button
  const [hover, setHover] = useState(false);
  const [focusIn, setFocusIn] = useState(false);
  const [away, setAway] = useState(false); // tab hidden or hero off screen
  const [rest, setRest] = useState(false); // products 2 and 3 loaded after the page's load event
  const [vertical, setVertical] = useState(false);
  const [ready, setReady] = useState(false); // hydrated (data-ready, for tests)

  const go = (i) => {
    const next = (i + N) % N;
    setAt((s) => (s.index === next ? s : { index: next, prev: s.index }));
    if (motion) setCount((c) => c + 1);
  };

  useEffect(() => {
    setMotion(!reduced());
    setReady(true);
    const mq = window.matchMedia("(min-width: 1024px)");
    const orient = () => setVertical(mq.matches);
    orient();
    mq.addEventListener("change", orient);

    const later = () => (window.requestIdleCallback ?? ((cb) => setTimeout(cb, 200)))(() => setRest(true));
    if (document.readyState === "complete") later();
    else window.addEventListener("load", later, { once: true });

    let hidden = document.hidden;
    let off = false;
    const sync = () => setAway(hidden || off);
    const onVis = () => {
      hidden = document.hidden;
      sync();
    };
    document.addEventListener("visibilitychange", onVis);
    const io = new IntersectionObserver(([e]) => {
      off = !e.isIntersecting;
      sync();
    });
    io.observe(root.current);
    return () => {
      mq.removeEventListener("change", orient);
      window.removeEventListener("load", later);
      document.removeEventListener("visibilitychange", onVis);
      io.disconnect();
    };
  }, []);

  const rotating = motion && !stopped;
  const paused = hover || focusIn || away;

  const onKeyDown = (e) => {
    const i = tabs.current.indexOf(document.activeElement);
    if (i < 0) return;
    const to = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: N - 1 }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    const next = (to + N) % N;
    go(next);
    tabs.current[next]?.focus();
  };

  const current = ITEMS[at.index];

  return (
    <div
      ref={root}
      data-a="product"
      data-products-hero
      data-ready={ready ? "" : undefined}
      data-rotating={rotating ? "" : undefined}
      data-paused={paused ? "" : undefined}
      role="region"
      aria-roledescription="carousel"
      aria-label="Partner products, from small to large"
      onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setHover(false)}
      onFocus={(e) => e.target.matches(":focus-visible") && setFocusIn(true)}
      onBlur={(e) => !root.current.contains(e.relatedTarget) && setFocusIn(false)}
      className="ph relative grid [--stage-h:15rem] sm:[--stage-h:18rem] lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-x-8 lg:[--stage-h:min(25rem,50vh)]"
    >
      {/* Stage: shared glow and floor, then the slides stacked in one grid cell (so the tallest sets
          the height and nothing moves when they change). */}
      <div className="relative grid">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[var(--stage-h)]">
          <div className="ph-glow absolute -inset-x-[20%] -top-[12%] bottom-0" />
        </div>
        {ITEMS.map((item, i) => {
          const state = i === at.index ? "on" : i === at.prev ? "out" : "idle";
          const on = state === "on";
          const showImage = i === 0 || rest;
          return (
            <div
              key={item.id}
              id={`ph-slide-${item.id}`}
              role="tabpanel"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${N}`}
              data-state={state}
              inert={!on}
              className="ph-slide col-start-1 row-start-1 flex flex-col items-center"
            >
              <div className="ph-prod relative flex h-[var(--stage-h)] w-full items-end justify-center">
                <Link
                  to={`/products/${item.id}`}
                  tabIndex={-1}
                  aria-hidden="true"
                  className="group/ph relative block"
                  style={item.box}
                >
                  <span className="absolute inset-x-[8%] -bottom-1.5 h-3 rounded-[100%] bg-black/70 blur-md" />
                  {showImage && (
                    <>
                      <span className="relative block h-full w-full transition-transform duration-slow ease-standard group-hover/ph:scale-[1.02]">
                        <ProductPicture item={item} eager={i === 0} className="h-full w-full" />
                      </span>
                      <span className="ph-reflect absolute inset-x-0 top-full block h-full">
                        <ProductPicture item={item} eager="reflection" className="h-full w-full -scale-y-100" />
                      </span>
                    </>
                  )}
                </Link>
              </div>
              <div className="ph-info relative mt-8 flex flex-col items-center text-center">
                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
                  <span className="rounded-full border border-accent/45 px-2.5 py-0.5 eyebrow text-accent">{item.partner.name}</span>
                  <Link
                    to={`/products/${item.id}`}
                    className="group/name inline-flex min-h-11 items-center gap-1 rounded-sm text-h4 font-semibold text-white hover:text-accent focus-visible:text-accent focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    {item.product.name}
                    <ArrowUpRight aria-hidden="true" className="h-4 w-4 transition-transform duration-fast group-hover/name:-translate-y-0.5 group-hover/name:translate-x-0.5 group-focus-visible/name:-translate-y-0.5 group-focus-visible/name:translate-x-0.5" strokeWidth={2} />
                  </Link>
                </div>
                <Figure value={item.figure} run={on ? count : 0} />
                <p className="mt-1 eyebrow text-label">
                  {/* Each segment stays whole; a second one wraps as a unit, the dot ending the line. */}
                  {item.segments.map((sg, j) => (
                    <Fragment key={sg}>
                      {j > 0 && " "}
                      <span className="whitespace-nowrap">
                        {sg}
                        {j < item.segments.length - 1 && " ·"}
                      </span>
                    </Fragment>
                  ))}
                </p>
              </div>
            </div>
          );
        })}
        {/* Floor line on top of the reflections, with a light sweeping along it at each change. */}
        <div aria-hidden="true" className="pointer-events-none absolute -inset-x-[6%] top-[var(--stage-h)] h-px">
          <div className="ph-floor absolute inset-0" />
          <div className="ph-floor-glow absolute inset-x-[10%] -top-1.5 h-3" />
          {count > 0 && motion && <div key={count} className="ph-sweep absolute -top-px h-[3px] w-1/4" />}
        </div>
      </div>

      {/* Partner list (tabs), then the pause button and the counter. */}
      {/* A fixed width from 1024 px, so the stage never moves when the fonts swap in. */}
      <div className="mt-6 flex items-center gap-3 lg:mt-0 lg:w-32 lg:flex-col lg:items-stretch lg:gap-0 lg:pt-[calc(var(--stage-h)/2_-_4.375rem)]">
        <div
          role="tablist"
          aria-label="Partner"
          aria-orientation={vertical ? "vertical" : "horizontal"}
          onKeyDown={onKeyDown}
          className="grid flex-1 grid-cols-3 gap-1 lg:flex-none lg:grid-cols-1"
        >
          {ITEMS.map((item, i) => {
            const on = i === at.index;
            return (
              <button
                key={item.id}
                ref={(el) => (tabs.current[i] = el)}
                type="button"
                role="tab"
                id={`ph-tab-${item.id}`}
                aria-selected={on}
                aria-controls={`ph-slide-${item.id}`}
                tabIndex={on ? 0 : -1}
                onClick={() => go(i)}
                className={`ph-tab relative flex min-h-11 items-center justify-center rounded-sm px-3 eyebrow transition-colors duration-fast focus-visible:outline-2 focus-visible:outline-offset-2 lg:justify-start lg:pl-5 lg:pr-2 ${
                  on ? "text-white" : "text-paper/65 hover:text-white"
                }`}
              >
                <span aria-hidden="true" className="ph-track absolute inset-x-3 bottom-0.5 h-0.5 overflow-hidden rounded-full bg-white/15 lg:inset-x-auto lg:bottom-2 lg:left-0 lg:top-2 lg:h-auto lg:w-0.5">
                  <span
                    className={`ph-fill absolute inset-0 rounded-full bg-accent ${on ? "" : "opacity-0"}`}
                    onAnimationEnd={(e) => e.animationName.startsWith("ph-fill") && on && go(i + 1)}
                  />
                </span>
                {item.partner.name}
                <span className="sr-only"> {item.product.name}</span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-end gap-3 lg:mt-auto">
          {/* Always in the layout (so nothing moves when it appears); shown only once the script runs
              with motion allowed — no rotation without JavaScript or under reduced motion. */}
          <button
            type="button"
            onClick={() => setStopped((s) => !s)}
            aria-label={stopped ? "Play product rotation" : "Pause product rotation"}
            className={`${motion ? "" : "invisible "}grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/25 text-white transition-colors duration-fast hover:border-accent hover:text-accent focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-2`}
          >
            {stopped ? <Play aria-hidden="true" className="h-4 w-4" strokeWidth={2} /> : <Pause aria-hidden="true" className="h-4 w-4" strokeWidth={2} />}
          </button>
          <p aria-hidden="true" className="hidden text-small tabular-nums tracking-[0.12em] text-paper/65 lg:block">
            <span className="text-white">{pad(at.index + 1)}</span> / {pad(N)}
          </p>
        </div>
      </div>

      <p className="sr-only" aria-live={rotating && !paused ? "off" : "polite"} aria-atomic="true">
        {`${current.partner.name} ${current.product.name}, ${current.figure}`}
      </p>
    </div>
  );
}
