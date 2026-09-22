import { Cpu, LayoutGrid, PenTool, Wrench, ShieldCheck, GraduationCap, MapPin } from "lucide-react";
import Reveal from "./Reveal";

/**
 * Scene 6 — WHY NEXERA. Real capabilities only (the same ones "Become a Partner" already states
 * for EPCs, reframed here for the buyer reading this page) — no invented stats or counts.
 * Normal flow, IntersectionObserver reveals only: this section's job is credibility, not spectacle.
 */
const capabilities = [
  { icon: Cpu, title: "Technology access", copy: "Direct, authorized access to TCL, Hithium, and CLOU battery storage technology." },
  { icon: LayoutGrid, title: "Product selection", copy: "The right system sized to your load — residential through utility scale." },
  { icon: PenTool, title: "Design support", copy: "Our engineers work your system design and sizing with you." },
  { icon: Wrench, title: "Commissioning", copy: "Hands-on commissioning support for every installation." },
  { icon: ShieldCheck, title: "After-sales support", copy: "We manage the OEM relationship, so warranty issues don't become your problem." },
  { icon: GraduationCap, title: "Training", copy: "Technician training on install, operation, and maintenance." },
  { icon: MapPin, title: "Pan-India distribution", copy: "Regional support from Bangalore, with offices expanding across India." },
];

export default function WhyNexera() {
  return (
    <section className="relative bg-night text-bone">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-28">
        <Reveal>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-bone/60">Why Nexera</p>
          <h2 className="mt-3 max-w-2xl font-serif text-3xl font-semibold text-bone md:text-4xl">
            The capability behind the system
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {capabilities.map((c, i) => (
            <Reveal key={c.title} delay={Math.min(i * 0.05, 0.2)} className="border-t border-bone/15 pt-5">
              <c.icon className="h-5 w-5 text-signal" aria-hidden="true" />
              <h3 className="mt-3 font-medium text-bone">{c.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-bone/70">{c.copy}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
