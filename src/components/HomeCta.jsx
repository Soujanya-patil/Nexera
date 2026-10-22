import { Fragment, useRef } from "react";
import MagneticButton from "./ui/MagneticButton";
import { useEntrance } from "../lib/entrance";
import { DUR, EASE, STAGGER } from "../lib/tokens";

const STEPS = ["Partner", "Deploy", "Accelerate"];

/**
 * Closing band: near-black green with the mockup's faint green light streaks along the bottom.
 *
 * The culmination of the page ("energy"): Partner → Deploy → Accelerate light up in turn — each word
 * glows green as it arrives and hands the green on, so Accelerate ends lit — then the light streaks
 * draw themselves in, then the heading and copy, then the buttons arrive and "switch on" with one
 * soft green pulse. The glow behind drifts slowly (CSS, off under reduced motion). Buttons: magnetic
 * pull, arrow nudge, a pointer-following light on Get in Touch; a travelling border light and a soft
 * green glow on Become a Partner.
 *
 * `contactTo`: where Get in Touch leads (the partner pages send it to the homepage contact form).
 */
export default function HomeCta({ contactTo = "/contact" }) {
  const root = useRef(null);
  const enter = useEntrance(root, ({ tl, q }) => {
    const words = q("[data-step]");
    // 1. Partner → Deploy → Accelerate
    words.forEach((w, i) => {
      tl.fromTo(w, { opacity: 0.25 }, { opacity: 1, duration: DUR.base, ease: EASE.standard }, 0.05 + i * 0.3);
    });
    tl.fromTo(q("[data-sep]"), { scaleY: 0 }, { scaleY: 1, duration: DUR.base, stagger: 0.3, clearProps: "transform" }, 0.25)
      // 2. the light lines draw
      .fromTo(q("[data-line]"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: DUR.slow, stagger: STAGGER, ease: EASE.standard }, 0.8)
      // 3. heading + copy
      .fromTo(q('[data-e="rest"]'), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: DUR.base, stagger: STAGGER, clearProps: "all" }, 0.95)
      // 4. the buttons arrive and switch on
      .fromTo(q('[data-e="actions"]'), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: DUR.base, clearProps: "all" }, 1.25);
    tl.set(words, { clearProps: "all" });
  });

  return (
    <section ref={root} data-enter={enter} className="relative overflow-hidden bg-deep-grid text-white">
      <div
        aria-hidden="true"
        className="ambient-drift pointer-events-none absolute -inset-[8%]"
        style={{
          background:
            "radial-gradient(55% 70% at 78% 120%, color-mix(in_srgb,var(--accent)_16%,transparent), transparent 70%), radial-gradient(40% 60% at 15% 130%, color-mix(in_srgb,var(--accent)_8%,transparent), transparent 70%)",
        }}
      />
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 w-full"
        viewBox="0 0 1440 240"
        preserveAspectRatio="none"
        fill="none"
      >
        <path data-line pathLength="1" strokeDasharray="1" d="M0 210 C 360 150, 720 250, 1440 120" stroke="color-mix(in_srgb,var(--accent)_35%,transparent)" strokeWidth="1.2" />
        <path data-line pathLength="1" strokeDasharray="1" d="M0 230 C 420 170, 820 240, 1440 150" stroke="color-mix(in_srgb,var(--accent)_20%,transparent)" strokeWidth="1" />
        <path data-line pathLength="1" strokeDasharray="1" d="M0 240 C 500 200, 900 230, 1440 185" stroke="color-mix(in_srgb,var(--accent)_12%,transparent)" strokeWidth="1" />
      </svg>

      <div className="relative flex container-site flex-col gap-8 py-16 md:py-20 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <p className="flex items-center gap-3 eyebrow text-paper/80">
            {STEPS.map((w, i) => (
              <Fragment key={w}>
                {i > 0 && <span data-sep aria-hidden="true" className="inline-block h-3 w-px origin-center bg-paper/40" />}
                <span data-step className={i === STEPS.length - 1 ? "text-accent" : undefined}>
                  {w}
                </span>
              </Fragment>
            ))}
          </p>
          <h2 data-e="rest" className="mt-4 text-h2 font-semibold">
            Let&rsquo;s Build India&rsquo;s Energy Storage Future Together
          </h2>
          <p data-e="rest" className="mt-4 max-w-xl text-body text-paper/80">
            Whether you&rsquo;re a solar EPC looking to partner, or an end customer exploring a solution, Nexera is your
            trusted partner for BESS.
          </p>
        </div>
        <div data-e="actions" className="flex shrink-0 flex-wrap items-center gap-4">
          <MagneticButton to={contactTo} arrow spotlight>
            Get in Touch
          </MagneticButton>
          <MagneticButton to="/become-a-partner" variant="outline" sweep className="hover:shadow-[0_0_22px_-4px_color-mix(in_srgb,var(--accent)_45%,transparent)] focus-visible:shadow-[0_0_22px_-4px_color-mix(in_srgb,var(--accent)_45%,transparent)]">
            Become a Partner
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}
