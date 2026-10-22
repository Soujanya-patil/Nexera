import { useRef } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { useScrollReveal } from "../lib/scrollReveal";

const offices = [
  { city: "Bangalore", role: "Headquarters", detail: "Strategy, brand partnerships, sales support", status: "active" },
  { city: "Kalaburagi (Gulbarga)", role: "Regional office", detail: "Service Support, Technician Training Center", status: "active" },
  { city: "Nagpur", role: "Planned expansion", detail: "", status: "planned" },
  { city: "Delhi", role: "Planned expansion", detail: "", status: "planned" },
];

export default function WhereWeOperate() {
  // The site's scroll reveal: the offices and the call to action fade up in turn (lib/scrollReveal).
  const root = useRef(null);
  const reveal = useScrollReveal(root);
  return (
    <div ref={root} data-sr-state={reveal}>
      <PageHeader
        eyebrow="Where We Operate"
        title="A growing footprint across India"
        subtitle="NEXERA, an authorized distributor of TCL, Hithium, CLOU and Midea battery energy storage systems, is headquartered in Bangalore, with a regional office and technician training center in Kalaburagi, Karnataka."
      />

      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-6 py-16 md:py-20">
          <div className="space-y-6">
            {offices.map((o) => (
              <div
                key={o.city}
                data-sr
                className="flex items-start justify-between border-b border-line pb-6 last:border-0"
              >
                <div>
                  <h2 className="text-h4 font-semibold text-ink">{o.city}</h2>
                  <p className="text-small text-copy mt-1">{o.role}</p>
                  {o.detail && <p className="text-small text-copy">{o.detail}</p>}
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-micro font-medium ${
                    o.status === "active"
                      ? "bg-accent/10 text-ink"
                      : "bg-line/60 text-copy"
                  }`}
                >
                  {o.status === "active" ? "Active" : "Planned"}
                </span>
              </div>
            ))}
          </div>

          <div data-sr className="mt-12 rounded-lg bg-ice border border-line p-8 text-center">
            <p className="text-h4 font-semibold text-ink">Not in our network yet?</p>
            <p className="mt-1 text-small text-copy">
              Apply to bring Nexera to your state.
            </p>
            <Link
              to="/become-a-partner"
              className="mt-4 btn-motion inline-flex min-h-11 items-center rounded-full bg-accent px-5 py-2.5 text-button font-semibold text-on-accent hover:bg-accent-hover focus-visible:bg-accent-hover"
            >
              Become a Partner
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
