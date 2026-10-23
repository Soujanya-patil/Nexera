// /resources "Request Datasheet" → homepage form → a real enquiry (php -S + SMTP sink) carrying the
// pre-filled request. Usage: MAILS=<mails.log> node docsend.mjs http://127.0.0.1:8800
import { chromium } from "playwright-core";
import fs from "node:fs";

const BASE = process.argv[2];
const MAILS = process.env.MAILS;
const b = await chromium.launch((process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: "chrome" }));
const results = [];
const check = (name, cond, extra = "") => {
  results.push(!!cond);
  console.log(`${cond ? "PASS" : "FAIL"} ${name}${extra !== "" ? ` — ${typeof extra === "string" ? extra : JSON.stringify(extra)}` : ""}`);
};
const mails = () => (fs.existsSync(MAILS) ? fs.readFileSync(MAILS, "utf8").split("----- MESSAGE -----").filter((m) => m.trim()) : []);
const subjectOf = (m) => Buffer.from(m.match(/Subject: =\?UTF-8\?B\?([^?]+)\?=/)?.[1] ?? "", "base64").toString("utf8");

for (const [W, H, i, interestLabel, ask] of [
  [1440, 900, 1, "Business / C&I", "Please send me the datasheet for Hithium ∞BLOCK C&I All-in-One ESS."],
  [390, 844, 2, "Utility-scale", "Please send me the brochure for Hithium ∞Power 6.25 MWh."],
]) {
  const p = await (await b.newContext({ viewport: { width: W, height: H }, hasTouch: W < 500 })).newPage();
  const errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  await p.goto(BASE + "/resources", { waitUntil: "networkidle" });
  await p.waitForTimeout(1000);
  const link = p.locator("#datasheets .sheet-card a").nth(i);
  await link.evaluate((el) => el.scrollIntoView({ block: "center" }));
  await p.waitForTimeout(500);
  await link.click();
  await p.waitForURL((u) => u.pathname === "/", { timeout: 8000 });
  await p.waitForTimeout(2500);
  const form = p.locator("#contact form");
  await form.locator('input[name="name"]').fill("Ravi Kumar");
  await form.locator('input[name="mobile"]').fill("9845012345");
  await form.locator('input[name="email"]').fill("ravi@example.com");
  await p.waitForTimeout(3200);
  const before = mails().length;
  await form.locator('button[type="submit"]').click();
  await p.getByText(/Thank you, Ravi/).first().waitFor({ timeout: 10000 });
  await p.waitForTimeout(500);
  const m = mails().slice(before);
  const body = m[0] ?? "";
  check(`@${W} card → form → sent: one email, interest "${interestLabel}", the message is the pre-filled request`, m.length === 1 && subjectOf(body) === `New website enquiry: ${interestLabel} – Ravi Kumar` && body.includes(`Interest:    ${interestLabel}`) && body.includes(ask), { count: m.length, sub: subjectOf(body), hasAsk: body.includes(ask) });
  check(`@${W} no page errors`, errors.length === 0, errors);
  await p.context().close();
}
await b.close();
console.log(`${results.filter(Boolean).length}/${results.length} passed`);
process.exit(results.every(Boolean) ? 0 : 1);
