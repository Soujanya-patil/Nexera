import { Fragment, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, ChevronDown, ChevronRight } from "lucide-react";
import { FaqList } from "../components/solutions/SolutionBlocks";
import { Spotlight } from "../components/solutions/Interactive";
import MagneticButton from "../components/ui/MagneticButton";
import HomeCta from "../components/HomeCta";
import NotFound from "./NotFound";
import { formatDate, getArticle } from "../data/articles";
import { useIntro } from "../lib/intro";
import { useScrollReveal } from "../lib/scrollReveal";
import { scrollToId } from "../lib/scrollTo";

/**
 * /resources/:slug — one article (data/articles.js): the header (breadcrumb, eyebrow, h1, intro,
 * byline), the body with an "On this page" contents list (sticky beside the text on desktop, a
 * collapsible list above it on phones), "Key term" callouts, the FAQ (the Solutions pages' accordion;
 * also the page's FAQPage data), related links and the homepage's closing band.
 *
 * Typography and colours are the site's own; the body runs at 18px in a ~68ch measure. Sections rise
 * in once like the rest of the site (lib/scrollReveal); everything is in the pre-rendered page and
 * works without JavaScript (anchors, native <details>).
 */
export default function Article() {
  const { slug } = useParams();
  const article = getArticle(slug);
  if (!article) return <NotFound />;
  return <ArticlePage key={article.slug} a={article} />;
}

const TOC_FAQ = { id: "faq", h2: "Frequently asked questions" };

function ArticlePage({ a }) {
  const body = useRef(null);
  const reveal = useScrollReveal(body, { stagger: 0.06 });
  const toc = [...a.sections, TOC_FAQ];
  const active = useActiveSection(toc.map((s) => s.id));

  return (
    <div>
      <ArticleHeader a={a} />

      <div className="bg-paper">
        <div className="container-site grid gap-10 py-12 lg:grid-cols-[15rem_minmax(0,68ch)] lg:gap-16 lg:py-20">
          {/* Contents: collapsible above the text on phones and tablets, sticky beside it on desktop. */}
          <aside className="lg:order-none">
            <details className="group/toc rounded-2xl border border-line bg-ice/60 lg:hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 text-sm font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-signal">
                On this page
                <ChevronDown aria-hidden="true" className="h-4 w-4 text-forest transition-transform duration-300 group-open/toc:rotate-180" />
              </summary>
              <TocList items={toc} className="px-5 pb-5" />
            </details>
            <nav aria-label="On this page" className="sticky top-24 hidden lg:block">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sage">On this page</p>
              <TocList items={toc} active={active} className="mt-4" />
            </nav>
          </aside>

          <article ref={body} data-sr-state={reveal} className="min-w-0 text-[18px] leading-[1.75] text-graphite">
            {a.sections.map((s, i) => (
              <section key={s.id} data-sr aria-labelledby={s.id} className={i ? "mt-14" : ""}>
                <h2 id={s.id} className="scroll-mt-24 text-2xl font-semibold leading-tight tracking-tight text-ink md:text-[1.75rem]">
                  {s.h2}
                </h2>
                {s.blocks.map((b, j) => (
                  <Block key={j} b={b} />
                ))}
              </section>
            ))}
          </article>
        </div>
      </div>

      <FaqList id="faq" title={TOC_FAQ.h2} items={a.faqs} />

      <section aria-labelledby="related-title" className="bg-paper py-14 lg:py-20">
        <div className="container-site">
          <h2 id="related-title" className="sol-h2 font-semibold text-ink">
            Related
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {a.related.map((r) => (
              <li key={r.to}>
                <Link
                  to={r.to}
                  className="group/rel flex h-full items-center justify-between gap-3 rounded-2xl border border-line bg-paper px-5 py-5 font-semibold text-ink transition-[border-color,box-shadow,translate] duration-300 ease-out hover:-translate-y-1 hover:border-forest/30 hover:shadow-[0_22px_44px_-28px_rgba(7,26,23,0.4)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal motion-reduce:transition-none"
                >
                  {r.label}
                  <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 text-forest transition-transform duration-300 group-hover/rel:translate-x-1" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <HomeCta contactTo="/#contact" />
    </div>
  );
}

/**
 * The section being read (for the desktop contents list): the last heading that has passed a line at
 * 35% of the screen height. One IntersectionObserver whose root is the band above that line: a heading
 * has passed it while it is inside the band or above it; crossing either edge updates it.
 */
function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0]);
  const key = ids.join(",");
  useEffect(() => {
    const order = key.split(",");
    const passed = new Map();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) passed.set(e.target.id, e.isIntersecting || e.boundingClientRect.top < (e.rootBounds?.top ?? 0));
        setActive(order.filter((id) => passed.get(id)).at(-1) ?? order[0]);
      },
      { rootMargin: "0px 0px -65% 0px" }
    );
    order.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [key]);
  return active;
}

function TocList({ items, active, className = "" }) {
  return (
    <ol className={`space-y-1 text-sm ${className}`}>
      {items.map((s) => {
        const on = active === s.id;
        return (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              onClick={scrollToId(s.id, { offset: -88 })}
              aria-current={on ? "location" : undefined}
              className={`block border-l-2 py-1.5 pl-3 leading-snug transition-colors duration-200 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal ${
                on ? "border-signal font-semibold text-ink" : "border-line text-graphite"
              }`}
            >
              {s.h2}
            </a>
          </li>
        );
      })}
    </ol>
  );
}

