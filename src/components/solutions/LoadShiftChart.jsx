import { useEffect, useMemo, useRef, useState } from "react";
import { loadGsap } from "../../lib/motion";
import { onceInView } from "../../lib/inview";

/*
 * Illustrative day curves for the Solutions pages: shapes only — no numbers, no units, no values. The
 * curves are smooth made-up profiles (functions of the hour below), drawn into a 0–1 box; the SVG
 * stretches to its box (non-scaling strokes), and every label is HTML placed over it, so text stays
 * legible at every width.
 */
const N = 97; // samples: every 15 minutes
const HOURS = Array.from({ length: N }, (_, i) => (i * 24) / (N - 1));
const sig = (x) => 1 / (1 + Math.exp(-x));
const bump = (t, at, w) => Math.exp(-(((t - at) / w) ** 2));

// C&I: a working day — a morning ramp, an afternoon peak, the evening fall-off.
const ciDemand = (t) => 0.2 + 0.3 * sig((t - 7.5) / 1.1) - 0.3 * sig((t - 19) / 1.2) + 0.36 * bump(t, 14.5, 2.1);
const LIMIT = 0.62; // the dashed demand limit
const ciCharge = (t) => 0.11 * bump(t, 4, 1.7); // off-peak charging (early morning)
// Utility: a midday solar bell and an evening demand peak.
const solar = (t) => 0.86 * bump(t, 12.5, 2.7);
const gridDemand = (t) => 0.3 + 0.1 * sig((t - 7) / 1.5) + 0.42 * bump(t, 19.6, 1.9) - 0.08 * bump(t, 3, 2.5);

// Chart box in viewBox units (100 × 50): the plot leaves room for the axes.
const X0 = 6;
const X1 = 98;
const Y0 = 45; // baseline
const Y1 = 4; // top
const px = (t) => X0 + ((X1 - X0) * t) / 24;
const py = (v) => Y0 - (Y0 - Y1) * v;
const f = (n) => n.toFixed(2);

/** A smooth path through the sampled points (Catmull-Rom → cubic Béziers): same command list for any
 *  curve, so two curves can be morphed into each other. */
function smooth(values) {
  const p = values.map((v, i) => [px(HOURS[i]), py(v)]);
  let d = `M${f(p[0][0])},${f(p[0][1])}`;
  for (let i = 0; i < p.length - 1; i++) {
    const [a, b, c, e] = [p[Math.max(0, i - 1)], p[i], p[i + 1], p[Math.min(p.length - 1, i + 2)]];
    d += ` C${f(b[0] + (c[0] - a[0]) / 6)},${f(b[1] + (c[1] - a[1]) / 6)} ${f(c[0] - (e[0] - b[0]) / 6)},${f(c[1] - (e[1] - b[1]) / 6)} ${f(c[0])},${f(c[1])}`;
  }
  return d;
}
/** Closed area between `top` and `bottom` over the hours where `when(t)` holds. */
function area(top, bottom, when) {
  const ts = HOURS.filter(when);
  if (!ts.length) return "";
  const up = ts.map((t) => `${f(px(t))},${f(py(top(t)))}`);
  const down = ts.reverse().map((t) => `${f(px(t))},${f(py(bottom(t)))}`);
  return `M${up.join(" L")} L${down.join(" L")} Z`;
}

const VARIANTS = {
  ci: {
    caption: "Illustrative load profile",
    xLabel: "Time of day",
    yLabel: "Site demand",
    build: () => ({
      line: smooth(HOURS.map(ciDemand)),
      lineWith: smooth(HOURS.map((t) => Math.min(ciDemand(t), LIMIT) + ciCharge(t))),
      battery: area(ciDemand, () => LIMIT, (t) => ciDemand(t) > LIMIT),
      charges: area((t) => Math.min(ciDemand(t), LIMIT) + ciCharge(t), (t) => Math.min(ciDemand(t), LIMIT), (t) => ciCharge(t) > 0.004),
    }),
  },
  utility: {
    caption: "Illustrative",
    xLabel: "Time of day",
    legend: [
      ["Solar generation", "bg-amber"],
      ["Demand", "bg-forest"],
    ],
    build: () => ({
      solar: smooth(HOURS.map(solar)),
      demand: smooth(HOURS.map(gridDemand)),
      surplus: area(solar, gridDemand, (t) => solar(t) > gridDemand(t)),
      shortfall: area(gridDemand, solar, (t) => t >= 16.5 && t <= 22.75 && gridDemand(t) > solar(t)),
      // From the middle of the surplus to the middle of the shortfall.
      flow: `M${f(px(12.5))},${f(py(0.62))} C${f(px(14.5))},${f(py(1.02))} ${f(px(18))},${f(py(1.0))} ${f(px(19.6))},${f(py(0.42))}`,
    }),
  },
};

