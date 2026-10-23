// Unit tests for the enquiry rules (src/lib/enquiry.js). Usage: node --test rules.test.mjs <project root>
// (or set NEXERA_ROOT). Junk values from the brief must all be rejected with the brief's message;
// realistic values must all pass.
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.env.NEXERA_ROOT || process.cwd();
const { fieldError, validateEnquiry, validMobile, tidy, MESSAGES } = await import(pathToFileURL(path.join(root, "src/lib/enquiry.js")).href);

// Every field filled-in case is checked as if the field were required (so empty values fail too).
const REQ = { required: { email: true, company: true, city: true, requirement: true, message: true } };
const rejects = (field, values) => {
  for (const v of values) assert.equal(fieldError(field, v, REQ), MESSAGES[field], `${field}: ${JSON.stringify(v)} should be rejected`);
};
const accepts = (field, values) => {
  for (const v of values) assert.equal(fieldError(field, v, REQ), "", `${field}: ${JSON.stringify(v)} should pass`);
};

test("the brief's junk submission: every field rejected", () => {
  const junk = { name: "11", company: "111", email: "111@gmail.com", mobile: "11", city: "111", requirement: "11", message: "1111" };
  for (const [f, v] of Object.entries(junk)) assert.equal(fieldError(f, v, REQ), MESSAGES[f], f);
});

test("name: 2–60, letters . ' - and spaces, 2+ letters, no digits", () => {
  accepts("name", ["Ankit Sharma", "K. S. Rao", "Mary-Jane O'Neil", "D’Souza", "  Ankit   Sharma  ", "अंकित शर्मा", "Jo"]);
  rejects("name", ["11", "", "   ", "A", "Ankit2", "R2-D2", "..", "Ankit@Sharma", "a".repeat(61), "-'.", "Ankit_Sharma"]);
});

test("company: 2–100, 2+ letters, digits allowed, not only digits or symbols", () => {
  accepts("company", ["Suntrop Solar Pvt. Ltd.", "3M India", "24x7 Solar", "L&T"]);
  rejects("company", ["111", "", "1", "123 456", "@@@", "#1", "x".repeat(101)]);
});

test("email: format, domain + TLD of 2+ letters, no spaces; Gmail 6–30 before @", () => {
  accepts("email", ["ankit.sharma@gmail.com", "info@company.co.in", "a.b-c+tag@sub.example.org", "abcdef@googlemail.com", "ankit.sharma+leads@gmail.com"]);
  rejects("email", ["111@gmail.com", "", "abcde@gmail.com", "a".repeat(31) + "@gmail.com", "ankit sharma@x.com", "ankit@x", "ankit@x.c", "ankit@x.c0m", "@x.com", "ankit@.com", "ankit..s@x.com", "ankit@x..com", "ankit@-x.com"]);
});

test("mobile: Indian (6–9 + 9 digits, +91 / 91 / 0) or +<8–15 digits>; no repeated or ascending digits", () => {
  accepts("mobile", ["98765 43210", "+91-9876543210", "+44 20 7946 0958", "9845012345", "09845012345", "919845012345", "+91 98450 12345", "(98450) 12345", "+1 415 555 0132"]);
  rejects("mobile", ["11", "", "9999999999", "+91 9999999999", "1234567890", "+1234567890", "0123456789", "5845012345", "+91 5845012345", "+91 12345 67890", "98450 1234", "+1234567", "+1234567890123456", "98450-12345x", "abcdefghij"]);
  assert.equal(validMobile("+91 98765 43210"), true);
});

test("city: 2–80, 3+ letters (pincode alongside fine), not digits only", () => {
  accepts("city", ["Kalaburagi", "Bengaluru 560001", "Goa", "Navi Mumbai, Maharashtra"]);
  rejects("city", ["111", "", "560001", "Ab", "Ab 12", "x".repeat(81)]);
});

test("expected requirement: 2–100 with 2+ letters (a unit or word, not just a number)", () => {
  accepts("requirement", ["500 kWh", "2 MW", "3 systems", "around 1 MWh"]);
  rejects("requirement", ["11", "27862", "500", "5 k", "x".repeat(101)]);
});

test("message: 10–1,000 with 5+ letters", () => {
  accepts("message", ["We are planning a 500 kWh C&I system for our factory in Pune and would like a quote.", "Sizing a 15 kWh home system."]);
  rejects("message", ["1111", "", "Hello", "1234567890 12345", "x".repeat(1001)]);
});

test("optional fields: empty passes unless the form requires it", () => {
  for (const f of ["email", "company", "city", "requirement", "message"]) assert.equal(fieldError(f, ""), "", f);
  assert.equal(fieldError("mobile", "", { required: { mobile: false } }), "");
  assert.equal(fieldError("name", ""), MESSAGES.name);
  assert.equal(fieldError("mobile", ""), MESSAGES.mobile);
  assert.equal(fieldError("email", "", { required: { email: true } }), MESSAGES.email);
});

test("tidy: trims and collapses repeated spaces (the message keeps its line breaks)", () => {
  assert.equal(tidy("  Ankit    Sharma  "), "Ankit Sharma");
  assert.equal(tidy("Line one  \n   line   two", { multiline: true }), "Line one\nline two");
});

test("a realistic full enquiry has no errors", () => {
  const er = validateEnquiry(
    { name: "Ankit Sharma", mobile: "98765 43210", email: "ankit.sharma@gmail.com", company: "Suntrop Solar Pvt. Ltd.", city: "Bengaluru 560001", interest: "ci", message: "We are planning a 500 kWh C&I system and would like a quote." },
    { required: { email: true } }
  );
  assert.deepEqual(er, {});
});
