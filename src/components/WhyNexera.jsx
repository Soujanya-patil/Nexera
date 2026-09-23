import { Cpu, LayoutGrid, PenTool, Wrench, ShieldCheck, GraduationCap, MapPin } from "lucide-react";
import Reveal from "./Reveal";
import StatBar from "./StatBar";

/**
 * Scene 6 — WHY NEXERA. Real capabilities only (the same ones "Become a Partner" already states
 * for EPCs, reframed here for the buyer reading this page) — no invented stats or counts.
 * Normal flow, IntersectionObserver reveals only: this section's job is credibility, not spectacle.
 *
 * Asymmetric on purpose, matching the featured-block + smaller-supporting-items logic Storage.jsx
 * already uses (its Hithium beat: one large container image, one small block image) — two
 * capabilities earn a featured treatment, the rest sit quieter beneath. Not a uniform icon-grid.
 *
 * Carries the animated <StatBar /> (the real Hero stat-band figures) directly under the heading:
 * two of the three — 24x7 Availability, Quick Response times — are service claims, which is this
 * section's own subject, so they land here rather than in the identity/narrative section.
 */
const featured = [
  { icon: Cpu, title: "Technology access", copy: "Direct, authorized access to TCL, Hithium, and CLOU battery storage technology." },
  { icon: ShieldCheck, title: "After-sales support", copy: "We manage the OEM relationship, so warranty issues don't become your problem." },
];

const supporting = [
  { icon: LayoutGrid, title: "Product selection", copy: "The right system sized to your load — residential through utility scale." },
  { icon: PenTool, title: "Design support", copy: "Our engineers work your system design and sizing with you." },
  { icon: Wrench, title: "Commissioning", copy: "Hands-on commissioning support for every installation." },
  { icon: GraduationCap, title: "Training", copy: "Technician training on install, operation, and maintenance." },
  { icon: MapPin, title: "Pan-India distribution", copy: "Regional support from Bangalore, with offices expanding across India." },
];

export default function WhyNexera() {
  return (
    <section className="relative bg-night text-bone">
      <div className="mx-auto max-w-6xl px-6 pt-24 pb-16 md:pt-28 md:pb-20">
        <Reveal>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-bone/60">Why Nexera</p>
          <h2 className="mt-3 max-w-2xl font-serif text-3xl font-semibold text-bone md:text-4xl">
            The capability behind the system
          </h2>
        </Reveal>

        <Reveal delay={0.05} className="mt-12">
          <StatBar />
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {featured.map((c, i) => (
            <Reveal
              key={c.title}
              delay={i * 0.05}
              className="rounded-lg border-l-2 border-signal bg-charcoal px-6 py-7 md:px-8 md:py-8"
            >
              <c.icon className="h-8 w-8 text-signal" aria-hidden="true" />
              <h3 className="mt-4 text-lg font-medium text-bone">{c.title}</h3>
              <p className="mt-2 leading-relaxed text-bone/75">{c.copy}</p>
            </Reveal>
          ))}
        </div>

        <div className="mt-10 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-5">
          {supporting.map((c, i) => (
            <Reveal key={c.title} delay={0.1 + Math.min(i * 0.04, 0.16)} className="border-t border-bone/15 pt-4">
              <c.icon className="h-4 w-4 text-signal/80" aria-hidden="true" />
              <h3 className="mt-2.5 text-sm font-medium text-bone">{c.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-bone/60">{c.copy}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
