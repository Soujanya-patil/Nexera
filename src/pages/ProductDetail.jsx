import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Boxes,
  ChevronRight,
  Cpu,
  Download,
  Expand,
  Flame,
  Gauge,
  LandPlot,
  Layers,
  Minimize2,
  Monitor,
  Network,
  ShieldCheck,
  Snowflake,
  Sun,
  Thermometer,
  Zap,
} from "lucide-react";
import { PRODUCTS, SPEC_GROUPS, applicationLabel, getProduct, partnerOf } from "../data/products";
import PillLink from "../components/PillLink";
import AnimatedTabs from "@/components/smoothui/animated-tabs";
import MagneticButton from "../components/ui/MagneticButton";
import AnimatedText from "../components/ui/AnimatedText";
import { useParallax } from "../lib/parallax";
import ProductCard from "../components/catalogue/ProductCard";
import HotspotViewer from "../components/catalogue/HotspotViewer";
import ChooseCta from "../components/catalogue/ChooseCta";
import { depth, usePointerDepth } from "../lib/pointerDepth";
import { useIntro } from "../lib/intro";
import { useScrollReveal } from "../lib/scrollReveal";
import { ProductsRoute } from "./lazy";

const TAB_ID = "spec-tabs";
const ICONS = { Boxes, Cpu, Expand, Flame, Gauge, LandPlot, Layers, Minimize2, Monitor, Network, ShieldCheck, Snowflake, Sun, Thermometer, Zap };

/**
 * Technical information: SmoothUI's AnimatedTabs (installed from the SmoothUI registry; its sliding
 * underline is a shared-layout motion element and respects reduced motion) driving plain tab panels.
 * Only groups with data get a tab. The row scrolls sideways on phones rather than wrapping.
 */
function TechnicalTabs({ specs }) {
  const groups = SPEC_GROUPS.filter((g) => specs[g.id]?.length);
  const [tab, setTab] = useState(groups[0]?.id);
  if (!groups.length) return null;
  return (
    // min-w-0: as a grid item this would otherwise grow to the tab row's full width on phones
    <div className="min-w-0">
      <div data-lenis-prevent className="-mx-6 overflow-x-auto px-6 [scrollbar-width:none] sm:mx-0 sm:px-0">
        <AnimatedTabs
          tabs={groups.map(({ id, label }) => ({ id, label }))}
          activeTab={tab}
          onChange={setTab}
          layoutId={TAB_ID}
          variant="underline"
          className="min-w-full"
        />
      </div>
      {groups.map((g) => (
        <dl key={g.id} role="tabpanel" aria-labelledby={`${TAB_ID}-tab-${g.id}`} hidden={tab !== g.id} className="divide-y divide-line">
          {specs[g.id].map((row, i) => (
            <div
              key={row.label}
              className="grid gap-1 py-4 animate-[spec-row_0.4s_ease-out_both] sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] sm:gap-6"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <dt className="text-sm text-graphite">{row.label}</dt>
              <dd className="text-sm font-medium text-ink">{row.value}</dd>
            </div>
          ))}
        </dl>
      ))}
    </div>
  );
}

/**
 * A key-specification value that counts up to its exact figure the first time it scrolls into view.
 * Only values that begin with a real number animate ("261 kWh", "6.25 MWh", "8–128 kWh" — both ends
 * of a range); everything else ("IP55", "LFP", "Up to 6.3 MWh", model names) is shown as written.
 * The count always lands on the data's own text; screen readers get that text directly.
 */
const RANGE = /^(\d+(?:\.\d+)?)–(\d+(?:\.\d+)?)(.*)$/;
const SINGLE = /^(\d+(?:\.\d+)?)(.*)$/;
const decimals = (n) => (n.split(".")[1] || "").length;

