import { useRef } from "react";
import { useSceneMotion } from "./useScene";

const DC = "#90D988"; // direct current: the site's green
const AC = "#F2C46D"; // alternating current: amber
const LINE = "#F4F7F4";

// Each layout: boxes (label, x, y, w, h) and the path solar power takes into the battery, in segments
// that are DC or AC. `conversions`: DC↔AC conversions when storing solar (DC-coupled 0, AC-coupled 2).
const LAYOUTS = {
  dc: {
    boxes: [
      { id: "solar", label: "Solar", x: 20, y: 40, w: 96, h: 56 },
      { id: "inv", label: "Hybrid inverter", x: 150, y: 120, w: 112, h: 60, lit: true },
      { id: "battery", label: "Battery", x: 20, y: 204, w: 96, h: 56 },
      { id: "load", label: "Building / grid", x: 290, y: 120, w: 96, h: 60 },
    ],
    flow: [
      { d: "M68 96 V150 H150", kind: "dc" },
      { d: "M150 150 H96 V204", kind: "dc" },
    ],
    wires: [{ d: "M262 150 H290", kind: "ac" }],
    conversions: 0,
  },
  ac: {
    boxes: [
      { id: "solar", label: "Solar", x: 14, y: 36, w: 84, h: 52 },
      { id: "sinv", label: "Solar inverter", x: 130, y: 36, w: 104, h: 52 },
      { id: "pcs", label: "Battery PCS", x: 130, y: 212, w: 104, h: 52, lit: true },
      { id: "battery", label: "Battery", x: 14, y: 212, w: 84, h: 52 },
      { id: "load", label: "Building / grid", x: 292, y: 124, w: 96, h: 52 },
    ],
    flow: [
      { d: "M98 62 H130", kind: "dc" },
      { d: "M234 62 H262 V238 H234", kind: "ac" },
      { d: "M130 238 H98", kind: "dc" },
    ],
    wires: [{ d: "M262 150 H292", kind: "ac" }],
    bus: true,
    conversions: 2,
  },
};

/**
 * "What is DC-coupled / AC-coupled battery storage?": how solar power reaches the battery. DC-coupled
 * (`kind="dc"`): solar and battery share one hybrid inverter, and the particles run straight from the
 * solar into the battery on the DC side — the "DC↔AC conversions" counter shows 0. AC-coupled
 * (`kind="ac"`): solar inverter → AC bus → battery PCS → battery; the particles change colour at each
 * conversion (green DC, amber AC) — the counter shows 2. Arrival: the lines draw in; then the particles loop while the scene
 * is active. Final state (no motion): the paths drawn, no particles.
 */
export default function CouplingFlow({ active, motion, mode, kind = "dc" }) {
  const root = useRef(null);
  const L = LAYOUTS[kind];
  useSceneMotion(
    root,
    motion,
    active,
    ({ gsap }, el) => {
      const tl = gsap.timeline();
      tl.from(el.querySelectorAll("[data-draw]"), { drawSVG: "0%", duration: 0.7, stagger: 0.05, ease: "power2.inOut" }).from(
        el.querySelectorAll("[data-count]"),
        { opacity: 0, scale: 0.6, transformOrigin: "center", duration: 0.4, ease: "back.out(2)" },
        0.6
      );
      // Particles: each runs the whole path, segment by segment, taking the colour of the current
      // (DC green, AC amber) — a new colour at each conversion.
      const segs = [...el.querySelectorAll("[data-seg]")];
      el.querySelectorAll("[data-dot]").forEach((dot, i) => {
        const run = gsap.timeline({ repeat: -1, delay: 0.9 + i * 0.45 });
        run.set(dot, { opacity: 1 });
        segs.forEach((seg) => {
          run.set(dot, { attr: { fill: seg.dataset.seg === "dc" ? DC : AC } }).to(dot, {
            duration: 0.7,
            ease: "none",
            motionPath: { path: seg, align: seg, alignOrigin: [0.5, 0.5] },
          });
        });
        run.set(dot, { opacity: 0 });
        tl.add(run, 0);
      });
      return tl;
    },
    [kind]
  );

  return (
    <div ref={root} className={`flex h-full items-center justify-center ${mode === "inline" ? "px-1" : "px-3"}`}>
      <svg
        role="img"
        aria-label={
          kind === "dc"
            ? "DC-coupled: solar and the battery share one hybrid inverter; solar power goes straight into the battery on the DC side. DC↔AC conversions: 0."
            : "AC-coupled: solar inverter, then the AC bus, then the battery's own PCS, then the battery; the power changes form at each conversion. DC↔AC conversions: 2."
        }
        viewBox="0 0 400 300"
        className="h-full max-h-full w-full"
      >
        {L.bus && (
          <g>
            <line data-draw x1="262" y1="30" x2="262" y2="270" stroke={AC} strokeOpacity="0.35" strokeWidth="6" strokeLinecap="round" />
            <text x="272" y="34" className="fill-white/60 text-[10px] font-semibold uppercase tracking-[0.16em]">
              AC bus
            </text>
          </g>
        )}
        {[...L.flow, ...L.wires].map((s, i) => (
          <path
            key={i}
            data-draw
            data-seg={i < L.flow.length ? s.kind : undefined}
            d={s.d}
            fill="none"
            stroke={s.kind === "dc" ? DC : AC}
            strokeOpacity="0.7"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        ))}
        {L.boxes.map((b) => (
          <g key={b.id}>
            <rect data-draw x={b.x} y={b.y} width={b.w} height={b.h} rx="10" fill="#071A17" stroke={b.lit ? DC : LINE} strokeOpacity={b.lit ? 0.95 : 0.55} strokeWidth="2" />
            <text x={b.x + b.w / 2} y={b.y + b.h / 2 + 4} textAnchor="middle" className={`text-[11.5px] font-semibold ${b.lit ? "fill-signal" : "fill-white/90"}`}>
              {b.label}
            </text>
          </g>
        ))}
        {[0, 1, 2].map((i) => (
          <circle key={i} data-dot r="4.5" cx="0" cy="0" fill={DC} opacity="0" />
        ))}
        {/* the conversions counter */}
        <g data-count>
          <rect x="274" y="226" width="118" height="44" rx="12" fill="#071A17" stroke={DC} strokeOpacity="0.6" strokeWidth="1.5" />
          <text x="284" y="245" className="fill-white/70 text-[9px] font-semibold uppercase tracking-[0.08em]">
            DC↔AC conversions
          </text>
          <text x="284" y="263" className="fill-signal text-[15px] font-semibold">
            {L.conversions}
          </text>
        </g>
        {/* legend */}
        <g className="text-[10px] font-semibold uppercase tracking-[0.14em]">
          <circle cx="292" cy="16" r="4" fill={DC} />
          <text x="300" y="20" className="fill-white/70">
            DC
          </text>
          <circle cx="332" cy="16" r="4" fill={AC} />
          <text x="340" y="20" className="fill-white/70">
            AC
          </text>
        </g>
      </svg>
    </div>
  );
}
