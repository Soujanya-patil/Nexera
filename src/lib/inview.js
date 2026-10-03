/*
 * "Reveal once" plumbing shared by every scroll reveal on the site: ONE IntersectionObserver for all
 * watched elements and ONE passive scroll listener for scroll speed.
 *
 * Why not a ScrollTrigger per element: each trigger measures its element (a forced, synchronous
 * layout) when it is created, and pages create dozens of them while other components are writing
 * styles — the reads and writes interleave and the browser lays the page out again and again. An
 * IntersectionObserver reports positions asynchronously, after layout, for all elements in one batch.
 *
 * onceInView(el, { enter, show }) — calls exactly one of them, once:
 *   show("visible")  the element is already on screen when watching starts
 *   show("above")    it is already above the viewport (scrolled past)
 *   show("fast")     it arrives while the page is scrolling fast (a fling): no animation
 *   show("back")     it comes back into view from above without having been revealed (a jump past)
 *   enter(entries)   it scrolls into view at a normal pace — animate it
 * Returns an unsubscribe function.
 */

const FAST = 700; // px/s: faster than an unhurried reading pace

let lastY = 0;
let lastT = 0;
let speed = 0;
let tracking = false;
const track = () => {
  const y = window.scrollY;
  const t = performance.now();
  if (t > lastT) speed = (Math.abs(y - lastY) / (t - lastT)) * 1000;
  lastY = y;
  lastT = t;
};
/** Current scroll speed in px/s (0 when the page hasn't scrolled in the last 200 ms). */
export const scrollSpeed = () => (performance.now() - lastT > 200 ? 0 : speed);

let io = null;
const watched = new Map(); // element -> { enter, show, first }
// Elements entering in the same callback are handed to their `enter` together (for staggers).
let pendingEnter = new Map();

function onEntries(entries) {
  pendingEnter = new Map();
  for (const entry of entries) {
    const w = watched.get(entry.target);
    if (!w) continue;
    const r = entry.boundingClientRect;
    const vh = entry.rootBounds?.height ?? window.innerHeight;
    if (w.first) {
      w.first = false;
      if (entry.isIntersecting) w.initial ? enterNow(w, entry) : finish(entry.target, "visible");
      else if (r.bottom <= 0) finish(entry.target, "above");
      continue; // below the viewport: wait
    }
    if (!entry.isIntersecting) continue;
    if (r.top < 0 && r.bottom < vh) finish(entry.target, "back");
    else if (scrollSpeed() > FAST) finish(entry.target, "fast");
    else enterNow(w, entry);
  }
  for (const [enter, els] of pendingEnter) enter(els);
}
function enterNow(w, entry) {
  unwatch(entry.target);
  const list = pendingEnter.get(w.enter) ?? [];
  list.push(entry.target);
  pendingEnter.set(w.enter, list);
}
function finish(el, why) {
  const w = watched.get(el);
  unwatch(el);
  w?.show(why);
}
function unwatch(el) {
  watched.delete(el);
  io?.unobserve(el);
}

/**
 * Watch `el` once. `enter(elements)` receives every element of the same `enter` function that entered
 * in one batch. `initial: true` animates elements that are already on screen at setup too (reveals);
 * otherwise those are simply shown.
 */
export function onceInView(el, { enter, show, initial = false }) {
  if (!io) io = new IntersectionObserver(onEntries, { threshold: 0 });
  if (!tracking) {
    tracking = true;
    track();
    window.addEventListener("scroll", track, { passive: true });
  }
  watched.set(el, { enter, show, initial, first: true });
  io.observe(el);
  return () => unwatch(el);
}
