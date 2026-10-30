import { useEffect, useRef, useState } from "react";
import { KineticHeading } from "./Kinetic";
import PillLink from "../PillLink";
import { useMediaQuery, useScrollSteps } from "../../lib/scrollSteps";

/*
 * An ILLUSTRATIVE C&I day: shapes only — no kW, no ₹, no values. Smooth made-up curves (functions of
 * the hour), drawn into the chart's 100 × 50 box; the SVG stretches to its box with non-scaling
 * strokes, and every label is HTML placed over it, so text stays legible at every width.
 */
const N = 97; // every 15 minutes
const HOURS = Array.from({ length: N }, (_, i) => (i * 24) / (N - 1));
const sig = (x) => 1 / (1 + Math.exp(-x));
const bump = (t, at, w) => Math.exp(-(((t - at) / w) ** 2));

const LIMIT = 0.66; // contract demand limit
const CAP = 0.63; // with the battery: the peak is cut to just under the limit
// Site demand: low at night, a working-day plateau, an evening peak (≈ 18:00–22:00) over the limit.
const demand = (t) => 0.28 + 0.24 * sig((t - 7.5) / 1) - 0.14 * sig((t - 22.5) / 0.8) + 0.36 * bump(t, 20, 1.9);
const solar = (t) => 0.42 * bump(t, 12.5, 2.6); // daytime solar
const nightCharge = (t) => 0.09 * bump(t, 3, 1.3); // the battery charges off-peak at night …
const solarCharge = (t) => (t > 9 && t < 16 ? 0.5 * solar(t) : 0); // … and from midday solar
const over = (t) => demand(t) > CAP;

const X0 = 4;
const X1 = 99;
const Y0 = 46; // baseline
const Y1 = 3; // top
const px = (t) => X0 + ((X1 - X0) * t) / 24;
const py = (v) => Y0 - (Y0 - Y1) * v;
const f = (n) => n.toFixed(2);

/** A smooth path through the sampled points (Catmull-Rom → cubic Béziers). */
function smooth(fn, when = () => true) {
  const p = HOURS.filter(when).map((t) => [px(t), py(fn(t))]);
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
  const up = ts.map((t) => `${f(px(t))},${f(py(top(t)))}`);
  const down = [...ts].reverse().map((t) => `${f(px(t))},${f(py(bottom(t)))}`);
  return `M${up.join(" L")} L${down.join(" L")} Z`;
}

const P = {
  line: smooth(demand),
  cut: smooth((t) => Math.min(demand(t), CAP) + nightCharge(t)),
  ghost: smooth(demand, (t) => demand(t) > CAP - 0.02),
  penalty: area(demand, () => LIMIT, (t) => demand(t) > LIMIT),
  discharge: area(demand, () => CAP, over),
  solar: area(solar, () => 0, (t) => solar(t) > 0.01),
  night: area((t) => Math.min(demand(t), CAP) + nightCharge(t), (t) => Math.min(demand(t), CAP), (t) => nightCharge(t) > 0.004),
  midday: area(solarCharge, () => 0, (t) => solarCharge(t) > 0.004),
};
const PEAK_T = 20;
const pct = (y) => `${(y / 50) * 100}%`;

// Pinned scroll story on tall desktop screens (the section sticks while its four steps play).
const STAGE = "(min-width: 1024px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)";

/**
 * C&I page — "Peak shaving": an illustrative day showing a battery keeping the evening peak under the
 * contract demand limit, in four scroll-driven steps:
 *   1. the demand line draws itself (scrubbed); its evening peak rises over the dashed limit and the
 *      part above it turns amber — "Penalty risk";
 *   2. the daytime solar fades in;
 *   3. the battery charges (green: at night and from midday solar), then discharges at the evening
 *      peak — the line is cut to just under the limit (the uncut peak stays as an amber dashed outline);
 *   4. the end caption.
 * Tall desktop screens: the section pins (CSS sticky) and the steps follow its scroll progress
 * (useScrollSteps). Other screens: the steps follow the chart as it crosses the viewport. Opacity,
 * transform and the stroke draw only. Reduced motion, no JavaScript and the pre-rendered HTML: the
 * final chart, every label shown.
 */
