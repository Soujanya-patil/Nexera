// A JavaScript failure while the app starts must not blank the page: StartupBoundary puts the
// pre-rendered page back. Simulated with an IntersectionObserver whose observe() throws (so an effect
// throws while the app starts). Usage: node startfail.mjs http://127.0.0.1:8810
import { chromium } from "playwright-core";

const BASE = process.argv[2];
const b = await chromium.launch((process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: "chrome" }));
const results = [];
const check = (name, cond, extra = "") => {
  results.push(!!cond);
  console.log(`${cond ? "PASS" : "FAIL"} ${name}${extra !== "" ? ` — ${typeof extra === "string" ? extra : JSON.stringify(extra)}` : ""}`);
};
// Broken from the start, or only after the first client-side navigation (`afterNav`).
const breakIO = (afterNav) => {
  const Real = window.IntersectionObserver;
  const start = location.pathname;
  // Throws where the real failure did: creating the observer (in components' effects as they start).
  window.IntersectionObserver = class extends Real {
    constructor(...args) {
      if (!afterNav || location.pathname !== start) throw new Error("simulated start-up failure");
      super(...args);
    }
  };
};
const state = (p) =>
  p.evaluate(() => {
    const root = document.getElementById("root");
    // Inert carousel slides (the /solutions header's other stops, the /products hero's other products)
    // are hidden by design, not held back for the script.
    const hidden = [...root.querySelectorAll("h1, h2, h3, p, a, li")].filter((el) => {
      if (el.closest("[inert]")) return false;
      const r = el.getBoundingClientRect();
      return r.height > 0 && (getComputedStyle(el).opacity === "0" || getComputedStyle(el).visibility === "hidden");
    }).length;
    return {
      failed: document.documentElement.hasAttribute("data-app-error"),
      jsMotion: document.documentElement.classList.contains("js-motion"),
      rootText: root.innerText.length,
      h1: [...document.querySelectorAll("h1")].map((h) => h.textContent.replace(/\s+/g, " ").trim()),
      titles: document.head.querySelectorAll("title").length,
      title: document.title,
      descriptions: document.head.querySelectorAll('meta[name="description"]').length,
      canonicals: [...document.head.querySelectorAll('link[rel="canonical"]')].map((l) => l.getAttribute("href")),
      jsonld: document.head.querySelectorAll('script[type="application/ld+json"]').length,
      hiddenText: hidden,
    };
  });

const PAGES = [
  ["/", "Battery Energy Storage Systems Powering India’s Transition to Smart Energy Storage", "https://nexerapower.com/"],
  ["/products", "Energy Storage, Built to Scale.", "https://nexerapower.com/products"],
  ["/products?app=ci", "Energy Storage, Built to Scale.", "https://nexerapower.com/products"],
  ["/solutions", "Storage built for how you'll actually use it", "https://nexerapower.com/solutions"],
  ["/products/tcl-blueark-w10", "BlueArk W10", "https://nexerapower.com/products/tcl-blueark-w10"],
  ["/partners/tcl", "TCL energy storage in India", "https://nexerapower.com/partners/tcl"],
  ["/resources", "Datasheets, answers, and the latest from Nexera", "https://nexerapower.com/resources"],
];
for (const [path, h1, canonical] of PAGES) {
  for (const [W, H] of [
    [1366, 900],
    [412, 823],
  ]) {
    const p = await (await b.newContext({ viewport: { width: W, height: H }, isMobile: W < 500, hasTouch: W < 500 })).newPage();
    const logs = [];
    p.on("console", (m) => m.type() === "error" && logs.push(m.text().slice(0, 100)));
    p.on("pageerror", (e) => logs.push("pageerror: " + e.message.slice(0, 100)));
    await p.addInitScript(breakIO, false);
    await p.goto(BASE + path, { waitUntil: "load" });
    await p.waitForTimeout(4000); // the route table has loaded by now (the moment the head is handed over)
    const s = await state(p);
    const okPage = s.failed && !s.jsMotion && s.rootText > 300 && s.h1.length === 1 && s.h1[0] === h1 && s.hiddenText === 0;
    const okHead = s.titles === 1 && s.descriptions === 1 && s.canonicals.length === 1 && s.canonicals[0] === canonical && s.jsonld >= 1;
    const logged = logs.some((l) => l.includes("simulated start-up failure")) && logs.some((l) => l.includes("NEXERA: the app stopped"));
    check(`${path} @${W}: start-up failure → the pre-rendered page stays (content, its one h1, nothing held hidden)`, okPage, { ...s, logs: undefined });
    check(`${path} @${W}: head intact (one title, description, canonical ${canonical.replace("https://nexerapower.com", "") || "/"}; JSON-LD)`, okHead, { titles: s.titles, title: s.title, descriptions: s.descriptions, canonicals: s.canonicals, jsonld: s.jsonld });
    check(`${path} @${W}: the error is not hidden (logged, plus the fallback notice)`, logged, logs);
    await p.context().close();
  }
}

// Links in the restored page work (plain navigation to the next pre-rendered page).
{
  const p = await (await b.newContext({ viewport: { width: 1366, height: 900 } })).newPage();
  await p.addInitScript(breakIO, true); // broken only after a client-side navigation: the opened page is fine
  await p.goto(BASE + "/products", { waitUntil: "load" });
  await p.waitForTimeout(2500);
  const before = await state(p);
  // A client-side navigation to a page that then fails: the new URL is loaded afresh (its own page).
  await p.locator('nav a[href="/about"]').first().click();
  await p.waitForURL((u) => u.pathname === "/about");
  await p.waitForTimeout(4000);
  const after = await state(p);
  check("client-side navigation that fails → the new URL loads afresh as its pre-rendered page (one h1, its canonical)", !before.failed && after.h1.length === 1 && after.h1[0] === "Built by an EPC, for EPCs" && after.canonicals[0] === "https://nexerapower.com/about" && after.titles === 1, { before: before.failed, after });
  await p.context().close();
}
{
  const p = await (await b.newContext({ viewport: { width: 1366, height: 900 } })).newPage();
  await p.addInitScript(breakIO, false);
  await p.goto(BASE + "/products", { waitUntil: "load" });
  await p.waitForTimeout(3000);
  await p.locator('main a[href^="/products/"]').first().click();
  await p.waitForLoadState("load");
  await p.waitForTimeout(3000);
  const s = await state(p);
  check("a link in the restored page opens the next page (pre-rendered, one h1)", new URL(p.url()).pathname.startsWith("/products/") && s.h1.length === 1, { url: p.url(), h1: s.h1 });
  await p.context().close();
}
// Supported browsers: no fallback, the app runs (no data-app-error, js-motion kept).
{
  const p = await (await b.newContext({ viewport: { width: 1366, height: 900 } })).newPage();
  const logs = [];
  p.on("console", (m) => m.type() === "error" && logs.push(m.text().slice(0, 100)));
  await p.goto(BASE + "/products", { waitUntil: "load" });
  await p.waitForTimeout(3500);
  const s = await state(p);
  check("normal browser: no fallback, app running, head handed to <Seo> (one of each)", !s.failed && s.jsMotion && s.h1.length === 1 && s.titles === 1 && s.canonicals.length === 1 && logs.length === 0, { ...s, logs });
  await p.context().close();
}
await b.close();
console.log(`${results.filter(Boolean).length}/${results.length} passed`);
process.exit(results.every(Boolean) ? 0 : 1);
