import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
import { formatDate } from "../../data/articles";

// The energy grid behind the header: faint lines (drawn in once) and the paths the green pulses run on.
const GRID_LINES = [
  "M0 90 H1440",
  "M0 210 H1440",
  "M0 330 H1440",
  "M180 0 V420",
  "M560 0 V420",
  "M940 0 V420",
  "M1260 0 V420",
];
// (kept to the right of the text, so nothing ever moves across the words)
const PULSE_PATHS = ["M1460 90 H940 V440", "M940 -20 V210 H1460", "M1460 330 H1260 V-20"];

/**
 * The article's header: breadcrumb, eyebrow, the h1, the intro line and the byline, over a faint
 * animated energy grid, with a "Scroll to explore" cue.
 *
 * Motion is CSS from the first paint (index.css, "Article header"), so the pre-rendered text is never
 * hidden and re-shown by JavaScript: the intro fades up and the reading time counts in. The h1 (the
 * page's largest paint) shows at once on a direct load; only when the article is opened from a Guides
 * card (`reveal`) do its words — split into spans right here — rise out of a mask one after another.
 * `play` holds all of it until that card's page transition has uncovered the page ("wait" → "now"). The grid's lines draw in and three pulses travel along them; the cue bounces until
 * the first scroll. Reduced motion: everything static.
 */
export default function ArticleHeader({ a, play = "now", reveal = false }) {
  const [scrolled, setScrolled] = useState(false);
  // The grid's pulses run only while the header is on screen.
  const root = useRef(null);
  const [off, setOff] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setOff(!e.isIntersecting));
    io.observe(root.current);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    const on = () => {
      if (window.scrollY > 24) setScrolled(true);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  const words = a.h1.split(" ");

  return (
    <section ref={root} data-play={play} data-reveal={reveal || undefined} data-off={off || undefined} className="article-header relative overflow-hidden bg-night text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(50% 70% at 85% 30%, rgba(144,217,136,0.10), transparent 70%)" }} />
      <svg aria-hidden="true" className="article-grid pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1440 420" preserveAspectRatio="xMidYMid slice">
        {GRID_LINES.map((d, i) => (
          <path key={d} d={d} pathLength="1" className="article-grid-line" style={{ "--i": i }} />
        ))}
        {PULSE_PATHS.map((d, i) => (
          <circle key={d} r="3.5" className="article-grid-pulse" style={{ offsetPath: `path("${d}")`, "--i": i }} />
        ))}
      </svg>

      <div className="relative container-site pb-16 pt-14 lg:pb-24 lg:pt-20">
        <nav aria-label="Breadcrumb" className="text-xs text-ice/75">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link to="/" className="hover:text-white">
                Home
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="h-3.5 w-3.5" />
            </li>
            <li>
              <Link to="/resources" className="hover:text-white">
                Resources
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="h-3.5 w-3.5" />
            </li>
            <li aria-current="page" className="text-ice/90">
              {a.shortTitle}
            </li>
          </ol>
        </nav>
        <div className="mt-10 max-w-3xl">
          <p className="article-eyebrow text-xs font-semibold uppercase tracking-[0.22em] text-signal">{a.eyebrow}</p>
          <h1 className="article-h1 mt-5 text-[clamp(2.2rem,4.6vw,3.5rem)] font-semibold leading-[1.08] tracking-tight">
            {words.map((w, i) => (
              <span key={i}>
                {i > 0 && " "}
                <span className="article-h1-word" style={{ "--i": i }}>
                  <span>{w}</span>
                </span>
              </span>
            ))}
          </h1>
          <p className="article-intro mt-6 max-w-2xl text-lg leading-relaxed text-ice/90">{a.intro}</p>
          <p className="article-byline mt-6 text-sm text-ice/75">
            By NEXERA Powertech · <time dateTime={a.datePublished}>{formatDate(a.datePublished)}</time> ·{" "}
            <span className="article-count" style={{ "--to": a.readingTime }}>
              <span className="article-count-num">{a.readingTime}</span>
            </span>{" "}
            min read
          </p>
        </div>
        <p aria-hidden="true" className={`article-cue absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-1.5 text-xs font-medium text-ice/70 transition-opacity duration-500 ${scrolled ? "opacity-0" : ""}`}>
          Scroll to explore
          <ChevronDown className="h-4 w-4" />
        </p>
      </div>
    </section>
  );
}
