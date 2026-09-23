import { useRef } from "react";
import { useMotion, useScrollScene } from "../lib/motion";
import { useMagnetic } from "../lib/magnetic";
import videoSrc from "../assets/products/nexera-battery-cabinet-scroll.mp4";

/**
 * Scene 1 — ENERGY + ANATOMY, merged. Used to be two scenes: a static Hero (headline, stat band,
 * a separate ModelStage/city composition), then a separately-pinned scroll-scrubbed video. Now
 * one continuous opening: the scrub starts at scroll position 0, with the former Hero's headline,
 * subcopy, and CTAs overlaid on the video's own closed-cabinet frame — closed -> door
 * opens -> interior reveal -> exploded view. `Hero.jsx` is kept as a file per this project's
 * convention (Storage/Technology/FinalCta are all unmounted-but-kept) but is no longer rendered
 * from Home — this component is now the source of truth for the opening.
 *
 * Unlike the other scenes, this one keeps its scroll-scrub on mobile/tablet too (per its own
 * brief) rather than falling back to plain in-flow reveals — only `prefers-reduced-motion`
 * disables the pin/scrub here, showing the closed-cabinet frame with the same headline/subcopy/
 * CTAs statically instead (no animation, no pin — functionally the old static Hero).
 *
 * ScrollTrigger mapping: one gsap.timeline, one ScrollTrigger (start "top top", end "bottom bottom",
 * scrub: true for an exact — not eased/lagged — mirror of scroll position), pinned via CSS
 * `position: sticky` on the inner frame. The opening-copy sequence and the video-scrub tween share
 * this SAME timeline (no second parallel ScrollTrigger). video.currentTime is NOT mapped linearly
 * to scroll — see VIDEO_KEYFRAMES below — but the underlying mechanism is unchanged: a chain of
 * tweens on the same video element inside the same STORY fraction (0..STORY of local time == 0..1
 * of scroll progress through that fraction), using the `() => video.duration` function-value
 * pattern so `tl.invalidate()` + `ScrollTrigger.refresh()` (the load-delay catch-up below)
 * recomputes every segment, not just the last one. The remaining tail is held (matching every
 * other scene's convention) so the next scene's `-mt-[100vh]` rise-over has an inert tail to land
 * on without clipping live content.
 *
 * PIN LENGTH + PACING — re-audited (ffmpeg, finer sampling this pass, ~0.1-0.2s steps around the
 * two problem stretches): the footage is static 0-2.5s, opens fast 2.5-3.5s, settles slowly
 * 3.5-7.0s, then — this is what a fresh scroll recording caught that the last pass missed — sits
 * COMPLETELY static 7.0-8.5s (1.5s, not just "held"), the label callouts fade in 8.5-9.1s (not
 * 9-10s as previously assumed), and then it's static AGAIN 9.1-10.0s (0.9s). So there are two
 * genuinely dead stretches around the labels, not one long "labels" segment — VIDEO_KEYFRAMES now
 * compresses both of them specifically, and splits the 8.5-9.1s fade-in itself into three smaller
 * steps (0.85/0.87/0.89/0.91) so the callouts read as a stagger instead of one block-reveal.
 * OWN_STORY_VH is unchanged at 130; HELD_VH's DOM height still matches PIN_VH exactly. Total pin
 * length: 230vh (unchanged from the previous pass — this pass redistributes scroll *within* that
 * length, it doesn't add to it).
 *
 * OPENING COPY — sequential reveal: the headline holds then clears, and only then does the
 * subcopy+CTA group fade in, hold, and clear — by the time the video keyframe chain reaches its
 * first real motion (the door starting to open, ~t=P(0.24)), the screen is copy-free. CTAs use
 * `autoAlpha` (not `opacity`) so they're only actually clickable while visibly present.
 *
 * LOGO — exactly one NEXERA wordmark renders anywhere on screen, and it is the persistent one in
 * the sticky <Nav />. This scene used to overlay a second <Wordmark /> of its own above the
 * headline (inherited from the old static Hero, which had no nav above it); both were visible
 * simultaneously for the first few seconds of the page. That overlay is removed — the nav's is the
 * only one. The video's OWN baked-in "NEXERA / Power Tech" corner mark is a third one, so it stays
 * covered by the masking patch below (measured off the source: it occupies x 3-16.5%, y 3.5-11.5%
 * of the frame, hence a 20% x 15% patch pinned to the frame's top-left corner). `object-position`
 * can't crop it out — see the FRAME note below for why the frame is aspect-locked, which is also
 * what lets the patch be expressed in frame coordinates and stay accurate at every viewport.
 *
 * FRAME — the video sits in an explicitly aspect-locked 16:9 wrapper rather than being stretched
 * across an `inset-x-[6%] inset-y-[8%]` box directly. It has to be: a <video> is a replaced
 * element, and Tailwind Preflight gives it `max-width:100%; height:auto`. On an absolutely
 * positioned replaced element those beat the `right`/`bottom` insets outright — the used width
 * resolves to 100% of the containing block (NOT the 88% the insets describe) and the height to
 * width x 9/16, so the element overflowed 6% past the right edge and, on portrait viewports,
 * stopped ~430px short of its bottom inset. That left the video's hard bottom edge slicing across
 * mid-screen with a cropped light-grey slab of cabinet floating above dead space — the "white
 * rectangle" artifact, and the reason the intended breathing-room inset never actually applied.
 * Sizing the WRAPPER (`aspect-video` + an explicit width) and letting the video fill it with
 * `h-full w-full` keeps the 6%/8% inset real at every viewport. The width is
 * `min(88%, 149.33svh)`: 88% of the stage honours the horizontal inset, and 149.33svh is the
 * widest a 16:9 box can be while its height still fits in 84svh (84 x 16/9), which honours the
 * vertical one. Whichever constraint binds first wins, so the frame never touches an edge.
 *
 * REMOVED (earlier instruction, still in effect): the accurate component-list label sidebar that
 * used to run beside the video. It existed specifically to correct known label errors baked into
 * the video's own on-screen text — "Compuntture Sensor" should read "Combustible Gas Detector",
 * "Temperature Left" should read "Temperature Sensor", and both "Smoke Detector" and "Intake
 * Valve" appear twice. Those errors are still visible with nothing correcting them; the staggered
 * reveal added this pass works on the video's own (uncorrected) label pixels via timing only, not
 * by reintroducing separate label text.
 */
