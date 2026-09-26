import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const VARIANTS = {
  solid: "bg-signal text-forest hover:bg-[#a4e39d] hover:shadow-[0_0_24px_2px_rgba(144,217,136,0.35)]",
  outline: "border border-white/60 text-white hover:border-white hover:bg-white/10",
};

/** Solid pills: a soft light that follows the pointer across the button while it is hovered. */
const trackPointer = (e) => {
  if (e.pointerType !== "mouse") return;
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--sx", `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
  e.currentTarget.style.setProperty("--sy", `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
};

/**
 * The mockup's pill CTA: filled green or white outline (the outline is for dark grounds only).
 * Level-1 interaction for every CTA: the arrow nudges forward on hover and the pill gives a small
 * press on click. `ref` is forwarded (React 19 passes it as a prop) so MagneticButton can drive it.
 *
 * Opt-in hero/closing-band treatments (hover only, nothing runs while idle):
 *   `spotlight` — solid pill: a soft light follows the pointer across the green.
 *   `sweep`     — outline pill: a short green light travels around the border (static highlight under
 *                 reduced motion; see .pill-sweep in index.css).
 */
export default function PillLink({ to, variant = "solid", arrow = false, spotlight = false, sweep = false, className = "", children, ...rest }) {
  const extra = spotlight || sweep;
  return (
    <Link
      to={to}
      onPointerMove={spotlight ? trackPointer : undefined}
      className={`group/pill inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-[background-color,border-color,box-shadow,scale,translate] duration-300 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal ${
        extra ? "relative isolate" : ""
      } ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {spotlight && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 rounded-full opacity-0 transition-opacity duration-300 group-hover/pill:opacity-100"
          style={{ background: "radial-gradient(60% 120% at var(--sx, 50%) var(--sy, 50%), rgba(255,255,255,0.42), transparent 70%)" }}
        />
      )}
      {sweep && <span aria-hidden="true" className="pill-sweep pointer-events-none absolute -inset-px -z-10 rounded-full" />}
      {children}
      {arrow && (
        <ArrowRight
          aria-hidden="true"
          className="h-4 w-4 transition-transform duration-300 ease-out group-hover/pill:translate-x-1"
          strokeWidth={2}
        />
      )}
    </Link>
  );
}
