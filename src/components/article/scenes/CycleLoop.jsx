import { useRef } from "react";
import { useSceneMotion } from "./useScene";

const DOTS = 24; // marks around the ring: one more lights with each full cycle (no figures shown)
const R = 104; // ring radius
const CX = 200;
const CY = 150;

/**
 * "How long does an LFP battery last?": what a cycle is. A battery charges (fills, "Charge") and
 * discharges (empties, "Discharge") on a loop; each full cycle lights one more mark on the ring around
 * it — a counter that ticks up without showing any number (the article gives the figures, per
 * product). The loop runs only while the scene is active and on screen. Final state: the battery half
 * full, every mark lit.
 */
export default function CycleLoop({ active, motion }) {
  const root = useRef(null);
  useSceneMotion(root, motion, active, ({ gsap }, el) => {
    const fill = el.querySelector("[data-level]");
    const dots = [...el.querySelectorAll("[data-dot]")];
    const charge = el.querySelector("[data-charge]");
    const discharge = el.querySelector("[data-discharge]");
    let n = 0;
    gsap.set(dots, { opacity: 0.18 });
    gsap.set(fill, { scaleY: 0, transformOrigin: "50% 100%" });
    const tl = gsap.timeline({
      repeat: -1,
      onRepeat: () => {
        // A full cycle done: the next mark lights; after a full ring, they all reset.
        if (n === DOTS) {
          gsap.to(dots, { opacity: 0.18, duration: 0.3 });
          n = 0;
        }
        gsap.to(dots[n++], { opacity: 1, duration: 0.25 });
      },
    });
    tl.set([charge, discharge], { opacity: 0.35 })
      .to(charge, { opacity: 1, duration: 0.2 })
      .to(fill, { scaleY: 1, duration: 0.85, ease: "power1.inOut" }, "<")
      .to(charge, { opacity: 0.35, duration: 0.2 })
      .to(discharge, { opacity: 1, duration: 0.2 }, "<")
      .to(fill, { scaleY: 0, duration: 0.85, ease: "power1.inOut" }, "<");
    return tl;
  });

  return (
    <div ref={root} className="flex h-full items-center justify-center px-4">
      <svg role="img" aria-label="A battery charging and discharging in a loop; each full charge and discharge is one cycle, marked on the ring around it" viewBox="0 0 400 300" className="h-full max-h-full w-full">
        {/* the ring of cycle marks */}
        {Array.from({ length: DOTS }, (_, i) => {
          const a = (i / DOTS) * Math.PI * 2 - Math.PI / 2;
          return <circle key={i} data-dot cx={CX + R * Math.cos(a)} cy={CY + R * Math.sin(a)} r="4.5" fill="#90D988" />;
        })}
        {/* the battery */}
        <rect x={CX - 14} y={CY - 70} width="28" height="10" rx="3" fill="none" stroke="#F4F7F4" strokeOpacity="0.7" strokeWidth="2" />
        <rect x={CX - 38} y={CY - 60} width="76" height="128" rx="12" fill="none" stroke="#F4F7F4" strokeOpacity="0.8" strokeWidth="2.2" />
        <rect data-level x={CX - 30} y={CY - 52} width="60" height="112" rx="7" fill="#90D988" fillOpacity="0.85" style={{ transform: "scaleY(0.5)", transformOrigin: "50% 100%", transformBox: "fill-box" }} />
        {/* charge / discharge */}
        <g data-charge>
          <path d={`M${CX - 70} ${CY + 6} v-28 m-7 7 l7 -7 l7 7`} fill="none" stroke="#90D988" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <text x={CX - 70} y={CY + 26} textAnchor="middle" className="fill-white text-[11px] font-semibold uppercase tracking-[0.14em]">
            Charge
          </text>
        </g>
        <g data-discharge>
          <path d={`M${CX + 70} ${CY - 22} v28 m-7 -7 l7 7 l7 -7`} fill="none" stroke="#F4F7F4" strokeOpacity="0.85" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <text x={CX + 70} y={CY + 26} textAnchor="middle" className="fill-white text-[11px] font-semibold uppercase tracking-[0.14em]">
            Discharge
          </text>
        </g>
        <text x={CX} y={CY + R + 32} textAnchor="middle" className="fill-white/70 text-[11px] font-semibold uppercase tracking-[0.2em]">
          A cycle: one full charge and discharge
        </text>
      </svg>
    </div>
  );
}
