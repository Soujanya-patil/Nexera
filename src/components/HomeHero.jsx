import { useEffect, useLayoutEffect, useRef, useState } from "react";
import HomeHeroCopy from "./HomeHeroCopy";
import Callouts, { OUT } from "./cabinet/Callouts";
import { createSeekGate, useBlobUrl } from "../lib/footage";
import videoSrc from "../assets/products/nexera-hero-cabinet.mp4";
import closeSrc from "../assets/products/nexera-hero-cabinet-close.mp4";
// Phone versions of the two cycle clips (720 px wide, H.264, no audio, faststart; ~345 KB each).
import videoMobileSrc from "../assets/products/nexera-hero-cabinet-mobile.mp4";
import closeMobileSrc from "../assets/products/nexera-hero-cabinet-close-mobile.mp4";
import posterSrc from "../assets/products/nexera-hero-cabinet-poster.webp";
import scrubSrc from "../assets/products/nexera-hero-cabinet-scrub.mp4";
import groundSrc from "../assets/products/nexera-hero-ground.webp";
import { useMediaQuery } from "../lib/scrollSteps";
import { loadGsap } from "../lib/motion";
import { getLenis } from "../lib/lenis";
import { isFirstLoad } from "../lib/firstLoad";

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
 * SET INTO THE HERO, NOT FRAMED — the footage has no panel: its edges fade soft (EDGE_X / EDGE_Y) and
 * a wide ambient field behind it continues the footage's graphite ground out into the hero, fading to
 * the dark green (faintly behind the headline too), with a soft green light at the product. On desktop
 * the hero fits the first screen (the stat bar peeks in) and the product is sized to it: as large as
 * fits, reaching toward the copy — the fully open door stops just short of the text — and toward the
 * viewport's right edge (.hero-product in index.css); it enters with the headline.
 *
 * DEPTH — the ambient field and a contact shadow (outside the footage), a light green-black vignette
 * at the footage edges, and a small pointer parallax on desktop: the product follows
 * the pointer by up to 6px and the backdrop by up to 3px the other way. It is CSS-transition driven
 * (the pointer handler only writes two custom properties, at most once per frame), so there is no
 * running animation loop; it is off for touch and reduced motion.
 */
// Soft edges for the footage so it dissolves into the hero instead of ending at a frame: 7% on the
// left (the open door reaches ~8%), 13% at the top (lifting eyes at ~15%), 16% on the right (empty
// ground) and 10% at the bottom (feet at ~90%) — the cabinet is never faded.
//
// PERFORMANCE: the footage itself is NOT masked. A CSS mask on a <video> layer sends every decoded
// frame through an expensive compositing path — measured, it slowed each scroll seek from ~20 ms to
// ~200 ms and made the scrub steppy. Instead two copies of the (static) ground plate sit over the
// footage's edges, each faded by one linear ramp: EDGE_X covers the left/right bands, EDGE_Y the
// top/bottom. Stacked, they give exactly plate·(1 − X·Y) + footage·X·Y — the same result as masking
// the footage with X∩Y — while only static image layers carry masks.
const EDGE_X = "linear-gradient(to right, #000 0%, transparent 7%, transparent 84%, #000 100%)";
const EDGE_Y = "linear-gradient(to bottom, #000 0%, transparent 13%, transparent 90%, #000 100%)";
const edgeOverlay = (mask) => ({
  backgroundImage: `url(${groundSrc})`,
  // The plate is 3x the stage wide and 1.7963x tall with the frame in its centre: centred at this
  // size, it lines up with the footage exactly (same as the plate behind the stage).
  backgroundSize: "300% 179.63%",
  backgroundPosition: "center",
  maskImage: mask,
  WebkitMaskImage: mask,
});
const EDGE_OVERLAY_X = edgeOverlay(EDGE_X);
const EDGE_OVERLAY_Y = edgeOverlay(EDGE_Y);


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
// Master switch for the desktop scroll story. Off: every screen size uses the autoplay cycle (plays
// when the hero is in view, light sweep, labels hold, closes; replays on hover/tap) — no pinning, no
// scroll-driven footage, no product scaling/drift, no 01–05 stage rail; the hero scrolls away like a
// normal section. All the story code below stays in place; set this to true to bring it back.
const ENABLE_STORY = false;
const STORY_Q = "(min-width: 1024px) and (min-height: 640px) and (prefers-reduced-motion: no-preference)";
const STORY_VH = 300;
const SEEK_TIMEOUT_MS = 250; // a seek that hasn't reported back by now is treated as lost
const STAGES = [
  { label: "Intro", at: 0, caption: "NEXERA battery energy storage cabinet" },
  { label: "Reveal", at: 0.08, caption: "The cabinet opens" },
  { label: "Explore", at: 0.4, caption: "Stacked battery modules and power electronics" },
  { label: "Safety", at: 0.5, caption: "Protection components, named as in the OEM protection architecture" },
  { label: "System", at: 0.76, caption: "Storage, power electronics and protection in one cabinet" },
];
const LABEL_AT = [0.52, 0.565, 0.61, 0.655, 0.7];
const LABELS_OUT = 0.86;
const ramp = (p, a, b) => Math.max(0, Math.min(1, (p - a) / (b - a)));
const smooth = (t) => t * t * (3 - 2 * t);
/**
 * How far the copy has stepped back for the product (0 = hero, 1 = product-led), by stage:
 * a little as the cabinet opens (REVEAL -> 0.55), more while exploring (0.75), quietest during
 * SAFETY (1, the labels lead), then the headline gradually returns through SYSTEM.
 */
