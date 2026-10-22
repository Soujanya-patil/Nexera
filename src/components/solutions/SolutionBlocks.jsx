import { createContext, lazy, Suspense, useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Check, ChevronDown, ChevronRight } from "lucide-react";
import { KineticEyebrow, KineticHeading } from "./Kinetic";
import { ArrowLink, SEGMENT_OFFSET, Spotlight, useTilt } from "./Interactive";
import MagneticButton from "../ui/MagneticButton";
import PillLink from "../PillLink";
import SceneImg from "../SceneImg";
import CountUp from "../CountUp";
import { depth, usePointerDepth } from "../../lib/pointerDepth";
import { useIntro } from "../../lib/intro";
import { isFirstLoad } from "../../lib/firstLoad";
import { useScrollReveal } from "../../lib/scrollReveal";
import { scrollToId } from "../../lib/scrollTo";
import { useRouteTransition } from "../../lib/viewTransition";
import { loadGsap } from "../../lib/motion";
import { onceInView } from "../../lib/inview";
import { SCRUB, useScrub } from "../../lib/scrub";
import { partnerOf } from "../../data/products";
import { topicSlug } from "../../data/solutionTopics";
import { DUR, EASE, STAGGER } from "../../lib/tokens";
import { toggleDetails } from "../../lib/accordion";

/*
 * Building blocks for the three Solutions pages (/solutions/utility-scale, /commercial-industrial,
 * /residential). Each reuses an existing site pattern — the For EPCs hero, the eyebrow + animated h2
 * section heading, the product page's icon-circle highlights, the catalogue card's plinth, PillLink /
 * MagneticButton CTAs and the scroll reveal — so the pages read as part of the same site.
 *
 * Headings: the hero's h1 is the page's only h1; every section heading is an h2; cards and items are
 * h3. All copy is real text in the markup.
 */

const TONES = { paper: "bg-white", ice: "bg-paper", night: "bg-deep-grid text-white" };

// Hero scrims, for the copy's contrast only (the photo itself melts into the ground through its mask).
// They cover the whole section, not the photo's wrapper, and are the ground's own colour, so they can
// never outline the photo: on phones a flat dim (the photo is behind the copy); on desktop a fade from
// the left, "strong" for photos with bright detail behind the text, "light" where the photo should stay
// clearly visible (utility; lighter only from 1280 px, where the copy overlaps less of it).
const HERO_OVERLAY = {
  strong: "lg:bg-gradient-to-r lg:from-deep-grid lg:from-40% lg:via-deep-grid/55 lg:via-55% lg:to-transparent lg:to-80%",
  light: "lg:bg-gradient-to-r lg:from-deep-grid lg:from-40% lg:via-deep-grid/55 lg:via-55% lg:to-transparent lg:to-80% xl:via-deep-grid/35 xl:to-70%",
};

/**
 * Solutions hero: breadcrumb, eyebrow, two-line h1 with the accent line, copy, CTA, and the photo on
 * the right (full-bleed and dimmed behind the copy on phones).
 *
 * Load sequence (≤ 1.2 s, GSAP; the hero's text is only ever held for its own entrance):
 *   eyebrow — letter-spacing settles from wide while it fades in, its rule draws (0.6 s)
 *   h1 — each line slides up from behind its own mask (0.65 s, 90 ms apart, expo.out); the accent
 *        line then gets one soft light sweep (1.2 s) and stays static
 *   subheading + body — fade up 12 px, starting 80 ms after the last h1 line
 *   CTA — scales 0.96 → 1 with a fade, last
 *   photo — clip-path wipe (0.8 s, desktop) while it zooms out slowly (1.12 → 1.06 over 1.6 s); on desktop the
 *           scroll parallax then takes it from 1.06 to 1.0 (yPercent 0 → 8) as the hero scrolls out.
 * Arriving by a View Transition (hub card or segment switcher → this page) the photo is the morph
 * target, so it is shown as it is (no wipe, no zoom); the text still plays its entrance, starting as
 * the new page fades in (the old page is gone by then). Reduced motion: no motion at all.
 *
 * The photo wrapper's left edge is faded out with a mask so the image has no hard edge to show: at
 * fractional device-pixel ratios (125 % / 150 % display scaling) the GPU-composited photo used to leak
 * a 1-device-pixel bright line at that edge, past the painted overlay.
 */
