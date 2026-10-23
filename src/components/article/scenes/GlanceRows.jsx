import { useEffect, useRef, useState } from "react";
import { Box, Building2, FlaskConical, Repeat, Thermometer, Zap } from "lucide-react";
import { LFP_NMC_GLANCE } from "../../../data/articles";
import { useSceneMotion } from "./useScene";
import { DUR, EASE, STAGGER } from "../../../lib/tokens";

// One small icon per table row, in the table's order.
const ICONS = [Thermometer, Repeat, Box, Zap, FlaskConical, Building2];
/** A table value's lead words: "Higher: more…" → "Higher", "Iron and phosphate; no…" → "Iron and phosphate". */
const lead = (v) => v.split(/[:;]/)[0];

/**
 * An article's "at a glance" table (LFP vs NMC by default; `table`, `icons` and `names` for another):
 * its rows, each with a small icon, lit one at a time as its row is read (phones: they take turns
 * while the scene is in view); below, that row's two values in the table's own words (their lead
 * words only — no figures beyond the table's). Arrival: the rows slide in. Final state: every row
 * shown, the first row's values below.
 */
export default function GlanceRows({ active, motion, mode, step, table = LFP_NMC_GLANCE, icons = ICONS, names = ["LFP", "NMC"] }) {
  const root = useRef(null);
  const [tour, setTour] = useState(-1);
  useEffect(() => {
    if (mode !== "inline" || !motion || !active) return;
    let i = 0;
    setTour(0);
    const t = setInterval(() => setTour((i = (i + 1) % table.rows.length)), 1800);
    return () => clearInterval(t);
  }, [mode, motion, active]);

  useSceneMotion(root, motion, active, ({ gsap }, el) =>
    gsap
      .timeline()
      .from(el.querySelectorAll("[data-row]"), { opacity: 0, x: -14, duration: DUR.base, stagger: STAGGER, ease: EASE.standard, clearProps: "opacity,transform" })
      .from(el.querySelectorAll("[data-pair]"), { opacity: 0, y: 10, duration: DUR.base, stagger: STAGGER, ease: EASE.standard, clearProps: "opacity,transform" }, 0.35)
  );

  const lit = mode === "inline" ? tour : step;
  const any = motion && lit >= 0;
  const shown = any ? lit : 0;
  const [, lfp, nmc] = table.rows[shown];
  const compact = mode === "inline";

  return (
    <div ref={root} className={`flex h-full flex-col justify-center ${compact ? "gap-3 px-4" : "gap-5 px-7"}`}>
      <div role="img" aria-label={`${names[0]} vs ${names[1]}, row by row: ${table.rows.map((r) => r[0]).join(", ")}. Shown: ${table.rows[shown][0]}, ${names[0]} ${lead(lfp)}, ${names[1]} ${lead(nmc)}.`}>
        <ul aria-hidden="true" className={`grid ${compact ? "grid-cols-2 gap-1.5" : "gap-1.5"}`}>
          {table.rows.map(([label], i) => {
            const Icon = icons[i];
            const on = any && i === lit;
            return (
              <li
                key={label}
                data-row
                className={`flex items-center gap-2.5 rounded-control border px-3 font-semibold transition-[border-color,background-color,color] duration-500 ${compact ? "py-1.5 text-[12px]" : "py-2 text-sm"} ${
                  on ? "border-accent/60 bg-accent/10 text-white" : any ? "border-white/10 text-white/45" : "border-white/10 text-white/80"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 transition-colors duration-500 ${on ? "text-accent" : "text-white/50"}`} strokeWidth={1.8} />
                {label}
              </li>
            );
          })}
        </ul>
        <div aria-hidden="true" className={`grid grid-cols-2 gap-2.5 ${compact ? "mt-3" : "mt-5"}`}>
          {[
            [names[0], lfp],
            [names[1], nmc],
          ].map(([name, v]) => (
            <div key={name} data-pair className="rounded-control border border-white/10 bg-white/[0.04] px-3 py-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">{name}</p>
              <p key={`${name}-${shown}`} className={`mt-1 font-semibold leading-snug text-white ${compact ? "text-[13px]" : "text-[15px]"} article-glance-value`}>
                {lead(v)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
