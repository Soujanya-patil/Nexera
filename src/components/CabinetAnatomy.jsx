import { useEffect, useRef, useState } from "react";
import { useMotion, useScrollScene } from "../lib/motion";
import videoSrc from "../assets/products/nexera-battery-cabinet-scroll.mp4";

/**
 * Scene 4.5 — ANATOMY. Sits between Technology ("Why Hithium": liquid cooling, safety certs) and
 * Credibility (partner trust): after establishing the certifications, this scene shows the actual
 * engineered safety systems those certifications cover, via a scroll-scrubbed video of one real
 * cabinet — closed -> door opens -> exploded view — with a live, always-accurate component list
 * (real text, not baked into the video) highlighting in sequence as the exploded view resolves.
 *
 * Unlike the other scenes, this one keeps its scroll-scrub on mobile/tablet too (per its own
 * brief) rather than falling back to plain in-flow reveals — only `prefers-reduced-motion`
 * disables the pin/scrub here, showing the final exploded frame statically instead.
 *
 * ScrollTrigger mapping: one gsap.timeline, one ScrollTrigger (start "top top", end "bottom bottom",
 * scrub: true for an exact — not eased/lagged — mirror of scroll position), pinned via CSS
 * `position: sticky` on the inner frame. video.currentTime is tweened 0 -> duration across the
 * timeline's own STORY fraction (0..STORY of local time == 0..1 of scroll progress through that
 * fraction); the remaining tail is held (matching every other scene's convention) so Credibility's
 * existing `-mt-[100vh]` rise-over has an inert tail to land on without clipping live content.
 */
const COMPONENTS = [
  "Smoke Detector",
  "Explosion Vent",
  "Water Fire Protection System",
  "Combustible Gas Detector",
  "Temperature Sensor",
  "Pack-Level Fire Protection",
  "Pack Explosion Relief Valve",
  "Aerosol Fire Suppression",
  "Exhaust Valve",
  "Intake Valve",
];

const PHASES = ["Closed", "Opening", "Interior Revealed", "Exploded View"];
// Local-timeline fractions (of this scene's own STORY span) where each phase visually begins.
// Approximate — calibrated against the brief's description, not frame-inspected; retime here if
// the cut points don't match the actual footage.
const PHASE_AT = [0, 0.12, 0.45, 0.75];
// The video's own on-screen labels only resolve in its final quarter — highlight list items there.
const LABELS_AT = 0.75;

const OWN_STORY_VH = 200; // "substantial" scrub distance — matches the largest existing scene (Storage)
const HELD_VH = 100; // reserved tail, same convention as every other scene, so Credibility's rise-over lands on an inert frame
const PIN_VH = OWN_STORY_VH + HELD_VH;
const STORY = OWN_STORY_VH / PIN_VH;

export default function CabinetAnatomy() {
  const { mode } = useMotion();
  // This section keeps scroll-scrub on mobile/tablet ("light" mode) per its own brief — only
  // reduced-motion ("static") disables pinning, unlike sibling scenes which are cinematic-only.
  const scrubbing = mode !== "static";
  const root = useRef(null);
  const videoRef = useRef(null);
  const staticVideoRef = useRef(null);
  const [nearViewport, setNearViewport] = useState(false);

  // Reduced motion: seek the static video to its last frame once ready. A plain ref + effect +
  // addEventListener, not the onLoadedMetadata JSX prop — that synthetic handler was observed to
  // silently never fire for this element in testing (readyState reached 4, the prop never ran).
  useEffect(() => {
    if (scrubbing) return;
    const v = staticVideoRef.current;
    if (!v) return;
    const seekToEnd = () => {
      if (v.duration) v.currentTime = v.duration;
    };
    if (v.readyState >= 1) {
      seekToEnd();
      return;
    }
    v.addEventListener("loadedmetadata", seekToEnd);
    return () => v.removeEventListener("loadedmetadata", seekToEnd);
  }, [scrubbing]);

  // Defer the ~4.6MB video fetch until the section is close to the viewport.
  useEffect(() => {
    if (!root.current || nearViewport) return;
    const io = new IntersectionObserver(([entry]) => entry.isIntersecting && setNearViewport(true), {
      rootMargin: "800px 0px 800px 0px",
    });
    io.observe(root.current);
    return () => io.disconnect();
  }, [nearViewport]);

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

      // Core mechanic: scroll progress maps directly onto video.currentTime across the story span.
      tl.fromTo(video, { currentTime: 0 }, { currentTime: () => video.duration || 0, duration: STORY }, 0);

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

      // Component list: real text (not burned into the video), highlighted one at a time across
      // the video's final quarter, evenly spaced to roughly track the exploded-view label reveal.
      const items = $("comp-item");
      const labelSpan = STORY - P(LABELS_AT);
      items.forEach((item, i) => {
        const at = P(LABELS_AT) + (labelSpan / items.length) * i;
        if (i > 0) tl.to(items[i - 1], { opacity: 0.55, x: 0, duration: 0.02 }, at);
        tl.to(item, { opacity: 1, x: 4, duration: 0.02 }, at);
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
    // prefers-reduced-motion: final exploded-view frame, statically, no pin, no scrub.
    return (
      <section className="relative bg-night text-bone">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16 lg:flex-row lg:items-center">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg lg:flex-[1.4]">
            <video ref={staticVideoRef} muted playsInline preload="metadata" src={videoSrc} className="h-full w-full object-cover" />
          </div>
          <div className="lg:w-[22rem]">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-bone/60">Cabinet Safety Systems</p>
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm lg:grid-cols-1 lg:gap-y-3">
              {COMPONENTS.map((name) => (
                <li key={name} className="flex items-center gap-2 text-bone/85">
                  <span aria-hidden="true" className="h-1 w-1 shrink-0 rounded-full bg-signal" />
                  {name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={root} className="relative z-10 h-[400vh] bg-night text-bone">
      <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden lg:flex-row">
        <div
          data-a="vignette"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10"
          style={{ background: "radial-gradient(65% 65% at 32% 50%, transparent 25%, var(--color-night) 100%)" }}
        />

        {/* Video panel */}
        <div className="relative flex-1 lg:flex-[1.4]">
          <video
            ref={videoRef}
            muted
            playsInline
            preload={nearViewport ? "auto" : "none"}
            src={nearViewport ? videoSrc : undefined}
            className="absolute inset-0 h-full w-full object-cover"
          />

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

        {/* Component list panel */}
        <div className="relative z-10 flex flex-col justify-center border-t border-bone/10 bg-night/70 px-6 py-6 lg:w-[22rem] lg:border-l lg:border-t-0 lg:px-8 lg:py-0">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-bone/60">Cabinet Safety Systems</p>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:text-sm lg:mt-6 lg:grid-cols-1 lg:gap-y-3">
            {COMPONENTS.map((name) => (
              <li key={name} data-a="comp-item" className="flex items-center gap-2 text-bone/55 will-change-transform">
                <span aria-hidden="true" className="h-1 w-1 shrink-0 rounded-full bg-signal" />
                {name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