export function SolutionHero({ segment, crumb, eyebrow, line1, line2, subheading, body = [], tagline, cta, image, overlay = "strong" }) {
  const root = useRef(null);
  const parallax = useRef(null);
  const accent = useRef(null);
  const back = useRouteTransition("/solutions", `[data-vt-card="${segment}"]`, { segment });
  // Read once: arrived by a View Transition (the photo is already in place, morphed from the card).
  const [morphed] = useState(() => typeof document !== "undefined" && document.documentElement.dataset.vt === "true");
  // First load (lib/firstLoad): no entrance — the photo only settles from 1.0566 in CSS (.hero-settle).
  const [firstLoad] = useState(() => typeof window === "undefined" || isFirstLoad());
  usePointerDepth(root);
  useScrub(root, ({ gsap }) => {
    gsap.fromTo(
      parallax.current,
      { yPercent: 0, scale: 1.06 },
      { yPercent: 8, scale: 1, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: SCRUB } }
    );
  });
  const intro = useIntro(root, ({ tl, q }) => {
      const done = { clearProps: "all" };
      // After a morph, start once the old page has faded out (150 ms, index.css).
      if (morphed) tl.delay(0.15);
      tl.fromTo(q('[data-a="eyebrow"]'), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: DUR.base, ease: EASE.standard, ...done }, 0)
        .fromTo(q('[data-a="rule"]'), { opacity: 1, scaleX: 0 }, { scaleX: 1, duration: DUR.base, ease: EASE.standard, ...done }, 0)
        .fromTo(q('[data-a="line"]'), { opacity: 1, yPercent: 100 }, { yPercent: 0, duration: DUR.slow, ease: EASE.emphasized, stagger: STAGGER, ...done }, 0.1)
        .add(() => {
          const el = accent.current;
          if (!el) return;
          el.classList.add("accent-sweep");
          el.addEventListener("animationend", () => el.classList.remove("accent-sweep"), { once: true });
        }, 0.84)
        .fromTo(q('[data-a="desc"]'), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: DUR.base, stagger: STAGGER, ease: EASE.standard, ...done }, 0.27)
        .fromTo(q('[data-a="cta"]'), { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: DUR.base, ease: EASE.standard, ...done }, 0.62)
        // Desktop only: on phones the photo is the page's largest paint (LCP) and sits dimmed behind the
        // copy, so it is shown at once there (the zoom below still plays).
        .fromTo(
          q('[data-a="image"]'),
          { opacity: window.matchMedia("(min-width: 1024px)").matches ? 0 : 1 },
          { opacity: 1, duration: DUR.slow, ease: EASE.standard, ...done },
          0
        )
        .fromTo(q('[data-a="zoom"]'), { opacity: 1, scale: 1.0566 }, { scale: 1, duration: 1.6, ease: EASE.standard, ...done }, 0);
  });

  return (
    <section ref={root} data-vt-hero={segment} className="relative overflow-hidden bg-deep-grid text-white">
      <Spotlight />
      <div data-intro={intro}>
        {/* Photo: full-bleed behind the copy on phones (dimmed by the scrim below); on desktop the right 54%
            (62% from 1280 px, where the copy has more room). One mask on this wrapper melts it into the
            ground (.photo-blend); on desktop an extra fade on the left, toward the copy. The wrapper and
            its layers paint nothing of their own. */}
        <div
          data-a={morphed ? undefined : "image"}
          data-vt-img
          className="photo-blend absolute inset-0 overflow-hidden lg:left-[46%] lg:[--blend-at:56%_50%] lg:[--blend-l:34%] xl:left-[38%]"
        >
          {/* parallax (scroll scrub, transform only) → zoom (load) → pointer drift → photo */}
          <div ref={parallax} className="absolute inset-0 will-change-transform">
            <div data-a={morphed ? undefined : "zoom"} className={`absolute inset-0 ${firstLoad && !morphed ? "hero-settle" : ""}`}>
              <div className="absolute -inset-3" style={depth(-6, -4)}>
                <SceneImg
                  name={image.name}
                  eager
                  fetchPriority="high"
                  sizes="(min-width: 1024px) 62vw, 100vw"
                  alt={image.alt}
                  className={`h-full w-full object-cover ${image.position ?? ""}`}
                />
              </div>
            </div>
          </div>
        </div>
        <div aria-hidden="true" className={`absolute inset-0 bg-deep-grid/75 lg:bg-transparent ${HERO_OVERLAY[overlay]}`} />

        <div className="relative container-site py-14 lg:py-20">
          <nav aria-label="Breadcrumb" className="text-micro text-paper/75">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link to="/solutions" onClick={back} className="hit-area hover:text-white focus-visible:text-white">
                  Solutions
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="h-3.5 w-3.5" />
              </li>
              <li aria-current="page" className="text-paper/90">
                {crumb}
              </li>
            </ol>
          </nav>
          <div className="mt-10 max-w-2xl">
            {/* The eyebrow is the heading's first line (it names the segment, the headline doesn't); it
                looks as before. The h1 itself has no classes: leading/tracking set inherited variables
                that would reach the eyebrow (and .solutions-page balances h1 text), so the headline's
                styles sit on its own span. */}
            <h1>
              <span data-a="eyebrow" className="flex items-center gap-3 eyebrow text-accent [text-wrap:wrap]">
                <span data-a="rule" aria-hidden="true" className="h-px w-8 origin-left bg-accent/70" />
                {eyebrow}
              </span>{" "}
              <span className="mt-5 block text-display font-semibold">
                <span className="line-mask">
                  <span data-a="line" className="block">
                    {line1}
                  </span>
                </span>{" "}
                <span className="line-mask">
                  <span data-a="line" className="block">
                    <span ref={accent} className="text-accent">
                      {line2}
                    </span>
                  </span>
                </span>
              </span>
            </h1>
            <p data-a="desc" className="mt-6 text-lead font-medium text-white">
              {subheading}
            </p>
            {body.map((p) => (
              <p data-a="desc" key={p} className="mt-4 max-w-xl text-body text-paper/90">
                {p}
              </p>
            ))}
            {tagline && (
              <p data-a="desc" className="mt-5 text-small font-semibold text-accent">
                {tagline}
              </p>
            )}
            <div className="mt-9">
              <span data-a="cta" className="inline-block">
                <MagneticButton to={`#${cta.target}`} onClick={scrollToId(cta.target, { offset: SEGMENT_OFFSET })} arrow ripple>
                  {cta.label}
                </MagneticButton>
              </span>
            </div>
          </div>
        </div>
        {image.credit && (
          <p className="absolute bottom-4 right-6 hidden rounded-full bg-deep-grid/85 px-3 py-1 text-micro tracking-[0.14em] text-paper/90 backdrop-blur-sm lg:block">{image.credit}</p>
        )}
      </div>
    </section>
  );
}

