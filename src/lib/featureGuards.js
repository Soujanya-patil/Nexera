/*
 * IntersectionObserver and ResizeObserver are used from the moment the app starts (reveals, lazy
 * scenes, pausing loops off screen, measuring). Every browser the site supports has both; a renderer
 * without one (some crawlers' renderers) would throw on first use — and an error while the app
 * starts would replace the pre-rendered page (StartupBoundary then puts it back, without the app).
 *
 * Only where one is missing, a minimal stand-in is installed: IntersectionObserver reports each
 * observed element once as on screen (content shows, without waiting for a scroll), ResizeObserver
 * reports each element's size once. Browsers that have them are untouched.
 */
if (typeof window !== "undefined") {
  if (typeof window.IntersectionObserver !== "function") {
    window.IntersectionObserver = class IntersectionObserver {
      constructor(callback, options = {}) {
        this.callback = callback;
        this.root = options.root ?? null;
        this.rootMargin = options.rootMargin ?? "0px";
        this.thresholds = [].concat(options.threshold ?? 0);
        this.targets = new Set();
      }
      observe(target) {
        if (this.targets.has(target)) return;
        this.targets.add(target);
        setTimeout(() => {
          if (!this.targets.has(target)) return;
          const rect = target.getBoundingClientRect();
          this.callback([{ target, isIntersecting: true, intersectionRatio: 1, boundingClientRect: rect, intersectionRect: rect, rootBounds: null, time: performance.now() }], this);
        });
      }
      unobserve(target) {
        this.targets.delete(target);
      }
      disconnect() {
        this.targets.clear();
      }
      takeRecords() {
        return [];
      }
    };
  }
  if (typeof window.ResizeObserver !== "function") {
    window.ResizeObserver = class ResizeObserver {
      constructor(callback) {
        this.callback = callback;
        this.targets = new Set();
      }
      observe(target) {
        if (this.targets.has(target)) return;
        this.targets.add(target);
        setTimeout(() => {
          if (!this.targets.has(target)) return;
          const rect = target.getBoundingClientRect();
          const size = [{ inlineSize: rect.width, blockSize: rect.height }];
          this.callback([{ target, contentRect: rect, borderBoxSize: size, contentBoxSize: size, devicePixelContentBoxSize: size }], this);
        });
      }
      unobserve(target) {
        this.targets.delete(target);
      }
      disconnect() {
        this.targets.clear();
      }
    };
  }
}