const recedeAt = (p) =>
  (smooth(ramp(p, 0.08, 0.4)) * 0.55 + smooth(ramp(p, 0.4, 0.5)) * 0.2 + smooth(ramp(p, 0.5, 0.58)) * 0.25) *
  (1 - smooth(ramp(p, 0.76, 0.95)));
/** The close of the story: the product settles and the hero's lighting fades toward the stat bar. */
const settleAt = (p) => smooth(ramp(p, 0.9, 1));
/** Small contextual line beside the copy, by stage (only where it adds something). */
const CONTEXT = { 2: "Explore the system", 3: "Safety inspection" };
/** Footage time for progress p: opens over REVEAL, holds, closes again at the end. */
const footageAt = (p, d) => d * (smooth(ramp(p, 0.08, 0.4)) * (1 - smooth(ramp(p, 0.88, 0.98))));
const labelsAt = (p) => (p >= LABELS_OUT ? 0 : LABEL_AT.filter((a) => p >= a).length);
const stageAt = (p) => STAGES.reduce((k, s, i) => (p >= s.at ? i : k), 0);

// The ground plate fades out toward the copy on the left (its left third is the extension behind the
// headline) and at its top and bottom; everywhere around the footage it is fully present.
const PLATE_X = "linear-gradient(to right, transparent 4%, #000 30%)";
const PLATE_Y = "linear-gradient(to bottom, transparent 0%, #000 14%, #000 86%, transparent 100%)";
const GROUND_PLATE = {
  backgroundImage: `url(${groundSrc})`,
  backgroundSize: "100% 100%",
  maskImage: `${PLATE_X}, ${PLATE_Y}`,
  maskComposite: "intersect",
  WebkitMaskImage: `${PLATE_X}, ${PLATE_Y}`,
  WebkitMaskComposite: "source-in",
};

