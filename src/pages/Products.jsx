import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowDown, ArrowRight } from "lucide-react";
import { APPLICATIONS, PARTNERS, PRODUCTS, applicationLabel, getProduct, partnerOf } from "../data/products";
import ProductCard from "../components/catalogue/ProductCard";
import LiveCount from "../components/catalogue/LiveCount";
import { CompareDialog, CompareTray, MAX_COMPARE } from "../components/catalogue/Compare";
import ChooseCta from "../components/catalogue/ChooseCta";
import TiltSurface from "../components/ui/TiltSurface";
import { depth, usePointerDepth } from "../lib/pointerDepth";
import { useIntro } from "../lib/intro";
import { useScrollReveal } from "../lib/scrollReveal";
import { getLenis } from "../lib/lenis";
import { ProductDetailRoute } from "./lazy";

const APP_OPTIONS = [{ id: "all", label: "All" }, ...APPLICATIONS];
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Category heading copy — the approved Home "Solutions" card lines, reused as the category intros.
const CATEGORY_COPY = {
  all: { title: "All systems", text: "Residential, commercial & industrial, and utility-scale storage from TCL, Hithium and CLOU." },
  residential: { title: "Residential", text: "Store your solar power. Use it when you need it. Greater independence, lower bills, reliable backup." },
  ci: { title: "Commercial & Industrial", text: "Cut peak demand charges. Improve reliability. Maximise solar ROI." },
  utility: { title: "Utility-scale", text: "Enable a cleaner, more stable grid with large-scale storage." },
};

/**
 * Pill segmented control. The dark active pill slides and resizes to the selected option (measured,
 * transform/width transition) and a small green status dot switches on inside it; the dot is
 * absolutely placed in the pill's padding, so options never change width.
 */
