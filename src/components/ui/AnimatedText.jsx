import { createElement, useRef } from "react";
import { useScrollReveal } from "../../lib/scrollReveal";

/**
 * Section heading with the site's heading reveal (lib/scrollReveal, `self`): the first time it scrolls
 * into view its lines rise from behind their own masks, on the motion tokens. Visible by default; a
 * heading already on screen, scrolled past, reached in a fast scroll or under reduced motion is simply
 * shown. Use on section headings only, not body copy.
 */
export default function AnimatedText({ as = "h2", className = "", children, ...rest }) {
  const ref = useRef(null);
  const state = useScrollReveal(ref, { self: true });
  return createElement(as, { ref, className, "data-sr": "heading", "data-sr-state": state, ...rest }, children);
}
