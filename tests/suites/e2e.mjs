// Homepage contact + /contact page: browser checks against the built site served by `php -S` (real
// /api/contact.php, test recipient, mail into a local SMTP sink). Usage: node e2e.mjs <base> [--shots]
import { chromium } from "playwright-core";
import fs from "node:fs";
const BASE = process.argv[2] ?? "http://127.0.0.1:8800";
const shots = process.argv.includes("--shots");
const OUT = process.env.TEST_OUT ?? process.cwd();
const MAILS = process.env.MAILS;
const mails = () => (MAILS && fs.existsSync(MAILS) ? fs.readFileSync(MAILS, "utf8").split("----- MESSAGE -----").length - 1 : 0);
const b = await chromium.launch((process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: "chrome" }));
const results = [];
const ok = (name, cond, extra = "") => {
  results.push(!!cond);
  console.log(`${cond ? "PASS" : "FAIL"} ${name}${extra ? " — " + extra : ""}`);
};
async function page(w = 1440, opts = {}) {
  const ctx = await b.newContext({ viewport: { width: w, height: w < 800 ? 844 : 900 }, isMobile: w < 800, hasTouch: w < 800, ...opts });
  const p = await ctx.newPage();
  p.errs = [];
  p.on("pageerror", (e) => p.errs.push(e.message.slice(0, 160)));
  p.on("console", (m) => m.type() === "error" && !/contact\.php|Failed to load resource/.test(m.text()) && p.errs.push(m.text().slice(0, 160)));
  return p;
}
const ev = (p, f, a) => p.evaluate(f, a);
const settle = async (p) => {
  let last = -1;
  for (let i = 0; i < 40; i++) {
    await p.waitForTimeout(120);
    const y = await ev(p, () => scrollY);
    if (y === last) break;
    last = y;
  }
};
const fill = async (p, scope, v) => {
  for (const [k, val] of Object.entries(v)) await p.fill(`${scope} [name="${k}"]`, val);
};

// --- Header and hero -------------------------------------------------------------------------
{
  const p = await page(1440);
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  const nav = await ev(p, () => ({ home: [...document.querySelectorAll("header a")].filter((a) => a.textContent.trim() === "Home").length, logo: document.querySelector('header a[href="/"]')?.getAttribute("aria-label") }));
  ok("header: no Home link; the logo is labelled 'NEXERA Powertech home'", nav.home === 0 && nav.logo === "NEXERA Powertech home", JSON.stringify(nav));
  const explore = await ev(p, () => [...document.querySelectorAll("a")].find((a) => a.textContent.trim().startsWith("Explore Solutions"))?.getAttribute("href"));
  ok("hero: Explore Solutions -> /solutions", explore === "/solutions", explore);
  await p.waitForTimeout(1500);
  await p.locator('a[href="/#contact"]').filter({ hasText: "Contact Us" }).first().click();
  await p.waitForTimeout(1800);
  await settle(p);
  const at = await ev(p, () => ({ top: Math.round(document.getElementById("contact").getBoundingClientRect().top), path: location.pathname + location.hash, focus: document.activeElement?.id }));
  ok("hero: Contact Us glides to the form (JS), clearing the sticky header", at.top >= 56 && at.top <= 72 && at.path === "/" && at.focus === "contact", JSON.stringify(at));
  ok("no console errors (home)", !p.errs.length, p.errs.join(" | "));
  await p.context().close();
}
{
  const p = await page(1440, { javaScriptEnabled: false });
  await p.goto(BASE + "/", { waitUntil: "load" });
  const href = await ev(p, () => [...document.querySelectorAll("a")].find((a) => a.textContent.trim() === "Contact Us" && !a.closest("header"))?.getAttribute("href"));
  await p.locator(`a[href="${href}"]`).filter({ hasText: "Contact Us" }).first().click();
  await p.waitForTimeout(2000); // the site's CSS scroll-behavior: smooth glides there
  const at = await ev(p, () => ({ top: Math.round(document.getElementById("contact").getBoundingClientRect().top), hash: location.hash, atEnd: Math.ceil(scrollY + innerHeight) >= document.documentElement.scrollHeight - 2 }));
  // The section's top at its scroll-margin (64 px) — or the page scrolled as far as it goes (it is the last section).
  ok("hero: Contact Us works without JS (plain #contact anchor)", href === "/#contact" && at.hash === "#contact" && (Math.abs(at.top - 64) <= 4 || (at.atEnd && at.top < 400)), `${href} ${JSON.stringify(at)}`);
  await p.context().close();
}

// --- Preselect -------------------------------------------------------------------------------
for (const url of ["/#contact?interest=ci", "/?interest=utility#contact", "/?interest=bogus#contact"]) {
  const p = await page(1440);
  await p.goto(BASE + url, { waitUntil: "networkidle" });
  await p.waitForTimeout(1500);
  const st = await ev(p, () => ({ checked: document.querySelector('#contact input[name="interest"]:checked')?.value ?? "", top: Math.round(document.getElementById("contact").getBoundingClientRect().top) }));
  const want = url.includes("ci") ? "ci" : url.includes("utility") ? "utility" : "";
  ok(`preselect ${url} -> ${want || "(none)"}; lands on the form`, st.checked === want && Math.abs(st.top - 64) <= 12, JSON.stringify(st));
  await p.context().close();
}