function SpecValue({ value }) {
  const range = value.match(RANGE);
  const single = !range && value.match(SINGLE);
  const countable = Boolean(range || single);
  const format = (t) => {
    const f = (n) => (parseFloat(n) * t).toFixed(decimals(n));
    return range ? `${f(range[1])}–${f(range[2])}${range[3]}` : `${f(single[1])}${single[2]}`;
  };
  const [shown, setShown] = useState(() =>
    countable && !window.matchMedia("(prefers-reduced-motion: reduce)").matches ? format(0) : value
  );
  const ref = useRef(null);
  useEffect(() => {
    if (!countable || shown === value) return;
    const el = ref.current;
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min((now - start) / 1100, 1);
          setShown(p < 1 ? format(1 - Math.pow(1 - p, 3)) : value);
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
    // Runs once: the count only ever goes up to the real value.
  }, []);
  return (
    <span ref={ref}>
      <span className="sr-only">{value}</span>
      <span aria-hidden="true" className="tabular-nums">
        {shown}
      </span>
    </span>
  );
}

/**
 * /products/:productId — one system in depth. Everything shown comes from the product entry in
 * src/data/products.js; sections without data (highlights, interactive view, technical groups,
 * datasheet) are omitted rather than padded.
 */
export default function ProductDetail() {
  const { productId } = useParams();
  const product = getProduct(productId);

  if (!product) {
    return (
      <section className="bg-ice">
        <div className="mx-auto max-w-2xl px-6 py-24 text-center">
          <h1 className="text-2xl font-semibold text-ink">We couldn&rsquo;t find that system.</h1>
          <p className="mt-2 text-graphite">It may have been renamed or removed from the catalogue.</p>
          <PillLink to="/products" className="mt-8">
            Browse all products
          </PillLink>
        </div>
      </section>
    );
  }

  return <ProductView key={product.id} product={product} />;
}

/**
 * The page body, keyed by product so every per-product effect starts fresh.
 *
 * Story: PRODUCT (hero, key figures) -> TECHNOLOGY (highlights) -> SPECIFICATIONS (tabs) -> SAFETY
 * (interactive protection view, where confirmed) -> related systems -> ENQUIRE.
 * Hero: GSAP entrance for the copy (CTA last); pointer depth (desktop), a slow ambient light, scroll
 * drift and a 1.015 hover scale on the product. The product image itself is never part of the
 * entrance: it carries the View Transition name that morphs it in from the catalogue card.
 * Sections: ScrollTrigger reveals ([data-sr]) with small staggers; key figures count up once.
 */
