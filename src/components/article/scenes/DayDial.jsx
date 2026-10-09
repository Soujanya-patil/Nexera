import { useEffect, useRef, useState } from "react";
import { useSceneMotion } from "./useScene";

// The six uses, in the article's order: an icon around the dial for each.
const USES = [
  "Storing solar power and using it after sunset",
  "Backup power during outages",
  "Peak shaving",
  "Shifting energy use to cheaper tariff periods",
  "Integrating more solar and wind into the grid",
  "Supporting grid stability",
];
const CX = 200;
const CY = 150;
const R = 96;
const at = (deg, r = R + 40) => [CX + r * Math.cos(((deg - 90) * Math.PI) / 180), CY + r * Math.sin(((deg - 90) * Math.PI) / 180)];
const ICON_DEG = [-60, -15, 30, 150, 195, 240];

/**
 * "What is a BESS used for?": a 24-hour dial. The sun crosses the day half and sets; at night the
 * battery takes over, and a "power cut" flicker on the home shows the backup holding its lights on.
 * Around the dial, one icon per use; each lights up as its use is read. The day runs as a loop while
 * the scene is active (MotionPath for the sun). Final state: day and night, every icon shown.
 */
export default function DayDial({ active, motion, mode, step }) {
  const root = useRef(null);
  const [tour, setTour] = useState(-1);
  useEffect(() => {
    if (mode !== "inline" || !motion || !active) return;
    let i = 0;
    setTour(0);
    const t = setInterval(() => setTour((i = (i + 1) % USES.length)), 1700);
    return () => clearInterval(t);
  }, [mode, motion, active]);
  const lit = !motion ? -1 : mode === "inline" ? tour : step;

  useSceneMotion(root, motion, active, ({ gsap }, el) => {
    const sun = el.querySelector("[data-sun]");
    const night = el.querySelector("[data-night]");
    const battery = el.querySelector("[data-battery]");
    const windowLight = el.querySelector("[data-window]");
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.4 });
    tl.set(night, { opacity: 0.15 })
      .fromTo(sun, { opacity: 1 }, { motionPath: { path: el.querySelector("[data-arc]"), align: el.querySelector("[data-arc]"), alignOrigin: [0.5, 0.5] }, duration: 4, ease: "none" }, 0)
      .to(sun, { opacity: 0, duration: 0.4 }, 3.7)
      .to(night, { opacity: 0.85, duration: 0.8 }, 3.6)
      .to(battery, { opacity: 1, scale: 1.08, duration: 0.5, transformOrigin: "50% 50%" }, 4)
      // the power cut: the lights flicker, then the backup holds them on
      .to(windowLight, { opacity: 0.15, duration: 0.08, repeat: 3, yoyo: true }, 4.6)
      .to(windowLight, { opacity: 1, duration: 0.2 }, 5.1)
      .to(battery, { scale: 1, duration: 0.6 }, 6.2)
      .to(night, { opacity: 0.15, duration: 0.8 }, 6.6)
      .to(battery, { opacity: 0.55, duration: 0.6 }, 6.6);
    return tl;
  });

  return (
    <div ref={root} className="flex h-full flex-col items-center justify-center gap-2 px-3">
      <svg
        role="img"
        aria-label={`A 24-hour day: solar by day, the battery at night and during a power cut. Uses: ${USES.join("; ")}${lit >= 0 ? `. Now: ${USES[lit]}` : ""}`}
        viewBox="0 0 400 300"
        className="h-auto max-h-[86%] w-full"
      >
        {/* Day (top) and night (bottom) halves */}
        <path d={`M${CX - R} ${CY} A${R} ${R} 0 0 1 ${CX + R} ${CY} Z`} fill="rgba(144,217,136,0.10)" />
        <path data-night d={`M${CX - R} ${CY} A${R} ${R} 0 0 0 ${CX + R} ${CY} Z`} fill="#020b09" opacity="0.6" />
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#F4F7F4" strokeOpacity="0.4" strokeWidth="2" />
        <line x1={CX - R - 10} y1={CY} x2={CX + R + 10} y2={CY} stroke="#F4F7F4" strokeOpacity="0.3" strokeWidth="1.5" strokeDasharray="4 5" />
        {/* The sun's path (day half) and the sun */}
        <path data-arc d={`M${CX - R + 14} ${CY - 4} A${R - 14} ${R - 14} 0 0 1 ${CX + R - 14} ${CY - 4}`} fill="none" stroke="none" />
        <g data-sun transform={`translate(${CX} ${CY - R + 14})`}>
          <circle r="11" fill="#F7D774" />
        </g>
        {/* The home, its window lit, and the battery beside it */}
        <path d={`M${CX - 36} ${CY + 46} v-26 l18 -14 l18 14 v26 z`} fill="none" stroke="#F4F7F4" strokeWidth="2" strokeLinejoin="round" />
        <rect data-window x={CX - 24} y={CY + 26} width="12" height="10" rx="1.5" fill="#F7D774" />
        <g data-battery opacity={motion ? 0.55 : 1}>
          <rect x={CX + 10} y={CY + 16} width="24" height="32" rx="4" fill="none" stroke="#90D988" strokeWidth="2.2" />
          <rect x={CX + 17} y={CY + 12} width="10" height="4" rx="1" fill="#90D988" />
          <rect x={CX + 14} y={CY + 30} width="16" height="14" rx="2" fill="#90D988" />
        </g>
        {/* The six uses */}
        {USES.map((u, i) => {
          const [x, y] = at(ICON_DEG[i]);
          const on = lit === i;
          return (
            <g key={u} transform={`translate(${x} ${y})`} className="transition-opacity duration-300" opacity={lit < 0 || on ? 1 : 0.4}>
              <circle r="17" fill={on ? "rgba(144,217,136,0.22)" : "rgba(255,255,255,0.06)"} stroke={on ? "#90D988" : "#F4F7F4"} strokeOpacity={on ? 1 : 0.4} strokeWidth="1.6" />
              <UseIcon i={i} on={on} />
            </g>
          );
        })}
      </svg>
      <p aria-hidden="true" className="min-h-[2.5em] max-w-[18rem] text-center text-xs leading-snug text-white/80">
        {lit >= 0 ? USES[lit] : "Day and night, through the year"}
      </p>
    </div>
  );
}

function UseIcon({ i, on }) {
  const s = { fill: "none", stroke: on ? "#90D988" : "#F4F7F4", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (i) {
    case 0: // sun to moon
      return <path {...s} d="M-8 2 a5 5 0 1 1 6 -6 M3 -2 a6 6 0 1 0 6 8 a5 5 0 0 1 -6 -8" />;
    case 1: // plug
      return <path {...s} d="M-4 -9 v5 M4 -9 v5 M-7 -4 h14 v4 a7 7 0 0 1 -14 0 z M0 7 v4" />;
    case 2: // a peak, shaved
      return <path {...s} d="M-10 8 L-5 0 L-1 3 L3 -6 L10 8 M-8 -3 H8" strokeDasharray={undefined} />;
    case 3: // clock
      return <path {...s} d="M0 -9 a9 9 0 1 0 0.01 0 M0 -4 V0 L4 3" />;
    case 4: // wind turbine
      return <path {...s} d="M0 -1 V10 M0 -1 L-8 -6 M0 -1 L8 -6 M0 -1 L0 -10" />;
    default: // a steady wave (grid stability)
      return <path {...s} d="M-10 0 q2.5 -6 5 0 t5 0 t5 0 t5 0" />;
  }
}
