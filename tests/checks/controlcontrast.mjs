// Label contrast of selectable controls (tabs, chips, toggles, filters, nav items, pressed buttons) in
// their resting / selected state, and again on hover and on keyboard focus. The ground is what is
// actually painted behind the label's centre: the elements stacked under it (elementsFromPoint, so a
// sliding indicator counts), their background colours composited. AA: 4.5:1 (3:1 for large text).
// Usage: node controlcontrast.mjs <base> <width> <path…>
import { chromium } from "playwright-core";
const [BASE, W, ...PATHS] = process.argv.slice(2);
const b = await chromium.launch((process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: "chrome" }));
const ctx = await b.newContext({ viewport: { width: +W, height: 900 }, isMobile: +W < 800, hasTouch: +W < 800, reducedMotion: "reduce" });
const SEL = [
  '[role="tablist"] :is(button, a, [role="tab"])',
  '[role="radiogroup"] :is(button, label, [role="radio"])',
  "button[aria-pressed]", "[aria-selected]", "a[aria-current]", "button[aria-current]",
  "label:has(> input[type=radio])", "label:has(> input[type=checkbox])",
  'nav[aria-label] a', "[data-active] button",
].join(", ");
let fails = 0;
const measure = (p, idx) =>
  p.evaluate(({ SEL, idx }) => {
    const cv = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    const rgba = (css) => { cv.clearRect(0, 0, 1, 1); cv.fillStyle = "#000"; cv.fillStyle = css; cv.fillRect(0, 0, 1, 1); const d = cv.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3] / 255]; };
    const lum = ([r, g, b]) => { const f = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4); return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
    const ratio = (a, c) => { const [x, y] = [lum(a), lum(c)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
    const over = ([r, g, b, a], [R, G, B]) => [r * a + R * (1 - a), g * a + G * (1 - a), b * a + B * (1 - a)];
    const els = [...document.querySelectorAll(SEL)].filter((el) => { const r = el.getBoundingClientRect(); return r.width > 4 && r.height > 4 && getComputedStyle(el).visibility !== "hidden" && !el.closest("[inert]") && el.textContent.trim(); });
    const list = idx == null ? els : [els[idx]].filter(Boolean);
    return {
      count: els.length,
      rows: list.map((el) => {
        // The label: the deepest element holding the control's text.
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        let t;
        while ((t = walker.nextNode()) && !t.textContent.trim());
        const lab = t?.parentElement ?? el;
        const range = document.createRange();
        if (t) range.selectNodeContents(t);
        const r = (t ? range : lab).getBoundingClientRect();
        const x = r.left + r.width / 2, y = r.top + r.height / 2;
        if (!r.width || !r.height || x < 0 || y < 0 || x > innerWidth || y > innerHeight) return null; // a hidden label (display: none) has no box
        const stack = document.elementsFromPoint(x, y);
        const layers = [];
        let photo = false;
        for (const n of stack) {
          // (the label element itself counts: its own background is what its text sits on)
          const cs = getComputedStyle(n);
          if (n.tagName === "IMG" || n.tagName === "VIDEO" || (cs.backgroundImage !== "none" && !cs.backgroundImage.startsWith("linear-gradient(rgba(0, 0, 0, 0)"))) { photo = true; break; }
          const c = rgba(cs.backgroundColor);
          let op = 1;
          for (let q = n; q; q = q.parentElement) op *= parseFloat(getComputedStyle(q).opacity);
          if (c[3] > 0) layers.push([c[0], c[1], c[2], c[3] * op]);
          if (c[3] >= 1 && op >= 0.99) break;
        }
        if (photo) return null;
        let g = [255, 255, 255];
        for (const L of layers.reverse()) g = over(L, g);
        const cs = getComputedStyle(lab);
        let op = 1;
        for (let q = lab; q; q = q.parentElement) op *= parseFloat(getComputedStyle(q).opacity);
        const c = rgba(cs.color);
        const cr = ratio(over([c[0], c[1], c[2], c[3] * op], g), g);
        const large = parseFloat(cs.fontSize) >= 24 || (parseFloat(cs.fontSize) >= 18.66 && parseInt(cs.fontWeight) >= 600);
        const state = ["aria-pressed", "aria-selected", "aria-current", "aria-checked"].map((a) => el.getAttribute(a) && `${a}=${el.getAttribute(a)}`).filter(Boolean).join(" ") || (el.querySelector("input:checked") ? "checked" : "");
        return { cr: +cr.toFixed(2), need: large ? 3 : 4.5, text: el.textContent.trim().replace(/\s+/g, " ").slice(0, 28), state, color: cs.color, ground: `rgb(${g.map(Math.round).join(",")})` };
      }).filter(Boolean),
    };
  }, { SEL, idx });
for (const path of PATHS) {
  const p = await ctx.newPage();
  await p.goto(BASE + path, { waitUntil: "networkidle" });
  await p.waitForTimeout(900);
  const out = [];
  const base = await measure(p, null);
  for (const r of base.rows) if (r.cr < r.need) out.push(`rest  ${r.cr} "${r.text}" ${r.state} color=${r.color} ground=${r.ground}`);
  // Hover and keyboard focus, one control at a time (desktop pointer for hover).
  for (let i = 0; i < base.count; i++) {
    const loc = p.locator(SEL).filter({ hasText: /\S/ }).nth(i);
    if (!(await loc.isVisible().catch(() => false))) continue;
    await loc.scrollIntoViewIfNeeded().catch(() => {});
    for (const mode of +W < 800 ? ["focus"] : ["hover", "focus"]) {
      if (mode === "hover") await loc.hover({ force: true }).catch(() => {});
      else { await p.keyboard.press("Tab").catch(() => {}); await loc.focus().catch(() => {}); }
      await p.waitForTimeout(260);
      const m = await measure(p, i);
      for (const r of m.rows) if (r.cr < r.need) out.push(`${mode.padEnd(5)} ${r.cr} "${r.text}" ${r.state} color=${r.color} ground=${r.ground}`);
      await p.mouse.move(1, 1);
      await p.evaluate(() => document.activeElement?.blur());
    }
  }
  const uniq = [...new Set(out)];
  fails += uniq.length;
  console.log(`${path} @${W}: ${base.count} controls, ${uniq.length} below AA${uniq.length ? "\n   " + uniq.slice(0, 30).join("\n   ") : ""}`);
  await p.close();
}
console.log(`controlcontrast: ${fails} below AA`);
await b.close();
