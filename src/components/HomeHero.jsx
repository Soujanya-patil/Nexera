import { useEffect, useLayoutEffect, useRef, useState } from "react";
import HomeHeroCopy from "./HomeHeroCopy";
import videoSrc from "../assets/products/nexera-hero-cabinet.mp4";
import closeSrc from "../assets/products/nexera-hero-cabinet-close.mp4";
import posterSrc from "../assets/products/nexera-hero-cabinet-poster.webp";
import scrubSrc from "../assets/products/nexera-hero-cabinet-scrub.mp4";
import { useMediaQuery } from "../lib/scrollSteps";
import { loadGsap } from "../lib/motion";
import { getLenis } from "../lib/lenis";

/*
 * Callouts for the held final (open-cabinet) frame of nexera-hero-cabinet.mp4, using the exact
 * terminology of the OEM "Protection Architecture" slide for this cabinet design (TCL-branded;
 * Downloads/hithium_protection_with_labels.png). Each label is placed on the same physical part the
 * slide's leader points to, found in the video's final frame. Anchors are percentages of the video
 * frame, which the stage maps 1:1 (same 1040x864 aspect, object-contain); the door fans, the red
 * unit and the module fitting are pixel centroids of that part in the final frame.
 *
 *   Aerosol Fire Suppression     red unit on the inside of the door (upper)
 *   Exhaust Valve                upper black fan on the door
 *   Intake Valve                 lower black fan on the door
 *   Pack Explosion Relief Valve  white round fitting under a module's orange connector (4th module,
 *                                the one the slide points to)
 *   Pack-level Fire Protection   face of that same module, as on the slide
 *
 * Not placed, because the final frame gives no visual evidence of them: in this shot the top module
 * sits against the cabinet's top rail and the camera is level with the roof, so the ceiling-mounted
 * Smoke Detector, Temperature Sensor and Combustible Gas Detector, the Water Fire Protection System
 * pipe and the roof Explosion Vent are all out of view. PCS, EMS and Thermal Management are not
 * located by any reference.
 *
 * Chips live only where the frame has no cabinet: the band above it (`top`, placed at `x`% from
 * the left), the column to its right (`right`, stacked by lane), and the floor under the door
 * (`floor`); `w` caps a chip's width (% of the stage) so it stays inside its free area. Right-column
 * leaders run in their own `lane` (default: the anchor's height) to a bus just past the cabinet
 * edge, then out to the chip. Lanes and chips share one order, so nothing crosses.
 */
const CALLOUTS = [
  { label: "Exhaust Valve", anchor: [14.8, 28.9], zone: "top", x: 3, w: 22 },
  { label: "Aerosol Fire Suppression", anchor: [26.8, 28.5], zone: "top", x: 27.5, w: 36 },
  { label: "Pack-level Fire Protection", anchor: [38.5, 50.5], zone: "right", w: 24 },
  // Drops to the seam under the 4th module first, so its lane clears the Pack-level dot beside it.
  { label: "Pack Explosion Relief Valve", anchor: [30.3, 51.8], zone: "right", lane: 55.5, w: 24 },
  { label: "Intake Valve", anchor: [14.7, 57.0], zone: "floor", w: 19 },
];

// Free areas of the final frame, as fractions of the stage. The cabinet body ends at x ~0.72 and
// its top at y ~0.15; the door's lower edge is at y ~0.87 and the pulled-out rack starts at x ~0.23.
const EDGE = 0.03;
const FLOOR_BOTTOM = 0.985;
const BUS = 0.705; // x where right-column leaders leave their lane and fan out to their chip
const GAP = 6; // px between stacked chips

/** Places every chip from its measured size and returns chip positions and leader polylines (px). */
function layoutCallouts(W, H, sizes) {
  const pos = [];
  const right = [];
  CALLOUTS.forEach((c, i) => {
    const { w, h } = sizes[i];
    if (c.zone === "top") pos[i] = { x: W * (c.x / 100), y: H * EDGE };
    else if (c.zone === "floor") pos[i] = { x: W * EDGE, y: H * FLOOR_BOTTOM - h };
    else {
      pos[i] = { x: W * (1 - EDGE) - w, y: 0 };
      right.push(i);
    }
  });

  // Right column: aim each chip's centre at its lane, then resolve collisions within
  // [EDGE, 1 - EDGE] — first pushing down, then (if the stack overruns the bottom) back up.
  const lane = (c) => c.lane ?? c.anchor[1];
  right.sort((a, b) => lane(CALLOUTS[a]) - lane(CALLOUTS[b]));
  const top = H * EDGE;
  const bottom = H * (1 - EDGE);
  right.forEach((i) => (pos[i].y = H * (lane(CALLOUTS[i]) / 100) - sizes[i].h / 2));
  let cursor = top;
  for (const i of right) {
    pos[i].y = Math.max(pos[i].y, cursor);
    cursor = pos[i].y + sizes[i].h + GAP;
  }
  cursor = bottom;
  for (const i of [...right].reverse()) {
    pos[i].y = Math.min(pos[i].y, cursor - sizes[i].h);
    cursor = pos[i].y - GAP;
  }

  const lines = CALLOUTS.map((c, i) => {
    const ax = W * (c.anchor[0] / 100);
    const ay = H * (c.anchor[1] / 100);
    const { x, y } = pos[i];
    const { w, h } = sizes[i];
    if (c.zone === "right") {
      const ly = H * (lane(c) / 100);
      const run = ly === ay ? [[ax, ay]] : [[ax, ay], [ax, ly]];
      return [...run, [W * BUS, ly], [x, y + h / 2]];
    }
    // Above/below the cabinet: run vertically from the anchor, then across to the chip if needed.
    const edgeY = c.zone === "top" ? y + h : y;
    if (ax >= x && ax <= x + w) return [[ax, ay], [ax, edgeY]];
    const cy = y + h / 2;
    return [[ax, ay], [ax, cy], [ax < x ? x : x + w, cy]];
  });
  return { pos, lines };
}

