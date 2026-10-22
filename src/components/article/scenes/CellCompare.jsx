import { useRef } from "react";
import { useSceneMotion } from "./useScene";
import { DUR, EASE, STAGGER } from "../../../lib/tokens";

// The two cells and the cathode materials the article names for each.
const CELLS = [
  { id: "lfp", name: "LFP", sub: "Lithium iron phosphate", x: 58, chips: ["Fe", "P"] },
  { id: "nmc", name: "NMC", sub: "Nickel manganese cobalt", x: 222, chips: ["Ni", "Mn", "Co"] },
];
const W = 120; // cell width
const TOP = 76; // cell top
const H = 150; // cell height

/**
 * "What is LFP / NMC / Is LFP lithium-ion": two cells side by side, labelled LFP and NMC, each with
 * its cathode layer above the separator and anode. The cathode fills in with the materials the text
 * names — Fe · P for LFP, Ni · Mn · Co for NMC. `focus`: "lfp" or "nmc" (that cell is lit, its
 * cathode fills as the scene arrives; the other stays dim), or "family" (both lit, under one
 * "Lithium-ion" bracket). Arrival: the outlines draw, the cathode fills, the chips pop in. Final
 * state: both cells drawn with their materials.
 */
export default function CellCompare({ active, motion, mode, focus = "family" }) {
  const root = useRef(null);
  const family = focus === "family";
  useSceneMotion(
    root,
    motion,
    active,
    ({ gsap }, el) => {
      const lit = (sel) => [...el.querySelectorAll(sel)].filter((n) => family || n.closest("[data-cell]")?.dataset.cell === focus);
      const tl = gsap.timeline({ defaults: { ease: EASE.standard } });
      tl.from(el.querySelectorAll("[data-draw]"), { drawSVG: "0%", duration: DUR.slow, stagger: STAGGER, ease: EASE.inOut })
        .from(lit("[data-fill]"), { scaleX: 0, transformOrigin: "left center", duration: DUR.base, stagger: STAGGER }, 0.45)
        .from(lit("[data-chip]"), { opacity: 0, scale: 0.6, transformOrigin: "center", duration: DUR.base, stagger: STAGGER, ease: EASE.emphasized }, 0.75)
        .from(el.querySelectorAll("[data-name]"), { opacity: 0, y: 8, duration: DUR.base, stagger: STAGGER }, 0.3);
      if (family) tl.from(el.querySelectorAll("[data-bracket]"), { drawSVG: "50% 50%", duration: DUR.base, ease: EASE.inOut }, 1).from(el.querySelectorAll("[data-family]"), { opacity: 0, y: -6, duration: DUR.base }, 1.3);
      return tl;
    },
    [focus]
  );

  const dim = (id) => !family && id !== focus;
  return (
    <div ref={root} className={`flex h-full items-center justify-center ${mode === "inline" ? "px-2" : "px-4"}`}>
      <svg
        role="img"
        aria-label={`Two lithium-ion cells: LFP, with an iron phosphate (Fe, P) cathode, and NMC, with a nickel, manganese and cobalt (Ni, Mn, Co) cathode${
          family ? ", both part of the lithium-ion family" : focus === "lfp" ? ". Highlighted: LFP" : ". Highlighted: NMC"
        }`}
        viewBox="0 0 400 300"
        className="h-full max-h-full w-full"
      >
        {/* "Lithium-ion": one bracket over both cells */}
        {family && (
          <g>
            <path data-bracket d={`M${CELLS[0].x} 54 V44 H${CELLS[1].x + W} V54`} fill="none" stroke="#90D988" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <text data-family x="200" y="32" textAnchor="middle" className="fill-signal text-[14px] font-semibold tracking-[0.12em]">
              LITHIUM-ION
            </text>
          </g>
        )}
        {CELLS.map((c) => (
          <g key={c.id} data-cell={c.id} className="transition-opacity duration-500" style={{ opacity: dim(c.id) ? 0.38 : 1 }}>
            {/* terminals */}
            <rect data-draw x={c.x + 22} y={TOP - 10} width="20" height="10" rx="2" fill="none" stroke="#F4F7F4" strokeOpacity="0.6" strokeWidth="1.6" />
            <rect data-draw x={c.x + W - 42} y={TOP - 10} width="20" height="10" rx="2" fill="none" stroke="#F4F7F4" strokeOpacity="0.6" strokeWidth="1.6" />
            {/* case */}
            <rect data-draw x={c.x} y={TOP} width={W} height={H} rx="10" fill="none" stroke={dim(c.id) ? "#F4F7F4" : "#90D988"} strokeOpacity={dim(c.id) ? 0.5 : 0.9} strokeWidth="2" />
            {/* cathode, filled with its materials */}
            <rect data-fill x={c.x + 10} y={TOP + 14} width={W - 20} height="52" rx="6" fill="#90D988" fillOpacity="0.16" stroke="#90D988" strokeOpacity="0.55" strokeWidth="1.2" />
            <text x={c.x + 16} y={TOP + 28} className="fill-white/55 text-[9px] font-semibold uppercase tracking-[0.16em]">
              Cathode
            </text>
            {c.chips.map((el, i) => {
              const n = c.chips.length;
              const cx = c.x + W / 2 + (i - (n - 1) / 2) * 30;
              return (
                <g key={el} data-chip>
                  <circle cx={cx} cy={TOP + 47} r="12" fill="#071A17" stroke="#90D988" strokeWidth="1.6" />
                  <text x={cx} y={TOP + 51} textAnchor="middle" className="fill-white text-[11px] font-semibold">
                    {el}
                  </text>
                </g>
              );
            })}
            {/* separator, anode */}
            <line data-draw x1={c.x + 10} y1={TOP + 80} x2={c.x + W - 10} y2={TOP + 80} stroke="#F4F7F4" strokeOpacity="0.45" strokeWidth="1.4" strokeDasharray="4 4" />
            <rect data-draw x={c.x + 10} y={TOP + 92} width={W - 20} height="44" rx="6" fill="none" stroke="#F4F7F4" strokeOpacity="0.4" strokeWidth="1.4" />
            <text x={c.x + 16} y={TOP + 106} className="fill-white/45 text-[9px] font-semibold uppercase tracking-[0.16em]">
              Anode
            </text>
            {/* name */}
            <g data-name>
              <text x={c.x + W / 2} y={TOP + H + 30} textAnchor="middle" className={`text-[20px] font-semibold ${dim(c.id) ? "fill-white/70" : "fill-signal"}`}>
                {c.name}
              </text>
              <text x={c.x + W / 2} y={TOP + H + 48} textAnchor="middle" className="fill-white/70 text-[10.5px]">
                {c.sub}
              </text>
            </g>
          </g>
        ))}
      </svg>
    </div>
  );
}
