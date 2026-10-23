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
    <section className="article-band relative overflow-hidden bg-forest text-white">
      <div
        aria-hidden="true"
        className="ambient-drift pointer-events-none absolute -inset-[8%]"
        style={{
          background:
            "radial-gradient(55% 70% at 78% 120%, color-mix(in srgb, var(--accent) 16%, transparent), transparent 70%), radial-gradient(40% 60% at 15% 130%, color-mix(in srgb, var(--accent) 8%, transparent), transparent 70%)",
        }}
      />
      <svg aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 w-full" viewBox="0 0 1440 240" preserveAspectRatio="none" fill="none">
        <path className="article-band-line" d="M0 210 C 360 150, 720 250, 1440 120" stroke="color-mix(in srgb, var(--accent) 35%, transparent)" strokeWidth="1.2" />
        <path className="article-band-line" d="M0 230 C 420 170, 820 240, 1440 150" stroke="color-mix(in srgb, var(--accent) 20%, transparent)" strokeWidth="1" />
        <path className="article-band-line" d="M0 240 C 500 200, 900 230, 1440 185" stroke="color-mix(in srgb, var(--accent) 12%, transparent)" strokeWidth="1" />
      </svg>

      <div className="relative flex container-site flex-col gap-8 py-section lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <p className="flex items-center gap-3 eyebrow text-paper/80">
            {STEPS.map((w, i) => (
              <Fragment key={w}>
                {i > 0 && <span aria-hidden="true" className="inline-block h-3 w-px bg-paper/40" />}
                <span className={i === STEPS.length - 1 ? "text-accent" : undefined}>{w}</span>
              </Fragment>
            ))}
          </p>
          <h2 data-rv="split" className="mt-eyebrow text-h2 font-semibold">
            Let&rsquo;s Build India&rsquo;s Energy Storage Future Together
          </h2>
          <p data-rv="text" className="mt-heading max-w-measure text-body text-paper/80">
            Whether you&rsquo;re a solar EPC looking to partner, or an end customer exploring a solution, Nexera is your trusted partner for BESS.
          </p>
        </div>
        <div data-rv="text" className="flex shrink-0 flex-wrap items-center gap-4">
          <MagneticButton to="/#contact" arrow spotlight>
            Get in Touch
          </MagneticButton>
          <MagneticButton to="/become-a-partner" variant="outline" sweep className="hover:shadow-glow focus-visible:shadow-glow">
            Become a Partner
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}
