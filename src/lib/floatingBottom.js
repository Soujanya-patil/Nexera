import { useEffect, useSyncExternalStore } from "react";

/*
 * Space claimed at the bottom of the viewport by fixed bars (the compare trays), so floating
 * controls (the call-back widget) can sit above them instead of on top of them. A tray reports its
 * height while it is shown; the widget reads the largest claim. Heights are tracked with a
 * ResizeObserver, so nothing is measured during scrolling.
 */
const claims = new Map(); // key -> px
const subs = new Set();
let inset = 0;
const emit = () => {
  inset = Math.max(0, ...claims.values());
  subs.forEach((f) => f());
};

/** Claims the height of `ref`'s element at the bottom of the viewport while `active`. */
export function useBottomClaim(key, ref, active) {
  useEffect(() => {
    const el = ref.current;
    if (!active || !el) return;
    const ro = new ResizeObserver(() => {
      claims.set(key, el.offsetHeight);
      emit();
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
      claims.delete(key);
      emit();
    };
  }, [key, ref, active]);
}

/** The largest bottom claim right now, in px (0 when no tray is shown). */
export function useBottomInset() {
  return useSyncExternalStore(
    (f) => {
      subs.add(f);
      return () => subs.delete(f);
    },
    () => inset,
    () => 0
  );
}
