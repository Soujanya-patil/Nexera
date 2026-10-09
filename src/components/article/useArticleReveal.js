import { useEffect } from "react";
import { onceInView } from "../../lib/inview";
import { FINE_POINTER_Q, matches } from "./motion";

const MAX_STAGGER = 0.2;
const each = (n, step) => (n > 1 ? Math.min(step, MAX_STAGGER / (n - 1)) : 0);

/**
 * The article's reveals, once the motion bundle has loaded (never under reduced motion):
 *   data-rv="h2"     the green line above a heading draws in (DrawSVG), then the heading's words
 *                    rise out of a mask (SplitText)
 *   data-rv="split"  a heading's words rise out of a mask (the closing band)
 *   data-rv="text"   a quick, gentle fade-up (14px); a bold lead-in inside gets its highlighter sweep
 *   data-rv="term"   a Key term: fades up, its left border fills top to bottom, "KEY TERM" scrambles in
 *   data-rv="card"   a Related card: rises, its icon draws in
 * Items arriving together are staggered (never more than 0.2s across a group). Like the rest of the
 * site, nothing visible is ever hidden: an item is put into its waiting state only while it is still
 * below the screen, and an item arriving in a fast scroll (or jumped past) is simply shown.
 *
 * Also wires the Key terms' small 3D tilt (±4°, mouse / pen only) and the CTA's shine, which runs only
 * while the CTA is on screen.
 */
export function useArticleReveal(ref, motion) {
  useEffect(() => {
    const root = ref.current;
    if (!motion || !root) return;
    const { gsap, SplitText } = motion;
    const offs = [];
    const splits = new Map();

    const ctx = gsap.context(() => {
      const items = [...root.querySelectorAll("[data-rv]")];
      const words = (el) => {
        const h = el.matches("h2") ? el : el.querySelector("h2");
        if (!splits.has(el)) splits.set(el, new SplitText(h, { type: "words", mask: "words" }));
        return splits.get(el).words;
      };
      const wait = (el) => {
        el.dataset.rvState = "wait";
        const kind = el.dataset.rv;
        if (kind === "h2") {
          gsap.set(el.querySelector(".article-h2-line line"), { drawSVG: "0%" });
          gsap.set(words(el), { yPercent: 105 });
        } else if (kind === "split") gsap.set(words(el), { yPercent: 105 });
        else {
          gsap.set(el, { opacity: 0, y: kind === "card" ? 22 : 14 });
          if (kind === "card") gsap.set(el.querySelector("[data-icon]"), { drawSVG: "0%" });
        }
      };
      const done = (el) => {
        delete el.dataset.rvState;
        splits.get(el)?.revert();
        splits.delete(el);
      };
      const show = (el) => {
        gsap.set(el, { clearProps: "opacity,transform" });
        gsap.set(el.querySelectorAll(".article-h2-line line, [data-icon]"), { clearProps: "all" });
        done(el);
      };
      const enter = (batch) => {
        const heads = batch.filter((el) => el.dataset.rv === "h2" || el.dataset.rv === "split");
        const rest = batch.filter((el) => !heads.includes(el));
        for (const el of heads) {
          const tl = gsap.timeline({ onComplete: () => done(el) });
          const line = el.querySelector(".article-h2-line line");
          if (line) tl.to(line, { drawSVG: "100%", duration: 0.45, ease: "power2.inOut" });
          tl.to(words(el), { yPercent: 0, duration: 0.55, stagger: 0.035, ease: "power3.out" }, line ? 0.2 : 0);
        }
        if (rest.length)
          gsap.to(rest, {
            opacity: 1,
            y: 0,
            duration: 0.35,
            ease: "power2.out",
            stagger: each(rest.length, 0.06),
            clearProps: "opacity,transform",
          });
        rest.forEach((el, i) => {
          const at = i * each(rest.length, 0.06);
          gsap.delayedCall(at, () => delete el.dataset.rvState);
          if (el.dataset.rv === "term") {
            const label = el.querySelector("[data-label]");
            if (label) gsap.to(label, { delay: at, duration: 0.6, scrambleText: { text: "{original}", chars: "KEYTRMABCDE", speed: 0.5 } });
          }
          if (el.dataset.rv === "card") gsap.to(el.querySelector("[data-icon]"), { drawSVG: "100%", delay: at + 0.15, duration: 0.7, ease: "power2.inOut" });
        });
      };
      for (const el of items) offs.push(onceInView(el, { enter, show: () => show(el), below: () => wait(el) }));
    }, root);

    // Key terms: a small 3D tilt following the pointer (mouse / pen only).
    const tilt = (e) => {
      const card = e.target.closest?.("[data-tilt]");
      if (!card) return;
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty("--ry", `${(x * 8).toFixed(2)}deg`);
      card.style.setProperty("--rx", `${(-y * 8).toFixed(2)}deg`);
    };
    const untilt = (e) => {
      const card = e.target.closest?.("[data-tilt]");
      if (card && !card.contains(e.relatedTarget)) {
        card.style.removeProperty("--rx");
        card.style.removeProperty("--ry");
      }
    };
    if (matches(FINE_POINTER_Q)) {
      root.addEventListener("pointermove", tilt, { passive: true });
      root.addEventListener("pointerout", untilt, { passive: true });
    }

    // The CTA's shine runs only while it is on screen.
    const io = new IntersectionObserver((entries) => entries.forEach((e) => (e.target.dataset.inview = e.isIntersecting ? "1" : "")));
    root.querySelectorAll("[data-shine]").forEach((el) => io.observe(el));

    return () => {
      offs.forEach((off) => off());
      io.disconnect();
      root.removeEventListener("pointermove", tilt);
      root.removeEventListener("pointerout", untilt);
      splits.forEach((s) => s.revert());
      ctx.revert();
      root.querySelectorAll("[data-rv-state]").forEach((el) => delete el.dataset.rvState);
    };
  }, [ref, motion]);
}
