import { useEffect, useRef, useState } from "react";
import { useSceneMotion } from "./useScene";

const GREEN = "#90D988";
const LINE = "#F4F7F4";
// The article's six safety features, in its order, and where each label row sits (y).
const PARTS = ["BMS", "Thermal management", "Fire detection and suppression", "Safe cell chemistry (LFP)", "Explosion protection and ventilation", "Emergency stop"];
const LABEL_Y = [176, 112, 64, 236, 36, 150];
// Their short labels in the drawing (the full names are in its description).
const SHORT = ["BMS", "Thermal management", "Fire detection", "Safe cells (LFP)", "Venting", "Emergency stop"];

/**
 * "Safety features to look for in a BESS": a storage cabinet in line art with the six features the
 * article lists — BMS, thermal management, fire detection and suppression, safe cells, explosion
 * protection and ventilation, emergency stop. As each is read, its part lights green and its label
 * comes forward (phones: in turn while in view). Arrival: the line art draws in. Final state: every
 * part and label shown.
 */
export default function SafetyCabinet({ active, motion, mode, step }) {
  const root = useRef(null);
  const [tour, setTour] = useState(-1);
  useEffect(() => {
    if (mode !== "inline" || !motion || !active) return;
    let i = 0;
    setTour(0);
    const t = setInterval(() => setTour((i = (i + 1) % PARTS.length)), 1500);
    return () => clearInterval(t);
  }, [mode, motion, active]);
  useSceneMotion(root, motion, active, ({ gsap }, el) =>
    gsap
      .timeline()
      .from(el.querySelectorAll("[data-draw]"), { drawSVG: "0%", duration: 0.9, stagger: 0.04, ease: "power2.inOut" })
      .from(el.querySelectorAll("[data-label]"), { opacity: 0, x: 10, duration: 0.35, stagger: 0.05, clearProps: "opacity,transform" }, 0.5)
  );

  const lit = mode === "inline" ? tour : step;
  const any = motion && lit >= 0;
  const state = (i) => (!any ? "idle" : i === lit ? "on" : "off");
  const part = (i) => ({
    stroke: state(i) === "on" ? GREEN : LINE,
    strokeOpacity: state(i) === "off" ? 0.35 : 0.9,
    className: "transition-[stroke,stroke-opacity] duration-500 motion-reduce:transition-none",
    style: { filter: state(i) === "on" ? "drop-shadow(0 0 6px rgba(144,217,136,0.6))" : "none" },
  });

  return (
    <div ref={root} className="flex h-full items-center justify-center px-3">
      <svg
        role="img"
        aria-label={`A battery storage cabinet and six safety features: ${PARTS.join(", ")}${any ? `. Highlighted: ${PARTS[lit]}` : ""}`}
        viewBox="0 0 400 300"
        className="h-full max-h-full w-full"
      >
        {/* cabinet */}
        <rect data-draw x="34" y="44" width="170" height="236" rx="10" fill="none" stroke={LINE} strokeOpacity="0.55" strokeWidth="2" />
        {/* 4 explosion protection and ventilation: a vent on the roof */}
        <g {...part(4)}>
          <path data-draw d="M90 44 v-12 h56 v12" fill="none" strokeWidth="2" />
          <path d="M98 38 h40" strokeWidth="1.4" strokeDasharray="4 3" />
        </g>
        {/* 2 fire detection and suppression: a detector and a nozzle */}
        <g {...part(2)}>
          <circle data-draw cx="64" cy="64" r="8" fill="none" strokeWidth="2" />
          <path data-draw d="M150 56 h22 v8 h-6 v6 h-10 v-6 h-6 z" fill="none" strokeWidth="2" strokeLinejoin="round" />
          <path d="M156 76 l-5 9 M161 77 v10 M166 76 l5 9" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="3 3" />
        </g>
        {/* 1 thermal management: a fan */}
        <g {...part(1)}>
          <circle data-draw cx="80" cy="114" r="20" fill="none" strokeWidth="2" />
          {[0, 120, 240].map((a) => (
            <path key={a} d="M80 114 q9 -12 0 -17" transform={`rotate(${a} 80 114)`} fill="none" strokeWidth="2" strokeLinecap="round" />
          ))}
        </g>
        {/* 0 BMS: a board */}
        <g {...part(0)}>
          <rect data-draw x="52" y="162" width="70" height="28" rx="4" fill="none" strokeWidth="2" />
          {[64, 78, 92, 106].map((x) => (
            <circle key={x} cx={x} cy="176" r="3" fill="none" strokeWidth="1.6" />
          ))}
        </g>
        {/* 5 emergency stop: a button on the door */}
        <g {...part(5)}>
          <circle data-draw cx="172" cy="150" r="11" fill="none" strokeWidth="2.2" />
          <circle cx="172" cy="150" r="5" fill={state(5) === "on" ? "#E8604C" : "none"} strokeWidth="1.6" />
        </g>
        {/* 3 safe cell chemistry: LFP modules */}
        <g {...part(3)}>
          {[0, 1, 2].map((r) => (
            <rect key={r} data-draw x="52" y={204 + r * 24} width="134" height="18" rx="3" fill="none" strokeWidth="2" />
          ))}
          <text x="119" y="241" textAnchor="middle" stroke="none" className={`text-[10px] font-semibold ${state(3) === "on" ? "fill-signal" : "fill-white/60"}`}>
            LFP
          </text>
        </g>
        {/* labels, right */}
        {PARTS.map((p, i) => (
          <g key={p} data-label opacity={state(i) === "off" ? 0.4 : 1}>
            <line x1="214" y1={LABEL_Y[i] - 4} x2="226" y2={LABEL_Y[i] - 4} stroke={state(i) === "on" ? GREEN : LINE} strokeOpacity="0.6" strokeWidth="1.5" />
            <text x="232" y={LABEL_Y[i]} className={`text-[11px] font-semibold ${state(i) === "on" ? "fill-signal" : "fill-white/85"}`}>
              {SHORT[i]}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
