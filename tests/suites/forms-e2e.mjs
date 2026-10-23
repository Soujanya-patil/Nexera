// The enquiry forms in the browser, at 1440 and 390, against the built site on `php -S` (real
// api/contact.php, test recipient, mail into the local SMTP sink).
// Usage: MAILS=<mails.log> RATE_DIR=<e2e/nexera-private> node forms-e2e.mjs http://127.0.0.1:8800
// Each form: a junk value shows its error on blur; the brief's junk set shows the right message under
// every field (aria-invalid, aria-describedby), focuses the first, keeps what was typed and sends
// nothing; a fixed field clears live; a realistic set sends, shows success, and one email arrives.
import { chromium } from "playwright-core";
import fs from "node:fs";

const BASE = process.argv[2] ?? "http://127.0.0.1:8800";
const MAILS = process.env.MAILS;
const RATE_DIR = process.env.RATE_DIR;
const mails = () => (MAILS && fs.existsSync(MAILS) ? fs.readFileSync(MAILS, "utf8").split("----- MESSAGE -----").length - 1 : 0);
const results = [];
const ok = (name, cond, extra = "") => {
  results.push(!!cond);
  console.log(`${cond ? "PASS" : "FAIL"} ${name}${extra ? " — " + extra : ""}`);
};
const MSG = {
  name: "Please enter your full name.",
  company: "Please enter your company name.",
  email: "Please enter a valid email address.",
  mobile: "Please enter a valid mobile number.",
  city: "Please enter your city or location.",
  requirement: "Please add a unit, e.g. 500 kWh, 2 MW or 3 systems.",
  message: "Please write a few words about your requirement.",
};
const MESSAGE = "We are planning a 500 kWh C&I system for our plant and would like a quote.";

// Each form: where it is, how to reach it, its fields (form name -> [junk, realistic, expected message]),
// and how it shows success. `pick`: choices set before sending (selects / chips).
const FORMS = [
  {
    id: "/contact",
    url: "/contact",
    scope: 'form:has([name="enquiry_type"])',
    fields: {
      name: ["11", "Ankit Sharma", MSG.name],
      email: ["111@gmail.com", "ankit.sharma@gmail.com", MSG.email],
      mobile: ["11", "98765 43210", MSG.mobile],
      message: ["1111", MESSAGE, MSG.message],
    },
    pick: async (p, s) => p.selectOption(`${s} [name="enquiry_type"]`, "ci"),
    success: (p) => p.getByText("Message received.").waitFor({ timeout: 10000 }),
  },
  {
    id: "/contact (brand / OEM)",
    url: "/contact",
    open: async (p) => p.getByRole("button", { name: "Brand / OEM inquiry" }).click(),
    scope: 'form:has([name="proposal"])',
    fields: {
      name: ["11", "K. S. Rao", MSG.name],
      email: ["111@gmail.com", "info@company.co.in", MSG.email],
      mobile: ["11", "+91-9876543210", MSG.mobile],
      company: ["111", "3M India", MSG.company],
      proposal: ["1111", "We make LFP battery modules and would like to discuss a partnership.", MSG.message],
    },
    pick: async (p, s) => p.fill(`${s} [name="brand"]`, "Acme Cells"),
    success: (p) => p.getByText("Message received.").waitFor({ timeout: 10000 }),
  },
  {
    id: "homepage #contact",
    url: "/#contact",
    scope: "#contact form",
    fields: {
      name: ["11", "Ankit Sharma", MSG.name],
      mobile: ["11", "+91 98450 12345", MSG.mobile],
      email: ["111@gmail.com", "ankit.sharma@gmail.com", MSG.email],
      company: ["111", "Suntrop Solar Pvt. Ltd.", MSG.company],
      city: ["111", "Bengaluru 560001", MSG.city],
      message: ["1111", MESSAGE, MSG.message],
    },
    pick: async (p) => p.locator("#contact label.contact-chip", { hasText: "Business / C&I" }).click(),
    success: (p) => p.locator('#contact [role="status"]', { hasText: "Thank you" }).waitFor({ timeout: 10000 }),
  },
  {
    id: "call-back widget",
    url: "/products",
    open: async (p) => {
      await p.waitForSelector(".cb-dock", { state: "attached", timeout: 8000 });
      await p.evaluate(() => scrollTo(0, 600));
      await p.waitForTimeout(800);
      await p.locator(".cb-dock > button[aria-haspopup]").click();
      await p.locator('[role="dialog"][aria-modal="true"]').waitFor();
      await p.waitForTimeout(600);
    },
    scope: '[role="dialog"][aria-modal="true"]',
    submit: (p, s) => p.locator(s).getByRole("button", { name: "Get a call back" }).click(),
    fields: {
      name: ["11", "K. S. Rao", MSG.name],
      mobile: ["11", "+44 20 7946 0958", MSG.mobile],
    },
    pick: async (p, s) => p.locator(`${s} label.contact-chip`, { hasText: "Home storage" }).click(),
    success: (p) => p.locator('[role="dialog"] [role="status"]').first().waitFor({ timeout: 10000 }),
  },
  {
    id: "Become a Partner",
    url: "/become-a-partner#apply",
    scope: "#apply form",
    fields: {
      name: ["11", "Ankit Sharma", MSG.name],
      company: ["111", "3M India", MSG.company],
      email: ["111@gmail.com", "info@company.co.in", MSG.email],
      phone: ["11", "+44 20 7946 0958", MSG.mobile],
      location: ["111", "Kalaburagi", MSG.city],
      requirement: ["11", "2 MW", MSG.requirement],
      message: ["1111", "We are an EPC in Karnataka planning C&I storage projects this year.", MSG.message],
    },
    pick: async (p, s) => p.selectOption(`${s} [name="application"]`, "ci"),
    success: (p) => p.getByText("Enquiry received.").waitFor({ timeout: 10000 }),
  },
];

