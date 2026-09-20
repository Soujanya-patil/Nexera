import { useEffect, useRef } from "react";
import { formatCount, parseCount } from "../lib/count";
import { useMotion } from "../lib/motion";

/**
 * A stat value that renders its final text by default (no-JS, reduced motion, screen readers).
 * Cinematic mode: the hero timeline drives [data-count] from scroll position.
 * Light mode: counts up once when it scrolls into view.
 */
export default function Count({ value }) {
  const { mode } = useMotion();
  const ref = useRef(null);

  useEffect(() => {
    const parsed = parseCount(value);
    if (mode !== "light" || !parsed) return;
    const el = ref.current;
    el.textContent = formatCount(parsed, 0);
    let raf;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now) => {
          const t = Math.min((now - start) / 1200, 1);
          el.textContent = formatCount(parsed, t);
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      el.textContent = value;
    };
  }, [mode, value]);

  return (
    <>
      <span className="sr-only">{value}</span>
      <span ref={ref} data-count={value} aria-hidden="true">
        {value}
      </span>
    </>
  );
}
