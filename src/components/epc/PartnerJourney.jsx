import { useEffect, useRef, useState } from "react";
import AnimatedText from "../ui/AnimatedText";
import SceneImg from "../SceneImg";
import { JOURNEY } from "./content";
import { getProduct } from "../../data/products";
import { useMediaQuery, useScrollSteps } from "../../lib/scrollSteps";

const STAGE = "(min-width: 1024px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)";

function StepVisual({ step, active }) {
  const product = step.cutout ? getProduct(step.cutout) : null;
  return (
    <div
      aria-hidden={!active}
      className={`absolute inset-0 transition-[opacity,scale] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        active ? "scale-100 opacity-100" : "scale-[1.03] opacity-0"
      }`}
    >
      {product ? (
        <div className="absolute inset-0 bg-[radial-gradient(70%_80%_at_50%_45%,#ffffff_0%,#F4F7F4_70%,#E4EBE4_100%)]">
          <img
            src={product.hotspots?.image ?? product.image}
            alt={step.alt}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 m-auto h-[88%] w-[88%] object-contain"
          />
        </div>
      ) : (
        <SceneImg name={step.scene} alt={step.alt} sizes="(min-width: 1024px) 40vw, 100vw" className="absolute inset-0 h-full w-full object-cover" />
      )}
    </div>
  );
}

/**
 * PARTNERSHIP JOURNEY — Select → Design → Deploy → Commission → Support → Scale.
 *
 * Desktop: a horizontal row of six stages over a connecting line, and a panel below with the active
 * stage's image and detail. On tall-enough screens the section sticks while you scroll through it and
 * the scroll position advances the active stage (GSAP ScrollTrigger via useScrollSteps); pointing at,
 * focusing or clicking a stage previews it at once (arrow keys move between stages). The active stage
 * turns green, the line fills up to it, inactive stages are subdued.
 * Phones/tablets: a vertical timeline whose stages light up as they cross the middle of the screen.
 * Reduced motion: no sticking or scroll-driven steps; the stages are chosen by hand and every stage
 * of the vertical timeline is readable.
 */
