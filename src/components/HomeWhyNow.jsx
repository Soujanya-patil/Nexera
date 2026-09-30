import { useRef } from "react";
import { Database, Leaf, ShieldCheck, Sun } from "lucide-react";
import PillLink from "./PillLink";
import SceneImg from "./SceneImg";
import ParallaxMedia from "./ui/ParallaxMedia";
import { useEntrance } from "../lib/entrance";
import { useParallax } from "../lib/parallax";
import { useMediaQuery, useScrollSteps } from "../lib/scrollSteps";

const benefits = [
  { icon: Sun, label: "Integrate More Renewable Energy" },
  { icon: Database, label: "Reduce Energy Costs" },
  { icon: ShieldCheck, label: "Improve Grid Stability" },
  { icon: Leaf, label: "Lower Emissions", filled: true },
];

/**
 * Why Now — the editorial, storytelling section.
 * Entrance (the slowest on the page): the photograph opens from the left (a clip reveal) with a
 * gentle settle, then the eyebrow, heading, copy and link rise in, then the four benefits arrive.
 * Reading: as the section scrolls through, the benefits ACTIVATE one after another (ScrollTrigger
 * progress via useScrollSteps — so it reverses on the way up): the icon scales up slightly and takes
 * a green emphasis, the label brightens, and a short connector rule above it fills green.
 * Depth: the photograph drifts ~12 px with scroll and the copy ~3 px (both off under reduced motion
 * and halved on phones); the photo is over-sized so its edges never show.
 */
export default function HomeWhyNow() {
  const root = useRef(null);
  const list = useRef(null);
  const copy = useRef(null);
  const reduce = useMediaQuery("(prefers-reduced-motion: reduce)");
  // 0…4 benefits active, from the list's progress through the reading zone.
  const active = useScrollSteps(list, benefits.length + 1, { start: "top 72%", end: "bottom 42%", enabled: !reduce });
  const lit = (i) => reduce || i < active;
  useParallax(copy, { amount: 0.7 });
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
        <ParallaxMedia amount={2}>
          <SceneImg name="energy-night" className="h-full w-full object-cover object-[50%_60%]" />
        </ParallaxMedia>
      </div>
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-night/95 via-night/75 to-night/30" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-night/80 to-transparent" />

      <div className="relative grid container-site items-center gap-12 py-20 md:py-24 lg:grid-cols-2">
        <div ref={copy}>
          <p data-e="copy" className="text-xs font-medium uppercase tracking-[0.2em] text-ice/80">
            Why Energy Storage, Why Now
          </p>
          <h2 data-e="copy" className="mt-4 text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
            {/* The space keeps "Cleaner," and "More" apart in the heading's text; before a <br> it renders nothing. */}
            A Stronger, Cleaner,{" "}
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

        <ul ref={list} className="grid grid-cols-2 gap-x-8 gap-y-10 lg:justify-self-end">
          {benefits.map(({ icon: Icon, label, filled }, i) => {
            const on = lit(i);
            return (
              <li key={label} data-e="benefit" className="group/benefit relative max-w-[12rem] pt-4">
                {/* Connector rule: fills green as this benefit activates */}
                <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-white/12" />
                <span
                  aria-hidden="true"
                  className={`absolute left-0 top-0 h-px w-full origin-left bg-signal/80 transition-[scale] duration-700 ease-out ${on ? "scale-x-100" : "scale-x-0"}`}
                />
                <span
                  data-icon
                  className={`grid h-11 w-11 place-items-center rounded-full transition-[translate,scale,background-color,box-shadow,opacity] duration-500 ease-out group-hover/benefit:-translate-y-1 ${
                    filled ? "bg-signal text-forest" : on ? "bg-signal/12 text-signal" : "text-signal"
                  } ${on ? "scale-110 opacity-100 shadow-[0_0_0_1px_rgba(144,217,136,0.35)]" : "scale-100 opacity-60"}`}
                >
                  <Icon aria-hidden="true" className={filled ? "h-5 w-5" : "h-7 w-7"} strokeWidth={1.6} />
                </span>
                <p
                  className={`mt-3 text-sm font-semibold leading-snug transition-colors duration-500 group-hover/benefit:text-white ${
                    on ? "text-white" : "text-ice/65"
                  }`}
                >
                  {label}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
