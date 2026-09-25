import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { APPLICATIONS, PARTNERS, PRODUCTS, getProduct } from "../data/products";
import ProductCard from "../components/catalogue/ProductCard";
import { CompareDialog, CompareTray, MAX_COMPARE } from "../components/catalogue/Compare";
import ChooseCta from "../components/catalogue/ChooseCta";
import Reveal from "../components/Reveal";
import TiltSurface from "../components/ui/TiltSurface";

const APP_OPTIONS = [{ id: "all", label: "All" }, ...APPLICATIONS];
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Pill segmented control with a sliding active indicator (measured, transform-animated). */
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
          className="absolute bottom-1 left-0 top-1 rounded-full bg-ink shadow-[0_6px_16px_-8px_rgba(7,26,23,0.6)] transition-[transform,width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ width: box.w, transform: `translateX(${box.x}px)` }}
        />
      )}
      {options.map((o) => (
        <button
          key={o.id}
          ref={(el) => (refs.current[o.id] = el)}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          onClick={() => onChange(o.id)}
          className={`relative z-10 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal sm:px-5 ${
            value === o.id ? "text-white" : "text-graphite hover:text-ink"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/**
 * Pointer depth for the hero (desktop, motion allowed): writes the pointer position as --mx/--my
 * (-1…1) on the section, at most once per frame; layers read them in CSS and ease via transitions,
 * so nothing runs while the pointer is still. Same approach as the Home hero.
 */
function usePointerDepth(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion() || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let raf = 0;
    let nx = 0;
    let ny = 0;
    const apply = () => {
      raf = 0;
      el.style.setProperty("--mx", nx.toFixed(3));
      el.style.setProperty("--my", ny.toFixed(3));
    };
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      nx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
      ny = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      nx = 0;
      ny = 0;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref]);
}

const depth = (px, py) => ({
  transform: `translate3d(calc(var(--mx, 0) * ${px}px), calc(var(--my, 0) * ${py}px), 0)`,
  transition: "transform 900ms cubic-bezier(0.22, 1, 0.36, 1)",
});

/**
 * One real product as the hero's visual anchor: Hithium ∞Power 6.25 MWh (the catalogue's cutout of
 * Hithium's own datasheet render), shown whole at its native proportions with object-contain. A soft
 * green glow and a contact shadow separate it from the ground; the caption is the catalogue's
 * confirmed product name.
 */
function HeroProduct() {
  const product = getProduct("hithium-power-625");
  return (
    <figure className="relative">
      <div className="group/product relative mx-auto w-full max-w-xl lg:max-w-none">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-[14%]"
          style={{ ...depth(-2, -1.5), background: "radial-gradient(48% 46% at 50% 55%, rgba(144,217,136,0.11), rgba(144,217,136,0.035) 45%, transparent 72%)" }}
        />
        <div style={depth(5, 4)}>
          <div className="relative aspect-[1404/800] transition-[scale] duration-700 ease-out group-hover/product:scale-[1.015]">
            <span aria-hidden="true" className="absolute inset-x-[10%] bottom-[3%] h-[9%] rounded-[100%] bg-black/55 blur-xl" />
            <img
              src={product.image}
              alt={product.imageAlt}
              width="1404"
              height="800"
              fetchPriority="high"
              decoding="async"
              className="relative h-full w-full object-contain"
            />
          </div>
        </div>
      </div>
      <figcaption className="mt-5 text-center text-[0.6875rem] tracking-[0.16em] text-ice/50 lg:text-right">
        <span className="uppercase">Hithium ∞Power</span> 6.25 MWh
      </figcaption>
    </figure>
  );
}

/**
 * /products — the BESS catalogue. Explore -> filter -> interact -> view product -> enquire.
 *
 * Application and partner filters combine and live in the URL (?app=ci&partner=tcl) so a filtered
 * view can be shared; changing them replaces the history entry and never scrolls (Layout only
 * scrolls on path/hash changes). Every card stays mounted and non-matching ones are hidden, which
 * lets GSAP Flip animate the reflow: leaving cards fade out, staying cards glide to their new
 * slots, entering cards rise in with a short stagger. Flip is loaded on demand and skipped under
 * prefers-reduced-motion (the filter still works, instantly).
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

  // --- Flip-animated filtering -------------------------------------------------------------
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

  const hero = useRef(null);
  usePointerDepth(hero);

  // --- Comparison ------------------------------------------------------------------------------
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
        <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(55% 60% at 8% 0%, rgba(244,247,244,0.05), transparent 70%), linear-gradient(to bottom, transparent 60%, var(--color-deep))" }} />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage: "linear-gradient(rgba(244,247,244,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(244,247,244,0.035) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(70% 80% at 70% 50%, #000, transparent 75%)",
            WebkitMaskImage: "radial-gradient(70% 80% at 70% 50%, #000, transparent 75%)",
          }}
        />
        </div>
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-6 py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-12 lg:py-16">
          <Reveal>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-ice/80">Energy Storage Systems</p>
            <h1 className="mt-5 text-[clamp(2.1rem,3.9vw,3.2rem)] font-semibold leading-[1.1] tracking-tight">
              Energy Storage,
              <span className="block text-signal">Built to Scale.</span>
            </h1>
            <p className="mt-6 max-w-md leading-relaxed text-ice/80">
              Explore BESS solutions from NEXERA&rsquo;s technology partners for residential, commercial &amp; industrial, and utility-scale applications.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <HeroProduct />
          </Reveal>
        </div>
      </section>

      {/* Filters */}
      <section aria-label="Filter the catalogue" className="border-b border-line bg-ice">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-6 py-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="-mx-6 overflow-x-auto px-6 pb-1 [scrollbar-width:none] lg:mx-0 lg:overflow-visible lg:px-0 lg:pb-0">
            <Segmented label="Application" options={APP_OPTIONS} value={app} onChange={(v) => setFilter("app", v)} />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">Technology partner</p>
            <div role="radiogroup" aria-label="Technology partner" className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0 sm:pb-0">
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
                    className={`grid h-10 w-24 shrink-0 place-items-center rounded-full border bg-paper transition-[border-color,box-shadow,opacity] duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal ${
                      on
                        ? "border-forest shadow-[0_0_0_3px_rgba(144,217,136,0.35)]"
                        : partner === "all"
                          ? "border-line hover:border-forest/40"
                          : "border-line opacity-55 hover:opacity-100"
                    }`}
                  >
                    <img src={p.logo} alt="" className={`${p.logoClass} w-auto max-w-[70%] object-contain`} />
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
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <p className="max-w-2xl text-sm leading-relaxed text-graphite">
              NEXERA is an authorized solution provider and distributor. Every system here is designed and manufactured by
              the technology partner named on it.
            </p>
            <p aria-live="polite" className="shrink-0 text-sm font-medium text-forest">
              Showing {visibleCount} of {PRODUCTS.length} systems
            </p>
          </div>

          <ul ref={grid} className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PRODUCTS.map((p, i) => (
              <li key={p.id} data-card data-flip-id={p.id} hidden={!matches(p)}>
                <Reveal delay={Math.min(i, 5) * 0.07} className="h-full">
                  <TiltSurface className="h-full">
                    <ProductCard
                      product={p}
                      compared={compare.includes(p.id)}
                      compareFull={compare.length >= MAX_COMPARE}
                      onToggleCompare={toggleCompare}
                    />
                  </TiltSurface>
                </Reveal>
              </li>
            ))}
          </ul>

          {visibleCount === 0 && (
            <div className="mt-8 rounded-2xl border border-dashed border-line bg-paper px-6 py-12 text-center">
              <p className="font-semibold text-ink">No systems match this combination yet.</p>
              <p className="mt-1 text-sm text-graphite">Try another application or partner, or ask NEXERA what&rsquo;s available.</p>
              <button
                type="button"
                onClick={() => applyParams(new URLSearchParams())}
                className="mt-5 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-ink/90"
              >
                Show all systems
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
