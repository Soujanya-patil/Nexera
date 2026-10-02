import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, ChevronRight } from "lucide-react";
import AnimatedText from "../ui/AnimatedText";
import MagneticButton from "../ui/MagneticButton";
import PillLink from "../PillLink";
import SceneImg from "../SceneImg";
import { depth, usePointerDepth } from "../../lib/pointerDepth";
import { useIntro } from "../../lib/intro";
import { useScrollReveal } from "../../lib/scrollReveal";
import { scrollToId } from "../../lib/scrollTo";
import { partnerOf } from "../../data/products";

/*
 * Building blocks for the three Solutions pages (/solutions/utility-scale, /commercial-industrial,
 * /residential). Each reuses an existing site pattern — the For EPCs hero, the eyebrow + animated h2
 * section heading, the product page's icon-circle highlights, the catalogue card's plinth, PillLink /
 * MagneticButton CTAs and the scroll reveal — so the pages read as part of the same site.
 *
 * Headings: the hero's h1 is the page's only h1; every section heading is an h2; cards and items are
 * h3. All copy is real text in the markup.
 */

const TONES = { paper: "bg-paper", ice: "bg-ice", night: "bg-night text-white" };

/** Solutions hero (EpcHero's structure): breadcrumb, eyebrow, two-line h1 with the accent line, copy, CTA. */
export function SolutionHero({ crumb, eyebrow, line1, line2, subheading, body = [], tagline, cta, image }) {
  const root = useRef(null);
  usePointerDepth(root);
  const intro = useIntro(root, ({ tl, q }) => {
    const done = { clearProps: "all" };
    tl.fromTo(q('[data-a="eyebrow"]'), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, ...done }, 0)
      .fromTo(q('[data-a="line1"]'), { opacity: 0, y: 40, filter: "blur(6px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.85, ...done }, 0.12)
      .fromTo(
        q('[data-a="line2"]'),
        { opacity: 0, y: 44, filter: "blur(8px)", textShadow: "0 0 26px rgba(144,217,136,0.55)" },
        { opacity: 1, y: 0, filter: "blur(0px)", textShadow: "0 0 0px rgba(144,217,136,0)", duration: 1, ease: "expo.out", ...done },
        0.26
      )
      .fromTo(q('[data-a="desc"]'), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: "power2.out", ...done }, 0.5)
      .fromTo(q('[data-a="image"]'), { opacity: 0, scale: 1.05 }, { opacity: 1, scale: 1, duration: 1.5, ease: "power2.out", ...done }, 0.58)
      .fromTo(q('[data-a="cta"]'), { opacity: 0, y: 12, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, ...done }, 0.95);
  });

  return (
    <section ref={root} className="relative overflow-hidden bg-night text-white">
      <div data-intro={intro}>
        {/* Image: full-bleed behind the copy on phones (dimmed), the right ~60% of the frame on desktop */}
        <div data-a="image" className="absolute inset-0 overflow-hidden lg:left-[38%]">
          <div className="absolute -inset-3" style={depth(-6, -4)}>
            <SceneImg
              name={image.name}
              eager
              fetchPriority="high"
              sizes="(min-width: 1024px) 62vw, 100vw"
              alt={image.alt}
              className={`h-full w-full object-cover ${image.position ?? ""}`}
            />
          </div>
          <div aria-hidden="true" className="absolute inset-0 bg-night/75 lg:bg-transparent lg:bg-gradient-to-r lg:from-night lg:via-night/60 lg:to-night/10" />
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-night/90 to-transparent" />
        </div>

        <div className="relative container-site py-14 lg:py-20">
          <nav aria-label="Breadcrumb" className="text-xs text-ice/60">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link to="/solutions" className="hover:text-white">
                  Solutions
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="h-3.5 w-3.5" />
              </li>
              <li aria-current="page" className="text-ice/90">
                {crumb}
              </li>
            </ol>
          </nav>
          <div className="mt-10 max-w-2xl">
            <p data-a="eyebrow" className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-signal">
              <span aria-hidden="true" className="h-px w-8 bg-signal/70" />
              {eyebrow}
            </p>
            <h1 className="mt-5 text-[clamp(2.6rem,6vw,4.25rem)] font-semibold leading-[1.04] tracking-tight">
              <span data-a="line1" className="block">
                {line1}
              </span>{" "}
              <span data-a="line2" className="block text-signal">
                {line2}
              </span>
            </h1>
            <p data-a="desc" className="mt-6 text-lg font-medium text-white md:text-xl">
              {subheading}
            </p>
            {body.map((p) => (
              <p data-a="desc" key={p} className="mt-4 max-w-xl leading-relaxed text-ice/80">
                {p}
              </p>
            ))}
            {tagline && (
              <p data-a="desc" className="mt-5 text-sm font-semibold tracking-wide text-signal">
                {tagline}
              </p>
            )}
            <div className="mt-9">
              <span data-a="cta" className="inline-block">
                <MagneticButton to={`#${cta.target}`} onClick={scrollToId(cta.target)} arrow className="hover:scale-[1.02]">
                  {cta.label}
                </MagneticButton>
              </span>
            </div>
          </div>
        </div>
        {image.credit && (
          <p className="absolute bottom-4 right-6 hidden text-[0.6875rem] tracking-[0.14em] text-ice/45 lg:block">{image.credit}</p>
        )}
      </div>
    </section>
  );
}

