import { useEffect, useRef, useState } from "react";
import { Box, Building2, FlaskConical, Repeat, Thermometer, Zap } from "lucide-react";
import { LFP_NMC_GLANCE } from "../../../data/articles";
import { useSceneMotion } from "./useScene";

// One small icon per table row, in the table's order.
const ICONS = [Thermometer, Repeat, Box, Zap, FlaskConical, Building2];
/** A table value's lead words: "Higher: more…" → "Higher", "Iron and phosphate; no…" → "Iron and phosphate". */
const lead = (v) => v.split(/[:;]/)[0];

/**
 * "LFP vs NMC at a glance": the table's six rows, each with a small icon, lit one at a time as its
 * row is read (phones: they take turns while the scene is in view); below, that row's LFP and NMC
 * values in the table's own words (their lead words only — no figures beyond the table's). Arrival:
 * the rows slide in. Final state: every row shown, the first row's values below.
 */
export default function GlanceRows({ active, motion, mode, step }) {
  const root = useRef(null);
  const [tour, setTour] = useState(-1);
  useEffect(() => {
    if (mode !== "inline" || !motion || !active) return;
    let i = 0;
    setTour(0);
    const t = setInterval(() => setTour((i = (i + 1) % LFP_NMC_GLANCE.rows.length)), 1800);
    return () => clearInterval(t);
  }, [mode, motion, active]);

  useSceneMotion(root, motion, active, ({ gsap }, el) =>
    gsap
      .timeline()
      .from(el.querySelectorAll("[data-row]"), { opacity: 0, x: -14, duration: 0.4, stagger: 0.06, ease: "power2.out" })
      .from(el.querySelectorAll("[data-pair]"), { opacity: 0, y: 10, duration: 0.4, stagger: 0.1, ease: "power2.out" }, 0.35)
  );

  const lit = mode === "inline" ? tour : step;
  const any = motion && lit >= 0;
  const shown = any ? lit : 0;
  const [, lfp, nmc] = LFP_NMC_GLANCE.rows[shown];
  const compact = mode === "inline";

  return (
    <div ref={root} className={`flex h-full flex-col justify-center ${compact ? "gap-3 px-4" : "gap-5 px-7"}`}>
      <div role="img" aria-label={`LFP vs NMC, row by row: ${LFP_NMC_GLANCE.rows.map((r) => r[0]).join(", ")}. Shown: ${LFP_NMC_GLANCE.rows[shown][0]}, LFP ${lead(lfp)}, NMC ${lead(nmc)}.`}>
        <ul aria-hidden="true" className={`grid ${compact ? "grid-cols-2 gap-1.5" : "gap-1.5"}`}>
          {LFP_NMC_GLANCE.rows.map(([label], i) => {
            const Icon = ICONS[i];
            const on = any && i === lit;
            return (
              <li
                key={label}
                data-row
                className={`flex items-center gap-2.5 rounded-xl border px-3 font-semibold transition-[border-color,background-color,color,opacity] duration-500 ${compact ? "py-1.5 text-[12px]" : "py-2 text-sm"} ${
                  on ? "border-signal/60 bg-signal/10 text-white" : any ? "border-white/10 text-white/45" : "border-white/10 text-white/80"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 transition-colors duration-500 ${on ? "text-signal" : "text-white/50"}`} strokeWidth={1.8} />
                {label}
              </li>
            );
          })}
        </ul>
        <div aria-hidden="true" className={`grid grid-cols-2 gap-2.5 ${compact ? "mt-3" : "mt-5"}`}>
          {[
            ["LFP", lfp],
            ["NMC", nmc],
          ].map(([name, v]) => (
            <div key={name} data-pair className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-signal">{name}</p>
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
