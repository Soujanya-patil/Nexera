import { useEffect, useId, useRef, useState } from "react";
import { useSceneMotion } from "./useScene";

// C-rate: the two values the article gives, and nothing else.
const RATES = [
  { c: "0.5C", time: "about 2 hours", seconds: 2 },
  { c: "1C", time: "about 1 hour", seconds: 1 },
];
const ICONS = ["Depth of discharge", "Cycle life", "Round-trip efficiency"];

/**
 * "Key terms, explained simply": kW vs kWh as a water tank — the tank's size is the energy (kWh), the
 * tap's flow is the power (kW); a C-rate slider (0.5C ↔ 1C) whose battery bar empties in "about 2
 * hours" or "about 1 hour" (time compressed); simple animated icons for depth of discharge, cycle
 * life and round-trip efficiency (no numbers). Each Key term, as it is read, brings its part forward.
 * The loops are CSS, running only while the scene is active (data-run); the arrival is GSAP.
 */
export default function KeyTerms({ active, motion, mode, step }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const root = useRef(null);
  const [rate, setRate] = useState(0);
  const [tour, setTour] = useState(-1);
  useEffect(() => {
    if (mode !== "inline" || !motion || !active) return;
    let i = 0;
    setTour(0);
    const t = setInterval(() => setTour((i = (i + 1) % 6)), 1800);
    return () => clearInterval(t);
  }, [mode, motion, active]);

  useSceneMotion(root, motion, active, ({ gsap }, el) =>
    gsap.timeline().from(el.querySelectorAll("[data-in]"), { opacity: 0, y: 12, duration: 0.45, stagger: 0.1, ease: "power2.out" })
  );

  const lit = mode === "inline" ? tour : step;
  const focus = (i) => (!motion || lit < 0 ? "" : lit === i ? "is-on" : "is-off");
  const r = RATES[rate];

  return (
    <div
      ref={root}
      data-run={motion && active ? "on" : undefined}
      style={{ "--drain": `${r.seconds}s` }}
      className={`article-terms flex h-full flex-col justify-center gap-3 px-5 ${mode === "inline" ? "py-3" : "py-6"}`}
    >
      {/* kW vs kWh */}
      <svg
        data-in
        role="img"
        aria-label="kW and kWh as water: the tank's size is the energy capacity (kWh), how much in total; the tap's flow is the power (kW), how much at once"
        viewBox="0 0 400 150"
        className="h-auto w-full"
      >
        <g className={`article-term ${focus(1)}`}>
          <path d="M20 22 H215 V34" fill="none" stroke="#F4F7F4" strokeOpacity="0.7" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="92" cy="22" r="8" fill="#071A17" stroke="#90D988" strokeWidth="2.4" />
          <line className="article-stream" x1="215" y1="38" x2="215" y2="96" stroke="#90D988" strokeWidth="5" strokeLinecap="round" strokeDasharray="6 7" />
          <text x="16" y="58" className="fill-white/85 text-[12px] font-semibold">
            kW: how much at once
          </text>
        </g>
        <g className={`article-term ${focus(0)}`}>
          <rect x="170" y="50" width="190" height="92" rx="8" fill="none" stroke="#F4F7F4" strokeOpacity="0.7" strokeWidth="2.4" />
          <rect className="article-water" x="174" y="74" width="182" height="64" rx="5" fill="#90D988" fillOpacity="0.85" style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }} />
          <text x="16" y="128" className="fill-white/85 text-[12px] font-semibold">
            kWh: how much in total
          </text>
        </g>
      </svg>

      {/* C-rate */}
      {/* data-in on a wrapper: the panel itself carries a CSS opacity transition (its highlight) */}
      <div data-in>
      <div className={`article-term rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 ${focus(2)}`}>
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor={`${uid}-rate`} className="text-sm font-semibold text-white">
            C-rate
          </label>
          <output htmlFor={`${uid}-rate`} aria-live="polite" className="text-sm text-signal">
            {r.c}: {r.time}
          </output>
        </div>
        <input
          id={`${uid}-rate`}
          type="range"
          min="0"
          max="1"
          step="1"
          value={rate}
          onChange={(e) => setRate(Number(e.target.value))}
          aria-valuetext={`${r.c}, ${r.time}`}
          className="article-range mt-1 block h-11 w-full cursor-pointer"
        />
        <div aria-hidden="true" className="-mt-1 flex justify-between text-[11px] text-white/60">
          <span>0.5C</span>
          <span>1C</span>
        </div>
        <div aria-hidden="true" className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-white/10">
          <div className="article-drain h-full rounded-full bg-signal" />
        </div>
      </div>
      </div>

      {/* DoD, cycle life, round-trip efficiency */}
      <svg data-in role="img" aria-label="Icons: a gauge for depth of discharge, a loop for cycle life, arrows in and out for round-trip efficiency" viewBox="0 0 400 86" className="h-auto w-full">
        {ICONS.map((label, i) => (
          <g key={label} transform={`translate(${66 + i * 134} 0)`} className={`article-term ${focus(3 + i)}`}>
            {i === 0 && (
              <g fill="none" stroke="#F4F7F4" strokeWidth="2.4" strokeLinecap="round">
                <path d="M-22 40 A22 22 0 0 1 22 40" strokeOpacity="0.7" />
                <line className="article-needle" x1="0" y1="40" x2="0" y2="22" stroke="#90D988" style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }} />
              </g>
            )}
            {i === 1 && (
              <g className="article-loop" fill="none" stroke="#F4F7F4" strokeWidth="2.4" strokeLinecap="round" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
                <path d="M-16 28 A18 18 0 0 1 16 22" strokeOpacity="0.8" />
                <path d="M16 36 A18 18 0 0 1 -16 42" stroke="#90D988" />
                <path d="M12 16 l5 6 -7 2" strokeOpacity="0.8" />
                <path d="M-12 48 l-5 -6 7 -2" stroke="#90D988" />
              </g>
            )}
            {i === 2 && (
              <g fill="none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path className="article-in" d="M-24 24 H4 M-4 16 l8 8 -8 8" stroke="#90D988" />
                <path className="article-out" d="M24 44 H-4 M4 36 l-8 8 8 8" stroke="#F4F7F4" strokeOpacity="0.8" />
              </g>
            )}
            <text y="78" textAnchor="middle" className="fill-white/80 text-[11px] font-medium">
              {label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
