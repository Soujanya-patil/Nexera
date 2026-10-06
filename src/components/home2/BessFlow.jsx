import { useRef, useState } from "react";
import PillLink from "../PillLink";
import { reducedMotion, sleep, SectionHead, useDrawIn } from "./shared";

/* Line art (stroke only, currentColor): each step's illustration, drawn in as the section enters. */
const ART = {
  store: (
    <svg viewBox="0 0 120 90" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {/* solar panel */}
      <path d="M8 62 L22 36 H62 L50 62 Z" />
      <path d="M15 49 H56 M28 36 L22 62 M42 36 L36 62" />
      <path d="M34 62 V78 M24 78 H44" />
      {/* wind turbine */}
      <path d="M92 82 L94 34 L96 82" />
      <g className="turbine-blades" style={{ transformOrigin: "94px 32px", transformBox: "view-box" }}>
        <path d="M94 32 L94 8" />
        <path d="M94 32 L114.8 44" />
        <path d="M94 32 L73.2 44" />
      </g>
      <circle cx="94" cy="32" r="2.4" />
      <circle className="flow-glow" data-nodraw cx="30" cy="24" r="9" fill="currentColor" stroke="none" fillOpacity="0.18" />
    </svg>
  ),
  shift: (
    <svg viewBox="0 0 120 90" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {/* storage cabinet */}
      <rect x="34" y="10" width="52" height="72" rx="3" />
      <path d="M34 34 H86 M34 58 H86" />
      <path d="M42 22 H60 M42 46 H60 M42 70 H60" />
      <rect x="72" y="18" width="6" height="8" rx="1" />
      <path d="M28 82 H92" />
      {/* charge bolt */}
      <path className="flow-glow" data-nodraw d="M64 40 L58 50 H64 L60 58" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  optimize: (
    <svg viewBox="0 0 120 90" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 10 V78 H112" />
      {/* demand curve with its peak */}
      <path className="peak-curve" d="M14 66 C30 64 38 52 48 40 C56 28 64 20 72 22 C80 24 86 44 94 56 C100 64 106 66 110 66" />
      {/* the peak, flattened by the battery */}
      <path className="flow-glow" data-nodraw d="M44 46 H96" strokeDasharray="4 4" />
      <path d="M20 78 V74 M44 78 V74 M68 78 V74 M92 78 V74" />
    </svg>
  ),
  power: (
    <svg viewBox="0 0 120 90" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {/* building */}
      <path d="M22 82 V22 L60 10 V82" />
      <path d="M60 32 H98 V82" />
      <path d="M14 82 H106" />
      {/* windows: light up when powered */}
      {[
        [30, 30],
        [44, 26],
        [30, 46],
        [44, 46],
        [30, 62],
        [44, 62],
        [70, 44],
        [84, 44],
        [70, 60],
        [84, 60],
      ].map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="8" height="8" rx="1" />
      ))}
      <g className="flow-glow" data-nodraw fill="currentColor" stroke="none" fillOpacity="0.45">
        {[
          [30, 30],
          [44, 46],
          [30, 62],
          [70, 44],
          [84, 60],
        ].map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="8" height="8" rx="1" />
        ))}
      </g>
    </svg>
  ),
};

const STEPS = [
  { id: "store", title: "Store", text: "Excess energy from renewable sources." },
  { id: "shift", title: "Shift", text: "Use energy when demand is high." },
  { id: "optimize", title: "Optimize", text: "Reduce energy costs and improve efficiency." },
  { id: "power", title: "Power", text: "Ensure reliable and uninterrupted operations." },
];

const TRAVEL_MS = 2400;

/**
 * What is BESS (light). The four steps' line art draws itself as the row enters, then a spark of
 * energy travels along the connector from STORE to POWER, lighting each step as it passes. Hovering,
 * focusing or tapping a step lifts it and plays its art (the turbine turns, the peak is shaved, the
 * windows light; index.css .flow-step). Each step is a toggle button: a tap plays its art on touch,
 * where there is no hover, and keyboard focus plays it too.
 * The row is also where the page's energy line meets this section (data-energy="flow").
 */
