import { useRef } from "react";
import { HOME_STATS } from "./StatBar";
import { useEntrance } from "../lib/entrance";
import CountUp from "./CountUp";
import { DUR, EASE, STAGGER } from "../lib/tokens";

/**
 * Home stat bar — the business impact that follows the product story. The confirmed figures
 * (HOME_STATS) count up to their real values once (CountUp, the site's figure animation); the last
 * cell is a statement in the figure's style, a size smaller, with no count.
 *
 * Grid: two cells per row on phones (a left hairline unless a cell starts its row, a top one on the second
 * row), all four in one row from 1024 px with a hairline between each, across the page container. In
 * that row the figures scale with the cells (3.3vw, 2rem–3rem: 48 px from ~1455 px), since text-h2 alone
 * would overflow a cell around 1024 px.
 *
 * Entrance ("precision"): a hairline draws out from the centre, the bar widens in from its centre, each
 * figure settles in (a little scale), its green rule draws, then its label.
 * Hover: the figure deepens, a tiny green dot appears above it, the rule lengthens and the label
 * comes up to full contrast. No cards.
 */
// Phone hairlines per cell: [starts a row ? none : left][first row ? none : top].
const CELL_LINES = [
  ["", "border-t"],
  ["border-l", "border-l border-t"],
];

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
    <section ref={root} data-enter={enter} aria-label="Market outlook" className="bg-white">
      <div className="container-site py-10">
        <span data-e="hairline" aria-hidden="true" className="mx-auto mb-6 block h-px w-24 bg-line" />
        <div data-e="bar" className="grid grid-cols-2 lg:grid-cols-4">
          {HOME_STATS.map((s, i) => (
            <div key={s.label} className={`group/stat relative border-line px-4 py-6 text-center sm:px-6 lg:px-4 xl:px-6 ${CELL_LINES[i % 2 ? 1 : 0][i >= 2 ? 1 : 0]} ${i ? "lg:border-l lg:border-t-0" : ""}`}>
              <span
                aria-hidden="true"
                className="absolute left-1/2 top-6 h-1.5 w-1.5 -translate-x-1/2 -translate-y-3 scale-0 rounded-full bg-accent opacity-0 transition-[opacity,scale] duration-fast group-hover/stat:scale-100 group-focus-visible/stat:scale-100 group-focus-within/stat:scale-100 group-hover/stat:opacity-100 group-focus-visible/stat:opacity-100 group-focus-within/stat:opacity-100"
              />
              <p
                className={`font-semibold text-accent transition-colors duration-fast group-hover/stat:text-ink group-focus-visible/stat:text-ink group-focus-within/stat:text-ink ${
                  s.statement ? "mx-auto max-w-[14rem] text-h3" : "whitespace-nowrap text-h2 tabular-nums lg:text-[clamp(2rem,3.3vw,3rem)]"
                }`}
              >
                <span data-num className="inline-block">
                  {s.statement ? s.text : <CountUp value={s.text} />}
                </span>
              </p>
              <span
                data-rule
                aria-hidden="true"
                className="mx-auto mt-2 block h-0.5 w-14 origin-center scale-x-[0.5714] rounded-full bg-accent transition-[scale] duration-base ease-standard group-hover/stat:scale-x-100 group-focus-visible/stat:scale-x-100 group-focus-within/stat:scale-x-100"
              />
              <p data-label className="mx-auto mt-2 max-w-[16rem] text-small text-copy transition-colors duration-fast group-hover/stat:text-ink group-focus-visible/stat:text-ink group-focus-within/stat:text-ink">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