// --- Homepage form: validation, too fast (server), honeypot (server), success, error ---------
{
  const p = await page(1440);
  await p.goto(BASE + "/#contact", { waitUntil: "networkidle" });
  await p.waitForTimeout(1200);
  const F = "#contact form";
  // validation on blur
  await p.focus(`${F} [name="mobile"]`);
  await p.fill(`${F} [name="mobile"]`, "12345");
  await p.focus(`${F} [name="email"]`);
  await p.fill(`${F} [name="email"]`, "not-an-email");
  await p.focus(`${F} [name="city"]`);
  await p.waitForTimeout(200);
  const blurErr = await ev(p, () => ({ mobile: document.querySelector('#contact [name="mobile"]').getAttribute("aria-invalid"), email: document.querySelector('#contact [name="email"]').getAttribute("aria-invalid") }));
  ok("validation on blur (mobile, email)", blurErr.mobile === "true" && blurErr.email === "true", JSON.stringify(blurErr));
  // on submit
  await p.getByRole("button", { name: /Send enquiry/ }).click();
  await p.waitForTimeout(300);
  const subErr = await ev(p, () => {
    const s = document.getElementById("contact");
    return {
      msgs: [...s.querySelectorAll('[aria-live="polite"]')].map((e) => e.textContent).filter(Boolean),
      focus: document.activeElement?.name,
      described: [...s.querySelectorAll('[aria-invalid="true"]')].every((el) => {
        const id = (el.getAttribute("aria-describedby") || "").split(" ").pop();
        return id && document.getElementById(id)?.textContent;
      }),
    };
  });
  ok("validation on submit: errors under each field, announced (aria-live), focus on the first", subErr.msgs.length === 4 && subErr.focus === "name" && subErr.described, JSON.stringify(subErr));
  // counter
  await p.fill(`${F} [name="message"]`, "x".repeat(1200));
  const count = await ev(p, () => [document.querySelector('#contact [name="message"]').value.length, document.querySelector('#contact [id$="-count"]').textContent]);
  ok("message capped at 1,000 with a live counter", count[0] === 1000 && count[1].includes("1000 / 1000"), JSON.stringify(count));
  await p.fill(`${F} [name="message"]`, "");
  // error state: endpoint down (route aborted) — values kept
  await p.route("**/api/contact.php", (r) => r.abort());
  await fill(p, F, { name: "Asha Rao", mobile: "+91 98450 12345", email: "asha@example.com", city: "Pune", message: "Sizing a 15 kWh home system." });
  await p.locator(`${F} .contact-chip`).filter({ hasText: "Home storage" }).click();
  const n0 = mails();
  await p.getByRole("button", { name: /Send enquiry/ }).click();
  await p.waitForTimeout(300);
  const sending = await ev(p, () => {
    const btn = document.querySelector('#contact button[type="submit"]');
    return { disabled: btn.disabled, text: btn.textContent.trim(), spinner: !!btn.querySelector(".contact-spin") };
  });
  ok("while sending: button disabled, spinner, 'Sending…'", sending.disabled && sending.text === "Sending…" && sending.spinner, JSON.stringify(sending));
  await p.waitForTimeout(3600);
  const err = await ev(p, () => ({ alert: document.querySelector('#contact [role="alert"]')?.textContent.trim(), kept: document.querySelector('#contact [name="name"]').value }));
  ok("error state (endpoint down): message shown, values kept", err.alert?.startsWith("Something went wrong. Please try again, or call/email us.") && err.kept === "Asha Rao", JSON.stringify(err));
  await p.unroute("**/api/contact.php");
  if (shots) await p.screenshot({ path: `${OUT}/home-error-1440.png` });
  // success (real PHP)
  await p.getByRole("button", { name: /Send enquiry/ }).click();
  await p.waitForTimeout(2500);
  const done = await ev(p, () => document.querySelector('#contact [role="status"]')?.textContent.trim());
  ok("success (real /api/contact.php): thank-you with the first name", done?.startsWith("Thank you, Asha. We’ve received your enquiry and our team will get back to you shortly."), done);
  ok("the email reached the (local) inbox", mails() === n0 + 1, `mails ${n0} -> ${mails()}`);
  if (shots) {
    await ev(p, () => document.getElementById("contact").scrollIntoView({ block: "start" }));
    await p.waitForTimeout(1800);
    await p.screenshot({ path: `${OUT}/home-success-1440.png` });
  }
  await p.getByRole("button", { name: "Send another enquiry" }).click();
  await p.waitForTimeout(400);
  ok("'Send another enquiry' brings back an empty form, focus on Name", await ev(p, () => document.activeElement?.name === "name" && document.querySelector('#contact [name="name"]').value === ""));
  // server-side rejections through the real page: honeypot, too fast
  await fill(p, F, { name: "Bot", mobile: "9845012345" });
  await p.locator(`${F} .contact-chip`).filter({ hasText: "Utility-scale" }).click();
  await ev(p, () => {
    const hp = document.querySelector('#contact [name="website"]');
    const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
    set.call(hp, "http://spam.example");
    hp.dispatchEvent(new Event("input", { bubbles: true }));
  });
  const n1 = mails();
  const respHp = p.waitForResponse("**/api/contact.php");
  await p.getByRole("button", { name: /Send enquiry/ }).click();
  const rh = await respHp;
  await p.waitForTimeout(500);
  ok("honeypot filled -> refused by the API (400 rejected), nothing sent, error shown", rh.status() === 400 && (await rh.json()).error === "rejected" && mails() === n1 && (await ev(p, () => !!document.querySelector('#contact [role="alert"]'))), String(rh.status()));
  ok("no console errors (form)", !p.errs.length, p.errs.join(" | "));
  if (shots) {
    await p.goto(BASE + "/#contact", { waitUntil: "networkidle" });
    await p.waitForTimeout(2000);
    await ev(p, () => document.getElementById("contact").scrollIntoView({ block: "start" }));
    await p.waitForTimeout(1500);
    await p.screenshot({ path: `${OUT}/home-contact-1440.png` });
  }
  await p.context().close();
}
{
  // too fast: a bot posting straight to the API with a fresh timestamp
  const p = await page(1440);
  await p.goto(BASE + "/", { waitUntil: "load" });
  const r = await ev(p, async () => {
    const t = Date.now();
    const res = await fetch("/api/contact.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "Bot", mobile: "9845012345", interest: "home", website: "", startedAt: t, sentAt: t + 400 }) });
    return [res.status, await res.json()];
  });
  ok("too-fast submit -> refused (400 too_fast)", r[0] === 400 && r[1].error === "too_fast", JSON.stringify(r));
  await p.context().close();
}

// --- Phone layout -----------------------------------------------------------------------------
if (shots) {
  const p = await page(390);
  await p.goto(BASE + "/#contact", { waitUntil: "networkidle" });
  await p.waitForTimeout(2000);
  await ev(p, () => document.getElementById("contact").scrollIntoView({ block: "start" }));
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `${OUT}/home-contact-390.png`, fullPage: false });
  const top = await ev(p, () => document.getElementById("contact").getBoundingClientRect().top + scrollY);
  await p.screenshot({ path: `${OUT}/home-contact-390-full.png`, clip: { x: 0, y: top, width: 390, height: Math.min(2600, await ev(p, () => document.getElementById("contact").offsetHeight)) }, fullPage: true });
  await p.context().close();
}

