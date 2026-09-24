import PageHeader from "../components/PageHeader";
import Reveal from "../components/Reveal";
import tclLineup from "../assets/products/tcl-product-lineup.jpg";
// TODO(india-imagery): src/assets/products/hithium-containers-deployed.jpg (Hithium_photos.zip, 966x563) is a
// non-Indian site; replace with an Indian Hithium installation. tcl-product-lineup.jpg is a neutral studio shot.
import hithiumDeployed from "../assets/products/hithium-containers-deployed.jpg";
import tclLogo from "../assets/partners/tcl-logo.png";
import hithiumLogo from "../assets/partners/hithium-logo.png";
import clouLogo from "../assets/partners/clou-logo.png";

function PartnerLogo({ src, name, className }) {
  return <img src={src} alt={`${name} logo`} className={`mb-5 w-auto ${className}`} />;
}

function Spec({ label, children }) {
  return (
    <div className="border-t border-line pt-4">
      <p className="text-graphite text-sm">{label}</p>
      <p className="mt-1 text-ink font-medium text-sm">{children}</p>
    </div>
  );
}

export default function OurBrands() {
  return (
    <div>
      <PageHeader
        eyebrow="Our Brands"
        title="Global technology, backed by local support"
        subtitle="Nexera is an authorized distribution partner for TCL, Hithium and CLOU in India — giving EPCs direct access to globally trusted battery storage technology."
      />

      {/* TCL — authorized, full treatment */}
      <section className="bg-paper border-b border-line">
        <div className="mx-auto max-w-6xl px-6 py-16 grid md:grid-cols-5 gap-10 md:gap-14 items-center">
          <div className="md:col-span-2">
            <PartnerLogo src={tclLogo} name="TCL" className="h-8" />
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-sans text-2xl font-semibold text-ink">TCL BlueArk</h2>
              <span className="rounded-full bg-signal/10 text-ink text-xs font-medium px-3 py-1">
                Authorized Partner
              </span>
            </div>
            <div className="mt-8 space-y-5">
              <Spec label="Products">W10 (125kW/261kWh), X5</Spec>
              <Spec label="Best for">Residential, light C&amp;I</Spec>
              <Spec label="Why TCL">Global brand backing, compact footprint</Spec>
            </div>
          </div>
          <Reveal className="md:col-span-3">
            <figure className="overflow-hidden rounded-lg bg-ink ring-1 ring-ink/10">
              <img
                src={tclLineup}
                width="700"
                height="550"
                loading="lazy"
                decoding="async"
                alt="TCL battery energy storage range: stackable residential battery modules, floor-standing C&I cabinets, and wall-mounted units and inverters"
                className="block aspect-[7/4] h-auto w-full object-cover object-[50%_88%]"
              />
            </figure>
          </Reveal>
        </div>
      </section>

      {/* Hithium — authorized, full treatment */}
      <section className="bg-ice border-b border-line">
        <div className="mx-auto max-w-6xl px-6 py-16 grid md:grid-cols-5 gap-10 md:gap-14 items-center">
          <Reveal className="md:col-span-3 order-2 md:order-1">
            <figure className="overflow-hidden rounded-lg bg-ink ring-1 ring-ink/10">
              <img
                src={hithiumDeployed}
                width="700"
                height="407"
                loading="lazy"
                decoding="async"
                alt="Row of Hithium containerised battery storage units installed on a gravel site under an evening sky"
                className="block h-auto w-full"
              />
            </figure>
          </Reveal>
          <div className="md:col-span-2 order-1 md:order-2">
            <PartnerLogo src={hithiumLogo} name="Hithium" className="h-9" />
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-sans text-2xl font-semibold text-ink">Hithium</h2>
              <span className="rounded-full bg-signal/10 text-ink text-xs font-medium px-3 py-1">
                Authorized Partner
              </span>
            </div>
            <div className="mt-8 space-y-5">
              <Spec label="Products">
                261kWh liquid-cooled C&amp;I cabinet, 1022kWh DC block, 6.25MWh (4h) utility block
              </Spec>
              <Spec label="Best for">C&amp;I and utility-scale</Spec>
              <Spec label="Why Hithium">
                Liquid cooling, high cyclic lifetime, IEC 62619/62477 certified, ISO 9001/14001/45001
              </Spec>
            </div>
          </div>
        </div>
      </section>

      {/* CLOU — authorized, full treatment (partnership agreement signed). No CLOU photography is in
          the project yet, so a logo panel stands in for the product image rather than a borrowed photo;
          specs are limited to what the project states (utility-scale applications). */}
      <section className="bg-paper">
        <div className="mx-auto max-w-6xl px-6 py-16 grid md:grid-cols-5 gap-10 md:gap-14 items-center">
          <div className="md:col-span-2">
            <PartnerLogo src={clouLogo} name="CLOU" className="h-10" />
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-sans text-2xl font-semibold text-ink">CLOU</h2>
              <span className="rounded-full bg-signal/10 text-ink text-xs font-medium px-3 py-1">
                Authorized Partner
              </span>
            </div>
            <div className="mt-8 space-y-5">
              <Spec label="Best for">Utility-scale applications</Spec>
            </div>
          </div>
          <Reveal className="md:col-span-3">
            <div className="grid aspect-[7/4] place-items-center rounded-lg bg-ice ring-1 ring-ink/10">
              <img src={clouLogo} alt="" className="h-11 w-auto" />
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
