import { useEffect, useLayoutEffect, useRef, useState } from "react";
import HomeHeroCopy from "./HomeHeroCopy";
import videoSrc from "../assets/products/nexera-hero-cabinet.mp4";
import closeSrc from "../assets/products/nexera-hero-cabinet-close.mp4";
import posterSrc from "../assets/products/nexera-hero-cabinet-poster.webp";

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
 */
function Callouts({ show, animate, onActive }) {
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

  const on = Boolean(show && layout);
  // Drop any highlight when the labels go away (e.g. the cabinet starts to close under the cursor).
  useEffect(() => {
    if (!on) {
      setActive(null);
      onActive(null);
    }
  }, [on, onActive]);

  const hover = (i) => {
    if (!on) return;
    setActive(i);
    onActive(i);
  };

  // Transition for one property group: in with its own delay/duration, out together in OUT ms.
  const tr = (props, delay, duration) =>
    animate
      ? on
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
            opacity: on && active === i ? 1 : 0,
            background: "radial-gradient(closest-side, rgba(144,217,136,0.22), rgba(144,217,136,0.07) 55%, transparent)",
          }}
        />
      ))}

      {layout && (
        <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox={`0 0 ${layout.W} ${layout.H}`} aria-hidden="true">
          {layout.lines.map((pts, i) => {
            const len = layout.lengths[i];
            const hot = active === i;
            return (
              <polyline
                key={CALLOUTS[i].label}
                points={pts.map((pt) => pt.join(",")).join(" ")}
                fill="none"
                stroke={hot ? "rgba(144,217,136,0.9)" : "rgba(244,247,244,0.5)"}
                strokeWidth={hot ? 1.5 : 1}
                strokeDasharray={len}
                style={{
                  opacity: on ? 1 : 0,
                  // Drawn from the anchor outward; reset only once it has faded out.
                  strokeDashoffset: on || !animate ? 0 : len,
                  ...(animate && on
                    ? { transition: `stroke-dashoffset ${LINE_IN}ms cubic-bezier(0.22, 1, 0.36, 1) ${i * STAGGER + LINE_DELAY}ms, opacity 0ms ${i * STAGGER + LINE_DELAY}ms, stroke 200ms, stroke-width 200ms` }
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
          const base = i * STAGGER;
          // Chips slide in from the side their leader arrives from.
          const from = zone === "right" ? "translateX(-6px)" : zone === "floor" ? "translateY(5px)" : "translateY(-5px)";
          return (
            <li key={label}>
              {/* Dot + enlarged invisible hit area */}
              <span
                onPointerEnter={() => hover(i)}
                onPointerLeave={() => hover(null)}
                className={`absolute grid h-7 w-7 -translate-x-1/2 -translate-y-1/2 place-items-center ${on ? "pointer-events-auto cursor-default" : ""}`}
                style={{ left: `${ax}%`, top: `${ay}%` }}
              >
                {/* outer: staggered entrance; inner: hover response (no entrance delay) */}
                <span
                  className="relative h-[7px] w-[7px]"
                  style={{ opacity: on ? 1 : 0, transform: on ? "none" : "scale(0.4)", ...tr("opacity, transform", base, DOT_IN) }}
                >
                  <span
                    className="relative block h-full w-full transition-transform duration-200"
                    style={{ transform: hot ? "scale(1.45)" : "none" }}
                  >
                    {on && animate && (
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
                className={`absolute left-0 top-0 ${on ? "pointer-events-auto cursor-default" : ""}`}
                style={{ maxWidth: `${w}%`, transform: p ? `translate(${p.x}px, ${p.y}px)` : undefined }}
              >
                <span className="block" style={{ opacity: on ? 1 : 0, transform: on ? "none" : from, ...tr("opacity, transform", base + CHIP_DELAY, CHIP_IN) }}>
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
 * DEPTH — a soft light behind the stage and a contact shadow under it (both outside the footage),
 * a light vignette at the stage edges, and a small pointer parallax on desktop: the product follows
 * the pointer by up to 6px and the backdrop by up to 3px the other way. It is CSS-transition driven
 * (the pointer handler only writes two custom properties, at most once per frame), so there is no
 * running animation loop; it is off for touch and reduced motion.
 */
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
    if (!o || !c || busy.current) return;
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

  // Autoplay: the first cycle runs once by itself when the stage is half in view.
  useEffect(() => {
    const o = opening.current;
    if (!o) return;
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
  }, []);

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
    <section ref={section} className="relative overflow-hidden bg-night text-white">
      {/* Atmosphere: a graphite lift from the top left, a faint engineering grid, and a fall-off into
          the deeper ground at the bottom. It drifts slightly against the product for depth. */}
      <div aria-hidden="true" className="pointer-events-none absolute -inset-4" style={parallax ? drift(-3, -2) : undefined}>
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

      <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-6 py-14 lg:min-h-[max(34rem,calc(100svh-4rem))] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-12 lg:py-16">
        <HomeHeroCopy parallax={parallax} subdued={phase === "scan" || phase === "open"} />

        {/* Product: parallax layer -> lifted frame (light behind, contact shadow under) -> stage. */}
        <div style={parallax ? drift(6, 5) : undefined}>
          <div className="relative mx-auto w-full max-w-xl lg:max-w-none lg:-translate-y-[8vh]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-[14%]"
              style={{
                background:
                  "radial-gradient(50% 50% at 50% 52%, rgba(144,217,136,0.10), rgba(144,217,136,0.035) 45%, transparent 72%)",
              }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-[10%] -bottom-7 h-12 rounded-[100%] bg-black/55 blur-2xl"
            />

            {/* Stage: the footage's own graphite ground (#161D1F), framed as a deliberate panel. */}
            <div
              onPointerEnter={(e) => e.pointerType !== "touch" && runCycle()}
              onPointerUp={(e) => e.pointerType === "touch" && runCycle()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  runCycle();
                }
              }}
              tabIndex={0}
              aria-label="Product view. Hover, tap or press Enter to open the cabinet and show its protection components."
              className="relative aspect-[65/54] w-full overflow-hidden rounded-2xl bg-[#161D1F] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.75)] ring-1 ring-white/10 outline-none focus-visible:ring-2 focus-visible:ring-signal/70"
            >
              <video
                ref={opening}
                src={videoSrc}
                poster={posterSrc}
                muted
                playsInline
                preload="auto"
                aria-label="NEXERA battery energy storage cabinet opening to reveal its stacked battery modules and power electronics"
                className="h-full w-full object-contain transition-opacity duration-300"
              />
              {/* The closing clip sits exactly over the opening one and is only made visible while it plays. */}
              <video
                ref={closing}
                src={closeSrc}
                muted
                playsInline
                preload="none"
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 h-full w-full object-contain opacity-0"
              />
              {/* Depth: a light vignette at the panel edges; the cabinet in the centre is untouched. */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{ background: "radial-gradient(75% 70% at 50% 52%, transparent 60%, rgba(3,16,13,0.35) 100%)" }}
              />
              {/* One soft light sweep across the cabinet (its bounding box) as it settles open. */}
              {!reduced && (phase === "scan" || phase === "open") && (
                <div
                  key={cycle}
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
              <Callouts show={phase === "open"} animate={!reduced} onActive={onActive} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
