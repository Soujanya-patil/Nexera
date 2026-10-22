import { useRef } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { useScrollReveal } from "../lib/scrollReveal";

const journey = [
  { step: "01", title: "Application & Fit Assessment", copy: "Region, business, and segment reviewed before anything else." },
  { step: "02", title: "Brand & Segment Onboarding", copy: "Trained only on the product lines matching your market." },
  { step: "03", title: "Territory Mapping & Agreement", copy: "Your region formally protected." },
  { step: "04", title: "Design & Commissioning Support", copy: "Our engineers work your first sizing and commissioning with you." },
  { step: "05", title: "Ongoing Service & Growth", copy: "After-sales, warranty handling, and portal access." },
];

export default function HowItWorks() {
  // The site's scroll reveal: headings rise from their masks, steps and copy fade up (lib/scrollReveal).
  const root = useRef(null);
  const reveal = useScrollReveal(root);
  return (
    <div ref={root} data-sr-state={reveal}>
      <PageHeader
        eyebrow="How It Works"
        title="From First Call to Fully Operational Distributor"
      />

      <section className="bg-white">
        <div className="container-site py-16 md:py-20">
          <h2 data-sr="heading" className="text-h2 font-semibold text-ink">
            The Five-Stage Distributor Journey
          </h2>
          <div className="mt-10 space-y-8">
            {journey.map((j) => (
              <div key={j.step} data-sr className="flex gap-6 items-baseline border-b border-line pb-8 last:border-0">
                <span className="w-12 shrink-0 text-h3 font-semibold tabular-nums text-link/80">{j.step}</span>
                <div>
                  <h3 className="text-h4 font-semibold text-ink">{j.title}</h3>
                  <p className="mt-1 text-small text-copy">{j.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-paper border-t border-line">
        <div className="container-site py-16 md:py-20">
          <h2 data-sr="heading" className="text-h2 font-semibold text-ink">
            Inside the Partner Portal
          </h2>
          <p data-sr className="mt-heading max-w-measure text-body text-copy">
            In development — a preview of what every distributor will get: territory
            map, pipeline, training status, warranty tickets, and price sheets.
          </p>
          <div data-sr className="mt-8 aspect-video max-w-2xl rounded-lg border border-line bg-white flex items-center justify-center">
            <p className="text-small text-copy">Partner Portal preview — coming soon</p>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div data-sr className="container-site py-14 text-center">
          <Link
            to="/become-a-partner"
            className="btn-motion inline-flex min-h-11 items-center rounded-full bg-accent px-6 py-3 text-button font-semibold text-on-accent hover:bg-accent-hover focus-visible:bg-accent-hover"
          >
            Start Your Application
          </Link>
        </div>
      </section>
    </div>
  );
}
