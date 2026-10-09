import { useEffect, useRef } from "react";

/**
 * A thin signal-green reading progress bar under the site header, growing with scroll. The scroll
 * handler only writes one transform per frame; the page height is cached and refreshed by a
 * ResizeObserver, so nothing is measured while scrolling. Decorative (the reader's position is
 * already the scroll position).
 */
export default function ReadingProgress() {
  const bar = useRef(null);
  useEffect(() => {
    let max = 1;
    let raf = 0;
    const measure = () => (max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight));
    const draw = () => {
      raf = 0;
      if (bar.current) bar.current.style.transform = `scaleX(${Math.min(1, Math.max(0, window.scrollY / max))})`;
    };
    const onScroll = () => (raf ||= requestAnimationFrame(draw));
    const ro = new ResizeObserver(() => {
      measure();
      onScroll();
    });
    ro.observe(document.body);
    measure();
    draw();
    window.addEventListener("scroll", onScroll, { passive: true });
    const onResize = () => {
      measure();
      onScroll();
    };
    window.addEventListener("resize", onResize);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-16 z-40 h-[3px]">
      <div ref={bar} className="h-full origin-left bg-signal" style={{ transform: "scaleX(0)" }} />
    </div>
  );
}