/**
 * The four-up benefit strip under the hero: icon, h3, one line. Its h2 is for screen readers only
 * (the strip has no visible heading), so the outline doesn't jump from the hero's h1 to these h3s.
 * The icons draw their strokes in once as the strip comes into view; on hover a tile lifts and glows.
 */
export function BenefitStrip({ items }) {
  // The strip is first-screen content: its text is static (no scroll fade), only the icons draw in.
  const list = useRef(null);
  useEffect(() => {
    const el = list.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelled = false;
    let off;
    loadGsap().then(({ gsap }) => {
      if (cancelled) return;
      const draw = () => {
        const shapes = [...el.querySelectorAll("svg :is(path, line, circle, rect, polyline, polygon)")];
        shapes.forEach((s) => s.setAttribute("pathLength", "1"));
        gsap.fromTo(
          shapes,
          { strokeDasharray: 1, strokeDashoffset: 1 },
          {
            strokeDashoffset: 0,
            duration: DUR.slow,
            ease: EASE.inOut,
            stagger: STAGGER,
            clearProps: "strokeDasharray,strokeDashoffset",
            onComplete: () => shapes.forEach((s) => s.removeAttribute("pathLength")),
          }
        );
      };
      // Icons only (decoration): they draw as the strip arrives. On a first load (the pre-rendered page)
      // icons already on screen stay as they are — drawing them would hide them first.
      const first = isFirstLoad();
      off = onceInView(el, { initial: !first, enter: draw, show: (why) => !first && why === "visible" && draw() });
    });
    return () => {
      cancelled = true;
      off?.();
    };
  }, []);
  return (
    <section aria-labelledby="benefits-title" className="border-t border-white/10 bg-deep-grid text-white">
      <h2 id="benefits-title" className="sr-only">
        Key benefits
      </h2>
      <ul ref={list} className="grid container-site gap-x-8 gap-y-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, text }) => (
          <li key={title} className="group/ben flex items-start gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-accent/60 text-accent transition-[translate,box-shadow,border-color] duration-fast group-hover/ben:-translate-y-1 group-focus-visible/ben:-translate-y-1 group-focus-within/ben:-translate-y-1 group-hover/ben:border-accent group-focus-visible/ben:border-accent group-focus-within/ben:border-accent group-hover/ben:shadow-[0_0_22px_2px_color-mix(in_srgb,var(--accent)_35%,transparent)] group-focus-visible/ben:shadow-[0_0_22px_2px_color-mix(in_srgb,var(--accent)_35%,transparent)] group-focus-within/ben:shadow-[0_0_22px_2px_color-mix(in_srgb,var(--accent)_35%,transparent)]">
              <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.7} />
            </span>
            <div>
              <h3 className="font-semibold text-white">{title}</h3>
              <p className="mt-1 text-small text-paper/70">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * A section with the site's standard heading: eyebrow (rule + settle), kinetic h2 with an optional
 * marker on one key phrase (`mark`), intro paragraph(s).
 *
 * `push`: a light section that follows a dark one slides up over it — a 24 px rounded top edge, a soft
 * shadow and a short 24 px overlap; on desktop (motion allowed) it rises 40 px into place as it
 * enters. Dark (`night`) sections get the cursor spotlight.
 */
export function Section({ id, tone = "paper", eyebrow, title, mark, intro, push = false, children, className = "" }) {
  const dark = tone === "night";
  const intros = intro ? [].concat(intro) : [];
  const ref = useRef(null);
  useScrub(
    ref,
    ({ gsap }) => {
      if (!push) return;
      gsap.fromTo(ref.current, { y: 40 }, { y: 0, ease: "none", scrollTrigger: { trigger: ref.current, start: "top bottom", end: "top 65%", scrub: SCRUB } });
    },
    [push]
  );
  return (
    <section
      ref={ref}
      id={id}
      aria-labelledby={`${id}-title`}
      className={`${TONES[tone]} relative py-14 lg:py-20 ${dark ? "overflow-hidden" : ""} ${
        push ? "z-10 -mt-6 rounded-t-[24px] shadow-[0_-24px_48px_-28px_rgba(0,0,0,0.55)]" : ""
      } ${className}`}
    >
      {dark && <Spotlight />}
      <div className="relative container-site">
        <div className="max-w-3xl">
          {eyebrow && (
            <KineticEyebrow className={`eyebrow ${dark ? "text-accent" : "text-muted"}`} ruleClass={dark ? "bg-accent" : "bg-muted"}>
              {eyebrow}
            </KineticEyebrow>
          )}
          <KineticHeading id={`${id}-title`} mark={mark} className={`text-h2 ${eyebrow ? "mt-3" : ""} font-semibold ${dark ? "text-white" : "text-ink"}`}>
            {title}
          </KineticHeading>
          {intros.map((p) => (
            <p key={p} className={`mt-4 text-body ${dark ? "text-paper/75" : "text-copy"}`}>
              {p}
            </p>
          ))}
        </div>
        {children}
      </div>
    </section>
  );
}

/** Icon-circle items (the product page's "Why this system" pattern): icon, h3 (or `level`), text. */
export function FeatureGrid({ items, columns = 3, dark = false, level = 3, className = "mt-12" }) {
  const Heading = `h${level}`;
  const list = useRef(null);
  const reveal = useScrollReveal(list);
  const cols = columns === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3";
  return (
    <ul ref={list} data-sr-state={reveal} className={`grid gap-x-8 gap-y-10 ${cols} ${className}`}>
      {items.map(({ icon: Icon, title, text }) => (
        <li data-sr key={title} className="group/hl">
          {Icon && (
            <span
              className={`grid h-11 w-11 place-items-center rounded-full transition-[background-color,scale] duration-fast group-hover/hl:scale-105 group-focus-visible/hl:scale-105 group-focus-within/hl:scale-105 ${
                dark ? "bg-white/10 text-accent" : "bg-ice text-accent group-hover/hl:bg-accent/25 group-focus-visible/hl:bg-accent/25 group-focus-within/hl:bg-accent/25"
              }`}
            >
              <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.7} />
            </span>
          )}
          <Heading className={`${Icon ? "mt-4" : ""} font-semibold ${dark ? "text-white" : "text-ink"}`}>{title}</Heading>
          <p className={`mt-1.5 text-small ${dark ? "text-paper/70" : "text-copy"}`}>{text}</p>
        </li>
      ))}
    </ul>
  );
}

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const pad2 = (n) => String(n).padStart(2, "0");

