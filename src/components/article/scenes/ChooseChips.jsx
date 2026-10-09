import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { useSceneMotion } from "./useScene";

// The four questions, in short.
const CHIPS = ["Energy to store (kWh)", "Power at once (kW)", "What it's mainly for", "Where it will be installed"];

/**
 * "How to choose the right BESS": the four questions as chips, each ticking as its question is read;
 * with all four answered, a glowing "Talk to an expert" prompt. Final state: all ticked, the prompt on.
 */
export default function ChooseChips({ active, motion, mode, step }) {
  const root = useRef(null);
  const [tour, setTour] = useState(-1);
  useEffect(() => {
    if (mode !== "inline" || !motion || !active) return;
    let i = -1;
    setTour(-1);
    const t = setInterval(() => setTour((i = Math.min(i + 1, CHIPS.length))), 900);
    return () => clearInterval(t);
  }, [mode, motion, active]);
  const done = !motion ? CHIPS.length - 1 : mode === "inline" ? tour : step;
  const all = done >= CHIPS.length - 1;

  useSceneMotion(root, motion, active, ({ gsap }, el) =>
    gsap.timeline().from(el.querySelectorAll("[data-chip]"), { opacity: 0, x: -14, duration: 0.4, stagger: 0.08, ease: "power2.out" })
  );

  return (
    <div ref={root} className="flex h-full flex-col justify-center gap-4 px-6">
      <div role="img" aria-label={`Four questions to choose a BESS: ${CHIPS.join(", ")}. ${Math.max(0, done + 1)} of 4 answered.`}>
        <ul aria-hidden="true" className="space-y-2.5">
          {CHIPS.map((c, i) => {
            const ticked = i <= done;
            return (
              <li
                key={c}
                data-chip
                className={`flex items-center gap-3 rounded-full border px-4 py-2.5 text-sm font-semibold transition-[border-color,background-color,color] duration-500 ${
                  ticked ? "border-signal/60 bg-signal/10 text-white" : "border-white/15 bg-white/[0.03] text-white/60"
                }`}
              >
                <span
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-[background-color,border-color,scale] duration-500 ${
                    ticked ? "scale-100 border-signal bg-signal text-forest" : "scale-90 border-white/30 text-transparent"
                  }`}
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
                {c}
              </li>
            );
          })}
        </ul>
      </div>
      <Link
        to="/#contact"
        tabIndex={all ? 0 : -1}
        aria-hidden={all ? undefined : true}
        className={`article-expert inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-full bg-signal px-5 text-sm font-semibold text-forest transition-[opacity,translate] duration-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal ${
          all ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
        }`}
      >
        Talk to an expert
        <ArrowRight aria-hidden="true" className="h-4 w-4" />
      </Link>
    </div>
  );
}
