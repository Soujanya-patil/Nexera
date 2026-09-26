import { useRef, useState } from "react";
import AnimatedText from "./ui/AnimatedText";
import { useEntrance } from "../lib/entrance";
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

// Each logo rests slightly muted; on hover it comes to full presence (colour + opacity) with a short
// lift, a green indicator draws beneath it, and the hairline divider beside it brightens.
const Logo = ({ l, hidden }) => (
  <li aria-hidden={hidden || undefined} className="group/logo relative flex shrink-0 items-center px-6 sm:px-8">
    <span aria-hidden="true" className="absolute right-0 top-1/2 h-6 w-px -translate-y-1/2 bg-line transition-colors duration-300 group-hover/logo:bg-signal/60" />
    <img
      src={l.src}
      alt={hidden ? "" : l.name}
      className={`${l.className} w-auto max-w-none object-contain opacity-60 grayscale-[70%] transition-[opacity,filter,translate] duration-500 ease-out group-hover/logo:-translate-y-0.5 group-hover/logo:opacity-100 group-hover/logo:grayscale-0`}
    />
    <span aria-hidden="true" className="absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2 rounded-full bg-signal transition-[width] duration-500 ease-out group-hover/logo:w-10" />
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
  // Entrance: the copy slides in from the left while the logo strip wipes in from the right.
  const root = useRef(null);
  const enter = useEntrance(root, ({ tl, q }) => {
    tl.fromTo(q('[data-e="copy"]'), { opacity: 0, x: -28 }, { opacity: 1, x: 0, duration: 0.8, clearProps: "all" }, 0).fromTo(
      q('[data-e="logos"]'),
      { opacity: 0, clipPath: "inset(0% 0% 0% 100%)" },
      { opacity: 1, clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: "power2.inOut", clearProps: "all" },
      0.15
    );
  });
  return (
    <section ref={root} data-enter={enter} className="border-y border-line bg-paper py-16 md:py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 lg:grid-cols-2 lg:gap-16">
        <div data-e="copy">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sage">Our Technology Partners</p>
          <AnimatedText className="mt-3 text-2xl font-semibold tracking-tight text-ink md:text-3xl">Global Technology. Local Impact.</AnimatedText>
          <p className="mt-3 max-w-lg text-graphite">
            Nexera represents world-leading BESS manufacturers — TCL, Hithium and CLOU — with products across
            residential, C&amp;I and utility-scale segments.
          </p>
        </div>
        <div data-e="logos" className="min-w-0">
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
        </div>
      </div>
    </section>
  );
}
