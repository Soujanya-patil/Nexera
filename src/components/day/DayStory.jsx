import { useEffect, useRef, useState } from "react";
import MagneticButton from "../ui/MagneticButton";
import PillLink from "../PillLink";
import { CALLOUTS, CHAPTERS, H1, HERO, HUD, PAUSE, SOC, clockAt, modeAt, table } from "./content";
import { STILLS, STILL_W, STILL_H, LABELS } from "./stills";
import { afterFirstInteraction } from "../../lib/motion";

/*
 * Home hero: "One Day on Site", a scroll story. The hero and six chapters (open, noon, peak, outage,
 * scale, signed) scroll over a stage that shows one battery cabinet through a day on a factory site.
 *
 * FIRST PAINT — the hero text and a still of the opening frame (rendered from the 3D scene; AVIF with
 * a WebP fallback, a phone framing below 768 px or on tall portrait screens). That still is the LCP.
 * Nothing else is needed for the first screen.
 *
 * LIVE 3D (desktop) — only where it can run well: 768 px or wider, motion allowed, no Save-Data or
 * 2g/3g, at least 4 CPU threads (and 4 GB where the browser says), and WebGL. three.js and the scene
 * (scene.js, its own chunk) are imported after the page has loaded and gone idle, once the visitor
 * first scrolls, presses a key or taps (until then the hero is the still, which is the scene's own
 * first frame, so nothing changes), and only while the story is on screen; the canvas then
 * cross-fades in over the still. It renders only while the story is on screen and the tab is visible,
 * at a pixel ratio of at most 1.5, and everything is disposed of when the page is left.
 *
 * LIGHTWEIGHT (everyone else, and on desktop until the scene is ready) — no 3D: one still per
 * chapter, swapping as the chapters pass, with the same panels, labels and HUD.
 *
 * PAUSE (WCAG 2.2.2) — the HUD's button stops all motion that runs by itself (camera drift, the
 * energy flows, the scroll hint); scrolling still moves the story. Under reduced motion there is no
 * 3D and nothing moves by itself.
 */

const PHONE_Q = "(max-width: 767px), (max-aspect-ratio: 4/5)";
// What each still shows (only the one on screen is exposed to assistive technology).
const ALTS = [
  "Illustration: a TCL BlueArk battery cabinet outside a factory with rooftop solar, early in the morning",
  "Illustration: the cabinet open, its battery packs pulled out to show the LFP cells, with the cooling and power conversion",
  "Illustration: midday, solar power flowing from the panels into the battery",
  "Illustration: evening, the battery supplying the factory",
  "Illustration: night, the grid down and the battery keeping the factory running",
  "Illustration: a row of battery cabinets and a container beside the factory",
  "Illustration: the cabinet installed and signed off, its place marked out on the ground",
];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Whether this visit should get the live 3D scene (decided after mount). */
function canRun3D() {
  if (window.matchMedia("(max-width: 767px), (prefers-reduced-motion: reduce)").matches) return false;
  const net = navigator.connection;
  if (net && (net.saveData || /(^|-)(2g|3g)$/.test(net.effectiveType ?? ""))) return false;
  if ((navigator.hardwareConcurrency ?? 8) < 4) return false;
  if ((navigator.deviceMemory ?? 8) < 4) return false;
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Fits a point given as a fraction of the still into an object-cover box of w × h. */
function coverPoint([fx, fy], w, h, phone) {
  const iw = phone ? STILL_W.m : STILL_W.d;
  const ih = phone ? STILL_H.m : STILL_H.d;
  const k = Math.max(w / iw, h / ih);
  return [(w - iw * k) / 2 + fx * iw * k, (h - ih * k) / 2 + fy * ih * k];
}

function Still({ i, active, current, load, priority }) {
  const s = STILLS[i];
  // The opening still is the LCP: always rendered, eager and high priority. The others are only
  // requested once the story gets near them.
  if (!load) return null;
  return (
    <picture>
      <source media={PHONE_Q} type="image/avif" srcSet={s.m.avif} />
      <source media={PHONE_Q} type="image/webp" srcSet={s.m.webp} />
      <source type="image/avif" srcSet={s.d.avif} />
      <img
        src={s.d.webp}
        width={STILL_W.d}
        height={STILL_H.d}
        alt={ALTS[i]}
        aria-hidden={current ? undefined : "true"}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : undefined}
        className={`day-still ${active ? "is-on" : ""}`}
      />
    </picture>
  );
}

