import { useRef } from "react";
import AnimatedText from "../ui/AnimatedText";
import { VALUES } from "./content";
import { useScrollReveal } from "../../lib/scrollReveal";
import { STAGGER } from "../../lib/tokens";

/**
 * WHY EPCs PARTNER WITH NEXERA — four value points, each an existing claim from the site (see
 * content.js). Revealed on scroll in a stagger; on hover a green rule draws across the top of the
 * point and its icon turns green. No figures, guarantees or service levels.
 */
export default function WhyEpcs() {
  const list = useRef(null);
  const reveal = useScrollReveal(list);
  return (
    <section aria-labelledby="why-epcs-title" className="bg-ice py-20 md:py-28">
      <div className="container-site">
        <p className="eyebrow text-sage">Why EPCs partner with NEXERA</p>
        <AnimatedText id="why-epcs-title" className="mt-3 max-w-2xl text-h2 font-semibold text-ink">
          A BESS Partner Built Around Your Project.
        </AnimatedText>

        <ul ref={list} data-sr-state={reveal} className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v, i) => {
            const Icon = v.icon;
            return (
              <li key={v.title} data-sr className="group relative pt-6">
                <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-forest/15" />
                <span aria-hidden="true" className="absolute left-0 top-0 h-px w-full origin-left scale-x-[0.15] bg-signal transition-[scale] duration-base ease-standard group-hover:scale-x-100 group-focus-visible:scale-x-100 group-focus-within:scale-x-100" />
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-paper text-forest transition-colors duration-fast group-hover:bg-signal group-focus-visible:bg-signal group-focus-within:bg-signal">
                    <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <span className="text-micro font-semibold tracking-[0.18em] text-sage/70">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="mt-5 text-h4 font-semibold text-ink">{v.title}</h3>
                <p className="mt-2 text-small text-graphite">{v.copy}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
