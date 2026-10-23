// DOM contrast check: every visible text element's colour (with element + ancestor opacity) against the
// ground behind it — the nearest ancestors' background colours composited until opaque; text over a
// photo or gradient (background-image / an <img> or <video> underneath) is skipped. WCAG AA: 4.5:1, or
// 3:1 for large text. Also the focus-ring colour (outline-color on every focusable) against its ground: 3:1.
// Usage: node domcontrast.mjs <base> <width> <path…>
import { chromium } from "playwright-core";
const [BASE, W, ...PATHS] = process.argv.slice(2);
const b = await chromium.launch((process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: "chrome" }));
const ctx = await b.newContext({ viewport: { width: +W, height: 900 }, isMobile: +W < 800, hasTouch: +W < 800, reducedMotion: "reduce" });
let fails = 0;
for (const path of PATHS) {
  const p = await ctx.newPage();
  await p.goto(BASE + path, { waitUntil: "networkidle" });
  await p.waitForTimeout(800);
  const res = await p.evaluate(() => {
    const cv = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    const rgba = (css) => { cv.clearRect(0, 0, 1, 1); cv.fillStyle = "#000"; cv.fillStyle = css; cv.fillRect(0, 0, 1, 1); const d = cv.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3] / 255]; };
    const lum = ([r, g, b]) => { const f = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4); return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
    const ratio = (a, c) => { const [x, y] = [lum(a), lum(c)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
    const over = ([r, g, b, a], [R, G, B]) => [r * a + R * (1 - a), g * a + G * (1 - a), b * a + B * (1 - a)];
    // The ground behind `el`: composite ancestors' background colours, top-down; null if an image/gradient/media is involved.
    const ground = (el) => {
      const layers = [];
      for (let n = el; n; n = n.parentElement) {
        const cs = getComputedStyle(n);
        if (cs.backgroundImage !== "none" && !/^linear-gradient\(rgba\(0, 0, 0, 0\)/.test(cs.backgroundImage)) return null;
        if (n !== el && n.querySelector(":scope > img, :scope > video, :scope > picture, :scope > canvas")) {
          const m = n.querySelector(":scope > img, :scope > video, :scope > picture, :scope > canvas");
          const mr = m.getBoundingClientRect(), er = el.getBoundingClientRect();
          if (getComputedStyle(m).position === "absolute" && mr.left <= er.left && mr.right >= er.right && mr.top <= er.top && mr.bottom >= er.bottom) return null;
        }
        const c = rgba(cs.backgroundColor);
        if (c[3] > 0) layers.push([...c.slice(0, 3), c[3] * parseFloat(cs.opacity)]);
        if (c[3] >= 1) break;
        // A ground painted by its own background layers (the header): its declared dark ground.
        if (n.dataset?.ground === "dark") { layers.push([11, 42, 34, 1]); break; }
      }
      let g = [255, 255, 255];
      for (const L of layers.reverse()) g = over(L, g);
      return g;
    };
    const out = [];
    const seen = new Set();
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const t = walker.currentNode;
      const el = t.parentElement;
      if (!t.textContent.trim() || !el || seen.has(el) || el.closest("svg, [aria-hidden='true'], .sr-only, noscript, option, [inert]")) continue;
      seen.add(el);
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height || cs.visibility === "hidden") continue;
      let op = 1;
      for (let n = el; n; n = n.parentElement) op *= parseFloat(getComputedStyle(n).opacity);
      if (op < 0.05) continue;
      const fill = cs.webkitTextFillColor && rgba(cs.webkitTextFillColor)[3] === 0;
      if (fill) continue; // gradient text
      const g = ground(el);
      if (!g) continue;
      const c = rgba(cs.color);
      const txt = over([c[0], c[1], c[2], c[3] * op], g);
      const cr = ratio(txt, g);
      const large = parseFloat(cs.fontSize) >= 24 || (parseFloat(cs.fontSize) >= 18.66 && parseInt(cs.fontWeight) >= 600);
      if (cr < (large ? 3 : 4.5)) out.push(`text ${cr.toFixed(2)} "${t.textContent.trim().slice(0, 34)}" ${el.tagName.toLowerCase()}.${String(el.className).split(" ").slice(0, 5).join(".")} color=${cs.color} op=${op.toFixed(2)}`);
    }
    // Focus rings (outline colour) against the ground around the control.
    for (const el of document.querySelectorAll("a[href], button, summary, input, select, textarea")) {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height || el.closest("[inert], [aria-hidden='true']")) continue;
      const g = ground(el.parentElement || el);
      if (!g) continue;
      const cr = ratio(rgba(getComputedStyle(el).outlineColor).slice(0, 3), g);
      if (cr < 3) out.push(`ring ${cr.toFixed(2)} ${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 30)}" ring=${getComputedStyle(el).outlineColor}`);
    }
    return out;
  });
  fails += res.length;
  console.log(`${path} @${W}: ${res.length}${res.length ? "\n   " + [...new Set(res)].slice(0, 25).join("\n   ") : ""}`);
  await p.close();
}
console.log(`domcontrast: ${fails} below AA`);
await b.close();