export default function DayStory() {
  const root = useRef(null);
  const canvas = useRef(null);
  const hud = useRef({});
  const labelEls = useRef([]);
  const [active, setActive] = useState(0); // chapter nearest the middle of the screen
  const [loaded, setLoaded] = useState(1); // stills requested so far (0…loaded-1)
  const [live, setLive] = useState(false); // the 3D canvas is showing
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  pausedRef.current = paused;
  const liveRef = useRef(false);
  liveRef.current = live;

  // Request the stills as the story approaches them (current chapter + 1); none once the live scene shows.
  useEffect(() => {
    if (live) return;
    setLoaded((n) => Math.max(n, Math.min(STILLS.length, active + 2)));
  }, [active, live]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const chapters = [...el.querySelectorAll("[data-ch]")];
    let centres = [];
    let end = 0;
    let target = 0; // progress from the scroll position
    let shown = 0; // progress drawn (eased toward target in 3D)
    let scene = null;
    let raf = 0;
    let last = 0;
    let visible = true;
    let cancelled = false;
    let lastActive = 0;
    let open3D = 0;
    let stacked = false; // phones and portrait tablets (< 1024 px): picture first, then the panel
    const pt = { x: 0, y: 0 };
    // The chapter on screen: desktop, the one whose centre is nearest the middle of the screen; stacked,
    // the one whose top has passed the middle (its picture shows before its panel arrives).
    const chapterOf = (p) => (stacked ? Math.floor(p + 1e-4) : Math.round(p));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    const measure = () => {
      const y = window.scrollY;
      stacked = window.innerWidth < 1024;
      centres = chapters.map((c) => {
        const r = c.getBoundingClientRect();
        return r.top + y + (stacked ? 0 : r.height / 2);
      });
      const r = el.getBoundingClientRect();
      end = r.bottom + y;
      if (scene && canvas.current) {
        const c = canvas.current;
        scene.resize(c.clientWidth, c.clientHeight);
        const narrow = window.innerWidth < 900;
        scene.offset(narrow ? 0 : 1, narrow ? -0.26 : 0.02);
      }
    };
    const progress = () => {
      const m = window.scrollY + window.innerHeight * 0.5;
      if (!centres.length || m <= centres[0]) return 0;
      for (let i = 0; i < centres.length - 1; i++)
        if (m < centres[i + 1]) return centres[i + 1] > centres[i] ? i + (m - centres[i]) / (centres[i + 1] - centres[i]) : i;
      return centres.length - 1;
    };

    // A label sits to the right of its point, or to the left where it would run off the stage; a label
    // that would cover one placed before it (top to bottom) steps down below it.
    const placeAll = (items, w) => {
      // The HUD bar counts as taken, so no label hides under it.
      const boxes = [];
      const bar = hud.current.root?.parentElement?.getBoundingClientRect();
      const stage = canvas.current?.getBoundingClientRect();
      if (bar && stage) boxes.push({ x0: bar.left - stage.left, x1: bar.right - stage.left, y0: bar.top - stage.top, y1: bar.bottom - stage.top + 4 });
      items
        .sort((a, b) => a.y - b.y)
        .forEach(({ n, x, y }) => {
          const lw = n.offsetWidth;
          const lh = n.offsetHeight;
          const left = x + lw > w - 12;
          let top = y;
          const x0 = left ? x - lw : x;
          for (const b of boxes) if (x0 < b.x1 && x0 + lw > b.x0 && top < b.y1 && top + lh > b.y0) top = b.y1 + 4;
          boxes.push({ x0, x1: x0 + lw, y0: top, y1: top + lh });
          if (n.dataset.side !== (left ? "l" : "r")) n.dataset.side = left ? "l" : "r";
          n.style.transform = `translate(${x.toFixed(1)}px,${top.toFixed(1)}px)${left ? " translateX(-100%)" : ""}`;
        });
    };
    // HUD and labels, written straight to the DOM (no re-render per frame).
    const drawHud = (p) => {
      const h = hud.current;
      if (!h.t) return;
      const t = clockAt(p);
      if (h.t.textContent !== t) h.t.textContent = t;
      const soc = Math.round(table(SOC, p) * 100);
      h.bar.style.transform = `scaleX(${soc / 100})`;
      h.pc.textContent = `${soc}%`;
      const mode = modeAt(p);
      if (h.root.dataset.m !== String(mode)) {
        h.root.dataset.m = mode;
        h.mode.textContent = HUD.modes[mode];
      }
    };
    const drawLabels = (p) => {
      const els = labelEls.current;
      if (scene && liveRef.current) {
        const o = scene.open();
        const items = [];
        els.forEach((n, i) => {
          if (!n) return;
          if (o < 0.02) {
            n.style.opacity = "0";
            return;
          }
          scene.project(CALLOUTS[i][0], pt);
          n.style.opacity = String(o);
          items.push({ n, x: pt.x, y: pt.y });
        });
        if (items.length) placeAll(items, canvas.current.clientWidth);
        return;
      }
      // Stills: the labels on the "open" still, at the points recorded when it was rendered.
      const box = canvas.current?.parentElement;
      if (!box) return;
      const phone = window.matchMedia(PHONE_Q).matches;
      const on = chapterOf(p) === 1;
      const items = [];
      els.forEach((n, i) => {
        if (!n) return;
        if (!on) {
          n.style.opacity = "0";
          return;
        }
        const [x, y] = coverPoint(LABELS[phone ? "m" : "d"][CALLOUTS[i][0]], box.clientWidth, box.clientHeight, phone);
        n.style.opacity = "1";
        items.push({ n, x, y });
      });
      if (items.length) placeAll(items, box.clientWidth);
    };
    const setChapter = (p) => {
      const a = chapterOf(p);
      if (a !== lastActive) {
        lastActive = a;
        setActive(a);
      }
    };

    // Lightweight mode (and desktop until the scene is ready): driven by scroll, no loop.
    const onScroll = () => {
      if (scene && liveRef.current) return kick();
      target = progress();
      drawHud(target);
      drawLabels(target);
      setChapter(target);
    };

    // 3D loop: runs only while the story is on screen, the tab is visible and there is something to do.
    const frame = (now) => {
      raf = 0;
      if (!scene || !visible || document.hidden) return;
      const dt = Math.min(0.12, (now - last) / 1000 || 0.016);
      last = now;
      target = progress();
      if (!Number.isFinite(target)) target = Number.isFinite(shown) ? shown : 0;
      const still = pausedRef.current;
      shown = still ? target : shown + (target - shown) * (1 - Math.exp(-dt * 6.5));
      if (Math.abs(target - shown) < 4e-4) shown = target;
      scene.set(shown);
      scene.render(still ? 0 : dt);
      drawHud(shown);
      drawLabels(shown);
      setChapter(shown);
      open3D = shown;
      // Paused: draw only while catching up with the scroll; otherwise keep the idle motion going.
      if (!still || shown !== target) raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (!raf && scene && visible && !document.hidden) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };

    measure();
    onScroll();
    const ro = new ResizeObserver(() => {
      measure();
      if (scene && liveRef.current) {
        scene.set(open3D);
        scene.render(0);
      }
      onScroll();
    });
    ro.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) kick();
    });
    io.observe(el);
    const onVis = () => !document.hidden && kick();
    document.addEventListener("visibilitychange", onVis);
    const onPause = () => kick();
    el.addEventListener("day:pause", onPause);

    // Live 3D: on capable desktops only, after load and an idle moment, and only once the story is on
    // screen (a visit that lands further down, e.g. on #contact, never builds it). Each heavy step
    // waits for its own idle moment, and the shaders compile without blocking, so the scene never
    // holds up the page.
    let idleId;
    let onScreen = null;
    const idle = () =>
      new Promise((r) => {
        idleId = (window.requestIdleCallback ?? ((fn) => setTimeout(fn, 200)))(r, { timeout: 2500 });
      });
    const start = async () => {
      if (cancelled || reduced.matches || !canRun3D()) return;
      await afterFirstInteraction();
      if (cancelled) return;
      await new Promise((r) => {
        onScreen = new IntersectionObserver(([e]) => e.isIntersecting && r());
        onScreen.observe(el);
      });
      onScreen.disconnect();
      if (cancelled) return;
      const { createDayScene } = await import("./scene.js");
      await idle();
      if (cancelled || !canvas.current) return;
      const s = createDayScene(canvas.current);
      if (!s) return;
      scene = s;
      measure();
      await Promise.race([s.ready, sleep(4000)]);
      await idle();
      if (cancelled) return;
      shown = target = progress();
      await s.prepare(shown).catch(() => {});
      if (cancelled) return;
      shown = target = progress();
      s.snapshot(shown);
      setLive(true);
      kick();
    };
    const go = () => idle().then(start);
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });

    return () => {
      cancelled = true;
      onScreen?.disconnect();
      window.removeEventListener("load", go);
      if (idleId) (window.cancelIdleCallback ?? clearTimeout)(idleId);
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVis);
      el.removeEventListener("day:pause", onPause);
      scene?.dispose();
      scene = null;
    };
  }, []);

  const togglePause = () => {
    setPaused((v) => !v);
    // Let the loop pick up the change (it stops itself when paused and idle).
    requestAnimationFrame(() => root.current?.dispatchEvent(new Event("day:pause")));
  };

  return (
    <section ref={root} data-day-story data-ground="dark" data-paused={paused || undefined} data-live={live || undefined} className="day relative bg-deep-grid text-white">
      {/* HUD: pinned to the top right of the stage while the story is on screen (top centre on phones).
          First in the DOM, so Pause motion is the story's first stop for the keyboard. */}
      <div className="day-hudwrap">
        <div className="day-hudbar">
          <div ref={(n) => (hud.current.root = n)} className="day-hud" aria-hidden="true" data-m="0">
            <b ref={(n) => (hud.current.t = n)} className="day-hud-t">06:10</b>
            <span ref={(n) => (hud.current.mode = n)} className="day-hud-m">{HUD.modes[0]}</span>
            <span className="day-hud-soc">
              <i>{HUD.soc}</i>
              <span className="day-hud-bar">
                <i ref={(n) => (hud.current.bar = n)} style={{ transform: "scaleX(0.32)" }} />
              </span>
              <em ref={(n) => (hud.current.pc = n)}>32%</em>
            </span>
            <small>{HUD.note}</small>
          </div>
          <button type="button" className="day-pause" aria-pressed={paused} onClick={togglePause}>
            {PAUSE[paused ? 1 : 0]}
          </button>
        </div>
      </div>

      {/* Stage: the stills (or the live scene) and the labels, held under the header. */}
      <div className="day-stage">
        <div className="absolute inset-0">
          {STILLS.map((_, i) => (
            // Stacked in chapter order and every still up to the current one kept opaque: going forward
            // the next one fades in on top, going back the top one fades off the one beneath.
            <Still key={i} i={i} active={i <= active} current={i === active} load={i < loaded} priority={i === 0} />
          ))}
          <canvas ref={canvas} aria-hidden="true" className={`day-canvas ${live ? "is-on" : ""}`} />
        </div>
        <div aria-hidden="true" className="day-scrim" />
        <div aria-hidden="true" className="day-labels">
          {CALLOUTS.map(([k, label], i) => (
            <span key={k} ref={(n) => (labelEls.current[i] = n)} className="day-label" style={{ opacity: 0 }}>
              <i />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* The text: the hero, then one panel per chapter, scrolling over the stage. */}
      <div className="day-chapters">
        <div data-ch="0" data-home-hero className="day-ch day-ch-hero">
          <div className="day-sticky container-site">
            <div className="day-hero">
              <h1 className="eyebrow text-paper/85">{H1}</h1>
              <p className="day-display">{HERO.display}</p>
              <p className="day-sub">{HERO.sub}</p>
              <div className="day-row">
                <MagneticButton to={HERO.primary.to} arrow spotlight>
                  {HERO.primary.label}
                </MagneticButton>
                <MagneticButton to={HERO.secondary.to} variant="outline" sweep>
                  {HERO.secondary.label}
                </MagneticButton>
              </div>
              <p className="day-partner">{HERO.partner}</p>
            </div>
          </div>
          <p className="day-hint" aria-hidden="true">
            <i />
            {HERO.hint}
          </p>
        </div>
        {CHAPTERS.map((c, i) => (
          <div key={c.id} data-ch={i + 1} className={`day-ch day-ch-${c.id}`}>
            <div className="day-sticky container-site">
              <div className="day-panel">
                <p className="day-tag">
                  {c.time && <span className="day-time">{c.time}</span>}
                  {c.tag}
                </p>
                <h2 className="day-h2">{c.h}</h2>
                <p className="day-p">{c.p}</p>
                {c.li && (
                  <ul className="day-ticks">
                    {c.li.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                )}
                {c.checks && (
                  <ol className="day-signoff">
                    {c.checks.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ol>
                )}
                {c.ctas && (
                  <div className="day-row">
                    {c.ctas.map((b, k) => (
                      <PillLink key={b.to} to={b.to} arrow={k === 0} variant={k === 0 ? "solid" : "outline"}>
                        {b.label}
                      </PillLink>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
