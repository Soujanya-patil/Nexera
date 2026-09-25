import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/**
 * "SHOWING 3 SYSTEMS" with the number rolling up/down when the filters change (Motion's
 * AnimatePresence; the old number leaves as the new one arrives). Screen readers get the plain
 * sentence through the polite live region.
 */
export default function LiveCount({ count, total }) {
  const reduce = useReducedMotion();
  return (
    <p className="flex shrink-0 items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-sage">
      <span aria-hidden="true" className="relative inline-flex h-2 w-2">
        <span className="absolute inset-0 rounded-full bg-signal/50 motion-safe:animate-ping [animation-duration:2.4s]" />
        <span className="relative h-2 w-2 rounded-full bg-signal" />
      </span>
      <span aria-hidden="true">Showing</span>
      <span aria-hidden="true" className="relative inline-flex h-[1.4em] min-w-[1.2ch] items-center justify-center overflow-hidden text-base text-forest">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={count}
            initial={reduce ? false : { y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { y: "-100%", opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="tabular-nums"
          >
            {count}
          </motion.span>
        </AnimatePresence>
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
