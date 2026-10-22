import { useEffect, useRef, useState } from "react";
import { useSceneMotion } from "./useScene";
import { DUR, EASE } from "../../../lib/tokens";

// Inside out: the cell, then the layers the text lists around it, and the installation under it all.
const LAYERS = [
  { label: "Cell", w: 70, h: 52 },
  { label: "BMS", w: 124, h: 96 },
  { label: "Cooling", w: 178, h: 140 },
  { label: "Fire protection", w: 232, h: 184 },
];
const CX = 136;
const CY = 128;
const LABEL_Y = [134, 92, 70, 48]; // label rows on the right

/**
 * "Is LFP safer than NMC for indoor installation?": safety as a system. The cell sits at the centre;
 * as each point is read, the next layer builds around it — BMS, cooling, fire protection — and the
 * last point sets the whole on its installation base (phones: the layers build in turn while in
 * view). Arrival: the cell draws in. Final state: every layer and the base shown.
 */
export default function SafetyLayers({ active, motion, mode, step }) {
  const root = useRef(null);
  const [tour, setTour] = useState(-1);
  useEffect(() => {
    if (mode !== "inline" || !motion || !active) return;
    let i = -1;
    setTour(-1);
    const t = setInterval(() => setTour((i = i >= 3 ? -1 : i + 1)), 1200);
    return () => clearInterval(t);
  }, [mode, motion, active]);

  useSceneMotion(root, motion, active, ({ gsap }, el) =>
    gsap.timeline().from(el.querySelectorAll("[data-core]"), { drawSVG: "0%", duration: DUR.slow, ease: EASE.inOut }).from(el.querySelectorAll("[data-core-label]"), { opacity: 0, duration: DUR.base }, 0.5)
  );

  // Points read so far: -1 the cell only, 0 + BMS, 1 + cooling, 2 + fire protection, 3 + installation.
  const read = !motion ? 3 : mode === "inline" ? tour : step;
  const shown = (i) => i === 0 || i - 1 <= read;
  const base = read >= 3;
  return (
    <div ref={root} className="flex h-full items-center justify-center px-3">
      <svg
        role="img"
        aria-label={`Safety as a system: the cell, then a BMS, cooling and fire protection around it, on a correct installation${motion && read < 3 ? `. Shown so far: ${LAYERS.filter((_, i) => shown(i)).map((l) => l.label).join(", ")}` : ""}`}
        viewBox="0 0 400 300"
        className="h-full max-h-full w-full"
      >
        {[...LAYERS].reverse().map((l) => {
          const i = LAYERS.indexOf(l);
          const on = shown(i);
          const latest = motion && i > 0 && i - 1 === read;
          return (
            <g
              key={l.label}
              className="transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none"
              style={{ opacity: on ? 1 : 0, transform: on ? "none" : "scale(0.94)", transformOrigin: `${CX}px ${CY}px` }}
            >
              <rect
                data-core={i === 0 || undefined}
                x={CX - l.w / 2}
                y={CY - l.h / 2}
                width={l.w}
                height={l.h}
                rx={i === 0 ? 8 : 14}
                fill={i === 0 ? "#90D988" : "none"}
                fillOpacity={i === 0 ? 0.18 : 0}
                stroke={latest || i === 0 ? "#90D988" : "#F4F7F4"}
                strokeOpacity={latest || i === 0 ? 0.95 : 0.45}
                strokeWidth="2"
                strokeDasharray={i === 3 ? "6 5" : undefined}
              />
              <line x1={CX + l.w / 2} y1={LABEL_Y[i] - 4} x2="280" y2={LABEL_Y[i] - 4} stroke="#F4F7F4" strokeOpacity="0.3" strokeWidth="1" />
              <text data-core-label={i === 0 || undefined} x="286" y={LABEL_Y[i]} className={`text-[13px] font-semibold ${latest || i === 0 ? "fill-signal" : "fill-white/85"}`}>
                {l.label}
              </text>
            </g>
          );
        })}
        {/* the installation: the base everything stands on */}
        <g className="transition-opacity duration-500 motion-reduce:transition-none" style={{ opacity: base ? 1 : 0 }}>
          <line x1={CX - 124} y1={CY + 110} x2={CX + 124} y2={CY + 110} stroke={motion && read === 3 ? "#90D988" : "#F4F7F4"} strokeOpacity="0.8" strokeWidth="3" strokeLinecap="round" />
          {Array.from({ length: 9 }, (_, k) => (
            <line key={k} x1={CX - 112 + k * 28} y1={CY + 112} x2={CX - 122 + k * 28} y2={CY + 122} stroke="#F4F7F4" strokeOpacity="0.35" strokeWidth="1.4" />
          ))}
          <text x={CX} y={CY + 142} textAnchor="middle" className={`text-[12px] font-semibold uppercase tracking-[0.16em] ${motion && read === 3 ? "fill-signal" : "fill-white/75"}`}>
            Correct installation
          </text>
        </g>
      </svg>
    </div>
  );
}
