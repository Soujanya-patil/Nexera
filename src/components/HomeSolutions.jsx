import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useEntrance } from "../lib/entrance";
import { PARTNERS, PRODUCTS } from "../data/products";
import { SOLUTION_PAGES } from "../data/solutions";

// The card photos (src/assets/home-cards): each exported at 600 / 900 / 1200 px wide (4:3) as AVIF,
// WebP and JPG, from the approved 1600 x 1200 originals (nexera-reference/NEXERA_home_cards_images).
const cardFiles = import.meta.glob("../assets/home-cards/*.{avif,webp,jpg}", { eager: true, query: "?url", import: "default" });
const CARD_WIDTHS = [600, 900, 1200];
const cardUrl = (name, w, ext) => cardFiles[`../assets/home-cards/${name}-${w}.${ext}`];
const cardSet = (name, ext) => CARD_WIDTHS.map((w) => `${cardUrl(name, w, ext)} ${w}w`).join(", ");

/** A card photo as a <picture> (AVIF → WebP → JPG), its intrinsic size set, loaded lazily. */
function CardPicture({ name, alt, position }) {
  const sizes = "(min-width: 768px) 33vw, 100vw";
  return (
    <picture>
      <source type="image/avif" srcSet={cardSet(name, "avif")} sizes={sizes} />
      <source type="image/webp" srcSet={cardSet(name, "webp")} sizes={sizes} />
      <img
        src={cardUrl(name, 900, "jpg")}
        srcSet={cardSet(name, "jpg")}
        sizes={sizes}
        width={1200}
        height={900}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="card-media h-full w-full object-cover"
        style={{ objectPosition: position }}
      />
    </picture>
  );
}

// Which technology partners have systems for each application — read from the product catalogue,
// so the preview can never claim a pairing the catalogue doesn't have.
const partnersFor = (app) => PARTNERS.filter((p) => PRODUCTS.some((x) => x.partner === p.id && x.applications.includes(app)));
const countFor = (app) => PRODUCTS.filter((x) => x.applications.includes(app)).length;

/** A very soft light that follows the pointer across the section (mouse only). */
const trackSpotlight = (e) => {
  if (e.pointerType !== "mouse") return;
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--cx", `${Math.round(e.clientX - r.left)}px`);
  e.currentTarget.style.setProperty("--cy", `${Math.round(e.clientY - r.top)}px`);
};
import AnimatedText from "./ui/AnimatedText";
import ParallaxMedia from "./ui/ParallaxMedia";
import { DUR, EASE, STAGGER } from "../lib/tokens";

