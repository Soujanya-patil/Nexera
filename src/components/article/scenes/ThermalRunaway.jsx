import { useRef } from "react";
import { useSceneMotion } from "./useScene";

const COOL = "#90D988";
const HOT = "#F28C38";
const LINE = "#F4F7F4";
const CELLS = [0, 1, 2, 3, 4];
const HOT_CELL = 2;
const X0 = 46; // first cell's left edge
const STEP = 66; // cell pitch
const W = 46; // cell width

/**
 * "Why BESS safety matters": a row of cells. The middle one heats up (an orange glow), the BMS ring
 * finds it, and a barrier closes on each side of it, so its neighbours stay cool — detected early,
 * isolated, contained. Loops while the scene is active. Final state (no motion): the hot cell ringed
 * and walled off, the others green.
 */
export default function ThermalRunaway({ active, motion }) {
  const root = useRef(null);
  useSceneMotion(root, motion, active, ({ gsap }, el) => {
    const hot = el.querySelector("[data-hot]");
    const glow = el.querySelector("[data-glow]");
    const ring = el.querySelector("[data-ring]");
    const walls = el.querySelectorAll("[data-wall]");
    const labels = el.querySelectorAll("[data-say]");
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.6 });
    tl.set(hot, { attr: { fill: COOL, "fill-opacity": 0.18, stroke: COOL } })
      .set(glow, { opacity: 0, scale: 0.6, transformOrigin: "50% 50%" })
      .set(ring, { drawSVG: "0%", opacity: 1 })
      .set(walls, { scaleY: 0, transformOrigin: "50% 0%" })
      .set(labels, { opacity: 0.25 })
      .to(hot, { attr: { fill: HOT, "fill-opacity": 0.45, stroke: HOT }, duration: 0.9, ease: "power2.in" }, 0.4)
      .to(glow, { opacity: 0.9, scale: 1.15, duration: 0.9, ease: "power2.in" }, 0.4)
      .to(labels[0], { opacity: 1, duration: 0.3 }, 0.9)
      .to(ring, { drawSVG: "100%", duration: 0.6, ease: "power2.inOut" }, 1.4)
      .to(labels[1], { opacity: 1, duration: 0.3 }, 1.7)
      .to(walls, { scaleY: 1, duration: 0.5, ease: "power3.out", stagger: 0.08 }, 2.1)
      .to(labels[2], { opacity: 1, duration: 0.3 }, 2.4)
      .to({}, { duration: 1.6 });
    return tl;
  });

  const cx = X0 + HOT_CELL * STEP + W / 2;
  return (
    <div ref={root} className="flex h-full items-center justify-center px-3">
      <svg role="img" aria-label="A row of battery cells: one overheats; the BMS detects it early and barriers isolate it, so the cells next to it stay cool." viewBox="0 0 400 300" className="h-full max-h-full w-full">
        <defs>
          <radialGradient id="tr-glow">
            <stop offset="0" stopColor={HOT} stopOpacity="0.7" />
            <stop offset="1" stopColor={HOT} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle data-glow cx={cx} cy="140" r="58" fill="url(#tr-glow)" />
        {CELLS.map((i) => {
          const x = X0 + i * STEP;
          const isHot = i === HOT_CELL;
          return (
            <g key={i}>
              <rect x={x + 15} y="88" width="16" height="7" rx="2" fill={isHot ? HOT : COOL} fillOpacity="0.8" />
              <rect
                data-hot={isHot || undefined}
                x={x}
                y="95"
                width={W}
                height="90"
                rx="7"
                fill={isHot ? HOT : COOL}
                fillOpacity={isHot ? 0.45 : 0.18}
                stroke={isHot ? HOT : COOL}
                strokeWidth="2"
              />
            </g>
          );
        })}
        {/* the BMS ring around the hot cell */}
        <circle data-ring cx={cx} cy="140" r="44" fill="none" stroke={LINE} strokeOpacity="0.9" strokeWidth="2" strokeDasharray="6 5" />
        {/* the barriers on each side of it */}
        {[-1, 1].map((side) => (
          <rect key={side} data-wall x={cx + side * 33 - 3} y="78" width="6" height="124" rx="3" fill={LINE} fillOpacity="0.85" />
        ))}
        {/* what happens, in the article's words */}
        <g className="text-[12px] font-semibold">
          <text data-say x="72" y="242" textAnchor="middle" fill={HOT}>
            Overheats
          </text>
          <text data-say x="200" y="242" textAnchor="middle" className="fill-white">
            Detected early
          </text>
          <text data-say x="328" y="242" textAnchor="middle" className="fill-signal">
            Isolated, contained
          </text>
        </g>
        <path d="M112 238 h30 M250 238 h10" stroke={LINE} strokeOpacity="0.4" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}
