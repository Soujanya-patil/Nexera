import PillLink from "../PillLink";
import Reveal from "../Reveal";

/** Closing band for the catalogue and product pages: help choosing, or go straight to a quote. */
export default function ChooseCta({ productId }) {
  const quote = `/contact?intent=quote${productId ? `&product=${productId}` : ""}`;
  return (
    <section className="relative overflow-hidden bg-deep text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(55% 80% at 80% 120%, rgba(144,217,136,0.14), transparent 70%)" }}
      />
      <Reveal className="relative mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16 md:py-20 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-ice/80">Talk to an engineer</p>
          <h2 className="mt-4 text-2xl font-semibold leading-tight tracking-tight md:text-3xl">Need help choosing the right system?</h2>
          <p className="mt-4 max-w-xl leading-relaxed text-ice/80">
            Tell us about your site and load. NEXERA&rsquo;s team will recommend and size a system from our technology partners.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-4">
          <PillLink to="/contact" arrow>
            Talk to NEXERA
          </PillLink>
          <PillLink to={quote} variant="outline" arrow>
            Request a Quote
          </PillLink>
        </div>
      </Reveal>
    </section>
  );
}
