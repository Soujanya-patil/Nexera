import { Fragment } from "react";
import MagneticButton from "../ui/MagneticButton";

const STEPS = ["Partner", "Deploy", "Accelerate"];

/**
 * The homepage's closing band, as the article's last section (same look and words as HomeCta, which
 * the other pages keep): its heading reveals word by word (SplitText, via the page's reveal, data-rv
 * "split") and the light lines along the bottom drift slowly (CSS, off under reduced motion).
 * Get in Touch leads to the homepage contact form.
 */
export default function ArticleClosingBand() {
  return (
    <section className="article-band relative overflow-hidden bg-deep text-white">
      <div
        aria-hidden="true"
        className="ambient-drift pointer-events-none absolute -inset-[8%]"
        style={{
          background:
            "radial-gradient(55% 70% at 78% 120%, rgba(144,217,136,0.16), transparent 70%), radial-gradient(40% 60% at 15% 130%, rgba(144,217,136,0.08), transparent 70%)",
        }}
      />
      <svg aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 w-full" viewBox="0 0 1440 240" preserveAspectRatio="none" fill="none">
        <path className="article-band-line" d="M0 210 C 360 150, 720 250, 1440 120" stroke="rgba(144,217,136,0.35)" strokeWidth="1.2" />
        <path className="article-band-line" d="M0 230 C 420 170, 820 240, 1440 150" stroke="rgba(144,217,136,0.2)" strokeWidth="1" />
        <path className="article-band-line" d="M0 240 C 500 200, 900 230, 1440 185" stroke="rgba(144,217,136,0.12)" strokeWidth="1" />
      </svg>

      <div className="relative flex container-site flex-col gap-8 py-16 md:py-20 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <p className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.22em] text-ice/80">
            {STEPS.map((w, i) => (
              <Fragment key={w}>
                {i > 0 && <span aria-hidden="true" className="inline-block h-3 w-px bg-ice/40" />}
                <span className={i === STEPS.length - 1 ? "text-signal" : undefined}>{w}</span>
              </Fragment>
            ))}
          </p>
          <h2 data-rv="split" className="mt-4 text-2xl font-semibold leading-tight tracking-tight md:text-3xl">
            Let&rsquo;s Build India&rsquo;s Energy Storage Future Together
          </h2>
          <p data-rv="text" className="mt-4 max-w-xl leading-relaxed text-ice/80">
            Whether you&rsquo;re a solar EPC looking to partner, or an end customer exploring a solution, Nexera is your trusted partner for BESS.
          </p>
        </div>
        <div data-rv="text" className="flex shrink-0 flex-wrap items-center gap-4">
          <MagneticButton to="/#contact" arrow spotlight className="hover:scale-[1.02]">
            Get in Touch
          </MagneticButton>
          <MagneticButton to="/become-a-partner" variant="outline" sweep className="hover:scale-[1.02] hover:shadow-[0_0_22px_-4px_rgba(144,217,136,0.45)]">
            Become a Partner
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}
