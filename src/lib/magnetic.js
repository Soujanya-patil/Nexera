import { useEffect, useRef } from "react";
import { loadGsap } from "./motion";

const RADIUS = 60; // px beyond the button's edge where the pull starts
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
        // Measured from the button's edge, not its centre, so wide pills engage as the cursor
        // approaches; the pull fades out to nothing RADIUS px away.
        const rect = el.getBoundingClientRect();
        const hw = rect.width / 2;
        const hh = rect.height / 2;
        const dx = e.clientX - (rect.left + hw);
        const dy = e.clientY - (rect.top + hh);
        const edge = Math.hypot(Math.max(Math.abs(dx) - hw, 0), Math.max(Math.abs(dy) - hh, 0));
        if (edge > RADIUS) {
          xTo(0);
          yTo(0);
          return;
        }
        const fade = 1 - edge / RADIUS;
        xTo((dx / (hw + RADIUS)) * MAX_OFFSET * fade);
        yTo((dy / (hh + RADIUS)) * MAX_OFFSET * fade);
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
