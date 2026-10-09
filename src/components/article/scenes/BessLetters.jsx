import { useRef } from "react";
import { useSceneMotion } from "./useScene";

const WORDS = [
  ["B", "attery"],
  ["E", "nergy"],
  ["S", "torage"],
  ["S", "ystem"],
];

/**
 * "BESS full form": the four letters resolve out of scrambled characters (ScrambleText), then each
 * one expands into its word — Battery Energy Storage System. Final state: the four words.
 */
export default function BessLetters({ active, motion, mode }) {
  const root = useRef(null);
  useSceneMotion(root, motion, active, ({ gsap }, el) => {
    const letters = el.querySelectorAll("[data-letter]");
    const rests = el.querySelectorAll("[data-rest]");
    const rule = el.querySelector("[data-rule]");
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.set(rests, { clipPath: "inset(0 100% 0 0)", opacity: 0 })
      .set(rule, { scaleX: 0 })
      .fromTo(letters, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.35, stagger: 0.08 }, 0)
      .to(letters, { duration: 0.7, stagger: 0.1, scrambleText: { text: "{original}", chars: "BESYTMNRG01", revealDelay: 0.35, speed: 0.6 } }, 0)
      .to(rests, { clipPath: "inset(0 0% 0 0)", opacity: 1, duration: 0.55, stagger: 0.12 }, 0.85)
      .to(rule, { scaleX: 1, duration: 0.6, ease: "power2.inOut" }, 1.1);
    return tl;
  });

  const big = mode === "inline" ? "text-[2.6rem]" : "text-[3.6rem]";
  return (
    <div ref={root} className="flex h-full flex-col justify-center px-8">
      <div role="img" aria-label="BESS: Battery Energy Storage System, one word for each letter" className="relative">
        <ul aria-hidden="true" className="space-y-1">
          {WORDS.map(([l, rest], i) => (
            <li key={i} className={`flex items-baseline font-semibold leading-none tracking-tight ${big}`}>
              <span data-letter className="inline-block text-signal">
                {l}
              </span>
              <span data-rest className="inline-block text-[0.62em] text-white/90">
                {rest}
              </span>
            </li>
          ))}
        </ul>
        <span data-rule aria-hidden="true" className="mt-5 block h-0.5 w-40 origin-left rounded-full bg-gradient-to-r from-signal to-transparent" />
      </div>
    </div>
  );
}
