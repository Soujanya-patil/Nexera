import { useEffect, useState } from "react";

/**
 * Follows the reader through the article: which section is being read, and how far into it (its
 * last list item / numbered question / Key term that has passed the reading line, 45% down the
 * screen). One IntersectionObserver whose root is a 1px line there: an element has "passed" it while
 * it straddles the line or is above it, so the answer is right in both scroll directions and nothing
 * is measured while scrolling.
 *
 * Markup: each section carries data-section="<id>"; each step data-step="<index>" and data-of="<id>".
 * Returns { section, step } — section is the first section's id until the first one reaches the line;
 * step is -1 until the section's first step has passed it.
 */
export function useReading(rootRef, sectionIds) {
  const key = sectionIds.join(",");
  const [state, setState] = useState({ section: sectionIds[0], step: -1 });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const order = key.split(",");
    const passedSection = new Map();
    const passedStep = new Map(); // element -> boolean
    const steps = [...root.querySelectorAll("[data-step]")];
    const update = () => {
      const section = order.filter((id) => passedSection.get(id)).at(-1) ?? order[0];
      let step = -1;
      for (const el of steps) if (el.dataset.of === section && passedStep.get(el)) step = Math.max(step, Number(el.dataset.step));
      setState((s) => (s.section === section && s.step === step ? s : { section, step }));
    };
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const passed = e.isIntersecting || e.boundingClientRect.top < (e.rootBounds?.top ?? 0);
          if (e.target.dataset.section) passedSection.set(e.target.dataset.section, passed);
          else passedStep.set(e.target, passed);
        }
        update();
      },
      { rootMargin: "-45% 0px -54% 0px" }
    );
    root.querySelectorAll("[data-section]").forEach((el) => io.observe(el));
    steps.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [rootRef, key]);

  return state;
}
