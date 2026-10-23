import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import HomeHeroCopy from "./HomeHeroCopy";
import imgW10 from "../assets/catalogue/tcl-blueark-w10.webp";
import imgBlock261 from "../assets/catalogue/hithium-block-261.webp";
import imgX5 from "../assets/catalogue/tcl-blueark-x5.webp";
import { useMediaQuery } from "../lib/scrollSteps";
import { isFirstLoad } from "../lib/firstLoad";

/*
 * The showcase: three of the partners' own C&I cabinets, from the catalogue's product photos (transparent
 * cut-outs). (CLOU's Aqua-E261 photo is left out: its only source is a small, soft render with a grey
 * edge along its base, which shows at this size.) Names, alt texts and links are the same as src/data/products.js (not imported: the
 * catalogue is not part of the home page's first bundle, and this is all the hero needs from it).
 * The first is the first paint and stays put until the page has loaded.
 */
const SHOWCASE = [
  { id: "tcl-blueark-w10", partner: "TCL", name: "BlueArk W10", src: imgW10, w: 380, h: 900, alt: "TCL BlueArk W10 energy storage cabinet" },
  { id: "hithium-block-261", partner: "Hithium", name: "∞BLOCK C&I All-in-One ESS", src: imgBlock261, w: 506, h: 900, alt: "Hithium ∞BLOCK 261 kWh energy storage cabinet" },
  { id: "tcl-blueark-x5", partner: "TCL", name: "BlueArk X5", src: imgX5, w: 480, h: 900, alt: "TCL BlueArk X5 all-in-one industrial energy storage cabinet" },
];
const HOLD_MS = 7000; // each product's time on screen (counted only while the hero is seen, untouched)
const FADE = "duration-[1200ms]"; // the cross-fade (opacity only)

/**
 * Home hero: the copy on the left, a slow showcase of real partner products on the right (below the
 * copy on phones).
 *
 * SHOWCASE — the first product is in the pre-rendered page (the first screen's image, eager, high
 * priority), and the h1 beside it paints at once. The other three are added only after `load`, so
 * they never compete with the first paint. Then, every 7 s, the next product cross-fades in (1.2 s,
 * opacity only, the old one fading out underneath), its partner and model name with it, until the
 * round is complete — back on the first product — and it stops: no constant motion. The countdown
 * only runs while the hero is in view, the tab is visible and the showcase is neither hovered nor
 * focused. The dots below show where the round is and pick a product (which ends the rotation: the
 * visitor has taken over). prefers-reduced-motion: no rotation — the first product, still (the dots
 * still switch, without a fade).
 *
 * Set into the hero, not framed: a soft green light behind the product and a contact shadow under
 * it; the copy and the product drift a few px against each other with the pointer (desktop).
 *
 * (Until 2026-10 the hero showed a NEXERA-marked cabinet opening on video; that version is in git
 * history, and its footage stays in src/assets/products.)
 */
