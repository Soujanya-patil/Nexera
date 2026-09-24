import { useRef } from "react";
import { useMotion, useScrollScene } from "../lib/motion";

/**
 * Large section-opening typography with a word-by-word rise. Scaled up from the `text-3xl
 * md:text-4xl` the section headings used to share, so a section intro reads as a title card rather
 * than as another paragraph — the hierarchy jump is the point, not the animation.
 *
 * Each word sits in its own overflow-hidden clip, so the rise reads as type emerging from behind a
 * baseline rather than as a block sliding around. Words, not characters: per-character staggers on
 * a headline this size read as decoration, and they wreck screen-reader and find-in-page behaviour.
 * The full heading text is kept intact for assistive tech via `sr-only`, and the animated copy is
 * `aria-hidden`, so the split never reaches the accessibility tree.
 *
 * MOTION — cinematic mode animates; "light" and "static" render the finished state. The JSX default
 * is therefore the VISIBLE one and GSAP applies the hidden start itself (via `fromTo`), so a failed
 * GSAP load or a reduced-motion visitor still gets a fully legible heading rather than blank space.
 */
export default function DisplayHeading({ eyebrow, children, className = "", as: Tag = "h2" }) {
  const { mode } = useMotion();
  const cine = mode === "cinematic";
  const root = useRef(null);
  const words = String(children).split(" ");

  useScrollScene(
    root,
    ({ gsap, q }) => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: "top 82%", once: true, invalidateOnRefresh: true },
      });
      if (eyebrow) tl.fromTo(q('[data-a="dh-eyebrow"]'), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" }, 0);
      tl.fromTo(
        q('[data-a="dh-word"]'),
        { yPercent: 115 },
        { yPercent: 0, duration: 0.7, ease: "power3.out", stagger: 0.045 },
        eyebrow ? 0.12 : 0
      );
    },
    cine
  );

  return (
    <div ref={root} className={className}>
      {eyebrow && (
        <p data-a="dh-eyebrow" className="text-xs font-medium uppercase tracking-[0.2em] text-bone/60">
          {eyebrow}
        </p>
      )}
      <Tag className="mt-3 font-serif font-semibold leading-[1.04] text-balance text-bone text-[clamp(2rem,4.6vw,3.75rem)]">
        <span className="sr-only">{children}</span>
        <span aria-hidden="true">
          {words.map((w, i) => (
            // inline-block clip per word; the trailing space keeps normal word spacing and wrapping
            <span key={`${w}-${i}`} className="inline-block overflow-hidden align-bottom">
              <span data-a="dh-word" className="inline-block will-change-transform">
                {w}
                {i < words.length - 1 ? " " : ""}
              </span>
            </span>
          ))}
        </span>
      </Tag>
    </div>
  );
}
