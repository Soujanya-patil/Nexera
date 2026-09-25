import { useState } from "react";
import Reveal from "./Reveal";
import AnimatedText from "./ui/AnimatedText";
import { Marquee } from "./ui/marquee";
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

const Logo = ({ l, hidden }) => (
  <li aria-hidden={hidden || undefined} className="flex shrink-0 items-center px-6 sm:px-8">
    <img
      src={l.src}
      alt={hidden ? "" : l.name}
      className={`${l.className} w-auto max-w-none object-contain opacity-85 transition-[opacity,translate] duration-300 hover:-translate-y-0.5 hover:opacity-100`}
    />
  </li>
);

/**
 * Technology partners. The logos run in a slow Magic UI Marquee (installed from the Magic UI
 * registry; CSS keyframes only, no JS animation), faded at both edges and paused on hover so a
 * logo can be read. The moving copies are hidden from assistive tech, which gets one plain list of
 * partner names instead. Under prefers-reduced-motion
 * the logos sit still in a single row instead.
 */
export default function HomePartners() {
  const [still] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  return (
    <section className="border-y border-line bg-paper py-16 md:py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sage">Our Technology Partners</p>
          <AnimatedText className="mt-3 text-2xl font-semibold tracking-tight text-ink md:text-3xl">Global Technology. Local Impact.</AnimatedText>
          <p className="mt-3 max-w-lg text-graphite">
            Nexera represents world-leading BESS manufacturers — TCL, Hithium and CLOU — with products across
            residential, C&amp;I and utility-scale segments.
          </p>
        </div>
        <Reveal className="min-w-0">
          {still ? (
            <ul className="flex flex-wrap items-center justify-center" aria-label="Technology partners">
              {logos.map((l) => (
                <Logo key={l.name} l={l} />
              ))}
            </ul>
          ) : (
            <>
            <ul className="sr-only" aria-label="Technology partners">
              {logos.map((l) => (
                <li key={l.name}>{l.name}</li>
              ))}
            </ul>
            <Marquee
              pauseOnHover
              repeat={4}
              aria-hidden="true"
              className="py-4 [--duration:36s] [--gap:0rem] [mask-image:linear-gradient(to_right,transparent,#000_14%,#000_86%,transparent)]"
            >
              <ul className="flex items-center">
                {logos.map((l) => (
                  <Logo key={l.name} l={l} hidden />
                ))}
              </ul>
            </Marquee>
            </>
          )}
        </Reveal>
      </div>
    </section>
  );
}
