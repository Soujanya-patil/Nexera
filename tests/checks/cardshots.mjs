// Close-ups of the catalogue cards (the grid's first row) and the product page hero, at 1440 and 390.
// Usage: node cardshots.mjs <base> <outdir> <prefix>
import { chromium } from "playwright-core";
import path from "node:path";
const [BASE, OUT, PRE] = process.argv.slice(2);
const b = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: "chrome" });
const SHOTS = [
  ["/products", "main ul:has(article) >> nth=0", "products-cards"],
  ["/partners/hithium", "main ul:has(article) >> nth=0", "hithium-cards"],
  ["/products/hithium-power-625", "main section >> nth=1", "power625-hero"],
  ["/products/hithium-power-625", "main ul:has(article) >> nth=0", "power625-more"],
];
for (const w of [1440, 390]) {
  const mobile = w < 800;
  const ctx = await b.newContext({ viewport: { width: w, height: mobile ? 844 : 900 }, isMobile: mobile, hasTouch: mobile, reducedMotion: "reduce", deviceScaleFactor: 1 });
  for (const [route, sel, name] of SHOTS) {
    const p = await ctx.newPage();
    await p.goto(BASE + route, { waitUntil: "networkidle" });
    const loc = p.locator(sel);
    await loc.scrollIntoViewIfNeeded();
    await p.waitForTimeout(900);
    const box = await loc.boundingBox();
    const h = Math.min(box.height, mobile ? 1500 : 900);
    await p.screenshot({ path: path.join(OUT, `${PRE}-${name}-${w}.png`), fullPage: true, clip: { x: 0, y: box.y + (await p.evaluate(() => scrollY)), width: w, height: h }, style: "header, .cb-dock { visibility: hidden !important; }" });
    await p.close();
  }
  await ctx.close();
}
console.log("cardshots: done");
await b.close();
