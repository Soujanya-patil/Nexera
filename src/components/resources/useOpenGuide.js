import { useNavigate } from "react-router-dom";
import { ArticleRoute } from "../../pages/lazy";
import { coverFrom, dropCurtain } from "../article/curtain";

/**
 * A Guides card is a real link to its article. A plain click (with motion allowed) plays the page
 * transition — a curtain grows from the card to the full screen while the article loads, then the
 * article lifts it — and opens the article in the app. Anything else (a modified click, reduced motion,
 * no JavaScript) is the link's own normal navigation, and if the transition can't finish (the article
 * fails to load, or takes over 6 s) the click becomes a normal page load, so it never "does nothing".
 * The card needs data-slug (the curtain remembers it, for the reverse on Back).
 */
export function useOpenGuide() {
  const navigate = useNavigate();
  return (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !document.body.animate) return;
    e.preventDefault();
    const card = e.currentTarget;
    const href = card.getAttribute("href");
    let gone = false;
    const hard = () => {
      if (gone) return;
      gone = true;
      dropCurtain();
      window.location.assign(href);
    };
    const timer = setTimeout(hard, 6000);
    Promise.all([coverFrom(card, card.dataset.slug), ArticleRoute.preload()])
      .then(() => {
        if (gone) return;
        gone = true;
        clearTimeout(timer);
        navigate(href);
      })
      .catch(hard);
  };
}

/**
 * Pointer position on a card as CSS variables: the spotlight (--mx/--my) and a small tilt (--rx/--ry).
 * The side under the pointer tilts towards the viewer, so the card grows under the pointer and never
 * slips out from under it at an edge (which would drop the hover and the click).
 */
export function trackCard(e, tilt = 0) {
  if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty("--mx", `${e.clientX - r.left}px`);
  el.style.setProperty("--my", `${e.clientY - r.top}px`);
  if (tilt) {
    el.style.setProperty("--ry", `${(-((e.clientX - r.left) / r.width - 0.5) * tilt * 2).toFixed(2)}deg`);
    el.style.setProperty("--rx", `${(((e.clientY - r.top) / r.height - 0.5) * tilt * 2).toFixed(2)}deg`);
  }
}
export function untrackCard(e) {
  e.currentTarget.style.removeProperty("--rx");
  e.currentTarget.style.removeProperty("--ry");
}
