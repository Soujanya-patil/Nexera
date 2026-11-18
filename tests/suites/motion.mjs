// The article's motion on /blog/what-is-bess (the Step 11 refresh, published 17 November 2026): reveals
// while reading, TOC, FAQ, reduced motion, no JS, header, card transition, CLS, long tasks. (The refresh
// has no scroll-scene stage; the checks for the old article's scenes went with them.)
// Usage: node motion.mjs http://127.0.0.1:8810
import { chromium } from "playwright-core";

const BASE = process.argv[2];
const URL_A = "/blog/what-is-bess";
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
  p.on("console", (m) => m.type() === "error" && p.errors.push(m.text().slice(0, 160)));
  p.on("pageerror", (e) => p.errors.push(e.message.slice(0, 160)));
  await p.addInitScript(() => {
    window.__cls = 0;
    window.__long = [];
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value;
    }).observe({ type: "layout-shift", buffered: true });
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) window.__long.push({ d: Math.round(e.duration), t: Math.round(e.startTime) });
    }).observe({ type: "longtask", buffered: true });
  });
  return p;
}
// Gentle scroll (a reading pace), so reveals animate rather than skip.
const glide = async (p, to) => {
  const from = await p.evaluate(() => scrollY);
  const steps = Math.max(1, Math.round(Math.abs(to - from) / 120));
  for (let i = 1; i <= steps; i++) {
    await p.evaluate((y) => scrollTo(0, y), from + ((to - from) * i) / steps);
    await p.waitForTimeout(90);
  }
};

// ---- 1440: reading down the article: no scene stage; every reveal plays and ends fully visible ----------
{
  const p = await newPage(1440, 900);
  await p.goto(BASE + URL_A, { waitUntil: "networkidle" });
  await p.waitForTimeout(2500);
  const stage = await p.evaluate(() => ({ stage: !!document.querySelector(".article-stage"), scenes: document.querySelectorAll("[data-scene]").length, rv: document.querySelectorAll("[data-rv]").length }));
  check("@1440 no scene stage (the refreshed article has none); reveal targets present", !stage.stage && stage.scenes === 0 && stage.rv > 20, stage);
  // Read down to the end at a reading pace, then let the last reveals finish.
  await glide(p, await p.evaluate(() => document.documentElement.scrollHeight - innerHeight));
  await p.waitForTimeout(1500);
  const hidden = await p.evaluate(() =>
    [...document.querySelectorAll("[data-rv]")]
      .filter((el) => {
        const cs = getComputedStyle(el);
        return parseFloat(cs.opacity) < 0.99 || cs.visibility === "hidden";
      })
      .map((el) => el.tagName + ":" + el.textContent.trim().slice(0, 30))
  );
  check("@1440 reading down: every revealed block ends fully visible", hidden.length === 0, hidden.slice(0, 5));
  const cls = await p.evaluate(() => window.__cls);
  check("@1440 CLS < 0.1 through load and reading to the end", cls < 0.1, +cls.toFixed(4));
  check("@1440 no console errors", p.errors.length === 0, p.errors);
  await p.context().close();
}

