import { useRef } from "react";
import { useParallax } from "../../lib/parallax";

/**
 * Clips its child image and lets it drift slowly as the frame scrolls through the viewport
 * (level 3, see lib/parallax.js). The inner layer is over-sized by 2 × `amount` % so the drift
 * never reveals an edge. Place inside a positioned, overflow-hidden frame.
 */
export default function ParallaxMedia({ amount = 6, className = "", children }) {
  const inner = useRef(null);
  useParallax(inner, { amount });
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <div ref={inner} className="absolute inset-x-0 will-change-transform" style={{ top: `-${amount}%`, bottom: `-${amount}%` }}>
        {children}
      </div>
    </div>
  );
}
