import { useRef } from "react";
import { Gauge, Leaf, ShieldCheck } from "lucide-react";
import MagneticButton from "../ui/MagneticButton";
import ParallaxMedia from "../ui/ParallaxMedia";
import SceneImg from "../SceneImg";
import { SectionHead, useDrawIn } from "./shared";

const BADGES = [
  { icon: Leaf, text: "Cleaner Energy" },
  { icon: Gauge, text: "Greater Efficiency" },
  { icon: ShieldCheck, text: "A More Resilient Future" },
];

/**
 * Final CTA (dark, full-bleed photo with a slow parallax drift). The page's energy line ends at the
 * primary button (data-energy="cta"), which glows once when the line arrives (EnergyLine adds
 * .cta-pulse). The badge icons draw in.
 */
export default function FinalCta() {
  const badges = useRef(null);
  useDrawIn(badges);
  return (
    <section aria-labelledby="home2-cta" className="relative isolate overflow-hidden bg-deep text-white">
      <ParallaxMedia amount={8} className="-z-10">
        <SceneImg name="energy-night" alt="" sizes="100vw" className="h-full w-full object-cover" />
      </ParallaxMedia>
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-deep via-deep/85 to-deep/30" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-deep/80 via-transparent to-deep/40" />

      <div className="container-site py-24 lg:py-32">
        <div className="max-w-2xl">
          <SectionHead id="home2-cta" eyebrow="Let's build a cleaner tomorrow" title="Ready to Explore Energy Storage?" dark>
            <p className="mt-5 text-lg leading-relaxed text-ice/80">
              Talk to NEXERA Powertech about the right Battery Energy Storage System for your application.
            </p>
          </SectionHead>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <span data-energy="cta" className="inline-block rounded-full">
              <MagneticButton to="/contact" arrow spotlight ripple>
                Enquire Now
              </MagneticButton>
            </span>
            <MagneticButton to="/become-a-partner" variant="outline" sweep>
              Become a Partner
            </MagneticButton>
          </div>
          <ul ref={badges} className="mt-14 flex flex-wrap gap-x-8 gap-y-4">
            {BADGES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm font-medium text-ice/85">
                <span className="grid h-10 w-10 place-items-center rounded-full border border-signal/40 text-signal">
                  <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.7} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
