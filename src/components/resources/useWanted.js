import { useEffect, useState } from "react";

/**
 * When to load a hub page's motion (Resources, Blog). Arriving from the site: at once (the h1 reveal
 * needs it). On a direct load, everything above the fold is already final, so it waits for the reader
 * to scroll, tap or press a key — or a few seconds after load — keeping the first paint's main thread
 * free.
 */
const MOTION_EVENTS = ["scroll", "wheel", "touchstart", "pointerdown", "keydown"];
export function useWanted(now) {
  const [wanted, setWanted] = useState(now);
  useEffect(() => {
    if (wanted) return;
    const go = () => setWanted(true);
    MOTION_EVENTS.forEach((t) => window.addEventListener(t, go, { once: true, passive: true }));
    const t = setTimeout(go, 3500);
    return () => {
      clearTimeout(t);
      MOTION_EVENTS.forEach((t) => window.removeEventListener(t, go));
    };
  }, [wanted]);
  return wanted;
}
