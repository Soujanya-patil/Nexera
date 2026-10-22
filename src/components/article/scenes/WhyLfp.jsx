import { useEffect, useRef, useState } from "react";
import { Leaf, Repeat, ShieldCheck } from "lucide-react";
import { useSceneMotion } from "./useScene";
import { DUR, EASE, STAGGER } from "../../../lib/tokens";

// The section's three reasons, in its order (the bullets' lead words).
const REASONS = [
  { icon: ShieldCheck, label: "Safety" },
  { icon: Repeat, label: "Long life" },
  { icon: Leaf, label: "Materials" },
];

/**
 * "Why most energy storage systems use LFP": three icons — a shield, a cycle loop, a leaf — each
 * lighting up green as its bullet is read (phones: in turn while in view), the ones already read
 * staying lit. Arrival: the three rise in. Final state: all three lit.
 */
export default function WhyLfp({ active, motion, mode, step }) {
  const root = useRef(null);
  const [tour, setTour] = useState(-1);
  useEffect(() => {
    if (mode !== "inline" || !motion || !active) return;
    let i = -1;
    setTour(-1);
    const t = setInterval(() => setTour((i = i >= REASONS.length - 1 ? -1 : i + 1)), 1100);
    return () => clearInterval(t);
  }, [mode, motion, active]);

  useSceneMotion(root, motion, active, ({ gsap }, el) =>
    gsap.timeline().from(el.querySelectorAll("[data-reason]"), { opacity: 0, y: 18, scale: 0.92, duration: DUR.base, stagger: STAGGER, ease: EASE.emphasized })
  );

  // Without motion every reason is lit; with it, those read so far.
  const upTo = !motion ? REASONS.length - 1 : mode === "inline" ? tour : step;
  const compact = mode === "inline";
  return (
    <div ref={root} className="flex h-full items-center justify-center px-4">
      <ul role="img" aria-label={`Why LFP: ${REASONS.map((r) => r.label).join(", ")}`} className={`grid w-full grid-cols-3 ${compact ? "gap-3" : "gap-4"}`}>
        {REASONS.map(({ icon: Icon, label }, i) => {
          const on = i <= upTo;
          const now = motion && i === upTo;
          return (
            <li key={label} data-reason aria-hidden="true" className="flex flex-col items-center gap-3 text-center">
              <span
                className={`grid place-items-center rounded-full border transition-[background-color,border-color,color,box-shadow,scale] duration-500 ${compact ? "h-16 w-16" : "h-20 w-20"} ${
                  on ? "border-signal bg-signal/15 text-signal" : "border-white/15 text-white/40"
                } ${now ? "scale-110 shadow-[0_0_28px_rgba(144,217,136,0.45)]" : "scale-100"}`}
              >
                <Icon className={compact ? "h-7 w-7" : "h-9 w-9"} strokeWidth={1.6} />
              </span>
              <span className={`font-semibold transition-colors duration-500 ${compact ? "text-[13px]" : "text-sm"} ${on ? "text-white" : "text-white/50"}`}>{label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