export default function HomeHero() {
  const section = useRef(null);
  const opening = useRef(null);
  const closing = useRef(null);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const parallax = useMediaQuery("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
  const [phase, setPhase] = useState("closed"); // closed | opening | scan | open | closing
  // First load: the product (the poster: the desktop LCP) must not start transparent, so it only
  // settles in scale; client-side navigations keep the fade-and-settle (index.css).
  const [firstLoad] = useState(() => typeof window === "undefined" || isFirstLoad());
  // The footage, only once the page has loaded (the poster is the first paint and the LCP):
  //  - desktop: the full clips, after the first idle moment past `load` (as before);
  //  - phones (< 1024 px): the 720 px phone clips, requested at `load`; the cycle starts once the
  //    opening clip can play through, the poster fading off over it (see `veil`);
  //  - Save-Data, slow (2g/3g) connections, and phones under prefers-reduced-motion: the poster only,
  //    no MP4 is downloaded.
  // Decided after mount, so the pre-rendered page and the first render match (no video src).
  const [footage, setFootage] = useState(null); // null | "desktop" | "mobile"
  const videoReady = footage !== null;
  // Phones: a copy of the poster laid over the video as it starts, then faded out (0.4 s), so the
  // sharp poster hands over to the 720 px clip softly. Drawn into a <canvas> — canvas content is never
  // a Largest Contentful Paint candidate, so the poster stays the LCP (an <img> copy, painted after
  // load, would be recorded as a later LCP). Only ever rendered after load.
  const [veil, setVeil] = useState(null); // null | "on" | "fade"
  const veilCanvas = useRef(null);
  const posterImg = useRef(null);
  useEffect(() => {
    const net = navigator.connection;
    const slow = net && (net.saveData || /(^|-)(2g|3g)$/.test(net.effectiveType ?? ""));
    if (slow) return;
    const desktopScreen = window.matchMedia("(min-width: 1024px)").matches;
    if (!desktopScreen && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let id;
    const go = desktopScreen
      ? () => (id = (window.requestIdleCallback ?? ((fn) => setTimeout(fn, 1)))(() => setFootage("desktop"), { timeout: 1500 }))
      : () => setFootage("mobile");
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });
    return () => {
      window.removeEventListener("load", go);
      if (id) (window.cancelIdleCallback ?? clearTimeout)(id);
    };
  }, []);
  const [cycle, setCycle] = useState(0); // remounts the sweep each cycle
  // Synchronous "a cycle is running" flag: several pointer events can land in the same tick,
  // before React re-renders `phase`; this makes every one after the first a no-op.
  const busy = useRef(false);
  const alive = useRef(true);
  const reading = useRef(false); // a hotspot is hovered
  // Read synchronously on first render (useMediaQuery initialises from matchMedia), so the video
  // never starts on the wrong source and switches.
  const storyScreen = useMediaQuery(STORY_Q); // always called (hook order), gated by ENABLE_STORY
  const story = ENABLE_STORY && storyScreen;
  const desktop = useMediaQuery("(min-width: 1024px)");
  const fit = desktop && !story; // desktop cycle: the product is placed by .hero-product (index.css)
  const copyCol = useRef(null);
  const productCol = useRef(null);
  // Story footage as an in-memory blob URL (see the effect below); null until it is ready, during
  // which the video shows only its poster.
  // Story footage as an in-memory blob: URL (lib/footage.js); null until ready (poster meanwhile).
  const storySrc = useBlobUrl(scrubSrc, story);
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
    if (story || !videoReady || !o || !c || busy.current) return;
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
    if (!o || story || !videoReady) return;
    o.muted = true;
    if (closing.current) closing.current.muted = true;
    let cancelled = false;
    const timers = [];
    const start = async () => {
      if (footage !== "mobile") return runCycle();
      // Phones: begin once the opening clip can play through, the poster copy fading off over it.
      if (o.readyState < 4) await once(o, "canplaythrough");
      // The poster (already loaded: it is the first paint) decoded for the veil canvas.
      const img = new Image();
      img.src = posterSrc;
      await img.decode().catch(() => {});
      if (cancelled) return;
      posterImg.current = img;
      setVeil("on");
      runCycle();
      timers.push(setTimeout(() => setVeil("fade"), 60), setTimeout(() => setVeil(null), 520));
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          io.disconnect();
          start();
        }
      },
      { threshold: 0.5 }
    );
    io.observe(o);
    return () => {
      cancelled = true;
      io.disconnect();
      timers.forEach(clearTimeout);
    };
    // runCycle reads the latest state through its closure on each call.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story, videoReady, footage]);

  // Paint the poster into the veil canvas the moment it mounts (before the browser paints it), fitted
  // like the video's object-contain.
  useLayoutEffect(() => {
    const c = veilCanvas.current;
    const img = posterImg.current;
    if (veil !== "on" || !c || !img?.naturalWidth) return;
    const r = c.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    c.width = Math.round(r.width * dpr);
    c.height = Math.round(r.height * dpr);
    const k = Math.min(c.width / img.naturalWidth, c.height / img.naturalHeight);
    const w = img.naturalWidth * k;
    const h = img.naturalHeight * k;
    c.getContext("2d").drawImage(img, (c.width - w) / 2, (c.height - h) / 2, w, h);
  }, [veil]);

  // Scroll story: pinned progress -> footage time, labels, stage, and two CSS variables the copy and
  // the product read (--story, --recede). React only re-renders when the stage or label count changes.
  useEffect(() => {
    const el = section.current;
    const v = opening.current;
    if (!story || !el || !v) return;
    let cancelled = false;
    let ctx;
    // One seek in flight at a time, self-healing (lib/footage.js).
    const gate = createSeekGate(v, SEEK_TIMEOUT_MS);
    loadGsap().then(({ gsap, ScrollTrigger }) => {
      if (cancelled) return;
      const update = (self) => {
        const p = self.progress;
        el.style.setProperty("--story", p.toFixed(4));
        el.style.setProperty("--recede", recedeAt(p).toFixed(4));
        el.style.setProperty("--settle", settleAt(p).toFixed(4));
        gate.seek(footageAt(p, Number.isFinite(v.duration) ? v.duration : 6.83));
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
      gate.destroy();
      el.style.removeProperty("--story");
      el.style.removeProperty("--recede");
      el.style.removeProperty("--settle");
    };
  }, [story]);

  // Desktop cycle: --copy-gap = how far the copy's last character ends before the product column
  // (its widest line — headline, paragraph or trust points — measured from the text itself, so it
  // follows the fonts at every width). .hero-product uses it to stop the fully open door just short of
  // the text.
  useLayoutEffect(() => {
    const el = section.current;
    const copy = copyCol.current;
    const col = productCol.current;
    if (!fit || !el || !copy || !col) return;
    const measure = () => {
      const range = document.createRange();
      const walker = document.createTreeWalker(copy, NodeFilter.SHOW_TEXT);
      let right = 0;
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        if (!n.textContent.trim()) continue;
        range.selectNodeContents(n);
        right = Math.max(right, range.getBoundingClientRect().right);
      }
      if (right) el.style.setProperty("--copy-gap", `${Math.round(col.getBoundingClientRect().left - right)}px`);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    document.fonts?.ready.then(measure);
    return () => {
      ro.disconnect();
      el.style.removeProperty("--copy-gap");
    };
  }, [fit]);

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
      data-home-hero
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
              "radial-gradient(55% 60% at 8% 0%, rgba(244,247,244,0.05), transparent 70%), linear-gradient(to bottom, transparent 70%, var(--color-deep))",
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
        className={`relative grid container-site items-center gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[minmax(0,36rem)_minmax(0,1fr)] ${
          story ? "h-full pb-20 pt-10" : "hero-fit py-14 lg:py-6"
        }`}
      >
        {/* Copy — in the story it steps back (fades, drifts left, settles smaller) while the product
            leads, and returns at the end. A wrapper of its own, so it never fights the copy's entrance. */}
        <div ref={copyCol} className="relative z-10">
          {/* Contextual line while the product is examined (full strength; the copy below steps back). */}
          {story && (
            <p
              aria-hidden="true"
              className={`absolute -top-9 left-0 flex items-center gap-2 text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-signal transition-[opacity,translate] duration-500 ease-out ${
                CONTEXT[storyStage] ? "translate-y-0 opacity-100" : "translate-y-1.5 opacity-0"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-signal" />
              {CONTEXT[storyStage] ?? CONTEXT[2]}
            </p>
          )}
          <div
            style={
              story
                ? {
                    opacity: "calc(1 - var(--recede, 0) * 0.55)",
                    transform: "translate3d(calc(var(--recede, 0) * -28px), 0, 0) scale(calc(1 - var(--recede, 0) * 0.06))",
                    transformOrigin: "left center",
                  }
                : undefined
            }
          >
            <HomeHeroCopy parallax={parallax} story={story} subdued={!story && (phase === "scan" || phase === "open")} />
          </div>
        </div>

        {/* Product, set into the hero rather than framed: parallax layer (wider than its column on wide
            screens, reaching into the page margin) -> entrance -> ambient field + stage. */}
        {/* Desktop cycle: the column only anchors the product, which .hero-product sizes and places
            (index.css) — larger than the column, reaching toward the copy and the viewport's right
            edge. Story: reaches to the viewport's right edge — the column's width + the page margin
            beside the centred 1440px container + the container's side padding (--site-pad). */}
        <div
          ref={productCol}
          className={story ? "lg:w-[calc(100%+max(0px,(100vw-1440px)/2)+var(--site-pad))]" : "lg:relative lg:self-stretch"}
          style={parallax ? drift(6, 5) : undefined}
        >
          {/* Story: the product grows ~10% and moves toward the centre as the copy steps back; a soft
              green light behind it rises with it (below). */}
          <div
            style={
              story
                ? {
                    transform: "translate3d(calc(var(--recede, 0) * -8%), 0, 0) scale(calc(1 + var(--recede, 0) * 0.1))",
                    transformOrigin: "50% 55%",
                    // Its scale changes on every scroll frame: keep it one GPU layer at a fixed raster
                    // scale, so the masked ground layers inside are not re-drawn each frame.
                    willChange: "transform",
                  }
                : undefined
            }
          >
          <div className={`${firstLoad ? "hero-product-settle" : "hero-product-in"} relative mx-auto w-full max-w-xl lg:max-w-none ${story ? "lg:-translate-y-[6vh]" : "hero-product"}`}>
            {/* Ambient field: the footage's graphite ground continued out into the hero and fading to the
                dark green over a wide area (reaching faintly behind the headline), with a soft green
                light at the product. This is what lets the stage edge disappear. */}
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute -inset-x-[42%] -inset-y-[30%] transition-[opacity,filter] duration-700 ${inspect ? "brightness-125" : ""}`}
              style={{
                ...(story ? { opacity: "calc(1 - var(--settle, 0) * 0.55)", scale: "calc(1 + var(--recede, 0) * 0.12)" } : null),
                background:
                  "radial-gradient(34% 36% at 50% 52%, rgba(144,217,136,0.07), rgba(144,217,136,0.035) 40%, rgba(144,217,136,0.01) 65%, transparent 85%)",
              }}
            />
            {/* Ground plate (nexera-hero-ground.webp): the footage's own first frame, heavily blurred,
                with every edge continued outward — 3x the stage wide, 1.8x tall, the frame exactly in
                its centre third. So wherever the footage's soft edges fade out, what shows through is
                the same tone the footage has there, carried on to the viewport edge: no visible video
                boundary. It fades out toward the headline (left) and at the top and bottom. */}
            <div aria-hidden="true" className="pointer-events-none absolute left-[-100%] top-[-39.81%] h-[179.63%] w-[300%]" style={GROUND_PLATE} />
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-[22%] bottom-[4%] h-10 rounded-[100%] bg-black/40 blur-2xl" />

            {/* Stage: no panel — the footage's edges fade soft (see EDGE_X / EDGE_Y), the labels, sweep
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
              <div className="absolute inset-0">
                <video
                  ref={opening}
                  src={story ? storySrc ?? undefined : footage === "mobile" ? videoMobileSrc : footage ? videoSrc : undefined}
                  poster={posterSrc}
                  muted
                  playsInline
                  preload={videoReady || story ? "auto" : "none"}
                  aria-label="NEXERA battery energy storage cabinet opening to reveal its stacked battery modules and power electronics"
                  className="h-full w-full object-contain transition-opacity duration-300"
                />
                {/* The closing clip sits exactly over the opening one and is only made visible while it plays
                    (the cycle only; the story scrubs the footage back instead). */}
                {!story && (
                  <video
                    ref={closing}
                    src={footage === "mobile" ? closeMobileSrc : footage ? closeSrc : undefined}
                    muted
                    playsInline
                    preload="none"
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 h-full w-full object-contain opacity-0"
                  />
                )}
                {/* Phones: the poster, laid over the clip as it starts and faded off (the video fades in). */}
                {veil && (
                  <canvas
                    ref={veilCanvas}
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-[400ms] ease-out"
                    style={{ opacity: veil === "fade" ? 0 : 1 }}
                  />
                )}
              </div>
              {/* Soft edges: the ground plate laid over the footage's borders (see EDGE_X / EDGE_Y). */}
              <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={EDGE_OVERLAY_X} />
              <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={EDGE_OVERLAY_Y} />
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
                <Callouts show={phase === "open"} animate={!reduced} onActive={onActive} compact={fit} />
              )}
            </div>
          </div>
          </div>
        </div>
      </div>

      {story && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent from-60% to-deep"
          style={{ opacity: "calc(var(--settle, 0) * 0.85)" }}
        />
      )}

      {/* Story progress: five stages along a thin line (filled by --story), each a jump link, with the
          current stage's caption beside it. */}
      {story && (
        <div className="absolute inset-x-0 bottom-6 z-10">
          <div className="flex container-site items-center gap-8">
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
