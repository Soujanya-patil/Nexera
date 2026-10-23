// /resources Knowledge Hub checks. Usage: node hub.mjs <after base> <before dist dir> <after dist dir>
import { chromium } from "playwright-core";
import fs from "node:fs";

const [BASE, BEFORE_DIST, AFTER_DIST] = process.argv.slice(2);
const b = await chromium.launch((process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: "chrome" }));
const results = [];
const check = (name, cond, extra = "") => {
  results.push(!!cond);
  console.log(`${cond ? "PASS" : "FAIL"} ${name}${extra !== "" ? ` — ${typeof extra === "string" ? extra : JSON.stringify(extra)}` : ""}`);
};
async function newPage(w, h, opts = {}) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, reducedMotion: opts.reduced ? "reduce" : "no-preference", javaScriptEnabled: opts.js !== false, hasTouch: w < 500 });
  const p = await ctx.newPage();
  p.errors = [];
  p.requests = [];
  p.on("console", (m) => m.type() === "error" && p.errors.push(m.text().slice(0, 160)));
  p.on("pageerror", (e) => p.errors.push(e.message.slice(0, 160)));
  p.on("request", (r) => p.requests.push(r.url()));
  await p.addInitScript(() => {
    window.__cls = 0;
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value;
    }).observe({ type: "layout-shift", buffered: true });
  });
  return p;
}
const decode = (s) => s.replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