/** A Rich value: a string, or strings with { b } (bold) and { a, to } (link) pieces. */
function Rich({ r }) {
  if (typeof r === "string") return r;
  return r.map((x, i) =>
    typeof x === "string" ? (
      <Fragment key={i}>{x}</Fragment>
    ) : x.b ? (
      <strong key={i} className="font-semibold text-ink">
        {x.b}
      </strong>
    ) : (
      <Link key={i} to={x.to} className="font-semibold text-forest underline underline-offset-4 hover:text-steel">
        {x.a}
      </Link>
    )
  );
}

function Item({ it }) {
  if (typeof it === "string" || Array.isArray(it)) return <Rich r={it} />;
  return (
    <>
      <strong className="font-semibold text-ink">{it.lead}</strong> {it.text}
      {it.link && (
        <>
          {" "}
          <Link to={it.link.to} className="group/il inline-flex items-center gap-1 whitespace-nowrap font-semibold text-forest underline-offset-4 hover:underline">
            {it.link.label}
            <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform duration-300 group-hover/il:translate-x-0.5" />
          </Link>
        </>
      )}
    </>
  );
}

function Block({ b }) {
  if (b.p) {
    return (
      <p className="mt-5">
        <Rich r={b.p} />
      </p>
    );
  }
  if (b.ul || b.ol) {
    const List = b.ol ? "ol" : "ul";
    return (
      <List className={`mt-5 space-y-3 pl-6 marker:text-forest ${b.ol ? "list-decimal marker:font-semibold" : "list-disc"}`}>
        {(b.ul ?? b.ol).map((it, i) => (
          <li key={i} className="pl-1">
            <Item it={it} />
          </li>
        ))}
      </List>
    );
  }
  if (b.terms) {
    return (
      <div className="mt-6 space-y-4">
        {b.terms.map((t) => (
          <div key={t.term} role="note" aria-label="Key term" className="rounded-2xl border border-line border-l-4 border-l-signal bg-ice/70 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sage">Key term</p>
            <p className="mt-1.5">
              <strong className="font-semibold text-ink">{t.term}:</strong> {t.text}
            </p>
          </div>
        ))}
      </div>
    );
  }
  if (b.actions) {
    return (
      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
        {b.actions.map((x) =>
          x.primary ? (
            <MagneticButton key={x.to} to={x.to} arrow spotlight className="hover:scale-[1.02]">
              {x.label}
            </MagneticButton>
          ) : (
            <Link key={x.to} to={x.to} className="group/act inline-flex items-center gap-1.5 text-base font-semibold text-forest hover:text-steel">
              {x.label}
              <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform duration-300 group-hover/act:translate-x-1" />
            </Link>
          )
        )}
      </div>
    );
  }
  return null;
}

/** Dark header in the other heroes' type: breadcrumb, eyebrow, h1, intro, byline. */
function ArticleHeader({ a }) {
  const root = useRef(null);
  const intro = useIntro(root, ({ tl, q }) => {
    const done = { clearProps: "all" };
    tl.fromTo(q('[data-a="eyebrow"]'), { opacity: 0, letterSpacing: "0.4em" }, { opacity: 1, letterSpacing: "0.22em", duration: 0.6, ease: "power2.out", ...done }, 0)
      .fromTo(q('[data-a="line"]'), { opacity: 1, yPercent: 100 }, { yPercent: 0, duration: 0.65, ease: "expo.out", ...done }, 0.1)
      .fromTo(q('[data-a="desc"]'), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: "power2.out", ...done }, 0.3);
  });
  return (
    <section ref={root} className="relative overflow-hidden bg-night text-white">
      <Spotlight />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(50% 70% at 85% 30%, rgba(144,217,136,0.10), transparent 70%)" }} />
      <div data-intro={intro} className="relative container-site py-14 lg:py-20">
        <nav aria-label="Breadcrumb" className="text-xs text-ice/75">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link to="/" className="hover:text-white">
                Home
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="h-3.5 w-3.5" />
            </li>
            <li>
              <Link to="/resources" className="hover:text-white">
                Resources
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="h-3.5 w-3.5" />
            </li>
            <li aria-current="page" className="text-ice/90">
              {a.shortTitle}
            </li>
          </ol>
        </nav>
        <div className="mt-10 max-w-3xl">
          <p data-a="eyebrow" className="text-xs font-semibold uppercase tracking-[0.22em] text-signal">
            {a.eyebrow}
          </p>
          <h1 className="mt-5 text-[clamp(2.2rem,4.6vw,3.5rem)] font-semibold leading-[1.08] tracking-tight">
            <span className="line-mask">
              <span data-a="line" className="block">
                {a.h1}
              </span>
            </span>
          </h1>
          <p data-a="desc" className="mt-6 max-w-2xl text-lg leading-relaxed text-ice/90">
            {a.intro}
          </p>
          <p data-a="desc" className="mt-6 text-sm text-ice/75">
            By NEXERA Powertech · <time dateTime={a.datePublished}>{formatDate(a.datePublished)}</time> · {a.readingTime} min read
          </p>
        </div>
      </div>
    </section>
  );
}
