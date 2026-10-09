import { createContext, lazy, Suspense, useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Check, ChevronDown, ChevronRight } from "lucide-react";
import { KineticEyebrow, KineticHeading } from "./Kinetic";
import { ArrowLink, SEGMENT_OFFSET, Spotlight, useTilt } from "./Interactive";
import MagneticButton from "../ui/MagneticButton";
import PillLink from "../PillLink";
import SceneImg from "../SceneImg";
import RollValue from "../RollValue";
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

/*
 * Building blocks for the three Solutions pages (/solutions/utility-scale, /commercial-industrial,
 * /residential). Each reuses an existing site pattern — the For EPCs hero, the eyebrow + animated h2
 * section heading, the product page's icon-circle highlights, the catalogue card's plinth, PillLink /
 * MagneticButton CTAs and the scroll reveal — so the pages read as part of the same site.
 *
 * Headings: the hero's h1 is the page's only h1; every section heading is an h2; cards and items are
 * h3. All copy is real text in the markup.
 */

const TONES = { paper: "bg-paper", ice: "bg-ice", night: "bg-night text-white" };

// Hero overlays. The photo itself fades out toward the copy (a mask on its wrapper — see below), so
// the gradient only has to keep the copy's contrast: "strong" for photos with bright detail behind
// the text, "light" where the photo should stay clearly visible (utility).
const HERO_OVERLAY = {
  strong: "lg:bg-gradient-to-r lg:from-night lg:via-night/60 lg:to-night/10",
  // Lighter only from 1280 px: between 1024 and 1279 the copy overlaps more of the photo.
  light: "lg:bg-gradient-to-r lg:from-night lg:via-night/60 lg:to-night/10 xl:from-night/90 xl:via-night/25 xl:to-transparent",
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
      tl.fromTo(q('[data-a="eyebrow"]'), { opacity: 0, letterSpacing: "0.4em" }, { opacity: 1, letterSpacing: "0.22em", duration: 0.6, ease: "power2.out", ...done }, 0)
        .fromTo(q('[data-a="rule"]'), { opacity: 1, scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "power2.out", ...done }, 0)
        .fromTo(q('[data-a="line"]'), { opacity: 1, yPercent: 100 }, { yPercent: 0, duration: 0.65, ease: "expo.out", stagger: 0.09, ...done }, 0.1)
        .add(() => {
          const el = accent.current;
          if (!el) return;
          el.classList.add("accent-sweep");
          el.addEventListener("animationend", () => el.classList.remove("accent-sweep"), { once: true });
        }, 0.84)
        .fromTo(q('[data-a="desc"]'), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: "power2.out", ...done }, 0.27)
        .fromTo(q('[data-a="cta"]'), { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.45, ease: "power2.out", ...done }, 0.62)
        // Desktop only: on phones the photo is the page's largest paint (LCP) and sits dimmed behind the
        // copy, so it is shown at once there (the zoom below still plays).
        .fromTo(
          q('[data-a="image"]'),
          window.matchMedia("(min-width: 1024px)").matches ? { opacity: 1, clipPath: "inset(0% 0% 100% 0%)" } : { opacity: 1 },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 0.8, ease: "power2.out", ...done },
          0
        )
        .fromTo(q('[data-a="zoom"]'), { opacity: 1, scale: 1.0566 }, { scale: 1, duration: 1.6, ease: "power2.out", ...done }, 0);
  });

  return (
    <section ref={root} data-vt-hero={segment} className="relative overflow-hidden bg-night text-white">
      <Spotlight />
      <div data-intro={intro}>
        {/* Photo: full-bleed behind the copy on phones (dimmed); on desktop the right 54% (62% from 1280 px,
            where the copy has more room), its left edge masked to transparent so it melts into the ground. */}
        <div
          data-a={morphed ? undefined : "image"}
          data-vt-img
          className="absolute inset-0 overflow-hidden lg:left-[46%] xl:left-[38%] lg:[mask-image:linear-gradient(to_right,transparent,#000_42%)] xl:[mask-image:linear-gradient(to_right,transparent,#000_26%)]"
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
          <div aria-hidden="true" className={`absolute inset-0 bg-night/75 lg:bg-transparent ${HERO_OVERLAY[overlay]}`} />
          <div aria-hidden="true" className={`absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t ${overlay === "light" ? "from-night/70" : "from-night/90"} to-transparent`} />
        </div>

        <div className="relative container-site py-14 lg:py-20">
          <nav aria-label="Breadcrumb" className="text-xs text-ice/75">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link to="/solutions" onClick={back} className="hover:text-white">
                  Solutions
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="h-3.5 w-3.5" />
              </li>
              <li aria-current="page" className="text-ice/90">
                {crumb}
              </li>
            </ol>
          </nav>
          <div className="mt-10 max-w-2xl">
            <p data-a="eyebrow" className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-signal">
              <span data-a="rule" aria-hidden="true" className="h-px w-8 origin-left bg-signal/70" />
              {eyebrow}
            </p>
            <h1 className="mt-5 text-[clamp(2.6rem,6vw,4.25rem)] font-semibold leading-[1.04] tracking-tight">
              <span className="line-mask">
                <span data-a="line" className="block">
                  {line1}
                </span>
              </span>{" "}
              <span className="line-mask">
                <span data-a="line" className="block">
                  <span ref={accent} className="text-signal">
                    {line2}
                  </span>
                </span>
              </span>
            </h1>
            <p data-a="desc" className="mt-6 text-lg font-medium text-white md:text-xl">
              {subheading}
            </p>
            {body.map((p) => (
              <p data-a="desc" key={p} className="mt-4 max-w-xl leading-relaxed text-ice/90">
                {p}
              </p>
            ))}
            {tagline && (
              <p data-a="desc" className="mt-5 text-sm font-semibold tracking-wide text-signal">
                {tagline}
              </p>
            )}
            <div className="mt-9">
              <span data-a="cta" className="inline-block">
                <MagneticButton to={`#${cta.target}`} onClick={scrollToId(cta.target, { offset: SEGMENT_OFFSET })} arrow ripple className="hover:scale-[1.02]">
                  {cta.label}
                </MagneticButton>
              </span>
            </div>
          </div>
        </div>
        {image.credit && (
          <p className="absolute bottom-4 right-6 hidden rounded-full bg-night/85 px-3 py-1 text-[0.6875rem] tracking-[0.14em] text-ice/90 backdrop-blur-sm lg:block">{image.credit}</p>
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
            duration: 0.9,
            ease: "power2.inOut",
            stagger: 0.03,
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
    <section aria-labelledby="benefits-title" className="border-t border-white/10 bg-deep text-white">
      <h2 id="benefits-title" className="sr-only">
        Key benefits
      </h2>
      <ul ref={list} className="grid container-site gap-x-8 gap-y-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, text }) => (
          <li key={title} className="group/ben flex items-start gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-signal/60 text-signal transition-[translate,box-shadow,border-color] duration-300 group-hover/ben:-translate-y-1 group-hover/ben:border-signal group-hover/ben:shadow-[0_0_22px_2px_rgba(144,217,136,0.35)]">
              <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.7} />
            </span>
            <div>
              <h3 className="font-semibold text-white">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-ice/70">{text}</p>
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
            <KineticEyebrow className={`text-xs font-semibold uppercase tracking-[0.2em] ${dark ? "text-signal" : "text-sage"}`} ruleClass={dark ? "bg-signal" : "bg-sage"}>
              {eyebrow}
            </KineticEyebrow>
          )}
          <KineticHeading id={`${id}-title`} mark={mark} className={`sol-h2 ${eyebrow ? "mt-3" : ""} font-semibold ${dark ? "text-white" : "text-ink"}`}>
            {title}
          </KineticHeading>
          {intros.map((p) => (
            <p key={p} className={`mt-4 leading-relaxed ${dark ? "text-ice/75" : "text-graphite"}`}>
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
  const reveal = useScrollReveal(list, { stagger: 0.07 });
  const cols = columns === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3";
  return (
    <ul ref={list} data-sr-state={reveal} className={`grid gap-x-8 gap-y-10 ${cols} ${className}`}>
      {items.map(({ icon: Icon, title, text }) => (
        <li data-sr key={title} className="group/hl">
          {Icon && (
            <span
              className={`grid h-11 w-11 place-items-center rounded-full transition-[background-color,scale] duration-300 group-hover/hl:scale-105 ${
                dark ? "bg-white/10 text-signal" : "bg-ice text-forest group-hover/hl:bg-signal/25"
              }`}
            >
              <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.7} />
            </span>
          )}
          <Heading className={`${Icon ? "mt-4" : ""} font-semibold ${dark ? "text-white" : "text-ink"}`}>{title}</Heading>
          <p className={`mt-1.5 text-sm leading-relaxed ${dark ? "text-ice/70" : "text-graphite"}`}>{text}</p>
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
function Timeline({ items, cols, variant, surface = "bg-ice", className }) {
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
            <span data-fill className={`absolute left-5 h-0.5 origin-left rounded-full bg-signal ${variant === "card" ? "top-[35px]" : "top-[19px]"}`} style={{ width }} />
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
              <span data-step className={`step-num self-start pr-3 text-[4.5rem] font-semibold leading-none tracking-tight ${surface}`}>
                {pad2(i + 1)}
              </span>
            ) : (
              <span
                data-step
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-signal bg-signal text-sm font-semibold text-forest transition-[background-color,color,border-color] duration-300 data-[active=false]:border-forest/20 data-[active=false]:bg-paper data-[active=false]:text-sage"
              >
                {pad2(i + 1)}
              </span>
            )}
            {variant === "card" ? (
              <div className="flex-1 rounded-2xl border border-line bg-paper p-6">
                <h3 className="font-semibold text-ink">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-graphite">{it.text}</p>
              </div>
            ) : (
              <span className="rounded-full border border-line bg-paper px-4 py-2 text-sm font-semibold text-forest">{title}</span>
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
              <span aria-hidden="true" data-fill className="absolute left-[1.125rem] top-[1.125rem] -ml-px h-[calc(100%+0.75rem)] w-0.5 origin-top bg-signal" />
            </>
          )}
          <span
            data-step
            className="relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-signal bg-signal text-sm font-semibold text-forest transition-[background-color,color] duration-300 data-[active=false]:bg-night data-[active=false]:text-signal"
          >
            {i + 1}
          </span>
          <div className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] p-4 md:ml-[calc(var(--step)*1.5rem)] md:flex md:items-baseline md:gap-4 md:p-5">
            <h3 className="font-semibold text-white md:w-40 md:shrink-0">{title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-ice/75 md:mt-0">{text}</p>
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
  const reveal = useScrollReveal(body, { stagger: 0.04 });
  return (
    <div className={`overflow-x-auto rounded-2xl border border-line bg-paper ${className}`}>
      <table className="w-full min-w-[30rem] border-collapse text-left text-sm">
        <caption className="border-b border-line px-5 py-4 text-left text-sm font-semibold text-ink sm:px-6">{caption}</caption>
        <thead>
          <tr className="bg-ice">
            {head.map((h) => (
              <th key={h} scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-sage sm:px-6">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody ref={body} data-sr-state={reveal} className="divide-y divide-line">
          {rows.map(([first, ...rest]) => {
            const Icon = icons[first];
            return (
              <tr data-sr key={first} className="group/row transition-colors duration-200 hover:bg-ice/70">
                <th scope="row" className="relative overflow-hidden px-5 py-3.5 font-semibold text-ink sm:px-6">
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-0 left-0 w-[3px] -translate-x-full bg-signal transition-transform duration-300 ease-out group-hover/row:translate-x-0"
                  />
                  <span className="flex items-center gap-2.5">
                    {Icon && <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-forest/70" strokeWidth={1.8} />}
                    {first}
                  </span>
                </th>
                {rest.map((c) => (
                  <td key={c} className="px-5 py-3.5 text-graphite sm:px-6">
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
        <li key={t} className={`flex items-start gap-3 text-sm ${dark ? "text-ice/85" : "text-ink"}`}>
          <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-signal" strokeWidth={2.4} />
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
        <div key={label} className="flex flex-col-reverse border-l-2 border-signal/60 pl-3">
          <dt className="text-xs leading-snug text-graphite">{label}</dt>
          <dd className="text-lg font-semibold tracking-tight text-forest tabular-nums">
            <RollValue value={value} />
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
          className={`${p.id === "clou" ? "h-8" : "h-6"} w-auto transition-transform duration-500 ease-out group-hover/card:scale-110`}
        />
      </span>
    );
  return (
    <p aria-hidden={decorative || undefined} className="self-start text-2xl font-bold uppercase leading-6 tracking-tight text-ink">
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
      className={`absolute right-3 top-3 z-20 inline-flex cursor-pointer select-none items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-semibold shadow-sm backdrop-blur transition-colors duration-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-signal ${
        checked ? "border-forest bg-forest text-white" : "border-line bg-paper/90 text-forest hover:border-forest/40"
      }`}
    >
      <input type="checkbox" checked={checked} onChange={() => toggle(id)} className="sr-only" />
      <span
        aria-hidden="true"
        className={`grid h-4 w-4 place-items-center rounded-[4px] border ${checked ? "border-signal bg-signal text-forest" : "border-forest/40 bg-paper"}`}
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
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-paper transition-[border-color,box-shadow,transform] duration-300 ease-out hover:border-forest/30 hover:shadow-[0_22px_44px_-28px_rgba(7,26,23,0.4)]"
    >
      {/* Glare: a soft highlight that follows the cursor while tilting (desktop). */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: "radial-gradient(40% 50% at var(--gx, 50%) var(--gy, 30%), rgba(255,255,255,0.35), transparent 70%)" }}
      />
      <div data-sr data-wipe className="relative h-56 shrink-0 overflow-hidden bg-[radial-gradient(80%_70%_at_50%_45%,#ffffff_0%,#F4F7F4_70%,#ECF1EC_100%)] lg:h-60">
        {comparable && <CompareChip id={product.id} name={name} />}
        {/* Ground shadow: widens as the product lifts on hover. */}
        {!fallback && (
          <span
            aria-hidden="true"
            className="absolute inset-x-[22%] bottom-[7%] h-5 rounded-[100%] bg-black/15 blur-lg transition-transform duration-500 ease-out group-hover:scale-x-[1.3] motion-reduce:transition-none"
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
              : "absolute inset-0 h-full w-full object-contain p-6 transition-[scale,translate] duration-500 ease-out group-hover:-translate-y-1.5 group-hover:scale-[1.03] motion-reduce:transition-none"
          }
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <Heading className="text-xl font-semibold tracking-tight text-ink">{name}</Heading>
        {sub && <p className="mt-0.5 text-xs text-graphite">{sub}</p>}
        {figures && <p className="mt-2 text-sm font-semibold text-forest">{figures}</p>}
        {tagline && <p className="mt-3 text-sm font-semibold text-ink">{tagline}</p>}
        {copy && <p className="mt-2 text-sm leading-relaxed text-graphite">{copy}</p>}
        {specs.length > 0 && (
          <ul className="mt-4 space-y-1.5 text-sm text-ink">
            {specs.map((s) => (
              <li key={s} className="flex items-start gap-2">
                <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-signal" />
                {s}
              </li>
            ))}
          </ul>
        )}
        {note && <p className="mt-4 text-xs leading-relaxed text-graphite">{note}</p>}
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
  const reveal = useScrollReveal(list, { stagger: 0.08 });
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
    <section id={id} aria-labelledby={`${id}-title`} className={`${tone === "paper" ? "bg-paper" : "bg-ice"} relative py-14 lg:py-20`}>
      <div className="container-site">
        <KineticHeading id={`${id}-title`} className="sol-h2 max-w-3xl font-semibold text-ink">
          {title}
        </KineticHeading>
        <div className={`mt-10 max-w-3xl divide-y divide-line rounded-2xl border border-line ${tone === "paper" ? "bg-ice/60" : "bg-paper"}`}>
          {items.map(({ q, a }, i) => (
            <details key={q} className="faq-item group/faq" open={i === 0 || undefined}>
              <summary
                onKeyDown={onKey}
                className="flex cursor-pointer items-center justify-between gap-4 px-5 py-5 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-signal sm:px-6"
              >
                <h3 className="font-semibold text-ink">{q}</h3>
                <span
                  aria-hidden="true"
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line text-forest transition-[transform,background-color] duration-300 group-open/faq:rotate-180 group-open/faq:bg-signal/25"
                >
                  <ChevronDown className="h-4 w-4" />
                </span>
              </summary>
              <p className="px-5 pb-5 text-sm leading-relaxed text-graphite sm:px-6">{a}</p>
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
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-left text-sm transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal ${
                on ? "border-signal/60 bg-signal/15 text-white" : "border-white/15 bg-transparent text-ice/60 hover:border-white/30 hover:text-ice/85"
              }`}
            >
              <span aria-hidden="true" className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border transition-colors duration-200 ${on ? "border-signal bg-signal" : "border-white/30"}`}>
                <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none">
                  <path
                    d="M2.5 6.2 5 8.6 9.6 3.6"
                    pathLength="1"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-forest transition-[stroke-dashoffset] duration-300 ease-out motion-reduce:transition-none"
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
    <section id={id} data-cta-band aria-labelledby={`${id}-title`} className="relative overflow-hidden bg-night py-14 text-white lg:py-20">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(45% 60% at 80% 40%, rgba(144,217,136,0.08), transparent 70%)" }} />
      <Spotlight />
      <div className="relative container-site grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
        <div>
          {eyebrow && (
            <KineticEyebrow className="text-xs font-semibold uppercase tracking-[0.2em] text-signal" ruleClass="bg-signal">
              {eyebrow}
            </KineticEyebrow>
          )}
          <KineticHeading id={`${id}-title`} className={`sol-h2 ${eyebrow ? "mt-3" : ""} font-semibold`}>
            {title}
          </KineticHeading>
          {subheading && <p className="mt-4 text-lg font-medium text-white">{subheading}</p>}
          <p id={`${id}-body`} className="mt-4 max-w-xl leading-relaxed text-ice/80">
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
            <Checklist items={checklist} dark className="" />
          )}
        </div>
      </div>
    </section>
  );
}
