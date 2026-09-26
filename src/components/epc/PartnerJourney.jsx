import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import AnimatedText from "../ui/AnimatedText";
import { JOURNEY } from "./content";
import { journeyImage } from "./journeyImages";
import { getLenis } from "../../lib/lenis";
import { loadGsap } from "../../lib/motion";
import { useMediaQuery, useScrollSteps } from "../../lib/scrollSteps";

// Pinned horizontal gallery from tablet width up, motion allowed.
const PIN = "(min-width: 768px) and (prefers-reduced-motion: no-preference)";
const LAST = JOURNEY.length - 1;
// Pacing: 1 px of gallery travel takes SLOW px of scrolling (about 60% of a viewport per stage on a
// desktop), and the first and last HOLD of the pinned range hold still, so the opening three and
// the closing three each rest in view before the gallery moves / the section releases.
const SLOW = 2.4;
const HOLD = 0.06;
const clamp01 = (v) => Math.max(0, Math.min(1, v));
/** Gallery position (0…1) for a raw ScrollTrigger progress. */
const move = (progress) => clamp01((progress - HOLD) / (1 - 2 * HOLD));
/** The ONE stage state: the stage whose share of the gallery travel the scroll has reached. */
const toStage = (progress) => Math.round(move(progress) * LAST);
const MOVE_CSS = `clamp(0, (var(--progress, 0) - ${HOLD}) / ${1 - 2 * HOLD}, 1)`;
const pad = (n) => String(n).padStart(2, "0");

/** Drawing-board ground behind the engineering drawing (light, faint grid). */
const Board = () => (
  <span
    aria-hidden="true"
    className="absolute inset-0"
    style={{
      backgroundColor: "#EEF2EE",
      backgroundImage: "linear-gradient(rgba(9,47,39,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(9,47,39,0.06) 1px, transparent 1px)",
      backgroundSize: "32px 32px",
    }}
  />
);

/**
 * PARTNERSHIP JOURNEY — how an EPC project moves with NEXERA: the six existing stages (Select, Design,
 * Deploy, Commission, Support, Scale) and their real photographs, as one continuous journey.
 *
 * Tablet / desktop (motion allowed): a horizontal gallery. The section pins; scrolling DOWN moves the
 * image track RIGHT → LEFT (GSAP ScrollTrigger progress via useScrollSteps, applied as a translate —
 * continuous, never a swap): it opens on Select · Design · Deploy, then Commission, Support and Scale
 * physically enter from the right while the earlier stages leave on the left. About three images are
 * in view on desktop, two on tablets; the track lives in an `overflow: clip` stage, so nothing can be
 * scrolled sideways and the page never gains a horizontal scrollbar. The section is as tall as the
 * travel needs at a calm pace (SLOW, with a short HOLD at each end) and releases after Scale.
 *   The scroll position is the ONE source of truth for the active stage (toStage). Previous / Next,
 * the stage tabs, clicking an image and the arrow keys only glide the PAGE to that stage's position;
 * the gallery and the active stage then follow the scroll like any other scroll.
 *   The active image is slightly more prominent (scale, opacity, brightness). Pointing at an image
 * reveals that stage's number, title and short description over a soft dark gradient, with a green
 * accent; on touch screens the active image shows it. The active stage's full description sits
 * under the gallery, so nothing depends on hover.
 * Phones and reduced motion: the six stages as a plain vertical sequence — number and title, the whole
 * image, the description — with natural scrolling.
 */
