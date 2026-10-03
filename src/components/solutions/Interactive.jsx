import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { partnerOf } from "../../data/products";
import { getLenis } from "../../lib/lenis";
import { useScrollReveal } from "../../lib/scrollReveal";

/*
 * Interaction layer for the Solutions pages. Desktop-only effects check FINE_POINTER (and motion) at
 * mount and do nothing on touch, small screens or under reduced motion. Every listener and frame
 * request is removed on unmount (route change).
 */

const FINE_POINTER = "(hover: hover) and (pointer: fine) and (min-width: 1024px) and (prefers-reduced-motion: no-preference)";
const fine = () => window.matchMedia(FINE_POINTER).matches;

/**
 * A soft radial light (~420 px radius, faint green-white) that follows the cursor across its parent
 * section (which must be `relative overflow-hidden`; content after it in the DOM stacks above).
 * Moved with transform only, at most once per frame.
 */
export function Spotlight() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    const host = el?.parentElement;
    if (!el || !host || !fine()) return;
    let raf = 0;
    let x = 0;
    let y = 0;
    const paint = () => {
      raf = 0;
      el.style.transform = `translate3d(${x - 420}px, ${y - 420}px, 0)`;
    };
    const move = (e) => {
      const r = host.getBoundingClientRect();
      x = e.clientX - r.left;
      y = e.clientY - r.top;
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const enter = () => (el.style.opacity = "1");
    const leave = () => (el.style.opacity = "0");
    host.addEventListener("pointermove", move, { passive: true });
    host.addEventListener("pointerenter", enter);
    host.addEventListener("pointerleave", leave);
    return () => {
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerenter", enter);
      host.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute left-0 top-0 h-[840px] w-[840px] rounded-full opacity-0 transition-opacity duration-500"
      style={{ background: "radial-gradient(closest-side, rgba(226,246,221,0.075), rgba(144,217,136,0.035) 55%, transparent)" }}
    />
  );
}

/**
 * Card tilt (the "flip, lite"): the card leans toward the cursor by up to `max` degrees and a glare
 * highlight follows it. Writes four custom properties on the card, at most once per frame; the card's
 * style reads them. Desktop pointer + motion only.
 */
export function useTilt(ref, max = 6) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !fine()) return;
    let raf = 0;
    let px = 0.5;
    let py = 0.5;
    const paint = () => {
      raf = 0;
      el.style.setProperty("--rx", `${((0.5 - py) * 2 * max).toFixed(2)}deg`);
      el.style.setProperty("--ry", `${((px - 0.5) * 2 * max).toFixed(2)}deg`);
      el.style.setProperty("--gx", `${(px * 100).toFixed(1)}%`);
      el.style.setProperty("--gy", `${(py * 100).toFixed(1)}%`);
    };
    const move = (e) => {
      const r = el.getBoundingClientRect();
      px = (e.clientX - r.left) / r.width;
      py = (e.clientY - r.top) / r.height;
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const leave = () => {
      px = 0.5;
      py = 0.5;
      if (!raf) raf = requestAnimationFrame(paint);
    };
    el.addEventListener("pointermove", move, { passive: true });
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(raf);
    };
  }, [ref, max]);
}

/**
 * Kinetic keyword ticker: one list of capability keywords scrolling slowly left (CSS, ~40 s a loop),
 * paused on hover. The first copy is the real list; the copies that make the loop seamless are
 * aria-hidden. It is one animated strip that runs only while it is on screen (so it costs nothing
 * during page load or once scrolled past). Without JavaScript, and under reduced motion, it is static
 * (index.css).
 */
export function KeywordTicker({ items, label }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) el.dataset.run = "";
      else delete el.dataset.run;
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const list = (hidden) => (
    <ul aria-hidden={hidden || undefined} className="ticker-track flex shrink-0 items-center">
      {items.map((k) => (
        <li key={k} className="flex items-center whitespace-nowrap px-5 text-sm font-medium tracking-wide text-ice/80">
          <span aria-hidden="true" className="mr-10 h-1 w-1 rounded-full bg-signal/80" />
          {k}
        </li>
      ))}
    </ul>
  );
  return (
    <section aria-label={label} className="overflow-hidden border-t border-white/10 bg-deep py-4 text-white">
      <div ref={ref} className="ticker [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]">
        <div className="ticker-strip flex w-max">
          {list(false)}
          {list(true)}
          {list(true)}
          {list(true)}
        </div>
      </div>
    </section>
  );
}