/**
 * The four-up benefit strip under the hero: icon, h3, one line. Its h2 is for screen readers only
 * (the strip has no visible heading), so the outline doesn't jump from the hero's h1 to these h3s.
 */
export function BenefitStrip({ items }) {
  const list = useRef(null);
  const reveal = useScrollReveal(list, { stagger: 0.08 });
  return (
    <section aria-labelledby="benefits-title" className="border-t border-white/10 bg-deep text-white">
      <h2 id="benefits-title" className="sr-only">
        Key benefits
      </h2>
      <ul ref={list} data-sr-state={reveal} className="grid container-site gap-x-8 gap-y-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, text }) => (
          <li data-sr key={title} className="flex items-start gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-signal/60 text-signal">
              <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.7} />
            </span>
            <div>
              <h3 className="font-semibold text-white">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-ice/70">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** A section with the site's standard heading: eyebrow, animated h2, intro paragraph(s). */
export function Section({ id, tone = "paper", eyebrow, title, intro, children, className = "" }) {
  const dark = tone === "night";
  const intros = intro ? [].concat(intro) : [];
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`${TONES[tone]} py-16 md:py-24 ${className}`}>
      <div className="container-site">
        <div className="max-w-3xl">
          {eyebrow && (
            <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${dark ? "text-signal" : "text-sage"}`}>{eyebrow}</p>
          )}
          <AnimatedText
            id={`${id}-title`}
            className={`${eyebrow ? "mt-3" : ""} text-3xl font-semibold tracking-tight md:text-4xl ${dark ? "text-white" : "text-ink"}`}
          >
            {title}
          </AnimatedText>
          {intros.map((p) => (
            <p key={p} className={`mt-4 leading-relaxed ${dark ? "text-ice/75" : "text-graphite"}`}>
              {p}
            </p>
          ))}
        </div>
        {children}
      </div>
    </section>
  );
}

/** Icon-circle items (the product page's "Why this system" pattern): icon, h3 (or `level`), text. */
export function FeatureGrid({ items, columns = 3, dark = false, level = 3, className = "mt-12" }) {
  const Heading = `h${level}`;
  const list = useRef(null);
  const reveal = useScrollReveal(list, { stagger: 0.07 });
  const cols = columns === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3";
  return (
    <ul ref={list} data-sr-state={reveal} className={`grid gap-x-8 gap-y-10 ${cols} ${className}`}>
      {items.map(({ icon: Icon, title, text }) => (
        <li data-sr key={title} className="group/hl">
          {Icon && (
            <span
              className={`grid h-11 w-11 place-items-center rounded-full transition-[background-color,scale] duration-300 group-hover/hl:scale-105 ${
                dark ? "bg-white/10 text-signal" : "bg-ice text-forest group-hover/hl:bg-signal/25"
              }`}
            >
              <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.7} />
            </span>
          )}
          <Heading className={`${Icon ? "mt-4" : ""} font-semibold ${dark ? "text-white" : "text-ink"}`}>{title}</Heading>
          <p className={`mt-1.5 text-sm leading-relaxed ${dark ? "text-ice/70" : "text-graphite"}`}>{text}</p>
        </li>
      ))}
    </ul>
  );
}

/** Numbered steps as an ordered list of cards (01, 02, …). */
export function NumberedSteps({ items, columns = 4, className = "mt-12" }) {
  const list = useRef(null);
  const reveal = useScrollReveal(list, { stagger: 0.06 });
  const cols = columns === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4";
  return (
    <ol ref={list} data-sr-state={reveal} className={`grid gap-5 ${cols} ${className}`}>
      {items.map(({ title, text }, i) => (
        <li data-sr key={title} className="relative rounded-2xl border border-line bg-paper p-6">
          <span aria-hidden="true" className="absolute left-6 top-0 h-0.5 w-8 rounded-full bg-signal" />
          <span className="text-3xl font-semibold leading-none tracking-tight text-forest/20">{String(i + 1).padStart(2, "0")}</span>
          <h3 className="mt-4 font-semibold text-ink">{title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-graphite">{text}</p>
        </li>
      ))}
    </ol>
  );
}

/** Protection layers as a stepped stack: an ordered list, each layer indented one step further. */
export function LayerStack({ items, className = "mt-12" }) {
  const list = useRef(null);
  const reveal = useScrollReveal(list, { stagger: 0.07, y: 14 });
  return (
    <ol ref={list} data-sr-state={reveal} className={`max-w-4xl space-y-3 ${className}`}>
      {items.map(({ title, text }, i) => (
        <li
          data-sr
          key={title}
          style={{ "--step": i }}
          className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/[0.04] p-4 md:ml-[calc(var(--step)*1.5rem)] md:items-center md:p-5"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-signal text-sm font-semibold text-forest">{i + 1}</span>
          <div className="md:flex md:items-baseline md:gap-4">
            <h3 className="font-semibold text-white md:w-40 md:shrink-0">{title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-ice/75 md:mt-0">{text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** A flow of short steps joined by arrows (an ordered list). */
export function FlowSteps({ items, className = "mt-10" }) {
  return (
    <ol className={`flex flex-wrap items-center gap-x-2 gap-y-3 ${className}`}>
      {items.map((s, i) => (
        <li key={s} className="flex items-center gap-2">
          {i > 0 && <ArrowRight aria-hidden="true" className="h-4 w-4 text-sage" />}
          <span className="rounded-full border border-line bg-paper px-4 py-2 text-sm font-semibold text-forest">{s}</span>
        </li>
      ))}
    </ol>
  );
}

/** A real data table with a caption; scrolls sideways inside its own box on narrow screens. */
export function DataTable({ caption, head, rows, className = "mt-10" }) {
  return (
    <div className={`overflow-x-auto rounded-2xl border border-line bg-paper ${className}`}>
      <table className="w-full min-w-[30rem] border-collapse text-left text-sm">
        <caption className="border-b border-line px-5 py-4 text-left text-sm font-semibold text-ink sm:px-6">{caption}</caption>
        <thead>
          <tr className="bg-ice">
            {head.map((h) => (
              <th key={h} scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-sage sm:px-6">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map(([first, ...rest]) => (
            <tr key={first}>
              <th scope="row" className="px-5 py-3.5 font-semibold text-ink sm:px-6">
                {first}
              </th>
              {rest.map((c) => (
                <td key={c} className="px-5 py-3.5 text-graphite sm:px-6">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Check-mark list. */
export function Checklist({ items, dark = false, className = "mt-6" }) {
  return (
    <ul className={`grid gap-3 sm:grid-cols-2 ${className}`}>
      {items.map((t) => (
        <li key={t} className={`flex items-start gap-3 text-sm ${dark ? "text-ice/85" : "text-ink"}`}>
          <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-signal" strokeWidth={2.4} />
          {t}
        </li>
      ))}
    </ul>
  );
}

/** Figures as value + label pairs. */
export function Stats({ items, className = "mt-6" }) {
  return (
    <dl className={`grid grid-cols-2 gap-x-6 gap-y-4 ${className}`}>
      {items.map(([value, label]) => (
        // dt (label) first in the markup, shown under the figure.
        <div key={label} className="flex flex-col-reverse border-l-2 border-signal/60 pl-3">
          <dt className="text-xs leading-snug text-graphite">{label}</dt>
          <dd className="text-lg font-semibold tracking-tight text-forest">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * A technology partner's name: its logo where the site has one, otherwise the name in type (Midea:
 * the site has no Midea logo). `decorative` when a heading next to it already names the partner.
 */
export function PartnerMark({ partner, name, decorative = false }) {
  const p = partner && partnerOf(partner);
  // self-start: inside a flex column a logo would otherwise stretch to the full card width.
  if (p) return <img src={p.logo} alt={decorative ? "" : p.name} className={`${p.id === "clou" ? "h-8" : "h-6"} w-auto self-start`} />;
  return (
    <p aria-hidden={decorative || undefined} className="self-start text-2xl font-bold uppercase leading-6 tracking-tight text-ink">
      {name}
    </p>
  );
}

/**
 * A product in a Solutions portfolio: the catalogue card's plinth and image (or the partner's logo
 * when the catalogue has no photo), then h3 name, power/energy, tagline, copy, specs and a link.
 *
 * `photo` overrides the catalogue image ({ src, alt, bg }) for a card that shows a different
 * configuration than the catalogue entry; `to` overrides the link (default: the product page). A
 * photo on its own background (`bg`, or the product's `imageBg`) sits on that colour edge to edge.
 */
export function SolutionProductCard({ product, photo, to, name, sub, figures, tagline, copy, specs = [], note, alt, cta, level = 3 }) {
  const Heading = `h${level}`; // h4 when the card sits under a partner's h3
  const src = photo?.src ?? product.image;
  const bg = photo ? photo.bg : product.imageBg;
  const fallback = !photo && product.imageFallback;
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-paper transition-[border-color,box-shadow,translate] duration-300 ease-out hover:-translate-y-1 hover:border-forest/30 hover:shadow-[0_22px_44px_-28px_rgba(7,26,23,0.4)]">
      <div
        className="relative aspect-[4/3] overflow-hidden bg-[radial-gradient(80%_70%_at_50%_45%,#ffffff_0%,#F4F7F4_70%,#ECF1EC_100%)]"
        style={bg ? { background: bg } : undefined}
      >
        {!bg && <span aria-hidden="true" className="absolute inset-x-[22%] bottom-[9%] h-5 rounded-[100%] bg-black/15 blur-lg" />}
        <img
          src={src}
          alt={photo ? photo.alt : fallback ? product.imageAlt : (alt ?? product.imageAlt)}
          loading="lazy"
          decoding="async"
          className={`absolute inset-0 m-auto object-contain transition-[scale,translate] duration-500 ease-out group-hover:-translate-y-1 group-hover:scale-[1.03] ${
            fallback ? "h-[16%] w-[44%] opacity-80" : bg ? "h-full w-full" : "h-[80%] w-[80%]"
          }`}
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <Heading className="text-xl font-semibold tracking-tight text-ink">{name}</Heading>
        {sub && <p className="mt-0.5 text-xs text-graphite">{sub}</p>}
        {figures && <p className="mt-2 text-sm font-semibold text-forest">{figures}</p>}
        {tagline && <p className="mt-3 text-sm font-semibold text-ink">{tagline}</p>}
        {copy && <p className="mt-2 text-sm leading-relaxed text-graphite">{copy}</p>}
        {specs.length > 0 && (
          <ul className="mt-4 flex-1 space-y-1.5 text-sm text-ink">
            {specs.map((s) => (
              <li key={s} className="flex items-start gap-2">
                <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-signal" />
                {s}
              </li>
            ))}
          </ul>
        )}
        {note && <p className="mt-4 text-xs leading-relaxed text-graphite">{note}</p>}
        <Link
          to={to ?? `/products/${product.id}`}
          className="group/cta mt-6 inline-flex items-center gap-1.5 self-start text-sm font-semibold text-forest hover:text-steel"
        >
          {cta}
          <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}

/** A grid of cards that reveals as it scrolls in. */
export function CardGrid({ children, columns = 3, className = "mt-12" }) {
  const list = useRef(null);
  const reveal = useScrollReveal(list, { stagger: 0.08 });
  const cols = columns === 2 ? "md:grid-cols-2" : columns === 4 ? "sm:grid-cols-2 xl:grid-cols-4" : "md:grid-cols-2 lg:grid-cols-3";
  return (
    <ul ref={list} data-sr-state={reveal} className={`grid gap-6 ${cols} ${className}`}>
      {[].concat(children).map((c, i) => (
        <li data-sr key={c.key ?? i}>
          {c}
        </li>
      ))}
    </ul>
  );
}

/** FAQ: h2, then every question as an h3 with its answer, all visible (the text matches the FAQPage data). */
export function FaqList({ id, title, items, tone = "ice" }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`${tone === "paper" ? "bg-paper" : "bg-ice"} py-16 md:py-24`}>
      <div className="container-site">
        <AnimatedText id={`${id}-title`} className="max-w-3xl text-3xl font-semibold tracking-tight text-ink md:text-4xl">
          {title}
        </AnimatedText>
        <div className={`mt-10 max-w-3xl divide-y divide-line rounded-2xl border border-line ${tone === "paper" ? "bg-ice/60" : "bg-paper"}`}>
          {items.map(({ q, a }) => (
            <div key={q} className="px-5 py-5 sm:px-6">
              <h3 className="font-semibold text-ink">{q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-graphite">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Closing CTA band (dark): eyebrow, h2, optional subheading, body, checklist, button. */
export function CtaBand({ id, eyebrow, title, subheading, body, checklist, button }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="relative overflow-hidden bg-night py-16 text-white md:py-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(45% 60% at 80% 40%, rgba(144,217,136,0.08), transparent 70%)" }} />
      <div className="relative container-site grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
        <div>
          {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.2em] text-signal">{eyebrow}</p>}
          <AnimatedText id={`${id}-title`} className={`${eyebrow ? "mt-3" : ""} text-3xl font-semibold tracking-tight md:text-4xl`}>
            {title}
          </AnimatedText>
          {subheading && <p className="mt-4 text-lg font-medium text-white">{subheading}</p>}
          <p className="mt-4 max-w-xl leading-relaxed text-ice/80">{body}</p>
          <PillLink to={button.to} arrow spotlight className="mt-8">
            {button.label}
          </PillLink>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 md:p-8">
          <Checklist items={checklist} dark className="" />
        </div>
      </div>
    </section>
  );
}