// --- /contact page form: same endpoint, same behaviour ------------------------------------------
{
  const p = await page(1440);
  await p.goto(BASE + "/contact?intent=ci", { waitUntil: "networkidle" });
  await p.waitForTimeout(1000);
  await p.getByRole("button", { name: "Send", exact: true }).click();
  await p.waitForTimeout(300);
  const v = await ev(p, () => [...document.querySelectorAll('form [aria-invalid="true"]')].map((e) => e.name));
  ok("/contact: validation (name, email, mobile)", ["name", "email", "mobile"].every((n) => v.includes(n)), v.join(","));
  await fill(p, "form", { name: "Ravi Kumar", email: "ravi@example.com", mobile: "9876543210", site: "Hosur", message: "Need a C&I system." });
  const n0 = mails();
  const resp = p.waitForResponse("**/api/contact.php");
  await p.getByRole("button", { name: "Send", exact: true }).click();
  const r = await resp;
  const body = JSON.parse(r.request().postData());
  await p.waitForTimeout(800);
  const done = await ev(p, () => document.querySelector('[role="status"]')?.textContent.trim());
  ok("/contact: posts to /api/contact.php (interest ci, details carried), success shown", r.status() === 200 && body.interest === "ci" && body.details.site === "Hosur" && !!done && mails() === n0 + 1, `${r.status()} ${body.interest} ${done}`);
  await p.goto(BASE + "/contact", { waitUntil: "networkidle" });
  await p.route("**/api/contact.php", (rt) => rt.fulfill({ status: 502, contentType: "application/json", body: '{"ok":false,"error":"send_failed"}' }));
  await fill(p, "form", { name: "Ravi Kumar", email: "ravi@example.com", mobile: "9876543210" });
  await p.selectOption("#enquiry_type", "residential");
  await p.getByRole("button", { name: "Send", exact: true }).click();
  await p.waitForTimeout(3800);
  const err = await ev(p, () => ({ alert: document.querySelector('[role="alert"]')?.textContent.trim(), kept: document.querySelector('[name="name"]').value }));
  ok("/contact: error state, values kept", err.alert?.startsWith("Something went wrong.") && err.kept === "Ravi Kumar", JSON.stringify(err));
  // (/contact?intent=… has a hydration warning that predates this work — the page reads its query
  // during render; the plain /contact page is checked here.)
  ok("no console errors (/contact, plain)", !p.errs.filter((e) => !/#418/.test(e)).length, p.errs.join(" | "));
  await p.context().close();
}

console.log(`${results.filter(Boolean).length}/${results.length} passed`);
await b.close();
