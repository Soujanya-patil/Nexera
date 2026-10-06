import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { loadGsap } from "../lib/motion";
import { onceInView } from "../lib/inview";

/**
 * A figure that rolls in once as it scrolls into view: each character of the FINAL value (digits,
 * "+", "#", units alike) slides up from behind its own mask, 30 ms apart (closer for long values), the
 * whole roll ≤ 0.5 s. No other number is ever rendered — there is no count, so no frame can show a
 * wrong figure — and the text in the markup is the final value from the start. While it waits below
 * the viewport it is hidden (index.css, js-motion only); already on screen, scrolled past, arriving in a
 * fast scroll or under reduced motion it is simply shown.
 */
export default function RollValue({ value }) {
  const ref = useRef(null);
  const gsapRef = useRef(null);
  const [phase, setPhase] = useState("plain"); // plain → waiting → roll → plain
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelled = false;
    let off;
    loadGsap()
      .then(({ gsap }) => {
        if (cancelled) return;
        gsapRef.current = gsap;
        // Hidden ("waiting") only once it is known to be below the viewport: a figure on screen is never
        // hidden for its roll.
        off = onceInView(el, { enter: () => setPhase("roll"), show: () => setPhase("plain"), below: () => setPhase("waiting") });
      })
      .catch(() => !cancelled && setPhase("plain"));
    return () => {
      cancelled = true;
      off?.();
    };
  }, []);
  // Before the first paint of the split value, so its characters never show in place first.
  useLayoutEffect(() => {
    if (phase !== "roll") return;
    const chars = ref.current.querySelectorAll("[data-ch]");
    const each = chars.length > 1 ? Math.min(0.03, 0.2 / (chars.length - 1)) : 0;
    const tween = gsapRef.current.fromTo(
      chars,
      { yPercent: 110 },
      { yPercent: 0, duration: 0.3, ease: "power3.out", stagger: each, onComplete: () => setPhase("plain") }
    );
    return () => tween.kill();
  }, [phase]);
  return (
    <span ref={ref} data-roll={phase === "plain" ? undefined : phase}>
      {phase === "roll"
        ? [...value].map((c, i) =>
            c === " " ? (
              " "
            ) : (
              <span key={i} className="roll-mask">
                <span data-ch className="inline-block">
                  {c}
                </span>
              </span>
            )
          )
        : value}
    </span>
  );
}
