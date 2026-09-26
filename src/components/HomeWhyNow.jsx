import { useRef } from "react";
import { Database, Leaf, ShieldCheck, Sun } from "lucide-react";
import PillLink from "./PillLink";
import SceneImg from "./SceneImg";
import ParallaxMedia from "./ui/ParallaxMedia";
import { useEntrance } from "../lib/entrance";

const benefits = [
  { icon: Sun, label: "Integrate More Renewable Energy" },
  { icon: Database, label: "Reduce Energy Costs" },
  { icon: ShieldCheck, label: "Improve Grid Stability" },
  { icon: Leaf, label: "Lower Emissions", filled: true },
];

/**
 * Why Now — told in order as it scrolls in (the slowest entrance on the page): the photograph opens
 * from the left (a clip reveal) with a gentle settle, then the eyebrow, heading, copy and link rise
 * in, then the four benefits arrive one by one, each icon turning up into place. On hover a benefit's
 * icon lifts and its label brightens.
 */
export default function HomeWhyNow() {
  const root = useRef(null);
  const enter = useEntrance(
    root,
    ({ tl, q }) => {
      tl.fromTo(
        q('[data-e="image"]'),
        { opacity: 0, clipPath: "inset(0% 100% 0% 0%)", scale: 1.06 },
        { opacity: 1, clipPath: "inset(0% 0% 0% 0%)", scale: 1, duration: 1.6, ease: "power2.inOut", clearProps: "all" },
        0
      )
        .fromTo(q('[data-e="copy"]'), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, clearProps: "all" }, 0.55)
        .fromTo(q('[data-e="benefit"]'), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.18, clearProps: "all" }, 1.0)
        .fromTo(q('[data-e="benefit"] [data-icon]'), { scale: 0.6, rotate: -14 }, { scale: 1, rotate: 0, duration: 0.8, stagger: 0.18, ease: "back.out(1.6)", clearProps: "all" }, 1.0);
    },
    { start: "top 70%" }
  );

  return (
    <section ref={root} data-enter={enter} className="relative overflow-hidden bg-night text-white">
      {/* Closest existing asset to the mockup's sunset skyline (no new imagery for now).
          TODO(india-imagery): energy-night is a cityscape not identified as Indian. */}
      <div data-e="image" className="absolute inset-0">
        <ParallaxMedia amount={6}>
          <SceneImg name="energy-night" className="h-full w-full object-cover object-[50%_60%]" />
        </ParallaxMedia>
      </div>
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-night/95 via-night/75 to-night/30" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-night/80 to-transparent" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:py-24 lg:grid-cols-2">
        <div>
          <p data-e="copy" className="text-xs font-medium uppercase tracking-[0.2em] text-ice/80">
            Why Energy Storage, Why Now
          </p>
          <h2 data-e="copy" className="mt-4 text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
            A Stronger, Cleaner,
            <br />
            More Reliable India
          </h2>
          <p data-e="copy" className="mt-5 max-w-md leading-relaxed text-ice/80">
            Battery storage makes India&rsquo;s clean energy future possible — storing solar power for when it&rsquo;s
            needed, reducing diesel dependence, and building a more reliable, resilient grid.
          </p>
          <div data-e="copy" className="mt-8">
            <PillLink to="/resources" arrow spotlight>
              Learn About the Opportunity
            </PillLink>
          </div>
        </div>

        <ul className="grid grid-cols-2 gap-x-8 gap-y-10 lg:justify-self-end">
          {benefits.map(({ icon: Icon, label, filled }) => (
            <li key={label} data-e="benefit" className="group/benefit max-w-[12rem]">
              <span
                data-icon
                className={`grid h-11 w-11 place-items-center rounded-full transition-[translate] duration-500 ease-out group-hover/benefit:-translate-y-1 ${
                  filled ? "bg-signal text-forest" : "text-signal"
                }`}
              >
                <Icon aria-hidden="true" className={filled ? "h-5 w-5" : "h-7 w-7"} strokeWidth={1.6} />
              </span>
              <p className="mt-3 text-sm font-semibold leading-snug text-ice/90 transition-colors duration-300 group-hover/benefit:text-white">{label}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
