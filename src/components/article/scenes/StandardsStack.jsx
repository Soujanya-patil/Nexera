import { useEffect, useRef, useState } from "react";
import { useSceneMotion } from "./useScene";

// Top to bottom, the layers a BESS is tested at, with the standards the article names for each.
const LAYERS = [
  { name: "PCS", std: "IEC 62477-1" },
  { name: "Fire test", std: "UL 9540A" },
  { name: "System", std: "IEC 62933-5-2 / UL 9540" },
  { name: "Cell", std: "IEC 62619" },
];
// The article's Key terms, in order, and the layer each one belongs to (UN 38.3, transport, lights none).
const TERM_LAYER = [3, 2, 2, 1, 0, -1];

/**
 * "The main safety standards for battery storage": a stack of labelled layers — Cell (IEC 62619),
 * System (IEC 62933-5-2 / UL 9540), Fire test (UL 9540A), PCS (IEC 62477-1). Each lights up as its Key
 * term is read (phones: in turn while in view). Arrival: the layers rise in, bottom first. Final
 * state: every layer shown, none highlighted.
 */
export default function StandardsStack({ active, motion, mode, step }) {
  const root = useRef(null);
  const [tour, setTour] = useState(-1);
  useEffect(() => {
    if (mode !== "inline" || !motion || !active) return;
    let i = 3;
    setTour(3);
    const t = setInterval(() => setTour((i = i <= 0 ? 3 : i - 1)), 1500);
    return () => clearInterval(t);
  }, [mode, motion, active]);

  useSceneMotion(root, motion, active, ({ gsap }, el) =>
    gsap.timeline().from([...el.querySelectorAll("[data-layer]")].reverse(), { opacity: 0, y: 16, duration: 0.45, stagger: 0.1, ease: "power2.out", clearProps: "opacity,transform" })
  );

  const lit = !motion ? -1 : mode === "inline" ? tour : step >= 0 ? TERM_LAYER[step] ?? -1 : -1;
  const compact = mode === "inline";
  return (
    <div ref={root} className={`flex h-full flex-col justify-center ${compact ? "px-4" : "px-7"}`}>
      <ul role="img" aria-label={`Safety standards, layer by layer: ${[...LAYERS].reverse().map((l) => `${l.name}, ${l.std}`).join("; ")}`} className={compact ? "space-y-2" : "space-y-2.5"}>
        {LAYERS.map((l, i) => {
          const on = lit === i;
          return (
            <li
              key={l.name}
              data-layer
              aria-hidden="true"
              className={`flex items-center justify-between gap-3 rounded-xl border font-semibold transition-[border-color,background-color,box-shadow] duration-500 ${compact ? "px-3 py-2.5" : "px-4 py-3.5"} ${
                on ? "border-signal/70 bg-signal/15 shadow-[0_0_24px_rgba(144,217,136,0.3)]" : lit >= 0 ? "border-white/10 bg-white/[0.03] opacity-50" : "border-white/15 bg-white/[0.04]"
              }`}
              style={{ marginInline: `${(LAYERS.length - 1 - i) * (compact ? 4 : 8)}px` }}
            >
              <span className={`${compact ? "text-[13px]" : "text-sm"} ${on ? "text-white" : "text-white/85"}`}>{l.name}</span>
              <span className={`${compact ? "text-[11px]" : "text-xs"} tracking-wide ${on ? "text-signal" : "text-white/60"}`}>{l.std}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
