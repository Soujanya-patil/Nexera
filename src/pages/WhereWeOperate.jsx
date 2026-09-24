import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";

const offices = [
  { city: "Bangalore", role: "Headquarters", detail: "Strategy, brand partnerships, sales support", status: "active" },
  { city: "Kalaburagi (Gulbarga)", role: "Regional office", detail: "Service Support, Technician Training Center", status: "active" },
  { city: "Nagpur", role: "Planned expansion", detail: "", status: "planned" },
  { city: "Delhi", role: "Planned expansion", detail: "", status: "planned" },
];

export default function WhereWeOperate() {
  return (
    <div>
      <PageHeader
        eyebrow="Where We Operate"
        title="A growing footprint across India"
      />

      <section className="bg-paper">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <div className="space-y-6">
            {offices.map((o) => (
              <div
                key={o.city}
                className="flex items-start justify-between border-b border-line pb-6 last:border-0"
              >
                <div>
                  <h2 className="font-sans text-lg font-semibold text-ink">{o.city}</h2>
                  <p className="text-sm text-graphite mt-1">{o.role}</p>
                  {o.detail && <p className="text-sm text-graphite">{o.detail}</p>}
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                    o.status === "active"
                      ? "bg-signal/10 text-ink"
                      : "bg-line/60 text-graphite"
                  }`}
                >
                  {o.status === "active" ? "Active" : "Planned"}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-lg bg-ice border border-line p-8 text-center">
            <p className="text-ink font-medium">Not in our network yet?</p>
            <p className="mt-1 text-sm text-graphite">
              Apply to bring Nexera to your state.
            </p>
            <Link
              to="/become-a-partner"
              className="mt-4 inline-flex items-center rounded-full bg-signal px-5 py-2.5 text-sm font-semibold text-forest hover:bg-signal/90 transition-colors"
            >
              Become a Partner
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
