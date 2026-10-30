import { useCallback, useEffect, useRef, useState } from "react";
import PillLink from "../PillLink";
import { SOLUTION_PAGES } from "../../data/solutions";
import ScenePicture from "../ScenePicture";
import { afterFirstPaint } from "../../lib/motion";

/*
 * The three stops of the scale slider. Every figure is the product data's own (products.js): the
 * BlueArk X1 (8–128 kWh), the BlueArk W10 (261 kWh, expandable to 6.3 MWh) and the Hithium ∞Power
 * container (6.25 MWh). `kwh` drives the live figure; the text at a stop is always the exact value.
 */
const STOPS = [
  {
    id: "residential",
    stop: "Home",
    eyebrow: "Residential storage",
    title: "More control at home.",
    desc: "Store energy, support backup power and bring greater flexibility to everyday living.",
    kwh: 128,
    line: "up to, per home system · TCL BlueArk X1 (from 8 kWh)",
    pills: ["TCL"],
    cta: "Explore residential",
    to: SOLUTION_PAGES.residential.path,
    short: "Residential",
    img: "residential",
    alt: "Render of a home at dusk with a wall-mounted home battery and a green energy line along the path",
  },
  {
    id: "ci",
    stop: "Business",
    eyebrow: "Commercial & industrial",
    title: "Power your operation.",
    desc: "Energy storage designed to support business continuity and smarter energy use.",
    kwh: 261,
    line: "per cabinet, scalable to 6.3 MWh · TCL BlueArk W10",
    pills: ["TCL", "Hithium", "CLOU"],
    cta: "Explore C&I",
    to: SOLUTION_PAGES.ci.path,
    short: "Commercial & Industrial",
    img: "ci",
    alt: "Render of three TCL battery cabinets beside a commercial building at dusk",
  },
  {
    id: "utility",
    stop: "Grid",
    eyebrow: "Utility-scale storage",
    title: "Built to scale with demand.",
    desc: "Flexible storage infrastructure for a more resilient energy system.",
    kwh: 6250,
    line: "per container · Hithium ∞Power",
    pills: ["Hithium", "CLOU"],
    cta: "Explore utility-scale",
    to: SOLUTION_PAGES.utility.path,
    short: "Utility-scale",
    img: "utility",
    alt: "Render of Hithium battery storage containers beside a solar plant at sunset",
  },
];
const LAST = STOPS.length - 1;

/** The figure at slider position `p` (0 … 2): exact at a stop, on a log scale in between. */
function kwhAt(p) {
  const i = Math.min(Math.floor(p), LAST - 1);
  const t = p - i;
  if (t <= 0) return STOPS[i].kwh;
  if (t >= 1) return STOPS[i + 1].kwh;
  return STOPS[i].kwh * Math.pow(STOPS[i + 1].kwh / STOPS[i].kwh, t);
}
/** kWh below 1000 (whole numbers), MWh above (two decimals): "128" kWh, "6.25" MWh. */
function format(kwh) {
  return Math.round(kwh) < 1000 ? [String(Math.round(kwh)), "kWh"] : [(kwh / 1000).toFixed(2), "MWh"];
}
const figure = (kwh) => format(kwh).join(" ");

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const inOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const outCubic = (t) => 1 - Math.pow(1 - t, 3);

const WIPE_MS = 1200; // the circular reveal (and its ring)
const SETTLE_MS = 2200; // the new scene's 1.07 → 1
const GLIDE_MS = 1400; // auto-play: knob from one stop to the next
const HOLD_MS = 2600; // auto-play: time at a stop (≈ 4 s per stop with the glide)
const COUNT_MS = 1200; // the first figure counting up to 128

/** One scene (ScenePicture: AVIF → WebP → JPG) filling its layer. */
function Scene({ s, first, active, imgRef }) {
  return (
    <ScenePicture
      name={s.img}
      sizes="(min-width: 1024px) 100vw, 140vw"
      imgRef={imgRef}
      alt={active ? s.alt : ""}
      aria-hidden={active ? undefined : true}
      loading="eager"
      fetchPriority={first ? "high" : "low"}
      decoding={first ? "sync" : "async"}
      className="sh-img absolute inset-0 h-full w-full object-cover"
    />
  );
}

