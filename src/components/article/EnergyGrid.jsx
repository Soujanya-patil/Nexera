import { useEffect, useRef, useState } from "react";

// Faint lines (drawn in once) and the paths the green pulses run on — kept to the right of a header's
// text, so nothing ever moves across the words.
const GRID_LINES = ["M0 90 H1440", "M0 210 H1440", "M0 330 H1440", "M180 0 V420", "M560 0 V420", "M940 0 V420", "M1260 0 V420"];
const PULSE_PATHS = ["M1460 90 H940 V440", "M940 -20 V210 H1460", "M1460 330 H1260 V-20"];

/**
 * The animated energy grid behind a dark header (the article's, the Resources hub's): its lines draw
 * in and three green pulses travel along them a few times (CSS, index.css "Article"), paused while the
 * grid is off screen. Decorative. Reduced motion: static lines.
 */
export default function EnergyGrid() {
  const ref = useRef(null);
  const [off, setOff] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setOff(!e.isIntersecting));
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <svg
      ref={ref}
      aria-hidden="true"
      data-off={off || undefined}
      className="article-grid pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 1440 420"
      preserveAspectRatio="xMidYMid slice"
    >
      {GRID_LINES.map((d, i) => (
        <path key={d} d={d} pathLength="1" className="article-grid-line" style={{ "--i": i }} />
      ))}
      {PULSE_PATHS.map((d, i) => (
        <circle key={d} r="3.5" className="article-grid-pulse" style={{ offsetPath: `path("${d}")`, "--i": i }} />
      ))}
    </svg>
  );
}
