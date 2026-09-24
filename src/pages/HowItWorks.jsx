import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";

const journey = [
  { step: "01", title: "Application & Fit Assessment", copy: "Region, business, and segment reviewed before anything else." },
  { step: "02", title: "Brand & Segment Onboarding", copy: "Trained only on the product lines matching your market." },
  { step: "03", title: "Territory Mapping & Agreement", copy: "Your region formally protected." },
  { step: "04", title: "Design & Commissioning Support", copy: "Our engineers work your first sizing and commissioning with you." },
  { step: "05", title: "Ongoing Service & Growth", copy: "After-sales, warranty handling, and portal access." },
];

export default function HowItWorks() {
  return (
    <div>
      <PageHeader
        eyebrow="How It Works"
        title="From First Call to Fully Operational Distributor"
      />

      <section className="bg-paper">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-sans text-2xl font-semibold text-ink">
            The Five-Stage Distributor Journey
          </h2>
          <div className="mt-10 space-y-8">
            {journey.map((j) => (
              <div key={j.step} className="flex gap-6 items-baseline border-b border-line pb-8 last:border-0">
                <span className="font-sans text-3xl text-steel/80 w-12 shrink-0">{j.step}</span>
                <div>
                  <h3 className="font-medium text-ink">{j.title}</h3>
                  <p className="mt-1 text-sm text-graphite leading-relaxed">{j.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ice border-t border-line">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-sans text-2xl font-semibold text-ink">
            Inside the Partner Portal
          </h2>
          <p className="mt-3 text-graphite max-w-2xl leading-relaxed">
            In development — a preview of what every distributor will get: territory
            map, pipeline, training status, warranty tickets, and price sheets.
          </p>
          <div className="mt-8 aspect-video max-w-2xl rounded-lg border border-line bg-white flex items-center justify-center">
            <p className="text-sm text-graphite">Partner Portal preview — coming soon</p>
          </div>
        </div>
      </section>

      <section className="bg-paper">
        <div className="mx-auto max-w-6xl px-6 py-14 text-center">
          <Link
            to="/become-a-partner"
            className="inline-flex items-center rounded-full bg-signal px-6 py-3 text-sm font-semibold text-forest hover:bg-signal/90 transition-colors"
          >
            Start Your Application
          </Link>
        </div>
      </section>
    </div>
  );
}
