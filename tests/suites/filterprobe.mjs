import { chromium } from "playwright-core";
const BASE = process.argv[2] ?? "http://127.0.0.1:8810";
const b = await chromium.launch((process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: "chrome" }));
let fails = 0;
const expect = { "/products": 8, "/products?app=residential": 1, "/products?app=ci": 5, "/products?app=utility": 3, "/products?partner=tcl": 3, "/products?partner=hithium": 3, "/products?app=utility&partner=hithium": 2, "/products?app=bogus": 8 };
for (const [u, n] of Object.entries(expect)) {
  for (const w of [1366, 412]) {
    const p = await (await b.newContext({ viewport: { width: w, height: 900 }, isMobile: w < 500 })).newPage();
    const errs = [];
    p.on("pageerror", (e) => errs.push(e.message.slice(0, 120)));
    p.on("console", (m) => (m.type() === "error" || m.type() === "warning") && errs.push(m.type() + ": " + m.text().slice(0, 120)));
    await p.addInitScript(() => { window.__cls = 0; new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: "layout-shift", buffered: true }); });
    await p.goto(BASE + u, { waitUntil: "load" });
    await p.waitForTimeout(3500);
    const r = await p.evaluate(() => ({
      shown: [...document.querySelectorAll("[data-card]")].filter((c) => c.offsetParent !== null && getComputedStyle(c).display !== "none").length,
      h1: document.querySelectorAll("h1").length,
      cls: +window.__cls.toFixed(4),
      canon: document.querySelector('link[rel="canonical"]')?.href,
      url: location.pathname + location.search,
    }));
    const ok = r.shown === n && r.h1 === 1 && r.cls < 0.1 && r.canon === "https://nexerapower.com/products" && errs.length === 0;
    if (!ok) fails++;
    console.log(`${ok ? "PASS" : "FAIL"} ${u} @${w}: ${r.shown} cards (expected ${n}), h1=${r.h1}, CLS ${r.cls}, canonical ${r.canon}, url kept ${r.url}${errs.length ? "  " + JSON.stringify(errs) : ""}`);
    await p.context().close();
  }
}
await b.close();
process.exit(fails ? 1 : 0);
