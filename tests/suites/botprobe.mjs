// What a rendering crawler ends up with on a page: #root's content and h1s after the scripts have run,
// under several crawler-like conditions. Usage: node botprobe.mjs http://127.0.0.1:8810 /products [/other …]
import { chromium } from "playwright-core";

const [BASE, ...PATHS] = process.argv.slice(2);
// Paths must arrive as typed. Git Bash (MSYS) rewrites an argument like "/products" into
// "C:/Program Files/Git/products" for native programs; run with MSYS_NO_PATHCONV=1 there.
const badPaths = PATHS.filter((p) => !p.startsWith("/"));
if (!BASE || !PATHS.length || badPaths.length) {
  console.error(`botprobe: need a base URL and paths starting with "/"${badPaths.length ? `; got ${JSON.stringify(badPaths)} (Git Bash path conversion? set MSYS_NO_PATHCONV=1)` : ""}`);
  process.exit(2);
}
const tally = { ok: 0, empty: 0, failed: 0 };
const BING = "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36 Edg/116.0.1938.76";
const b = await chromium.launch((process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: "chrome" }));

const CASES = {
  "no IntersectionObserver": { init: () => { delete window.IntersectionObserver; } },
  "no ResizeObserver": { init: () => { delete window.ResizeObserver; } },
  "no requestIdleCallback": { init: () => { delete window.requestIdleCallback; delete window.cancelIdleCallback; } },
};

for (const path of PATHS) {
  console.log(`\n== ${path}`);
  for (const [name, c] of Object.entries(CASES)) {
    try {
    const ctx = await b.newContext({ viewport: c.vp ?? { width: 1366, height: 768 }, userAgent: c.ua, isMobile: !!c.mobile, hasTouch: !!c.mobile, reducedMotion: c.reduced ? "reduce" : "no-preference" });
    const p = await ctx.newPage();
    const errs = [];
    p.on("pageerror", (e) => errs.push(e.message.slice(0, 120)));
    p.on("console", (m) => m.type() === "error" && errs.push(m.text().slice(0, 120)));
    if (c.init) await p.addInitScript(c.init);
    let entry = null;
    if (c.block || c.blockAllButEntry)
      await p.route("**/assets/*.js", (r) => {
        const u = r.request().url();
        if (c.block && c.block.test(u)) return r.abort();
        if (c.blockAllButEntry) {
          entry ??= u; // the first script requested is the app entry
          if (u !== entry) return r.abort();
        }
        return r.continue();
      });
    await p.goto(new URL(path, BASE).href, { waitUntil: "load" });
    if (c.freezeAt) {
      await p.waitForTimeout(c.freezeAt);
      await p.evaluate(() => { window.setTimeout = () => 0; window.requestAnimationFrame = () => 0; });
    }
    await p.waitForTimeout(6000);
    const r = await p.evaluate(() => {
      const root = document.getElementById("root");
      return { children: root.children.length, h1: [...document.querySelectorAll("h1")].map((h) => h.textContent.trim().slice(0, 40)), textLen: root.innerText.length, hydrated: !!Object.keys(root).find((k) => k.startsWith("__reactContainer")) };
    });
    const empty = r.children === 0;
    tally[empty ? "empty" : "ok"]++;
    console.log(`${empty ? "EMPTY" : "ok   "} ${name.padEnd(46)} root children=${r.children} text=${r.textLen} h1=${JSON.stringify(r.h1)} react=${r.hydrated}${errs.length ? "  errors: " + JSON.stringify(errs.slice(0, 3)) : ""}`);
    await ctx.close();
    } catch (e) {
      tally.failed++;
      console.log(`FAIL  ${name.padEnd(46)} ${e.message.split(/\r?\n/)[0]}`);
    }
  }
}
await b.close();
// Every page under every case must have run and kept its content.
const total = PATHS.length * Object.keys(CASES).length;
console.log("");
console.log(`botprobe: ${tally.ok} ok, ${tally.empty} EMPTY, ${tally.failed} failed of ${total}`);
process.exit(tally.ok === total ? 0 : 1);
