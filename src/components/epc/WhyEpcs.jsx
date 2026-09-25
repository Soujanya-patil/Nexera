import { useRef } from "react";
import AnimatedText from "../ui/AnimatedText";
import { VALUES } from "./content";
import { useScrollReveal } from "../../lib/scrollReveal";

/**
 * WHY EPCs PARTNER WITH NEXERA — four value points, each an existing claim from the site (see
 * content.js). Revealed on scroll in a stagger; on hover a green rule draws across the top of the
 * point and its icon turns green. No figures, guarantees or service levels.
 */
export default function WhyEpcs() {
  const list = useRef(null);
  const reveal = useScrollReveal(list, { stagger: 0.09 });
  return (
    <section aria-labelledby="why-epcs-title" className="bg-ice py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sage">Why EPCs partner with NEXERA</p>
        <AnimatedText id="why-epcs-title" className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-ink md:text-4xl">
          A BESS Partner Built Around Your Project.
        </AnimatedText>

        <ul ref={list} data-sr-state={reveal} className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v, i) => {
            const Icon = v.icon;
            return (
              <li key={v.title} data-sr className="group relative pt-6">
                <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-forest/15" />
                <span aria-hidden="true" className="absolute left-0 top-0 h-px w-10 origin-left bg-signal transition-[width] duration-500 ease-out group-hover:w-full" />
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-paper text-forest transition-colors duration-300 group-hover:bg-signal">
                    <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <span className="text-xs font-semibold tracking-[0.18em] text-sage/70">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-ink">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-graphite">{v.copy}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