export default function BessFlow() {
  const row = useRef(null);
  const spark = useRef(null);
  const [lit, setLit] = useState(-1);
  const [on, setOn] = useState(null);

  useDrawIn(row, {
    onShow: () => setLit(STEPS.length - 1),
    onEnter: async () => {
      const s = spark.current;
      if (!s || reducedMotion()) return setLit(STEPS.length - 1);
      await sleep(1100); // the art draws first
      // Desktop: the spark runs the connector (steady speed, so it reaches each step as it lights).
      // Below lg there is no connector; the steps still light one after another.
      if (s.offsetParent) {
        const run = s.parentElement.clientWidth;
        s.animate(
          [
            { transform: "translateX(0)", opacity: 0 },
            { opacity: 1, offset: 0.06 },
            { opacity: 1, offset: 0.94 },
            { transform: `translateX(${run}px)`, opacity: 0 },
          ],
          { duration: TRAVEL_MS, easing: "linear", fill: "forwards" }
        );
      }
      for (let i = 0; i < STEPS.length; i++) {
        setLit(i);
        await sleep(TRAVEL_MS / (STEPS.length - 1));
      }
    },
  });

  return (
    <section aria-labelledby="home2-bess" className="bg-paper py-20 text-ink lg:py-28">
      <div className="container-site">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
          <SectionHead id="home2-bess" eyebrow="Building a more resilient tomorrow" title="What is a Battery Energy Storage System?" />
          <div>
            <p className="max-w-xl text-lg leading-relaxed text-graphite">
              A Battery Energy Storage System (BESS) stores electricity and makes it available when needed. It helps balance demand, integrate renewable
              energy and provide reliable backup power.
            </p>
            <PillLink to="/solutions" arrow className="mt-6">
              Learn More<span className="sr-only"> about battery energy storage</span>
            </PillLink>
          </div>
        </div>

        <div ref={row} className="relative mt-14 lg:mt-20">
          {/* Connector (desktop): a rail through the four illustrations, and the spark that travels it. */}
          <div aria-hidden="true" className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-[4.75rem] hidden lg:block">
            <svg className="absolute inset-x-0 top-0 h-px w-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 1" fill="none">
              <line x1="0" y1="0.5" x2="100" y2="0.5" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" vectorEffect="non-scaling-stroke" className="text-sage/40" data-nodraw />
            </svg>
            <span
              ref={spark}
              className="absolute -top-[5px] left-0 block h-[11px] w-[11px] rounded-full bg-signal opacity-0 shadow-[0_0_14px_4px_rgba(144,217,136,0.7)]"
            />
            <span data-energy="flow" className="absolute -top-px right-0 block h-px w-px" />
          </div>

          <ol className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.id}>
                <button
                  type="button"
                  aria-pressed={on === s.id}
                  onClick={() => setOn((v) => (v === s.id ? null : s.id))}
                  data-on={on === s.id}
                  data-lit={lit >= i}
                  className="flow-step group flex h-full w-full flex-col items-center rounded-2xl border border-line bg-white px-6 pb-7 pt-6 text-center transition-[translate,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_18px_40px_-20px_rgba(7,26,23,0.35)] focus-visible:-translate-y-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal data-[on=true]:-translate-y-1.5 data-[lit=true]:border-signal/60 motion-reduce:transition-none"
                >
                  <span className="relative block h-[6.5rem] w-[8.5rem] text-forest transition-colors duration-500 group-data-[lit=true]:text-[#2f7d3a]">
                    <span aria-hidden="true" className={`absolute inset-0 ${s.id === "optimize" ? "flow-optimize" : ""}`}>
                      {ART[s.id]}
                    </span>
                  </span>
                  <span className="mt-4 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-forest">
                    <span aria-hidden="true" className="text-xs font-semibold tabular-nums text-sage">
                      0{i + 1}
                    </span>
                    {s.title}
                  </span>
                  <span className="mt-2 block text-[0.95rem] leading-relaxed text-graphite">{s.text}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