export default function PartnerJourney() {
  const pinned = useMediaQuery(PIN);
  const reduce = useMediaQuery("(prefers-reduced-motion: reduce)");

  const root = useRef(null);
  const list = useRef(null);
  const track = useRef(null);
  const active = useScrollSteps(root, JOURNEY.length, { start: "top 64px", end: "bottom bottom", enabled: pinned, toStep: toStage });
  const listStep = useScrollSteps(list, JOURNEY.length, { start: "top 60%", end: "bottom 60%", enabled: !pinned && !reduce });

  // Gallery travel = how far the six images overflow the three-image viewport. The section is the
  // pinned viewport plus travel × SLOW tall, so it releases exactly when Scale is in place.
  const [travel, setTravel] = useState(0);
  useLayoutEffect(() => {
    if (!pinned) return;
    const measure = () => {
      const t = track.current;
      const last = t.children[t.children.length - 1];
      setTravel(Math.max(0, last.offsetLeft + last.offsetWidth - t.clientWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track.current);
    return () => ro.disconnect();
  }, [pinned]);
  useLayoutEffect(() => {
    if (pinned) loadGsap().then(({ ScrollTrigger }) => ScrollTrigger.refresh());
  }, [pinned, travel]);

  // Direction of the last stage change, for the description's slide.
  const prev = useRef(active);
  const dir = useRef("next");
  if (active !== prev.current) {
    dir.current = active > prev.current ? "next" : "prev";
    prev.current = active;
  }

  // Navigation intent while a glide is under way, so repeated Next / arrow presses keep advancing
  // from where the page is heading. Cleared once the scroll arrives; the stage always comes from scroll.
  const heading = useRef(null);
  useEffect(() => {
    if (heading.current === active) heading.current = null;
  }, [active]);
  const base = () => heading.current ?? active;

  /** Glide the page to the scroll position where stage `i` is the active one. */
  const goTo = (i) => {
    const el = root.current;
    if (!el) return;
    const next = Math.max(0, Math.min(LAST, i));
    heading.current = next;
    const range = el.offsetHeight - (window.innerHeight - 64);
    const progress = HOLD + (next / LAST) * (1 - 2 * HOLD);
    const y = el.getBoundingClientRect().top + window.scrollY - 64 + progress * range;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(y, { duration: Math.min(1.8, 0.8 + 0.25 * Math.abs(next - active)) });
    else window.scrollTo({ top: y, behavior: "smooth" });
  };

  const tabs = useRef([]);
  const onKeyDown = (e) => {
    const delta = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    let next = delta !== undefined ? Math.max(0, Math.min(LAST, base() + delta)) : null;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = LAST;
    if (next === null) return;
    e.preventDefault();
    goTo(next);
    tabs.current[next]?.focus();
  };

  const current = JOURNEY[active];
  const Icon = current.icon;

  const title = (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-signal">Partnership journey</p>
      <AnimatedText id="journey-title" className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
        How Your Project Moves With NEXERA
      </AnimatedText>
    </>
  );

  if (!pinned) {
    // ---------------- Vertical sequence (phones, reduced motion) ----------------
    return (
      <section aria-labelledby="journey-title" className="relative bg-deep text-white">
        <div className="relative mx-auto max-w-3xl px-6 py-20 md:py-24">
          {title}
          <ol ref={list} className="mt-10 space-y-14">
            {JOURNEY.map((s, i) => {
              const StepIcon = s.icon;
              const on = !reduce && i === listStep;
              const img = journeyImage(s.photo);
              return (
                <li key={s.n}>
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-full border transition-[background-color,border-color,color] duration-500 ${
                        on ? "border-signal bg-signal text-forest" : "border-signal/50 text-signal"
                      }`}
                    >
                      <StepIcon aria-hidden="true" className="h-4 w-4" strokeWidth={1.75} />
                    </span>
                    <span className="text-xs font-semibold tracking-[0.18em] text-signal">{s.n}</span>
                    <h3 className="text-lg font-semibold uppercase tracking-[0.08em]">{s.title}</h3>
                  </div>
                  <figure className="mt-4">
                    {/* The whole image at its own proportions — never cropped */}
                    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-night">
                      {s.contain && <Board />}
                      <img
                        src={img.src}
                        srcSet={img.srcSet}
                        sizes="(min-width: 768px) 720px, 100vw"
                        width={img.width}
                        height={img.height}
                        alt={s.alt}
                        loading="lazy"
                        decoding="async"
                        className={`relative block h-auto w-full ${s.contain ? "p-[5%]" : ""}`}
                      />
                    </div>
                    <figcaption className="mt-2 text-[0.6875rem] tracking-[0.06em] text-ice/45">
                      {s.caption} · technology partner imagery
                    </figcaption>
                  </figure>
                  <p className="mt-3 text-sm leading-relaxed text-ice/80">{s.detail}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>
    );
  }

  // ---------------- Pinned horizontal gallery (tablet / desktop) ----------------
  return (
    <section
      ref={root}
      aria-labelledby="journey-title"
      className="relative bg-deep text-white"
      style={{ height: `calc(100svh - 4rem + ${Math.round(travel * SLOW)}px)` }}
    >
      <div className="sticky top-16 flex h-[calc(100svh-4rem)] flex-col justify-center overflow-clip py-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(50% 60% at 80% 30%, rgba(144,217,136,0.06), transparent 70%)" }}
        />

        <div className="relative mx-auto w-full max-w-6xl px-6">
          {/* Heading + Previous / Next */}
          <div className="flex items-end justify-between gap-8">
            <div>{title}</div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="mr-2 text-xs font-semibold tracking-[0.18em] text-ice/50" aria-live="polite">
                <span className="text-signal">{current.n}</span> / {pad(JOURNEY.length)}
              </span>
              <button
                type="button"
                onClick={() => goTo(base() - 1)}
                disabled={active === 0}
                aria-label="Previous stage"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white transition-[border-color,background-color,opacity] duration-300 hover:border-signal hover:bg-signal/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-white/20 disabled:hover:bg-transparent"
              >
                <ArrowLeft aria-hidden="true" className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => goTo(base() + 1)}
                disabled={active === LAST}
                aria-label="Next stage"
                className="group/next flex h-11 items-center gap-2 rounded-full border border-white/20 px-5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-[border-color,background-color,opacity] duration-300 hover:border-signal hover:bg-signal/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-white/20 disabled:hover:bg-transparent"
              >
                Next
                <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform duration-300 group-hover/next:translate-x-0.5" />
              </button>
            </div>
          </div>

          {/* Stage navigation: numbers + titles over a progress line that follows the gallery */}
          <div role="tablist" aria-label="Project stages" onKeyDown={onKeyDown} className="relative mt-7 grid grid-cols-6 gap-3">
            <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-white/12" />
            <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px origin-left bg-signal" style={{ scale: `${MOVE_CSS} 1` }} />
            {JOURNEY.map((s, i) => {
              const on = i === active;
              return (
                <button
                  key={s.n}
                  ref={(el) => (tabs.current[i] = el)}
                  type="button"
                  role="tab"
                  id={`journey-tab-${i}`}
                  aria-selected={on}
                  aria-controls="journey-panel"
                  tabIndex={on ? 0 : -1}
                  onClick={() => goTo(i)}
                  className="group relative pt-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
                >
                  <span
                    aria-hidden="true"
                    className={`absolute -top-[3px] left-0 h-[7px] w-[7px] rounded-full transition-[background-color,scale] duration-500 ${
                      on ? "scale-150 bg-signal" : i < active ? "bg-signal/70" : "bg-white/30"
                    }`}
                  />
                  <span className={`text-xs font-semibold tracking-[0.16em] transition-colors duration-500 ${on ? "text-signal" : "text-ice/45"}`}>{s.n}</span>
                  <span
                    className={`ml-2 text-sm font-semibold uppercase tracking-[0.08em] transition-colors duration-500 ${
                      on ? "text-white" : "text-ice/45 group-hover:text-ice/80"
                    }`}
                  >
                    {s.title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Gallery: the six images on one track, moved by scroll only */}
          <ul
            ref={track}
            aria-label="Project stage images"
            className="relative mt-7 flex gap-6 will-change-transform"
            style={{ transform: `translate3d(calc(${MOVE_CSS} * -${travel}px), 0, 0)` }}
          >
            {JOURNEY.map((s, i) => {
              const on = i === active;
              const img = journeyImage(s.photo);
              return (
                <li
                  key={s.n}
                  onClick={() => goTo(i)}
                  className={`group/card relative aspect-square max-h-[calc(100svh-23rem)] w-[calc((100%-1.5rem)/2)] shrink-0 cursor-pointer overflow-hidden rounded-2xl border bg-night transition-[opacity,scale,filter,border-color] duration-500 ease-out lg:w-[calc((100%-3rem)/3)] ${
                    on ? "scale-100 border-white/15 opacity-100 brightness-100" : "scale-[0.97] border-white/5 opacity-75 brightness-[0.82] hover:opacity-100 hover:brightness-100"
                  }`}
                >
                  {s.contain && <Board />}
                  <img
                    src={img.src}
                    srcSet={img.srcSet}
                    sizes="(min-width: 1024px) 34vw, 50vw"
                    width={img.width}
                    height={img.height}
                    alt={s.alt}
                    loading={i < 3 ? "eager" : "lazy"}
                    decoding="async"
                    style={{ objectPosition: s.focus }}
                    className={`absolute inset-0 h-full w-full transition-[scale] duration-700 ease-out group-hover/card:scale-[1.03] ${
                      s.contain ? "object-contain p-[7%]" : "object-cover"
                    }`}
                  />
                  {/* Hover overlay: soft dark gradient, green accent, number, title, short description */}
                  <div
                    aria-hidden="true"
                    className={`pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-night/95 via-night/45 to-transparent p-6 opacity-0 transition-opacity duration-500 group-hover/card:opacity-100 ${
                      on ? "[@media(hover:none)]:opacity-100" : ""
                    }`}
                  >
                    <span className="absolute left-6 top-0 h-0.5 w-0 rounded-full bg-signal transition-[width] duration-500 ease-out group-hover/card:w-12" />
                    <div className="translate-y-3 transition-transform duration-500 ease-out group-hover/card:translate-y-0">
                      <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-signal">
                        {s.n}
                        <ArrowRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-[translate,opacity] duration-500 group-hover/card:translate-x-0 group-hover/card:opacity-100" />
                      </p>
                      <p className="mt-1 text-xl font-semibold uppercase tracking-[0.06em]">{s.title}</p>
                      <p className="mt-2 text-sm leading-relaxed text-ice/85">{s.copy}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Active stage description — always present, so nothing depends on hover. Height reserved for a
              two-line description, so a shorter one never re-centres the pinned block. */}
          <div id="journey-panel" role="tabpanel" aria-labelledby={`journey-tab-${active}`} className="mt-6 min-h-[5.25rem]">
            <div
              key={`panel-${active}`}
              className={`${dir.current === "next" ? "journey-in-next" : "journey-in-prev"} grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-4`}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-signal text-forest">
                <Icon aria-hidden="true" className="h-4.5 w-4.5" strokeWidth={1.9} />
              </span>
              <div>
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                  <h3 className="text-lg font-semibold uppercase tracking-[0.06em]">
                    <span className="mr-3 text-xs font-semibold tracking-[0.2em] text-signal">{current.n}</span>
                    {current.title}
                  </h3>
                  <p className="text-[0.6875rem] tracking-[0.06em] text-ice/45">{current.caption} · technology partner imagery</p>
                </div>
                <p className="mt-1 max-w-3xl text-sm leading-relaxed text-ice/80">{current.detail}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
