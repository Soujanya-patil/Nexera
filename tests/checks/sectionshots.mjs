// Screenshots of named sections at 1440 and 390 (reduced motion, after a walk down the page).
// Usage: node sectionshots.mjs <base> <outdir> <prefix> <name>=<path>@<css selector> …
import { chromium } from "playwright-core";
import path from "node:path";
const [BASE, OUT, PRE, ...SPECS] = process.argv.slice(2);
const b = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: "chrome" });
for (const w of [1440, 390]) {
  const mobile = w < 800;
  const ctx = await b.newContext({ viewport: { width: w, height: mobile ? 844 : 900 }, isMobile: mobile, hasTouch: mobile, reducedMotion: "reduce", deviceScaleFactor: 1 });
  for (const spec of SPECS) {
    const [name, rest] = spec.split("=");
    const at = rest.indexOf("@");
    const route = rest.slice(0, at);
    const sel = rest.slice(at + 1);
    const p = await ctx.newPage();
    await p.goto(BASE + route, { waitUntil: "networkidle" });
    const H = await p.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < H; y += 600) {
      await p.evaluate((v) => scrollTo(0, v), y);
      await p.waitForTimeout(100);
    }
    const loc = p.locator(sel).first();
    await loc.scrollIntoViewIfNeeded();
    await p.waitForTimeout(800);
    await loc.screenshot({ path: path.join(OUT, `${PRE}-${name}-${w}.png`), style: "header, .cb-dock { visibility: hidden !important; }" });
    await p.close();
  }
  await ctx.close();
}
console.log("sectionshots: done");
await b.close();
