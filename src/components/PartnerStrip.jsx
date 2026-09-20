import Reveal from "./Reveal";

export default function PartnerStrip() {
  return (
    <section id="brands" className="bg-ice border-y border-line">
      <Reveal
        as="div"
        className="mx-auto max-w-6xl px-6 py-14 flex flex-col md:flex-row md:items-center gap-8"
      >
        <p className="text-sm text-graphite md:w-48 shrink-0">
          In partnership with
        </p>
        <div className="flex flex-wrap items-center gap-x-12 gap-y-4">
          {/* TCL and Hithium are confirmed, logo-eligible partners */}
          <span className="font-serif text-xl font-semibold text-ink">
            TCL BlueArk
          </span>
          <span className="font-serif text-xl font-semibold text-ink">
            Hithium
          </span>
          {/* CLOU: text mention only — no logo, no "partner" badge, until the
              agreement is confirmed. Do not upgrade this without sign-off. */}
          <span className="text-sm text-graphite">
            + select global technologies including CLOU for utility-scale
          </span>
        </div>
      </Reveal>
    </section>
  );
}
