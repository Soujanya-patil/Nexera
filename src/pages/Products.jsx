import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
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
import { isFirstLoad } from "../lib/firstLoad";
import { ProductDetailRoute } from "./lazy";
import { DUR, EASE, SCROLL_DUR, STAGGER } from "../lib/tokens";

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
    <div role="radiogroup" aria-label={label} className="relative inline-flex shrink-0 rounded-full border border-line bg-white p-1">
      {box && (
        <span
          aria-hidden="true"
          className="absolute bottom-1 left-0 top-1 rounded-full bg-forest shadow-[0_6px_16px_-8px_color-mix(in_srgb,var(--color-ink)_60%,transparent)] transition-[transform,width] duration-base ease-emphasized"
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
            className={`relative z-10 rounded-full py-2 pl-5 pr-4 eyebrow pointer-coarse:min-h-11 transition-colors duration-fast focus-visible:outline-2 focus-visible:outline-offset-2 sm:pl-6 sm:pr-5 ${
              on ? "text-white" : "text-copy hover:text-ink focus-visible:text-ink"
            }`}
          >
            <span
              aria-hidden="true"
              className={`absolute left-2 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-accent transition-[scale,opacity] duration-fast sm:left-2.5 ${
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
            style={{ background: "radial-gradient(40% 44% at 50% 52%, color-mix(in srgb, var(--accent) 13%, transparent), color-mix(in srgb, var(--accent) 4%, transparent) 45%, transparent 72%)" }}
          />
          <div
            className="absolute inset-0 opacity-70"
            style={{
              backgroundImage:
                "linear-gradient(color-mix(in srgb, var(--color-paper) 5%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--color-paper) 5%, transparent) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
              maskImage: "radial-gradient(38% 40% at 50% 55%, #000, transparent 75%)",
              WebkitMaskImage: "radial-gradient(38% 40% at 50% 55%, #000, transparent 75%)",
            }}
          />
        </div>

        <div style={depth(6, 5)}>
          <div className="relative aspect-[640/900] h-[22rem] transition-[scale] duration-slow ease-standard group-hover/product:scale-[1.015] group-focus-visible/product:scale-[1.015] group-focus-within/product:scale-[1.015] sm:h-[26rem] lg:h-[min(30rem,62vh)]">
            <span aria-hidden="true" className="absolute inset-x-[4%] -bottom-[1%] h-[5%] rounded-[100%] bg-black/60 blur-lg" />
            <img
              src={product.image}
              alt={product.imageAlt}
              width="640"
              height="900"
              fetchPriority="high"
              loading="eager"
              decoding="async"
              className="relative h-full w-full object-contain"
            />

            {/* Technical tag: a dot on the cabinet's front-top corner, a thin leader, then the tag —
                opening into the free space left of the product on desktop, over it on phones. */}
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute left-[20%] top-[14%] transition-opacity duration-fast ${tag ? "opacity-100" : "opacity-0"}`}
            >
              <span className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-accent ring-2 ring-deep-grid/70" />
              <span
                className="absolute left-0 top-0 h-px w-10 origin-left bg-accent/70 transition-[scale] duration-base ease-standard lg:left-auto lg:right-0 lg:origin-right"
                style={{ scale: tag ? "1 1" : "0 1" }}
              />
              <div
                className={`absolute -top-[1.85rem] left-11 w-max rounded-[3px] border border-accent/35 bg-deep-grid/85 px-3 py-2 leading-tight backdrop-blur-sm transition-[opacity,scale] duration-base ease-standard lg:left-auto lg:right-11 ${
                  tag ? "scale-100 opacity-100 delay-150" : "scale-95 opacity-0"
                }`}
              >
                <p className="eyebrow text-accent">{partner.name}</p>
                <p className="mt-0.5 text-small font-semibold text-white">{product.cardSpecs[0]}</p>
                <p className="mt-0.5 eyebrow text-paper/70">
                  {product.applications.map(applicationLabel).join(" · ")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <figcaption className="mt-5 text-micro tracking-[0.16em] text-paper/50">
        <span className="uppercase">{partner.name}</span> {product.name}
      </figcaption>
    </figure>
  );
}

/**
 * Heading + intro for the current category/partner. When the filters change, the old heading leaves
 * (fade, 6 px up) and only then does the new one arrive (fade, from 8 px below), 0.28 s each (CSS
 * keyframes in index.css; under reduced motion it simply swaps).
 */
function CategoryHeading({ app, partner }) {
  const key = `${app}-${partner}`;
  // `shown` is what is on screen; while it differs from the filters the old heading is leaving.
  const [shown, setShown] = useState({ app, partner, key, entering: false });
  const leaving = shown.key !== key;
  useEffect(() => {
    if (!leaving) return;
    const t = setTimeout(() => setShown({ app, partner, key, entering: true }), reducedMotion() ? 0 : 280);
    return () => clearTimeout(t);
  }, [leaving, app, partner, key]);
  const copy = CATEGORY_COPY[shown.app];
  const p = shown.partner === "all" ? null : partnerOf(shown.partner);
  return (
    <div className="relative min-h-[5.5rem] max-w-2xl">
      <div key={shown.key} className={leaving ? "heading-out" : shown.entering ? "heading-in" : ""}>
        <h2 className="text-h2 font-semibold text-ink">
          {copy.title}
          {p && <span className="text-muted"> · {p.name}</span>}
        </h2>
        <p className="mt-2 text-small text-copy">{copy.text}</p>
        {p && (
          <Link to={`/partners/${p.id}`} className="group/about mt-2 inline-flex items-center gap-1 text-button font-semibold text-accent hover:text-link focus-visible:text-link">
            About {p.name} in India
            <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 transition-transform duration-fast group-hover/about:translate-x-0.5 group-focus-visible/about:translate-x-0.5 group-focus-within/about:translate-x-0.5" />
          </Link>
        )}
      </div>
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
// The catalogue cards: every product except those kept off the listing (data/products.js `listed: false`,
// which still have their product page).
const LISTED = PRODUCTS.filter((p) => p.listed !== false);

export default function Products() {
  const [params, setParams] = useSearchParams();
  // /products?app=… and ?partner=… are served the pre-rendered "all products" page (canonical
  // /products): the first render on a direct load matches it, then the URL's filters apply before the
  // first paint after hydration. Reached by client-side navigation, they apply from the first render.
  const [urlFilters, setUrlFilters] = useState(() => !isFirstLoad());
  useLayoutEffect(() => setUrlFilters(true), []);
  const app = urlFilters && APP_OPTIONS.some((o) => o.id === params.get("app")) ? params.get("app") : "all";
  const partner = urlFilters && PARTNERS.some((p) => p.id === params.get("partner")) ? params.get("partner") : "all";

  const matches = useCallback(
    (p) => (app === "all" || p.applications.includes(app)) && (partner === "all" || p.partner === partner),
    [app, partner]
  );
  const visibleCount = useMemo(() => LISTED.filter(matches).length, [matches]);

  // --- Hero ---------------------------------------------------------------------------------------
  const hero = useRef(null);
  usePointerDepth(hero);
  const intro = useIntro(hero, ({ tl, q }) => {
    const done = { clearProps: "all" };
    tl.fromTo(q('[data-a="eyebrow"]'), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: DUR.base, ...done }, 0)
      .fromTo(q('[data-a="line1"]'), { opacity: 0, y: 42 }, { opacity: 1, y: 0, duration: DUR.slow, ...done }, 0.12)
      .fromTo(
        q('[data-a="line2"]'),
        { opacity: 0, y: 48, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: DUR.slow, ease: EASE.emphasized, ...done },
        0.26
      )
      .fromTo(q('[data-a="desc"]'), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: DUR.base, ease: EASE.standard, ...done }, 0.5)
      .fromTo(q('[data-a="product"]'), { opacity: 0, y: 26, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: DUR.slow, ease: EASE.emphasized, ...done }, 0.6)
      .fromTo(q('[data-a="cta"]'), { opacity: 0, y: 12, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: DUR.base, ...done }, 0.95);
  });

  const toCatalogue = () => {
    const target = document.getElementById("catalogue");
    if (!target) return;
    const lenis = getLenis();
    // A position, not the element: given an element, Lenis also subtracts its scroll-margin-top
    // (scroll-mt-16), which doubled the clearance under the sticky header.
    if (lenis) lenis.scrollTo(target.getBoundingClientRect().top + window.scrollY - 64, { duration: SCROLL_DUR });
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
      duration: DUR.base,
      ease: EASE.inOut,
      absolute: true,
      stagger: STAGGER,
      onEnter: (els) =>
        f.gsap.fromTo(els, { opacity: 0, y: 18, scale: 1 }, { opacity: 1, y: 0, duration: DUR.base, delay: 0.12, stagger: STAGGER, ease: EASE.standard, clearProps: "transform" }),
      onLeave: (els) => f.gsap.to(els, { opacity: 0, scale: 0.96, duration: DUR.fast, ease: EASE.in }),
    });
  }, [app, partner]);

  // --- Card reveal -------------------------------------------------------------------------------
  const reveal = useScrollReveal(grid);

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
      <section ref={hero} className="relative overflow-hidden bg-deep-grid text-white">
        {/* Ground layers drift a touch against the product for depth (smaller than the product). */}
        <div aria-hidden="true" className="pointer-events-none absolute -inset-3" style={depth(-2, -1.5)}>
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(55% 60% at 8% 0%, color-mix(in srgb, var(--color-paper) 5%, transparent), transparent 70%), linear-gradient(to bottom, transparent 60%, var(--color-deep-grid))" }}
          />
          <div
            className="absolute inset-0 opacity-60"
            style={{
              backgroundImage: "linear-gradient(color-mix(in srgb, var(--color-paper) 3.5%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--color-paper) 3.5%, transparent) 1px, transparent 1px)",
              backgroundSize: "64px 64px",
              maskImage: "radial-gradient(70% 80% at 70% 50%, #000, transparent 75%)",
              WebkitMaskImage: "radial-gradient(70% 80% at 70% 50%, #000, transparent 75%)",
            }}
          />
        </div>
        <div data-intro={intro} className="relative grid container-site items-center gap-10 py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-12 lg:py-16">
          <div>
            <p data-a="eyebrow" className="eyebrow text-paper/80">
              Energy Storage Systems
            </p>
            <h1 className="mt-5 text-h1 font-semibold">
              <span data-a="line1" className="block">
                Energy Storage,
              </span>
              {/* Keeps the lines' words apart in the heading's text; between block lines it renders nothing. */}
              {" "}
              <span data-a="line2" className="block origin-left text-accent">
                Built to Scale.
              </span>
            </h1>
            <p data-a="desc" className="mt-6 max-w-md text-body text-paper/80">
              Explore BESS solutions from NEXERA&rsquo;s technology partners for residential, commercial &amp; industrial, and utility-scale applications.
            </p>
            <div data-a="cta" className="mt-8 inline-block">
              <button
                type="button"
                onClick={toCatalogue}
                className="group/pill btn-motion inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-6 py-3 text-button font-semibold text-on-accent hover:bg-accent-hover focus-visible:bg-accent-hover hover:shadow-[0_0_24px_2px_color-mix(in_srgb,var(--accent)_35%,transparent)] focus-visible:shadow-[0_0_24px_2px_color-mix(in_srgb,var(--accent)_35%,transparent)] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                Explore Systems
                <ArrowDown aria-hidden="true" className="h-4 w-4 transition-transform duration-fast group-hover/pill:translate-y-0.5 group-focus-visible/pill:translate-y-0.5 group-focus-within/pill:translate-y-0.5" strokeWidth={2} />
              </button>
            </div>
          </div>
          <HeroProduct />
        </div>
      </section>

      {/* Filters */}
      <section id="catalogue" aria-label="Filter the catalogue" className="scroll-mt-16 border-b border-line bg-paper">
        <div className="flex container-site flex-col gap-5 py-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="-mx-6 overflow-x-auto px-6 pb-1 [scrollbar-width:none] lg:mx-0 lg:overflow-visible lg:px-0 lg:pb-0">
            <Segmented label="Application" options={APP_OPTIONS} value={app} onChange={(v) => setFilter("app", v)} />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <p className="eyebrow text-muted">Technology partner</p>
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
                    className={`group/partner relative grid h-11 w-24 shrink-0 place-items-center rounded-full border bg-white transition-[border-color,box-shadow] duration-fast focus-visible:outline-2 focus-visible:outline-offset-2 ${
                      on ? "border-accent shadow-[0_0_0_3px_color-mix(in_srgb,var(--accent)_35%,transparent)]" : "border-line hover:border-accent/40 focus-visible:border-accent/40"
                    }`}
                  >
                    {/* The button is named by its aria-label; the logo still carries its own alt. */}
                    <img
                      src={p.logo}
                      loading="lazy"
                      decoding="async"
                      alt={`${p.name} logo`}
                      className={`${p.logoClass} w-auto max-w-[70%] object-contain transition-opacity duration-fast ${
                        on || partner === "all" ? "opacity-90 group-hover/partner:opacity-100 group-focus-visible/partner:opacity-100 group-focus-within/partner:opacity-100" : "opacity-50 group-hover/partner:opacity-100"
                      }`}
                    />
                    <span
                      aria-hidden="true"
                      className={`absolute -bottom-2 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-accent transition-[scale] duration-fast ${
                        on ? "" : "scale-x-0 group-hover/partner:scale-x-[0.625] group-focus-visible/partner:scale-x-[0.625] group-focus-within/partner:scale-x-[0.625]"
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
      <section className="bg-paper pb-20 pt-10 md:pb-24">
        <div className="container-site">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <CategoryHeading app={app} partner={partner} />
            <LiveCount count={visibleCount} total={LISTED.length} />
          </div>
          <p className="mt-3 max-w-2xl text-micro text-muted">
            NEXERA is an authorized solution provider and distributor. Every system here is designed and manufactured by
            the technology partner named on it.
          </p>

          <ul ref={grid} data-sr-state={reveal} className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {LISTED.map((p) => {
              const dim = peek && p.partner !== peek;
              return (
                <li key={p.id} data-card data-flip-id={p.id} hidden={!matches(p)}>
                  <div data-sr className="h-full">
                    <div className={`h-full transition-opacity duration-fast ${dim ? "opacity-40" : "opacity-100"}`}>
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
            <div className="mt-8 rounded-2xl border border-dashed border-line bg-white px-6 py-14 text-center">
              <p className="eyebrow text-muted">No systems found</p>
              <p className="mt-2 text-small text-copy">No system in the catalogue matches this application and partner.</p>
              <button
                type="button"
                onClick={() => applyParams(new URLSearchParams())}
                className="group/clear btn-motion mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-button font-semibold text-white hover:bg-accent/90 focus-visible:bg-accent/90"
              >
                Clear Filters
                <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform duration-fast group-hover/clear:translate-x-1 group-focus-visible/clear:translate-x-1 group-focus-within/clear:translate-x-1" />
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
