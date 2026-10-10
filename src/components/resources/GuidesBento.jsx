import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { formatDate } from "../../data/articles";
import BessLetters from "../article/scenes/BessLetters";
import { trackCard, untrackCard, useOpenGuide } from "./useOpenGuide";

/** While `ref` is on screen, a counter that ticks every `ms` (the featured scene's loop); 0 otherwise. */
function useLoop(ref, enabled, ms) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    let t;
    const io = new IntersectionObserver(([e]) => {
      clearInterval(t);
      if (!e.isIntersecting) return;
      setN((x) => x + 1);
      t = setInterval(() => setN((x) => x + 1), ms);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      clearInterval(t);
    };
  }, [ref, enabled, ms]);
  return n;
}

const META = (a) => (
  <span className="flex flex-wrap items-center gap-2 text-xs text-graphite">
    <time dateTime={a.datePublished}>{formatDate(a.datePublished)}</time>
    <span className="guide-pill rounded-full bg-signal/20 px-2.5 py-1 font-semibold text-forest">{a.readingTime} min read</span>
  </span>
);

/**
 * Guides as a bento: the newest article as a large featured card (about two thirds wide on desktop)
 * with the article's "BESS → Battery Energy Storage System" scene playing in a loop inside it (while on
 * screen, once the page's motion has loaded; static otherwise), and beside it a "Start here" panel
 * listing that article's sections as links straight into them. Any further guides follow as cards.
 *
 * Every card is a real link (its title, description, date and arrow inside); a plain click plays the
 * curtain transition into the article (useOpenGuide). Hover: a light follows the pointer, the card
 * lifts and tilts a little, the arrow slides (no tilt under reduced motion).
 */
export default function GuidesBento({ articles, motion }) {
  const open = useOpenGuide();
  const [featured, ...rest] = articles;
  const stage = useRef(null);
  const loop = useLoop(stage, !!motion, 7000);

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-3">
      <a
        href={`/resources/${featured.slug}`}
        data-slug={featured.slug}
        data-rv="text"
        onClick={open}
        onPointerMove={(e) => trackCard(e, 3)}
        onPointerLeave={untrackCard}
        aria-labelledby={`guide-${featured.slug}-title`}
        aria-describedby={`guide-${featured.slug}-desc`}
        className="guide-card guide-featured group/guide relative flex flex-col overflow-hidden rounded-3xl border border-line bg-paper transition-[border-color,box-shadow,translate] duration-300 ease-out hover:-translate-y-1 hover:border-forest/40 hover:shadow-[0_30px_60px_-34px_rgba(7,26,23,0.45)] focus-visible:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal motion-reduce:transition-none lg:col-span-2"
      >
        <div ref={stage} className="relative h-56 overflow-hidden bg-night text-white sm:h-64">
          <div aria-hidden="true" className="article-stage-grid pointer-events-none absolute inset-0" />
          <div className="relative mx-auto h-full w-fit">
            <BessLetters key={loop} active={loop > 0} motion={motion} mode="inline" />
          </div>
        </div>
        <span className="flex flex-1 flex-col p-6 sm:p-8">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-sage">{featured.eyebrow}</span>
          <h3 id={`guide-${featured.slug}-title`} className="mt-3 text-2xl font-semibold leading-snug tracking-tight text-ink transition-colors duration-300 group-hover/guide:text-forest">
            {featured.h1}
          </h3>
          <span id={`guide-${featured.slug}-desc`} className="mt-3 max-w-2xl leading-relaxed text-graphite">
            {featured.description}
          </span>
          <span className="mt-6 flex items-center justify-between gap-3">
            {META(featured)}
            <ArrowRight aria-hidden="true" className="h-5 w-5 text-forest transition-transform duration-300 group-hover/guide:translate-x-1.5 group-focus-visible/guide:translate-x-1.5" />
          </span>
        </span>
      </a>

      {/* Start here: the featured guide's sections, each a link straight into it. */}
      <aside data-rv="text" aria-labelledby="start-here-title" className="flex flex-col rounded-3xl border border-line bg-ice/70 p-6 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sage">Start here</p>
        <h3 id="start-here-title" className="mt-2 text-lg font-semibold text-ink">
          {featured.shortTitle}
        </h3>
        <ol className="mt-4 flex-1 space-y-1">
          {featured.sections.map((s) => (
            <li key={s.id}>
              <a
                href={`/resources/${featured.slug}#${s.id}`}
                className="group/start flex min-h-11 items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm font-medium text-ink transition-colors duration-200 hover:bg-paper hover:text-forest focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-signal"
              >
                {s.h2}
                <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 text-forest opacity-40 transition-[opacity,translate] duration-200 group-hover/start:translate-x-1 group-hover/start:opacity-100" />
              </a>
            </li>
          ))}
        </ol>
      </aside>

      {rest.map((a) => (
        <a
          key={a.slug}
          href={`/resources/${a.slug}`}
          data-slug={a.slug}
          data-rv="text"
          onClick={open}
          onPointerMove={(e) => trackCard(e, 3)}
          onPointerLeave={untrackCard}
          aria-labelledby={`guide-${a.slug}-title`}
          aria-describedby={`guide-${a.slug}-desc`}
          className="guide-card group/guide relative flex flex-col overflow-hidden rounded-3xl border border-line bg-paper p-6 transition-[border-color,box-shadow,translate] duration-300 ease-out hover:-translate-y-1 hover:border-forest/40 hover:shadow-[0_22px_44px_-28px_rgba(7,26,23,0.4)] focus-visible:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal motion-reduce:transition-none"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-sage">{a.eyebrow}</span>
          <h3 id={`guide-${a.slug}-title`} className="mt-3 text-lg font-semibold leading-snug text-ink transition-colors duration-300 group-hover/guide:text-forest">
            {a.h1}
          </h3>
          <span id={`guide-${a.slug}-desc`} className="mt-2 flex-1 text-sm leading-relaxed text-graphite">
            {a.description}
          </span>
          <span className="mt-5 flex items-center justify-between gap-3">
            {META(a)}
            <ArrowRight aria-hidden="true" className="h-4 w-4 text-forest transition-transform duration-300 group-hover/guide:translate-x-1" />
          </span>
        </a>
      ))}
    </div>
  );
}
