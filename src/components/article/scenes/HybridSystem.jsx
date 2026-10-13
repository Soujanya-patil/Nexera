import { useEffect, useRef, useState } from "react";
import { useSceneMotion } from "./useScene";

const DC = "#90D988";
const AC = "#F2C46D";
const LINE = "#F4F7F4";
const CX = 200;
const CY = 150;

// Around the hybrid inverter: each part, where it sits, and the current it carries.
const PARTS = [
  { id: "solar", label: "Solar", x: CX, y: 40, kind: "dc" },
  { id: "battery", label: "Battery", x: 64, y: CY, kind: "dc" },
  { id: "grid", label: "Grid", x: 336, y: CY, kind: "ac" },
  { id: "building", label: "Building", x: CX, y: 262, kind: "ac" },
];
// The two states the arrows switch between, in the article's words: the battery charging (from solar,
// the building supplied) and discharging (the battery and the grid supplying the building).
const PHASES = [
  { name: "Battery charging", flow: { solar: "in", battery: "out", grid: "none", building: "out" } },
  { name: "Battery discharging", flow: { solar: "none", battery: "in", grid: "in", building: "out" } },
];

/**
 * "What is a hybrid energy storage system?": solar, battery, grid and building around one hybrid
 * inverter, with power arrows that switch direction — the battery charging (solar in, the building
 * supplied) and discharging (the battery and the grid supplying the building) — taking turns while
 * the scene is active. Final state (no motion): charging.
 */
export default function HybridSystem({ active, motion }) {
  const root = useRef(null);
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (!motion || !active) return;
    const t = setInterval(() => setPhase((p) => (p + 1) % PHASES.length), 2600);
    return () => clearInterval(t);
  }, [motion, active]);
  useSceneMotion(root, motion, active, ({ gsap }, el) =>
    gsap
      .timeline()
      .from(el.querySelectorAll("[data-draw]"), { drawSVG: "0%", duration: 0.7, stagger: 0.05, ease: "power2.inOut" })
      .from(el.querySelectorAll("[data-part]"), { opacity: 0, scale: 0.85, transformOrigin: "center", duration: 0.4, stagger: 0.08 }, 0.3)
  );

  const P = PHASES[phase];
  return (
    <div ref={root} className="flex h-full items-center justify-center px-3">
      <svg
        role="img"
        aria-label={`A hybrid system: solar, a battery, the grid and the building around one hybrid inverter. ${P.name}: ${
          phase === 0 ? "solar charges the battery and supplies the building" : "the battery and the grid supply the building"
        }.`}
        viewBox="0 0 400 300"
        className="h-full max-h-full w-full"
      >
        {PARTS.map((p) => {
          const dir = P.flow[p.id];
          const color = p.kind === "dc" ? DC : AC;
          // the wire from the part to the inverter's edge
          const [x2, y2] = p.x === CX ? [CX, p.y < CY ? CY - 30 : CY + 30] : [p.x < CX ? CX - 52 : CX + 52, CY];
          const [x1, y1] = p.x === CX ? [CX, p.y < CY ? p.y + 26 : p.y - 26] : [p.x < CX ? p.x + 40 : p.x - 40, CY];
          // the arrow's direction: towards the inverter ("in") or away from it ("out")
          const towards = dir === "in";
          const [ax, ay] = [(x1 + x2) / 2, (y1 + y2) / 2];
          const vx = Math.sign(x2 - x1) * (towards ? 1 : -1);
          const vy = Math.sign(y2 - y1) * (towards ? 1 : -1);
          const tip = `M${ax - vx * 7 - vy * 6} ${ay - vy * 7 - vx * 6} L${ax + vx * 6} ${ay + vy * 6} L${ax - vx * 7 + vy * 6} ${ay - vy * 7 + vx * 6}`;
          return (
            <g key={p.id}>
              <line data-draw x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeOpacity={dir === "none" ? 0.25 : 0.75} strokeWidth="2.5" />
              {dir !== "none" && <path d={tip} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-opacity duration-300" />}
              <g data-part>
                <rect x={p.x - 40} y={p.y - 24} width="80" height="48" rx="10" fill="#071A17" stroke={LINE} strokeOpacity={dir === "none" ? 0.3 : 0.7} strokeWidth="2" />
                <text x={p.x} y={p.y + 4} textAnchor="middle" className={`text-[12px] font-semibold ${dir === "none" ? "fill-white/40" : "fill-white/90"}`}>
                  {p.label}
                </text>
              </g>
            </g>
          );
        })}
        <g data-part>
          <rect x={CX - 52} y={CY - 30} width="104" height="60" rx="12" fill="#071A17" stroke={DC} strokeWidth="2.2" />
          <text x={CX} y={CY - 2} textAnchor="middle" className="fill-signal text-[12px] font-semibold">
            Hybrid
          </text>
          <text x={CX} y={CY + 14} textAnchor="middle" className="fill-signal text-[12px] font-semibold">
            inverter
          </text>
        </g>
        <text x="14" y="292" className="fill-white/70 text-[10px] font-semibold uppercase tracking-[0.16em]">
          {P.name}
        </text>
      </svg>
    </div>
  );
}
