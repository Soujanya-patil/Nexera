import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

/**
 * Animates a numeric prefix inside an otherwise-arbitrary stat string
 * (e.g. "30–33%" counts up "30", "24×7" counts up "24") the first time the
 * stat scrolls into view, then holds. Non-numeric stats ("Quick") render as-is.
 */
export default function CountUp({ value, duration = 1400 }) {
  const match = value.match(/^(\d+(?:\.\d+)?)(.*)$/);
  const target = match ? parseFloat(match[1]) : null;
  const decimals = match && match[1].includes(".") ? match[1].split(".")[1].length : 0;
  const suffix = match ? match[2] : "";

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.6 });
  const prefersReducedMotion = useReducedMotion();
  const [display, setDisplay] = useState(target === null || prefersReducedMotion ? target : 0);

  useEffect(() => {
    if (target === null || prefersReducedMotion || !isInView) return;
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(target * eased);
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isInView, target, duration, prefersReducedMotion]);

  if (target === null) {
    return <span ref={ref}>{value}</span>;
  }

  return (
    <span ref={ref}>
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}
