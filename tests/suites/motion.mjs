// The article's motion: scenes, controls, reduced motion, no JS, transition, TOC, FAQ, CLS, long tasks.
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
const sectionIds = ["bess-full-form", "how-a-bess-works", "main-parts", "key-terms", "types-by-scale", "uses", "choosing"];
const visuals = ["bess-letters", "energy-flow", "cabinet-parts", "key-terms", "scale-morph", "day-dial", "choose-chips"];
const toSection = (p, id, y = 0.35) =>
  p.evaluate(
    ([id, y]) => {
      const el = document.querySelector(`[data-section="${id}"]`);
      window.scrollTo(0, el.getBoundingClientRect().top + scrollY - innerHeight * y);
    },
    [id, y]
  );
// Gentle scroll (a reading pace), so reveals animate rather than skip.
const glide = async (p, to) => {
  const from = await p.evaluate(() => scrollY);
  const steps = Math.max(1, Math.round(Math.abs(to - from) / 120));
  for (let i = 1; i <= steps; i++) {
    await p.evaluate((y) => scrollTo(0, y), from + ((to - from) * i) / steps);
    await p.waitForTimeout(90);
  }
};

// ---- 1440: scenes switch down and back up; motion is on ---------------------------------------------
{
  const p = await newPage(1440, 900);
  await p.goto(BASE + URL_A, { waitUntil: "networkidle" });
  await p.waitForTimeout(2500);
  const motionOn = await p.evaluate(() => !!document.querySelector('[data-scene="bess-letters"]:not([data-static])'));
  check("@1440 the scenes mount in the stage (motion loaded after idle)", motionOn);
  const seen = [];
  for (const id of sectionIds) {
    await toSection(p, id);
    await p.waitForTimeout(1200);
    seen.push(await p.evaluate(() => document.querySelector(".article-stage-slot[data-on]")?.dataset.scene));
  }
  check("@1440 scrolling down: each section shows its scene", seen.join() === visuals.join(), seen);
  const back = [];
  for (const id of [...sectionIds].reverse()) {
    await toSection(p, id);
    await p.waitForTimeout(1000);
    back.push(await p.evaluate(() => document.querySelector(".article-stage-slot[data-on]")?.dataset.scene));
  }
  check("@1440 scrolling back up: the scenes follow in reverse", back.join() === [...visuals].reverse().join(), back);

  // Steps: the cabinet's parts follow the points as they are read.
  await toSection(p, "main-parts", 0.1);
  await p.waitForTimeout(800);
  const lit = [];
  const items = await p.evaluate(() => [...document.querySelectorAll('[data-of="main-parts"]')].map((li) => li.getBoundingClientRect().top + scrollY));
  for (const top of items) {
    await p.evaluate((t) => scrollTo(0, t - innerHeight * 0.45 + 6), top);
    await p.waitForTimeout(500);
    lit.push(await p.evaluate(() => document.querySelector('[data-scene="cabinet-parts"] text.fill-accent')?.textContent));
  }
  check("@1440 parts: each point lights its part as it reaches the reading line", lit.join("|") === "Battery modules|BMS|PCS|EMS|Thermal management|Fire protection", lit);
  // Hover a point → its part.
  await p.locator('[data-of="main-parts"]').nth(3).hover();
  await p.waitForTimeout(300);
  const hovered = await p.evaluate(() => document.querySelector('[data-scene="cabinet-parts"] text.fill-accent')?.textContent);
  check("@1440 parts: hovering a point highlights its part", hovered === "EMS", hovered);

  // Energy flow: toggle by mouse and keyboard.
  await toSection(p, "how-a-bess-works");
  await p.waitForTimeout(1200);
  const flow = p.locator('[data-scene="energy-flow"]');
  await flow.getByText("Discharging", { exact: true }).click();
  await p.waitForTimeout(600);
  const m1 = await flow.locator("[data-mode]").getAttribute("data-mode");
  const label1 = await flow.locator('svg[role="img"]').getAttribute("aria-label");
  await flow.locator('input[value="discharging"]').focus();
  await p.keyboard.press("ArrowLeft");
  await p.waitForTimeout(400);
  const m2 = await flow.locator("[data-mode]").getAttribute("data-mode");
  const checked = await flow.locator('input[value="charging"]').isChecked();
  const dots = await flow.locator("[data-dot]").count();
  check("@1440 Charging/Discharging: mouse sets discharging, ArrowLeft (keyboard) back to charging; particles on the wires", m1 === "discharging" && label1.includes("discharging") && m2 === "charging" && checked && dots > 0, { m1, m2, checked, dots });

  // C-rate slider: mouse and keyboard.
  await toSection(p, "key-terms");
  await p.waitForTimeout(1200);
  const kt = p.locator('[data-scene="key-terms"]');
  const range = kt.locator('input[type="range"]');
  const box = await range.boundingBox();
  await p.mouse.click(box.x + box.width - 4, box.y + box.height / 2);
  await p.waitForTimeout(300);
  const out1 = (await kt.locator("output").textContent()).trim();
  const vt1 = await range.getAttribute("aria-valuetext");
  await range.focus();
  await p.keyboard.press("ArrowLeft");
  await p.waitForTimeout(300);
  const out2 = (await kt.locator("output").textContent()).trim();
  check("@1440 C-rate slider: click → 1C (about 1 hour), ArrowLeft → 0.5C (about 2 hours)", out1 === "1C: about 1 hour" && vt1 === "1C, about 1 hour" && out2 === "0.5C: about 2 hours", { out1, vt1, out2 });

  // Accessible scenes: each has role=img with a label.
  const imgs = await p.evaluate(() => [...document.querySelectorAll(".article-stage-slot")].map((s) => ({ scene: s.dataset.scene, img: !!s.querySelector('[role="img"][aria-label]') })));
  check("@1440 every scene has role=img with an aria-label", imgs.length >= 7 && imgs.every((x) => x.img), imgs.filter((x) => !x.img));
  const cls = await p.evaluate(() => window.__cls);
  check("@1440 CLS < 0.1 through load and all the scene changes", cls < 0.1, +cls.toFixed(4));
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
  const flash = await p.evaluate(() => document.getElementById("types-by-scale").classList.contains("article-flash"));
  await p.waitForTimeout(1200);
  const t1 = await ind();
  const top = await p.evaluate(() => Math.round(document.getElementById("types-by-scale").getBoundingClientRect().top));
  check("@1440 TOC: the green indicator slides to the clicked item; the heading flashes; lands under the header", t0 !== t1 && flash && top >= 60 && top <= 110, { t0, t1, flash, top });

  // Reveal: headings below the screen draw their line and rise (they end fully visible).
  const revealed = await p.evaluate(() => [...document.querySelectorAll('[data-rv]')].filter((el) => el.dataset.rvState).length);
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

// ---- 390: inline scenes play in view; no stage; fewer particles -------------------------------------------
{
  const p = await newPage(390, 844);
  await p.goto(BASE + URL_A, { waitUntil: "networkidle" });
  await p.waitForTimeout(2000);
  const s = await p.evaluate(() => ({
    stage: getComputedStyle(document.querySelector(".article-stage")).display,
    inline: [...document.querySelectorAll(".article-inline-scene")].map((el) => Math.round(el.getBoundingClientRect().height)),
  }));
  check("@390 no stage; a scene under each heading at its reserved height", s.stage === "none" && s.inline.length === 7 && s.inline.every((h) => h >= 240), s);
  await toSection(p, "how-a-bess-works", 0.05);
  await p.waitForTimeout(1800);
  const pos = () =>
    p.evaluate(() => {
      const sc = document.querySelector('[data-section="how-a-bess-works"] .article-inline-scene');
      return { dots: sc.querySelectorAll("[data-dot]").length, mode: sc.querySelector("[data-mode]")?.dataset.mode, at: [...sc.querySelectorAll("[data-dot]")].map((d) => d.getBoundingClientRect()).map((r) => `${Math.round(r.x)},${Math.round(r.y)}`).join(" ") };
    });
  const a1 = await pos();
  await p.waitForTimeout(400);
  const a2 = await pos();
  const flow = { dots: a1.dots, mode: a2.mode, moving: a1.at !== a2.at };
  check("@390 the energy flow plays inline when scrolled into view", flow.dots > 0 && flow.moving, flow);
  // Touch targets.
  const small = await p.evaluate(() =>
    [...document.querySelectorAll(".article-inline-scene label span, .article-inline-scene input[type=range], aside details a, #faq summary")]
      .map((el) => ({ h: Math.round(el.getBoundingClientRect().height), t: (el.textContent || el.type).trim().slice(0, 20) }))
      .filter((x) => x.h > 0 && x.h < 44)
  );
  check("@390 touch targets ≥ 44px (toggle, slider, contents links, FAQ questions)", small.length === 0, small);
  const cls = await p.evaluate(() => window.__cls);
  check("@390 CLS < 0.1", cls < 0.1, +cls.toFixed(4));
  check("@390 no console errors", p.errors.length === 0, p.errors);
  await p.context().close();
}

// ---- Reduced motion: static scenes ------------------------------------------------------------------------
{
  const p = await newPage(1440, 900, { reduced: true });
  await p.goto(BASE + URL_A, { waitUntil: "networkidle" });
  await p.waitForTimeout(2000);
  await toSection(p, "how-a-bess-works");
  await p.waitForTimeout(1000);
  const s = await p.evaluate(() => ({
    h1Anim: getComputedStyle(document.querySelector(".article-h1-word > span")).animationName,
    dots: document.querySelectorAll("[data-dot]").length,
    arrows: document.querySelectorAll('[data-scene="energy-flow"] path[marker-end]').length,
    run: document.querySelectorAll("[data-run]").length,
    waiting: document.querySelectorAll("[data-rv-state]").length,
    slotTransition: getComputedStyle(document.querySelector(".article-stage-slot")).transitionDuration,
  }));
  check("reduced motion: header static, no particles (direction arrows instead), no loops, nothing held for a reveal, no cross-fade", s.h1Anim === "none" && s.dots === 0 && s.arrows > 0 && s.run === 0 && s.waiting === 0 && parseFloat(s.slotTransition) < 0.01, s);
  // The toggle still works (static).
  await p.locator('[data-scene="energy-flow"]').getByText("Discharging", { exact: true }).click();
  await p.waitForTimeout(200);
  check("reduced motion: the Charging/Discharging switch still works (static states)", (await p.locator('[data-scene="energy-flow"] [data-mode]').getAttribute("data-mode")) === "discharging");
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
  check("JS disabled: the full text is there and visible (h1, every h2, the FAQ)", s.h1 === "What Is a BESS? A Plain Guide to Battery Energy Storage" && s.h2 >= 10 && s.faq === 5 && s.hidden === 0 && s.text > 3000, s);
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
