import { useEffect } from "react";
import { useMotionValue, useMotionValueEvent, useScroll } from "framer-motion";

/**
 * Scroll progress (0–1) of `target` as a plain JS-driven motion value.
 * Framer's native scroll-timeline acceleration mis-extrapolates opacity outside the
 * mapped range (values drift back after the range ends), so derived values are computed
 * from this mirror instead, which always clamps.
 */
export default function useScrollProgress(target, offset) {
  const { scrollYProgress } = useScroll({ target, offset });
  const progress = useMotionValue(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => progress.set(v));
  useEffect(() => progress.set(scrollYProgress.get()), [progress, scrollYProgress]);
  return progress;
}