/**
 * A numbered process as one ordered list. Desktop: rows of `cols` steps with a connector line behind
 * the step numbers; with motion allowed the line fills left → right with scroll (row by row) and
 * each number switches to its active (filled) state as the fill reaches it. Everywhere else the
 * steps stack and show the final state (full line, every number active). Only the line and the
 * number states are scrubbed — the step text is always fully visible once revealed.
 *
 * `variant`: "card" — a large outline number (stroke only until its step is active, then filled) over a
 * card with the title and text; or "chip" — a numbered circle and a short label. `surface` is the
 * section's background, laid behind the card numbers so the connector line passes behind them.
 */
function Timeline({ items, cols, variant, surface = "bg-paper", className }) {
  const list = useRef(null);
  const reveal = useScrollReveal(list);
  const rows = Math.ceil(items.length / cols);
  const gap = "1.25rem"; // gap-5

  useScrub(list, ({ gsap }) => {
    const ol = list.current;
    const steps = [...ol.querySelectorAll("[data-step]")];
    const fills = [...ol.querySelectorAll("[data-fill]")];
    const proxy = { p: 0 };
    const apply = () => {
      const p = proxy.p * rows;
      fills.forEach((f, r) => (f.style.transform = `scaleX(${clamp01(p - r)})`));
      steps.forEach((st, i) => {
        const r = Math.floor(i / cols);
        const k = Math.min(cols, items.length - r * cols);
        const at = k > 1 ? (i % cols) / (k - 1) : 0;
        st.dataset.active = String(p - r > 0 && p - r >= at - 0.001);
      });
    };
    apply();
    gsap.to(proxy, {
      p: 1,
      ease: "none",
      onUpdate: apply,
      scrollTrigger: { trigger: ol, start: "top 75%", end: "bottom 50%", scrub: SCRUB },
    });
    return () => {
      steps.forEach((st) => delete st.dataset.active);
      fills.forEach((f) => (f.style.transform = ""));
    };
  }, [items.length, cols]);

  return (
    <ol
      ref={list}
      data-sr-state={reveal}
      style={{ "--cols": cols }}
      className={`relative grid gap-5 ${variant === "card" ? "sm:grid-cols-2" : ""} lg:grid-cols-[repeat(var(--cols),minmax(0,1fr))] ${className}`}
    >
      {/* Connector lines (desktop): one per row, from the first number's centre to the last's. */}
      {Array.from({ length: rows }, (_, r) => {
        const k = Math.min(cols, items.length - r * cols);
        const width = `calc(${k - 1} * ((100% - ${cols - 1} * ${gap}) / ${cols} + ${gap}))`;
        return (
          <li
            key={`line-${r}`}
            aria-hidden="true"
            style={{ "--r": r + 1 }}
            className="pointer-events-none relative hidden lg:block lg:[grid-column:1/-1] lg:[grid-row:var(--r)]"
          >
            <span className={`absolute left-5 h-px bg-forest/15 ${variant === "card" ? "top-9" : "top-5"}`} style={{ width }} />
            <span data-fill className={`absolute left-5 h-0.5 origin-left rounded-full bg-accent ${variant === "card" ? "top-[35px]" : "top-[19px]"}`} style={{ width }} />
          </li>
        );
      })}
      {items.map((it, i) => {
        const title = typeof it === "string" ? it : it.title;
        return (
          <li
            data-sr
            key={title}
            style={{ "--r": Math.floor(i / cols) + 1, "--c": (i % cols) + 1 }}
            className={`relative z-10 flex gap-4 lg:[grid-column:var(--c)] lg:[grid-row:var(--r)] ${
              variant === "card" ? "flex-col" : "items-center lg:flex-col lg:items-start lg:gap-3"
            }`}
          >
            {variant === "card" ? (
              <span data-step className={`step-num self-start pr-3 text-display tabular-nums font-semibold leading-none ${surface}`}>
                {pad2(i + 1)}
              </span>
            ) : (
              <span
                data-step
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-accent bg-accent text-small font-semibold text-on-accent transition-[background-color,color,border-color] duration-fast data-[active=false]:border-accent/20 data-[active=false]:bg-white data-[active=false]:text-muted"
              >
                {pad2(i + 1)}
              </span>
            )}
            {variant === "card" ? (
              <div className="flex-1 rounded-2xl border border-line bg-white p-6">
                <h3 className="font-semibold text-ink">{title}</h3>
                <p className="mt-1.5 text-small text-copy">{it.text}</p>
              </div>
            ) : (
              <span className="rounded-full border border-line bg-white px-4 py-2 text-small font-semibold text-accent">{title}</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/** Numbered steps (card per step) on a scroll-filled timeline; see Timeline. */
export function NumberedSteps({ items, columns = 4, surface, className = "mt-12" }) {
  return <Timeline items={items} cols={columns} variant="card" surface={surface} className={className} />;
}

/** A short flow of labelled steps (Your consumption → … → Future expansion) on one timeline row. */
export function FlowSteps({ items, className = "mt-10" }) {
  return <Timeline items={items} cols={items.length} variant="chip" className={className} />;
}

/**
 * Protection layers: an ordered list with a vertical line through the numbered circles; each layer's
 * card is indented one step further on wider screens (the stepped stack). Desktop with motion
 * allowed: the line fills top → bottom as the section passes through the viewport (top 75% →
 * bottom 50%) and each circle turns active when the fill reaches it. The layer cards themselves
 * are always fully visible (revealed once, like any section content). Elsewhere: the final state.
 */
export function LayerStack({ items, className = "mt-12" }) {
  const list = useRef(null);
  const reveal = useScrollReveal(list);

  useScrub(list, ({ gsap }) => {
    const ol = list.current;
    const steps = [...ol.querySelectorAll("[data-step]")];
    const fills = [...ol.querySelectorAll("[data-fill]")];
    const segs = items.length - 1;
    const proxy = { p: 0 };
    const apply = () => {
      const p = proxy.p * segs;
      fills.forEach((f, j) => (f.style.transform = `scaleY(${clamp01(p - j)})`));
      steps.forEach((st, i) => (st.dataset.active = String(i === 0 ? proxy.p > 0 : p >= i - 0.001)));
    };
    apply();
    gsap.to(proxy, {
      p: 1,
      ease: "none",
      onUpdate: apply,
      scrollTrigger: { trigger: ol, start: "top 75%", end: "bottom 50%", scrub: SCRUB },
    });
    return () => {
      steps.forEach((st) => delete st.dataset.active);
      fills.forEach((f) => (f.style.transform = ""));
    };
  }, [items.length]);

  return (
    <ol ref={list} data-sr-state={reveal} className={`max-w-4xl space-y-3 ${className}`}>
      {items.map(({ title, text }, i) => (
        <li data-sr key={title} style={{ "--step": i }} className="relative flex items-start gap-4">
          {/* The line from this circle to the next: a faint track and the scroll-filled part. */}
          {i < items.length - 1 && (
            <>
              <span aria-hidden="true" className="absolute left-[1.125rem] top-[1.125rem] h-[calc(100%+0.75rem)] w-px -translate-x-1/2 bg-white/15" />
              <span aria-hidden="true" data-fill className="absolute left-[1.125rem] top-[1.125rem] -ml-px h-[calc(100%+0.75rem)] w-0.5 origin-top bg-accent" />
            </>
          )}
          <span
            data-step
            className="relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-accent bg-accent text-small font-semibold text-on-accent transition-[background-color,color] duration-fast data-[active=false]:bg-deep-grid data-[active=false]:text-accent"
          >
            {i + 1}
          </span>
          <div className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] p-4 md:ml-[calc(var(--step)*1.5rem)] md:flex md:items-baseline md:gap-4 md:p-5">
            <h3 className="font-semibold text-white md:w-40 md:shrink-0">{title}</h3>
            <p className="mt-1 text-small text-paper/75 md:mt-0">{text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/**
 * A real data table with a caption; scrolls sideways inside its own box on narrow screens. Rows
 * reveal with a stagger; `icons` (keyed by a row's first cell) adds a small icon to that cell; hovering
 * a row highlights it and slides a 3 px accent bar in from the left. Table semantics are unchanged.
 */
export function DataTable({ caption, head, rows, icons = {}, className = "mt-10" }) {
  const body = useRef(null);
  const reveal = useScrollReveal(body);
  return (
    <div className={`overflow-x-auto rounded-2xl border border-line bg-white ${className}`}>
      <table className="w-full min-w-[30rem] border-collapse text-left text-small">
        <caption className="border-b border-line px-5 py-4 text-left text-small font-semibold text-ink sm:px-6">{caption}</caption>
        <thead>
          <tr className="bg-paper">
            {head.map((h) => (
              <th key={h} scope="col" className="px-5 py-3 eyebrow text-muted sm:px-6">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody ref={body} data-sr-state={reveal} className="divide-y divide-line">
          {rows.map(([first, ...rest]) => {
            const Icon = icons[first];
            return (
              <tr data-sr key={first} className="group/row transition-colors duration-fast hover:bg-ice/70 focus-visible:bg-ice/70">
                <th scope="row" className="relative overflow-hidden px-5 py-3.5 font-semibold text-ink sm:px-6">
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-0 left-0 w-[3px] -translate-x-full bg-accent transition-transform duration-fast ease-standard group-hover/row:translate-x-0 group-focus-visible/row:translate-x-0 group-focus-within/row:translate-x-0"
                  />
                  <span className="flex items-center gap-2.5">
                    {Icon && <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-accent/70" strokeWidth={1.8} />}
                    {first}
                  </span>
                </th>
                {rest.map((c) => (
                  <td key={c} className="px-5 py-3.5 text-copy sm:px-6">
                    {c}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Check-mark list. */
export function Checklist({ items, dark = false, className = "mt-6" }) {
  return (
    <ul className={`grid gap-3 sm:grid-cols-2 ${className}`}>
      {items.map((t) => (
        <li key={t} className={`flex items-start gap-3 text-small ${dark ? "text-paper/85" : "text-ink"}`}>
          <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={2.4} />
          {t}
        </li>
      ))}
    </ul>
  );
}

/** Figures as value + label pairs (tabular figures so the columns line up). */
export function Stats({ items, className = "mt-6" }) {
  return (
    <dl className={`grid grid-cols-2 gap-x-6 gap-y-4 ${className}`}>
      {items.map(([value, label]) => (
        // dt (label) first in the markup, shown under the figure.
        <div key={label} className="flex flex-col-reverse border-l-2 border-accent/60 pl-3">
          <dt className="text-micro text-copy">{label}</dt>
          <dd className="text-h4 font-semibold text-accent tabular-nums">
            <CountUp value={value} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * A technology partner's name: its logo where the site has one (alt "{Partner} logo"), otherwise the
 * name in type (Midea: the site has no Midea logo). `decorative` when a heading next to it already
 * names the partner: hidden from screen readers then (the logo keeps its alt).
 */
export function PartnerMark({ partner, name, decorative = false }) {
  const p = partner && partnerOf(partner);
  // self-start: inside a flex column a logo would otherwise stretch to the full card width.
  if (p)
    return (
      // `decorative`: a heading beside it already names the partner, so screen readers skip the logo
      // (aria-hidden) — it still carries its alt for crawlers.
      <span data-sr data-wipe aria-hidden={decorative || undefined} className="self-start">
        <img
          src={p.logo}
          loading="lazy"
          decoding="async"
          alt={`${p.name} logo`}
          className={`${p.id === "clou" ? "h-8" : "h-6"} w-auto transition-transform duration-base ease-standard group-hover/card:scale-110 group-focus-visible/card:scale-110 group-focus-within/card:scale-110`}
        />
      </span>
    );
  return (
    <p aria-hidden={decorative || undefined} className="self-start text-2xl font-semibold uppercase leading-6 tracking-tight text-ink">
      {name}
    </p>
  );
}

// ---- Product compare (C&I "Four Solutions", Utility "Featured systems") ----------------------------

// The tray and the comparison dialog: their own chunk, fetched when a first system is ticked.
const CompareTray = lazy(() => import("./CompareTray"));
const CompareContext = createContext(null);
export const MAX_COMPARE = 3;

/**
 * Holds a page's compare selection (product ids, oldest first, at most 3: a 4th replaces the oldest
 * and says so). Wrap the part of a page whose SolutionProductCards can be compared; the selection
 * lives as long as the page does, so it resets on route change. From 2 systems the tray slides up.
 */
export function CompareProvider({ children }) {
  const [ids, setIds] = useState([]);
  const [replaced, setReplaced] = useState(0); // bumps when a 4th pick replaced the oldest (toast)
  const toggle = (id) => {
    if (ids.includes(id)) return setIds(ids.filter((x) => x !== id));
    if (ids.length >= MAX_COMPARE) {
      setReplaced((n) => n + 1);
      return setIds([...ids.slice(1), id]);
    }
    setIds([...ids, id]);
  };
  const clear = () => setIds([]);
  return (
    <CompareContext.Provider value={{ ids, toggle }}>
      {children}
      {ids.length > 0 && (
        <Suspense fallback={null}>
          <CompareTray ids={ids} replaced={replaced} onClear={clear} />
        </Suspense>
      )}
    </CompareContext.Provider>
  );
}

/** The "Compare" checkbox chip at the top right of a product card's media. */
function CompareChip({ id, name }) {
  const { ids, toggle } = useContext(CompareContext);
  const checked = ids.includes(id);
  return (
    <label
      className={`absolute right-3 top-3 z-20 inline-flex cursor-pointer select-none items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-micro font-semibold pointer-coarse:before:absolute pointer-coarse:before:-inset-2 pointer-coarse:before:content-[''] shadow-sm backdrop-blur transition-colors duration-fast has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent ${
        checked ? "border-accent bg-forest text-white" : "border-line bg-white/90 text-accent hover:border-accent/40 focus-visible:border-accent/40"
      }`}
    >
      <input type="checkbox" checked={checked} onChange={() => toggle(id)} className="sr-only" />
      <span
        aria-hidden="true"
        className={`grid h-4 w-4 place-items-center rounded-[4px] border ${checked ? "border-accent bg-accent text-on-accent" : "border-accent/40 bg-white"}`}
      >
        {checked && <Check className="h-3 w-3" strokeWidth={3} />}
      </span>
      Compare<span className="sr-only"> {name}</span>
    </label>
  );
}

// Intrinsic sizes of the catalogue images (src/assets/catalogue, src/assets/clou-aqua-e261.webp) and
// partner logos, for the width/height attributes on Solutions product cards (no layout shift).
const IMAGE_SIZES = {
  "tcl-blueark-x1": [389, 774],
  "tcl-blueark-x5": [480, 900],
  "tcl-blueark-w10": [380, 900],
  "hithium-block-261": [506, 900],
  "hithium-power-cabinet-1022": [640, 900],
  "hithium-power-625": [1404, 800],
  "clou-aqua-c25s": [765, 640],
  "clou-aqua-e261": [427, 616],
};
const LOGO_SIZES = { tcl: [86, 31], hithium: [355, 89], clou: [94, 44] };

/**
 * A product in a Solutions portfolio: the catalogue card's light plinth with the product cutout (or
 * the partner's logo when the catalogue has no photo — always visible, never an empty box), then h3
 * name, power/energy, tagline, copy, specs and a link pinned to the bottom of the card.
 *
 * The media area has one fixed height for every card, so cards in a row line up and a logo-only card
 * doesn't leave a tall empty block. `photo` overrides the catalogue image ({ src, alt, width,
 * height }) for a card that shows a different configuration than the catalogue entry; `to`
 * overrides the link (default: the product page).
 */
export function SolutionProductCard({ product, photo, to, name, sub, figures, tagline, copy, specs = [], note, alt, cta, level = 3 }) {
  const Heading = `h${level}`; // h4 when the card sits under a partner's h3
  const fallback = !photo && product.imageFallback;
  const src = photo?.src ?? product.image;
  const [w, h] = photo ? [photo.width, photo.height] : fallback ? LOGO_SIZES[product.partner] : IMAGE_SIZES[product.id] ?? [];
  const card = useRef(null);
  useTilt(card, 4);
  // Comparable inside a CompareProvider, from the catalogue's own record — so not a card that shows a
  // different configuration than its catalogue entry (`photo`), whose figures the catalogue lacks.
  const comparable = useContext(CompareContext) && !photo;
  return (
    <article
      ref={card}
      style={{ transform: "perspective(1000px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))" }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white card-hover"
    >
      {/* Glare: a soft highlight that follows the cursor while tilting (desktop). */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-fast group-hover:opacity-100 group-focus-visible:opacity-100 group-focus-within:opacity-100"
        style={{ background: "radial-gradient(40% 50% at var(--gx, 50%) var(--gy, 30%), rgba(255,255,255,0.35), transparent 70%)" }}
      />
      <div data-sr data-wipe className="relative h-56 shrink-0 overflow-hidden bg-[radial-gradient(80%_70%_at_50%_45%,var(--color-white)_0%,var(--color-white)_70%,var(--color-paper)_100%)] lg:h-60">
        {comparable && <CompareChip id={product.id} name={name} />}
        {/* Ground shadow: widens as the product lifts on hover. */}
        {!fallback && (
          <span
            aria-hidden="true"
            className="absolute inset-x-[22%] bottom-[7%] h-5 rounded-[100%] bg-black/15 blur-lg transition-transform duration-base ease-standard group-hover:scale-x-[1.3] group-focus-visible:scale-x-[1.3] group-focus-within:scale-x-[1.3] motion-reduce:transition-none"
          />
        )}
        <img
          src={src}
          width={w}
          height={h}
          alt={photo ? photo.alt : fallback ? product.imageAlt : (alt ?? product.imageAlt)}
          loading="lazy"
          decoding="async"
          className={
            fallback
              ? "absolute inset-0 m-auto h-auto w-[40%] max-w-[10rem] object-contain opacity-80"
              : "card-media absolute inset-0 h-full w-full object-contain p-6 motion-reduce:transition-none"
          }
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <Heading className="text-h3 font-semibold text-ink">{name}</Heading>
        {sub && <p className="mt-0.5 text-micro text-copy">{sub}</p>}
        {figures && <p className="mt-2 text-small font-semibold text-accent">{figures}</p>}
        {tagline && <p className="mt-3 text-small font-semibold text-ink">{tagline}</p>}
        {copy && <p className="mt-2 text-small text-copy">{copy}</p>}
        {specs.length > 0 && (
          <ul className="mt-4 space-y-1.5 text-small text-ink">
            {specs.map((s) => (
              <li key={s} className="flex items-start gap-2">
                <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                {s}
              </li>
            ))}
          </ul>
        )}
        {note && <p className="mt-4 text-micro text-copy">{note}</p>}
        <ArrowLink to={to ?? `/products/${product.id}`} className="mt-auto self-start pt-6">
          {cta}
        </ArrowLink>
      </div>
    </article>
  );
}

/** A grid of cards that reveals as it scrolls in. */
export function CardGrid({ children, columns = 3, className = "mt-12" }) {
  const list = useRef(null);
  const reveal = useScrollReveal(list);
  const cols = columns === 2 ? "md:grid-cols-2" : columns === 4 ? "sm:grid-cols-2 xl:grid-cols-4" : "md:grid-cols-2 lg:grid-cols-3";
  return (
    <ul ref={list} data-sr-state={reveal} className={`grid gap-6 ${cols} ${className}`}>
      {[].concat(children).map((c, i) => (
        <li data-sr key={c.key ?? i}>
          {c}
        </li>
      ))}
    </ul>
  );
}

/**
 * FAQ as an accordion of native <details>: every question is an h3 inside its <summary>, every answer
 * stays in the DOM (word for word the FAQPage data). The first item starts open. Opening animates
 * smoothly where supported (index.css), the chevron turns, and with the question focused + opens and
 * − closes (Enter / Space toggle as usual).
 */
export function FaqList({ id, title, items, tone = "ice" }) {
  const onKey = (e) => {
    const d = e.currentTarget.parentElement;
    if (e.key === "+" || e.key === "=") {
      e.preventDefault();
      d.open = true;
    } else if (e.key === "-" || e.key === "_") {
      e.preventDefault();
      d.open = false;
    }
  };
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`${tone === "paper" ? "bg-white" : "bg-paper"} relative py-14 lg:py-20`}>
      <div className="container-site">
        <KineticHeading id={`${id}-title`} className="text-h2 max-w-3xl font-semibold text-ink">
          {title}
        </KineticHeading>
        <div className={`mt-10 max-w-3xl divide-y divide-line rounded-2xl border border-line ${tone === "paper" ? "bg-ice/60" : "bg-white"}`}>
          {items.map(({ q, a }, i) => (
            <details key={q} className="faq-item group/faq" open={i === 0 || undefined}>
              <summary
                onClick={toggleDetails}
                onKeyDown={onKey}
                className="flex cursor-pointer items-center justify-between gap-4 px-5 py-5 focus-visible:outline-2 focus-visible:outline-offset-[-2px] sm:px-6"
              >
                <h3 className="font-semibold text-ink">{q}</h3>
                <span
                  aria-hidden="true"
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line text-accent transition-[transform,background-color] duration-base ease-emphasized group-open/faq:rotate-180 group-open/faq:bg-accent/25"
                >
                  <ChevronDown className="h-4 w-4" />
                </span>
              </summary>
              <p className="px-5 pb-5 text-small text-copy sm:px-6">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * The CTA checklist as toggle chips: every item starts selected; clicking (or Space / Enter) deselects
 * or reselects it, its tick drawing in or out (stroke). Labelled by the band's body text ("…we'll
 * help you determine:").
 */
function TopicChips({ items, selected, onToggle, labelledBy }) {
  return (
    <ul aria-labelledby={labelledBy} className="flex flex-wrap gap-2.5">
      {items.map((t) => {
        const on = selected.includes(t);
        return (
          <li key={t}>
            <button
              type="button"
              aria-pressed={on}
              onClick={() => onToggle(t)}
              className={`hit-area inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-left text-small transition-colors duration-fast focus-visible:outline-2 focus-visible:outline-offset-2 ${
                on ? "border-accent/60 bg-accent/15 text-white" : "border-white/15 bg-transparent text-paper/60 hover:border-white/30 focus-visible:border-white/30 hover:text-paper/85 focus-visible:text-paper/85"
              }`}
            >
              <span aria-hidden="true" className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border transition-colors duration-fast ${on ? "border-accent bg-accent" : "border-white/30"}`}>
                <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none">
                  <path
                    d="M2.5 6.2 5 8.6 9.6 3.6"
                    pathLength="1"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-accent transition-[stroke-dashoffset] duration-fast ease-standard motion-reduce:transition-none"
                    style={{ strokeDasharray: 1, strokeDashoffset: on ? 0 : 1 }}
                  />
                </svg>
              </span>
              {t}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Closing CTA band (dark): eyebrow, h2, optional subheading, body, the checklist as selectable chips,
 * and the button. With `segment`, the button carries the chosen items to the contact form:
 * /contact?intent=<segment>&topics=<slugs> (the contact page pre-fills its message from them); with
 * none chosen it is the plain /contact?intent=<segment> link.
 */
export function CtaBand({ id, eyebrow, title, subheading, body, checklist, segment, button }) {
  const [selected, setSelected] = useState(checklist);
  const toggle = (t) => setSelected((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : checklist.filter((x) => x === t || cur.includes(x))));
  const to = segment && selected.length ? `${button.to}&topics=${selected.map(topicSlug).join(",")}` : button.to;
  return (
    <section id={id} data-cta-band aria-labelledby={`${id}-title`} className="relative overflow-hidden bg-deep-grid py-14 text-white lg:py-20">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(45% 60% at 80% 40%, color-mix(in_srgb,var(--accent)_8%,transparent), transparent 70%)" }} />
      <Spotlight />
      <div className="relative container-site grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
        <div>
          {eyebrow && (
            <KineticEyebrow className="eyebrow text-accent" ruleClass="bg-accent">
              {eyebrow}
            </KineticEyebrow>
          )}
          <KineticHeading id={`${id}-title`} className={`text-h2 ${eyebrow ? "mt-3" : ""} font-semibold`}>
            {title}
          </KineticHeading>
          {subheading && <p className="mt-4 text-lead font-medium text-white">{subheading}</p>}
          <p id={`${id}-body`} className="mt-4 max-w-xl text-body text-paper/80">
            {body}
          </p>
          <PillLink to={to} arrow spotlight ripple className="mt-8">
            {button.label}
          </PillLink>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 md:p-8">
          {segment ? (
            <TopicChips items={checklist} selected={selected} onToggle={toggle} labelledBy={`${id}-body`} />
          ) : (
            <Checklist items={checklist} dark />
          )}
        </div>
      </div>
    </section>
  );
}
