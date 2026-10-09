/*
 * The Guides card → article page transition: a deep-green curtain grows from the card's own shape to
 * the full screen, the article opens underneath, then the curtain lifts as the article's header plays.
 * Back reverses it: on /resources the curtain shrinks back into the card. Plain DOM + the Web
 * Animations API (no library), outside React so it survives the route change. Only ever started by a
 * plain click on a real link, so the link itself always works (and does without JavaScript).
 */
const EASE = "cubic-bezier(0.76, 0, 0.24, 1)";
const FULL = "inset(0px 0px 0px 0px round 0px)";
let covering = null; // { el, slug } while a card's curtain covers the screen
let openedFrom = null; // the slug of the article last opened from a Guides card

const clipOf = (r) => `inset(${r.top}px ${window.innerWidth - r.right}px ${window.innerHeight - r.bottom}px ${r.left}px round 16px)`;

function curtain() {
  const el = document.createElement("div");
  el.className = "page-curtain";
  el.setAttribute("aria-hidden", "true");
  document.body.appendChild(el);
  return el;
}

/** Grows the curtain from `card` to the full screen. Resolves when it covers the screen. */
export function coverFrom(card, slug) {
  covering?.el.remove();
  const el = curtain();
  covering = { el, slug };
  return el.animate({ clipPath: [clipOf(card.getBoundingClientRect()), FULL] }, { duration: 560, easing: EASE, fill: "forwards" }).finished;
}

/** True while a Guides card's curtain covers the screen (the article then holds its header intro). */
export const underCurtain = () => !!covering;

/** Lifts the curtain off the article (it slides up and away). */
export function uncover() {
  if (!covering) return Promise.resolve();
  const { el, slug } = covering;
  covering = null;
  openedFrom = slug;
  return el
    .animate({ clipPath: [FULL, "inset(0px 0px 100% 0px round 0px)"] }, { duration: 640, easing: EASE, fill: "forwards" })
    .finished.then(() => el.remove(), () => el.remove());
}

/** Back on /resources after an article opened from this card: true once, then forgotten. */
export function returningTo(slug) {
  if (openedFrom !== slug) return false;
  openedFrom = null;
  return true;
}

/** The reverse: the curtain starts full screen and shrinks back into the card, fading as it lands. */
export function coverBack(card) {
  const el = curtain();
  return el
    .animate({ clipPath: [FULL, clipOf(card.getBoundingClientRect())], opacity: [1, 1, 0] }, { duration: 620, easing: EASE, fill: "forwards" })
    .finished.then(() => el.remove(), () => el.remove());
}

/** If anything goes wrong mid-transition: drop the curtain. */
export function dropCurtain() {
  covering?.el.remove();
  covering = null;
}