function ProductView({ product }) {
  const page = useRef(null);
  const hero = useRef(null);
  const drift = useRef(null);
  usePointerDepth(hero);
  // Scroll storytelling: as the hero scrolls away, the product settles back gently.
  useParallax(drift, { amount: 4 });
  const intro = useIntro(hero, ({ tl, q }) => {
    const done = { clearProps: "all" };
    tl.fromTo(q('[data-a="crumbs"]'), { opacity: 0 }, { opacity: 1, duration: 0.5, ...done }, 0)
      .fromTo(q('[data-a="eyebrow"]'), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, ...done }, 0.05)
      .fromTo(q('[data-a="title"]'), { opacity: 0, y: 36, filter: "blur(6px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.9, ...done }, 0.15)
      .fromTo(q('[data-a="meta"]'), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ...done }, 0.35)
      .fromTo(q('[data-a="desc"]'), { opacity: 0, y: 14, filter: "blur(4px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6, ...done }, 0.5)
      .fromTo(q('[data-a="cta"]'), { opacity: 0, y: 12, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.08, ...done }, 0.7);
  });
  const reveal = useScrollReveal(page, { stagger: 0.08 });
  // Returning to the catalogue should be instant too.
  useEffect(() => {
    ProductsRoute.preload();
  }, []);

  const partner = partnerOf(product.partner);
  const related = PRODUCTS.filter((p) => p.partner === product.partner && p.id !== product.id).slice(0, 3);
  const hasTech = SPEC_GROUPS.some((g) => product.specs[g.id]?.length);

  return (
    <div ref={page} data-sr-state={reveal}>
      {/* PRODUCT */}
      <section ref={hero} className="relative overflow-hidden bg-night text-white">
        <div aria-hidden="true" className="pointer-events-none absolute -inset-3" style={depth(-2, -1.5)}>
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(55% 60% at 8% 0%, rgba(244,247,244,0.05), transparent 70%), linear-gradient(to bottom, transparent 60%, var(--color-deep))" }}
          />
        </div>
        <div data-intro={intro} className="relative mx-auto max-w-6xl px-6 pb-14 pt-8 lg:pb-16">
          <nav data-a="crumbs" aria-label="Breadcrumb" className="text-xs text-ice/60">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link to="/products" className="hover:text-white">
                  Products
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="h-3.5 w-3.5" />
              </li>
              <li>
                <Link to={`/products?partner=${partner.id}`} className="hover:text-white">
                  {partner.name}
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="h-3.5 w-3.5" />
              </li>
              <li aria-current="page" className="text-ice/90">
                {product.name}
              </li>
            </ol>
          </nav>

          <div className="mt-8 grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">
            <div>
              <p data-a="eyebrow" className="text-xs font-medium uppercase tracking-[0.22em] text-ice/80">
                Technology partner · <span className="text-white">{partner.name}</span>
              </p>
              <h1 data-a="title" className="mt-4 text-[clamp(2rem,3.6vw,3rem)] font-semibold leading-[1.1] tracking-tight">
                {product.name}
              </h1>
              <div data-a="meta">
                {product.model && <p className="mt-2 font-medium text-signal">{product.model}</p>}
                <p className="mt-2 text-ice/70">{product.type}</p>
              </div>
              <ul data-a="meta" className="mt-5 flex flex-wrap gap-2" aria-label="Applications">
                {product.applications.map((a) => (
                  <li key={a} className="rounded-full border border-white/15 px-3 py-1 text-xs font-medium text-ice/85">
                    {applicationLabel(a)}
                  </li>
                ))}
              </ul>
              <p data-a="desc" className="mt-6 max-w-lg leading-relaxed text-ice/80">
                {product.summary}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <span data-a="cta" className="inline-block">
                  <MagneticButton to={`/contact?product=${product.id}`} arrow className="hover:scale-[1.02]">
                    Enquire About This System
                  </MagneticButton>
                </span>
                {product.datasheet && (
                  <a
                    data-a="cta"
                    href={product.datasheet}
                    download
                    className="inline-flex items-center gap-2 rounded-full border border-white/60 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
                  >
                    <Download aria-hidden="true" className="h-4 w-4" />
                    Download Datasheet
                  </a>
                )}
              </div>
              <Link data-a="cta" to="/products" className="group/back mt-6 inline-flex items-center gap-1.5 text-sm text-ice/60 hover:text-white">
                <ArrowLeft aria-hidden="true" className="h-4 w-4 transition-transform duration-300 group-hover/back:-translate-x-1" /> All products
              </Link>
            </div>

            <figure>
              <div className="group/hero relative mx-auto aspect-square w-full max-w-md">
                <div aria-hidden="true" className="pointer-events-none absolute -inset-[10%]" style={depth(-2, -1.5)}>
                  <div
                    className="ambient-drift absolute inset-0"
                    style={{ background: "radial-gradient(48% 48% at 50% 55%, rgba(144,217,136,0.13), rgba(144,217,136,0.04) 45%, transparent 72%)" }}
                  />
                </div>
                <span aria-hidden="true" className="absolute inset-x-[18%] bottom-[5%] h-[6%] rounded-[100%] bg-black/60 blur-lg" />
                <div ref={drift} className="absolute inset-0 will-change-transform">
                  <div className="absolute inset-0" style={depth(6, 5)}>
                    <img
                      src={product.image}
                      alt={product.imageAlt}
                      data-vt-hero={product.id}
                      style={{ viewTransitionName: `product-${product.id}` }}
                      className="absolute inset-0 m-auto h-[88%] w-[88%] object-contain transition-[scale] duration-700 ease-out group-hover/hero:scale-[1.015]"
                    />
                  </div>
                </div>
              </div>
              {product.imageNote && <figcaption className="mt-3 text-center text-xs text-ice/50">{product.imageNote}</figcaption>}
            </figure>
          </div>
        </div>
      </section>

      {/* Key specifications */}
      <section className="bg-ice py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sage">Key specifications</p>
          <AnimatedText className="mt-3 text-2xl font-semibold tracking-tight text-ink md:text-3xl">At a glance</AnimatedText>
          <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {product.keySpecs.map((s) => (
              <div
                data-sr
                key={s.label}
                className="group/spec relative overflow-hidden rounded-2xl border border-line bg-paper p-5 transition-[border-color,translate] duration-300 hover:-translate-y-0.5 hover:border-forest/25"
              >
                <span aria-hidden="true" className="absolute left-5 top-0 h-0.5 w-6 rounded-full bg-signal transition-[width] duration-500 group-hover/spec:w-10" />
                <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-sage">{s.label}</dt>
                <dd className="mt-2 text-xl font-semibold tracking-tight text-forest">
                  <SpecValue value={s.value} />
                </dd>
              </div>
            ))}
          </dl>
          {product.specsNote && <p className="mt-5 text-sm text-graphite">{product.specsNote}</p>}
        </div>
      </section>

      {/* TECHNOLOGY */}
      {product.highlights.length > 0 && (
        <section className="bg-paper py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sage">Product highlights</p>
            <AnimatedText className="mt-3 text-2xl font-semibold tracking-tight text-ink md:text-3xl">Why this system</AnimatedText>
            <ul className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {product.highlights.map((h) => {
                const Icon = ICONS[h.icon] ?? ShieldCheck;
                return (
                  <li data-sr key={h.title} className="group/hl">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-ice text-forest transition-[background-color,scale] duration-300 group-hover/hl:scale-105 group-hover/hl:bg-signal/25">
                      <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.7} />
                    </span>
                    <h3 className="mt-4 font-semibold text-ink">{h.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-graphite">{h.text}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {/* SPECIFICATIONS */}
      {hasTech && (
        <section className="bg-ice py-16 md:py-20">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sage">Technical information</p>
              <AnimatedText className="mt-3 text-2xl font-semibold tracking-tight text-ink md:text-3xl">Specifications</AnimatedText>
              {product.specsNote && <p className="mt-4 text-sm leading-relaxed text-graphite">{product.specsNote}</p>}
            </div>
            <div data-sr className="min-w-0">
              <TechnicalTabs key={product.id} specs={product.specs} />
            </div>
          </div>
        </section>
      )}

      {/* SAFETY — interactive view, only where a partner reference confirms the components */}
      {product.hotspots && (
        <section className="relative overflow-hidden bg-night py-16 text-white md:py-20">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(45% 60% at 35% 50%, rgba(144,217,136,0.07), transparent 70%)" }} />
          <div className="relative mx-auto max-w-6xl px-6">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-ice/80">Interactive product view</p>
            <AnimatedText className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">Explore the protection architecture</AnimatedText>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ice/70">Hover or select a point to see the component.</p>
            <div data-sr className="mt-10">
              <HotspotViewer hotspots={product.hotspots} partnerName={partner.name} />
            </div>
          </div>
        </section>
      )}

      {/* Sources */}
      <section className="border-t border-line bg-paper">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <p className="text-xs leading-relaxed text-graphite">
            <span className="font-semibold text-ink">Source:</span> {product.sources.join("; ")}. {partner.name} designs and manufactures this
            system; NEXERA supplies it and provides system design and support as an authorized partner.
          </p>
        </div>
      </section>

      {/* More from this partner */}
      {related.length > 0 && (
        <section className="bg-ice py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-2xl font-semibold tracking-tight text-ink">More from {partner.name}</h2>
              <Link
                to={`/products?partner=${partner.id}`}
                className="group/all inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-forest hover:text-steel"
              >
                View all {partner.name}
                <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform duration-300 group-hover/all:translate-x-1" />
              </Link>
            </div>
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <li data-sr key={p.id}>
                  <ProductCard product={p} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ENQUIRE */}
      <ChooseCta productId={product.id} />
    </div>
  );
}
