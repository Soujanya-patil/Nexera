import { useRef } from "react";
import { HOME_STATS } from "./StatBar";
import { useEntrance } from "../lib/entrance";
import CountUp from "./CountUp";
import { DUR, EASE, STAGGER } from "../lib/tokens";

/**
 * Home stat bar — the business impact that follows the product story. The two approved figures
 * (HOME_STATS, unchanged) count up to their real values once (CountUp, the site's figure animation).
 *
 * Entrance ("precision"): a hairline draws out from the centre, the bar widens in from its centre, each
 * figure settles in (a little scale), its green rule draws, then its label.
 * Hover: the figure deepens, a tiny green dot appears above it, the rule lengthens and the label
 * comes up to full contrast. No cards.
 */
export default function HomeStats() {
  const root = useRef(null);
  const enter = useEntrance(
    root,
    ({ tl, q }) => {
      tl.fromTo(q("[data-e='hairline']"), { opacity: 0, scaleX: 0 }, { opacity: 1, scaleX: 1, duration: DUR.slow, ease: EASE.inOut, clearProps: "all" }, 0)
        .fromTo(q("[data-e='bar']"), { opacity: 0, scaleX: 0.92 }, { opacity: 1, scaleX: 1, duration: DUR.slow, ease: EASE.emphasized, clearProps: "all" }, 0.15)
        .fromTo(q("[data-num]"), { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: DUR.slow, stagger: STAGGER, ease: EASE.emphasized, clearProps: "all" }, 0.3)
        .fromTo(q("[data-rule]"), { scaleX: 0 }, { scaleX: 1, duration: DUR.base, stagger: STAGGER, ease: EASE.standard, clearProps: "transform" }, 0.55)
        .fromTo(q("[data-label]"), { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: DUR.base, stagger: STAGGER, clearProps: "all" }, 0.65);
    },
    { start: "top 88%" }
  );

  return (
    <section ref={root} data-enter={enter} aria-label="Market outlook" className="bg-paper">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <span data-e="hairline" aria-hidden="true" className="mx-auto mb-6 block h-px w-24 bg-line" />
        <div data-e="bar" className="grid grid-cols-2 divide-x divide-line py-2">
          {HOME_STATS.map((s) => (
            <div key={s.label} className="group/stat relative px-4 text-center sm:px-6">
              <span
                aria-hidden="true"
                className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-3 scale-0 rounded-full bg-signal opacity-0 transition-[opacity,scale] duration-fast group-hover/stat:scale-100 group-focus-visible/stat:scale-100 group-focus-within/stat:scale-100 group-hover/stat:opacity-100 group-focus-visible/stat:opacity-100 group-focus-within/stat:opacity-100"
              />
              <p className="whitespace-nowrap text-h2 tabular-nums font-semibold text-forest transition-colors duration-fast group-hover/stat:text-ink group-focus-visible/stat:text-ink group-focus-within/stat:text-ink">
                <span data-num className="inline-block">
                  <CountUp value={s.text} />
                </span>
              </p>
              <span
                data-rule
                aria-hidden="true"
                className="mx-auto mt-2 block h-0.5 w-14 origin-center scale-x-[0.5714] rounded-full bg-signal transition-[scale] duration-base ease-standard group-hover/stat:scale-x-100 group-focus-visible/stat:scale-x-100 group-focus-within/stat:scale-x-100"
              />
              <p data-label className="mx-auto mt-2 max-w-[16rem] text-small text-graphite transition-colors duration-fast group-hover/stat:text-ink group-focus-visible/stat:text-ink group-focus-within/stat:text-ink">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
