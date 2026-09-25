import { Database, Leaf, ShieldCheck, Sun } from "lucide-react";
import PillLink from "./PillLink";
import Reveal from "./Reveal";
import SceneImg from "./SceneImg";
import ParallaxMedia from "./ui/ParallaxMedia";

const benefits = [
  { icon: Sun, label: "Integrate More Renewable Energy" },
  { icon: Database, label: "Reduce Energy Costs" },
  { icon: ShieldCheck, label: "Improve Grid Stability" },
  { icon: Leaf, label: "Lower Emissions", filled: true },
];

export default function HomeWhyNow() {
  return (
    <section className="relative overflow-hidden bg-night text-white">
      {/* Closest existing asset to the mockup's sunset skyline (no new imagery for now).
          TODO(india-imagery): energy-night is a cityscape not identified as Indian. */}
      <ParallaxMedia amount={6}>
        <SceneImg name="energy-night" className="h-full w-full object-cover object-[50%_60%]" />
      </ParallaxMedia>
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-night/95 via-night/75 to-night/30" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-night/80 to-transparent" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:py-24 lg:grid-cols-2">
        <Reveal>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-ice/80">Why Energy Storage, Why Now</p>
          <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
            A Stronger, Cleaner,
            <br />
            More Reliable India
          </h2>
          <p className="mt-5 max-w-md leading-relaxed text-ice/80">
            Battery storage makes India&rsquo;s clean energy future possible — storing solar power for when it&rsquo;s
            needed, reducing diesel dependence, and building a more reliable, resilient grid.
          </p>
          <PillLink to="/resources" arrow className="mt-8">
            Learn About the Opportunity
          </PillLink>
        </Reveal>

        <ul className="grid grid-cols-2 gap-x-8 gap-y-10 lg:justify-self-end">
          {benefits.map(({ icon: Icon, label, filled }, i) => (
            <Reveal as="li" key={label} delay={i * 0.06} className="max-w-[12rem]">
              <span
                className={`grid h-11 w-11 place-items-center rounded-full ${
                  filled ? "bg-signal text-forest" : "text-signal"
                }`}
              >
                <Icon aria-hidden="true" className={filled ? "h-5 w-5" : "h-7 w-7"} strokeWidth={1.6} />
              </span>
              <p className="mt-3 text-sm font-semibold leading-snug">{label}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
