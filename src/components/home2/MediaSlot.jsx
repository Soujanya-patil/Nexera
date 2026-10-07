import { useEffect, useRef, useState } from "react";

/*
 * Home v2's art-directed media, by exact file name (src/assets/home2/README.md). Only the web
 * versions that scripts/home2-media.mjs writes to src/assets/home2/web/ are bundled; a slot whose
 * file is not there yet renders its code-made `fallback`. Dropping the files in and rebuilding swaps
 * them in with no code change.
 */
const files = import.meta.glob("../../assets/home2/web/*.{webp,mp4}", { eager: true, query: "?url", import: "default" });
const manifests = import.meta.glob("../../assets/home2/web/manifest.json", { eager: true, import: "default" });
const manifest = Object.values(manifests)[0] ?? {};
const url = (f) => files[`../../assets/home2/web/${f}`];
const base = (file) => file.replace(/\.[a-z0-9]+$/i, "");

/** { src, srcSet, width, height } for an image slot ("why-dusk.png"), or null if it isn't there. */
function image(name) {
  const m = manifest[name];
  if (!m?.widths) return null;
  const v = m.widths.map((w) => ({ w, u: url(`${name}-${w}.webp`) })).filter((x) => x.u);
  if (!v.length) return null;
  const mid = v.find((x) => x.w >= 1280) ?? v.at(-1);
  return { src: mid.u, srcSet: v.map((x) => `${x.u} ${x.w}w`).join(", "), width: m.width, height: m.height };
}
/** A video slot ("hero-blueprint.mp4"): its 1080p / 720p files and generated poster, or null. */
function video(file) {
  const src = base(file);
  const [name, m] = Object.entries(manifest).find(([, e]) => e.kind === "video" && e.source === src) ?? [];
  if (!m) return null;
  const desktop = url(`${name}-1080.mp4`);
  const mobile = url(`${name}-720.mp4`);
  if (!desktop || !mobile) return null;
  const pv = m.poster.map((w) => ({ w, u: url(`${name}-poster-${w}.webp`) })).filter((x) => x.u);
  const mid = pv.find((x) => x.w >= 1280) ?? pv.at(-1);
  const poster = mid && { src: mid.u, srcSet: pv.map((x) => `${x.u} ${x.w}w`).join(", "), width: m.width, height: m.height };
  return { desktop, mobile, poster };
}
export const hasMedia = (file) => (/\.(mp4|mov|webm)$/i.test(file) ? !!video(file) : !!image(base(file)));

function Img({ img, alt, sizes, eager, className, fetchPriority, slot }) {
  return (
    <img
      src={img.src}
      srcSet={img.srcSet}
      sizes={sizes}
      width={img.width}
      height={img.height}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={fetchPriority}
      decoding="async"
      data-slot={slot}
      className={className}
    />
  );
}

const slowNet = () => {
  const n = navigator.connection;
  return !!n && (n.saveData || /(^|-)(2g|3g)$/.test(n.effectiveType ?? ""));
};

/**
 * One media slot. `file` is the exact file name. Images: a responsive WebP <img>. Videos: the poster
 * (`poster` file, else the video's first frame) is the first paint; the video loads after the page
 * `load` event — 1080p on screens ≥ 768 px, 720p below — and fades in once it can play. Save-Data,
 * 2g / 3g and reduced motion keep the still (`still` file if given, else the poster). `loop` videos
 * pause off screen; `desktopOnly` videos never load below 1024 px. Missing file → `fallback`.
 */
export default function MediaSlot({ file, poster, still, alt = "", sizes = "100vw", eager = false, fetchPriority, className = "", loop = false, desktopOnly = false, fallback = null, onEnded }) {
  const isVideo = /\.(mp4|mov|webm)$/i.test(file);
  const v = isVideo ? video(file) : null;
  const hasVideo = !!v;
  const ref = useRef(null);
  const [play, setPlay] = useState(false);
  const [shown, setShown] = useState(false);
  const [useStill, setUseStill] = useState(false);

  useEffect(() => {
    if (!hasVideo) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || slowNet()) return void setUseStill(true);
    if (desktopOnly && !window.matchMedia("(min-width: 1024px)").matches) return;
    const go = () => setPlay(true);
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });
    return () => window.removeEventListener("load", go);
  }, [hasVideo, desktopOnly]);

  // Loops pause off screen.
  useEffect(() => {
    const el = ref.current;
    if (!play || !loop || !el) return;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? el.play().catch(() => {}) : el.pause()));
    io.observe(el);
    return () => io.disconnect();
  }, [play, loop]);

  if (!isVideo) {
    const img = image(base(file));
    return img ? <Img img={img} alt={alt} sizes={sizes} eager={eager} fetchPriority={fetchPriority} className={className} slot={file} /> : fallback;
  }
  if (!v) return fallback;
  const posterImg = (poster && image(base(poster))) || v.poster;
  const stillImg = (useStill && still && image(base(still))) || posterImg;
  return (
    <div className="relative h-full w-full" data-slot={file}>
      {stillImg && <Img img={stillImg} alt={alt} sizes={sizes} eager={eager} fetchPriority={fetchPriority} className={className} />}
      {play && (
        <video
          ref={ref}
          src={window.matchMedia("(min-width: 768px)").matches ? v.desktop : v.mobile}
          muted
          playsInline
          autoPlay
          loop={loop}
          preload="auto"
          aria-hidden="true"
          onCanPlayThrough={() => setShown(true)}
          onEnded={onEnded}
          className={`absolute inset-0 transition-opacity duration-700 ${shown ? "opacity-100" : "opacity-0"} ${className}`}
        />
      )}
    </div>
  );
}