/**
 * The Solutions hub header: a full-bleed scene with a scale slider (Home · Business · Grid). Dragging,
 * clicking a label or the arrow keys move the knob; the figure follows on a log scale and lands on the
 * exact value at each stop; reaching a new stop reveals its scene with a circular wipe from the lower
 * left and brings its text in. On load the figure counts up and the knob glides through the three
 * stops once; the first interaction stops that for good. Reduced motion: instant switches only. The
 * pre-rendered page (and no JavaScript) shows the Residential stop, with all three Explore links in
 * the markup.
 */
export default function ScaleHeader({ title, aside = null }) {
  const [active, setActive] = useState(0);
  const [loadOthers, setLoadOthers] = useState(false);
  const root = useRef(null);
  const sceneBox = useRef(null);
  const layers = useRef([]);
  const imgs = useRef([]);
  const ring = useRef(null);
  const knob = useRef(null);
  const rail = useRef(null);
  const fill = useRef(null);
  const zone = useRef(null);
  const num = useRef(null);
  const unit = useRef(null);
  const pos = useRef(0);
  const activeRef = useRef(0);
  const glide = useRef(null); // the running knob animation: { raf, resolve }
  const auto = useRef({ on: false });
  const drag = useRef(null);
  const z = useRef(1);

  /** Puts the knob at `p`, shows the figure there and switches the stop when the nearest one changes. */
  const place = useCallback((p, shownKwh) => {
    pos.current = p;
    if (rail.current) rail.current.style.transform = `translateX(${(p / LAST) * 100}%)`;
    if (fill.current) fill.current.style.transform = `scaleX(${p / LAST})`;
    const [n, u] = format(shownKwh ?? kwhAt(p));
    if (num.current) num.current.textContent = n;
    if (unit.current) unit.current.textContent = u;
    const near = Math.round(p);
    if (near !== activeRef.current) {
      activeRef.current = near;
      setActive(near);
    }
  }, []);

  const stopGlide = () => {
    if (!glide.current) return;
    cancelAnimationFrame(glide.current.raf);
    glide.current.resolve(false);
    glide.current = null;
  };

  /** Moves the knob to `to` over `ms` (eased); resolves true when it gets there, false if interrupted. */
  const glideTo = useCallback(
    (to, ms) => {
      stopGlide();
      const from = pos.current;
      if (ms <= 0 || reducedMotion() || from === to) {
        place(to);
        return Promise.resolve(true);
      }
      return new Promise((resolve) => {
        const start = performance.now();
        const g = { raf: 0, resolve };
        const tick = (now) => {
          const t = Math.min((now - start) / ms, 1);
          place(t < 1 ? from + (to - from) * inOut(t) : to);
          if (t < 1) g.raf = requestAnimationFrame(tick);
          else {
            glide.current = null;
            resolve(true);
          }
        };
        g.raf = requestAnimationFrame(tick);
        glide.current = g;
      });
    },
    [place]
  );

  /** The first interaction: auto-play stops for good (a count still running lands on its value). */
  const takeOver = useCallback(() => {
    setLoadOthers(true);
    if (!auto.current.on) return;
    auto.current.on = false;
    auto.current.stopCount?.();
    stopGlide();
    place(pos.current);
  }, [place]);

  // A new stop: its scene is revealed by a circular wipe from the lower left, with one ring along the
  // wipe's edge, and settles from 1.07 to 1 (reduced motion: it is simply shown on top).
  const shownStop = useRef(0);
  useEffect(() => {
    if (shownStop.current === active) return;
    shownStop.current = active;
    const layer = layers.current[active];
    const box = sceneBox.current;
    if (!layer || !box) return;
    z.current += 1;
    layer.style.zIndex = String(z.current);
    if (reducedMotion()) return;
    const { width: w, height: h } = box.getBoundingClientRect();
    const wide = w >= 1000 && window.matchMedia("(min-width: 1024px)").matches;
    const ox = w * (wide ? 0.28 : 0.1);
    const oy = h * (wide ? 0.8 : 0.95);
    const r = Math.hypot(Math.max(ox, w - ox), Math.max(oy, h - oy));
    const ease = "cubic-bezier(0.65, 0, 0.35, 1)";
    layer.getAnimations().forEach((a) => a.cancel());
    layer.animate([{ clipPath: `circle(0px at ${ox}px ${oy}px)` }, { clipPath: `circle(${r}px at ${ox}px ${oy}px)` }], { duration: WIPE_MS, easing: ease });
    imgs.current[active]?.animate([{ transform: "scale(1.07)" }, { transform: "scale(1)" }], { duration: SETTLE_MS, easing: "cubic-bezier(0.16, 1, 0.3, 1)" });
    const rg = ring.current;
    if (rg) {
      rg.style.left = `${ox}px`;
      rg.style.top = `${oy}px`;
      rg.getAnimations().forEach((a) => a.cancel());
      rg.animate(
        [
          { width: "0px", height: "0px", opacity: 1 },
          { opacity: 0.9, offset: 0.7 },
          { width: `${2 * r}px`, height: `${2 * r}px`, opacity: 0 },
        ],
        { duration: WIPE_MS, easing: ease }
      );
    }
  }, [active]);

  // The other two scenes load once the page has loaded (or at the first interaction).
  useEffect(() => {
    let live = true;
    afterFirstPaint().then(() => live && setLoadOthers(true));
    return () => {
      live = false;
    };
  }, []);

  // On load: the figure counts up to 128, then the knob glides Home → Business → Grid once.
  useEffect(() => {
    const n = num.current;
    const reduced = reducedMotion();
    // The digits wait hidden (CSS) for this count; if they were already shown — reduced motion, or
    // the script arrived after the CSS fallback revealed them — the count is skipped.
    const shown = !n || reduced || getComputedStyle(n).opacity !== "0";
    n?.removeAttribute("data-pending");
    root.current?.setAttribute("data-ready", "");
    if (reduced) return;
    const a = { on: true };
    auto.current = a;
    let countRaf = 0;
    const count = () =>
      new Promise((resolve) => {
        const start = performance.now();
        a.stopCount = () => {
          cancelAnimationFrame(countRaf);
          resolve();
        };
        const tick = (now) => {
          const t = Math.min((now - start) / COUNT_MS, 1);
          place(0, t < 1 ? Math.round(STOPS[0].kwh * outCubic(t)) : undefined);
          if (t < 1) countRaf = requestAnimationFrame(tick);
          else resolve();
        };
        countRaf = requestAnimationFrame(tick);
      });
    /** Resolves when scene `i` is decoded (at most `ms` later), so a wipe never reveals an empty layer. */
    const ready = (i, ms) =>
      Promise.race([
        new Promise((resolve) => {
          const check = () => (imgs.current[i] ? imgs.current[i].decode().then(resolve, resolve) : setTimeout(check, 100));
          check();
        }),
        sleep(ms),
      ]);
    (async () => {
      if (!shown) {
        place(0, 0);
        await count();
      }
      for (const next of [1, 2]) {
        await sleep(HOLD_MS);
        if (!a.on) return;
        await ready(next, 4000);
        if (!a.on) return;
        if (!(await glideTo(next, GLIDE_MS)) || !a.on) return;
      }
      a.on = false;
    })();
    // Auto-play also stops for good when the header leaves the screen or the tab is hidden.
    const io = new IntersectionObserver(([e]) => !e.isIntersecting && takeOver(), { threshold: 0.2 });
    if (root.current) io.observe(root.current);
    const onHide = () => document.hidden && takeOver();
    document.addEventListener("visibilitychange", onHide);
    return () => {
      a.on = false;
      cancelAnimationFrame(countRaf);
      stopGlide();
      io.disconnect();
      document.removeEventListener("visibilitychange", onHide);
    };
  }, [place, glideTo, takeOver]);

  /** Slider position (0 … 2) under the pointer. */
  const posAt = (clientX) => {
    const r = fill.current.parentElement.getBoundingClientRect();
    return Math.min(LAST, Math.max(0, ((clientX - r.left) / r.width) * LAST));
  };
  const onPointerDown = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    takeOver();
    stopGlide();
    zone.current.setPointerCapture?.(e.pointerId);
    knob.current.focus({ preventScroll: true, focusVisible: false });
    drag.current = { id: e.pointerId, x: e.clientX, moved: false };
    e.preventDefault();
  };
  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    if (!d.moved && Math.abs(e.clientX - d.x) < 4) return;
    d.moved = true;
    place(posAt(e.clientX));
  };
  const onPointerUp = (e) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    // A drag snaps to the nearest stop; a click (on a label or the track) glides to the stop nearest it.
    if (d.moved) glideTo(Math.round(pos.current), 320);
    else glideTo(Math.round(posAt(e.clientX)), 700);
  };
  const onPointerCancel = () => {
    if (!drag.current) return;
    drag.current = null;
    glideTo(Math.round(pos.current), 320);
  };
  const onKeyDown = (e) => {
    const k = e.key;
    const cur = activeRef.current;
    const to =
      k === "ArrowRight" || k === "ArrowUp" || k === "PageUp" ? Math.min(LAST, cur + 1)
      : k === "ArrowLeft" || k === "ArrowDown" || k === "PageDown" ? Math.max(0, cur - 1)
      : k === "Home" ? 0
      : k === "End" ? LAST
      : null;
    if (to === null) return;
    e.preventDefault();
    takeOver();
    glideTo(to, 600);
  };

  const s = STOPS[active];
  const panel = (i) => ({ "data-on": i === active ? "" : undefined, inert: i !== active ? true : undefined, "aria-hidden": i !== active ? true : undefined });
  const [n0, u0] = format(STOPS[0].kwh);

  return (
    <section ref={root} data-scale-header className="sh relative isolate flex flex-col overflow-hidden bg-deep-grid text-white lg:min-h-[clamp(40rem,calc(100svh-4.5rem),54rem)]">
      {/* Top line: the page's h1. */}
      <div className="relative z-10 container-site">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 border-b border-white/15 py-3.5">
          <span className="eyebrow tracking-[0.16em] text-label">Solutions</span>
          <span aria-hidden="true" className="eyebrow text-label">·</span>
          <h1 className="eyebrow tracking-[0.16em] text-white">{title}</h1>
          {aside && <div className="w-full sm:ml-auto sm:w-auto">{aside}</div>}
        </div>
      </div>

      {/* The scenes: behind everything on desktop, on top of the text on phones. */}
      <div ref={sceneBox} className="sh-scenes relative aspect-[5/4] overflow-hidden sm:aspect-[16/10] lg:absolute lg:inset-0 lg:aspect-auto">
        {/* The layers stack among themselves (the newest stop on top); the shade and ring stay above. */}
        <div className="absolute inset-0 isolate">
          {STOPS.map((st, i) =>
            i === 0 || loadOthers ? (
              <div key={st.id} ref={(el) => (layers.current[i] = el)} className="absolute inset-0" style={{ zIndex: i === 0 ? 1 : 0 }}>
                <Scene s={st} first={i === 0} active={i === active} imgRef={(el) => (imgs.current[i] = el)} />
              </div>
            ) : null
          )}
        </div>
        <span aria-hidden="true" className="sh-shade absolute inset-0" />
        <span ref={ring} aria-hidden="true" className="sh-ring pointer-events-none absolute rounded-full opacity-0" />
      </div>

      {/* The text column. */}
      <div className="relative z-10 container-site flex flex-1 flex-col justify-center pb-8 pt-6 lg:py-10">
        <div className="max-w-[35rem]">
          <div className="grid">
            {STOPS.map((st, i) => (
              <div key={st.id} className="sh-panel col-start-1 row-start-1" {...panel(i)}>
                <p className="eyebrow tracking-[0.18em] text-accent">{st.eyebrow}</p>
                <h2 className="mt-3 max-w-[30rem] text-[clamp(2.5rem,1.6rem+2.8vw,4rem)] font-light leading-[1.05] tracking-[-0.02em] text-white">{st.title}</h2>
                <span aria-hidden="true" className="mt-5 block h-[3px] w-11 bg-accent" />
                <p className="mt-5 max-w-[28rem] text-body text-paper/80">{st.desc}</p>
              </div>
            ))}
          </div>

          {/* The live figure and its line. */}
          <div className="mt-6 flex items-center gap-4">
            <p className="flex shrink-0 items-baseline gap-1.5 tabular-nums">
              <span className="sr-only">{figure(s.kwh)}</span>
              <span aria-hidden="true" className="inline-grid">
                <span className="invisible col-start-1 row-start-1 text-[clamp(2.5rem,2rem+1.6vw,3.25rem)] font-semibold leading-none">0.00</span>
                <span ref={num} data-pending="" className="sh-n col-start-1 row-start-1 text-[clamp(2.5rem,2rem+1.6vw,3.25rem)] font-semibold leading-none text-white">
                  {n0}
                </span>
              </span>
              {/* "MWh" (the wider unit), invisible, holds the width: the line beside never moves. */}
              <span aria-hidden="true" className="inline-grid text-h4 font-medium text-accent">
                <span className="invisible col-start-1 row-start-1">MWh</span>
                <span ref={unit} className="sh-u col-start-1 row-start-1">
                  {u0}
                </span>
              </span>
            </p>
            <div className="grid">
              {STOPS.map((st, i) => (
                <p key={st.id} className="sh-panel col-start-1 row-start-1 max-w-[15rem] text-[0.8125rem] leading-snug text-muted" {...panel(i)}>
                  {st.line}
                </p>
              ))}
            </div>
          </div>

          {/* The slider: the knob is the control; the whole zone (track and labels) takes pointer input. */}
          <div
            ref={zone}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
            className="sh-zone relative mt-6 h-16 w-full max-w-[30rem] cursor-pointer select-none px-2.5"
          >
            <div className="absolute inset-x-2.5 top-5">
              <span aria-hidden="true" className="sh-ticks absolute inset-x-0 -top-[3px] h-[7px]" />
              <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-white/25" />
              <span ref={fill} aria-hidden="true" className="sh-fill absolute inset-x-0 -top-px h-[3px] origin-left bg-accent" style={{ transform: "scaleX(0)" }} />
              {/* The rail is the track's width; it slides by a transform (never a layout change). */}
              <span ref={rail} className="absolute inset-x-0 top-0 block h-0" style={{ transform: "translateX(0%)" }}>
              <span
                ref={knob}
                role="slider"
                tabIndex={0}
                aria-label="Storage scale"
                aria-valuemin={0}
                aria-valuemax={LAST}
                aria-valuenow={active}
                aria-valuetext={`${s.stop}, ${figure(s.kwh)}`}
                onKeyDown={onKeyDown}
                onFocus={takeOver}
                className="sh-knob absolute left-0 top-0 block h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full"
              />
              </span>
            </div>
            <div aria-hidden="true" className="absolute inset-x-0 top-9 flex justify-between">
              {STOPS.map((st, i) => (
                <span key={st.id} data-stop={i} className={`sh-label eyebrow tracking-[0.16em] ${i === active ? "text-white" : "text-label"}`}>
                  {st.stop}
                </span>
              ))}
            </div>
          </div>

          {/* Explore + partners: all three links are in the markup; only the current stop's is shown. */}
          <div className="mt-4 grid">
            {STOPS.map((st, i) => (
              <div key={st.id} className="sh-panel col-start-1 row-start-1 flex flex-wrap items-center gap-3" {...panel(i)}>
                <PillLink to={st.to} arrow spotlight>
                  {st.cta}
                </PillLink>
                <ul className="flex flex-wrap gap-1.5" aria-label="Partners">
                  {st.pills.map((p) => (
                    <li key={p} className="rounded-full border border-white/25 px-2.5 py-1 text-micro font-semibold uppercase tracking-[0.12em] text-paper/85">
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom line. */}
      <div aria-hidden="true" className="relative z-10 container-site">
        <div className="flex justify-between border-t border-white/15 py-3.5 eyebrow tracking-[0.16em] text-accent">
          <span>
            0{active + 1} / {s.short}
          </span>
          <span>0{active + 1} / 03</span>
        </div>
      </div>
      {/* No JavaScript: the figure is shown as it is (it otherwise waits hidden for its count). */}
      <noscript>
        <style>{".sh-n[data-pending]{opacity:1;animation:none}"}</style>
      </noscript>
    </section>
  );
}