// Label choreography (ms). Each label runs dot -> leader line -> chip; labels follow each other at
// STAGGER. Out is one quick fade for everything together, so the layer never half-clears.
const STAGGER = 150;
const DOT_IN = 250;
const LINE_DELAY = 100;
const LINE_IN = 450;
const CHIP_DELAY = 350;
const CHIP_IN = 300;
const OUT = 200;

const polylineLength = (pts) =>
  pts.slice(1).reduce((sum, [x, y], k) => sum + Math.hypot(x - pts[k][0], y - pts[k][1]), 0);

/**
 * Technical-diagram overlay for the held open frame: green anchor dots (with a slow breathing ring),
 * leader lines that draw outward from the component, and small near-black label chips that fade and
 * slide in, one label after another. Hovering a dot or its chip highlights that callout — brighter
 * dot, stronger line, lifted chip — and lays a soft green glow over the component (an overlay only;
 * the video itself is never filtered or transformed). `onActive` reports the hovered index so the
 * cycle can keep the labels up while someone is reading one. On phones chips wrap in a narrower
 * column.
 *
 * Two ways in: `show` brings every label in as one staggered sequence (the autoplay / tap cycle);
 * `count` shows the first `count` labels, each drawing in the moment it is added (the desktop scroll
 * story, where the scroll position decides how many are up).
 */
