import { useEffect, useState } from "react";

const DURATION = 350; // ms, matches .count-in / .count-out in index.css

/**
 * "SHOWING 3 SYSTEMS" with the number rolling up/down when the filters change: the old number leaves
 * upward as the new one arrives from below, both at once (CSS keyframes, transform + opacity; under
 * reduced motion the old number only fades and the new one simply appears). Screen readers get the
 * plain sentence through the polite live region.
 */
export default function LiveCount({ count, total }) {
  // The number on show, plus the one leaving (kept briefly so it can animate out).
  const [shown, setShown] = useState({ now: count, prev: null, n: 0 });
  // A new count swaps in during this render (derived state), so the number never lags a frame.
  if (count !== shown.now) setShown((s) => ({ now: count, prev: s.now, n: s.n + 1 }));
  // The leaving number is dropped once its animation is over.
  useEffect(() => {
    if (shown.prev === null) return;
    const t = setTimeout(() => setShown((s) => ({ ...s, prev: null })), DURATION);
    return () => clearTimeout(t);
  }, [shown.n, shown.prev]);

  return (
    <p className="flex shrink-0 items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-sage">
      <span aria-hidden="true" className="relative inline-flex h-2 w-2">
        <span className="absolute inset-0 rounded-full bg-signal/50 motion-safe:animate-ping [animation-duration:2.4s]" />
        <span className="relative h-2 w-2 rounded-full bg-signal" />
      </span>
      <span aria-hidden="true">Showing</span>
      <span aria-hidden="true" className="relative inline-flex h-[1.4em] min-w-[1.2ch] items-center justify-center overflow-hidden text-base text-forest">
        {shown.prev !== null && (
          <span key={`out-${shown.n}`} className="count-out absolute tabular-nums">
            {shown.prev}
          </span>
        )}
        <span key={`in-${shown.n}`} className={`tabular-nums ${shown.n ? "count-in" : ""}`}>
          {shown.now}
        </span>
      </span>
      <span aria-hidden="true">
        {count === 1 ? "system" : "systems"} <span className="text-sage/70">of {total}</span>
      </span>
      <span className="sr-only" aria-live="polite">
        Showing {count} of {total} systems
      </span>
    </p>
  );
}