// Copy from the approved mockup; the photos are the approved home-card images (`img`, with `position`:
// the focal point that keeps the house / cabinets / containers in view, clear of the big title).
// Each card links to its segment's section on the Solutions page.
// On the photo (approved card mockup): an eyebrow, the title (the card's h3) and the benefits, the latter
// taken from each card's previous description. `shape` is the card's transparent accent shape (a
// clip-path); the white copy of the title is clipped to it, so the title turns white where it crosses
// into the colour. Positions and sizes are in % of the photo and cqi (its width), so they hold at every
// card width; C&I's eyebrow and benefits are placed relative to its circle.
const cards = [
  {
    id: "residential",
    title: ["Residential"],
    eyebrow: "For homes",
    benefits: "Backup · Lower bills · Independence",
    shape: "polygon(0 0, 52% 0, 40% 100%, 0 100%)",
    shade: "from-black/75 via-black/62 to-black/82",
    at: {
      eyebrow: { left: "6%", top: "12%" },
      title: { left: "6%", top: "42%", fontSize: "11.2cqi" },
      benefits: { left: "6%", bottom: "9%", maxWidth: "36%" },
    },
    page: SOLUTION_PAGES.residential.path,
    cta: "Explore Residential Storage",
    img: "residential",
    position: "70% 50%",
    alt: "Indian home with rooftop solar and a wall-mounted home battery",
  },
  {
    id: "ci",
    title: ["C&I"],
    eyebrow: "For businesses",
    benefits: "Peak shaving · Reliability · Solar ROI",
    // The brightest photo (white cabinets): a deeper shade keeps its text AA.
    shape: "circle(28cqi at 66% 50%)",
    shade: "from-black/82 via-black/72 to-black/84",
    at: {
      eyebrow: { left: "calc(66% - 15cqi)", top: "calc(50% - 20cqi)" },
      title: { left: "17%", top: "50%", fontSize: "23cqi", translate: "0 -50%" },
      benefits: { left: "calc(66% - 15cqi)", top: "calc(50% + 13cqi)", maxWidth: "38cqi" },
    },
    page: SOLUTION_PAGES.ci.path,
    cta: "Explore C&I Storage",
    img: "ci",
    position: "70% 50%",
    alt: "Factory with rooftop solar and outdoor battery cabinets",
  },
  {
    id: "utility",
    title: ["Utility-", "Scale"],
    eyebrow: "For the grid",
    benefits: "Grid stability · Large-scale storage",
    shape: "polygon(0 62%, 100% 30%, 100% 100%, 0 100%)",
    shade: "from-black/75 via-black/62 to-black/82",
    at: {
      eyebrow: { right: "6%", top: "12%" },
      title: { left: "5.5%", top: "41%", fontSize: "9.6cqi" },
      benefits: { right: "6%", bottom: "8%", textAlign: "right" },
    },
    page: SOLUTION_PAGES.utility.path,
    cta: "Explore Utility-Scale Storage",
    img: "utility",
    position: "100% 50%",
    alt: "Solar farm with utility-scale battery storage containers",
  },
];

/**
 * Solutions — a product-discovery moment: the three segment cards act as a BESS selector.
 * Entrance: Residential → C&I → Utility rise out of their own frames in turn (same direction, short
 * stagger).
 * Each card's photo is black & white under a dark shade, with one transparent accent shape; the
 * title (Montserrat) crosses the shape's edge — accent outside, white inside. Below the photo only the
 * partners with systems for that application (from the catalogue), the system count and the link.
 * Hover (a fine pointer) and keyboard focus: the photo returns to full colour (0.4 s; at once under
 * reduced motion), the card rises with a deeper shadow, the photo zooms slowly, the arrow moves. Phones
 * keep the black & white photo. The section carries a very soft light that follows the mouse.
 */
