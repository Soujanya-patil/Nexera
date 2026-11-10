import { useRef } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { useScrollReveal } from "../lib/scrollReveal";

const offices = [
  // The head office links to its local page (/locations/bengaluru).
  { city: "Bengaluru", role: "Head office", detail: "Strategy, brand partnerships, sales support", status: "active", link: { to: "/locations/bengaluru", label: "Battery storage in Bengaluru & Karnataka" } },
  { city: "Bengaluru", role: "Branch office", detail: "", status: "active" },
  { city: "Kalaburagi (Gulbarga)", role: "Technician training centre", detail: "", status: "opening" },
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
        subtitle="NEXERA, an authorised distributor of TCL and Hithium battery energy storage systems, has its head office in Bengaluru, Karnataka, with a technician training centre opening in Kalaburagi in 2027."
      />

      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-6 py-section">
          <div className="space-y-6">
            {offices.map((o) => (
              <div
                key={`${o.city} ${o.role}`}
                data-sr
                className="flex items-start justify-between border-b border-line pb-6 last:border-0"
              >
                <div>
                  <h2 className="text-h4 font-semibold text-ink">{o.city}</h2>
                  <p className="text-small text-copy mt-1">{o.role}</p>
                  {o.detail && <p className="text-small text-copy">{o.detail}</p>}
                  {o.link && (
                    <Link to={o.link.to} className="link-inline mt-2 inline-flex min-h-11 items-center gap-1.5 text-small font-semibold text-accent">
                      {o.link.label}
                      <span aria-hidden="true">→</span>
                    </Link>
                  )}
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-micro font-medium ${
                    o.status === "active"
                      ? "bg-accent/10 text-ink"
                      : "bg-line/60 text-copy"
                  }`}
                >
                  {o.status === "active" ? "Active" : "Opening 2027"}
                </span>
              </div>
            ))}
          </div>

          <div data-sr className="mt-12 rounded-card bg-ice border border-line p-8 text-center">
            <p className="text-h4 font-semibold text-ink">Not in our network yet?</p>
            <p className="mt-1 text-small text-copy">
              Apply to bring Nexera to your state.
            </p>
            <Link
              to="/become-a-partner"
              className="mt-4 btn-motion inline-flex min-h-11 items-center rounded-full bg-accent px-6 py-3 text-button font-semibold text-on-accent hover:bg-accent-hover focus-visible:bg-accent-hover"
            >
              Become a Partner
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
