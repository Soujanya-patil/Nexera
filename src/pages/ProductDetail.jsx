import { Fragment, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Boxes,
  ChevronRight,
  Cpu,
  Download,
  FileText,
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
import { SOLUTION_PAGES } from "../data/solutions";
import { PARTNER_LINE } from "../data/partners";
import { docHref } from "../lib/contactLinks";
import PillLink from "../components/PillLink";
import AnimatedTabs from "@/components/smoothui/animated-tabs";
import MagneticButton from "../components/ui/MagneticButton";
import AnimatedText from "../components/ui/AnimatedText";
import CountUp from "../components/CountUp";
import { useParallax } from "../lib/parallax";
import ProductCard from "../components/catalogue/ProductCard";
import HotspotViewer from "../components/catalogue/HotspotViewer";
import ChooseCta from "../components/catalogue/ChooseCta";
import { depth, usePointerDepth } from "../lib/pointerDepth";
import { useIntro } from "../lib/intro";
import { useScrollReveal } from "../lib/scrollReveal";
import { ProductsRoute } from "./lazy";
import { DUR, STAGGER } from "../lib/tokens";

const TAB_ID = "spec-tabs";
// "At a glance" grid columns by the number of key figures.
const GLANCE_COLS = { 2: "sm:grid-cols-2 lg:max-w-wide", 3: "md:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" };
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
              <dt className="text-small text-copy">{row.label}</dt>
              <dd className="text-small font-medium tabular-nums text-ink">{row.value}</dd>
            </div>
          ))}
        </dl>
      ))}
    </div>
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
      <section className="bg-paper">
        <div className="mx-auto max-w-2xl px-6 py-24 text-center">
          <h1 className="text-h1 font-semibold text-ink">We couldn&rsquo;t find that system.</h1>
          <p className="mt-2 text-copy">It may have been renamed or removed from the catalogue.</p>
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
    tl.fromTo(q('[data-a="crumbs"]'), { opacity: 0 }, { opacity: 1, duration: DUR.base, ...done }, 0)
      .fromTo(q('[data-a="eyebrow"]'), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: DUR.base, ...done }, 0.05)
      .fromTo(q('[data-a="title"]'), { opacity: 0, y: 36 }, { opacity: 1, y: 0, duration: DUR.slow, ...done }, 0.15)
      .fromTo(q('[data-a="meta"]'), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: DUR.base, stagger: STAGGER, ...done }, 0.35)
      .fromTo(q('[data-a="desc"]'), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: DUR.base, ...done }, 0.5)
      .fromTo(q('[data-a="cta"]'), { opacity: 0, y: 12, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: DUR.base, stagger: STAGGER, ...done }, 0.7);
  });
  const reveal = useScrollReveal(page);
  // Returning to the catalogue should be instant too.
  useEffect(() => {
    ProductsRoute.preload();
  }, []);

  const partner = partnerOf(product.partner);
  const related = PRODUCTS.filter((p) => p.partner === product.partner && p.id !== product.id && p.listed !== false).slice(0, 3);
  const hasTech = SPEC_GROUPS.some((g) => product.specs[g.id]?.length);

  return (
    <div ref={page} data-sr-state={reveal}>
      {/* PRODUCT */}
      <section ref={hero} className="relative overflow-hidden bg-deep-grid text-white">
        <div aria-hidden="true" className="pointer-events-none absolute -inset-3" style={depth(-2, -1.5)}>
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(55% 60% at 8% 0%, color-mix(in srgb, var(--color-paper) 5%, transparent), transparent 70%), linear-gradient(to bottom, transparent 60%, var(--color-deep-grid))" }}
          />
        </div>
        <div data-intro={intro} className="relative container-site pb-14 pt-8 lg:pb-16">
          <nav data-a="crumbs" aria-label="Breadcrumb" className="text-micro text-paper/60">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link to="/products" className="hit-area hover:text-white focus-visible:text-white">
                  Products
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="h-3.5 w-3.5" />
              </li>
              <li>
                <Link to={`/partners/${partner.id}`} className="hit-area hover:text-white focus-visible:text-white">
                  {partner.name}
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="h-3.5 w-3.5" />
              </li>
              <li aria-current="page" className="text-paper/90">
                {product.name}
              </li>
            </ol>
          </nav>

          <div className="mt-8 grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">
            <div>
              <p data-a="eyebrow" className="eyebrow text-paper/80">
                Technology partner ·{" "}
                <Link to={`/partners/${partner.id}`} className="text-white underline-offset-4 hover:text-accent focus-visible:text-accent hover:underline focus-visible:underline">
                  {partner.name}
                </Link>
              </p>
              <h1 data-a="title" className="mt-eyebrow text-h1 font-semibold">
                {product.name}
              </h1>
              <div data-a="meta">
                {product.model && <p className="mt-2 font-medium text-accent">{product.model}</p>}
                <p className="mt-2 text-paper/70">{product.type}</p>
              </div>
              <ul data-a="meta" className="mt-5 flex flex-wrap gap-2" aria-label="Applications">
                {product.applications.map((a) => (
                  <li key={a} className="rounded-full border border-white/15 px-3 py-1 text-micro font-medium text-paper/85">
                    {applicationLabel(a)}
                  </li>
                ))}
              </ul>
              {/* Back to the Solutions page(s) this system belongs to. */}
              <p data-a="meta" className="mt-3 text-small text-paper/70">
                See how it fits:{" "}
                {product.applications.map((a, i) => (
                  <Fragment key={a}>
                    {i > 0 && " · "}
                    <Link to={SOLUTION_PAGES[a].path} className="font-semibold text-accent underline-offset-4 hover:underline focus-visible:underline">
                      {SOLUTION_PAGES[a].label} solutions
                    </Link>
                  </Fragment>
                ))}
              </p>
              {/* The summary, then where to get it: the partner pages' own line (data/partners.js). */}
              <p data-a="desc" className="mt-6 max-w-lg text-body text-paper/80">
                {product.summary} {PARTNER_LINE}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <span data-a="cta" className="inline-block">
                  <MagneticButton to={`/contact?product=${product.id}`} arrow>
                    Enquire About This System
                  </MagneticButton>
                </span>
                {/* The datasheet: a download where the file exists, otherwise a request (the homepage form,
                    pre-filled) — the same "Request Datasheet" as the catalogue cards. */}
                <a
                  data-a="cta"
                  href={product.datasheet ?? docHref(product)}
                  download={product.datasheet ? "" : undefined}
                  className="btn-motion inline-flex min-h-11 items-center gap-2 rounded-full border border-white/60 px-6 py-3 text-button font-semibold text-white hover:border-white focus-visible:border-white hover:bg-white/10 focus-visible:bg-white/10"
                >
                  {product.datasheet ? <Download aria-hidden="true" className="h-4 w-4" /> : <FileText aria-hidden="true" className="h-4 w-4" />}
                  {product.datasheet ? "Download Datasheet" : "Request Datasheet"}
                </a>
              </div>
              <Link data-a="cta" to="/products" className="group/back mt-6 inline-flex items-center gap-1.5 text-small text-paper/60 hover:text-white focus-visible:text-white">
                <ArrowLeft aria-hidden="true" className="h-4 w-4 transition-transform duration-fast group-hover/back:-translate-x-1 group-focus-visible/back:-translate-x-1 group-focus-within/back:-translate-x-1" /> All products
              </Link>
            </div>

            <figure>
              <div className="group/hero relative mx-auto aspect-square w-full max-w-md">
                <div aria-hidden="true" className="pointer-events-none absolute -inset-[10%]" style={depth(-2, -1.5)}>
                  <div
                    className="ambient-drift absolute inset-0"
                    style={{ background: "radial-gradient(48% 48% at 50% 55%, color-mix(in srgb, var(--accent) 13%, transparent), color-mix(in srgb, var(--accent) 4%, transparent) 45%, transparent 72%)" }}
                  />
                </div>
                <span aria-hidden="true" className="absolute inset-x-[18%] bottom-[5%] h-[6%] rounded-[100%] bg-black/60 blur-lg" />
                <div ref={drift} className="absolute inset-0 will-change-transform">
                  <div className="absolute inset-0" style={depth(6, 5)}>
                    {product.imageFallback ? (
                      // No product photo (data/products.js `imageFallback`): the partner's logo on a light panel.
                      <div
                        data-vt-hero={product.id}
                        style={{ viewTransitionName: `product-${product.id}` }}
                        className="absolute inset-[16%] grid place-items-center rounded-card bg-white/95"
                      >
                        <img
                          src={product.image}
                          alt={product.imageAlt}
                          fetchPriority="high"
                          loading="eager"
                          decoding="async"
                          className="h-auto w-[52%] object-contain opacity-85"
                        />
                      </div>
                    ) : (
                      <img
                        src={product.image}
                        alt={product.imageAlt}
                        fetchPriority="high"
                        loading="eager"
                        decoding="async"
                        data-vt-hero={product.id}
                        style={{ viewTransitionName: `product-${product.id}` }}
                        className="absolute inset-0 m-auto h-[88%] w-[88%] object-contain transition-[scale] duration-slow ease-standard group-hover/hero:scale-[1.015] group-focus-visible/hero:scale-[1.015] group-focus-within/hero:scale-[1.015]"
                      />
                    )}
                  </div>
                </div>
              </div>
              {product.imageNote && <figcaption className="mt-3 text-center text-micro text-label">{product.imageNote}</figcaption>}
            </figure>
          </div>
        </div>
      </section>

      {/* Key specifications */}
      <section className="bg-paper py-section">
        <div className="container-site">
          <p className="eyebrow text-muted">Key specifications</p>
          <AnimatedText className="mt-eyebrow text-h2 font-semibold text-ink">At a glance</AnimatedText>
          {/* Columns follow the number of figures (2–4), so a row never ends in an empty slot. */}
          <dl className={`mt-8 grid gap-4 ${GLANCE_COLS[product.keySpecs.length] ?? GLANCE_COLS[4]}`}>
            {product.keySpecs.map((s) => (
              <div
                data-sr
                key={s.label}
                className="group/spec relative overflow-hidden rounded-card border border-line bg-white p-5 card-hover"
              >
                <span aria-hidden="true" className="absolute left-5 top-0 h-0.5 w-10 origin-left scale-x-0 rounded-full bg-accent transition-[scale] duration-base ease-standard group-hover/spec:scale-x-100 group-focus-visible/spec:scale-x-100 group-focus-within/spec:scale-x-100" />
                <dt className="eyebrow text-muted">{s.label}</dt>
                <dd className="mt-2 text-h3 tabular-nums font-semibold text-accent">
                  <CountUp value={s.value} />
                </dd>
              </div>
            ))}
          </dl>
          {product.specsNote && <p className="mt-5 text-small text-copy">{product.specsNote}</p>}
        </div>
      </section>

      {/* TECHNOLOGY */}
      {product.highlights.length > 0 && (
        <section className="bg-white py-section">
          <div className="container-site">
            <p className="eyebrow text-muted">Product highlights</p>
            <AnimatedText className="mt-eyebrow text-h2 font-semibold text-ink">Why this system</AnimatedText>
            <ul className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {product.highlights.map((h) => {
                const Icon = ICONS[h.icon] ?? ShieldCheck;
                return (
                  <li data-sr key={h.title} className="group/hl">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-ice text-ink transition-[background-color,color,scale] duration-fast group-hover/hl:text-accent group-focus-visible/hl:text-accent group-focus-within/hl:text-accent group-hover/hl:scale-105 group-focus-visible/hl:scale-105 group-focus-within/hl:scale-105 group-hover/hl:bg-accent/25 group-focus-visible/hl:bg-accent/25 group-focus-within/hl:bg-accent/25">
                      <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.7} />
                    </span>
                    <h3 className="mt-4 font-semibold text-ink">{h.title}</h3>
                    <p className="mt-1.5 text-small text-copy">{h.text}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {/* SPECIFICATIONS */}
      {hasTech && (
        <section className="bg-paper py-section">
          <div className="grid container-site gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
            <div>
              <p className="eyebrow text-muted">Technical information</p>
              <AnimatedText className="mt-eyebrow text-h2 font-semibold text-ink">Specifications</AnimatedText>
              {product.specsNote && <p className="mt-4 text-small text-copy">{product.specsNote}</p>}
            </div>
            <div data-sr className="min-w-0">
              <TechnicalTabs key={product.id} specs={product.specs} />
            </div>
          </div>
        </section>
      )}

      {/* SAFETY — interactive view, only where a partner reference confirms the components */}
      {product.hotspots && (
        <section className="relative overflow-hidden bg-deep-grid py-section text-white">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(45% 60% at 35% 50%, color-mix(in srgb, var(--accent) 7%, transparent), transparent 70%)" }} />
          <div className="relative container-site">
            <p className="eyebrow text-paper/80">Interactive product view</p>
            <AnimatedText className="mt-eyebrow text-h2 font-semibold">Explore the protection architecture</AnimatedText>
            <p className="mt-heading max-w-measure text-small text-paper/70">Hover or select a point to see the component.</p>
            <div data-sr className="mt-10">
              <HotspotViewer hotspots={product.hotspots} partnerName={partner.name} />
            </div>
          </div>
        </section>
      )}

      {/* Sources */}
      <section className="border-t border-line bg-white">
        <div className="container-site py-6">
          <p className="text-micro text-copy">
            <span className="font-semibold text-ink">Source:</span> {product.sources.join("; ")}. {partner.name} designs and manufactures this
            system; NEXERA supplies it and provides system design and support as an authorized partner.
          </p>
        </div>
      </section>

      {/* More from this partner */}
      {related.length > 0 && (
        <section className="bg-paper py-section">
          <div className="container-site">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-h2 font-semibold text-ink">More from {partner.name}</h2>
              <Link
                to={`/products?partner=${partner.id}`}
                className="group/all inline-flex shrink-0 items-center gap-1.5 text-button font-semibold text-accent hover:text-link focus-visible:text-link"
              >
                View all {partner.name}
                <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform duration-fast group-hover/all:translate-x-1 group-focus-visible/all:translate-x-1 group-focus-within/all:translate-x-1" />
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
