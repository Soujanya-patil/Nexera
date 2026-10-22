import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import { ArrowRight, ChevronDown } from "lucide-react";
import MagneticButton from "../components/ui/MagneticButton";
import NotFound from "./NotFound";
import { getArticle, isHiddenArticle } from "../data/articles";
import { scrollToId } from "../lib/scrollTo";
import ArticleHeader from "../components/article/ArticleHeader";
import ReadingProgress from "../components/article/ReadingProgress";
import ArticleFaq from "../components/article/ArticleFaq";
import ArticleRelated from "../components/article/ArticleRelated";
import ArticleClosingBand from "../components/article/ArticleClosingBand";
import { SceneInline, Stage, useArticleMotion } from "../components/article/Stage";
import { useReading } from "../components/article/useReading";
import { useArticleReveal } from "../components/article/useArticleReveal";
import { underCurtain, uncover } from "../components/article/curtain";

/**
 * /blog/:slug — one article (data/articles.js), told as a guided story:
 *
 *   header      the h1's words rise in, the intro and byline follow, over a drawing energy grid
 *               (components/article/ArticleHeader); a reading progress bar under the site header
 *   body        contents list · the text · a sticky scene stage (desktop, ≥ 1024px): each section has
 *               its own animated scene (data/articles.js `visual`, components/article/scenes), shown
 *               while that section is read and following its points (useReading). Phones and
 *               tablets: each scene sits under its heading instead.
 *   reveals     headings draw a line and rise word by word, text fades up, Key terms fill their border
 *               (useArticleReveal) — once the article's motion has loaded, and only below the screen
 *   FAQ         a smooth accordion (also the page's FAQPage data), Related cards, the closing band
 *
 * Every word is in the pre-rendered page and readable without JavaScript; the animation only starts
 * once the page has hydrated and the browser is idle (the plugins load on this route only). Reduced
 * motion: every scene in its final state, nothing moves. Opened from a Guides card on /resources, the
 * page arrives under a curtain (components/article/curtain) that lifts as the header plays.
 */
export default function Article() {
  const { slug } = useParams();
  const { search, hash } = useLocation();
  const article = getArticle(slug);
  if (!article) return <NotFound />;
  // Any other spelling of the slug (e.g. /blog/What-Is-BESS) goes to the canonical lowercase URL.
  if (slug !== article.slug) return <Navigate to={`/blog/${article.slug}${search}${hash}`} replace />;
  return <ArticlePage key={article.slug} a={article} />;
}

const TOC_FAQ = { id: "faq", h2: "Frequently asked questions" };
// Sections whose list items drive their scene step by step / react to hover / pulse their link.
const HOVER_SECTION = "main-parts";
const PULSE_SECTION = "types-by-scale";

