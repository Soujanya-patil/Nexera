// Touch targets at 390 (touch): controls whose tap area (own box, or the ::before hit area, or their
// label) is under 44 × 44 px — inline links in running text and stretched card links excepted.
import { chromium } from "playwright-core";
const [base, ...paths] = process.argv.slice(2);
const b = await chromium.launch((process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: "chrome" }));
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
let total = 0;
for (const path of paths) {
  const p = await ctx.newPage();
  await p.goto(base + path, { waitUntil: "networkidle" });
  await p.waitForTimeout(600);
  const list = await p.evaluate(() =>
    [...document.querySelectorAll("a[href], button, summary, select, input:not([type=hidden]), textarea, [role=button], [role=tab]")]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height || getComputedStyle(el).visibility === "hidden" || el.closest("[inert], [aria-hidden='true']")) return false;
        if (el.tagName === "A" && el.parentElement && el.parentElement.textContent.trim().length > el.textContent.trim().length + 2 && !el.closest("nav")) return false;
        const after = getComputedStyle(el, "::after");
        if (after.position === "absolute" && after.content !== "none" && parseFloat(after.top) <= 0 && parseFloat(after.left) <= 0) return false;
        const before = getComputedStyle(el, "::before");
        let w = r.width, h = r.height;
        if (before.position === "absolute" && before.content !== "none") { w = Math.max(w, parseFloat(before.width) || 0); h = Math.max(h, parseFloat(before.height) || 0); }
        const lab = el.labels?.[0];
        if (lab) { const lb = getComputedStyle(lab, "::before"); if (lb.position === "absolute" && lb.content !== "none") { const lr = lab.getBoundingClientRect(); if (lr.width + 16 >= 43.5 && lr.height + 16 >= 43.5) return false; } }
        if (el.matches("input[type=checkbox], input[type=radio]") && lab) { const lr = lab.getBoundingClientRect(); w = lr.width; h = lr.height; }
        return w < 43.5 || h < 43.5;
      })
      .map((el) => { const r = el.getBoundingClientRect(); return `${el.tagName.toLowerCase()} ${Math.round(r.width)}×${Math.round(r.height)} "${(el.textContent || el.getAttribute("aria-label") || el.name || "").trim().slice(0, 34)}"`; })
  );
  total += list.length;
  console.log(`${path}: ${list.length}${list.length ? "\n   " + list.slice(0, 12).join("\n   ") : ""}`);
  await p.close();
}
console.log("targets under 44px:", total);
await b.close();
