import { useEffect, useRef, useState } from "react";
import { useSceneMotion } from "./useScene";
import { DUR, EASE, STAGGER } from "../../../lib/tokens";

const GREEN = "#90D988";
const RED = "#E8604C";
const LINE = "#F4F7F4";

/**
 * "The CEA safety rules for BESS": a battery container whose safety elements appear one by one as the
 * rules are read — a detector, fire suppression, a vent, a fence (spacing), an emergency stop (phones:
 * in turn while in view). Arrival: the container draws in. Final state: every element shown.
 */
export default function CeaContainer({ active, motion, mode, step }) {
  const root = useRef(null);
  const [tour, setTour] = useState(-1);
  useEffect(() => {
    if (mode !== "inline" || !motion || !active) return;
    let i = -1;
    setTour(-1);
    const t = setInterval(() => setTour((i = i >= 4 ? -1 : i + 1)), 1100);
    return () => clearInterval(t);
  }, [mode, motion, active]);
  useSceneMotion(root, motion, active, ({ gsap }, el) =>
    gsap.timeline().from(el.querySelectorAll("[data-draw]"), { drawSVG: "0%", duration: DUR.slow, stagger: STAGGER, ease: EASE.inOut })
  );

  // How many elements are shown: every one without motion; otherwise one per rule read.
  const shown = !motion ? 4 : mode === "inline" ? tour : step;
  const el = (i) => ({
    className: "transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none",
    style: { opacity: i <= shown ? 1 : 0, transform: i <= shown ? "none" : "translateY(6px)" },
  });
  const latest = (i) => motion && i === shown;
  const label = (i, x, y, text, anchor = "start") => (
    <text x={x} y={y} textAnchor={anchor} className={`text-[11px] font-semibold ${latest(i) ? "fill-signal" : "fill-white/80"}`}>
      {text}
    </text>
  );

  return (
    <div ref={root} className="flex h-full items-center justify-center px-3">
      <svg role="img" aria-label="A battery container with its safety elements: a detector, fire suppression, a vent, a fence for spacing and an emergency stop." viewBox="0 0 400 300" className="h-full max-h-full w-full">
        {/* the container */}
        <rect data-draw x="96" y="108" width="208" height="112" rx="6" fill="#071A17" stroke={LINE} strokeOpacity="0.8" strokeWidth="2.2" />
        {Array.from({ length: 12 }, (_, k) => (
          <line key={k} data-draw x1={112 + k * 16} y1="118" x2={112 + k * 16} y2="210" stroke={LINE} strokeOpacity="0.18" strokeWidth="1.5" />
        ))}
        <line data-draw x1="70" y1="226" x2="330" y2="226" stroke={LINE} strokeOpacity="0.4" strokeWidth="2" />

        {/* 0 detector (on the roof) */}
        <g {...el(0)}>
          <rect x="140" y="96" width="22" height="12" rx="3" fill="none" stroke={GREEN} strokeWidth="2" />
          <circle cx="151" cy="102" r="2.5" fill={GREEN} />
          <path d="M140 92 q11 -10 22 0" fill="none" stroke={GREEN} strokeWidth="1.5" strokeLinecap="round" />
          {label(0, 151, 78, "Detector", "middle")}
        </g>
        {/* 1 suppression (nozzles inside) */}
        <g {...el(1)}>
          <path d="M196 120 v10 M234 120 v10" stroke={GREEN} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M190 138 l6 -8 l6 8 M228 138 l6 -8 l6 8" fill="none" stroke={GREEN} strokeWidth="1.6" strokeLinecap="round" strokeDasharray="2 3" />
          {label(1, 215, 160, "Suppression", "middle")}
        </g>
        {/* 2 vent (on the side) */}
        <g {...el(2)}>
          <rect x="270" y="126" width="22" height="30" rx="2" fill="none" stroke={GREEN} strokeWidth="2" />
          <path d="M274 134 h14 M274 141 h14 M274 148 h14" stroke={GREEN} strokeWidth="1.4" />
          {label(2, 312, 136, "Vent")}
        </g>
        {/* 3 fence (spacing) */}
        <g {...el(3)}>
          {Array.from({ length: 9 }, (_, k) => (
            <line key={k} x1={58 + k * 36} y1="246" x2={58 + k * 36} y2="268" stroke={GREEN} strokeOpacity="0.8" strokeWidth="2" />
          ))}
          <line x1="58" y1="252" x2="346" y2="252" stroke={GREEN} strokeOpacity="0.8" strokeWidth="1.6" />
          <line x1="58" y1="262" x2="346" y2="262" stroke={GREEN} strokeOpacity="0.8" strokeWidth="1.6" />
          {label(3, 200, 290, "Fence and spacing", "middle")}
        </g>
        {/* 4 emergency stop (by the door) */}
        <g {...el(4)}>
          <rect x="108" y="176" width="26" height="26" rx="4" fill="#F2C46D" fillOpacity="0.9" />
          <circle cx="121" cy="189" r="8" fill={RED} />
          {label(4, 16, 92, "Emergency stop")}
          <path d="M60 98 L112 176" stroke={LINE} strokeOpacity="0.4" strokeWidth="1.2" />
        </g>
      </svg>
    </div>
  );
}
