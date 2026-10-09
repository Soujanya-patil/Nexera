import { useEffect, useRef, useState } from "react";
import { SCENES } from "./scenes";
import { DESKTOP_Q, loadArticleMotion, matches } from "./motion";

/** True once (and while) the media query matches — false on the server and in the first render. */
export function useMedia(q) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const m = window.matchMedia(q);
    const set = () => setOn(m.matches);
    set();
    m.addEventListener("change", set);
    return () => m.removeEventListener("change", set);
  }, [q]);
  return on;
}

/** The article motion bundle once it has loaded (null until then, and always under reduced motion). */
export function useArticleMotion(enabled = true) {
  const [motion, setMotion] = useState(null);
  useEffect(() => {
    if (!enabled) return;
    let live = true;
    loadArticleMotion()
      .then((m) => live && setMotion(m))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [enabled]);
  return motion;
}

/** Whether `ref` is at least partly on screen (one IntersectionObserver). */
function useOnScreen(ref, rootMargin = "0px") {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);
  return on;
}

/**
 * Desktop (≥ 1024px): the sticky scene stage beside the text. One scene per section (data/articles.js
 * `visual`), stacked; the one for the section being read is shown — the others cross-fade out. Scenes
 * mount lazily (the current one and its neighbours, kept once mounted), animate only while the stage
 * is on screen, and replay as the reader arrives at them, in either direction. Rendered only in the
 * browser, at desktop widths; its column is reserved in the page, so it never shifts anything.
 */
export function Stage({ sections, reading, hover, motion }) {
  const desktop = useMedia(DESKTOP_Q);
  const root = useRef(null);
  const visible = useOnScreen(root);
  const [mounted, setMounted] = useState(() => new Set());
  const at = Math.max(0, sections.findIndex((s) => s.id === reading.section));

  useEffect(() => {
    if (!desktop || !visible) return;
    setMounted((m) => {
      const want = [at - 1, at, at + 1].filter((i) => i >= 0 && i < sections.length && !m.has(i));
      if (!want.length) return m;
      const next = new Set(m);
      want.forEach((i) => next.add(i));
      return next;
    });
  }, [desktop, visible, at, sections.length]);

  return (
    <div ref={root} aria-label="Illustration for the section being read" role="region" className="article-stage sticky top-[max(5.5rem,calc(50svh-14rem))] hidden lg:block">
      <div className="article-stage-frame relative h-[30rem] overflow-hidden rounded-[28px] border border-white/10 bg-night text-white shadow-[0_30px_60px_-30px_rgba(7,26,23,0.55)]">
        <div aria-hidden="true" className="article-stage-grid pointer-events-none absolute inset-0" />
        {/* Until the scenes mount: the first scene, static (in the browser only — the pre-rendered page
            keeps just the stage's reserved frame, so the HTML stays light). */}
        {desktop && mounted.size === 0 && (
          <div data-scene={sections[0].visual} data-static data-on className="article-stage-slot absolute inset-0">
            <FirstScene section={sections[0]} />
          </div>
        )}
        {desktop &&
          sections.map((s, i) => {
            if (!mounted.has(i)) return null;
            const { Scene } = SCENES[s.visual];
            const on = i === at;
            return (
              <div key={s.id} data-scene={s.visual} data-on={on || undefined} inert={!on || undefined} aria-hidden={!on || undefined} className="article-stage-slot absolute inset-0">
                <Scene active={on && visible} motion={motion} mode="stage" step={on ? reading.step : -1} hover={on ? hover : null} />
              </div>
            );
          })}
        <p aria-hidden="true" className="absolute bottom-4 left-0 right-0 text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
          {sections[at]?.h2}
        </p>
      </div>
    </div>
  );
}

function FirstScene({ section }) {
  const { Scene } = SCENES[section.visual];
  return <Scene active={false} motion={null} mode="stage" step={-1} hover={null} />;
}

/**
 * Phones and tablets (< 1024px): a section's scene under its heading, full width, at a reserved height.
 * The pre-rendered page keeps only the reserved box (light HTML, no layout shift); the scene mounts in
 * the browser once it comes near the screen and animates while it is on it. Hidden on desktop, where
 * the stage shows it — and without JavaScript (index.css), where there is nothing to show in it.
 */
export function SceneInline({ section, reading, motion }) {
  const { Scene, inline } = SCENES[section.visual];
  const root = useRef(null);
  const near = useOnScreen(root, "200px 0px");
  const inView = useOnScreen(root, "-25% 0px -25% 0px");
  const [mobile, setMobile] = useState(false);
  useEffect(() => setMobile(!matches(DESKTOP_Q)), []);
  const live = mobile && near;
  return (
    <div
      ref={root}
      style={{ height: inline }}
      className="article-inline-scene relative mt-6 overflow-hidden rounded-3xl border border-white/10 bg-night text-white lg:hidden"
    >
      <div aria-hidden="true" className="article-stage-grid pointer-events-none absolute inset-0" />
      <div className="relative h-full">
        {live && <Scene active={inView} motion={motion} mode="inline" step={reading.section === section.id ? reading.step : -1} />}
      </div>
    </div>
  );
}
