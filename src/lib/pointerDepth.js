import { useEffect } from "react";

const allowed = () =>
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/**
 * Pointer depth for a hero (desktop pointer, motion allowed): writes the pointer position as
 * --mx/--my (−1…1) on `ref`'s element, at most once per frame. Layers read them through `depth()`
 * and ease via CSS transitions, so nothing runs while the pointer is still. Touch and reduced motion
 * get no listeners at all.
 */
export function usePointerDepth(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !allowed()) return;
    let raf = 0;
    let nx = 0;
    let ny = 0;
    const apply = () => {
      raf = 0;
      el.style.setProperty("--mx", nx.toFixed(3));
      el.style.setProperty("--my", ny.toFixed(3));
    };
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      nx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
      ny = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      nx = 0;
      ny = 0;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref]);
}

/** Inline style that offsets a layer by up to (px, py) following --mx/--my. */
export const depth = (px, py) => ({
  transform: `translate3d(calc(var(--mx, 0) * ${px}px), calc(var(--my, 0) * ${py}px), 0)`,
  transition: "transform 900ms cubic-bezier(0.22, 1, 0.36, 1)",
});
