import { useRef } from "react";
import { useMotion, useScrollScene } from "../lib/motion";

/**
 * Ambient engineering-grid backdrop: a faint measured grid, a restrained teal glow, and (in
 * cinematic mode only) a slow vertical drift as the section passes. Decorative and inert —
 * aria-hidden, pointer-events-none, always behind content.
 *
 * CSS gradients, not canvas or WebGL. A two-axis repeating-linear-gradient is a single composited
 * paint with no per-frame JS, which is the whole reason this can sit behind several sections at
 * once without costing anything; a particle canvas or a Three.js plane would buy nothing visible
 * here and would have to be torn down per section. The drift animates `yPercent` on one layer, so
 * it stays on the compositor.
 *
 * The grid is drawn on an oversized inset (-12%) so the parallax drift never exposes an edge, and
 * masked to fade out at the top and bottom so it dissolves into the scene instead of stopping on a
 * hard line.
 *
 * `size` is the grid pitch in px, `tone` the line opacity, `glow` whether to add the teal bloom.
 * These are inline styles rather than Tailwind classes on purpose: they're runtime-varying values,
 * and Tailwind's JIT only emits classes it can find as literal text in the source.
 */
const FADE = {
  maskImage: "linear-gradient(to bottom, transparent 0, #000 18%, #000 82%, transparent 100%)",
  WebkitMaskImage: "linear-gradient(to bottom, transparent 0, #000 18%, #000 82%, transparent 100%)",
};

export default function TechGrid({ size = 56, tone = 0.05, glow = true, drift = 4 }) {
  const { mode } = useMotion();
  const cine = mode === "cinematic";
  const root = useRef(null);

  useScrollScene(
    root,
    ({ gsap, q }) => {
      gsap.fromTo(
        q('[data-a="grid-layer"]'),
        { yPercent: -drift },
        {
          yPercent: drift,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: 0.6, invalidateOnRefresh: true },
        }
      );
    },
    cine
  );

  return (
    <div ref={root} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden" style={FADE}>
      <div
        data-a="grid-layer"
        className="absolute inset-[-12%] will-change-transform"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(242,240,234,${tone}) 1px, transparent 1px), linear-gradient(to bottom, rgba(242,240,234,${tone}) 1px, transparent 1px)`,
          backgroundSize: `${size}px ${size}px`,
        }}
      />
      {glow && (
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(55% 45% at 50% 45%, rgba(0,167,142,0.10) 0%, transparent 70%)" }}
        />
      )}
    </div>
  );
}
