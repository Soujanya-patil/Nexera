import { chromium } from "playwright-core";
const BASE = process.argv[2];
const b = await chromium.launch((process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: "chrome" }));
let ok = 0, n = 0;
for (const [w, h] of [[1440, 900], [390, 844]])
  for (const url of ["/#contact?interest=utility", "/?interest=distributor#contact", "/#contact"]) {
    const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
    await p.goto(BASE + url, { waitUntil: "networkidle" });
    await p.waitForTimeout(2200);
    const r = await p.evaluate(() => ({ top: Math.round(document.getElementById("contact").getBoundingClientRect().top), chip: document.querySelector('#contact input[name="interest"]:checked')?.value ?? "" }));
    const want = (url.match(/interest=(\w+)/) || [])[1] ?? "";
    const pass = Math.abs(r.top - 64) <= 3 && r.chip === want;
    n++; ok += pass;
    console.log(pass ? "PASS" : "FAIL", `@${w}`, url, JSON.stringify(r));
    await p.context().close();
  }
await b.close();
console.log(`${ok}/${n} passed`);
