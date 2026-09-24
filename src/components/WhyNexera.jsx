import { useRef } from "react";
import { useMotion, useScrollScene } from "../lib/motion";
import DisplayHeading from "./DisplayHeading";
import Reveal from "./Reveal";
import StatBar from "./StatBar";
import TechGrid from "./TechGrid";

/**
 * Scene 6 — WHY NEXERA. Real capabilities only (the same ones "Become a Partner" already states
 * for EPCs, reframed here for the buyer reading this page) — no invented stats or counts.
 *
 * Structured as a numbered 01-04 capability progression rather than an icon grid: the section
 * title enters, the first step activates, and each next step takes over as it reaches the reading
 * position, with a teal bar tracking down the rail. Reads as an engineering capability timeline
 * instead of a bullet list.
 *
 * CONTENT NOTE — this is a 4-step structure over SEVEN real capabilities, so the three that don't
 * get their own number are MERGED into a neighbouring step, never dropped and never reworded:
 * product selection folds into 01 (both are about getting the right technology), training folds
 * into 03 (both are commissioning-time work), and pan-India distribution folds into 04 (both are
 * after-the-sale support). Every clause below is the existing approved wording, verbatim.
 *
 * Carries the animated <StatBar /> (the real Hero stat-band figures) directly under the heading:
 * two of the three — 24x7 Availability, Quick Response times — are service claims, which is this
 * section's own subject, so they land here rather than in the identity/narrative section.
 *
 * MOTION — normal flow, no pinning (this page already carries two pinned scenes; a third would
 * only add scroll length for a list that reads fine in place). Cinematic mode dims the inactive
 * steps and scrubs the active bar; "light"/"static" render every step at full legibility with no
 * bars, which is why the JSX default state is the READABLE one and GSAP applies the dimming.
 */
const steps = [
  {
    n: "01",
    title: "Technology access",
    copy: "Direct, authorized access to TCL, Hithium, and CLOU battery storage technology — the right system sized to your load, residential through utility scale.",
  },
  {
    n: "02",
    title: "Design support",
    copy: "Our engineers work your system design and sizing with you.",
  },
  {
    n: "03",
    title: "Commissioning and training",
    copy: "Hands-on commissioning support for every installation, plus technician training on install, operation, and maintenance.",
  },
  {
    n: "04",
    title: "After-sales and pan-India support",
    copy: "We manage the OEM relationship, so warranty issues don't become your problem. Regional support from Bangalore, with offices expanding across India.",
  },
];

const INACTIVE = 0.42;

export default function WhyNexera() {
  const { mode } = useMotion();
  const cine = mode === "cinematic";
  const root = useRef(null);

  useScrollScene(
    root,
    ({ gsap, ScrollTrigger, q }) => {
      const items = q('[data-a="step"]');
      const bars = q('[data-a="step-bar"]');

      // Dim everything up front. The JSX ships the readable state (so light/static mode and a
      // failed GSAP load both render legibly); the muting only exists once GSAP is actually here
      // to undo it again as each step activates.
      gsap.set(items, { opacity: INACTIVE });

      // ONE trigger with a single reading line, not a range per step. Per-step ranges (an
      // "activate at 72%, release at 45%" band) overlap for short items — measured three steps lit
      // at once — and leave every step dim once the list has passed the band entirely. Instead:
      // the active step is the LAST one whose top has crossed the reading line, clamped to the
      // ends. Because the <li> boxes tile contiguously (their bottom padding is inside the box),
      // that yields exactly one active step at any scroll position, advancing on the way down and
      // retreating identically on the way up, with the first/last step held before/after the list.
      let current = -1;
      const apply = (idx) => {
        if (idx === current) return;
        current = idx;
        items.forEach((el, i) => {
          gsap.to(el, { opacity: i === idx ? 1 : INACTIVE, duration: 0.45, ease: "power2.out", overwrite: true });
          gsap.to(bars[i], { scaleY: i === idx ? 1 : 0, duration: 0.45, ease: "power2.out", overwrite: true });
        });
      };
      const pick = () => {
        const line = window.innerHeight * 0.6;
        let idx = 0;
        items.forEach((el, i) => {
          if (el.getBoundingClientRect().top <= line) idx = i;
        });
        apply(idx);
      };

      const st = ScrollTrigger.create({
        trigger: root.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: pick,
        onRefresh: pick,
      });
      // Run once now, so loading the page already scrolled into this section starts on the right
      // step instead of waiting for the first scroll event.
      pick();

      return () => st.kill();
    },
    cine
  );

  return (
    <section className="relative overflow-hidden bg-night text-bone">
      <TechGrid size={56} tone={0.045} drift={3} />
      <div className="relative z-10 mx-auto max-w-6xl px-6 pt-24 pb-16 md:pt-28 md:pb-20">
        <DisplayHeading eyebrow="Why Nexera" className="max-w-3xl">
          The capability behind the system
        </DisplayHeading>

        <Reveal delay={0.05} className="mt-12">
          <StatBar />
        </Reveal>

        <ol ref={root} className="mt-16 border-l border-bone/15">
          {steps.map((s) => (
            <li key={s.n} data-a="step" className="relative pb-12 pl-8 last:pb-0 md:pl-12">
              {/* Active-step marker: rides the rail this <ol> already draws with its left border. */}
              <span
                data-a="step-bar"
                aria-hidden="true"
                className="absolute -left-px top-0 h-full w-[2px] origin-top scale-y-0 bg-signal"
              />
              <div className="flex items-baseline gap-4">
                <span className="font-serif text-sm font-semibold tabular-nums text-signal">{s.n}</span>
                <h3 className="text-lg font-medium text-bone md:text-xl">{s.title}</h3>
              </div>
              <p className="mt-3 max-w-2xl leading-relaxed text-bone/75">{s.copy}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
