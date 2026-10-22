import { useRef } from "react";
import { useSceneMotion } from "./useScene";
import { DUR, EASE, STAGGER } from "../../../lib/tokens";

const DC = "#90D988";
const AC = "#F2C46D";
const LINE = "#F4F7F4";

/**
 * "Which is better for an existing solar plant?": the existing plant — solar, its solar inverter, the
 * AC connection to the site — stays exactly as it is, while an AC battery cabinet (with its own PCS)
 * slides in beside it and connects on the AC side. Arrival: the plant draws in, then the cabinet
 * slides in and its connection draws. Final state: the cabinet in place and connected.
 */
export default function ExistingPlant({ active, motion }) {
  const root = useRef(null);
  useSceneMotion(root, motion, active, ({ gsap }, el) =>
    gsap
      .timeline()
      .from(el.querySelectorAll("[data-draw]"), { drawSVG: "0%", duration: DUR.slow, stagger: STAGGER, ease: EASE.inOut })
      .from(el.querySelector("[data-cabinet]"), { x: 140, opacity: 0, duration: DUR.slow, ease: EASE.emphasized }, 0.6)
      .from(el.querySelector("[data-link]"), { drawSVG: "0%", duration: DUR.base, ease: EASE.inOut }, 1.4)
      .from(el.querySelectorAll("[data-new]"), { opacity: 0, duration: DUR.base }, 1.6)
  );

  return (
    <div ref={root} className="flex h-full items-center justify-center px-3">
      <svg role="img" aria-label="An existing solar plant stays as it is; an AC battery cabinet with its own PCS is added beside it and connects on the AC side." viewBox="0 0 400 300" className="h-full max-h-full w-full">
        {/* the existing plant (dimmed: it doesn't change) */}
        <g opacity="0.75">
          {[0, 1, 2].map((i) => (
            <path key={i} data-draw d={`M${16 + i * 40} 70 L${48 + i * 40} 70 L${56 + i * 40} 110 L${24 + i * 40} 110 Z`} fill="none" stroke={LINE} strokeWidth="1.8" strokeLinejoin="round" />
          ))}
          <path data-draw d="M76 110 V146" stroke={DC} strokeWidth="2.5" fill="none" />
          <rect data-draw x="36" y="146" width="80" height="44" rx="8" fill="#071A17" stroke={LINE} strokeWidth="2" />
          <text x="76" y="172" textAnchor="middle" className="fill-white/90 text-[10.5px] font-semibold">
            Solar inverter
          </text>
          <path data-draw d="M116 168 H200" stroke={AC} strokeWidth="2.5" fill="none" />
          <text x="76" y="56" textAnchor="middle" className="fill-white/70 text-[10px] font-semibold uppercase tracking-[0.14em]">
            Existing solar
          </text>
        </g>
        {/* the AC connection to the site */}
        <line data-draw x1="200" y1="120" x2="200" y2="250" stroke={AC} strokeOpacity="0.5" strokeWidth="6" strokeLinecap="round" />
        <text x="208" y="118" className="text-[10px] font-semibold uppercase tracking-[0.14em]" fill={AC}>
          AC side
        </text>
        {/* the new AC battery cabinet with its PCS */}
        <path data-link d="M200 214 H262" stroke={AC} strokeWidth="2.5" fill="none" />
        <g data-cabinet>
          <rect x="262" y="150" width="96" height="120" rx="10" fill="#071A17" stroke={DC} strokeWidth="2.2" />
          <rect x="274" y="164" width="72" height="28" rx="5" fill="none" stroke={DC} strokeOpacity="0.8" strokeWidth="1.5" />
          <text x="310" y="182" textAnchor="middle" className="fill-signal text-[10.5px] font-semibold">
            PCS
          </text>
          {[0, 1, 2].map((i) => (
            <rect key={i} x="274" y={202 + i * 20} width="72" height="14" rx="3" fill="none" stroke={LINE} strokeOpacity="0.6" strokeWidth="1.3" />
          ))}
        </g>
        <text data-new x="310" y="290" textAnchor="middle" className="fill-signal text-[11px] font-semibold">
          AC battery + PCS
        </text>
      </svg>
    </div>
  );
}
