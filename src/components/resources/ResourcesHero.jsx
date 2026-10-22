import EnergyGrid from "../article/EnergyGrid";

/**
 * The Resources (and Blog) hero: dark, like the homepage's, over the article's animated energy grid.
 * Eyebrow, the h1, then an intro line and/or count chips built from the page's own data (so they
 * follow it). The h1 (the page's
 * largest paint) shows at once on a direct load; arriving from another page of the site (`reveal`)
 * its words rise out of a mask one after another — CSS (the article header's), so nothing pre-rendered
 * is ever hidden by JavaScript. The chips fade up in turn. Reduced motion: static.
 */
export default function ResourcesHero({ id, eyebrow, title, intro, chips = [], reveal }) {
  const words = title.split(" ");
  return (
    <section id={id} data-play="now" data-reveal={reveal || undefined} className="article-header relative overflow-hidden bg-deep-grid text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(50% 70% at 85% 30%, color-mix(in_srgb,var(--accent)_12%,transparent), transparent 70%)" }} />
      <EnergyGrid />
      <div className="relative container-site pb-14 pt-14 lg:pb-20 lg:pt-20">
        <p className="article-eyebrow eyebrow text-accent">{eyebrow}</p>
        <h1 className="article-h1 mt-5 max-w-3xl text-h1 font-semibold">
          {words.map((w, i) => (
            <span key={i}>
              {i > 0 && " "}
              <span className="article-h1-word" style={{ "--i": i }}>
                <span>{w}</span>
              </span>
            </span>
          ))}
        </h1>
        {intro && <p className="article-intro mt-6 max-w-2xl text-lead text-paper/90">{intro}</p>}
        {chips.length > 0 && (
          <ul aria-label="On this page" className="resources-chips mt-8 flex flex-wrap gap-2.5">
            {chips.map((c, i) => (
              <li key={c.label} style={{ "--i": i }} className="rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-small font-medium text-paper/90 backdrop-blur-sm">
                <span className="font-semibold text-accent">{c.n}</span> {c.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
