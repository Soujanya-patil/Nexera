import { useEffect, useRef, useState } from "react";

const DURATION = 1200; // ms — under the 1.5s cap
const ease = (t) => 1 - Math.pow(1 - t, 3); // ease-out cubic, same curve lib/count.js already uses

// Real approved figures (Hero.jsx's stat band — currently unmounted elsewhere on Home) — not
// invented, not changed. "Quick" has no numeric value, so it's shown static, same as the
// pre-existing Count.jsx component already does for it.
//
// "30-33%" animates BOTH numbers together (0-0% -> ... -> 30-33%), not a count-to-midpoint-then-
// swap: swapping the display to a different pair of digits than what it just finished counting to
// reads like a glitch, whereas animating both ends of the range keeps the same "X-Y%" shape
// throughout and settles cleanly on the real value.
const STATS = [
  { type: "range", lo: 30, hi: 33, suffix: "%", label: "Projected CAGR", text: "30–33%" },
  { type: "count", value: 24, suffix: "×7", label: "Availability", text: "24×7" },
  { type: "static", label: "Response times", text: "Quick" },
];

// The two figures confirmed for the Home stat bar (approved mockup v2). ~10x and the tagline
// column from the mockup are deliberately left out: only verified figures, no filler column.
export const HOME_STATS = [
  { type: "range", prefix: "~", lo: 30, hi: 33, suffix: "%", label: "Projected CAGR, India BESS market (2026–2031)", text: "~30–33%" },
  { type: "count", value: 400, suffix: "+ GWh", label: "Storage capacity India needs by 2031⁠–⁠32 (CEA estimate)", text: "400+ GWh" },
];

function format(stat, t) {
  const prefix = stat.prefix ?? "";
  if (stat.type === "count") return `${prefix}${Math.round(stat.value * t)}${stat.suffix}`;
  if (stat.type === "range") return `${prefix}${Math.round(stat.lo * t)}–${Math.round(stat.hi * t)}${stat.suffix}`;
  return stat.text;
}

const TONES = {
  dark: {
    grid: "divide-bone/15 border-y border-bone/15 py-8",
    value: "font-serif text-3xl text-bone sm:text-4xl",
    label: "text-bone/60",
  },
  light: {
    grid: "divide-line py-2",
    value: "font-sans text-3xl text-forest sm:text-4xl",
    label: "text-graphite",
  },
};

function StatValue({ stat, play, reduced }) {
  const [display, setDisplay] = useState(stat.type === "static" || reduced ? stat.text : format(stat, 0));

  useEffect(() => {
    if (!play) return;
    if (stat.type === "static" || reduced) {
      setDisplay(stat.text);
      return;
    }
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / DURATION, 1);
      setDisplay(format(stat, ease(p)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [play, stat, reduced]);

  return (
    <>
      <span className="sr-only">{stat.text}</span>
      <span aria-hidden="true">{display}</span>
    </>
  );
}

/**
 * Animates 0 -> real value once, the first time the bar scrolls into view (IntersectionObserver,
 * disconnects after the first trigger — never re-plays on subsequent scrolls). Reduced-motion
 * shows the final values immediately, no animation frames run at all.
 */
export default function StatBar({ stats = STATS, tone = "dark", className = "" }) {
  const ref = useRef(null);
  const [play, setPlay] = useState(false);
  const reducedRef = useRef(false);

  useEffect(() => {
    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedRef.current) {
      setPlay(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPlay(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`grid divide-x ${TONES[tone].grid} ${className}`}
      style={{ gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))` }}
    >
      {stats.map((s) => (
        <div key={s.label} className="px-4 text-center sm:px-6">
          <p className={`whitespace-nowrap font-semibold ${TONES[tone].value}`}>
            <StatValue stat={s} play={play} reduced={reducedRef.current} />
          </p>
          <p className={`mx-auto mt-1 max-w-[16rem] text-sm leading-snug ${TONES[tone].label}`}>{s.label}</p>
        </div>
      ))}
    </div>
  );
}