export default function HomeSolutions() {
  const grid = useRef(null);
  // Montserrat (the photo text) is only applied once the cards come within 400 px of the screen, so the
  // browser doesn't fetch it during the first load: the cards sit below the first screen, and fetching it
  // early delayed the hero's largest paint. Until then the text is set in the site font (off-screen).
  const [face, setFace] = useState(false);
  useEffect(() => {
    const el = grid.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setFace(true);
        io.disconnect();
      },
      { rootMargin: "400px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const font = face ? "font-montserrat" : "font-sans";
  const enter = useEntrance(grid, ({ tl, q }) => {
    tl.fromTo(
      q("[data-e]"),
      { opacity: 0, y: 36 },
      { opacity: 1, y: 0, duration: DUR.slow, stagger: STAGGER, ease: EASE.emphasized, clearProps: "all" }
    );
  });
  return (
    <section onPointerMove={trackSpotlight} className="group/sol relative overflow-hidden bg-paper py-section">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-slow group-hover/sol:opacity-100 group-focus-visible/sol:opacity-100 group-focus-within/sol:opacity-100"
        style={{ background: "radial-gradient(520px circle at var(--cx, -999px) var(--cy, -999px), color-mix(in srgb, var(--accent) 9%, transparent), transparent 65%)" }}
      />
      <div className="relative container-site">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow text-muted">Our Solutions</p>
            <AnimatedText className="mt-eyebrow text-h2 font-semibold text-ink">Energy Storage for Every Need</AnimatedText>
            <p className="mt-heading max-w-measure text-copy">
              From homes to industries to the grid — Nexera brings the right storage solution for every application.
            </p>
          </div>
          <Link
            to="/solutions"
            className="group/all inline-flex min-h-11 shrink-0 items-center gap-2 text-button font-semibold text-accent transition-colors hover:text-link focus-visible:text-link"
          >
            View All Solutions
            <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform duration-fast group-hover/all:translate-x-1 group-focus-visible/all:translate-x-1 group-focus-within/all:translate-x-1" />
          </Link>
        </div>

        <div ref={grid} data-enter={enter} className="mt-10 grid gap-6 md:grid-cols-3">
          {cards.map((c) => (
            <article
              key={c.id}
              data-e
              className="group relative flex flex-col overflow-hidden rounded-card border border-line bg-white card-hover"
            >
              {/* The photo and the text set on it; a dark ground for the accent and the white text. */}
              <div data-ground="dark" className="@container relative h-[300px] overflow-hidden">
                <ParallaxMedia
                  amount={5}
                  className="grayscale contrast-110 transition-[filter] duration-[400ms] ease-standard motion-reduce:transition-none pointer-fine:group-hover:grayscale-0 pointer-fine:group-hover:contrast-100 group-has-[a:focus-visible]:grayscale-0 group-has-[a:focus-visible]:contrast-100"
                >
                  <CardPicture name={c.img} alt={c.alt} position={c.position} />
                </ParallaxMedia>
                {/* A dark soft shade (deepest at the top and foot, where the small white text sits), then the
                    transparent accent shape over it — dark enough beneath that all text keeps AA contrast */}
                <span aria-hidden="true" className={`pointer-events-none absolute inset-0 bg-gradient-to-b ${c.shade}`} />
                <span data-shape aria-hidden="true" className="pointer-events-none absolute inset-0 bg-accent/40" style={{ clipPath: c.shape }} />
                <p className={`absolute ${font} text-[0.6875rem] font-bold uppercase tracking-[0.24em] text-white`} style={c.at.eyebrow}>
                  {c.eyebrow}
                </p>
                <h3 className={`absolute ${font} font-extrabold uppercase leading-[0.95] text-accent`} style={c.at.title}>
                  {c.title.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </h3>
                {/* The same title in white, clipped to the shape (decorative: the h3 above is the heading) */}
                <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ clipPath: c.shape }}>
                  <p className={`absolute ${font} font-extrabold uppercase leading-[0.95] text-white`} style={c.at.title}>
                    {c.title.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </p>
                </div>
                <p className={`absolute ${font} text-[0.8125rem] font-medium leading-snug text-white`} style={c.at.benefits}>
                  {c.benefits}
                </p>
              </div>
              <div className="flex flex-1 flex-col p-6">
                {/* Product preview (space always reserved, so hovering never shifts the layout) */}
                <p className="flex translate-y-1 items-center gap-2 text-micro text-copy transition-[translate] duration-base ease-standard group-hover:translate-y-0 group-focus-visible:translate-y-0 group-focus-within:translate-y-0 ">
                  <span className="h-1.5 w-1.5 rounded-full bg-label" aria-hidden="true" />
                  <span className="font-semibold text-copy">{partnersFor(c.id).map((p) => p.name).join(" · ")}</span>
                  <span aria-hidden="true">·</span>
                  {countFor(c.id)} {countFor(c.id) === 1 ? "system" : "systems"}
                </p>
                {/* Stretched link: the whole card is the target; the visible text names where it goes (the
                    accessible name is the same words) */}
                <Link
                  to={c.page}
                  aria-label={c.cta}
                  className="mt-5 inline-flex items-center gap-2 text-button font-semibold text-accent after:absolute after:inset-0 group-hover:text-link group-focus-visible:text-link group-focus-within:text-link focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  {c.cta}
                  <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform duration-fast group-hover:translate-x-1.5 group-focus-visible:translate-x-1.5 group-focus-within:translate-x-1.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
