import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import AnimatedText from "../ui/AnimatedText";
import { CAPABILITIES } from "./content";
import { useScrollReveal } from "../../lib/scrollReveal";

/**
 * ONE PARTNER. THROUGH THE PROJECT. — NEXERA's support capabilities as six engineering/service
 * cards (icon, title, one line), each linking to where that capability is described.
 *
 * Hover / keyboard focus: the card rises 4 px, a faint engineering grid and a soft light slide in
 * behind the content, the icon tile turns green and its glyph nudges up, a green accent grows along
 * the top edge and the arrow moves. Cards reveal on scroll in a short stagger (ScrollTrigger batch).
 */
export default function SupportCapabilities() {
  const grid = useRef(null);
  const reveal = useScrollReveal(grid, { stagger: 0.08 });
  return (
    <section aria-labelledby="capabilities-title" className="bg-paper py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sage">NEXERA support</p>
            <AnimatedText id="capabilities-title" className="mt-3 text-3xl font-semibold tracking-tight text-ink md:text-4xl">
              One Partner. Through the Project.
            </AnimatedText>
          </div>
          <p className="max-w-md text-graphite">
            Technology access, engineering support and service — across the project lifecycle, not just at the sale.
          </p>
        </div>

        <ul ref={grid} data-sr-state={reveal} className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.map((c, i) => {
            const Icon = c.icon;
            return (
              <li key={c.title} data-sr>
                <Link
                  to={c.to}
                  className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-ice/60 p-7 transition-[translate,border-color,box-shadow,background-color] duration-300 ease-out hover:-translate-y-1 hover:border-forest/25 hover:bg-paper hover:shadow-[0_22px_44px_-28px_rgba(7,26,23,0.4)] focus-visible:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
                >
                  {/* Background: faint grid + soft light, sliding in on hover */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 translate-x-6 opacity-0 transition-[opacity,translate] duration-700 ease-out group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
                    style={{
                      backgroundImage:
                        "radial-gradient(60% 70% at 100% 0%, rgba(144,217,136,0.16), transparent 70%), linear-gradient(rgba(9,47,39,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(9,47,39,0.05) 1px, transparent 1px)",
                      backgroundSize: "100% 100%, 28px 28px, 28px 28px",
                      maskImage: "linear-gradient(to left, #000, transparent 85%)",
                      WebkitMaskImage: "linear-gradient(to left, #000, transparent 85%)",
                    }}
                  />
                  <span aria-hidden="true" className="absolute left-7 top-0 h-0.5 w-0 rounded-full bg-signal transition-[width] duration-500 ease-out group-hover:w-12 group-focus-visible:w-12" />

                  <div className="relative flex items-start justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-line bg-paper text-forest transition-[background-color,border-color] duration-300 group-hover:border-signal group-hover:bg-signal">
                      <Icon aria-hidden="true" className="h-5 w-5 transition-transform duration-500 ease-out group-hover:-translate-y-0.5 group-hover:rotate-[-6deg]" strokeWidth={1.75} />
                    </span>
                    <span className="text-xs font-semibold tracking-[0.18em] text-sage/70">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <h3 className="relative mt-8 text-lg font-semibold text-ink">{c.title}</h3>
                  <p className="relative mt-2 flex-1 text-sm leading-relaxed text-graphite">{c.copy}</p>
                  <span className="relative mt-6 inline-flex items-center gap-2 text-sm font-semibold text-forest">
                    {c.cta}
                    <ArrowRight aria-hidden="true" className="h-4 w-4 -translate-x-1 opacity-60 transition-[translate,opacity] duration-300 group-hover:translate-x-1 group-hover:opacity-100" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
