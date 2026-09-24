import { useEffect, useRef, useState } from "react";
import { ChartNoAxesColumnIncreasing, Leaf, RotateCcw, Zap } from "lucide-react";
import PillLink from "./PillLink";
import videoSrc from "../assets/products/nexera-hero-cabinet.mp4";
import posterSrc from "../assets/products/nexera-hero-cabinet-poster.webp";

const trust = [
  { icon: Zap, lines: ["Cleaner Energy", "Round the Clock"] },
  { icon: ChartNoAxesColumnIncreasing, lines: ["Lower Costs", "Higher Reliability"] },
  { icon: Leaf, lines: ["A Stronger,", "Greener India"] },
];

/**
 * Home hero, per the approved mockup: copy on the left, the product bleeding off the right edge
 * and feathered into the navy ground.
 *
 * VIDEO — `nexera-hero-cabinet.mp4` is cut from the same footage as the old scroll-scrub file
 * (nexera-battery-cabinet-scroll.mp4), re-encoded for playback rather than scrubbing (~0.9MB vs
 * 17MB). It is trimmed to 1.5-8.3s (closed cabinet -> door opens -> interior), stopping before the
 * label callouts fade in at 8.5s, and cropped to x 320-1620 of the 1920 frame, which removes the
 * footage's baked-in corner logo (x < 16.5%) and the generator watermark (x ~90%). The cabinet door
 * itself carries the NEXERA mark, so no logo is overlaid: the nav's wordmark stays the only one.
 *
 * It plays once, muted, the first time it is half in view (above the fold on desktop; below the
 * copy on phones), and holds on the interior frame. Hovering the product (fine pointers) or the
 * Replay button (keyboard / touch) plays it again. Under prefers-reduced-motion it never
 * autoplays: the closed-cabinet poster stays, and the button offers a play instead.
 */
export default function HomeHero() {
  const video = useRef(null);
  const [reduced] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [status, setStatus] = useState("idle"); // idle | playing | ended

  const play = () => {
    const v = video.current;
    if (!v) return;
    if (v.ended) v.currentTime = 0;
    v.play().catch(() => setStatus("ended"));
  };

  useEffect(() => {
    const v = video.current;
    if (!v || reduced) return;
    v.muted = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          io.disconnect();
          play();
        }
      },
      { threshold: 0.5 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, [reduced]);

  const replayOnHover = () => {
    if (!reduced && status === "ended") play();
  };

  return (
    <section className="relative flex flex-col overflow-hidden bg-night text-white lg:block lg:min-h-[max(34rem,calc(100svh-4rem))] lg:max-h-[48rem]">
      <div className="relative z-10 order-1 mx-auto flex w-full max-w-6xl items-center px-6 pb-4 pt-14 lg:min-h-[inherit] lg:max-h-[inherit] lg:py-20">
        <div className="max-w-xl lg:w-1/2 lg:max-w-none lg:pr-6">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-ice/80">Battery Energy Storage Systems</p>
          <h1 className="mt-5 text-[clamp(2.1rem,4.2vw,3.4rem)] font-semibold leading-[1.1] tracking-tight">
            Powering India&rsquo;s Transition to{" "}
            <span className="block text-signal">Smart Energy Storage</span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-ice/80">
            Bridging world-class BESS technology with India&rsquo;s solar ecosystem through distribution, design,
            training and service.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <PillLink to="/solutions" arrow>
              Explore Solutions
            </PillLink>
            <PillLink to="/become-a-partner" variant="outline">
              Partner with Us
            </PillLink>
          </div>
          <ul className="mt-10 grid max-w-xl grid-cols-3 divide-x divide-white/15">
            {trust.map(({ icon: Icon, lines }) => (
              <li key={lines[0]} className="flex flex-col items-start gap-2 px-3 first:pl-0 sm:flex-row sm:items-center sm:gap-3 sm:px-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-signal/70 text-signal">
                  <Icon aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
                </span>
                <span className="whitespace-nowrap text-xs leading-snug text-ice/85">
                  {lines[0]}
                  <br />
                  {lines[1]}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div
        onPointerEnter={(e) => e.pointerType === "mouse" && replayOnHover()}
        className="relative order-2 aspect-[65/54] w-full lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto lg:w-[56%]"
      >
        <video
          ref={video}
          src={videoSrc}
          poster={posterSrc}
          muted
          playsInline
          preload={reduced ? "none" : "auto"}
          onPlay={() => setStatus("playing")}
          onEnded={() => setStatus("ended")}
          aria-label="NEXERA battery energy storage cabinet opening to reveal its stacked battery modules and power electronics"
          className="h-full w-full object-cover object-[50%_75%]"
        />
        {/* Feather the footage (#161D1F ground) into the hero's navy: a wide fade on the copy side,
            narrow fades top and bottom. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,var(--color-night),transparent_18%,transparent_82%,var(--color-night))] lg:bg-[linear-gradient(to_right,var(--color-night),transparent_30%),linear-gradient(to_bottom,var(--color-night),transparent_14%,transparent_86%,var(--color-night))]"
        />
        {(status === "ended" || (reduced && status === "idle")) && (
          <button
            type="button"
            onClick={play}
            className="absolute bottom-5 right-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-night/70 px-3.5 py-1.5 text-xs font-medium text-ice/90 backdrop-blur transition-colors hover:border-signal hover:text-signal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
          >
            <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
            {status === "ended" ? "Replay" : "Play product view"}
          </button>
        )}
      </div>
    </section>
  );
}