function Callouts({ show, count, animate, onActive }) {
  const root = useRef(null);
  const chips = useRef([]);
  const [layout, setLayout] = useState(null);
  const [active, setActive] = useState(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const measure = () => {
      const W = el.clientWidth;
      const H = el.clientHeight;
      if (!W || !H) return;
      const sizes = chips.current.map((c) => ({ w: c.offsetWidth, h: c.offsetHeight }));
      const { pos, lines } = layoutCallouts(W, H, sizes);
      setLayout({ W, H, pos, lines, lengths: lines.map(polylineLength) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    chips.current.forEach((c) => ro.observe(c));
    document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, []);

  const n = count ?? (show ? CALLOUTS.length : 0);
  const on = Boolean(layout && n > 0);
  const vis = (i) => on && i < n;
  // Sequenced entrance for the cycle; labels added by scroll draw in at once.
  const delayOf = (i) => (count == null ? i * STAGGER : 0);
  // Drop any highlight when the labels go away (e.g. the cabinet starts to close under the cursor).
  useEffect(() => {
    if (!on) {
      setActive(null);
      onActive(null);
    }
  }, [on, onActive]);

  const hover = (i) => {
    if (!on || (i !== null && !vis(i))) return;
    setActive(i);
    onActive(i);
  };

  // Transition for one property group: in with its own delay/duration, out together in OUT ms.
  const tr = (visible, props, delay, duration) =>
    animate
      ? visible
        ? { transitionProperty: props, transitionDuration: `${duration}ms`, transitionDelay: `${delay}ms`, transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }
        : { transitionProperty: "opacity", transitionDuration: `${OUT}ms`, transitionDelay: "0ms" }
      : { transition: "none" };

  return (
    <div ref={root} aria-hidden={!on} className="pointer-events-none absolute inset-0">
      {/* Soft green light over the hovered component */}
      {CALLOUTS.map(({ label, anchor: [ax, ay] }, i) => (
        <span
          key={`glow-${label}`}
          className="absolute aspect-square w-[16%] -translate-x-1/2 -translate-y-1/2 rounded-full transition-opacity duration-300"
          style={{
            left: `${ax}%`,
            top: `${ay}%`,
            opacity: vis(i) && active === i ? 1 : 0,
            background: "radial-gradient(closest-side, rgba(144,217,136,0.22), rgba(144,217,136,0.07) 55%, transparent)",
          }}
        />
      ))}

      {layout && (
        <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox={`0 0 ${layout.W} ${layout.H}`} aria-hidden="true">
          {layout.lines.map((pts, i) => {
            const len = layout.lengths[i];
            const hot = active === i;
            const shown = vis(i);
            const d = delayOf(i);
            return (
              <polyline
                key={CALLOUTS[i].label}
                points={pts.map((pt) => pt.join(",")).join(" ")}
                fill="none"
                stroke={hot ? "rgba(144,217,136,0.9)" : "rgba(244,247,244,0.5)"}
                strokeWidth={hot ? 1.5 : 1}
                strokeDasharray={len}
                style={{
                  opacity: shown ? 1 : 0,
                  // Drawn from the anchor outward; reset only once it has faded out.
                  strokeDashoffset: shown || !animate ? 0 : len,
                  ...(animate && shown
                    ? { transition: `stroke-dashoffset ${LINE_IN}ms cubic-bezier(0.22, 1, 0.36, 1) ${d + LINE_DELAY}ms, opacity 0ms ${d + LINE_DELAY}ms, stroke 200ms, stroke-width 200ms` }
                    : animate
                      ? { transition: `opacity ${OUT}ms, stroke-dashoffset 0ms ${OUT}ms` }
                      : {}),
                }}
              />
            );
          })}
        </svg>
      )}

      <ul aria-label="Cabinet protection components">
        {CALLOUTS.map(({ label, detail, anchor: [ax, ay], zone, w }, i) => {
          const p = layout?.pos[i];
          const hot = active === i;
          const shown = vis(i);
          const base = delayOf(i);
          // Chips slide in from the side their leader arrives from.
          const from = zone === "right" ? "translateX(-6px)" : zone === "floor" ? "translateY(5px)" : "translateY(-5px)";
          return (
            <li key={label}>
              {/* Dot + enlarged invisible hit area */}
              <span
                onPointerEnter={() => hover(i)}
                onPointerLeave={() => hover(null)}
                className={`absolute grid h-7 w-7 -translate-x-1/2 -translate-y-1/2 place-items-center ${shown ? "pointer-events-auto cursor-default" : ""}`}
                style={{ left: `${ax}%`, top: `${ay}%` }}
              >
                {/* outer: staggered entrance; inner: hover response (no entrance delay) */}
                <span
                  className="relative h-[7px] w-[7px]"
                  style={{ opacity: shown ? 1 : 0, transform: shown ? "none" : "scale(0.4)", ...tr(shown, "opacity, transform", base, DOT_IN) }}
                >
                  <span
                    className="relative block h-full w-full transition-transform duration-200"
                    style={{ transform: hot ? "scale(1.45)" : "none" }}
                  >
                    {shown && animate && (
                      <span className="animate-hotspot-pulse absolute inset-0 rounded-full bg-signal" style={{ animationDelay: `${base}ms` }} />
                    )}
                    <span
                      className={`relative block h-full w-full rounded-full bg-signal ring-2 transition-shadow duration-200 ${
                        hot ? "shadow-[0_0_10px_2px_rgba(144,217,136,0.55)] ring-signal/35" : "ring-deep/70"
                      }`}
                    />
                  </span>
                </span>
              </span>

              {/* Chip: outer span is positioned (measured), inner span animates */}
              <span
                ref={(el) => (chips.current[i] = el)}
                onPointerEnter={() => hover(i)}
                onPointerLeave={() => hover(null)}
                className={`absolute left-0 top-0 ${shown ? "pointer-events-auto cursor-default" : ""}`}
                style={{ maxWidth: `${w}%`, transform: p ? `translate(${p.x}px, ${p.y}px)` : undefined }}
              >
                <span className="block" style={{ opacity: shown ? 1 : 0, transform: shown ? "none" : from, ...tr(shown, "opacity, transform", base + CHIP_DELAY, CHIP_IN) }}>
                  <span
                    className={`block rounded-[3px] border px-1.5 py-1 leading-tight backdrop-blur-sm transition-[background-color,border-color,box-shadow] duration-200 sm:px-2 ${
                      hot ? "border-signal/45 bg-[#0a241d]/90 shadow-[0_0_14px_-2px_rgba(144,217,136,0.35)]" : "border-white/15 bg-deep/85"
                    }`}
                  >
                    <span
                      className={`block text-[0.5625rem] font-semibold uppercase tracking-[0.04em] transition-colors duration-200 sm:text-[0.625rem] sm:tracking-[0.06em] ${hot ? "text-white" : "text-ice"}`}
                    >
                      {label}
                    </span>
                    {detail && <span className="mt-0.5 hidden text-[0.5625rem] leading-snug text-ice/60 sm:block">{detail}</span>}
                  </span>
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// Labels are fully drawn ~1.25s after they start; 3.6s leaves all of them legible together ~2.3s.
const HOLD_MS = 3600;
const HOLD_MAX_MS = HOLD_MS + 4000; // hovering a hotspot can extend the hold by at most 4s
const SCAN_LEAD_MS = 450; // the sweep starts; the labels begin drawing this much later
const LABEL_FADE_MS = OUT + 50; // labels are gone before the cabinet starts to close
const CLOSE_RATE = 2; // the close runs in ~3.4s rather than the opening's 6.8s

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const once = (el, type) => new Promise((resolve) => el.addEventListener(type, resolve, { once: true }));
const seek = (el, t) => {
  const done = once(el, "seeked");
  el.currentTime = t;
  return done;
};
/** Resolves once `el` can play, or after `ms` — whichever comes first — with whether it can. */
const ready = (el, ms) =>
  el.readyState >= 3
    ? Promise.resolve(true)
    : Promise.race([once(el, "canplaythrough").then(() => true), sleep(ms).then(() => el.readyState >= 3)]);

/**
 * Home hero, per the approved mockup: copy on the left, the product on the right (stacked below the
 * copy on phones).
 *
 * VIDEO — two clips cut from the same source footage (nexera-battery-cabinet-scroll.mp4) with the
 * identical trim (1.5-8.3s) and crop (x 320-1620 of the 1920 frame, which removes the footage's
 * baked-in corner logo and the generator watermark), each ~0.9MB:
 *   nexera-hero-cabinet.mp4        closed -> door opens -> interior (the opening)
 *   nexera-hero-cabinet-close.mp4  the same 164 frames in reverse (the closing)
 * A browser can't play an MP4 backwards (negative playbackRate is unsupported), and the opening
 * clip has a single keyframe, so stepping it backwards by seeking would stutter; the closing clip
 * gives a true full-frame-rate close instead. Its first frame is the opening's last frame and its
 * last frame is the opening's first, so both hand-offs between the clips are invisible. The cabinet
 * door carries the NEXERA mark, so no logo is overlaid. Both are shown uncropped (`object-contain`
 * in a stage locked to the clips' own aspect), and nothing ever filters or transforms the footage.
 *
 * CYCLE — closed -> opening -> scan -> labels (held) -> labels out -> closing -> closed:
 *   1. Autoplay: the first cycle starts by itself when the stage is half in view (muted + inline +
 *      preload, started programmatically so it waits until it is actually visible). If the browser
 *      refuses, the closed cabinet simply stays until the first interaction.
 *   2. Afterwards a mouse/pen pointer ENTERING the stage starts a cycle; touch taps the stage;
 *      keyboard focuses it and presses Enter/Space. Triggers are ignored until a cycle has fully
 *      returned to closed (`busy`), and only an entry counts: a pointer that stays on, or moves
 *      within, the stage never restarts it — it has to leave and come back.
 *   3. On the open frame a single soft light sweep crosses the cabinet, then the labels draw in.
 *   4. They hold for HOLD_MS. While a hotspot is hovered the countdown pauses (capped at
 *      HOLD_MAX_MS in total), so a label isn't pulled away mid-read, but the cabinet is never left
 *      open indefinitely.
 *   5. The labels fade out, the closing clip takes over on the identical open frame, and the cycle
 *      ends on the identical closed frame.
 *   prefers-reduced-motion: no movement at all — no sweep, pulse, draw-in or parallax. A cycle cuts
 *   straight to the open frame with the labels, holds, then cuts back to the closed frame.
 *
 * SET INTO THE HERO, NOT FRAMED — the footage has no panel: its edges are masked soft (EDGE_MASK) and
 * a wide ambient field behind it continues the footage's graphite ground out into the hero, fading to
 * the dark green (faintly behind the headline too), with a soft green light at the product. On wide
 * screens the product reaches into the page margin, so it reads larger; it enters with the headline.
 *
 * DEPTH — the ambient field and a contact shadow (outside the footage), a light green-black vignette
 * at the footage edges, and a small pointer parallax on desktop: the product follows
 * the pointer by up to 6px and the backdrop by up to 3px the other way. It is CSS-transition driven
 * (the pointer handler only writes two custom properties, at most once per frame), so there is no
 * running animation loop; it is off for touch and reduced motion.
 */
// Soft edges for the footage so it dissolves into the hero instead of ending at a frame. Two linear
// ramps intersected: 7% on the left (the open door reaches ~8%), 13% at the top (lifting eyes at ~15%),
// 16% on the right (empty ground) and 10% at the bottom (feet at ~90%) — the cabinet is never faded.
const RAMP_X = "linear-gradient(to right, transparent 0%, #000 7%, #000 84%, transparent 100%)";
const RAMP_Y = "linear-gradient(to bottom, transparent 0%, #000 13%, #000 90%, transparent 100%)";
const EDGE_MASK = {
  maskImage: `${RAMP_X}, ${RAMP_Y}`,
  maskComposite: "intersect",
  WebkitMaskImage: `${RAMP_X}, ${RAMP_Y}`,
  WebkitMaskComposite: "source-in",
};

/*
 * SCROLL STORY (desktop, motion allowed) — the hero pins for STORY_VH of scrolling and the product
 * tells the story; one ScrollTrigger progress p (0…1) drives everything, so it reverses exactly:
 *
 *   p 0.00–0.08  01 INTRO    closed cabinet, the copy leads
 *   p 0.08–0.40  02 REVEAL   the real opening footage is scrubbed by scroll; the copy recedes, the
 *                            product grows and moves toward the centre
 *   p 0.40–0.50  03 EXPLORE  open cabinet held: battery modules and power electronics; one light sweep
 *   p 0.50–0.76  04 SAFETY   the five verified protection labels appear one by one (LABEL_AT)
 *   p 0.76–1.00  05 SYSTEM   the complete open system; then the labels clear (0.86), the footage
 *                            scrubs back to the closed cabinet (0.88–0.98) and the copy returns — the
 *                            section releases on the clean hero state, into the stat bar.
 *
 * The footage is nexera-hero-cabinet-scrub.mp4: the same 164 frames as the opening clip, re-encoded
 * with a keyframe every 6 frames (SSIM 0.993 to the original) so a seek decodes at most 6 frames —
 * the single-keyframe original cannot be scrubbed smoothly. It replaces the opening + closing clips
 * on desktop (1.75 MB vs 1.88 MB), so the page is no heavier. Seeks are coalesced: a new time is only
 * set once the previous seek has landed.
 */
const STORY_Q = "(min-width: 1024px) and (min-height: 640px) and (prefers-reduced-motion: no-preference)";
const STORY_VH = 300;
const STAGES = [
  { label: "Intro", at: 0, caption: "NEXERA battery energy storage cabinet — scroll to explore" },
  { label: "Reveal", at: 0.08, caption: "The cabinet opens" },
  { label: "Explore", at: 0.4, caption: "Stacked battery modules and power electronics" },
  { label: "Safety", at: 0.5, caption: "Protection components, named as in the OEM protection architecture" },
  { label: "System", at: 0.76, caption: "Storage, power electronics and protection in one cabinet" },
];
const LABEL_AT = [0.52, 0.565, 0.61, 0.655, 0.7];
const LABELS_OUT = 0.86;
const ramp = (p, a, b) => Math.max(0, Math.min(1, (p - a) / (b - a)));
const smooth = (t) => t * t * (3 - 2 * t);
/** How far the copy has stepped back for the product (0 = hero, 1 = product-led). */
const recedeAt = (p) => smooth(ramp(p, 0.08, 0.3)) * (1 - smooth(ramp(p, 0.86, 0.97)));
/** Footage time for progress p: opens over REVEAL, holds, closes again at the end. */
const footageAt = (p, d) => d * (smooth(ramp(p, 0.08, 0.4)) * (1 - smooth(ramp(p, 0.88, 0.98))));
const labelsAt = (p) => (p >= LABELS_OUT ? 0 : LABEL_AT.filter((a) => p >= a).length);
const stageAt = (p) => STAGES.reduce((k, s, i) => (p >= s.at ? i : k), 0);

export default function HomeHero() {
  const section = useRef(null);
  const opening = useRef(null);
  const closing = useRef(null);
  const [reduced] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [parallax] = useState(
    () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches && window.matchMedia("(hover: hover) and (pointer: fine)").matches
  );
  const [phase, setPhase] = useState("closed"); // closed | opening | scan | open | closing
  const [cycle, setCycle] = useState(0); // remounts the sweep each cycle
  // Synchronous "a cycle is running" flag: several pointer events can land in the same tick,
  // before React re-renders `phase`; this makes every one after the first a no-op.
  const busy = useRef(false);
  const alive = useRef(true);
  const reading = useRef(false); // a hotspot is hovered
  const story = useMediaQuery(STORY_Q);
  const [storyStage, setStoryStage] = useState(0);
  const [storyLabels, setStoryLabels] = useState(0);
  const [inspect, setInspect] = useState(false);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const onActive = useRef((i) => {
    reading.current = i !== null;
  }).current;

  /** Holds the open state for HOLD_MS of un-hovered time, never longer than HOLD_MAX_MS overall. */
  const hold = async () => {
    const start = performance.now();
    let last = start;
    let left = HOLD_MS;
    while (left > 0 && performance.now() - start < HOLD_MAX_MS && alive.current) {
      await sleep(100);
      const now = performance.now();
      if (!reading.current) left -= now - last;
      last = now;
    }
  };

  const runCycle = async () => {
    const o = opening.current;
    const c = closing.current;
    if (story || !o || !c || busy.current) return;
    busy.current = true;
    try {
      if (reduced) {
        if (o.readyState < 1) await once(o, "loadedmetadata"); // autoplay can fire before the duration is known
        await seek(o, Math.max(0, o.duration - 0.001));
        if (!alive.current) return;
        setPhase("open");
        await hold();
        if (!alive.current) return;
        setPhase("closing");
        await seek(o, 0);
        return;
      }

      // Fetch the closing clip on the first cycle; it has the whole opening to arrive.
      if (c.readyState === 0) {
        c.preload = "auto";
        c.load();
      }
      if (o.currentTime !== 0) await seek(o, 0);
      setPhase("opening");
      const opened = once(o, "ended");
      await o.play();
      await opened;
      if (!alive.current) return;

      setCycle((n) => n + 1);
      setPhase("scan");
      await sleep(SCAN_LEAD_MS);
      if (!alive.current) return;
      setPhase("open");
      await hold();
      if (!alive.current) return;
      setPhase("closing"); // labels fade out while the open frame is still held
      await sleep(LABEL_FADE_MS);

      if (await ready(c, 4000)) {
        c.playbackRate = CLOSE_RATE;
        if (c.currentTime !== 0) await seek(c, 0);
        const closed = once(c, "ended");
        await c.play();
        c.style.opacity = "1"; // its first frame is the held open frame: no visible change
        await seek(o, 0); // hidden underneath: rewind the opening to the closed frame
        await closed;
        if (!alive.current) return;
        c.style.opacity = "0"; // its last frame is that same closed frame
        await sleep(50);
        c.currentTime = 0;
      } else {
        // Closing clip unavailable (network): dissolve back to the closed frame instead of cutting.
        o.style.opacity = "0";
        await sleep(300);
        await seek(o, 0);
        o.style.opacity = "1";
        await sleep(300);
      }
    } catch {
      // Playback refused (e.g. autoplay blocked) or failed part-way: return to the closed rest state.
      o.pause();
      c.pause();
      c.style.opacity = "0";
      o.style.opacity = "1";
      if (o.currentTime !== 0) o.currentTime = 0;
    } finally {
      busy.current = false;
      if (alive.current) setPhase("closed");
    }
  };

  // Autoplay: the first cycle runs once by itself when the stage is half in view (not in the scroll
  // story, where scrolling opens the cabinet).
  useEffect(() => {
    const o = opening.current;
    if (!o || story) return;
    o.muted = true;
    if (closing.current) closing.current.muted = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          io.disconnect();
          runCycle();
        }
      },
      { threshold: 0.5 }
    );
    io.observe(o);
    return () => io.disconnect();
  }, [story]);

  // Scroll story: pinned progress -> footage time, labels, stage, and two CSS variables the copy and
  // the product read (--story, --recede). React only re-renders when the stage or label count changes.
  useEffect(() => {
    const el = section.current;
    const v = opening.current;
    if (!story || !el || !v) return;
    let cancelled = false;
    let ctx;
    let want = 0;
    let seeking = false;
    const apply = () => {
      if (seeking || v.readyState < 1) return;
      const t = Math.min(want, v.duration - 0.001);
      if (Math.abs(v.currentTime - t) < 0.02) return;
      seeking = true;
      v.currentTime = t;
    };
    const onSeeked = () => {
      seeking = false;
      apply();
    };
    v.addEventListener("seeked", onSeeked);
    v.addEventListener("loadedmetadata", apply);
    loadGsap().then(({ gsap, ScrollTrigger }) => {
      if (cancelled) return;
      const update = (self) => {
        const p = self.progress;
        el.style.setProperty("--story", p.toFixed(4));
        el.style.setProperty("--recede", recedeAt(p).toFixed(4));
        want = footageAt(p, Number.isFinite(v.duration) ? v.duration : 6.83);
        apply();
        setStoryLabels(labelsAt(p));
        setStoryStage(stageAt(p));
      };
      ctx = gsap.context(() => {
        ScrollTrigger.create({ trigger: el, start: "top 64px", end: "bottom bottom", onUpdate: update, onRefresh: update });
      }, el);
    });
    return () => {
      cancelled = true;
      ctx?.revert();
      v.removeEventListener("seeked", onSeeked);
      v.removeEventListener("loadedmetadata", apply);
      el.style.removeProperty("--story");
      el.style.removeProperty("--recede");
    };
  }, [story]);

  /** Story navigation: glide the page to the start of stage `i` (a little into it). */
  const goToStage = (i) => {
    const el = section.current;
    if (!el) return;
    const at = i === 0 ? 0 : Math.min(0.99, STAGES[i].at + (i === 3 ? 0.2 : 0.06));
    const range = el.offsetHeight - (window.innerHeight - 64);
    const y = el.getBoundingClientRect().top + window.scrollY - 64 + at * range;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(y, { duration: 1.2 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  };

  // Pointer parallax (desktop only): write normalised pointer position as two custom properties,
  // at most once per frame; CSS transitions do the easing.
  useEffect(() => {
    const el = section.current;
    if (!el || !parallax) return;
    let raf = 0;
    let nx = 0;
    let ny = 0;
    const apply = () => {
      raf = 0;
      el.style.setProperty("--mx", nx.toFixed(3));
      el.style.setProperty("--my", ny.toFixed(3));
    };
    const onMove = (e) => {
      if (e.pointerType !== "mouse") return;
      const r = el.getBoundingClientRect();
      nx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
      ny = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      nx = 0;
      ny = 0;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [parallax]);

  const drift = (px, py) => ({
    transform: `translate3d(calc(var(--mx, 0) * ${px}px), calc(var(--my, 0) * ${py}px), 0)`,
    transition: "transform 900ms cubic-bezier(0.22, 1, 0.36, 1)",
  });

  return (
    <section
      ref={section}
      className={`relative bg-night text-white ${story ? "overflow-clip" : "overflow-hidden"}`}
      style={story ? { height: `calc(100svh - 4rem + ${STORY_VH}svh)` } : undefined}
    >
      <div className={story ? "sticky top-16 h-[calc(100svh-4rem)] overflow-clip" : undefined}>
      {/* Atmosphere: a graphite lift from the top left, a faint engineering grid, and a fall-off into
          the deeper ground at the bottom. It drifts slightly against the product for depth. */}
      <div aria-hidden="true" className="pointer-events-none absolute -inset-4" style={parallax ? drift(-2, -1.5) : undefined}>
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(55% 60% at 8% 0%, rgba(244,247,244,0.05), transparent 70%), linear-gradient(to bottom, transparent 55%, var(--color-deep))",
          }}
        />
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "linear-gradient(rgba(244,247,244,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(244,247,244,0.035) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(70% 80% at 70% 45%, #000, transparent 75%)",
            WebkitMaskImage: "radial-gradient(70% 80% at 70% 45%, #000, transparent 75%)",
          }}
        />
      </div>

      <div
        className={`relative mx-auto grid max-w-6xl items-center gap-8 px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-12 ${
          story ? "h-full pb-20 pt-10" : "py-14 lg:min-h-[max(34rem,calc(100svh-4rem))] lg:py-16"
        }`}
      >
        {/* Copy — in the story it steps back (fades, drifts left, settles smaller) while the product
            leads, and returns at the end. A wrapper of its own, so it never fights the copy's entrance. */}
        <div
          className="relative z-10"
          style={
            story
              ? {
                  opacity: "calc(1 - var(--recede, 0) * 0.55)",
                  transform: "translate3d(calc(var(--recede, 0) * -28px), 0, 0) scale(calc(1 - var(--recede, 0) * 0.05))",
                  transformOrigin: "left center",
                }
              : undefined
          }
        >
          <HomeHeroCopy parallax={parallax} story={story} subdued={!story && (phase === "scan" || phase === "open")} />
        </div>

        {/* Product, set into the hero rather than framed: parallax layer (wider than its column on wide
            screens, reaching into the page margin) -> entrance -> ambient field + stage. */}
        <div className="lg:w-[calc(100%+max(0px,(100vw-72rem)/2))]" style={parallax ? drift(6, 5) : undefined}>
          {/* Story: the product grows ~10% and moves toward the centre as the copy steps back. */}
          <div
            style={
              story
                ? { transform: "translate3d(calc(var(--recede, 0) * -8%), 0, 0) scale(calc(1 + var(--recede, 0) * 0.1))", transformOrigin: "50% 55%" }
                : undefined
            }
          >
          <div className="hero-product-in relative mx-auto w-full max-w-xl lg:max-w-none lg:-translate-y-[6vh]">
            {/* Ambient field: the footage's graphite ground continued out into the hero and fading to the
                dark green over a wide area (reaching faintly behind the headline), with a soft green
                light at the product. This is what lets the stage edge disappear. */}
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute -inset-x-[42%] -inset-y-[30%] transition-[opacity,filter] duration-700 ${inspect ? "brightness-125" : ""}`}
              style={{
                background:
                  "radial-gradient(34% 36% at 50% 52%, rgba(144,217,136,0.07), transparent 70%), radial-gradient(closest-side, rgba(22,29,30,0.92) 30%, rgba(16,28,26,0.55) 62%, rgba(7,26,23,0) 100%)",
              }}
            />
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-[22%] bottom-[4%] h-10 rounded-[100%] bg-black/40 blur-2xl" />

            {/* Stage: no panel — the footage's edges are masked soft (see EDGE_MASK), the labels, sweep
                and interaction layer sit unmasked on top. */}
            <div
              onPointerEnter={(e) => {
                if (e.pointerType === "mouse") setInspect(true);
                if (e.pointerType !== "touch") runCycle();
              }}
              onPointerLeave={() => setInspect(false)}
              onPointerMove={(e) => {
                if (!story || e.pointerType !== "mouse") return;
                const r = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty("--ix", `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
                e.currentTarget.style.setProperty("--iy", `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
              }}
              onPointerUp={(e) => e.pointerType === "touch" && runCycle()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (story) goToStage(3);
                  else runCycle();
                }
              }}
              tabIndex={0}
              aria-label={
                story
                  ? "Product view. Scroll to open the cabinet and show its protection components, or press Enter to go to them."
                  : "Product view. Hover, tap or press Enter to open the cabinet and show its protection components."
              }
              className={`group/stage relative aspect-[65/54] w-full rounded-lg outline-none transition-[scale] duration-700 ease-out focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal/60 ${
                story && inspect ? "scale-[1.01]" : ""
              }`}
            >
              <div className="absolute inset-0" style={EDGE_MASK}>
                <video
                  ref={opening}
                  src={story ? scrubSrc : videoSrc}
                  poster={posterSrc}
                  muted
                  playsInline
                  preload="auto"
                  aria-label="NEXERA battery energy storage cabinet opening to reveal its stacked battery modules and power electronics"
                  className="h-full w-full object-contain transition-opacity duration-300"
                />
                {/* The closing clip sits exactly over the opening one and is only made visible while it plays
                    (the cycle only; the story scrubs the footage back instead). */}
                {!story && (
                  <video
                    ref={closing}
                    src={closeSrc}
                    muted
                    playsInline
                    preload="none"
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 h-full w-full object-contain opacity-0"
                  />
                )}
                {/* Depth: the footage's edges lean toward the hero's green-black; the cabinet is untouched. */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0"
                  style={{ background: "radial-gradient(75% 70% at 50% 52%, transparent 60%, rgba(7,26,23,0.45) 100%)" }}
                />
              </div>
              {/* Inspection (story, mouse): a soft light follows the cursor over the cabinet. */}
              {story && (
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute inset-0 mix-blend-screen transition-opacity duration-500 ${inspect ? "opacity-100" : "opacity-0"}`}
                  style={{ background: "radial-gradient(22% 26% at var(--ix, 50%) var(--iy, 50%), rgba(244,247,244,0.07), rgba(144,217,136,0.04) 45%, transparent 75%)" }}
                />
              )}
              {/* One soft light sweep across the cabinet (its bounding box) as it settles open. */}
              {!reduced && (story ? storyStage === 2 : phase === "scan" || phase === "open") && (
                <div
                  key={story ? "story-sweep" : cycle}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-[5%] top-[14%] h-[82%] w-[68%] overflow-hidden"
                >
                  <div
                    className="animate-scan-sweep absolute inset-y-0 left-0 w-[22%] mix-blend-screen"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, rgba(244,247,244,0.05) 40%, rgba(144,217,136,0.14) 50%, rgba(244,247,244,0.05) 60%, transparent)",
                    }}
                  />
                </div>
              )}
              {story ? (
                <Callouts count={storyLabels} animate onActive={onActive} />
              ) : (
                <Callouts show={phase === "open"} animate={!reduced} onActive={onActive} />
              )}
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Story progress: five stages along a thin line (filled by --story), each a jump link, with the
          current stage's caption beside it. */}
      {story && (
        <div className="absolute inset-x-0 bottom-6 z-10">
          <div className="mx-auto flex max-w-6xl items-center gap-8 px-6">
            <div className="relative shrink-0">
              <span aria-hidden="true" className="absolute inset-x-0 -top-2 h-px bg-white/12" />
              <span aria-hidden="true" className="absolute inset-x-0 -top-2 h-px origin-left bg-signal/80" style={{ scale: "var(--story, 0) 1" }} />
            <ol className="flex items-center gap-6" aria-label="Product story">
              {STAGES.map((st, i) => {
                const on = i === storyStage;
                return (
                  <li key={st.label}>
                    <button
                      type="button"
                      onClick={() => goToStage(i)}
                      aria-current={on ? "step" : undefined}
                      className={`text-[0.625rem] font-semibold uppercase tracking-[0.18em] transition-colors duration-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal ${
                        on ? "text-white" : "text-ice/40 hover:text-ice/75"
                      }`}
                    >
                      <span className={on ? "text-signal" : undefined}>{String(i + 1).padStart(2, "0")}</span> {st.label}
                    </button>
                  </li>
                );
              })}
            </ol>
            </div>
            <p key={storyStage} className="journey-detail min-w-0 truncate text-xs text-ice/60" aria-live="polite">
              {STAGES[storyStage].caption}
            </p>
          </div>
        </div>
      )}
      </div>
    </section>
  );
}
