import { DUR } from "./tokens";

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// The emphasized ease (lib/tokens.js, index.css --ease-emphasized).
const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

/**
 * Opens or closes a <details> with its height animated (no jump); plain toggle under reduced motion.
 * The site's one accordion motion: the article FAQ and the Solutions / partner FAQs (FaqList) use it.
 */
export function toggleDetails(e) {
  const d = e.currentTarget.parentElement;
  if (reducedMotion() || !d.animate) return; // the native toggle
  e.preventDefault();
  if (d.dataset.busy) return;
  d.dataset.busy = "1";
  const summary = d.querySelector("summary");
  const border = d.offsetHeight - d.clientHeight; // the card's top and bottom borders
  const closed = `${summary.offsetHeight + border}px`;
  const done = () => {
    delete d.dataset.busy;
    d.style.height = "";
    d.style.overflow = "";
  };
  d.style.overflow = "hidden";
  if (!d.open) {
    d.open = true;
    const full = `${d.scrollHeight + border}px`;
    d.animate({ height: [closed, full] }, { duration: DUR.base * 1000, easing: EASE }).onfinish = done;
  } else {
    const full = `${d.offsetHeight}px`;
    d.dataset.closing = "1";
    d.animate({ height: [full, closed] }, { duration: DUR.base * 1000 * 0.75, easing: EASE }).onfinish = () => {
      d.open = false;
      delete d.dataset.closing;
      done();
    };
  }
}