const OPTIONS = [
  [false, "Without storage"],
  [true, "With storage"],
];

/**
 * An illustrative day chart with a "Without storage | With storage" switch (its own chunk).
 * `variant="ci"`: peak shaving — a site's load curve with a dashed demand limit; with storage the part
 * above the limit is cut off and filled green ("Supplied by the battery") and the battery's early-morning
 * charging shows as a soft green rise ("Battery charges"); the curve morphs between the two (0.6 s).
 * `variant="utility"`: renewable firming — a midday solar bell and an evening demand curve; without
 * storage the unused midday solar and the evening shortfall are shaded grey; with storage they turn
 * green and a flow (moving dashes) carries the one into the other.
 * The curve draws itself once as the chart scrolls into view (0.9 s). Reduced motion: no drawing,
 * the switch changes the chart at once.
 */
export default function LoadShiftChart({ variant = "ci" }) {
  const v = VARIANTS[variant];
  const paths = useMemo(() => v.build(), [v]);
  const [on, setOn] = useState(false);
  const root = useRef(null);
  const line = useRef(null);
  const gsapRef = useRef(null);
  const first = useRef(true);
  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Draw-in on entering the viewport.
  useEffect(() => {
    const el = root.current;
    if (!el || reduced()) return;
    let cancelled = false;
    let off;
    loadGsap().then(({ gsap }) => {
      if (cancelled) return;
      gsapRef.current = gsap;
      const strokes = [...el.querySelectorAll("[data-draw]")];
      strokes.forEach((s) => s.setAttribute("pathLength", "1"));
      gsap.set(strokes, { strokeDasharray: 1, strokeDashoffset: 1 });
      const done = () => {
        gsap.set(strokes, { clearProps: "strokeDasharray,strokeDashoffset" });
        strokes.forEach((s) => s.removeAttribute("pathLength"));
      };
      off = onceInView(el, {
        initial: true,
        enter: () => gsap.to(strokes, { strokeDashoffset: 0, duration: 0.9, ease: "power2.inOut", stagger: 0.1, onComplete: done }),
        show: done,
      });
    });
    return () => {
      cancelled = true;
      off?.();
    };
  }, []);

  // C&I: morph the load curve between the two states.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (variant !== "ci" || !line.current) return;
    const d = on ? paths.lineWith : paths.line;
    const gsap = gsapRef.current;
    if (!gsap || reduced()) {
      line.current.setAttribute("d", d);
      return;
    }
    const tween = gsap.to(line.current, { attr: { d }, duration: 0.6, ease: "power2.inOut" });
    return () => tween.kill();
  }, [on, variant, paths]);

  const fade = (show) => ({ opacity: show ? 1 : 0, transition: "opacity 0.6s cubic-bezier(0.45, 0, 0.55, 1)" });
  const label = "pointer-events-none absolute whitespace-nowrap text-[0.6875rem] font-semibold leading-tight sm:text-xs";

  return (
    <figure ref={root} className="flex aspect-[4/3] w-full flex-col rounded-2xl border border-line bg-paper p-4 sm:aspect-[16/10] sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label={v.caption} className="inline-flex rounded-full bg-ice p-1">
          {OPTIONS.map(([value, text]) => (
            <button
              key={text}
              type="button"
              aria-pressed={on === value}
              onClick={() => setOn(value)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal sm:text-sm ${
                on === value ? "bg-forest text-white" : "text-forest hover:text-ink"
              }`}
            >
              {text}
            </button>
          ))}
        </div>
        {v.legend && (
          <ul className="flex gap-4 text-xs text-graphite">
            {v.legend.map(([t, c]) => (
              <li key={t} className="flex items-center gap-1.5">
                <span aria-hidden="true" className={`h-0.5 w-4 rounded-full ${c}`} />
                {t}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="relative mt-3 min-h-0 flex-1">
        <svg viewBox="0 0 100 50" preserveAspectRatio="none" aria-hidden="true" className="absolute inset-0 h-full w-full overflow-visible">
          {/* Axes */}
          <path d={`M${X0},${Y1 - 2} L${X0},${Y0} L${X1 + 1},${Y0}`} fill="none" stroke="currentColor" className="text-forest/25" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          {variant === "ci" ? (
            <>
              <path d={paths.battery} className="fill-signal/45" style={fade(on)} />
              <path d={paths.charges} className="fill-signal/25" style={fade(on)} />
              <line x1={X0} x2={X1} y1={py(LIMIT)} y2={py(LIMIT)} stroke="currentColor" className="text-forest/55" strokeWidth="1.25" strokeDasharray="5 4" vectorEffect="non-scaling-stroke" />
              <path ref={line} data-draw d={paths.line} fill="none" stroke="currentColor" className="text-forest" strokeWidth="2.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            </>
          ) : (
            <>
              <path d={paths.surplus} className="fill-graphite/20" style={fade(!on)} />
              <path d={paths.shortfall} className="fill-graphite/20" style={fade(!on)} />
              <path d={paths.surplus} className="fill-signal/40" style={fade(on)} />
              <path d={paths.shortfall} className="fill-signal/40" style={fade(on)} />
              <path d={paths.solar} data-draw fill="none" stroke="currentColor" className="text-amber" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
              <path d={paths.demand} data-draw fill="none" stroke="currentColor" className="text-forest" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
              <path
                d={paths.flow}
                fill="none"
                data-on={on}
                className="flow-line text-forest"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="6 6"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                style={fade(on)}
              />
            </>
          )}
        </svg>

        {/* Labels (HTML over the plot, positioned in the same 100 × 50 box). */}
        {variant === "ci" ? (
          <>
            <span className={`${label} right-0 text-forest/70`} style={{ top: `calc(${(py(LIMIT) / 50) * 100}% - 1.35rem)` }}>
              Demand limit
            </span>
            <span aria-hidden={!on} className={`${label} -translate-x-1/2 text-forest`} style={{ left: `${px(14.5)}%`, top: "0%", ...fade(on) }}>
              Supplied by the battery
            </span>
            <span aria-hidden={!on} className={`${label} -translate-x-1/2 text-forest`} style={{ left: `${px(4)}%`, top: `calc(${(py(0.36) / 50) * 100}% - 1.6rem)`, ...fade(on) }}>
              Battery charges
            </span>
          </>
        ) : (
          <>
            <span aria-hidden={on} className={`${label} -translate-x-1/2 text-graphite`} style={{ left: `${px(12.5)}%`, top: "0%", ...fade(!on) }}>
              Unused midday solar
            </span>
            <span aria-hidden={on} className={`${label} -translate-x-full text-graphite`} style={{ left: `${px(23.5)}%`, top: `calc(${(py(0.86) / 50) * 100}% - 1rem)`, ...fade(!on) }}>
              Evening shortfall
            </span>
            <span aria-hidden={!on} className={`${label} -translate-x-1/2 whitespace-normal text-center text-forest`} style={{ left: `${px(16)}%`, top: "-0.25rem", width: "13rem", ...fade(on) }}>
              Stored at midday, dispatched in the evening
            </span>
          </>
        )}

        <span className="absolute bottom-0 right-0 translate-y-full pt-1 text-[0.6875rem] text-graphite sm:text-xs">{v.xLabel}</span>
        {v.yLabel && (
          <span className="absolute left-0 top-0 origin-top-left -translate-x-1 translate-y-[4.5rem] -rotate-90 whitespace-nowrap text-[0.6875rem] text-graphite sm:text-xs">
            {v.yLabel}
          </span>
        )}
      </div>
      <figcaption className="mt-6 text-xs text-graphite">{v.caption}</figcaption>
    </figure>
  );
}
