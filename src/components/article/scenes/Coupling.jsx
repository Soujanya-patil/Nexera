import { useRef } from "react";
import { useSceneMotion } from "./useScene";

const DC = "#90D988";
const AC = "#F2C46D";
const LINE = "#F4F7F4";
// Battery positions: under the DC side, then under the AC side.
const SLOT = { dc: 110, ac: 290 };

/**
 * 'What does "coupling" mean?': one line — solar (DC) → inverter → building (AC) — and a battery that
 * slides to the DC side (before the inverter), connects, then slides to the AC side (after it) and
 * connects there, on a loop while the scene is active. Final state (no motion): the battery at each
 * side, labelled DC-coupled and AC-coupled.
 */
export default function Coupling({ active, motion }) {
  const root = useRef(null);
  useSceneMotion(root, motion, active, ({ gsap }, el) => {
    const bat = el.querySelector("[data-bat]");
    const [toDc, toAc] = el.querySelectorAll("[data-tap]");
    const [lDc, lAc] = el.querySelectorAll("[data-slot-label]");
    gsap.set(el.querySelectorAll("[data-static]"), { opacity: 0 });
    gsap.set(bat, { opacity: 1, x: SLOT.dc });
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.4 });
    tl.from(el.querySelectorAll("[data-draw]"), { drawSVG: "0%", duration: 0.7, stagger: 0.05, ease: "power2.inOut" })
      .set([toDc, toAc, lDc, lAc], { opacity: 0 })
      .to(bat, { x: SLOT.dc, duration: 0.5, ease: "power2.out" })
      .to(toDc, { opacity: 1, duration: 0.3 })
      .to(lDc, { opacity: 1, duration: 0.3 }, "<")
      .to({}, { duration: 1.2 })
      .to([toDc, lDc], { opacity: 0, duration: 0.25 })
      .to(bat, { x: SLOT.ac, duration: 0.8, ease: "power2.inOut" })
      .to(toAc, { opacity: 1, duration: 0.3 })
      .to(lAc, { opacity: 1, duration: 0.3 }, "<")
      .to({}, { duration: 1.2 })
      .to([toAc, lAc], { opacity: 0, duration: 0.25 })
      .to(bat, { x: SLOT.dc, duration: 0.8, ease: "power2.inOut" });
    return tl;
  });

  const battery = (x, attrs = {}) => (
    <g transform={`translate(${x} 0)`} {...attrs}>
      <rect x="-26" y="196" width="52" height="34" rx="6" fill="#071A17" stroke={DC} strokeWidth="2" />
      <rect x="-6" y="191" width="12" height="5" rx="1.5" fill={DC} />
      <text x="0" y="217" textAnchor="middle" className="fill-signal text-[10px] font-semibold uppercase tracking-[0.1em]">
        Battery
      </text>
    </g>
  );
  return (
    <div ref={root} className="flex h-full items-center justify-center px-3">
      <svg role="img" aria-label="Solar makes DC, the inverter turns it into AC for the building. The battery can connect on the DC side, before the inverter (DC-coupled), or on the AC side, after it (AC-coupled)." viewBox="0 0 400 300" className="h-full max-h-full w-full">
        {/* the line: solar → inverter → building */}
        <path data-draw d="M64 120 H160" stroke={DC} strokeWidth="3" fill="none" />
        <path data-draw d="M240 120 H336" stroke={AC} strokeWidth="3" fill="none" />
        <text x="110" y="108" textAnchor="middle" className="fill-signal text-[11px] font-semibold uppercase tracking-[0.16em]">
          DC side
        </text>
        <text x="290" y="108" textAnchor="middle" className="text-[11px] font-semibold uppercase tracking-[0.16em]" fill={AC}>
          AC side
        </text>
        {/* solar */}
        <g>
          <path data-draw d="M14 96 L50 96 L60 144 L24 144 Z" fill="none" stroke={LINE} strokeOpacity="0.8" strokeWidth="2" strokeLinejoin="round" />
          <path d="M32 96 L42 144 M19 120 L55 120" stroke={LINE} strokeOpacity="0.5" strokeWidth="1.2" />
          <text x="37" y="166" textAnchor="middle" className="fill-white/85 text-[11px] font-semibold">
            Solar
          </text>
        </g>
        {/* inverter */}
        <g>
          <rect data-draw x="160" y="96" width="80" height="48" rx="8" fill="#071A17" stroke={LINE} strokeOpacity="0.8" strokeWidth="2" />
          <path d="M176 126 h12 M196 122 q6 -10 12 0 t12 0" fill="none" stroke={LINE} strokeOpacity="0.7" strokeWidth="1.6" strokeLinecap="round" />
          <text x="200" y="166" textAnchor="middle" className="fill-white/85 text-[11px] font-semibold">
            Inverter
          </text>
        </g>
        {/* building */}
        <g>
          <path data-draw d="M340 144 V104 L362 90 L384 104 V144 Z" fill="none" stroke={LINE} strokeOpacity="0.8" strokeWidth="2" strokeLinejoin="round" />
          <rect x="356" y="122" width="12" height="22" fill="none" stroke={LINE} strokeOpacity="0.5" strokeWidth="1.2" />
          <text x="362" y="166" textAnchor="middle" className="fill-white/85 text-[11px] font-semibold">
            Building
          </text>
        </g>
        {/* taps from the line down to the battery, one per side */}
        <line data-tap x1={SLOT.dc} y1="122" x2={SLOT.dc} y2="191" stroke={DC} strokeWidth="2.5" strokeDasharray="5 5" />
        <line data-tap x1={SLOT.ac} y1="122" x2={SLOT.ac} y2="191" stroke={AC} strokeWidth="2.5" strokeDasharray="5 5" />
        <text data-slot-label x={SLOT.dc} y="254" textAnchor="middle" className="fill-signal text-[12px] font-semibold">
          DC-coupled
        </text>
        <text data-slot-label x={SLOT.ac} y="254" textAnchor="middle" className="text-[12px] font-semibold" fill={AC}>
          AC-coupled
        </text>
        {/* static: a battery on each side; animated: one battery that moves between them */}
        {battery(SLOT.dc, { "data-static": true })}
        {battery(SLOT.ac, { "data-static": true })}
        <g data-bat opacity="0">
          {battery(0)}
        </g>
      </svg>
    </div>
  );
}