export default function PartnerJourney() {
  const desktop = useMediaQuery("(min-width: 1024px)");
  const staged = useMediaQuery(STAGE);
  const reduce = useMediaQuery("(prefers-reduced-motion: reduce)");

  const root = useRef(null);
  const list = useRef(null);
  const scrollStep = useScrollSteps(root, JOURNEY.length, {
    start: staged ? "top 64px" : "top 60%",
    end: staged ? "bottom bottom" : "bottom 60%",
    enabled: desktop && !reduce,
  });
  const mobileStep = useScrollSteps(list, JOURNEY.length, { start: "top 60%", end: "bottom 60%", enabled: !desktop && !reduce });

  // A hovered / focused / clicked stage wins until the scroll moves on to another stage.
  const [picked, setPicked] = useState(null);
  useEffect(() => setPicked(null), [scrollStep]);
  const active = picked ?? scrollStep;

  const tabs = useRef([]);
  const onKeyDown = (e) => {
    const delta = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    let next = delta !== undefined ? (active + delta + JOURNEY.length) % JOURNEY.length : null;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = JOURNEY.length - 1;
    if (next === null) return;
    e.preventDefault();
    setPicked(next);
    tabs.current[next]?.focus();
  };

  const current = JOURNEY[active];
  const Icon = current.icon;

  return (
    <section ref={root} aria-labelledby="journey-title" className="relative bg-deep text-white stage:h-[250vh]">
      <div className="relative flex flex-col justify-center py-20 md:py-24 stage:sticky stage:top-16 stage:h-[calc(100svh-4rem)] stage:py-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(50% 60% at 85% 20%, rgba(144,217,136,0.07), transparent 70%)" }}
        />
        <div className="relative mx-auto w-full max-w-6xl px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-signal">Partnership journey</p>
              <AnimatedText id="journey-title" className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                How NEXERA Supports Your Project
              </AnimatedText>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-ice/70">
              From choosing the system to growing your storage business — one partner at each stage.
            </p>
          </div>

          {/* Desktop: horizontal stages + detail panel */}
          <div className="hidden lg:block">
            <div
              role="tablist"
              aria-label="Partnership stages"
              onKeyDown={onKeyDown}
              onPointerLeave={(e) => e.pointerType === "mouse" && setPicked(null)}
              className="relative mt-10 grid grid-cols-6 gap-4 stage:mt-8"
            >
              <span aria-hidden="true" className="absolute left-5 right-5 top-5 h-px bg-white/12" />
              <span
                aria-hidden="true"
                className="absolute left-5 right-5 top-5 h-px origin-left bg-signal transition-[scale] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{ scale: `${active / (JOURNEY.length - 1)} 1` }}
              />
              {JOURNEY.map((s, i) => {
                const on = i === active;
                const done = i < active;
                const StepIcon = s.icon;
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
                    onPointerEnter={(e) => e.pointerType === "mouse" && setPicked(i)}
                    onFocus={() => setPicked(i)}
                    onClick={() => setPicked(i)}
                    className={`group relative flex flex-col items-start self-start rounded-lg pb-2 text-left transition-opacity duration-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal ${
                      on ? "opacity-100" : "opacity-55 hover:opacity-90"
                    }`}
                  >
                    <span
                      className={`relative flex h-10 w-10 items-center justify-center rounded-full border transition-[background-color,border-color,color,scale] duration-500 ${
                        on
                          ? "scale-110 border-signal bg-signal text-forest"
                          : done
                            ? "border-signal/60 bg-deep text-signal"
                            : "border-white/20 bg-deep text-ice/70"
                      }`}
                    >
                      <StepIcon aria-hidden="true" className="h-4 w-4" strokeWidth={1.75} />
                    </span>
                    <span className={`mt-4 block text-xs font-semibold tracking-[0.18em] ${on ? "text-signal" : "text-ice/60"}`}>{s.n}</span>
                    <span className="mt-1 block text-lg font-semibold uppercase tracking-[0.06em]">{s.title}</span>
                    <span className="mt-1.5 block text-[0.8125rem] leading-snug text-ice/65">{s.copy}</span>
                  </button>
                );
              })}
            </div>

            <div
              id="journey-panel"
              role="tabpanel"
              aria-labelledby={`journey-tab-${active}`}
              className="mt-8 grid grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
            >
              <div className="relative h-[min(21rem,36svh)] overflow-hidden">
                {JOURNEY.map((s, i) => (
                  <StepVisual key={s.n} step={s} active={i === active} />
                ))}
              </div>
              <div key={active} className="journey-detail flex flex-col justify-center p-8 xl:p-10">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-signal/10 text-signal">
                    <Icon aria-hidden="true" className="h-4.5 w-4.5" strokeWidth={1.75} />
                  </span>
                  <span className="text-xs font-semibold tracking-[0.2em] text-ice/60">
                    STAGE {current.n} / {String(JOURNEY.length).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-5 text-3xl font-semibold uppercase tracking-[0.04em]">{current.title}</h3>
                <p className="mt-3 max-w-md leading-relaxed text-ice/80">{current.detail}</p>
              </div>
            </div>
          </div>

          {/* Phones / tablets: vertical timeline */}
          <ol ref={list} className="relative mt-10 lg:hidden">
            <span aria-hidden="true" className="absolute bottom-5 left-5 top-5 w-px bg-white/12" />
            <span
              aria-hidden="true"
              className="absolute bottom-5 left-5 top-5 w-px origin-top bg-signal"
              style={{ scale: reduce ? "1 1" : "1 var(--progress, 0)" }}
            />
            {JOURNEY.map((s, i) => {
              const on = reduce || i <= mobileStep;
              const StepIcon = s.icon;
              return (
                <li key={s.n} className="relative flex gap-5 pb-9 last:pb-0">
                  <span
                    className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-[background-color,border-color,color] duration-500 ${
                      i === mobileStep && !reduce
                        ? "border-signal bg-signal text-forest"
                        : on
                          ? "border-signal/60 bg-deep text-signal"
                          : "border-white/20 bg-deep text-ice/60"
                    }`}
                  >
                    <StepIcon aria-hidden="true" className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                  <div className={`pt-1 transition-opacity duration-500 ${on ? "opacity-100" : "opacity-55"}`}>
                    <p className="text-xs font-semibold tracking-[0.18em] text-signal">{s.n}</p>
                    <h3 className="mt-1 text-lg font-semibold uppercase tracking-[0.06em]">{s.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ice/75">{s.detail}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
