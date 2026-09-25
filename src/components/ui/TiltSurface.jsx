import { useState } from "react";
import { Tilt } from "../unlumen-ui/tilt";

const canTilt = () =>
  window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * NEXERA wrapper around Unlumen UI's Tilt primitive (installed from the Unlumen registry): a very
 * small 3D tilt that follows the pointer, for product surfaces only (level 2). Kept to a few degrees
 * with a soft spring so an industrial product reads as solid, not floaty. On touch devices and under
 * prefers-reduced-motion it renders a plain wrapper with no motion at all.
 */
export default function TiltSurface({ children, className = "", degrees = 3 }) {
  const [enabled] = useState(canTilt);
  if (!enabled) return <div className={className}>{children}</div>;
  return (
    <Tilt rotationFactor={degrees} springOptions={{ stiffness: 220, damping: 26, mass: 0.6 }} className={className}>
      {children}
    </Tilt>
  );
}