export default function PeakShaving() {
  const staged = useMediaQuery(STAGE);
  const motion = useMediaQuery("(prefers-reduced-motion: no-preference)"); // false while pre-rendering / hydrating
  const root = useRef(null);
  const chart = useRef(null);
  // The scroll tracking (GSAP ScrollTrigger) starts only once the section is about a screen away, so
  // nothing of it is fetched or run while the page loads.
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = root.current;
    if (!motion || near || !el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "100% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [motion, near]);
  const pinnedStep = useScrollSteps(root, 4, { start: "top 64px", end: "bottom bottom", enabled: staged && near });
  const flowStep = useScrollSteps(chart, 4, { start: "top 80%", end: "bottom 35%", enabled: motion && !staged && near });
  const animate = motion;
  const step = staged ? pinnedStep : flowStep;
  const at = (n) => !animate || step >= n; // step n (0-based) reached, or the static final state

  const fade = (show) => `transition-[opacity,translate] duration-slow ease-standard ${show ? "opacity-100" : "opacity-0"}`;
  const label = "pointer-events-none absolute whitespace-nowrap text-micro font-semibold";
  // Step 1: the line draws itself from the left with the scroll (its own layer, uncovered by a clip —
  // dash-offset drawing is unreliable with non-scaling strokes); the amber highlight comes in as it completes.
  const draw = animate ? { clipPath: "inset(-20% calc((1 - clamp(0, var(--progress, 1) * 4.4, 1)) * 100%) -20% -2%)" } : undefined;
  const penaltyIn = animate && step < 2 ? { opacity: "clamp(0, (var(--progress, 1) * 4.4 - 0.75) * 4, 1)" } : undefined;

  return (
    <section ref={root} id="peak-shaving" aria-labelledby="peak-shaving-title" className="relative bg-deep-grid text-white stage:h-[300vh]">
      <div className="relative overflow-hidden stage:sticky stage:top-16 stage:h-[calc(100svh-4rem)]">
        <div className="relative grid h-full container-site content-center items-center gap-10 py-section lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-14 stage:py-6">
          <div>
            <p className="eyebrow text-label">Peak shaving</p>
            <KineticHeading id="peak-shaving-title" className="mt-3 text-h2 font-semibold">
              Keep peak demand under your contract limit
            </KineticHeading>
            <p className="mt-4 max-w-md text-body text-paper/75">See how a battery shifts energy to cut evening peaks.</p>
            {/* Step progress (decorative): four segments filling as the story advances. */}
            {animate && (
              <ol aria-hidden="true" className="mt-8 flex max-w-xs gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <li key={i} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/12">
                    <span className={`block h-full origin-left bg-accent transition-[scale] duration-base ${step >= i ? "scale-x-100" : "scale-x-0"}`} />
                  </li>
                ))}
              </ol>
            )}
          </div>

          <div>
            <figure ref={chart} className="flex aspect-[4/3] w-full flex-col rounded-card border border-white/10 bg-forest/40 p-4 sm:aspect-[16/10] sm:p-6">
              <figcaption className="eyebrow text-label">Illustrative daily profile</figcaption>
              <div className="relative mt-4 min-h-0 flex-1">
                <svg viewBox="0 0 100 50" preserveAspectRatio="none" aria-hidden="true" className="absolute inset-0 h-full w-full overflow-visible">
                  {/* Baseline */}
                  <path d={`M${X0},${Y0} L${X1},${Y0}`} fill="none" stroke="currentColor" className="text-paper/25" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                  {/* 2: daytime solar */}
                  <path d={P.solar} className={`fill-amber/15 ${fade(at(1))}`} />
                  {/* 3: battery charging — from midday solar and off-peak at night */}
                  <path d={P.midday} className={`fill-accent/35 ${fade(at(2))}`} />
                  <path d={P.night} className={`fill-accent/45 ${fade(at(2))}`} />
                  {/* 1: the part of the peak above the limit (penalty risk) → 3: supplied by the battery */}
                  <path d={P.penalty} className={`fill-amber/55 ${fade(!at(2))}`} style={penaltyIn} />
                  <path d={P.discharge} className={`fill-accent/45 ${fade(at(2))}`} />
                  {/* Contract demand limit */}
                  <line x1={X0} x2={X1} y1={py(LIMIT)} y2={py(LIMIT)} stroke="currentColor" className="text-paper/70" strokeWidth="1.25" strokeDasharray="5 4" vectorEffect="non-scaling-stroke" />
                  {/* 3: the uncut peak, kept as an outline */}
                  <path d={P.ghost} fill="none" stroke="currentColor" className={`text-amber ${fade(at(2))}`} strokeWidth="1.5" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
                  {/* 3: with the battery, the line cut to just under the limit */}
                  <path d={P.cut} fill="none" stroke="currentColor" className={`text-white ${fade(at(2))}`} strokeWidth="2.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                </svg>
                {/* 1: site demand — drawn with the scroll, gone once the battery cuts the peak */}
                <svg viewBox="0 0 100 50" preserveAspectRatio="none" aria-hidden="true" className={`absolute inset-0 h-full w-full overflow-visible ${fade(!at(2))}`} style={draw}>
                  <path d={P.line} fill="none" stroke="currentColor" className="text-white" strokeWidth="2.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                </svg>

                {/* Labels: HTML over the plot, in the same 100 × 50 box. */}
                <span className={`${label} text-paper/85`} style={{ left: `${px(0.6)}%`, top: `calc(${pct(py(LIMIT))} + 0.3rem)` }}>
                  Contract demand limit
                </span>
                <span className={`${label} -translate-x-1/2 text-amber`} style={{ left: `${px(PEAK_T)}%`, top: `calc(${pct(py(demand(PEAK_T)))} - 1.4rem)`, ...(penaltyIn ?? {}) }}>
                  Penalty risk
                </span>
                <span aria-hidden={!at(1)} className={`${label} -translate-x-1/2 text-amber ${fade(at(1))}`} style={{ left: `${px(12.5)}%`, top: `calc(${pct(py(solar(12.5)))} + 0.35rem)` }}>
                  Solar
                </span>
                <span aria-hidden={!at(2)} className={`${label} -translate-x-1/2 text-accent ${fade(at(2))}`} style={{ left: `${px(3.4)}%`, top: `calc(${pct(py(demand(3)))} + 0.45rem)` }}>
                  Battery charges
                </span>
                <span aria-hidden={!at(2)} className={`${label} -translate-x-full text-accent ${fade(at(2))}`} style={{ left: `${px(17.6)}%`, top: `calc(${pct(py(0.82))} - 0.6rem)` }}>
                  Battery discharges
                </span>
                {/* Time of day */}
                {[0, 6, 12, 18, 24].map((h) => (
                  <span
                    key={h}
                    aria-hidden="true"
                    className={`absolute top-full pt-1.5 text-micro tabular-nums text-paper/75 ${h === 0 ? "" : h === 24 ? "-translate-x-full" : "-translate-x-1/2"}`}
                    style={{ left: `${px(h)}%` }}
                  >
                    {String(h).padStart(2, "0")}:00
                  </span>
                ))}
              </div>
              <div className="h-6 shrink-0" />
            </figure>
            <p className={`mt-5 text-body font-semibold text-white ${fade(at(3))} ${at(3) ? "translate-y-0" : "translate-y-2"}`}>
              Peak demand kept under your contract limit.
            </p>
            <div className="mt-6">
              <PillLink to="/#contact?interest=ci" arrow>
                Talk to an expert
              </PillLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
