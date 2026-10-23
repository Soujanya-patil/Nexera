// Server-side rules: posts straight to api/contact.php (no page, no client checks), as a bot would.
// Usage: MAILS=<mails.log> node forms-server.mjs http://127.0.0.1:8800
// Junk values -> 422 {ok:false, error:"validation", fields:{field: message}} and no email; realistic
// values for each form -> 200 and exactly one email each, with the right subject and lines.
import fs from "node:fs";

const BASE = process.argv[2] ?? "http://127.0.0.1:8800";
const MAILS = process.env.MAILS;
const mailText = () => (MAILS && fs.existsSync(MAILS) ? fs.readFileSync(MAILS, "utf8") : "");
const mails = () => mailText().split("----- MESSAGE -----").length - 1;
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
const post = async (body) => {
  const now = Date.now();
  const res = await fetch(`${BASE}/api/contact.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ startedAt: now - 5000, sentAt: now, website: "", page: "/test", ...body }),
  });
  return { status: res.status, json: await res.json().catch(() => null) };
};

const JUNK = { name: "11", company: "111", email: "111@gmail.com", mobile: "11", city: "111", requirement: "11", message: "1111" };

// 1. The brief's junk set, sent as each form would send it.
for (const [label, extra] of [
  ["/contact (full)", { interest: "ci", source: "full" }],
  ["homepage (full)", { interest: "home", source: "full" }],
  ["call-back widget (quick)", { interest: "ci", source: "quick" }],
  ["Become a Partner (partner)", { interest: "epc", source: "partner" }],
]) {
  const n0 = mails();
  const r = await post({ ...JUNK, ...extra });
  const f = r.json?.fields ?? {};
  const want = Object.keys(JUNK);
  const exact = want.every((k) => f[k] === MSG[k]);
  ok(`${label}: junk set -> 422 validation, every field named with its message, no email`, r.status === 422 && r.json?.ok === false && r.json?.error === "validation" && exact && mails() === n0, `${r.status} ${JSON.stringify(f)}`);
}
// The answer never echoes what was sent.
{
  const r = await post({ ...JUNK, name: "<script>x</script>", interest: "ci" });
  ok("the 422 answer never echoes the input", r.status === 422 && !JSON.stringify(r.json).includes("<script>"), JSON.stringify(r.json));
}
// "27862" as an expected requirement; a bare-number company; all-same / ascending mobiles.
for (const [label, body, field] of [
  ["expected requirement '27862'", { requirement: "27862" }, "requirement"],
  ["mobile 9999999999", { mobile: "9999999999" }, "mobile"],
  ["mobile +1234567890", { mobile: "+1234567890" }, "mobile"],
  ["mobile +91 12345 67890 (an Indian number held to the Indian rule)", { mobile: "+91 12345 67890" }, "mobile"],
  ["gmail with 5 characters", { email: "abcde@gmail.com" }, "email"],
  ["name with digits", { name: "Ankit2" }, "name"],
]) {
  const n0 = mails();
  const r = await post({ name: "Ankit Sharma", mobile: "9876543210", interest: "ci", source: "full", ...body });
  ok(`${label} -> 422 on ${field} only`, r.status === 422 && Object.keys(r.json?.fields ?? {}).join() === field && mails() === n0, JSON.stringify(r.json));
}
// Required by form: the partner form needs email, company and city (not mobile); the others need mobile.
{
  const r = await post({ name: "Ankit Sharma", interest: "epc", source: "partner" });
  ok("partner: email, company and city required; phone optional", r.status === 422 && ["company", "email", "city"].every((k) => r.json.fields[k] === MSG[k]) && !r.json.fields.mobile, JSON.stringify(r.json));
  const r2 = await post({ name: "Ankit Sharma", interest: "ci", source: "full" });
  ok("full / quick: mobile required", r2.status === 422 && r2.json.fields.mobile === MSG.mobile, JSON.stringify(r2.json));
  const r3 = await post({ name: "Ankit Sharma", mobile: "9876543210", interest: "oem", source: "full" });
  ok("brand / OEM path: company required", r3.status === 422 && r3.json.fields.company === MSG.company, JSON.stringify(r3.json));
}
// The existing guards still run (honeypot, minimum fill time).
{
  const n0 = mails();
  const r = await post({ name: "Ankit Sharma", mobile: "9876543210", interest: "ci", website: "http://spam" });
  const now = Date.now();
  const fast = await fetch(`${BASE}/api/contact.php`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "Ankit Sharma", mobile: "9876543210", interest: "ci", startedAt: now - 500, sentAt: now }) });
  ok("honeypot -> 400 rejected; under 3 s -> 400 too_fast; no email", r.status === 400 && r.json.error === "rejected" && fast.status === 400 && (await fast.json()).error === "too_fast" && mails() === n0);
}

// 2. Realistic values for each form: sent, one email each (the rate limit allows 5 per hour per IP).
const REAL = [
  ["/contact", { name: "Ankit Sharma", mobile: "98765 43210", email: "ankit.sharma@gmail.com", interest: "ci", source: "full", message: "We are planning a 500 kWh C&I system for our plant and would like a quote." }, "New website enquiry: Business / C&I – Ankit Sharma"],
  ["call-back widget", { name: "K. S. Rao", mobile: "+91-9876543210", interest: "home", source: "quick" }, "Call-back request: Home storage – K. S. Rao"],
  [
    "Become a Partner",
    { name: "K. S. Rao", mobile: "+44 20 7946 0958", email: "info@company.co.in", company: "3M India", city: "Bengaluru 560001", requirement: "500 kWh", interest: "epc", source: "partner", message: "We are an EPC in Karnataka planning C&I storage projects.", details: { enquiry: "EPC / Project Partnership", company_type: "EPC", application: "Commercial & Industrial" } },
    "Partner enquiry: EPC / project partnership – K. S. Rao",
  ],
];
for (const [label, body, subject] of REAL) {
  const n0 = mails();
  const r = await post(body);
  // let the mail land in the sink
  for (let i = 0; i < 20 && mails() === n0; i++) await new Promise((res) => setTimeout(res, 150));
  const last = mailText().split("----- MESSAGE -----").at(-1) ?? "";
  const subj = (last.match(/^Subject: =\?UTF-8\?B\?([^?]+)\?=/m) || [])[1];
  const decoded = subj ? Buffer.from(subj, "base64").toString("utf8") : "";
  ok(`${label}: realistic values -> 200, one email, subject "${subject}"`, r.status === 200 && r.json?.ok && mails() === n0 + 1 && decoded === subject, `${r.status} ${decoded}`);
  if (body.source === "partner") ok("partner email carries the requirement, location and company", /Requirement: 500 kWh/.test(last) && /City: +Bengaluru 560001/.test(last) && /Company: +3M India/.test(last) && /Source: Become a Partner form/.test(last));
}

const passed = results.filter(Boolean).length;
console.log(`\n${passed}/${results.length} passed`);
process.exit(passed === results.length ? 0 : 1);