// ---- SEO: head and JSON-LD unchanged; every text in the pre-rendered page ---------------------------
{
  const before = fs.readFileSync(`${BEFORE_DIST}/resources.html`, "utf8");
  const after = fs.readFileSync(`${AFTER_DIST}/resources.html`, "utf8");
  const pick = (h) => ({
    title: h.match(/<title>[^<]*<\/title>/)[0],
    desc: h.match(/<meta name="description"[^>]*>/)[0],
    canon: h.match(/<link rel="canonical"[^>]*>/)[0],
    og: [...h.matchAll(/<meta property="og:[^>]*>/g)].map((m) => m[0]).join(""),
    ld: h.match(/<script type="application\/ld\+json">[\s\S]*?<\/script>/)[0],
  });
  const a = pick(after);
  const bb = pick(before);
  check("SEO: title, description, canonical, Open Graph and JSON-LD identical to before", JSON.stringify(a) === JSON.stringify(bb));
  const h1 = (after.match(/<h1[\s>]/g) || []).length;
  const vis = decode(after.replace(/<head>[\s\S]*?<\/head>/, "").replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ");
  const src = fs.readFileSync("src/pages/Resources.jsx", "utf8");
  const strings = [...src.matchAll(/"([^"\n]{14,})"/g)].map((m) => m[1]).filter((t) => /[A-Z]/.test(t) && !/^[./ ]/.test(t) && !/[{=[]/.test(t));
  const texts = [
    "Datasheets, answers, and the latest from Nexera",
    "BlueArk W10",
    "∞BLOCK C&I All-in-One ESS",
    "∞Power 6.25 MWh",
    "Request Datasheet",
    "Request Brochure",
    "Datasheets & Brochures",
    "FAQs",
    "News & Insights",
    ...strings,
  ].map(decode);
  const missing = texts.filter((t) => !vis.includes(t.replace(/\\'/g, "'")));
  check("pre-rendered: one h1, and every text (titles, datasheets, all FAQ questions and answers, insights) is in the HTML", h1 === 1 && missing.length === 0, { h1, missing });
}

// ---- Filter bar: click, keyboard, spy (down and up) ------------------------------------------------------
for (const [W, H] of [
  [1440, 900],
  [390, 844],
]) {
  const tag = `@${W}`;
  const p = await newPage(W, H);
  await p.goto(BASE + "/resources", { waitUntil: "networkidle" });
  await p.waitForTimeout(1500);
  const nav = p.locator('nav[aria-label="Resources sections"]');
  const landed = [];
  for (const [label, id] of [
    ["Datasheets", "datasheets"],
    ["Insights", "insights"],
    ["FAQs", "faqs"],
  ]) {
    await nav.getByRole("link", { name: label, exact: true }).click();
    await p.waitForTimeout(1700);
    const r = await p.evaluate((id) => ({
      top: Math.round(document.getElementById(id).getBoundingClientRect().top),
      current: document.querySelector('nav[aria-label="Resources sections"] [aria-current="location"]')?.textContent,
      pill: document.querySelector('nav[aria-label="Resources sections"] span[aria-hidden="true"]')?.style.transform,
    }), id);
    landed.push({ label, ...r });
  }
  const okLand = landed.every((r) => r.top >= 100 && r.top <= 150 && r.current === r.label);
  const pills = new Set(landed.map((r) => r.pill)).size;
  check(`${tag} filter bar: each option glides to its section under the bar, is marked current, the green pill slides`, okLand && pills === landed.length, landed); // one pill position per section (3 since the blog section left)
  // Keyboard.
  await p.evaluate(() => scrollTo(0, 0));
  await p.waitForTimeout(600);
  await nav.getByRole("link", { name: "FAQs", exact: true }).focus();
  await p.keyboard.press("Enter");
  await p.waitForTimeout(1700);
  const kb = await p.evaluate(() => Math.round(document.getElementById("faqs").getBoundingClientRect().top));
  check(`${tag} filter bar: keyboard (focus + Enter) works`, kb >= 100 && kb <= 150, kb);
  // Spy while scrolling down then up.
  const spy = async () => p.evaluate(() => document.querySelector('nav[aria-label="Resources sections"] [aria-current="location"]')?.textContent);
  const seen = [];
  for (const id of ["datasheets", "faqs", "insights"]) {
    await p.evaluate((id) => scrollTo(0, document.getElementById(id).getBoundingClientRect().top + scrollY - innerHeight * 0.2), id);
    await p.waitForTimeout(250);
    seen.push(await spy());
  }
  for (const id of ["faqs", "datasheets"]) {
    await p.evaluate((id) => scrollTo(0, document.getElementById(id).getBoundingClientRect().top + scrollY - innerHeight * 0.2), id);
    await p.waitForTimeout(250);
    seen.push(await spy());
  }
  await p.evaluate(() => scrollTo(0, 0));
  await p.waitForTimeout(250);
  seen.push(await spy());
  check(`${tag} the bar follows the section being read, down and back up`, seen.join() === "Datasheets,FAQs,Insights,FAQs,Datasheets,All", seen);
  const tone = await p.evaluate(() => {
    const body = document.querySelector(".resources-body");
    scrollTo(0, document.getElementById("datasheets").getBoundingClientRect().top + scrollY - 100);
    return new Promise((r) => setTimeout(() => r({ tone: body.dataset.tone, bg: getComputedStyle(body).backgroundColor }), 1200));
  });
  check(`${tag} the page tone shifts to light grey in Datasheets`, tone.tone === "grey" && tone.bg !== "rgb(255, 255, 255)", tone);
  check(`${tag} CLS < 0.1`, (await p.evaluate(() => window.__cls)) < 0.1, await p.evaluate(() => window.__cls));
  check(`${tag} no console errors`, p.errors.length === 0, p.errors);
  await p.context().close();
}

// ---- Datasheets: product cards → the homepage contact form, with the request pre-filled ------------------
const SHEETS = [
  { name: "BlueArk W10", partner: "TCL", kind: "Datasheet", interest: "ci", alt: "TCL BlueArk W10 energy storage cabinet", specs: "125 kW261 kWh", summary: "A 125 kW / 261 kWh cabinet, expandable to 6.3 MWh, with a layered protection architecture.", message: "Please send me the datasheet for TCL BlueArk W10." },
  { name: "∞BLOCK C&I All-in-One ESS", partner: "Hithium", kind: "Datasheet", interest: "ci", alt: "Hithium ∞BLOCK 261 kWh energy storage cabinet", specs: "125 kW261 kWh", summary: "A liquid-cooled 261 kWh cabinet with an integrated, adjustable 125 kW PCS for commercial and industrial sites.", message: "Please send me the datasheet for Hithium ∞BLOCK C&I All-in-One ESS." },
  { name: "∞Power 6.25 MWh", partner: "Hithium", kind: "Brochure", interest: "utility", alt: "Hithium ∞Power 6.25 MWh liquid-cooled containerised energy storage system", specs: "6.25 MWh2 h | 4 h", summary: "A 6.25 MWh liquid-cooled system for utility-scale projects, available in 2-hour and 4-hour configurations.", message: "Please send me the brochure for Hithium ∞Power 6.25 MWh." },
];
const formState = (p) =>
  p.evaluate(() => {
    const sec = document.getElementById("contact");
    return {
      path: location.pathname,
      sameDoc: window.__sameDoc === 1,
      top: sec ? Math.round(sec.getBoundingClientRect().top) : null,
      interest: document.querySelector('#contact input[name="interest"]:checked')?.value ?? "",
      message: document.querySelector("#contact textarea")?.value ?? null,
    };
  });
for (const [W, H] of [
  [1440, 900],
  [390, 844],
]) {
  const tag = `@${W}`;
  const p = await newPage(W, H);
  await p.goto(BASE + "/resources", { waitUntil: "networkidle" });
  await p.waitForTimeout(1200);
  // (the images are lazy: bring each card on screen first)
  for (let k = 0; k < 3; k++) {
    await p.locator("#datasheets .sheet-card").nth(k).scrollIntoViewIfNeeded();
    await p.waitForTimeout(500);
  }
  const cards = await p.evaluate(() =>
    [...document.querySelectorAll("#datasheets .sheet-card")].map((c) => {
      const img = c.querySelector("img");
      const a = c.querySelector("a");
      return {
        alt: img?.getAttribute("alt"),
        loaded: img?.complete && img.naturalWidth > 0,
        partner: c.querySelector("p")?.textContent.trim(),
        name: c.querySelector("h3")?.textContent.trim(),
        specs: c.querySelectorAll("p")[1]?.textContent.trim(),
        summary: c.querySelectorAll("p")[2]?.textContent.trim(),
        label: a?.textContent.replace(/\s+/g, " ").trim(),
        href: a?.getAttribute("href"),
        forms: c.querySelectorAll("form, input").length,
      };
    })
  );
  const exp = SHEETS.map((s) => ({ ...s, label: `Request ${s.kind}: ${s.partner} ${s.name}` }));
  const okCards =
    cards.length === 3 &&
    cards.every(
      (c, i) => c.alt === exp[i].alt && c.loaded && c.partner === exp[i].partner && c.name === exp[i].name && c.specs === exp[i].specs && c.summary === exp[i].summary && c.label === exp[i].label && c.forms === 0 && c.href.startsWith(`/#contact?interest=${exp[i].interest}&doc=`)
    );
  check(`${tag} three product cards (products.js image + alt, partner, name, power/energy line, summary; one "Request …" link; no form)`, okCards, cards);
  const hrefs = cards.map((c) => new URLSearchParams(c.href.slice("/#contact?".length)));
  check(`${tag} links: interest ci / ci / utility, doc = product name, kind=brochure on the brochure only`, hrefs.map((q) => `${q.get("interest")}|${q.get("doc")}|${q.get("kind")}`).join(";") === "ci|TCL BlueArk W10|null;ci|Hithium ∞BLOCK C&I All-in-One ESS|null;utility|Hithium ∞Power 6.25 MWh|brochure", hrefs.map((q) => q.toString()));
  if (W > 500) {
    const card = p.locator("#datasheets .sheet-card").nth(1);
    await card.scrollIntoViewIfNeeded();
    const t0 = await card.evaluate((c) => getComputedStyle(c).translate);
    await card.hover();
    await p.waitForTimeout(450);
    const t1 = await card.evaluate((c) => ({ t: getComputedStyle(c).translate, sh: getComputedStyle(c).boxShadow !== "none", img: getComputedStyle(c.querySelector("img")).scale }));
    check(`${tag} hover: the card lifts with a shadow, the product zooms to 1.03`, t0 !== t1.t && t1.sh && Math.abs(parseFloat(t1.img) - 1.03) < 0.002, { t0, ...t1 });
    // Keyboard: Tab onto the link, a visible ring, Enter.
    await p.locator("#datasheets .sheet-card a").nth(0).focus();
    const ring = await p.locator("#datasheets .sheet-card a").nth(0).evaluate((a) => getComputedStyle(a, "::after").boxShadow);
    check(`${tag} keyboard focus: a visible ring around the card`, ring && ring !== "none", ring);
  }
  if (W < 500) {
    const small = await p.evaluate(() =>
      [...document.querySelectorAll('nav[aria-label="Resources sections"] a, #datasheets .sheet-card a, .guide-featured, aside a, #faqs summary')]
        .map((el) => ({ h: Math.round(el.getBoundingClientRect().height), t: el.textContent.trim().slice(0, 18) }))
        .filter((x) => x.h > 0 && x.h < 44)
    );
    check(`${tag} touch targets ≥ 44px (bar, Request links, Start here, FAQ)`, small.length === 0, small);
  }
  // Click (the button at 1440, the card's image at 390 — the whole card is the link) → the form.
  const i = W > 500 ? 0 : 2;
  await p.evaluate(() => (window.__sameDoc = 1));
  const card = p.locator("#datasheets .sheet-card").nth(i);
  await card.locator("img").evaluate((el) => el.scrollIntoView({ block: "center" }));
  await p.waitForTimeout(600);
  if (W > 500) await card.locator("a").click();
  else {
    // A tap on the product image: the card's stretched link takes it.
    const box = await card.locator("img").boundingBox();
    await p.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
  }
  await p.waitForTimeout(2600);
  const f = await formState(p);
  check(`${tag} "${SHEETS[i].kind === "Brochure" ? "Request Brochure" : "Request Datasheet"}" → the homepage form, in view, interest "${SHEETS[i].interest}", message pre-filled`, f.path === "/" && f.sameDoc && f.top !== null && f.top >= 0 && f.top < 200 && f.interest === SHEETS[i].interest && f.message === SHEETS[i].message, f);
  // The message stays editable.
  const ta = p.locator("#contact textarea");
  await ta.click();
  await ta.press("End");
  await ta.pressSequentially(" Project: 2 MWh in Pune.", { delay: 10 });
  check(`${tag} the pre-filled message is editable`, (await ta.inputValue()) === `${SHEETS[i].message} Project: 2 MWh in Pune.`);
  check(`${tag} no console errors (datasheets)`, p.errors.length === 0, p.errors);
  await p.context().close();
}
{
  // A direct load of the link (a new tab, a shared URL): the same pre-fill.
  const p = await newPage(390, 844);
  await p.goto(BASE + "/#contact?interest=ci&doc=Hithium+%E2%88%9EBLOCK+C%26I+All-in-One+ESS", { waitUntil: "networkidle" });
  await p.waitForTimeout(2500);
  const f = await formState(p);
  check("direct load of a card's link: form in view, interest ci, message pre-filled", f.path === "/" && f.top >= 0 && f.top < 200 && f.interest === "ci" && f.message === SHEETS[1].message, f);
  // Without a doc, nothing is pre-filled (the existing ?interest= links).
  await p.goto(BASE + "/#contact?interest=utility", { waitUntil: "networkidle" });
  await p.waitForTimeout(2000);
  const g = await formState(p);
  check("?interest= without doc: interest preselected, message left empty (unchanged behaviour)", g.interest === "utility" && g.message === "", g);
  // What the visitor wrote is never replaced by a later document link.
  await p.locator("#contact textarea").fill("My own question.");
  await p.goto(BASE + "/#contact?interest=ci&doc=TCL+BlueArk+W10", { waitUntil: "networkidle" });
  await p.waitForTimeout(1500);
  const h = await formState(p);
  check("a typed message is kept when another document link is followed", h.message === "My own question." && h.interest === "ci", h);
  check("no console errors (direct load)", p.errors.length === 0, p.errors);
  await p.context().close();
}

// ---- FAQ (the article cards, their curtain and Start here moved to /blog) ------------------------------------
{
  const p = await newPage(1440, 900);
  await p.goto(BASE + "/resources", { waitUntil: "networkidle" });
  await p.waitForTimeout(1200);
  await p.locator("#faqs").scrollIntoViewIfNeeded();
  await p.waitForTimeout(600);
  const q = p.locator("#faqs details").nth(1);
  const h0 = (await q.boundingBox()).height;
  await q.locator("summary").click();
  await p.waitForTimeout(120);
  const hMid = (await q.boundingBox()).height;
  await p.waitForTimeout(600);
  const hEnd = (await q.boundingBox()).height;
  check("FAQ: smooth height on open, + turns into ×", hMid > h0 && hMid < hEnd && (await q.evaluate((d) => d.open)), { h0, hMid, hEnd });

  check("no console errors (FAQ / transition)", p.errors.length === 0, p.errors);
  await p.context().close();
}

// ---- Reduced motion; no JavaScript ----------------------------------------------------------------------
{
  const p = await newPage(1440, 900, { reduced: true });
  await p.goto(BASE + "/resources", { waitUntil: "networkidle" });
  await p.waitForTimeout(1500);
  await p.locator("#insights").scrollIntoViewIfNeeded();
  await p.waitForTimeout(500);
  const s = await p.evaluate(() => ({
    chips: getComputedStyle(document.querySelector(".resources-chips li")).animationName,
    shimmer: getComputedStyle(document.querySelector(".insight-soon"), "::before").animationName,
    waiting: document.querySelectorAll("[data-rv-state]").length,
  }));
  check("reduced motion: no chip animation, no shimmer, nothing held for a reveal", s.chips === "none" && s.shimmer === "none" && s.waiting === 0, s);
  await p.context().close();
  const q = await newPage(1440, 900, { js: false });
  await q.goto(BASE + "/resources", { waitUntil: "load" });
  const t = await q.evaluate(() => ({
    h1: document.querySelector("h1").textContent.replace(/\s+/g, " ").trim(),
    cards: document.querySelectorAll(".sheet-card").length,
    faq: document.querySelectorAll("#faqs details").length,
    insights: document.querySelectorAll(".insight-soon").length,
    hiddenText: [...document.querySelectorAll("main h2, main h3, .insight-soon")].filter((el) => getComputedStyle(el).opacity === "0" || el.getBoundingClientRect().height === 0).length,
  }));
  check("JS disabled: everything readable (h1, 3 datasheet cards, 3 FAQs, 4 insights)", t.h1 === "Datasheets, answers, and the latest from Nexera" && t.cards === 3 && t.faq === 3 && t.insights === 4 && t.hiddenText === 0, t);
  await q.context().close();
}

await b.close();
console.log(`${results.filter(Boolean).length}/${results.length} passed`);
process.exit(results.every(Boolean) ? 0 : 1);
