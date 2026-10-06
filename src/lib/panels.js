import { useEffect } from "react";

// "Expanding panels": the hovered / focused card's share of the row (the others keep 1).
const GROW = 1.6;
const PANELS = "(hover: hover) and (pointer: fine) and (min-width: 1024px) and (prefers-reduced-motion: no-preference)";

/**
 * The hub cards as "expanding panels" (desktop, mouse, motion allowed): the hovered or focused card
 * opens to 1.6 shares of the row while the other two narrow (400 ms, power3.out). Nothing moves in the
 * layout — that would be a layout shift on every hover. Each card is placed once, spanning every
 * position it can ever show; what changes is its visible window (clip-path inset) and the position of
 * its text block within it (transform), both precomputed here as CSS custom properties for the four
 * states (none / 1st / 2nd / 3rd card open) and switched by index.css. The text block keeps the width
 * of the narrowest window, so it is never clipped. Recomputed on resize; elsewhere the plain grid.
 */
export function usePanels(ref) {
  useEffect(() => {
    const ul = ref.current;
    if (!ul) return;
    const mq = window.matchMedia(PANELS);
    const items = [...ul.children];
    const clear = () => {
      delete ul.dataset.panels;
      items.forEach((li) => li.removeAttribute("style"));
    };
    const layout = () => {
      if (!mq.matches) return clear();
      const cs = getComputedStyle(ul);
      const pad = parseFloat(cs.paddingLeft);
      const gap = parseFloat(cs.columnGap) || 20;
      const avail = ul.clientWidth - pad - parseFloat(cs.paddingRight) - gap * (items.length - 1);
      // Visible [left, right] of each card in each state (-1: none open).
      const windows = (open) => {
        const shares = items.map((_, i) => (i === open ? GROW : 1));
        const sum = shares.reduce((a, b) => a + b, 0);
        let x = 0;
        return shares.map((w) => {
          const left = x;
          x += (avail * w) / sum + gap;
          return [left, left + (avail * w) / sum];
        });
      };
      const states = [-1, ...items.map((_, i) => i)].map(windows);
      const narrowest = avail / (items.length - 1 + GROW);
      ul.dataset.panels = "";
      items.forEach((li, i) => {
        const from = Math.min(...states.map((s) => s[i][0]));
        const to = Math.max(...states.map((s) => s[i][1]));
        li.style.left = `${pad + from}px`;
        li.style.width = `${to - from}px`;
        li.style.setProperty("--tw", `${narrowest}px`);
        states.forEach((s, k) => {
          const [l, r] = s[i];
          const name = k === 0 ? "n" : k - 1;
          li.style.setProperty(`--c${name}`, `inset(0 ${to - r}px 0 ${l - from}px round 16px)`);
          li.style.setProperty(`--x${name}`, `${l - from}px`);
        });
      });
    };
    layout();
    window.addEventListener("resize", layout);
    mq.addEventListener("change", layout);
    return () => {
      window.removeEventListener("resize", layout);
      mq.removeEventListener("change", layout);
      clear();
    };
  }, [ref]);
}
