import { useEffect, useRef, useState } from "react";
import { onceInView } from "../lib/inview";
import { isFirstLoad } from "../lib/firstLoad";
import { COUNT_DUR } from "../lib/tokens";

/*
 * The site's one figure animation: a stat or specification counts up to its exact value, once, the first
 * time it scrolls into view. Only values that begin with a real number count — "261 kWh", "6.25 MWh",
 * "8–128 kWh" (both ends of a range), "~30–33%", "400+ GWh", "#1", "1,022 kWh"; anything else ("IP55",
 * "LFP", "Up to 6.3 MWh") is shown as written. The count always lands on the data's own text, screen
 * readers get that text directly, and the final value's width is reserved from the start, so the
 * changing digits never move anything around them.
 *
 * Like every reveal on the site it never hides what is already visible: a first load (lib/firstLoad)
 * renders the real figure, and only a figure still below the viewport is reset to count when it
 * arrives; one passed in a jump or a fast scroll, or under reduced motion, simply shows its value.
 */
const FIGURE = /^([~#≈<>]?)(\d[\d,]*(?:\.\d+)?)(?:–(\d[\d,]*(?:\.\d+)?))?(.*)$/;
const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function parse(value) {
  const m = typeof value === "string" && value.match(FIGURE);
  if (!m) return null;
  const [, prefix, lo, hi, suffix] = m;
  return { prefix, lo, hi, suffix };
}
function at(n, t) {
  const decimals = (n.split(".")[1] || "").length;
  const x = (parseFloat(n.replace(/,/g, "")) * t).toFixed(decimals);
  return n.includes(",") ? Number(x).toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) : x;
}
const format = (f, t) => `${f.prefix}${at(f.lo, t)}${f.hi ? `–${at(f.hi, t)}` : ""}${f.suffix}`;

export default function CountUp({ value, className = "" }) {
  const figure = parse(value);
  const [first] = useState(() => typeof window === "undefined" || isFirstLoad());
  const [shown, setShown] = useState(() => (figure && !first && !reduced() ? format(figure, 0) : value));
  const ref = useRef(null);
  useEffect(() => {
    if (!figure || reduced()) return setShown(value);
    let raf = 0;
    const off = onceInView(ref.current, {
      initial: !first,
      below: first ? () => setShown(format(figure, 0)) : undefined,
      show: () => setShown(value),
      enter: () => {
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min((now - start) / (COUNT_DUR * 1000), 1);
          setShown(p < 1 ? format(figure, 1 - Math.pow(1 - p, 3)) : value);
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
    });
    return () => {
      off();
      cancelAnimationFrame(raf);
    };
    // Runs once: the count only ever goes up to the real value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <span ref={ref} className={`inline-grid tabular-nums ${className}`}>
      <span className="sr-only">{value}</span>
      {/* The final value, invisible, holds the width; the counting value sits over it, left-aligned, so
          its first digit never moves (a centred count would shift as it grows). The box itself still
          follows its parent's alignment. */}
      <span aria-hidden="true" className="invisible col-start-1 row-start-1 text-left">
        {value}
      </span>
      <span aria-hidden="true" className="col-start-1 row-start-1 text-left">
        {shown}
      </span>
    </span>
  );
}
