import { useRef } from "react";
import { useSceneMotion } from "./useScene";
import { DUR, EASE, STAGGER } from "../../../lib/tokens";

const GREEN = "var(--color-signal)";
const LINE = "var(--color-paper)";

/**
 * "BIS certification for lithium batteries in India": a lithium cell, and a round "registration" stamp
 * that comes down onto it, presses and settles at a slight angle. Arrival: the cell draws in, then the
 * stamp lands (replays as the reader arrives). Final state: the stamp on the cell.
 */
export default function BisStamp({ active, motion }) {
  const root = useRef(null);
  useSceneMotion(root, motion, active, ({ gsap }, el) => {
    const stamp = el.querySelector("[data-stamp]");
    return gsap
      .timeline()
      .from(el.querySelectorAll("[data-draw]"), { drawSVG: "0%", duration: DUR.slow, stagger: STAGGER, ease: EASE.inOut })
      .from(stamp, { y: -150, scale: 1.4, rotation: -30, opacity: 0, transformOrigin: "50% 50%", duration: DUR.base, ease: EASE.in }, 0.6)
      .to(stamp, { scale: 0.92, duration: DUR.fast, yoyo: true, repeat: 1, transformOrigin: "50% 50%" })
      .from(el.querySelector("[data-ink]"), { opacity: 0, scale: 0.8, transformOrigin: "50% 50%", duration: DUR.base }, "<");
  });

  return (
    <div ref={root} className="flex h-full items-center justify-center px-3">
      <svg role="img" aria-label="A lithium cell with a round BIS registration stamp on it." viewBox="0 0 400 300" className="h-full max-h-full w-full">
        {/* the cell */}
        <rect data-draw x="180" y="62" width="40" height="14" rx="3" fill="none" stroke={LINE} strokeOpacity="0.8" strokeWidth="2" />
        <rect data-draw x="130" y="76" width="140" height="186" rx="16" fill="none" stroke={LINE} strokeOpacity="0.8" strokeWidth="2.2" />
        <path data-draw d="M150 112 h100 M150 226 h100" stroke={LINE} strokeOpacity="0.3" strokeWidth="1.5" />
        <text x="200" y="104" textAnchor="middle" className="fill-white/60 text-[11px] font-semibold uppercase tracking-[0.18em]">
          Lithium cell
        </text>
        {/* the stamp's ink on the cell */}
        <circle data-ink cx="200" cy="170" r="50" fill={GREEN} fillOpacity="0.1" />
        {/* the stamp */}
        <g data-stamp transform="rotate(-12 200 170)">
          <circle cx="200" cy="170" r="50" fill="none" stroke={GREEN} strokeWidth="3" />
          <circle cx="200" cy="170" r="42" fill="none" stroke={GREEN} strokeWidth="1.2" strokeDasharray="3 3" />
          <text x="200" y="168" textAnchor="middle" className="fill-accent text-[22px] font-semibold tracking-[0.08em]">
            BIS
          </text>
          <text x="200" y="188" textAnchor="middle" className="fill-accent text-[8px] font-semibold uppercase tracking-[0.06em]">
            Registration
          </text>
        </g>
      </svg>
    </div>
  );
}
