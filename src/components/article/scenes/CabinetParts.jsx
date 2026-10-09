import { useEffect, useRef, useState } from "react";
import { useSceneMotion } from "./useScene";

// The six parts, in the article's order.
const PARTS = [
  { label: "Battery modules" },
  { label: "BMS" },
  { label: "PCS" },
  { label: "EMS" },
  { label: "Thermal management" },
  { label: "Fire protection" },
];
const LABEL_Y = [262, 210, 172, 128, 86, 46]; // label rows on the right, bottom to top

/**
 * "The main parts of a BESS": a cabinet in clean line art (an original drawing, no brand's product)
 * with its six parts — battery modules, BMS, PCS, EMS, thermal management, fire protection. As each
 * point is read (or hovered in the text) its part lights up green, slides out a little and its label
 * comes forward. Arrival: the line art draws itself (DrawSVG). Final state: every part and label shown.
 */
export default function CabinetParts({ active, motion, mode, step, hover }) {
  const root = useRef(null);
  // Phones (inline): the parts take turns on their own while the scene is in view.
  const [tour, setTour] = useState(-1);
  useEffect(() => {
    if (mode !== "inline" || !motion || !active) return;
    let i = 0;
    setTour(0);
    const t = setInterval(() => setTour((i = (i + 1) % PARTS.length)), 1600);
    return () => clearInterval(t);
  }, [mode, motion, active]);

  useSceneMotion(root, motion, active, ({ gsap }, el) => {
    const tl = gsap.timeline();
    tl.from(el.querySelectorAll("[data-draw]"), { drawSVG: "0%", duration: 0.9, stagger: 0.05, ease: "power2.inOut" })
      // the labels' text (their groups carry a CSS opacity transition for the highlight)
      .from(el.querySelectorAll("[data-label] text"), { opacity: 0, x: 10, duration: 0.35, stagger: 0.05 }, 0.5);
    return tl;
  });

  const lit = hover ?? (mode === "inline" ? tour : step);
  const any = motion && lit >= 0;
  const state = (i) => (!any ? "idle" : i === lit ? "on" : "off");

  return (
    <div ref={root} data-run={motion && active ? "on" : undefined} className="flex h-full items-center justify-center px-3">
      <svg
        role="img"
        aria-label={`A battery storage cabinet and its six main parts: battery modules, BMS, PCS, EMS, thermal management and fire protection${
          any ? `. Highlighted: ${PARTS[lit].label}` : ""
        }`}
        viewBox="0 0 400 300"
        className="h-full max-h-full w-full"
      >
        {/* Cabinet */}
        <rect data-draw x="34" y="22" width="180" height="270" rx="10" fill="none" stroke="#F4F7F4" strokeOpacity="0.55" strokeWidth="2" />
        <line data-draw x1="34" y1="96" x2="214" y2="96" stroke="#F4F7F4" strokeOpacity="0.25" strokeWidth="1.5" />
        <line data-draw x1="34" y1="182" x2="214" y2="182" stroke="#F4F7F4" strokeOpacity="0.25" strokeWidth="1.5" />

        {/* 0 Battery modules */}
        <Part i={0} state={state(0)}>
          {[0, 1, 2].map((r) => (
            <g key={r}>
              <rect data-draw x="50" y={196 + r * 30} width="148" height="22" rx="4" fill="none" strokeWidth="2" />
              <line data-draw x1="64" y1={207 + r * 30} x2="184" y2={207 + r * 30} strokeWidth="1.2" strokeDasharray="5 6" />
            </g>
          ))}
        </Part>
        {/* 1 BMS: a small board */}
        <Part i={1} state={state(1)}>
          <rect data-draw x="50" y="140" width="64" height="32" rx="4" fill="none" strokeWidth="2" />
          {[62, 76, 90, 104].map((x) => (
            <circle key={x} cx={x} cy="156" r="3" fill="none" strokeWidth="1.6" />
          ))}
        </Part>
        {/* 2 PCS: a converter box (DC ⇄ AC) */}
        <Part i={2} state={state(2)}>
          <rect data-draw x="124" y="140" width="74" height="32" rx="4" fill="none" strokeWidth="2" />
          <path data-draw d="M133 160 h12 M152 156 q6 -10 12 0 t12 0 t12 0" fill="none" strokeWidth="1.8" strokeLinecap="round" />
        </Part>
        {/* 3 EMS: a controller */}
        <Part i={3} state={state(3)}>
          <rect data-draw x="50" y="104" width="148" height="28" rx="4" fill="none" strokeWidth="2" />
          <rect x="112" y="110" width="24" height="16" rx="2" fill="none" strokeWidth="1.6" />
          {[115, 121, 127, 133].map((x) => (
            <line key={x} x1={x} y1="106" x2={x} y2="110" strokeWidth="1.2" />
          ))}
        </Part>
        {/* 4 Thermal management: a fan */}
        <Part i={4} state={state(4)}>
          <circle data-draw cx="86" cy="60" r="24" fill="none" strokeWidth="2" />
          <g className="article-fan" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
            {[0, 120, 240].map((a) => (
              <path key={a} d="M86 60 q10 -14 0 -20" transform={`rotate(${a} 86 60)`} fill="none" strokeWidth="2" strokeLinecap="round" />
            ))}
          </g>
        </Part>
        {/* 5 Fire protection: a nozzle and spray */}
        <Part i={5} state={state(5)}>
          <path data-draw d="M164 38 h22 v10 h-6 v8 h-10 v-8 h-6 z" fill="none" strokeWidth="2" strokeLinejoin="round" />
          <path d="M168 64 l-6 12 M175 66 v14 M182 64 l6 12" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="3 4" />
        </Part>

        {/* Labels, right */}
        {PARTS.map((p, i) => (
          <g key={p.label} data-label className={`article-part-label transition-opacity duration-300 ${state(i) === "off" ? "opacity-35" : "opacity-100"}`}>
            <line x1="226" y1={LABEL_Y[i] - 4} x2="242" y2={LABEL_Y[i] - 4} stroke={state(i) === "on" ? "#90D988" : "#F4F7F4"} strokeOpacity="0.6" strokeWidth="1.5" />
            <text x="248" y={LABEL_Y[i]} className={`text-[13px] font-semibold ${state(i) === "on" ? "fill-signal" : "fill-white/85"}`}>
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/** One part: green and slid out a little when it is the one being read. */
function Part({ state, children }) {
  return (
    <g
      stroke={state === "on" ? "#90D988" : "#F4F7F4"}
      strokeOpacity={state === "off" ? 0.35 : 0.9}
      className="article-part transition-[transform,stroke,stroke-opacity] duration-500 ease-out motion-reduce:transition-none"
      style={{ transform: state === "on" ? "translateX(10px)" : "none", filter: state === "on" ? "drop-shadow(0 0 6px rgba(144,217,136,0.6))" : "none" }}
    >
      {children}
    </g>
  );
}
