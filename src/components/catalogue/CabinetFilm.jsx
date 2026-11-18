import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import Callouts, { OUT } from "../cabinet/Callouts";
// The former home hero footage, trimmed so the door's old, unofficial NEXERA mark never appears: frames
// 52-164 of the original 164 (the door is past edge-on from frame 49; 52 leaves a margin), every frame
// checked. The closing clips are the same frames in reverse, so both hand-offs are on identical frames.
// Poster and ground plate are made from frame 52. (The untrimmed clips stay only for the unmounted
// HomeHero.)
import videoSrc from "../../assets/products/cabinet-film.mp4";
import closeSrc from "../../assets/products/cabinet-film-close.mp4";
import videoMobileSrc from "../../assets/products/cabinet-film-mobile.mp4";
import closeMobileSrc from "../../assets/products/cabinet-film-close-mobile.mp4";
import posterSrc from "../../assets/products/cabinet-film-poster.webp";
import groundSrc from "../../assets/products/cabinet-film-ground.webp";
import { useMediaQuery } from "../../lib/scrollSteps";
import { afterFirstInteraction } from "../../lib/motion";

/*
 * /products: the cabinet film (the former home hero video, trimmed; see the imports), as a section below
 * the product grid.
 *
 * CYCLE — door just open (rest) -> opening fully -> labels held -> labels out -> closing back to the rest
 * frame. The door is never shown closed. It plays once by itself
 * when the stage is half in view; afterwards a mouse entering the stage, a tap, or Enter/Space on it
 * plays it again. Under reduced motion it cuts to the open frame with the labels, holds, and cuts back.
 *
 * LOADING — nothing (not even the poster) is requested until the section is within ~400 px of the
 * viewport, and the footage only once the visitor has scrolled or interacted and the section is on
 * screen, so the MP4 never competes with the first screen. Phones (< 1024 px) get the 720 px clips; Save-Data and 2g/3g get the poster only.
 * Muted, inline, no audio.
 *
 * PAUSE (WCAG 2.2.2) — "Pause video" stops the film where it is (and holds the labels); "Play video"
 * carries on. The film also pauses by itself while the section is off screen and resumes when it is back.
 */

const HOLD_MS = 3600;
const HOLD_MAX_MS = HOLD_MS + 4000;
const LABEL_FADE_MS = OUT + 50;
const CLOSE_RATE = 2;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const once = (el, type) => new Promise((r) => el.addEventListener(type, r, { once: true }));
const seek = (el, t) => {
  const done = once(el, "seeked");
  el.currentTime = t;
  return done;
};
const ready = (el, ms) =>
  el.readyState >= 3 ? Promise.resolve(true) : Promise.race([once(el, "canplaythrough").then(() => true), sleep(ms).then(() => el.readyState >= 3)]);

// Soft edges: the ground plate laid over the footage's borders (as in the former hero; no mask on the
// video itself, which would slow every frame).
const EDGE_X = "linear-gradient(to right, #000 0%, transparent 7%, transparent 84%, #000 100%)";
const EDGE_Y = "linear-gradient(to bottom, #000 0%, transparent 13%, transparent 90%, #000 100%)";
const edge = (mask) => ({ backgroundImage: `url(${groundSrc})`, backgroundSize: "300% 179.63%", backgroundPosition: "center", maskImage: mask, WebkitMaskImage: mask });
const PLATE_X = "linear-gradient(to right, transparent 4%, #000 30%)";
const PLATE_Y = "linear-gradient(to bottom, transparent 0%, #000 14%, #000 86%, transparent 100%)";

