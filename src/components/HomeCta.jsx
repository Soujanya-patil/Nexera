import MagneticButton from "./ui/MagneticButton";
import Reveal from "./Reveal";

/** Closing band: near-black green with the mockup's faint green light streaks along the bottom. */
export default function HomeCta() {
  return (
    <section className="relative overflow-hidden bg-deep text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(55% 70% at 78% 120%, rgba(144,217,136,0.16), transparent 70%), radial-gradient(40% 60% at 15% 130%, rgba(144,217,136,0.08), transparent 70%)",
        }}
      />
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 w-full"
        viewBox="0 0 1440 240"
        preserveAspectRatio="none"
        fill="none"
      >
        <path d="M0 210 C 360 150, 720 250, 1440 120" stroke="rgba(144,217,136,0.35)" strokeWidth="1.2" />
        <path d="M0 230 C 420 170, 820 240, 1440 150" stroke="rgba(144,217,136,0.2)" strokeWidth="1" />
        <path d="M0 240 C 500 200, 900 230, 1440 185" stroke="rgba(144,217,136,0.12)" strokeWidth="1" />
      </svg>

      <Reveal className="relative mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16 md:py-20 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-ice/80">Partner | Deploy | Accelerate</p>
          <h2 className="mt-4 text-2xl font-semibold leading-tight tracking-tight md:text-3xl">
            Let&rsquo;s Build India&rsquo;s Energy Storage Future Together
          </h2>
          <p className="mt-4 max-w-xl leading-relaxed text-ice/80">
            Whether you&rsquo;re a solar EPC looking to partner, or an end customer exploring a solution, Nexera is your
            trusted partner for BESS.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-4">
          <MagneticButton to="/contact" arrow>
            Get in Touch
          </MagneticButton>
          <MagneticButton to="/become-a-partner" variant="outline">
            Become a Partner
          </MagneticButton>
        </div>
      </Reveal>
    </section>
  );
}