const PHASES = ["Closed", "Opening", "Interior Revealed", "Exploded View"];
// Local-timeline fractions (of this scene's own STORY span) where each phase visually begins —
// matches VIDEO_KEYFRAMES' cumulative scroll positions for video-time 0 / 0.25 / 0.35 / 0.85.
const PHASE_AT = [0, 0.24, 0.44, 0.68];

// [videoTimeFraction, cumulativeScrollFractionOfSTORY]. Scroll distance per pair is deliberately
// disproportionate to video-time per pair — see the pacing note above for the frame-by-frame
// evidence. The two genuinely static stretches (0.70-0.85 and 0.91-1.0) get the smallest shares;
// the door opening (0.25-0.35) and the label stagger (0.85-0.91, split into three sub-steps so the
// callouts read as one-at-a-time rather than a single block) get the largest.
const VIDEO_KEYFRAMES = [
  [0, 0],
  [0.25, 0.24],
  [0.35, 0.44],
  [0.7, 0.64],
  [0.85, 0.68],
  [0.87, 0.76],
  [0.89, 0.84],
  [0.91, 0.9],
  [1, 1],
];

const OWN_STORY_VH = 130;
const HELD_VH = 100; // reserved tail, same convention as every other scene, so the next scene's rise-over lands on an inert frame
const PIN_VH = OWN_STORY_VH + HELD_VH;
const STORY = OWN_STORY_VH / PIN_VH;

// Opening-copy sequence, as fractions of the section's TOTAL scroll range (not of STORY).
// Sequential, not overlapping, so "one at a time" is literal.
// Headline is visible immediately (no fade-in needed) — holds, then clears.
const HEADLINE_HOLD_END = 0.045;
const HEADLINE_CLEAR_END = 0.065;
// Subcopy+CTAs start hidden (JSX default), fade in only once the headline is gone, hold, clear.
const SUBCOPY_FADE_IN_START = HEADLINE_CLEAR_END;
const SUBCOPY_FADE_IN_END = 0.08;
const SUBCOPY_HOLD_END = 0.115;
const SUBCOPY_CLEAR_END = 0.135;

