import { useLayoutEffect, useRef } from "react";
import { motion, useMotionValueEvent, useTransform } from "framer-motion";
import Reveal from "./Reveal";
import CountUp from "./CountUp";

export const stats = [
  { value: "30–33%", label: "Projected CAGR" },
  { value: "24×7", label: "Availability" },
  { value: "Quick", label: "Response times" },
];

/** In-flow stat bar for mobile, short viewports and reduced-motion (count-up fires on view, or shows the end state). */
export default function StatBar() {
  return (
    <section className="bg-ice border-b border-line">
      <Reveal as="div" className="mx-auto max-w-6xl px-6 py-10 grid grid-cols-3 divide-x divide-line">
        {stats.map((stat) => (
          <div key={stat.label} className="px-3 sm:px-6 first:pl-0 text-center">
            <p className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold text-ink whitespace-nowrap">
              <CountUp value={stat.value} />
            </p>
            <p className="mt-1 text-sm text-graphite">{stat.label}</p>
          </div>
        ))}
      </Reveal>
    </section>
  );
}

/** Counts a numeric prefix up from a scroll-linked 0–1 motion value, writing to the DOM directly (no React re-render per frame). */
function ScrollCount({ value, t }) {
  const match = value.match(/^(\d+(?:\.\d+)?)(.*)$/);
  const target = match ? parseFloat(match[1]) : null;
  const decimals = match && match[1].includes(".") ? match[1].split(".")[1].length : 0;
  const suffix = match ? match[2] : "";
  const ref = useRef(null);

  const write = (v) => {
    if (ref.current && target !== null) {
      const eased = 1 - Math.pow(1 - v, 3);
      ref.current.textContent = `${(target * eased).toFixed(decimals)}${suffix}`;
    }
  };

  useLayoutEffect(() => write(t.get()));
  useMotionValueEvent(t, "change", write);

  return (
    <>
      <span className="sr-only">{value}</span>
      <span ref={ref} aria-hidden="true">
        {target === null ? value : ""}
      </span>
    </>
  );
}

/** One stat in the pinned sequence: slides up and counts, in a window of the hero's scroll progress. */
export function ScrollStat({ stat, progress, index }) {
  const start = 0.42 + index * 0.07;
  const t = useTransform(progress, [start, start + 0.3], [0, 1], { clamp: true });
  const opacity = useTransform(t, [0, 0.35], [0, 1]);
  const y = useTransform(t, [0, 1], [28, 0]);

  return (
    <motion.div style={{ opacity, y }} className="px-3 sm:px-6 first:pl-0 text-center will-change-transform">
      <p className="font-serif text-3xl md:text-4xl font-semibold text-ink whitespace-nowrap">
        <ScrollCount value={stat.value} t={t} />
      </p>
      <p className="mt-1 text-sm text-graphite">{stat.label}</p>
    </motion.div>
  );
}
