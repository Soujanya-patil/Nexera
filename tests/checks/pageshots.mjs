// Full-page screenshots of every page type at 1440 and 390, with every reveal played (reduced motion,
// after a walk down the page), the sticky header and the call-back pill hidden for the stitched shot.
// Usage: node pageshots.mjs <base> <outdir> <prefix> [path…]
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";

const [BASE, OUT, PRE, ...ARGS] = process.argv.slice(2);
const PAGES = ARGS.length
  ? ARGS
  : [
      "/",
      "/solutions",
      "/solutions/commercial-industrial",
      "/solutions/residential",
      "/solutions/utility-scale",
      "/products",
      "/products/tcl-blueark-w10",
      "/partners/tcl",
      "/become-a-partner",
      "/about",
      "/how-it-works",
      "/service-training",
      "/where-we-operate",
      "/resources",
      "/blog",
      "/blog/what-is-bess",
      "/contact",
    ];
const slug = (p) => (p === "/" ? "home" : p.slice(1).replace(/\//g, "_"));
fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: "chrome" });
for (const w of [1440, 390]) {
  const mobile = w < 800;
  const ctx = await b.newContext({ viewport: { width: w, height: mobile ? 844 : 900 }, isMobile: mobile, hasTouch: mobile, reducedMotion: "reduce", deviceScaleFactor: 1 });
  for (const route of PAGES) {
    const p = await ctx.newPage();
    await p.goto(BASE + route, { waitUntil: "networkidle" });
    const H = await p.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < H; y += 500) {
      await p.evaluate((v) => scrollTo(0, v), y);
      await p.waitForTimeout(120);
    }
    await p.evaluate(() => scrollTo(0, 0));
    await p.waitForTimeout(900);
    await p.screenshot({
      path: path.join(OUT, `${PRE}-${slug(route)}-${w}.png`),
      fullPage: true,
      style: "header, .cb-dock, [data-sr-hide] { visibility: hidden !important; }",
    });
    await p.close();
  }
  await ctx.close();
}
console.log(`pageshots: ${PAGES.length} pages × 2 widths → ${OUT}`);
await b.close();
