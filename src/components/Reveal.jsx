import { createElement, useEffect, useRef } from "react";

/**
 * One fade + rise per block, once, when it first enters the viewport. CSS-driven
 * (see .reveal in index.css); under prefers-reduced-motion it simply shows.
 */
export default function Reveal({ as = "div", delay = 0, className = "", children, ...rest }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("is-in");
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-in");
          io.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return createElement(
    as,
    {
      ref,
      className: `reveal ${className}`,
      style: delay ? { "--reveal-delay": `${delay}s` } : undefined,
      ...rest,
    },
    children
  );
}