// ---- 1440: TOC indicator and flash; FAQ height; reveals --------------------------------------------
{
  const p = await newPage(1440, 900);
  await p.goto(BASE + URL_A, { waitUntil: "networkidle" });
  await p.waitForTimeout(2500);
  const ind = () => p.evaluate(() => document.querySelector('nav[aria-label="On this page"] span[aria-hidden="true"]')?.style.transform);
  const t0 = await ind();
  await p.locator('nav[aria-label="On this page"] a', { hasText: "Types of BESS by scale" }).click();
  await p.waitForTimeout(900);
  const flash = await p.evaluate(() => document.getElementById("types-of-bess-by-scale").classList.contains("article-flash"));
  await p.waitForTimeout(1200);
  const t1 = await ind();
  const top = await p.evaluate(() => Math.round(document.getElementById("types-of-bess-by-scale").getBoundingClientRect().top));
  check("@1440 TOC: the green indicator slides to the clicked item; the heading flashes; lands under the header", t0 !== t1 && flash && top >= 60 && top <= 110, { t0, t1, flash, top });

  // FAQ: open the second question, height animates.
  await p.locator("#faq").scrollIntoViewIfNeeded();
  await glide(p, await p.evaluate(() => document.getElementById("faq").getBoundingClientRect().top + scrollY - 120));
  await p.waitForTimeout(800);
  const q = p.locator("#faq details").nth(1);
  const h0 = (await q.boundingBox()).height;
  await q.locator("summary").click();
  await p.waitForTimeout(120);
  const hMid = (await q.boundingBox()).height;
  await p.waitForTimeout(600);
  const hEnd = (await q.boundingBox()).height;
  const open = await q.evaluate((d) => d.open);
  const rot = await q.evaluate((d) => getComputedStyle(d.querySelector(".article-faq-icon")).transform);
  check("@1440 FAQ: opening animates the height (no jump), the + turns into ×, card glows", open && hMid > h0 && hMid < hEnd && rot !== "none", { h0, hMid, hEnd, rot });
  await q.locator("summary").click();
  await p.waitForTimeout(500);
  check("@1440 FAQ: closing animates back", !(await q.evaluate((d) => d.open)) && Math.abs((await q.boundingBox()).height - h0) < 2);
  check("@1440 no console errors (TOC / FAQ)", p.errors.length === 0, p.errors);
  await p.context().close();
}

// ---- 390: no stage or inline scenes; touch targets; CLS -----------------------------------------------------
{
  const p = await newPage(390, 844);
  await p.goto(BASE + URL_A, { waitUntil: "networkidle" });
  await p.waitForTimeout(2000);
  const s = await p.evaluate(() => ({ stage: !!document.querySelector(".article-stage"), inline: document.querySelectorAll(".article-inline-scene").length }));
  check("@390 no stage and no inline scenes (the refreshed article has none)", !s.stage && s.inline === 0, s);
  await glide(p, await p.evaluate(() => document.documentElement.scrollHeight - innerHeight));
  await p.waitForTimeout(1200);
  // Touch targets.
  const small = await p.evaluate(() =>
    [...document.querySelectorAll("aside details a, aside details summary, #faq summary")]
      .map((el) => ({ h: Math.round(el.getBoundingClientRect().height), t: el.textContent.trim().slice(0, 20) }))
      .filter((x) => x.h > 0 && x.h < 44)
  );
  check("@390 touch targets ≥ 44px (contents links, FAQ questions)", small.length === 0, small);
  const cls = await p.evaluate(() => window.__cls);
  check("@390 CLS < 0.1", cls < 0.1, +cls.toFixed(4));
  check("@390 no console errors", p.errors.length === 0, p.errors);
  await p.context().close();
}

// ---- Reduced motion: nothing moves, nothing waits for a reveal; the FAQ still works ----------------------
{
  const p = await newPage(1440, 900, { reduced: true });
  await p.goto(BASE + URL_A, { waitUntil: "networkidle" });
  await p.waitForTimeout(2000);
  await p.evaluate(() => window.scrollTo(0, document.getElementById("how-does-a-bess-work").getBoundingClientRect().top + scrollY - 120));
  await p.waitForTimeout(1000);
  const s = await p.evaluate(() => ({
    h1Anim: getComputedStyle(document.querySelector(".article-h1-word > span")).animationName,
    run: document.querySelectorAll("[data-run]").length,
    waiting: document.querySelectorAll("[data-rv-state]").length,
    hidden: [...document.querySelectorAll("[data-rv]")].filter((el) => parseFloat(getComputedStyle(el).opacity) < 0.99).length,
  }));
  check("reduced motion: header static, no loops, nothing held for a reveal (every block visible)", s.h1Anim === "none" && s.run === 0 && s.waiting === 0 && s.hidden === 0, s);
  // The second question (the first is open by default).
  const q = p.locator("#faq details").nth(1);
  await q.scrollIntoViewIfNeeded();
  const was = await q.evaluate((d) => d.open);
  await q.locator("summary").click();
  await p.waitForTimeout(200);
  check("reduced motion: a closed FAQ question still opens", !was && (await q.evaluate((d) => d.open)), { was });
  await p.context().close();
}