export default function CabinetFilm() {
  const section = useRef(null);
  const opening = useRef(null);
  const closing = useRef(null);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [near, setNear] = useState(false); // within reach: poster and footage may load
  const [footage, setFootage] = useState(null); // null | "desktop" | "mobile"
  const [phase, setPhase] = useState("closed");
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const offscreen = useRef(false);
  const busy = useRef(false);
  // The footage has ended and the cycle is only settling back to rest: a hover / tap / key landing now
  // is remembered and plays the cycle again once it is free, instead of being dropped.
  const settling = useRef(false);
  const replay = useRef(false);
  const alive = useRef(true);
  const reading = useRef(false);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  // The poster once the section is close; the clips once the visitor has scrolled or interacted and
  // the section is on screen.
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    let cancelled = false;
    let io2;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        setNear(true);
      },
      { rootMargin: "400px 0px" }
    );
    io.observe(el);
    const net = navigator.connection;
    const slow = net && (net.saveData || /(^|-)(2g|3g)$/.test(net.effectiveType ?? ""));
    const desktop = window.matchMedia("(min-width: 1024px)").matches;
    if (!slow && (desktop || !window.matchMedia("(prefers-reduced-motion: reduce)").matches)) {
      afterFirstInteraction().then(() => {
        if (cancelled) return;
        io2 = new IntersectionObserver(([e]) => {
          if (!e.isIntersecting) return;
          io2.disconnect();
          setNear(true);
          setFootage(desktop ? "desktop" : "mobile");
        });
        io2.observe(el);
      });
    }
    return () => {
      cancelled = true;
      io.disconnect();
      io2?.disconnect();
    };
  }, []);

  const halted = () => pausedRef.current || offscreen.current;
  /** Waits while the film is paused (by the button, or off screen). */
  const whilePaused = async () => {
    while (halted() && alive.current) await sleep(120);
  };
  /** Holds the open frame for HOLD_MS of un-hovered playing time, at most HOLD_MAX_MS of playing time. */
  const hold = async () => {
    let last = performance.now();
    let left = HOLD_MS;
    let playing = 0;
    while (left > 0 && playing < HOLD_MAX_MS && alive.current) {
      await sleep(100);
      const now = performance.now();
      if (!halted()) {
        playing += now - last;
        if (!reading.current) left -= now - last;
      }
      last = now;
    }
  };

  const runCycle = async () => {
    const o = opening.current;
    const c = closing.current;
    if (!footage || !o || !c || halted()) return;
    if (busy.current) {
      if (settling.current) replay.current = true;
      return;
    }
    busy.current = true;
    try {
      if (reduced) {
        if (o.readyState < 1) await once(o, "loadedmetadata");
        await seek(o, Math.max(0, o.duration - 0.001));
        if (!alive.current) return;
        setPhase("open");
        await hold();
        if (!alive.current) return;
        setPhase("closing");
        settling.current = true;
        await seek(o, 0);
        return;
      }
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
      setPhase("open");
      await hold();
      if (!alive.current) return;
      setPhase("closing");
      await sleep(LABEL_FADE_MS);
      await whilePaused();
      if (await ready(c, 4000)) {
        c.playbackRate = CLOSE_RATE;
        if (c.currentTime !== 0) await seek(c, 0);
        const closed = once(c, "ended");
        await c.play();
        c.style.opacity = "1";
        await seek(o, 0);
        await closed;
        if (!alive.current) return;
        settling.current = true;
        c.style.opacity = "0";
        await sleep(50);
        c.currentTime = 0;
      } else {
        o.style.opacity = "0";
        await sleep(300);
        await seek(o, 0);
        o.style.opacity = "1";
        settling.current = true;
        await sleep(300);
      }
    } catch {
      o.pause();
      c.pause();
      c.style.opacity = "0";
      o.style.opacity = "1";
      if (o.currentTime !== 0) o.currentTime = 0;
    } finally {
      busy.current = false;
      settling.current = false;
      if (alive.current) setPhase("closed");
      if (replay.current && alive.current) {
        replay.current = false;
        runCycle();
      }
    }
  };

  /** Pauses or resumes whichever clip is part-way through. */
  const applyHalt = () => {
    const vids = [opening.current, closing.current].filter(Boolean);
    if (halted()) vids.forEach((v) => !v.paused && v.pause());
    else vids.forEach((v) => v.paused && v.currentTime > 0 && !v.ended && busy.current && v.play().catch(() => {}));
  };

  // First cycle when half in view; pause while off screen.
  useEffect(() => {
    const o = opening.current;
    if (!o || !footage) return;
    o.muted = true;
    if (closing.current) closing.current.muted = true;
    let started = false;
    const io = new IntersectionObserver(
      ([e]) => {
        offscreen.current = !e.isIntersecting;
        applyHalt();
        if (e.isIntersecting && !started) {
          started = true;
          runCycle();
        }
      },
      { threshold: 0.5 }
    );
    io.observe(o);
    return () => io.disconnect();
    // runCycle reads the latest state on each call.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [footage]);

  const togglePause = () => {
    const next = !paused;
    pausedRef.current = next;
    setPaused(next);
    applyHalt();
    // Play on a film at rest starts a cycle.
    if (!next && !busy.current) runCycle();
  };

  return (
    <section ref={section} aria-labelledby="cabinet-film-title" className="relative overflow-hidden bg-deep-grid text-white">
      <div className="grid container-site items-center gap-8 py-section lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-12">
        {/* Above the ground plate, which reaches left under the text. */}
        <div className="relative z-10">
          <p className="eyebrow text-paper/80">Inside the cabinet</p>
          <h2 id="cabinet-film-title" className="mt-eyebrow text-h2 font-semibold">
            Inside a battery energy storage cabinet
          </h2>
          <p className="mt-heading max-w-measure text-body text-paper/80">
            The cabinet opens to show its stacked battery modules and power electronics, with its protection components labelled.
          </p>
          <p className="mt-4 text-small text-paper/75">Hover, tap or press Enter on the cabinet to play it again.</p>
          <button
            type="button"
            onClick={togglePause}
            aria-pressed={paused}
            disabled={!footage}
            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/30 px-5 text-button font-semibold text-white transition-colors duration-fast hover:border-accent hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50"
          >
            {paused ? <Play aria-hidden="true" className="h-4 w-4" /> : <Pause aria-hidden="true" className="h-4 w-4" />}
            {paused ? "Play video" : "Pause video"}
          </button>
        </div>
        <div className="relative mx-auto w-full max-w-2xl">
          <div aria-hidden="true" className="pointer-events-none absolute left-[-100%] top-[-39.81%] h-[179.63%] w-[300%]" style={near ? { backgroundImage: `url(${groundSrc})`, backgroundSize: "100% 100%", maskImage: `${PLATE_X}, ${PLATE_Y}`, maskComposite: "intersect", WebkitMaskImage: `${PLATE_X}, ${PLATE_Y}`, WebkitMaskComposite: "source-in" } : undefined} />
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-[22%] bottom-[4%] h-10 rounded-[100%] bg-black/40 blur-2xl" />
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
            aria-label="Cabinet film. Hover, tap or press Enter to open the cabinet fully and show its protection components."
            className="relative aspect-[65/54] w-full rounded-control focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            <div className="absolute inset-0">
              <video
                ref={opening}
                src={footage === "mobile" ? videoMobileSrc : footage ? videoSrc : undefined}
                poster={near ? posterSrc : undefined}
                muted
                playsInline
                preload={footage ? "auto" : "none"}
                aria-label="Battery energy storage cabinet opening to reveal its stacked battery modules and power electronics"
                className="h-full w-full object-contain transition-opacity duration-fast"
              />
              <video
                ref={closing}
                src={footage === "mobile" ? closeMobileSrc : footage ? closeSrc : undefined}
                muted
                playsInline
                preload="none"
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 h-full w-full object-contain opacity-0"
              />
            </div>
            {near && (
              <>
                <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={edge(EDGE_X)} />
                <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={edge(EDGE_Y)} />
              </>
            )}
            <Callouts show={phase === "open"} animate={!reduced} onActive={(i) => (reading.current = i !== null)} />
          </div>
        </div>
      </div>
    </section>
  );
}