/**
 * Horizontal rail ("pan / conveyor"): snap-scrolling cards with progress dots and arrow buttons.
 * Mouse users can also drag it; trackpads and shift + wheel scroll it natively; touch swipes it. The
 * page's vertical scroll is never taken over. Every card's text stays in the DOM.
 */
export function AppRail({ items, label }) {
  const rail = useRef(null);
  // The rail reveals as one unit: a per-card reveal would leave the cards clipped off to the side
  // waiting (invisible) until swiped in.
  const wrap = useRef(null);
  const reveal = useScrollReveal(wrap);
  const [active, setActive] = useState(0);

  const step = () => {
    const first = rail.current?.children[0];
    if (!first) return 1;
    const gap = parseFloat(getComputedStyle(rail.current).columnGap) || 0;
    return first.getBoundingClientRect().width + gap;
  };
  const go = (i) => {
    const n = Math.max(0, Math.min(items.length - 1, i));
    rail.current.scrollTo({ left: n * step(), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const max = el.scrollWidth - el.clientWidth;
        // The last cards can't reach the left edge: the end of the rail selects the last one.
        setActive(el.scrollLeft >= max - 4 ? items.length - 1 : Math.round(el.scrollLeft / step()));
      });
    };
    // Drag to scroll (mouse only; touch scrolls natively).
    let drag = null;
    const down = (e) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      drag = { x: e.clientX, left: el.scrollLeft, moved: false };
      el.style.scrollSnapType = "none";
    };
    const move = (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (Math.abs(dx) > 3) drag.moved = true;
      el.scrollLeft = drag.left - dx;
    };
    const up = () => {
      if (!drag) return;
      const moved = drag.moved;
      drag = null;
      el.style.scrollSnapType = "";
      if (moved) go(Math.round(el.scrollLeft / step()));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  return (
    <div ref={wrap} data-sr-state={reveal} className="mt-12">
      <ul
        ref={rail}
        data-sr
        aria-label={label}
        data-lenis-prevent-wheel
        className="rail -mx-1 flex cursor-grab snap-x snap-mandatory gap-5 overflow-x-auto px-1 pb-3 active:cursor-grabbing"
      >
        {items.map(({ icon: Icon, title, text }) => (
          <li
            key={title}
            className="group/app w-[16.5rem] shrink-0 snap-start select-none rounded-2xl border border-line bg-paper p-6 transition-[border-color,translate,box-shadow] duration-300 hover:-translate-y-1 hover:border-forest/25 hover:shadow-[0_18px_40px_-28px_rgba(7,26,23,0.45)] sm:w-[18rem]"
          >
            <span className="grid h-12 w-12 place-items-center rounded-full bg-ice text-forest transition-colors duration-300 group-hover/app:bg-signal/30">
              <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.7} />
            </span>
            <h3 className="mt-5 font-semibold text-ink">{title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-graphite">{text}</p>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {items.map((it, i) => (
            <button
              key={it.title}
              type="button"
              onClick={() => go(i)}
              aria-label={`Show ${it.title}`}
              aria-current={i === active || undefined}
              className="grid h-6 w-6 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-signal"
            >
              <span
                className={`block h-1.5 w-5 origin-center rounded-full transition-[scale,background-color] duration-300 motion-reduce:transition-none ${
                  i === active ? "scale-x-100 bg-forest" : "scale-x-[0.3] bg-forest/25"
                }`}
              />
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {[
            [-1, ChevronLeft, "Previous"],
            [1, ChevronRight, "Next"],
          ].map(([d, Icon, name]) => (
            <button
              key={name}
              type="button"
              onClick={() => go(active + d)}
              aria-label={name}
              disabled={d < 0 ? active === 0 : active === items.length - 1}
              className="grid h-11 w-11 place-items-center rounded-full border border-line bg-paper text-forest transition-colors hover:border-forest/40 disabled:opacity-35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
            >
              <Icon aria-hidden="true" className="h-5 w-5" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Partner logo strip ("gallery"): each partner slides in with the reveal and its logo scales gently on
 * hover, with the partner's name as visible text beside it (Midea has no logo file: name only).
 */
export function PartnerStrip({ partners, label = "Technology partners", className = "" }) {
  const list = useRef(null);
  const reveal = useScrollReveal(list);
  return (
    <ul ref={list} data-sr-state={reveal} aria-label={label} className={`flex flex-wrap items-center justify-center gap-x-12 gap-y-6 ${className}`}>
      {partners.map((id) => {
        const p = partnerOf(id);
        const name = p?.name ?? id.charAt(0).toUpperCase() + id.slice(1);
        return (
          <li data-sr key={id} className="group/logo flex items-center gap-3">
            {p ? (
              <img
                src={p.logo}
                alt=""
                className={`${p.id === "clou" ? "h-8" : "h-6"} w-auto transition-transform duration-500 ease-out group-hover/logo:scale-110`}
              />
            ) : null}
            <span className={`font-semibold text-forest transition-colors duration-300 group-hover/logo:text-ink ${p ? "text-sm" : "text-lg uppercase tracking-tight"}`}>
              {name}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Section progress rail (desktop ≥ 1280 px): a dot per visible section heading on the page, the
 * current one highlighted, the heading shown beside a dot on hover / focus. Clicking a dot glides to
 * that section below the sticky header (Lenis when running).
 */
export function SectionRail() {
  const [sections, setSections] = useState([]);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    if (!window.matchMedia("(min-width: 1280px)").matches) return;
    const els = [...document.querySelectorAll("main section[aria-labelledby]")]
      .map((s) => ({ el: s, h: document.getElementById(s.getAttribute("aria-labelledby")) }))
      .filter(({ h }) => h && !h.classList.contains("sr-only") && h.tagName === "H2");
    setSections(els.map(({ el, h }) => ({ id: el.id, label: h.textContent.trim(), el })));
    let raf = 0;
    const update = () => {
      raf = 0;
      const line = window.innerHeight * 0.35;
      let idx = -1;
      els.forEach(({ el }, i) => {
        if (el.getBoundingClientRect().top <= line) idx = i;
      });
      setActive(idx);
    };
    const onScroll = () => !raf && (raf = requestAnimationFrame(update));
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!sections.length) return null;
  const go = (el) => {
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(el, { offset: -64, duration: 1 });
    else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 64, behavior: "smooth" });
  };
  return (
    <nav aria-label="Page sections" className="fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 xl:block">
      <ol className="flex flex-col gap-1 rounded-full bg-paper/85 px-1.5 py-3 shadow-[0_10px_30px_-18px_rgba(7,26,23,0.5)] ring-1 ring-black/5 backdrop-blur">
        {sections.map((s, i) => (
          <li key={s.id || s.label} className="relative">
            <button
              type="button"
              onClick={() => go(s.el)}
              aria-current={i === active ? "location" : undefined}
              className="group/dot grid h-6 w-6 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-signal"
            >
              <span
                className={`block h-2.5 w-2.5 rounded-full transition-[scale,background-color] duration-300 motion-reduce:transition-none ${
                  i === active ? "scale-100 bg-signal ring-2 ring-forest/70" : "scale-[0.6] bg-forest/35 group-hover/dot:bg-forest"
                }`}
              />
              <span className="pointer-events-none absolute right-full mr-3 max-w-[16rem] truncate whitespace-nowrap rounded-md bg-ink px-2.5 py-1 text-xs font-medium text-white opacity-0 transition-opacity duration-200 group-hover/dot:opacity-100 group-focus-visible/dot:opacity-100 motion-reduce:transition-none">
                {s.label}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * Renders `children` only once this box is within about one screen of the viewport (then keeps them).
 * The box reserves its space (`className` sets the size), so nothing shifts when the content arrives.
 */
export function NearViewport({ className = "", children }) {
  const ref = useRef(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        setNear(true);
      },
      { rootMargin: "100% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [near]);
  return (
    <div ref={ref} className={className}>
      {near ? children : null}
    </div>
  );
}