// ---- JavaScript disabled: all the text ---------------------------------------------------------------------
{
  const p = await newPage(1440, 900, { js: false });
  await p.goto(BASE + URL_A, { waitUntil: "load" });
  const s = await p.evaluate(() => ({
    h1: document.querySelector("h1").textContent.replace(/\s+/g, " ").trim(),
    h2: [...document.querySelectorAll("h2")].length,
    faq: document.querySelectorAll("#faq details").length,
    // (scene artwork excluded: the inline scenes are phone-only and decorative)
    hidden: [...document.querySelectorAll("article p, article li, .article-term-card, #faq h3")].filter((el) => !el.closest(".article-inline-scene, .article-stage")).filter((el) => {
      const cs = getComputedStyle(el);
      return cs.opacity === "0" || cs.visibility === "hidden" || el.getBoundingClientRect().height === 0;
    }).length,
    text: document.querySelector("article").innerText.length,
  }));
  check("JS disabled: the full text is there and visible (h1, every h2, the FAQ)", s.h1 === "What Is a BESS? A Complete Guide to Battery Energy Storage Systems in India" && s.h2 >= 10 && s.faq === 6 && s.hidden === 0 && s.text > 3000, s);
  await p.context().close();
}

// ---- Direct load: the h1 shows at once (no reveal); the rest of the header still moves -----------------
{
  const p = await newPage(1440, 900);
  await p.goto(BASE + URL_A, { waitUntil: "load" });
  const s = await p.evaluate(() => ({
    h1: getComputedStyle(document.querySelector(".article-h1-word > span")).animationName,
    reveal: document.querySelector(".article-header").dataset.reveal ?? null,
    intro: getComputedStyle(document.querySelector(".article-intro")).animationName,
    grid: getComputedStyle(document.querySelector(".article-grid-line")).animationName,
  }));
  check("direct load: the h1 shows instantly (no word reveal); intro fade and grid still animate", s.h1 === "none" && s.reveal === null && s.intro === "article-fade-up" && s.grid === "article-draw", s);
  await p.context().close();
}

// ---- Guides card → article transition, and Back ------------------------------------------------------------
{
  const p = await newPage(1440, 900);
  await p.goto(BASE + "/blog", { waitUntil: "networkidle" });
  await p.waitForTimeout(800);
  await p.locator('a[data-slug="what-is-bess"]').click();
  await p.waitForTimeout(250);
  const covering = await p.evaluate(() => !!document.querySelector(".page-curtain"));
  await p.waitForURL((u) => u.pathname === URL_A, { timeout: 8000 });
  await p.waitForTimeout(1400);
  const after = await p.evaluate(() => ({ curtain: !!document.querySelector(".page-curtain"), play: document.querySelector(".article-header")?.dataset.play, h1: document.querySelector("h1")?.textContent.replace(/\s+/g, " ").trim(), rise: getComputedStyle(document.querySelector(".article-h1-word > span")).animationName }));
  check("via the Guides card: the h1's words rise (reveal)", after.rise === "article-rise", after.rise);
  check("Guides card → article: the curtain grows from the card, the article opens and the curtain lifts; header plays", covering && !after.curtain && after.play === "now" && after.h1.startsWith("What Is a BESS?"), { covering, ...after });
  await p.goBack();
  await p.waitForTimeout(150);
  const backCurtain = await p.evaluate(() => !!document.querySelector(".page-curtain"));
  await p.waitForTimeout(900);
  const backDone = await p.evaluate(() => ({ path: location.pathname, curtain: !!document.querySelector(".page-curtain") }));
  check("Back: the curtain shrinks back into the card on /blog", backCurtain && backDone.path === "/blog" && !backDone.curtain, { backCurtain, ...backDone });
  check("no console errors (transition)", p.errors.length === 0, p.errors);
  await p.context().close();
}

// ---- Long tasks during load and motion setup ----------------------------------------------------------------
for (const [w, h] of [
  [1440, 900],
  [390, 844],
]) {
  const p = await newPage(w, h);
  await p.goto(BASE + URL_A, { waitUntil: "networkidle" });
  await p.waitForTimeout(4000);
  const long = await p.evaluate(() => window.__long);
  console.log(`INFO @${w} long tasks (ms @ t):`, JSON.stringify(long));
  await p.context().close();
}

await b.close();
console.log(`${results.filter(Boolean).length}/${results.length} passed`);
process.exit(results.every(Boolean) ? 0 : 1);
