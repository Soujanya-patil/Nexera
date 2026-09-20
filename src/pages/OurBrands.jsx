import PageHeader from "../components/PageHeader";

export default function OurBrands() {
  return (
    <div>
      <PageHeader
        eyebrow="Our Brands"
        title="Global technology, backed by local support"
        subtitle="Nexera is an authorized distribution partner for TCL and Hithium in India — giving EPCs direct access to globally trusted battery storage technology."
      />

      {/* TCL — authorized, full treatment */}
      <section className="bg-paper border-b border-line">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="flex items-center gap-3">
            <h2 className="font-serif text-2xl font-semibold text-ink">TCL BlueArk</h2>
            <span className="rounded-full bg-signal/10 text-signal text-xs font-medium px-3 py-1">
              Authorized Partner
            </span>
          </div>
          <div className="mt-6 grid md:grid-cols-3 gap-8 text-sm">
            <div>
              <p className="text-graphite">Products</p>
              <p className="mt-1 text-ink font-medium">W10 (125kW/261kWh), X5</p>
            </div>
            <div>
              <p className="text-graphite">Best for</p>
              <p className="mt-1 text-ink font-medium">Residential, light C&I</p>
            </div>
            <div>
              <p className="text-graphite">Why TCL</p>
              <p className="mt-1 text-ink font-medium">Global brand backing, compact footprint</p>
            </div>
          </div>
        </div>
      </section>

      {/* Hithium — authorized, full treatment */}
      <section className="bg-ice border-b border-line">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="flex items-center gap-3">
            <h2 className="font-serif text-2xl font-semibold text-ink">Hithium</h2>
            <span className="rounded-full bg-signal/10 text-signal text-xs font-medium px-3 py-1">
              Authorized Partner
            </span>
          </div>
          <div className="mt-6 grid md:grid-cols-3 gap-8 text-sm">
            <div>
              <p className="text-graphite">Products</p>
              <p className="mt-1 text-ink font-medium">
                261kWh liquid-cooled C&I cabinet, 1022kWh DC block, 6.25MWh (4h) utility block
              </p>
            </div>
            <div>
              <p className="text-graphite">Best for</p>
              <p className="mt-1 text-ink font-medium">C&I and utility-scale</p>
            </div>
            <div>
              <p className="text-graphite">Why Hithium</p>
              <p className="mt-1 text-ink font-medium">
                Liquid cooling, high cyclic lifetime, IEC 62619/62477 certified, ISO 9001/14001/45001
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CLOU — text mention only, no logo, no partner badge, per confirmed CEO direction */}
      <section className="bg-paper">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <h2 className="font-serif text-xl font-semibold text-ink">Other Technologies</h2>
          <p className="mt-3 text-graphite leading-relaxed max-w-2xl">
            We also work with select global storage technologies including CLOU for
            utility-scale applications.
          </p>
        </div>
      </section>
    </div>
  );
}