function ArticlePage({ a }) {
  const page = useRef(null);
  const body = useRef(null);
  const motion = useArticleMotion();
  const reading = useReading(body, a.sections.map((s) => s.id));
  const toc = [...a.sections, TOC_FAQ];
  const active = useActiveSection(toc.map((s) => s.id));
  const [hover, setHover] = useState(null);
  useArticleReveal(page, motion);

  // Opened from a Guides card: the header waits under the curtain, then plays as it lifts.
  const [play, setPlay] = useState(() => (underCurtain() ? "wait" : "now"));
  const [viaCard] = useState(() => underCurtain()); // the h1's word reveal: only for this arrival
  useEffect(() => {
    if (play !== "wait") return;
    let raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(() => {
        setPlay("now");
        uncover();
      });
    });
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ctx = { reading, setHover };
  return (
    <div ref={page}>
      <ReadingProgress />
      <ArticleHeader a={a} play={play} reveal={viaCard} />

      <div className="bg-white">
        <div className="container-site grid gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,23rem)] lg:gap-12 lg:py-20 xl:grid-cols-[11.5rem_minmax(0,60ch)_minmax(20rem,26.25rem)]">
          {/* Contents: collapsible above the text below 1280px; a sticky list on the left from 1280px. */}
          <aside className="lg:col-span-2 xl:col-span-1">
            <details className="group/toc rounded-2xl border border-line bg-ice/60 xl:hidden">
              <summary className="flex min-h-12 cursor-pointer items-center justify-between gap-4 px-5 py-3 text-small font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-[-2px]">
                On this page
                <ChevronDown aria-hidden="true" className="h-4 w-4 text-accent transition-transform duration-fast group-open/toc:rotate-180" />
              </summary>
              <TocList items={toc} className="px-5 pb-4" />
            </details>
            <nav aria-label="On this page" className="sticky top-24 hidden xl:block">
              <p className="eyebrow text-muted">On this page</p>
              <TocList items={toc} active={active} indicator className="mt-4" />
            </nav>
          </aside>

          <article ref={body} className="min-w-0 text-body text-copy">
            {a.sections.map((s, i) => (
              <section key={s.id} data-section={s.id} aria-labelledby={s.id} className={i ? "mt-16" : ""}>
                <div data-rv="h2">
                  <svg aria-hidden="true" className="article-h2-line" viewBox="0 0 64 4" preserveAspectRatio="none">
                    <line x1="1" y1="2" x2="63" y2="2" />
                  </svg>
                  <h2 id={s.id} className="article-h2 scroll-mt-28 text-h3 font-semibold text-ink">
                    {s.h2}
                  </h2>
                </div>
                <SceneInline section={s} reading={reading} motion={motion} />
                {s.blocks.map((b, j) => (
                  <Block key={j} b={b} section={s.id} ctx={ctx} />
                ))}
              </section>
            ))}
          </article>

          {/* The scene stage (desktop): a column as tall as the text, the stage sticky inside it. */}
          <div className="hidden lg:block">
            <Stage sections={a.sections} reading={reading} hover={reading.section === HOVER_SECTION ? hover : null} motion={motion} />
          </div>
        </div>
      </div>

      <ArticleFaq id="faq" title={TOC_FAQ.h2} items={a.faqs} />
      <ArticleRelated items={a.related} />
      <ArticleClosingBand />
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

/** A contents link: glides to its heading (clearing the site header), which then flashes green. */
const goTo = (id) => (e) => {
  scrollToId(id, { offset: -88 })(e);
  if (!e.defaultPrevented) return;
  const h = document.getElementById(id);
  const heading = h?.matches("h2") ? h : h?.querySelector("h2");
  if (!heading) return;
  setTimeout(() => {
    heading.classList.add("article-flash");
    setTimeout(() => heading.classList.remove("article-flash"), 1400);
  }, 700);
};

/** The contents list. `indicator`: a green bar that slides to the current item (desktop). */
function TocList({ items, active, indicator = false, className = "" }) {
  const list = useRef(null);
  const [bar, setBar] = useState(null);
  useLayoutEffect(() => {
    if (!indicator) return;
    const el = list.current?.querySelector(`[data-toc="${active}"]`);
    if (el) setBar({ top: el.offsetTop, height: el.offsetHeight });
  }, [active, indicator]);
  return (
    <div className={`relative ${className}`}>
      {indicator && bar && (
        <span
          aria-hidden="true"
          className="absolute left-0 top-0 w-0.5 rounded-full bg-accent transition-[transform,height] duration-base ease-standard motion-reduce:transition-none"
          style={{ transform: `translateY(${bar.top}px)`, height: bar.height }}
        />
      )}
      <ol ref={list} className="space-y-0.5 text-small">
        {items.map((s) => {
          const on = active === s.id;
          return (
            <li key={s.id} data-toc={s.id}>
              <a
                href={`#${s.id}`}
                onClick={goTo(s.id)}
                aria-current={on ? "location" : undefined}
                className={`flex min-h-11 items-center border-l-2 border-line py-1.5 pl-3 leading-snug transition-colors duration-fast hover:text-ink focus-visible:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 xl:min-h-0 ${
                  on ? "font-semibold text-ink" : "text-copy"
                }`}
              >
                {s.h2}
              </a>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/**
 * A comparison table (data/articles.js `table`). Each row is a step of the section's scene, and the row
 * being read is tinted. Phones (< 640px): each row becomes a card — its label, then each column's value
 * under that column's name (index.css .article-table). The ARIA roles keep it a table for screen
 * readers when the layout changes it to blocks.
 */
function GlanceTable({ t, section, reading }) {
  const [, ...heads] = t.cols;
  const current = reading.section === section ? reading.step : -1;
  return (
    <div data-rv="text" className="mt-6">
      <table role="table" className="article-table w-full border-separate border-spacing-0 text-left text-body">
        <thead role="rowgroup">
          <tr role="row">
            {/* The row labels' column has no heading (as in the article's text). */}
            <td role="cell" className="w-[26%] pb-3 pr-4" />
            {heads.map((h) => (
              <th key={h} role="columnheader" scope="col" className="pb-3 pr-4 align-bottom text-small font-semibold text-ink">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody role="rowgroup">
          {t.rows.map(([label, ...cells], i) => (
            <tr key={label} role="row" data-step={i} data-of={section} data-on={current === i || undefined} className="article-table-row">
              <th role="rowheader" scope="row" className="py-3 pr-4 align-top text-small font-semibold text-ink">
                {label}
              </th>
              {cells.map((c, k) => (
                <td key={k} role="cell" data-label={heads[k]} className="py-3 pr-4 align-top">
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

/**
 * A Rich value: a string, or strings with { b } (bold) and { a, to } (link) pieces. A link to an
 * article that isn't published (a draft: data/articles.js) is its plain text.
 */
function Rich({ r }) {
  if (typeof r === "string") return r;
  return r.map((x, i) =>
    typeof x === "string" ? (
      <Fragment key={i}>{x}</Fragment>
    ) : x.a && isHiddenArticle(x.to) ? (
      <Fragment key={i}>{x.a}</Fragment>
    ) : x.b ? (
      <strong key={i} className="article-lead font-semibold text-ink">
        {x.b}
      </strong>
    ) : (
      <Link key={i} to={x.to} className="article-link font-semibold text-accent">
        {x.a}
      </Link>
    )
  );
}

function Item({ it, pulse }) {
  if (typeof it === "string" || Array.isArray(it)) return <Rich r={it} />;
  return (
    <>
      <strong className="article-lead font-semibold text-ink">{it.lead}</strong> <Rich r={it.text} />
      {it.link && (
        <>
          {" "}
          <Link to={it.link.to} className={`article-link group/il inline-flex items-center gap-1 whitespace-nowrap font-semibold text-accent ${pulse ? "article-pulse" : ""}`}>
            <span>{it.link.label}</span>
            <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform duration-fast group-hover/il:translate-x-1 group-focus-within/il:translate-x-1 group-focus-visible/il:translate-x-1" />
          </Link>
        </>
      )}
    </>
  );
}

function Block({ b, section, ctx, inCallout = false }) {
  const { reading, setHover } = ctx;
  if (b.p) {
    return (
      <p data-rv={inCallout ? undefined : "text"} className={inCallout ? "mt-2" : "mt-5"}>
        <Rich r={b.p} />
      </p>
    );
  }
  if (b.table) return <GlanceTable t={b.table} section={section} reading={reading} />;
  if (b.callout) {
    return (
      <div role="note" aria-label={b.callout.label} data-rv="term" className="article-term-card article-callout relative mt-6 rounded-2xl border border-line bg-ice/70 py-5 pl-6 pr-5">
        <p data-label className="eyebrow text-muted">
          {b.callout.label}
        </p>
        {b.callout.blocks.map((x, j) => (
          <Block key={j} b={x} section={section} ctx={ctx} inCallout />
        ))}
      </div>
    );
  }
  if (b.ul || b.ol) {
    const List = b.ol ? "ol" : "ul";
    const hoverable = section === HOVER_SECTION;
    return (
      <List className={`mt-5 space-y-3 pl-6 marker:text-accent ${b.ol ? "list-decimal marker:font-semibold" : "list-disc"}`}>
        {(b.ul ?? b.ol).map((it, i) => (
          <li
            key={i}
            // Inside a callout the callout itself fades in; its items don't again.
            data-rv={inCallout ? undefined : "text"}
            data-step={i}
            data-of={section}
            onPointerEnter={hoverable ? () => setHover(i) : undefined}
            onPointerLeave={hoverable ? () => setHover(null) : undefined}
            className="pl-1"
          >
            <Item it={it} pulse={section === PULSE_SECTION && reading.section === section && reading.step === i} />
          </li>
        ))}
      </List>
    );
  }
  if (b.terms) {
    return (
      <div className="mt-6 space-y-4">
        {b.terms.map((t, i) => (
          <div
            key={t.term}
            role="note"
            aria-label="Key term"
            data-rv="term"
            data-tilt
            data-step={i}
            data-of={section}
            className="article-term-card relative rounded-2xl border border-line bg-ice/70 py-4 pl-6 pr-5"
          >
            <p data-label className="eyebrow text-muted">
              Key term
            </p>
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
      <div data-rv="text" className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
        {b.actions.map((x) =>
          x.primary ? (
            <span key={x.to} data-shine className="article-cta-wrap inline-block">
              <MagneticButton to={x.to} arrow spotlight className="article-cta">
                {x.label}
              </MagneticButton>
            </span>
          ) : (
            <Link key={x.to} to={x.to} className="article-link group/act inline-flex items-center gap-1.5 text-body font-semibold text-accent">
              <span>{x.label}</span>
              <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform duration-fast group-hover/act:translate-x-1 group-focus-visible/act:translate-x-1 group-focus-within/act:translate-x-1" />
            </Link>
          )
        )}
      </div>
    );
  }
  return null;
}
