import Reveal from "./Reveal";
import tclLogo from "../assets/partners/tcl-logo.png";
import hithiumLogo from "../assets/partners/hithium-logo.png";
import clouLogo from "../assets/partners/clou-logo.png";

// Equal treatment for all three: the CLOU agreement is signed, so the earlier text-only rule is gone.
// Heights are set per logo so the three read at a similar optical size (the source PNGs differ).
const logos = [
  { name: "TCL", src: tclLogo, className: "h-8" },
  { name: "Hithium", src: hithiumLogo, className: "h-9" },
  { name: "CLOU", src: clouLogo, className: "h-10" },
];

export default function HomePartners() {
  return (
    <section className="border-y border-line bg-paper py-16 md:py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sage">Our Technology Partners</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink md:text-3xl">Global Technology. Local Impact.</h2>
          <p className="mt-3 max-w-lg text-graphite">
            Nexera represents world-leading BESS manufacturers — TCL, Hithium and CLOU — with products across
            residential, C&amp;I and utility-scale segments.
          </p>
        </div>
        <Reveal as="ul" className="grid grid-cols-3 items-center divide-x divide-line">
          {logos.map((l) => (
            <li key={l.name} className="flex justify-center px-3 sm:px-6">
              <img src={l.src} alt={l.name} className={`${l.className} w-auto max-w-full object-contain`} />
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
