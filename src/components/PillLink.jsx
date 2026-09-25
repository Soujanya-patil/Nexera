import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const VARIANTS = {
  solid: "bg-signal text-forest hover:bg-[#a4e39d] hover:shadow-[0_0_24px_2px_rgba(144,217,136,0.35)]",
  outline: "border border-white/60 text-white hover:border-white hover:bg-white/10",
};

/**
 * The mockup's pill CTA: filled green or white outline (the outline is for dark grounds only).
 * Level-1 interaction for every CTA: the arrow nudges forward on hover and the pill gives a small
 * press on click. `ref` is forwarded (React 19 passes it as a prop) so MagneticButton can drive it.
 */
export default function PillLink({ to, variant = "solid", arrow = false, className = "", children, ...rest }) {
  return (
    <Link
      to={to}
      className={`group/pill inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-[background-color,border-color,box-shadow,scale,translate] duration-300 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
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
