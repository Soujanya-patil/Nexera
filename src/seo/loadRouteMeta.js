import { afterFirstPaint } from "../lib/motion";

let pending;
let startNow;
const asked = new Promise((resolve) => (startNow = resolve));
/**
 * The route table (src/seo/routes.js, which carries the product catalogue for the product pages'
 * titles) as its own chunk, fetched once the first screen is up — or at once when asked for earlier
 * (the first client-side navigation). Until it arrives the served HTML's own <title>, description
 * and canonical are the right ones for the page on screen.
 */
export function loadRouteMeta({ now = false } = {}) {
  if (now) startNow();
  pending ??= Promise.race([afterFirstPaint(), asked]).then(() => import("./routes"));
  return pending;
}
