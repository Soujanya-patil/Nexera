import { reducedMotion } from "./motion";

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

/** Opens or closes a <details> with its height animated (no jump); plain toggle under reduced motion. */
function toggle(e) {
  const d = e.currentTarget.parentElement;
  if (reducedMotion() || !d.animate) return; // the native toggle
  e.preventDefault();
  if (d.dataset.busy) return;
  d.dataset.busy = "1";
  const summary = d.querySelector("summary");
  const border = d.offsetHeight - d.clientHeight; // the card's top and bottom borders
  const closed = `${summary.offsetHeight + border}px`;
  const done = () => {
    delete d.dataset.busy;
    d.style.height = "";
    d.style.overflow = "";
  };
  d.style.overflow = "hidden";
  if (!d.open) {
    d.open = true;
    const full = `${d.scrollHeight + border}px`;
    d.animate({ height: [closed, full] }, { duration: 360, easing: EASE }).onfinish = done;
  } else {
    const full = `${d.offsetHeight}px`;
    d.dataset.closing = "1";
    d.animate({ height: [full, closed] }, { duration: 280, easing: EASE }).onfinish = () => {
      d.open = false;
      delete d.dataset.closing;
      done();
    };
  }
}

/**
 * The article's FAQ: one card per question (a native <details>, so it works without JavaScript; every
 * answer stays in the page, word for word the FAQPage data). Opening and closing animate the height
 * smoothly, the "+" turns into a "×", and the open card gets a soft green glow. The questions rise in
 * one after another as the section arrives (the page's reveal, data-rv). The first starts open.
 */
export default function ArticleFaq({ id, title, items, tone = "ice" }) {
  return (
    // tone="none": no background of its own (a page that shifts its sections' tone itself, /resources)
    <section id={id} aria-labelledby={`${id}-title`} className={`${tone === "ice" ? "scroll-mt-24 bg-ice" : "scroll-mt-32"} py-14 lg:py-20`}>
      <div className="container-site">
        <div data-rv="h2">
          <svg aria-hidden="true" className="article-h2-line" viewBox="0 0 64 4" preserveAspectRatio="none">
            <line x1="1" y1="2" x2="63" y2="2" />
          </svg>
          <h2 id={`${id}-title`} className="article-h2 max-w-3xl text-[clamp(1.75rem,3vw,2.5rem)] font-semibold leading-tight tracking-tight text-ink">
            {title}
          </h2>
        </div>
        <div className="mt-10 max-w-3xl space-y-3">
          {items.map(({ q, a }, i) => (
            <details key={q} data-rv="text" className="article-faq group/faq rounded-2xl border border-line bg-paper" open={i === 0 || undefined}>
              <summary
                onClick={toggle}
                className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal sm:px-6 [&::-webkit-details-marker]:hidden"
              >
                <h3 className="font-semibold text-ink">{q}</h3>
                <span aria-hidden="true" className="article-faq-icon grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line text-forest">
                  <span />
                  <span />
                </span>
              </summary>
              <p className="px-5 pb-5 text-[17px] leading-relaxed text-graphite sm:px-6">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
