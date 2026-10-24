// Site health, every sitemap page at 1440 and 390: broken images, horizontal overflow, console errors,
// content left invisible after a walk down the page (a reveal that never ran), and images without
// fixed dimensions (a layout-shift risk). Usage: node health.mjs <base> <sitemap.xml>
import { chromium } from "playwright-core";
import fs from "node:fs";
const [BASE, SITEMAP] = process.argv.slice(2);
const paths = [...fs.readFileSync(SITEMAP, "utf8").matchAll(/<loc>https?:\/\/[^/]+(\/[^<]*)<\/loc>/g)].map((m) => m[1]);
const b = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: "chrome" });
let issues = 0;
for (const w of [1440, 390]) {
  const mobile = w < 800;
  const ctx = await b.newContext({ viewport: { width: w, height: mobile ? 844 : 900 }, isMobile: mobile, hasTouch: mobile });
  for (const route of paths) {
    const p = await ctx.newPage();
    const errs = [];
    p.on("pageerror", (e) => errs.push("pageerror: " + e.message.slice(0, 120)));
    p.on("console", (m) => m.type() === "error" && errs.push("console: " + m.text().slice(0, 120)));
    p.on("requestfailed", (r) => !/\/api\//.test(r.url()) && errs.push("failed: " + r.url().replace(BASE, "").slice(0, 90)));
    await p.goto(BASE + route, { waitUntil: "networkidle" });
    const H = await p.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < H; y += 500) {
      await p.evaluate((v) => scrollTo(0, v), y);
      await p.waitForTimeout(140);
    }
    await p.waitForTimeout(1500);
    const r = await p.evaluate(() => {
      const vis = (el) => {
        const s = getComputedStyle(el);
        return s.display !== "none" && s.visibility !== "hidden" && el.getBoundingClientRect().width > 0;
      };
      const broken = [...document.images].filter((i) => vis(i) && i.complete && i.naturalWidth === 0 && !i.closest("[aria-hidden='true']")).map((i) => i.currentSrc.split("/").pop() || i.alt);
      const overflow = document.documentElement.scrollWidth - innerWidth;
      // Text-bearing elements still fully transparent (themselves or an ancestor) after the walk.
      const hidden = [];
      for (const el of document.querySelectorAll("main h1, main h2, main h3, main p, main li, main a, main button")) {
        if (!vis(el) || !el.textContent.trim() || el.closest("[aria-hidden='true'], [inert], details:not([open])")) continue;
        let op = 1;
        for (let n = el; n && n !== document.body; n = n.parentElement) op *= parseFloat(getComputedStyle(n).opacity);
        if (op < 0.05) hidden.push(el.textContent.trim().slice(0, 40));
      }
      const unsized = [...document.querySelectorAll("main img")].filter((i) => vis(i) && !i.getAttribute("width") && !i.getAttribute("height") && getComputedStyle(i).position !== "absolute" && !i.closest("[class*='aspect-']")).map((i) => i.currentSrc.split("/").pop());
      return { broken, overflow, hidden: [...new Set(hidden)].slice(0, 5), unsized: [...new Set(unsized)].slice(0, 5) };
    });
    const bad = [];
    if (r.broken.length) bad.push(`broken images: ${r.broken.join(", ")}`);
    if (r.overflow > 1) bad.push(`horizontal overflow ${r.overflow}px`);
    if (r.hidden.length) bad.push(`invisible text: ${r.hidden.join(" | ")}`);
    if (r.unsized.length) bad.push(`images without size: ${r.unsized.join(", ")}`);
    for (const e of [...new Set(errs)].slice(0, 4)) bad.push(e);
    if (bad.length) {
      issues += bad.length;
      console.log(`${route} @${w}\n   ${bad.join("\n   ")}`);
    }
    await p.close();
  }
  await ctx.close();
}
console.log(`health: ${paths.length} pages × 2 widths, ${issues} issue(s)`);
await b.close();
