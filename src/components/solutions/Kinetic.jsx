import { createElement, useRef } from "react";
import { useScrollReveal } from "../../lib/scrollReveal";

/*
 * Kinetic typography for the Solutions pages, on the site's shared reveal (lib/scrollReveal): every
 * piece of text here is real HTML that is visible by default; it animates only as it first enters the
 * viewport at a normal pace (never when already on screen, passed, in a fast scroll or under reduced
 * motion), once.
 */

/** Heading text with one key phrase wrapped in a marker (skipped if the phrase isn't in the text). */
function withMark(text, mark) {
  if (!mark || typeof text !== "string") return text;
  const at = text.indexOf(mark);
  if (at < 0) return text;
  return [text.slice(0, at), <span key="m" className="h2-mark">{mark}</span>, text.slice(at + mark.length)];
}

/**
 * Section heading (h2 by default) with the shared heading reveal: its lines rise from behind their own
 * masks. The key phrase's marker is part of the text, so it arrives with its line.
 */
export function KineticHeading({ as = "h2", mark, className = "", children, ...rest }) {
  const ref = useRef(null);
  const state = useScrollReveal(ref, { self: true });
  return createElement(as, { ref, className, "data-sr": "heading", "data-sr-state": state, ...rest }, withMark(children, mark));
}

/** Eyebrow with a leading rule; fades and rises in with the shared reveal. */
export function KineticEyebrow({ className = "", ruleClass = "bg-current", children }) {
  const ref = useRef(null);
  const state = useScrollReveal(ref, { self: true });
  return (
    <p ref={ref} data-sr="" data-sr-state={state} className={`flex items-center gap-3 ${className}`}>
      <span aria-hidden="true" className={`h-px w-8 opacity-70 ${ruleClass}`} />
      {children}
    </p>
  );
}
