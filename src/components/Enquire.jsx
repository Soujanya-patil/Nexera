import { useState } from "react";
import { Send } from "lucide-react";
import Reveal from "./Reveal";
import { useMagnetic } from "../lib/magnetic";

/**
 * Scene 7 — ENQUIRE. The page's single close: one focused buyer form, not the multi-path
 * distributor/OEM selector on /contact — that page serves a different audience with different
 * fields. A light card on the dark scene keeps the inputs legible without inventing a new
 * dark-mode input style.
 */
export default function Enquire() {
  const [submitted, setSubmitted] = useState(false);
  const magneticRef = useMagnetic();

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section id="enquire" className="relative bg-night text-bone">
      <div className="mx-auto max-w-3xl px-6 pt-16 pb-24 md:pt-20 md:pb-28">
        <Reveal className="text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-bone/60">Enquire</p>
          <h2 className="mt-3 font-serif text-3xl font-semibold text-bone md:text-4xl">
            Let's build your energy storage system.
          </h2>
        </Reveal>

        <Reveal delay={0.1} className="mt-12 rounded-xl bg-paper p-6 text-ink md:p-10">
          {submitted ? (
            <div className="py-6 text-center">
              <p className="font-medium text-ink">Enquiry received.</p>
              <p className="mt-1.5 text-sm text-graphite">
                Our team will review your requirement and get back to you shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Name" name="name" required />
                <Field label="Company" name="company" />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Email" name="email" type="email" required />
                <Field label="Phone" name="phone" type="tel" />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Location" name="location" />
                <div>
                  <label htmlFor="requirement" className="block text-sm font-medium text-ink mb-1.5">
                    Requirement
                  </label>
                  <select
                    id="requirement"
                    name="requirement"
                    className="w-full rounded-md border border-line bg-white px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-steel/40"
                  >
                    <option>Residential</option>
                    <option>Commercial &amp; Industrial</option>
                    <option>Utility-Scale</option>
                  </select>
                </div>
              </div>
              <Field label="Message" name="message" as="textarea" />
              <button
                ref={magneticRef}
                type="submit"
                className="inline-flex items-center gap-2 rounded-md bg-signal px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-signal/90"
              >
                Send Enquiry
                <Send className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}

function Field({ label, name, required, type = "text", as }) {
  const Tag = as || "input";
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-ink mb-1.5">
        {label}
      </label>
      <Tag
        id={name}
        name={name}
        type={as ? undefined : type}
        required={required}
        rows={as === "textarea" ? 4 : undefined}
        className="w-full rounded-md border border-line bg-white px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-steel/40"
      />
    </div>
  );
}
