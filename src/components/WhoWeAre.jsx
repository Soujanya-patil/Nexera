import { FEATHER, useMotion } from "../lib/motion";
import DisplayHeading from "./DisplayHeading";
import Reveal from "./Reveal";

/**
 * Scene 4 — WHO WE ARE. Nexera's own identity, positioned right after the category pathways and
 * before ProductShowcase/Credibility, so a visitor understands who Nexera is before two
 * consecutive partner-centric sections (TCL/Hithium products, then TCL/Hithium/CLOU as partners).
 * Every line here is pulled verbatim from the approved About page (About.jsx) — the founding
 * story, the real leadership team, and the same "why Nexera" points — nothing invented for this
 * section. WhyNexera (further down) stays capability-focused; this one carries the narrative job.
 *
 * Takes over the `-mt-[100vh]` + FEATHER rise-over ScaleStory's held tail that ProductShowcase
 * used to own, since this is now the section directly after ScaleStory in the DOM.
 *
 * That rise-over is CINEMATIC-ONLY, and all three of this section's layout bugs traced back to it
 * being applied unconditionally:
 *  - ScaleStory is only pinned in cinematic mode ("light"/"static" render it in normal flow, no
 *    held tail). So on tablet/mobile the `-mt-[100vh]` pulled this section a full viewport UP into
 *    ScaleStory's LIVE content, cutting its Utility chapter in half, and the FEATHER then dissolved
 *    this section's own top into it. Gated on `cine` now, matching Credibility/ScaleStory.
 *  - The feather ramps transparent -> opaque over 20vh, but the top padding was `pt-24 md:pt-32`
 *    = 128px, i.e. ~14vh at a 900px viewport. The eyebrow (152px in) and the h2 (180px in) sat
 *    INSIDE the ramp and rendered half-dissolved — the "top edges cut off" clipping. Cinematic top
 *    padding is now expressed in the same unit as the feather (`pt-[28vh]`) so content always
 *    starts below it, with headroom, at any viewport height.
 *  - The section's own height (~841px) was LESS than the 100vh tail it pulls over, so ScaleStory's
 *    final frame poked out underneath it — an orphaned "Explore Utility" link stranded in what
 *    read as a large empty gap before ProductShowcase. `min-h-[100vh]` in cinematic mode makes the
 *    cover-up exact by construction, and the bottom padding drops to `pb-16 md:pb-20` (paired with
 *    a matching reduction on ProductShowcase's top padding) to close the remaining slack.
 */
const leaders = [
  { name: "Ankit Jain", role: "Co-founder. 15+ years in solar EPC, leads strategy, brand partnerships, and fundraising." },
  { name: "Narendra", role: "Co-founder. Leads project execution and installation." },
  { name: "Raviraj", role: "Co-founder." },
  { name: "Patil Sir", role: "Co-founder." },
];

const promise = [
  "Authorized TCL and Hithium partner",
  "India-based design and commissioning support",
  "Hands-on technician training center in Kalaburagi",
  "Built by EPCs who understand the site-level problem",
];

export default function WhoWeAre() {
  const { mode } = useMotion();
  const cine = mode === "cinematic";
  return (
    <section
      className={
        cine
          ? "relative z-10 -mt-[100vh] min-h-[100vh] bg-night text-bone"
          : "relative bg-night text-bone"
      }
      style={cine ? FEATHER : undefined}
    >
      <div
        className={`mx-auto max-w-6xl px-6 pb-16 md:pb-20 ${cine ? "pt-[28vh]" : "pt-24 md:pt-28"}`}
      >
        <DisplayHeading eyebrow="Who We Are" className="max-w-3xl">
          Built by an EPC, for EPCs
        </DisplayHeading>
        <Reveal delay={0.08}>
          <p className="mt-6 max-w-2xl leading-relaxed text-bone/75">
            Nexera Powertech was founded to solve a problem we lived ourselves as a solar EPC:
            getting reliable battery storage into Indian projects, backed by service that
            actually shows up. We're an authorized TCL and Hithium partner, built to give Indian
            EPCs a trusted route into the BESS market.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-16">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-bone/60">Leadership Team</p>
          <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {leaders.map((l) => (
              <div key={l.name}>
                <p className="font-medium text-bone">{l.name}</p>
                <p className="mt-1 text-sm leading-relaxed text-bone/70">{l.role}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.15} className="mt-16 border-t border-bone/15 pt-10">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-bone/60">Our Promise</p>
          <ul className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {promise.map((w) => (
              <li key={w} className="flex items-start gap-2.5 text-sm text-bone/85">
                <span aria-hidden="true" className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-signal" />
                {w}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
