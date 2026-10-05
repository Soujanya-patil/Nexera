import { useEffect, useRef, useState } from "react";
import { scene } from "../../lib/scenes";
import { loadGsap } from "../../lib/motion";

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
    let tl;
    let io;
    let onScreen = true;
    const imgs = [];
    const onVisibility = () => tl && (document.hidden ? tl.pause() : onScreen && tl.play());
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
      tl = gsap.timeline({ repeat: -1 });
      canvases.forEach((c, i) => {
        const at = i * HOLD;
        tl.call(() => setIndex(i), null, at)
          .fromTo(c, { opacity: 0 }, { opacity: 1, duration: FADE, ease: "power1.inOut" }, at)
          .fromTo(c, { scale: 1 }, { scale: 1.06, duration: HOLD + FADE, ease: "none" }, at)
          .to(c, { opacity: 0, duration: FADE, ease: "power1.inOut" }, at + HOLD);
      });
      io = new IntersectionObserver(([e]) => {
        onScreen = e.isIntersecting;
        if (onScreen && !document.hidden) tl.play();
        else tl.pause();
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
      tl?.kill();
      io?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", redraw);
    };
  }, []);

  return (
    <div ref={root} aria-hidden="true" className="relative">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-deep ring-1 ring-white/10">
        {SLIDES.map((s) => (
          <canvas key={s.img} data-slide="" style={{ opacity: 0 }} className="absolute inset-0 h-full w-full will-change-transform" />
        ))}
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night/70 via-transparent to-transparent" />
      </div>
      {/* The label rolls up from a mask as its photo comes in. */}
      <p className="mt-4 flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.18em] text-ice/80">
        <span className="h-px w-8 bg-signal/70" />
        <span className="relative block h-5 overflow-hidden">
          <span key={index} className="ribbon-label block whitespace-nowrap">
            {SLIDES[index].label}
          </span>
        </span>
      </p>
    </div>
  );
}
