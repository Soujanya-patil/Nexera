import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
import { formatDate } from "../../data/articles";
import EnergyGrid from "./EnergyGrid";

/**
 * The article's header: breadcrumb, eyebrow, the h1, the intro line and the byline, over a faint
 * animated energy grid, with a "Scroll to explore" cue.
 *
 * Motion is CSS from the first paint (index.css, "Article header"), so the pre-rendered text is never
 * hidden and re-shown by JavaScript: the intro fades up and the reading time counts in. The h1 (the
 * page's largest paint) shows at once on a direct load; only when the article is opened from a Guides
 * card (`reveal`) do its words — split into spans right here — rise out of a mask one after another.
 * `play` holds all of it until that card's page transition has uncovered the page ("wait" → "now").
 * The energy grid draws in behind (EnergyGrid); the cue bounces until the first scroll. Reduced
 * motion: everything static.
 */
export default function ArticleHeader({ a, play = "now", reveal = false }) {
  const [scrolled, setScrolled] = useState(false);
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
    <section data-play={play} data-reveal={reveal || undefined} className="article-header relative overflow-hidden bg-deep-grid text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(50% 70% at 85% 30%, color-mix(in_srgb,var(--accent)_10%,transparent), transparent 70%)" }} />
      <EnergyGrid />

      <div className="relative container-site pb-16 pt-14 lg:pb-24 lg:pt-20">
        <nav aria-label="Breadcrumb" className="text-micro text-paper/75">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link to="/" className="hit-area hover:text-white focus-visible:text-white">
                Home
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="h-3.5 w-3.5" />
            </li>
            <li>
              <Link to="/blog" className="hit-area hover:text-white focus-visible:text-white">
                Blog
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="h-3.5 w-3.5" />
            </li>
            <li aria-current="page" className="text-paper/90">
              {a.shortTitle}
            </li>
          </ol>
        </nav>
        <div className="mt-10 max-w-3xl">
          <p className="article-eyebrow eyebrow text-accent">{a.eyebrow}</p>
          <h1 className="article-h1 mt-5 text-h1 font-semibold">
            {words.map((w, i) => (
              <span key={i}>
                {i > 0 && " "}
                <span className="article-h1-word" style={{ "--i": i }}>
                  <span>{w}</span>
                </span>
              </span>
            ))}
          </h1>
          <p className="article-intro mt-6 max-w-2xl text-lead text-paper/90">{a.intro}</p>
          <p className="article-byline mt-6 text-small text-paper/75">
            By NEXERA Powertech · <time dateTime={a.datePublished}>{formatDate(a.datePublished)}</time> ·{" "}
            <span className="article-count" style={{ "--to": a.readingTime }}>
              <span className="article-count-num">{a.readingTime}</span>
            </span>{" "}
            min read
          </p>
        </div>
        <p aria-hidden="true" className={`article-cue absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-1.5 text-micro font-medium text-paper/70 transition-opacity duration-base ${scrolled ? "opacity-0" : ""}`}>
          Scroll to explore
          <ChevronDown className="h-4 w-4" />
        </p>
      </div>
    </section>
  );
}