function Segmented({ options, value, onChange, label }) {
  const refs = useRef({});
  const [box, setBox] = useState(null);
  useLayoutEffect(() => {
    const measure = () => {
      const el = refs.current[value];
      if (el) setBox({ x: el.offsetLeft, w: el.offsetWidth });
    };
    measure();
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure);
    return () => window.removeEventListener("resize", measure);
  }, [value]);
  return (
    <div role="radiogroup" aria-label={label} className="relative inline-flex shrink-0 rounded-full border border-line bg-paper p-1">
      {box && (
        <span
          aria-hidden="true"
          className="absolute bottom-1 left-0 top-1 rounded-full bg-ink shadow-[0_6px_16px_-8px_rgba(7,26,23,0.6)] transition-[transform,width] duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ width: box.w, transform: `translateX(${box.x}px)` }}
        />
      )}
      {options.map((o) => {
        const on = value === o.id;
        return (
          <button
            key={o.id}
            ref={(el) => (refs.current[o.id] = el)}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.id)}
            className={`relative z-10 rounded-full py-2 pl-5 pr-4 text-xs font-semibold uppercase tracking-[0.12em] transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal sm:pl-6 sm:pr-5 ${
              on ? "text-white" : "text-graphite hover:text-ink"
            }`}
          >
            <span
              aria-hidden="true"
              className={`absolute left-2 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-signal transition-[scale,opacity] duration-300 sm:left-2.5 ${
                on ? "scale-100 opacity-100" : "scale-0 opacity-0"
              }`}
            />
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

const HERO_PRODUCT_ID = "hithium-power-cabinet-1022";

/**
 * The hero's single real product (Hithium ∞Power 1022 kWh cabinet, the catalogue cutout), whole at
 * its native proportions. Behind it: a slow ambient light and a faint engineering grid, both
 * restrained. Pointer depth moves it up to 6 px (desktop); hovering scales it to 1.015 and reveals a
 * small technical tag — partner, the catalogue's headline figure and its applications, all taken
 * from the product data. On touch the tag toggles with a tap.
 */
function HeroProduct() {
  const product = getProduct(HERO_PRODUCT_ID);
  const partner = partnerOf(product.partner);
  const [tag, setTag] = useState(false);
  return (
    <figure data-a="product" className="relative flex flex-col items-center lg:items-end">
      <div
        className="group/product relative"
        onPointerEnter={(e) => e.pointerType === "mouse" && setTag(true)}
        onPointerLeave={(e) => e.pointerType === "mouse" && setTag(false)}
        onPointerUp={(e) => e.pointerType !== "mouse" && setTag((v) => !v)}
      >
        {/* Ambient light (slow drift) + faint grid behind the product */}
        <div aria-hidden="true" className="pointer-events-none absolute -inset-x-[55%] -inset-y-[18%]" style={depth(-2, -1.5)}>
          <div
            className="ambient-drift absolute inset-0"
            style={{ background: "radial-gradient(40% 44% at 50% 52%, rgba(144,217,136,0.13), rgba(144,217,136,0.04) 45%, transparent 72%)" }}
          />
          <div
            className="absolute inset-0 opacity-70"
            style={{
              backgroundImage:
                "linear-gradient(rgba(244,247,244,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(244,247,244,0.05) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
              maskImage: "radial-gradient(38% 40% at 50% 55%, #000, transparent 75%)",
              WebkitMaskImage: "radial-gradient(38% 40% at 50% 55%, #000, transparent 75%)",
            }}
          />
        </div>

        <div style={depth(6, 5)}>
          <div className="relative aspect-[640/900] h-[22rem] transition-[scale] duration-700 ease-out group-hover/product:scale-[1.015] sm:h-[26rem] lg:h-[min(30rem,62vh)]">
            <span aria-hidden="true" className="absolute inset-x-[4%] -bottom-[1%] h-[5%] rounded-[100%] bg-black/60 blur-lg" />
            <img
              src={product.image}
              alt={product.imageAlt}
              width="640"
              height="900"
              fetchPriority="high"
              decoding="async"
              className="relative h-full w-full object-contain"
            />

            {/* Technical tag: a dot on the cabinet's front-top corner, a thin leader, then the tag —
                opening into the free space left of the product on desktop, over it on phones. */}
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute left-[20%] top-[14%] transition-opacity duration-300 ${tag ? "opacity-100" : "opacity-0"}`}
            >
              <span className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-signal ring-2 ring-deep/70" />
              <span
                className="absolute left-0 top-0 h-px w-10 origin-left bg-signal/70 transition-[scale] duration-500 ease-out lg:left-auto lg:right-0 lg:origin-right"
                style={{ scale: tag ? "1 1" : "0 1" }}
              />
              <div
                className={`absolute -top-[1.85rem] left-11 w-max rounded-[3px] border border-signal/35 bg-deep/85 px-3 py-2 leading-tight backdrop-blur-sm transition-[opacity,scale] duration-500 ease-out lg:left-auto lg:right-11 ${
                  tag ? "scale-100 opacity-100 delay-150" : "scale-95 opacity-0"
                }`}
              >
                <p className="text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-signal">{partner.name}</p>
                <p className="mt-0.5 text-sm font-semibold text-white">{product.cardSpecs[0]}</p>
                <p className="mt-0.5 text-[0.625rem] uppercase tracking-[0.12em] text-ice/70">
                  {product.applications.map(applicationLabel).join(" · ")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <figcaption className="mt-5 text-[0.6875rem] tracking-[0.16em] text-ice/50">
        <span className="uppercase">{partner.name}</span> {product.name}
      </figcaption>
    </figure>
  );
}

/** Heading + intro for the current category/partner, cross-fading when the filters change. */
function CategoryHeading({ app, partner }) {
  const reduce = useReducedMotion();
  const copy = CATEGORY_COPY[app];
  const p = partner === "all" ? null : partnerOf(partner);
  const key = `${app}-${partner}`;
  return (
    <div className="relative min-h-[5.5rem] max-w-2xl">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={key}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="text-2xl font-semibold tracking-tight text-ink md:text-3xl">
            {copy.title}
            {p && <span className="text-sage"> · {p.name}</span>}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-graphite">{copy.text}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/**
 * /products — the BESS product explorer. Discover -> filter -> see -> compare -> explore -> enquire.
 *
 * HERO: one GSAP entrance (eyebrow, headline lines with the green line emphasised, description, then
 *   the product, then the CTA), pointer depth on desktop, and the product's hover tag.
 * FILTERS: application and partner filters combine and live in the URL (?app=ci&partner=tcl); changing
 *   them replaces the history entry and never scrolls. Every card stays mounted and non-matching ones
 *   are hidden, which lets GSAP Flip animate the reflow (leaving cards fade, staying cards glide,
 *   entering cards rise). Hovering a partner highlights its cards; the category heading and the live
 *   count update with the filters.
 * CARDS: revealed by ScrollTrigger in a ~90 ms stagger; hover, compare and the View Transition into
 *   the product page live in ProductCard. The product page's code is preloaded while you browse so
 *   that transition never waits.
 * Reduced motion: no entrance, depth, Flip or reveals — the page is simply there.
 */
export default function Products() {
  const [params, setParams] = useSearchParams();
  const app = APP_OPTIONS.some((o) => o.id === params.get("app")) ? params.get("app") : "all";
  const partner = PARTNERS.some((p) => p.id === params.get("partner")) ? params.get("partner") : "all";

  const matches = useCallback(
    (p) => (app === "all" || p.applications.includes(app)) && (partner === "all" || p.partner === partner),
    [app, partner]
  );
  const visibleCount = useMemo(() => PRODUCTS.filter(matches).length, [matches]);

  // --- Hero ---------------------------------------------------------------------------------------
  const hero = useRef(null);
  usePointerDepth(hero);
  const intro = useIntro(hero, ({ tl, q }) => {
    const done = { clearProps: "all" };
    tl.fromTo(q('[data-a="eyebrow"]'), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.6, ...done }, 0)
      .fromTo(q('[data-a="line1"]'), { opacity: 0, y: 42, filter: "blur(6px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.85, ...done }, 0.12)
      .fromTo(
        q('[data-a="line2"]'),
        { opacity: 0, y: 48, scale: 0.97, filter: "blur(8px)", textShadow: "0 0 26px rgba(144,217,136,0.6)" },
        { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", textShadow: "0 0 0px rgba(144,217,136,0)", duration: 1, ease: "expo.out", ...done },
        0.26
      )
      .fromTo(q('[data-a="desc"]'), { opacity: 0, y: 16, filter: "blur(4px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6, ease: "power2.out", ...done }, 0.5)
      .fromTo(q('[data-a="product"]'), { opacity: 0, y: 26, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 1.1, ease: "expo.out", ...done }, 0.6)
      .fromTo(q('[data-a="cta"]'), { opacity: 0, y: 12, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, ...done }, 0.95);
  });

  const toCatalogue = () => {
    const target = document.getElementById("catalogue");
    if (!target) return;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(target, { offset: -64, duration: 1.1 });
    else target.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "start" });
  };

  // Load the product page's code while the visitor browses, so opening a product never waits.
  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((cb) => setTimeout(cb, 1200));
    const id = idle(() => ProductDetailRoute.preload());
    return () => (window.cancelIdleCallback ?? clearTimeout)(id);
  }, []);

  // --- Flip-animated filtering -------------------------------------------------------------------
  const grid = useRef(null);
  const flip = useRef(null); // { gsap, Flip } once loaded
  const pending = useRef(null);
  useEffect(() => {
    if (reducedMotion()) return;
    let live = true;
    Promise.all([import("gsap"), import("gsap/Flip")]).then(([{ gsap }, { Flip }]) => {
      gsap.registerPlugin(Flip);
      if (live) flip.current = { gsap, Flip };
    });
    return () => {
      live = false;
    };
  }, []);

  const applyParams = (next) => {
    if (flip.current && grid.current) pending.current = flip.current.Flip.getState(grid.current.querySelectorAll("[data-card]"));
    setParams(next, { replace: true, preventScrollReset: true });
  };
  const setFilter = (key, value) => {
    const next = new URLSearchParams(params);
    if (value === "all") next.delete(key);
    else next.set(key, value);
    applyParams(next);
  };

  useLayoutEffect(() => {
    const state = pending.current;
    const f = flip.current;
    if (!state || !f) return;
    pending.current = null;
    f.Flip.from(state, {
      duration: 0.55,
      ease: "power2.inOut",
      absolute: true,
      stagger: 0.02,
      onEnter: (els) =>
        f.gsap.fromTo(els, { opacity: 0, y: 18, scale: 1 }, { opacity: 1, y: 0, duration: 0.45, delay: 0.12, stagger: 0.06, ease: "power2.out", clearProps: "transform" }),
      onLeave: (els) => f.gsap.to(els, { opacity: 0, scale: 0.96, duration: 0.25, ease: "power1.in" }),
    });
  }, [app, partner]);

  // --- Card reveal -------------------------------------------------------------------------------
  const reveal = useScrollReveal(grid, { stagger: 0.09 });

  // --- Partner hover highlight ---------------------------------------------------------------------
  const [peek, setPeek] = useState(null);

  // --- Comparison --------------------------------------------------------------------------------
  const [compare, setCompare] = useState([]);
  const [comparing, setComparing] = useState(false);
  const toggleCompare = (id) =>
    setCompare((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : ids.length < MAX_COMPARE ? [...ids, id] : ids));

  return (
    <div className={compare.length ? "pb-24" : undefined}>
      {/* Hero */}
      <section ref={hero} className="relative overflow-hidden bg-night text-white">
        {/* Ground layers drift a touch against the product for depth (smaller than the product). */}
        <div aria-hidden="true" className="pointer-events-none absolute -inset-3" style={depth(-2, -1.5)}>
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(55% 60% at 8% 0%, rgba(244,247,244,0.05), transparent 70%), linear-gradient(to bottom, transparent 60%, var(--color-deep))" }}
          />
          <div
            className="absolute inset-0 opacity-60"
            style={{
              backgroundImage: "linear-gradient(rgba(244,247,244,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(244,247,244,0.035) 1px, transparent 1px)",
              backgroundSize: "64px 64px",
              maskImage: "radial-gradient(70% 80% at 70% 50%, #000, transparent 75%)",
              WebkitMaskImage: "radial-gradient(70% 80% at 70% 50%, #000, transparent 75%)",
            }}
          />
        </div>
        <div data-intro={intro} className="relative mx-auto grid max-w-6xl items-center gap-10 px-6 py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-12 lg:py-16">
          <div>
            <p data-a="eyebrow" className="text-xs font-medium uppercase tracking-[0.22em] text-ice/80">
              Energy Storage Systems
            </p>
            <h1 className="mt-5 text-[clamp(2.1rem,3.9vw,3.2rem)] font-semibold leading-[1.1] tracking-tight">
              <span data-a="line1" className="block">
                Energy Storage,
              </span>
              <span data-a="line2" className="block origin-left text-signal">
                Built to Scale.
              </span>
            </h1>
            <p data-a="desc" className="mt-6 max-w-md leading-relaxed text-ice/80">
              Explore BESS solutions from NEXERA&rsquo;s technology partners for residential, commercial &amp; industrial, and utility-scale applications.
            </p>
            <div data-a="cta" className="mt-8 inline-block">
              <button
                type="button"
                onClick={toCatalogue}
                className="group/pill inline-flex items-center gap-2 rounded-full bg-signal px-6 py-3 text-sm font-semibold text-forest transition-[background-color,box-shadow,scale] duration-300 hover:scale-[1.02] hover:bg-[#a4e39d] hover:shadow-[0_0_24px_2px_rgba(144,217,136,0.35)] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
              >
                Explore Systems
                <ArrowDown aria-hidden="true" className="h-4 w-4 transition-transform duration-300 group-hover/pill:translate-y-0.5" strokeWidth={2} />
              </button>
            </div>
          </div>
          <HeroProduct />
        </div>
      </section>

      {/* Filters */}
      <section id="catalogue" aria-label="Filter the catalogue" className="scroll-mt-16 border-b border-line bg-ice">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-6 py-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="-mx-6 overflow-x-auto px-6 pb-1 [scrollbar-width:none] lg:mx-0 lg:overflow-visible lg:px-0 lg:pb-0">
            <Segmented label="Application" options={APP_OPTIONS} value={app} onChange={(v) => setFilter("app", v)} />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">Technology partner</p>
            <div role="radiogroup" aria-label="Technology partner" className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-2 [scrollbar-width:none] sm:mx-0 sm:px-0">
              {PARTNERS.map((p) => {
                const on = partner === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    aria-label={p.name}
                    onClick={() => setFilter("partner", on ? "all" : p.id)}
                    onPointerEnter={(e) => e.pointerType === "mouse" && setPeek(p.id)}
                    onPointerLeave={() => setPeek(null)}
                    onFocus={() => setPeek(p.id)}
                    onBlur={() => setPeek(null)}
                    className={`group/partner relative grid h-10 w-24 shrink-0 place-items-center rounded-full border bg-paper transition-[border-color,box-shadow] duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal ${
                      on ? "border-forest shadow-[0_0_0_3px_rgba(144,217,136,0.35)]" : "border-line hover:border-forest/40"
                    }`}
                  >
                    <img
                      src={p.logo}
                      alt=""
                      className={`${p.logoClass} w-auto max-w-[70%] object-contain transition-opacity duration-300 ${
                        on || partner === "all" ? "opacity-90 group-hover/partner:opacity-100" : "opacity-50 group-hover/partner:opacity-100"
                      }`}
                    />
                    <span
                      aria-hidden="true"
                      className={`absolute -bottom-2 left-1/2 h-0.5 -translate-x-1/2 rounded-full bg-signal transition-[width] duration-300 ${
                        on ? "w-8" : "w-0 group-hover/partner:w-5"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Catalogue */}
      <section className="bg-ice pb-20 pt-10 md:pb-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <CategoryHeading app={app} partner={partner} />
            <LiveCount count={visibleCount} total={PRODUCTS.length} />
          </div>
          <p className="mt-3 max-w-2xl text-xs leading-relaxed text-sage">
            NEXERA is an authorized solution provider and distributor. Every system here is designed and manufactured by
            the technology partner named on it.
          </p>

          <ul ref={grid} data-sr-state={reveal} className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PRODUCTS.map((p) => {
              const dim = peek && p.partner !== peek;
              return (
                <li key={p.id} data-card data-flip-id={p.id} hidden={!matches(p)}>
                  <div data-sr className="h-full">
                    <div className={`h-full transition-opacity duration-300 ${dim ? "opacity-40" : "opacity-100"}`}>
                      <TiltSurface className="h-full" degrees={2}>
                        <ProductCard
                          product={p}
                          compared={compare.includes(p.id)}
                          compareFull={compare.length >= MAX_COMPARE}
                          onToggleCompare={toggleCompare}
                        />
                      </TiltSurface>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {visibleCount === 0 && (
            <div className="mt-8 rounded-2xl border border-dashed border-line bg-paper px-6 py-14 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sage">No systems found</p>
              <p className="mt-2 text-sm text-graphite">No system in the catalogue matches this application and partner.</p>
              <button
                type="button"
                onClick={() => applyParams(new URLSearchParams())}
                className="group/clear mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-[background-color,scale] duration-300 hover:bg-ink/90 active:scale-[0.97]"
              >
                Clear Filters
                <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform duration-300 group-hover/clear:translate-x-1" />
              </button>
            </div>
          )}
        </div>
      </section>

      <ChooseCta />

      <CompareTray
        ids={compare}
        onRemove={(id) => setCompare((ids) => ids.filter((x) => x !== id))}
        onClear={() => setCompare([])}
        onOpen={() => setComparing(true)}
      />
      <CompareDialog ids={compare} open={comparing} onClose={() => setComparing(false)} />
    </div>
  );
}
