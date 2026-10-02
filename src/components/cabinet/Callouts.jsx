import { useEffect, useLayoutEffect, useRef, useState } from "react";

// Shared by the Home hero (autoplay cycle and scroll story) and the C&I page's "Inside the cabinet"
// section: the five verified protection labels and the overlay that draws them.

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
export const CALLOUTS = [
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
// Desktop (`compact`): the hero shows only the band from just above the cabinet to the open rack's
// lower edge (see .hero-product in index.css), so the top chips sit right above the lifting eyes
// (y 0.155) and everything else ends above the rack edge. Chips on the left start at the open door's
// edge (x 0.061), which is what the stage keeps clear of the copy.
const CAB_TOP = 0.155;
const DOOR_LEFT = 0.061;
const COMPACT_TOP = 0.12;
const COMPACT_BOTTOM = 0.93;
// The stage reaches past the viewport's right edge on desktop, so the right column ends this far
// inside the viewport instead (its leaders fan out from a bus just left of the chips).
const VIEW_MARGIN = 16;

/** Places every chip from its measured size and returns chip positions and leader polylines (px). */
function layoutCallouts(W, H, sizes, compact, rightEdge = W * (1 - EDGE)) {
  const pos = [];
  const right = [];
  CALLOUTS.forEach((c, i) => {
    const { w, h } = sizes[i];
    if (c.zone === "top") {
      pos[i] = compact
        ? { x: W * Math.max(c.x / 100, DOOR_LEFT), y: Math.max(H * EDGE, H * CAB_TOP - h - GAP) }
        : { x: W * (c.x / 100), y: H * EDGE };
    } else if (c.zone === "floor") {
      pos[i] = compact ? { x: W * DOOR_LEFT, y: H * COMPACT_BOTTOM - h } : { x: W * EDGE, y: H * FLOOR_BOTTOM - h };
    } else {
      pos[i] = { x: rightEdge - w, y: 0 };
      right.push(i);
    }
  });
  const bus = Math.min(W * BUS, ...right.map((i) => pos[i].x - 10));

  // Right column: aim each chip's centre at its lane, then resolve collisions within
  // [EDGE, 1 - EDGE] — first pushing down, then (if the stack overruns the bottom) back up.
  const lane = (c) => c.lane ?? c.anchor[1];
  right.sort((a, b) => lane(CALLOUTS[a]) - lane(CALLOUTS[b]));
  const top = H * (compact ? COMPACT_TOP : EDGE);
  const bottom = H * (compact ? COMPACT_BOTTOM : 1 - EDGE);
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
      return [...run, [bus, ly], [x, y + h / 2]];
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
export const OUT = 200;

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
export default function Callouts({ show, count, animate, onActive, compact = false }) {
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
      // Desktop: keep the right column inside the viewport. Layout offsets, not bounding rects, so
      // the entrance scale and the pointer parallax don't skew it.
      let rightEdge;
      if (compact) {
        let left = 0;
        for (let n = el; n; n = n.offsetParent) left += n.offsetLeft;
        rightEdge = Math.min(W * (1 - EDGE), document.documentElement.clientWidth - VIEW_MARGIN - left);
      }
      const { pos, lines } = layoutCallouts(W, H, sizes, compact, rightEdge);
      setLayout({ W, H, pos, lines, lengths: lines.map(polylineLength) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    chips.current.forEach((c) => ro.observe(c));
    document.fonts?.ready.then(measure);
    // The stage can move without resizing (its left edge follows the viewport width).
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [compact]);

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
                    {/* Hover: one stronger pulse from the dot (remounts on each hover, so it plays once) */}
                    {shown && hot && animate && <span className="animate-hotspot-once absolute inset-0 rounded-full bg-signal" />}
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
