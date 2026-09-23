import { useEffect, useRef } from "react";
import { loadGsap } from "./motion";

const RADIUS = 70; // px — small pull radius, not the whole button's hit area and beyond
const MAX_OFFSET = 8; // px — "a few px max," reads as premium, not bouncy

/**
 * Subtle magnetic pull toward the cursor for a primary CTA. Desktop + motion-enabled only:
 * bails out under `prefers-reduced-motion` and on coarse-pointer (touch) devices, where the
 * effect means nothing without a real cursor. Uses `gsap.quickTo` (not a tween built and killed
 * per mousemove) so repeated updates are cheap.
 */
export function useMagnetic() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let cancelled = false;
    let cleanupListeners = () => {};

    loadGsap().then(({ gsap }) => {
      if (cancelled) return;
      const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3" });

      const onMove = (e) => {
        const rect = el.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);
        const dist = Math.hypot(dx, dy);
        if (dist > RADIUS) {
          xTo(0);
          yTo(0);
          return;
        }
        const pull = (1 - dist / RADIUS) * MAX_OFFSET;
        xTo((dx / (dist || 1)) * pull);
        yTo((dy / (dist || 1)) * pull);
      };
      const onLeave = () => {
        xTo(0);
        yTo(0);
      };

      window.addEventListener("mousemove", onMove, { passive: true });
      el.addEventListener("mouseleave", onLeave);
      cleanupListeners = () => {
        window.removeEventListener("mousemove", onMove);
        el.removeEventListener("mouseleave", onLeave);
      };
    });

    return () => {
      cancelled = true;
      cleanupListeners();
    };
  }, []);

  return ref;
}