// Cover for the video's baked-in corner wordmark (see the file-top LOGO note). Measured off the
// source, the mark sits at x 3-16.5%, y 3.5-11.5% of the frame; this box is 26% x 20% of the frame,
// so the mark ends by 63% of its width and 58% of its height. The radial falloff therefore stays
// fully opaque well past the mark (to 70%) and only then fades out, which keeps the patch from
// reading as the hard-edged rectangle a flat fill left against the video's slightly warmer black.
const LOGO_PATCH = {
  background: "radial-gradient(100% 100% at 0% 0%, var(--color-night) 70%, transparent 100%)",
};

function OpeningCopy() {
  const magneticRef = useMagnetic();
  return (
    <div className="mx-auto max-w-2xl text-center">
      <div data-a="copy-headline">
        <h1 className="font-serif text-4xl font-semibold leading-tight text-balance lg:text-5xl">
          Energy Storage, Built to Scale.
        </h1>
      </div>
      <div data-a="copy-sub" className="invisible">
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-bone/80">
          Advanced Battery Energy Storage Systems for reliable, scalable power across residential,
          commercial and utility applications.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <a
            ref={magneticRef}
            href="#systems"
            className="inline-flex items-center rounded-md bg-signal px-6 py-3 text-sm font-medium text-ink shadow-[0_0_0_0_rgba(0,167,142,0.5)] transition-all duration-300 hover:bg-signal/90 hover:shadow-[0_0_28px_4px_rgba(0,167,142,0.45)]"
          >
            Explore Our Systems
          </a>
          <a
            href="#enquire"
            className="inline-flex items-center rounded-md border border-white/30 px-6 py-3 text-sm font-medium text-white transition-colors duration-300 hover:border-white/60 hover:bg-white/5"
          >
            Contact NEXERA
          </a>
        </div>
      </div>
    </div>
  );
}