export default function HomeHero() {
  const section = useRef(null);
  const stage = useRef(null);
  const parallax = useMediaQuery("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  // First load: the product must not start transparent (it is the first screen's image), so it only
  // settles in scale; client-side navigations keep the fade-and-settle (index.css).
  const [firstLoad] = useState(() => typeof window === "undefined" || isFirstLoad());
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(false); // the other products are in the page
  const [auto, setAuto] = useState(true); // the round is still to run
  const held = useRef(false); // hovered or focused

  useEffect(() => {
    const go = () => setLoaded(true);
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });
    return () => window.removeEventListener("load", go);
  }, []);

  // One round: through every product and back to the first, then stop.
  useEffect(() => {
    const el = stage.current;
    if (!loaded || !auto || reduced || !el) return;
    let seen = true;
    let left = HOLD_MS;
    let last = performance.now();
    let cur = 0;
    let busy = false;
    const io = new IntersectionObserver(([e]) => (seen = e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    const tick = setInterval(async () => {
      const now = performance.now();
      if (seen && !document.hidden && !held.current) left -= now - last;
      last = now;
      if (left > 0 || busy) return;
      busy = true;
      const next = (cur + 1) % SHOWCASE.length;
      // Only cross to a product that is ready to paint (decoded), so it never pops in half-loaded.
      await el.querySelectorAll("img")[next]?.decode?.().catch(() => {});
      cur = next;
      setIndex(next);
      left = HOLD_MS;
      busy = false;
      if (next === 0) setAuto(false);
    }, 200);
    return () => {
      clearInterval(tick);
      io.disconnect();
    };
  }, [loaded, auto, reduced]);

  const choose = (i) => {
    setLoaded(true);
    setAuto(false);
    setIndex(i);
  };

  // Pointer parallax (desktop only): normalised pointer position as two custom properties, at most
  // once per frame; CSS transitions do the easing.
  useEffect(() => {
    const el = section.current;
    if (!el || !parallax) return;
    let raf = 0;
    let nx = 0;
    let ny = 0;
    const apply = () => {
      raf = 0;
      el.style.setProperty("--mx", nx.toFixed(3));
      el.style.setProperty("--my", ny.toFixed(3));
    };
    const onMove = (e) => {
      if (e.pointerType !== "mouse") return;
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
  }, [parallax]);

  const drift = (px, py) => ({
    transform: `translate3d(calc(var(--mx, 0) * ${px}px), calc(var(--my, 0) * ${py}px), 0)`,
    transition: "transform 900ms cubic-bezier(0.22, 1, 0.36, 1)",
  });

  return (
    <section ref={section} data-home-hero className="relative overflow-hidden bg-deep-grid text-white">
      {/* Atmosphere: a graphite lift from the top left, a faint engineering grid, and a fall-off into
          the deeper ground at the bottom. It drifts slightly against the product for depth. */}
      <div aria-hidden="true" className="pointer-events-none absolute -inset-4" style={parallax ? drift(-2, -1.5) : undefined}>
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(55% 60% at 8% 0%, color-mix(in srgb, var(--color-paper) 5%, transparent), transparent 70%), linear-gradient(to bottom, transparent 70%, var(--color-deep-grid))",
          }}
        />
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "linear-gradient(color-mix(in srgb, var(--color-paper) 3.5%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--color-paper) 3.5%, transparent) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(70% 80% at 70% 45%, #000, transparent 75%)",
            WebkitMaskImage: "radial-gradient(70% 80% at 70% 45%, #000, transparent 75%)",
          }}
        />
      </div>

      <div className="hero-fit relative grid container-site items-center gap-10 py-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-12 lg:py-6 xl:grid-cols-[minmax(0,36rem)_minmax(0,1fr)]">
        <div className="relative z-10">
          <HomeHeroCopy parallax={parallax} />
        </div>

        {/* Product: a fixed stage (no layout shift as products change), the caption and the dots. */}
        <div className="lg:flex lg:items-center lg:justify-center lg:self-stretch" style={parallax ? drift(6, 5) : undefined}>
          <figure
            className={`${firstLoad ? "hero-product-settle" : "hero-product-in"} relative mx-auto flex w-full flex-col items-center`}
            onPointerEnter={() => (held.current = true)}
            onPointerLeave={() => (held.current = false)}
            onFocus={() => (held.current = true)}
            onBlur={() => (held.current = false)}
          >
            {/* A soft green light behind the product, and its contact shadow. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-x-[30%] -inset-y-[18%]"
              style={{
                background:
                  "radial-gradient(38% 40% at 50% 46%, color-mix(in srgb, var(--accent) 9%, transparent), color-mix(in srgb, var(--accent) 3%, transparent) 45%, transparent 75%)",
              }}
            />
            <div
              ref={stage}
              className="relative aspect-[3/4] w-[min(100%,20rem)] sm:w-[22rem] lg:w-auto lg:h-[min(38rem,calc(100svh-14rem))]"
            >
              <div aria-hidden="true" className="pointer-events-none absolute inset-x-[16%] bottom-[-1.5%] h-[5%] rounded-[100%] bg-black/55 blur-lg" />
              {SHOWCASE.map((p, i) =>
                i === 0 || loaded ? (
                  <img
                    key={p.id}
                    src={p.src}
                    width={p.w}
                    height={p.h}
                    alt={p.alt}
                    aria-hidden={i !== index}
                    loading={i === 0 ? "eager" : "lazy"}
                    fetchPriority={i === 0 ? "high" : "low"}
                    decoding={i === 0 ? "sync" : "async"}
                    className={`absolute inset-0 h-full w-full object-contain object-bottom transition-opacity ${FADE} ease-in-out motion-reduce:transition-none ${
                      i === index ? "opacity-100" : "opacity-0"
                    }`}
                  />
                ) : null
              )}
            </div>
            <figcaption className="relative mt-6 grid w-full place-items-center text-center">
              {SHOWCASE.map((p, i) => (
                <div
                  key={p.id}
                  inert={i !== index}
                  className={`col-start-1 row-start-1 transition-opacity ${FADE} ease-in-out motion-reduce:transition-none ${i === index ? "opacity-100" : "opacity-0"}`}
                >
                  <p className="eyebrow text-label">{p.partner}</p>
                  <Link to={`/products/${p.id}`} className="link mt-1 inline-block text-small font-semibold text-white">
                    {p.name}
                  </Link>
                </div>
              ))}
            </figcaption>
            <div role="group" aria-label="Featured systems" className="relative mt-3 flex items-center gap-1">
              {SHOWCASE.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  aria-label={`Show ${p.partner} ${p.name}`}
                  aria-pressed={i === index}
                  onClick={() => choose(i)}
                  className="group/dot hit-area grid h-6 w-6 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  <span
                    className={`block h-1.5 w-1.5 rounded-full transition-[scale,background-color] duration-base ease-standard ${
                      i === index ? "scale-150 bg-accent" : "bg-white/35 group-hover/dot:bg-white/70 group-focus-visible/dot:bg-white/70"
                    }`}
                  />
                </button>
              ))}
            </div>
          </figure>
        </div>
      </div>
    </section>
  );
}
