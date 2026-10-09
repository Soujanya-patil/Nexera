import { useEffect, useRef, useState } from "react";
import { useSceneMotion } from "./useScene";

// One closed outline per scale (same direction, similar point counts, so the morph reads cleanly).
const SHAPES = [
  { label: "Residential (home) storage", d: "M90 200 L90 118 L200 52 L310 118 L310 200 Z", detail: "M178 200 V154 H222 V200 M120 130 H156 V158 H120 Z M244 130 H280 V158 H244 Z" },
  {
    label: "Commercial & industrial (C&I) storage",
    d: "M60 200 L60 112 L118 140 L118 112 L176 140 L176 112 L234 140 L234 64 L270 64 L270 140 L340 140 L340 200 Z",
    detail: "M84 172 H110 M140 172 H166 M196 172 H222 M290 160 H320 V200",
  },
  {
    label: "Utility-scale storage",
    d: "M40 200 L40 96 L360 96 L360 200 Z",
    detail: "M80 104 V192 M120 104 V192 M160 104 V192 M200 104 V192 M240 104 V192 M280 104 V192 M320 104 V192",
  },
];

/**
 * "Types of BESS by scale": one outline that becomes a home, a factory, then a utility-scale container
 * (MorphSVG) as each scale is read, its name underneath. Without motion (and in the pre-rendered page):
 * the three side by side.
 */
export default function ScaleMorph({ active, motion, mode, step }) {
  const root = useRef(null);
  const [tour, setTour] = useState(0);
  useEffect(() => {
    if (mode !== "inline" || !motion || !active) return;
    let i = 0;
    setTour(0);
    const t = setInterval(() => setTour((i = (i + 1) % SHAPES.length)), 2200);
    return () => clearInterval(t);
  }, [mode, motion, active]);
  const at = Math.max(0, Math.min(SHAPES.length - 1, mode === "inline" ? tour : step));
  const from = useRef(0); // the shape on screen before this change: the morph starts from it

  useSceneMotion(
    root,
    motion,
    active,
    ({ gsap }, el) => {
      const tl = gsap.timeline();
      tl.fromTo(
        el.querySelector("[data-shape]"),
        { morphSVG: SHAPES[from.current].d },
        { morphSVG: SHAPES[at].d, duration: 0.9, ease: "power3.inOut", onComplete: () => (from.current = at) },
        0
      )
        .fromTo(el.querySelector("[data-detail]"), { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.6)
        .fromTo(el.querySelector("[data-caption]"), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4 }, 0.5);
      return tl;
    },
    [at]
  );

  if (!motion) {
    return (
      <div className="flex h-full items-center px-4">
        <svg role="img" aria-label="Three scales of battery storage: a home, a factory and a utility-scale container" viewBox="0 0 400 200" className="h-auto w-full">
          {SHAPES.map((s, i) => (
            <g key={s.label} transform={`translate(${i * 133} 40) scale(0.33)`} fill="none" stroke="#90D988" strokeWidth="6" strokeLinejoin="round">
              <path d={s.d} />
              <path d={s.detail} strokeOpacity="0.55" strokeWidth="4" />
            </g>
          ))}
          <g className="fill-white/80 text-[12px] font-semibold" textAnchor="middle">
            <text x="66" y="130">Home</text>
            <text x="200" y="130">C&amp;I</text>
            <text x="333" y="130">Utility-scale</text>
          </g>
        </svg>
      </div>
    );
  }
  return (
    <div ref={root} className="flex h-full flex-col items-center justify-center gap-2 px-6">
      <svg role="img" aria-label={`Battery storage by scale: ${SHAPES[at].label}`} viewBox="0 0 400 220" className="h-auto max-h-[74%] w-full">
        <path data-shape d={SHAPES[0].d} fill="rgba(144,217,136,0.10)" stroke="#90D988" strokeWidth="2.6" strokeLinejoin="round" />
        <path data-detail d={SHAPES[at].detail} fill="none" stroke="#F4F7F4" strokeOpacity="0.55" strokeWidth="2" strokeLinecap="round" />
        <line x1="20" y1="200" x2="380" y2="200" stroke="#F4F7F4" strokeOpacity="0.3" strokeWidth="1.5" />
      </svg>
      <p data-caption aria-hidden="true" className="text-center text-sm font-semibold text-white">
        {SHAPES[at].label}
      </p>
      <div aria-hidden="true" className="flex gap-2">
        {SHAPES.map((s, i) => (
          <span key={s.label} className={`h-1.5 rounded-full transition-[width,background-color] duration-500 ${i === at ? "w-6 bg-signal" : "w-1.5 bg-white/30"}`} />
        ))}
      </div>
    </div>
  );
}
