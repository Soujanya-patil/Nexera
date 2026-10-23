import { useEffect, useRef, useState } from "react";
import { scene } from "../../lib/scenes";
import { loadGsap } from "../../lib/motion";
import { EASE } from "../../lib/tokens";

// The three segment heroes' photos, in the order the hub lists the segments.
const SLIDES = [
  { img: "res-house", label: "Residential" },
  { img: "ci-industrial", label: "Commercial & Industrial" },
  { img: "utility-solar", label: "Utility-Scale" },
];
const HOLD = 6; // seconds per photo (Ken Burns 1 → 1.06 over the hold)
const FADE = 1.2; // cross-fade

/** The smallest exported width of `name` covering `px` device pixels (else the largest). */
function pick(name, px) {
  const options = scene(name)
    .srcSet.split(", ")
    .map((c) => {
      const [url, w] = c.split(" ");
      return { url, w: parseInt(w, 10) };
    });
  return (options.find((o) => o.w >= px) ?? options[options.length - 1]).url;
}

/** Draws `img` into `canvas` like object-fit: cover, at the canvas's displayed size × device pixels. */
function drawCover(canvas, img) {
  const r = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(r.width * dpr);
  canvas.height = Math.round(r.height * dpr);
  const s = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
  const w = img.naturalWidth * s;
  const h = img.naturalHeight * s;
  canvas.getContext("2d").drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
}

/**
 * The hub hero's "segment ribbon" (desktop, its own chunk): the three segment photos cross-fading in
 * turn, each with a slow Ken Burns push (scale 1 → 1.06 over 6 s), a label under it naming the segment
 * in step with the photo. Decorative (the segment cards below carry the same words): aria-hidden.
 *
 * The photos are drawn into <canvas> elements: canvas content is never a Largest Contentful Paint
 * candidate, so the hero's h1 stays the page's LCP however large the ribbon is (an <img>, even one that
 * starts transparent, is recorded once it fades in). They are fetched once the page is idle (lazy),
 * decoded off the main thread (img.decode), at the size the box needs. Desktop only (the hub renders
 * this from 1024 px). Pauses while off screen or while the tab is hidden. Reduced motion: the first
 * photo and label, static.
 */
export default function SegmentRibbon() {
  const root = useRef(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const canvases = [...el.querySelectorAll("canvas")];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let cancelled = false;
    let io;
    let onScreen = true;
    let paused = false;
    // The running tweens (the current step and the Ken Burns pushes still on screen), paused together.
    const live = new Set();
    const track = (t) => {
      live.forEach((x) => x.progress() === 1 && live.delete(x)); // drop the finished ones
      live.add(t);
      if (paused) t.pause();
      return t;
    };
    const setPaused = (p) => {
      paused = p;
      live.forEach((t) => (p ? t.pause() : t.resume()));
    };
    const imgs = [];
    const onVisibility = () => setPaused(document.hidden || !onScreen);
    const redraw = () => imgs.forEach((img, i) => img && drawCover(canvases[i], img));

    const start = async () => {
      const px = el.getBoundingClientRect().width * Math.min(window.devicePixelRatio || 1, 2);
      const load = (i) => {
        const img = new Image();
        img.src = pick(SLIDES[i].img, px);
        return img.decode().then(() => {
          if (cancelled) return;
          imgs[i] = img;
          drawCover(canvases[i], img);
        });
      };
      await load(0).catch(() => {});
      if (cancelled) return;
      if (reduced) {
        canvases[0].style.opacity = "1";
        return;
      }
      await Promise.all([load(1), load(2)]).catch(() => {});
      const { gsap } = await loadGsap();
      if (cancelled) return;
      // One step per photo: it is raised above the others and fades in ON TOP of the previous photo,
      // which stays fully opaque underneath until the new one is fully in — only then is it hidden.
      // So the picture never thins out over the ground mid-change (no dark dip). Its Ken Burns push
      // (1 → 1.06) runs through its hold and the next photo's fade. After HOLD the next step starts.
      let cur = -1;
      const step = (i) => {
        if (cancelled) return;
        const c = canvases[i];
        const prev = canvases[cur];
        cur = i;
        setIndex(i);
        canvases.forEach((x) => (x.style.zIndex = x === c ? "2" : x === prev ? "1" : "0"));
        track(gsap.fromTo(c, { scale: 1 }, { scale: 1.06, duration: HOLD + FADE, ease: "none" }));
        const tl = gsap.timeline({ onComplete: () => step((i + 1) % canvases.length) });
        tl.fromTo(c, { opacity: 0 }, { opacity: 1, duration: FADE, ease: EASE.inOut }, 0);
        if (prev) tl.set(prev, { opacity: 0 }, FADE);
        tl.call(() => {}, null, HOLD); // the hold: the timeline ends (and the next step starts) at HOLD
        track(tl);
      };
      step(0);
      io = new IntersectionObserver(([e]) => {
        onScreen = e.isIntersecting;
        setPaused(document.hidden || !onScreen);
      });
      io.observe(el);
      document.addEventListener("visibilitychange", onVisibility);
    };
    const idle = window.requestIdleCallback ?? ((fn) => setTimeout(fn, 200));
    const id = idle(() => !cancelled && start(), { timeout: 2500 });
    window.addEventListener("resize", redraw);
    return () => {
      cancelled = true;
      window.cancelIdleCallback?.(id);
      live.forEach((t) => t.kill());
      io?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", redraw);
    };
  }, []);

  return (
    <div ref={root} aria-hidden="true" className="relative">
      <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-deep-grid ring-1 ring-white/10">
        {SLIDES.map((s) => (
          <canvas key={s.img} data-slide="" style={{ opacity: 0 }} className="absolute inset-0 h-full w-full will-change-transform" />
        ))}
        {/* Above the photos, which the cross-fade stacks at z-index 0–2. */}
        <span className="pointer-events-none absolute inset-0 z-[3] bg-gradient-to-t from-deep-grid/70 via-transparent to-transparent" />
      </div>
      {/* The label rolls up from a mask as its photo comes in. */}
      <p className="mt-4 flex items-center gap-3 eyebrow text-paper/80">
        <span className="h-px w-8 bg-accent/70" />
        <span className="relative block h-5 overflow-hidden">
          <span key={index} className="ribbon-label block whitespace-nowrap">
            {SLIDES[index].label}
          </span>
        </span>
      </p>
    </div>
  );
}
