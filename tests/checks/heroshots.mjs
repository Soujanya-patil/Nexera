// The home hero at 1440 and 390: the first screen as it paints (t ≈ 0.4 s), settled (3 s), and with
// `--frames` a series every 2 s for ~32 s (to show a slow cross-fade, one round). Reduced motion: one
// shot after 12 s. Usage: node heroshots.mjs <base> <outdir> <prefix> [--frames]
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";
const [BASE, OUT, PRE] = process.argv.slice(2);
const FRAMES = process.argv.includes("--frames");
fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: "chrome" });
for (const w of [1440, 390]) {
  const mobile = w < 800;
  const vp = { width: w, height: mobile ? 844 : 900 };
  const ctx = await b.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto(BASE + "/", { waitUntil: "commit" });
  await p.waitForTimeout(400);
  await p.screenshot({ path: path.join(OUT, `${PRE}-hero-${w}-first.png`) });
  await p.waitForTimeout(2600);
  await p.screenshot({ path: path.join(OUT, `${PRE}-hero-${w}.png`) });
  if (FRAMES) {
    for (let t = 4; t <= 34; t += 2) {
      await p.waitForTimeout(2000);
      await p.screenshot({ path: path.join(OUT, `${PRE}-hero-${w}-t${String(t).padStart(2, "0")}.png`) });
    }
  }
  await ctx.close();
  const rctx = await b.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1, reducedMotion: "reduce" });
  const r = await rctx.newPage();
  await r.goto(BASE + "/", { waitUntil: "networkidle" });
  await r.waitForTimeout(12000);
  await r.screenshot({ path: path.join(OUT, `${PRE}-hero-${w}-reduced.png`) });
  await rctx.close();
}
console.log("heroshots: done");
await b.close();
