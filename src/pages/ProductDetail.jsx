import { useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
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
import TiltSurface from "../components/ui/TiltSurface";
import { useParallax } from "../lib/parallax";
import Reveal from "../components/Reveal";
import ProductCard from "../components/catalogue/ProductCard";
import HotspotViewer from "../components/catalogue/HotspotViewer";
import ChooseCta from "../components/catalogue/ChooseCta";

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

/** The page body, keyed by product so every per-product effect (drift, tabs, reveals) starts fresh. */
function ProductView({ product }) {
  const drift = useRef(null);
  // Scroll storytelling: as the hero scrolls away, the product settles back gently.
  useParallax(drift, { amount: 4 });
  const partner = partnerOf(product.partner);
  const related = PRODUCTS.filter((p) => p.partner === product.partner && p.id !== product.id).slice(0, 3);
  const hasTech = SPEC_GROUPS.some((g) => product.specs[g.id]?.length);

  return (
    <div>
      {/* Product hero */}
      <section className="relative overflow-hidden bg-night text-white">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(55% 60% at 8% 0%, rgba(244,247,244,0.05), transparent 70%), linear-gradient(to bottom, transparent 60%, var(--color-deep))" }} />
        <div className="relative mx-auto max-w-6xl px-6 pb-14 pt-8 lg:pb-16">
          <nav aria-label="Breadcrumb" className="text-xs text-ice/60">
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
            <Reveal>
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-ice/80">
                Technology partner · <span className="text-white">{partner.name}</span>
              </p>
              <h1 className="mt-4 text-[clamp(2rem,3.6vw,3rem)] font-semibold leading-[1.1] tracking-tight">{product.name}</h1>
              {product.model && <p className="mt-2 font-medium text-signal">{product.model}</p>}
              <p className="mt-2 text-ice/70">{product.type}</p>
              <ul className="mt-5 flex flex-wrap gap-2" aria-label="Applications">
                {product.applications.map((a) => (
                  <li key={a} className="rounded-full border border-white/15 px-3 py-1 text-xs font-medium text-ice/85">
                    {applicationLabel(a)}
                  </li>
                ))}
              </ul>
              <p className="mt-6 max-w-lg leading-relaxed text-ice/80">{product.summary}</p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <MagneticButton to={`/contact?product=${product.id}`} arrow>
                  Enquire About This System
                </MagneticButton>
                {product.datasheet && (
                  <a
                    href={product.datasheet}
                    download
                    className="inline-flex items-center gap-2 rounded-full border border-white/60 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
                  >
                    <Download aria-hidden="true" className="h-4 w-4" />
                    Download Datasheet
                  </a>
                )}
              </div>
              <Link to="/products" className="mt-6 inline-flex items-center gap-1.5 text-sm text-ice/60 hover:text-white">
                <ArrowLeft aria-hidden="true" className="h-4 w-4" /> All products
              </Link>
            </Reveal>

            <Reveal delay={0.1}>
              <figure>
                <div className="relative mx-auto aspect-square w-full max-w-md">
                  <div aria-hidden="true" className="absolute -inset-[8%]" style={{ background: "radial-gradient(50% 50% at 50% 55%, rgba(144,217,136,0.12), rgba(144,217,136,0.035) 45%, transparent 72%)" }} />
                  <span aria-hidden="true" className="absolute inset-x-[18%] bottom-[5%] h-[6%] rounded-[100%] bg-black/60 blur-lg" />
                  <div ref={drift} className="absolute inset-0 will-change-transform">
                    <TiltSurface degrees={4} className="h-full w-full">
                      <img src={product.image} alt={product.imageAlt} className="absolute inset-0 m-auto h-[88%] w-[88%] object-contain" />
                    </TiltSurface>
                  </div>
                </div>
                {product.imageNote && <figcaption className="mt-3 text-center text-xs text-ice/50">{product.imageNote}</figcaption>}
              </figure>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Key specifications */}
      <section className="bg-ice py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sage">Key specifications</p>
          <AnimatedText className="mt-3 text-2xl font-semibold tracking-tight text-ink md:text-3xl">At a glance</AnimatedText>
          <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {product.keySpecs.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.06} className="rounded-2xl border border-line bg-paper p-5">
                <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-sage">{s.label}</dt>
                <dd className="mt-2 text-xl font-semibold tracking-tight text-forest">{s.value}</dd>
              </Reveal>
            ))}
          </dl>
          {product.specsNote && <p className="mt-5 text-sm text-graphite">{product.specsNote}</p>}
        </div>
      </section>

      {/* Highlights */}
      {product.highlights.length > 0 && (
        <section className="bg-paper py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sage">Product highlights</p>
            <AnimatedText className="mt-3 text-2xl font-semibold tracking-tight text-ink md:text-3xl">Why this system</AnimatedText>
            <ul className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {product.highlights.map((h, i) => {
                const Icon = ICONS[h.icon] ?? ShieldCheck;
                return (
                  <Reveal as="li" key={h.title} delay={i * 0.06}>
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-ice text-forest">
                      <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.7} />
                    </span>
                    <h3 className="mt-4 font-semibold text-ink">{h.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-graphite">{h.text}</p>
                  </Reveal>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {/* Interactive product view — only where a partner reference confirms the components */}
      {product.hotspots && (
        <section className="relative overflow-hidden bg-night py-16 text-white md:py-20">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(45% 60% at 35% 50%, rgba(144,217,136,0.07), transparent 70%)" }} />
          <div className="relative mx-auto max-w-6xl px-6">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-ice/80">Interactive product view</p>
            <AnimatedText className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">Explore the protection architecture</AnimatedText>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ice/70">Hover or select a point to see the component.</p>
            <div className="mt-10">
              <HotspotViewer hotspots={product.hotspots} partnerName={partner.name} />
            </div>
          </div>
        </section>
      )}

      {/* Technical information */}
      {hasTech && (
        <section className="bg-paper py-16 md:py-20">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sage">Technical information</p>
              <AnimatedText className="mt-3 text-2xl font-semibold tracking-tight text-ink md:text-3xl">Specifications</AnimatedText>
              {product.specsNote && <p className="mt-4 text-sm leading-relaxed text-graphite">{product.specsNote}</p>}
            </div>
            <TechnicalTabs key={product.id} specs={product.specs} />
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
              <Link to={`/products?partner=${partner.id}`} className="shrink-0 text-sm font-semibold text-forest hover:text-steel">
                View all {partner.name}
              </Link>
            </div>
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p, i) => (
                <Reveal as="li" key={p.id} delay={i * 0.07}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      )}

      <ChooseCta productId={product.id} />
    </div>
  );
}