export default function CabinetAnatomy() {
  const { mode } = useMotion();
  // This section keeps scroll-scrub on mobile/tablet ("light" mode) per its own brief — only
  // reduced-motion ("static") disables pinning, unlike sibling scenes which are cinematic-only.
  const scrubbing = mode !== "static";
  const root = useRef(null);
  const videoRef = useRef(null);

  useScrollScene(
    root,
    ({ gsap, ScrollTrigger, q }) => {
      const $ = (name) => q(`[data-a="${name}"]`);
      const video = videoRef.current;
      const P = (x) => x * STORY;

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: true, invalidateOnRefresh: true },
      });

      // Opening copy: headline holds then clears, then (and only then) subcopy+CTAs fade in, hold,
      // and clear — sequential, not simultaneous. Both start visible-by-default in JSX (headline)
      // or hidden-by-default (subcopy, via the `invisible` class) so there's no flash before GSAP
      // attaches; GSAP only needs to animate the transitions actually happening from that state.
      tl.to($("copy-headline"), { autoAlpha: 0, y: -16, duration: HEADLINE_CLEAR_END - HEADLINE_HOLD_END, ease: "power1.in" }, HEADLINE_HOLD_END);
      tl.fromTo(
        $("copy-sub"),
        { autoAlpha: 0, y: 16 },
        { autoAlpha: 1, y: 0, duration: SUBCOPY_FADE_IN_END - SUBCOPY_FADE_IN_START, ease: "power1.out" },
        SUBCOPY_FADE_IN_START
      );
      tl.to($("copy-sub"), { autoAlpha: 0, y: -16, duration: SUBCOPY_CLEAR_END - SUBCOPY_HOLD_END, ease: "power1.in" }, SUBCOPY_HOLD_END);

      // Core mechanic: scroll progress maps onto video.currentTime across the story span, via the
      // non-linear VIDEO_KEYFRAMES pacing (see file-top comment) instead of one linear tween. Every
      // segment uses function-values (not resolved numbers) for its end, so the load-delay catch-up
      // below (tl.invalidate()) recomputes all of them.
      //
      // Only the FIRST segment is `.fromTo()` (it needs an explicit starting value); every segment
      // after that is `.to()` only. Multiple `.fromTo()` calls on the same property each
      // immediateRender their "from" value the instant they're added to the timeline — with several
      // segments in a loop, the LAST one created would stomp currentTime to its own start value
      // immediately on mount, before any real scroll had happened. `.to()` has no "from" to
      // immediateRender, so it doesn't have this problem, and GSAP's scrub engine already computes
      // the correct interpolated/held value for any timeline position in either scroll direction.
      VIDEO_KEYFRAMES.forEach(([t1, s1], i) => {
        if (i === 0) return;
        const [t0, s0] = VIDEO_KEYFRAMES[i - 1];
        const isLast = i === VIDEO_KEYFRAMES.length - 1;
        const seg = { currentTime: () => (isLast ? video.duration || 0 : (video.duration || 0) * t1), duration: P(s1) - P(s0) };
        if (i === 1) {
          tl.fromTo(video, { currentTime: () => (video.duration || 0) * t0 }, seg, P(s0));
        } else {
          tl.to(video, seg, P(s0));
        }
      });

      // Ambient depth: a subtle vignette on the section's own background, deepening toward the exploded view.
      // duration: 1 (the full local timeline, not STORY) is deliberate: it's what pins this timeline's own
      // totalDuration() to 1, so ScrollTrigger's scrub (which maps scroll progress onto tl.progress(), a
      // fraction of totalDuration()) lines up 1:1 with the P(x) positions below. Without an anchor tween
      // spanning the full 0..1, totalDuration() would collapse to STORY and every P(x) position would be
      // scaled by STORY twice — same technique Technology.jsx uses for its cabinet-scale/vignette tweens.
      tl.fromTo($("vignette"), { autoAlpha: 0.2 }, { autoAlpha: 0.55, duration: 1 }, 0);

      // Phase indicator: a handful of small dots (mobile row + desktop column, same 4 phases),
      // snapping to the active phase at each boundary.
      const dotGroups = [$("phase-dot-mobile"), $("phase-dot-desktop")];
      PHASE_AT.forEach((frac, i) => {
        const at = P(frac);
        dotGroups.forEach((dots) => {
          if (i > 0) tl.to(dots[i - 1], { opacity: 0.35, scale: 1, duration: 0.02 }, at);
          tl.to(dots[i], { opacity: 1, scale: 1.5, duration: 0.02 }, at);
        });
      });

      // Entrance hint: fades in as the section approaches (reversible), then fades out permanently
      // the moment the user scrolls even slightly within the pin — a one-shot, not scrub-reversible.
      gsap.fromTo(
        $("hint"),
        { autoAlpha: 0 },
        { autoAlpha: 1, scrollTrigger: { trigger: root.current, start: "top 85%", end: "top 55%", scrub: 0.3, invalidateOnRefresh: true } }
      );
      let dismissed = false;
      const hintTrigger = ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate(self) {
          if (!dismissed && self.progress > 0.015) {
            dismissed = true;
            gsap.to($("hint"), { autoAlpha: 0, y: -6, duration: 0.5, overwrite: true });
          }
        },
      });

      // Handle video load delay gracefully: if the user has already scrolled into the pin before
      // metadata resolves, snap the video to the matching frame the instant it becomes ready.
      // `duration` only became known just now, so `invalidate()` clears the tween's cached end
      // value (it was resolved to 0 on first render, per the `|| 0` fallback) and `refresh()`
      // re-renders every trigger at its current scroll position, which re-evaluates that function
      // value with the real duration and applies the correct currentTime immediately — a direct
      // `tl.progress()` write doesn't reliably stick against a scrub-owned timeline.
      const onLoadedMeta = () => {
        tl.invalidate();
        ScrollTrigger.refresh();
      };
      video.addEventListener("loadedmetadata", onLoadedMeta);

      return () => {
        video.removeEventListener("loadedmetadata", onLoadedMeta);
        hintTrigger.kill();
      };
    },
    scrubbing
  );

  if (!scrubbing) {
    // prefers-reduced-motion: the closed-cabinet frame (video's natural first frame — no seek
    // needed) with the full opening wordmark/headline/subcopy/CTAs, statically. No animation, no
    // pin. `copy-sub` doesn't get the `invisible` class here — nothing scrubs it back in.
    return (
      <section className="relative overflow-hidden bg-night text-bone">
        {/* Aspect-locked frame, inset rather than edge-to-edge (breathing room around the
            product) — see the file-top FRAME note for why the wrapper carries the size. */}
        <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
          <div className="relative aspect-video w-[min(88%,149.33svh)] overflow-hidden rounded-2xl">
            <video muted playsInline preload="metadata" src={videoSrc} className="h-full w-full object-cover" />
            {/* Covers the video's own baked-in "NEXERA / Power Tech" corner mark — see the
                file-top LOGO note. Positioned in FRAME coordinates, so it tracks the mark at
                every viewport. */}
            <div className="pointer-events-none absolute left-0 top-0 h-[20%] w-[26%]" style={LOGO_PATCH} />
          </div>
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night/90 via-night/45 to-night/15"
        />
        <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-6xl items-center justify-center px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="font-serif text-4xl font-semibold leading-tight text-balance lg:text-5xl">
              Energy Storage, Built to Scale.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-bone/80">
              Advanced Battery Energy Storage Systems for reliable, scalable power across
              residential, commercial and utility applications.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <a
                href="#systems"
                className="inline-flex items-center rounded-md bg-signal px-6 py-3 text-sm font-medium text-ink shadow-[0_0_0_0_rgba(0,167,142,0.5)] transition-all duration-300 hover:bg-signal/90 hover:shadow-[0_0_28px_4px_rgba(0,167,142,0.45)]"
              >
                Explore Our Systems
              </a>
              <a
                href="#enquire"
                className="inline-flex items-center rounded-md border border-white/30 px-6 py-3 text-sm font-medium text-white transition-colors duration-300 hover:border-white/60 hover:bg-white/5"
              >
                Contact NEXERA
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    // h-[230vh] must stay a literal string (Tailwind's JIT scans source text, not runtime values)
    // — it's OWN_STORY_VH + HELD_VH = 130 + 100 = PIN_VH. Keep these in sync if either changes.
    <section ref={root} className="relative z-10 h-[230vh] bg-night text-bone">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* Aspect-locked frame, inset rather than edge-to-edge (breathing room around the
            product) — see the file-top FRAME note for why the wrapper, not the video, is sized. */}
        <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
          <div className="relative aspect-video w-[min(88%,149.33svh)] overflow-hidden rounded-2xl">
            <video ref={videoRef} muted playsInline preload="auto" src={videoSrc} className="h-full w-full object-cover" />
            {/* Covers the video's own baked-in "NEXERA / Power Tech" corner mark, so the nav's is
                the only wordmark on screen — see the file-top LOGO note. Positioned in FRAME
                coordinates, so it tracks the mark at every viewport. */}
            <div className="pointer-events-none absolute left-0 top-0 h-[20%] w-[26%]" style={LOGO_PATCH} />
          </div>
        </div>

        <div
          data-a="vignette"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10"
          style={{ background: "radial-gradient(65% 65% at 32% 50%, transparent 25%, var(--color-night) 100%)" }}
        />

        {/* Legibility scrim for the opening copy — same convention every other text-over-image
            scene on this page already uses (Hero originally, Storage, ScaleStory, Technology). */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-night/85 via-night/25 to-transparent"
        />

        <div className="relative z-20 mx-auto flex h-full max-w-6xl items-center justify-center px-6">
          <OpeningCopy />
        </div>

        <div
          data-a="hint"
          aria-hidden="true"
          className="pointer-events-none invisible absolute inset-x-0 bottom-6 z-20 flex flex-col items-center gap-2 text-center lg:bottom-10"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-bone/70">Scroll to explore</p>
          <svg className="h-4 w-4 animate-bounce text-bone/70" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Phase indicator — horizontal row, top edge, mobile/tablet */}
        <div className="pointer-events-none absolute inset-x-0 top-5 z-20 flex justify-center gap-3 lg:hidden">
          {PHASES.map((label) => (
            <span key={label} data-a="phase-dot-mobile" className="h-1.5 w-1.5 rounded-full bg-bone opacity-35" />
          ))}
        </div>

        {/* Phase indicator — vertical, right edge, desktop */}
        <div className="pointer-events-none absolute right-6 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-center gap-4 lg:flex">
          {PHASES.map((label) => (
            <span key={label} data-a="phase-dot-desktop" className="h-1.5 w-1.5 rounded-full bg-bone opacity-35" />
          ))}
        </div>
      </div>
    </section>
  );
}