const b = await chromium.launch((process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: "chrome" }));
// Field state as a visitor (and a screen reader) gets it: value, aria-invalid, the described-by text.
const stateOf = (p, scope, names) =>
  p.evaluate(
    ([scope, names]) => {
      const form = document.querySelector(scope);
      return Object.fromEntries(
        names.map((n) => {
          const el = form.querySelector(`[name="${n}"]`);
          const ids = (el.getAttribute("aria-describedby") || "").split(/\s+/).filter(Boolean);
          const msg = ids.map((id) => document.getElementById(id)?.textContent.trim() ?? "").join(" ").trim();
          return [n, { value: el.value, invalid: el.getAttribute("aria-invalid") === "true", msg }];
        })
      );
    },
    [scope, names]
  );

for (const W of [1440, 390]) {
  for (const F of FORMS) {
    const tag = `${F.id} @${W}:`;
    const ctx = await b.newContext({ viewport: { width: W, height: W < 800 ? 844 : 900 }, isMobile: W < 800, hasTouch: W < 800 });
    const p = await ctx.newPage();
    const errs = [];
    p.on("pageerror", (e) => errs.push(e.message.slice(0, 160)));
    let posted = 0;
    p.on("request", (r) => r.url().includes("/api/contact.php") && posted++);
    await p.goto(BASE + F.url, { waitUntil: "networkidle" });
    await p.waitForTimeout(1200);
    if (F.open) await F.open(p);
    const S = F.scope;
    const names = Object.keys(F.fields);
    const submit = () => (F.submit ? F.submit(p, S) : p.locator(`${S} button[type="submit"]`).click());

    // On blur: the first field's junk value shows its message as the visitor moves on.
    const [first] = names;
    await p.fill(`${S} [name="${first}"]`, F.fields[first][0]);
    await p.locator(`${S} [name="${first}"]`).press("Tab");
    await p.waitForTimeout(250);
    const blurred = (await stateOf(p, S, [first]))[first];
    ok(`${tag} blur shows the error on "${first}"`, blurred.invalid && blurred.msg.endsWith(F.fields[first][2]), JSON.stringify(blurred));

    // The junk set: every field's message, focus on the first, values kept, nothing sent.
    for (const [n, [junk]] of Object.entries(F.fields)) await p.fill(`${S} [name="${n}"]`, junk);
    if (F.pick) await F.pick(p, S);
    const n0 = mails();
    await submit();
    await p.waitForTimeout(700);
    const st = await stateOf(p, S, names);
    // The described-by text may also hold a field's own hint (the homepage message's character count).
    const wrong = names.filter((n) => !(st[n].invalid && st[n].msg.endsWith(F.fields[n][2]) && st[n].value === F.fields[n][0]));
    const focus = await p.evaluate(() => document.activeElement?.getAttribute("name"));
    ok(`${tag} junk set -> the right message under every field (aria-invalid + aria-describedby), values kept`, wrong.length === 0, wrong.map((n) => `${n}: ${JSON.stringify(st[n])}`).join(" | "));
    ok(`${tag} junk set -> focus on the first invalid field ("${first}")`, focus === first, String(focus));
    ok(`${tag} junk set -> nothing sent (no request, no email)`, posted === 0 && mails() === n0, `requests ${posted}, mails ${n0} -> ${mails()}`);

    // Live: fixing a field clears its error as it is typed (no submit).
    const last = names.at(-1);
    await p.fill(`${S} [name="${last}"]`, F.fields[last][1]);
    await p.waitForTimeout(250);
    const live = (await stateOf(p, S, [last]))[last];
    ok(`${tag} fixing "${last}" clears its error live`, !live.invalid && !live.msg.includes(F.fields[last][2]), JSON.stringify(live));

    // Realistic values: sent, success shown, one email in the local inbox.
    for (const [n, [, real]] of Object.entries(F.fields)) await p.fill(`${S} [name="${n}"]`, real);
    const n1 = mails();
    const resP = p.waitForResponse((r) => r.url().includes("/api/contact.php"), { timeout: 12000 }).catch(() => null);
    await submit();
    const res = await resP;
    let shown = true;
    await F.success(p).catch(() => (shown = false));
    for (let i = 0; i < 20 && mails() === n1; i++) await p.waitForTimeout(150);
    ok(`${tag} realistic values -> sent (200), success shown, the email arrived`, res?.status() === 200 && shown && mails() === n1 + 1, `${res?.status()} shown=${shown} mails ${n1} -> ${mails()}`);
    ok(`${tag} no page errors`, !errs.length, errs.join(" | "));
    if (RATE_DIR) fs.rmSync(RATE_DIR, { recursive: true, force: true }); // the API's 5-per-hour limit is per IP
    await ctx.close();
  }
}

// The Expected requirement field: its new placeholder, and a bare number ("27862") is refused.
{
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(BASE + "/become-a-partner#apply", { waitUntil: "networkidle" });
  await p.waitForTimeout(1200);
  const ph = await p.getAttribute('#apply [name="requirement"]', "placeholder");
  ok("partner: Expected requirement placeholder is \"e.g. 500 kWh, 2 MW or 3 systems\"", ph === "e.g. 500 kWh, 2 MW or 3 systems", ph);
  await p.fill('#apply [name="requirement"]', "27862");
  await p.locator('#apply [name="requirement"]').press("Tab");
  await p.waitForTimeout(250);
  const st = (await stateOf(p, "#apply form", ["requirement"])).requirement;
  ok("partner: \"27862\" as the expected requirement is refused with the unit hint", st.invalid && st.msg === MSG.requirement, JSON.stringify(st));
  await ctx.close();
}

await b.close();
const passed = results.filter(Boolean).length;
console.log(`\n${passed}/${results.length} passed`);
process.exit(passed === results.length ? 0 : 1);
