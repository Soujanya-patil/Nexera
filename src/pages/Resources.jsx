import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigationType } from "react-router-dom";
import { ARTICLES } from "../data/articles";
import { coverBack, returningTo } from "../components/article/curtain";
import { useArticleMotion } from "../components/article/useArticleMotion";
import { useArticleReveal } from "../components/article/useArticleReveal";
import ArticleFaq from "../components/article/ArticleFaq";
import ArticleClosingBand from "../components/article/ArticleClosingBand";
import ResourcesHero from "../components/resources/ResourcesHero";
import FilterBar from "../components/resources/FilterBar";
import GuidesBento from "../components/resources/GuidesBento";
import DatasheetCards from "../components/resources/DatasheetCards";
import InsightCards from "../components/resources/InsightCards";
import { isFirstLoad } from "../lib/firstLoad";

// The documents on offer: a product (data/products.js) and which document it is.
const datasheets = [
  { product: "tcl-blueark-w10", kind: "Datasheet" },
  { product: "hithium-block-261", kind: "Datasheet" },
  { product: "hithium-power-625", kind: "Brochure" },
];

const faqs = [
  { q: "What's the difference between C&I and utility-scale BESS?", a: "C&I systems are sized for factories, warehouses, and commercial sites — typically cabinet or small containerized units. Utility-scale systems are multi-megawatt-hour DC blocks built for grid-connected projects." },
  { q: "Do I need existing BESS experience to become a distributor?", a: "No. Most of our partners come from a solar EPC background with strong PV experience but limited battery storage exposure — that's exactly the gap our training and design support exist to close." },
  { q: "How long does commissioning support take?", a: "It varies by project scale and segment, but our engineers work your first sizing and commissioning alongside you as part of onboarding, not as a one-off session." },
];

const articles = [
  "What Is C&I Battery Storage and Why Bangalore Businesses Are Adopting It",
  "TCL BlueArk W10 vs X5: Which Fits Your Project?",
  "How Battery Storage Cuts Demand Charges for Indian Factories",
  "Liquid-Cooled vs Air-Cooled BESS: What EPCs Should Know",
];

const TITLE = "Datasheets, answers, and the latest from Nexera";
// The hub's sections, in page order, and the tone the page shifts to while each is read.
const SECTIONS = [
  { id: "guides", label: "Guides", tone: "white" },
  { id: "datasheets", label: "Datasheets", tone: "grey" },
  { id: "faqs", label: "FAQs", tone: "white" },
  { id: "insights", label: "Insights", tone: "grey" },
];
/** "Guide" / "Guides" for a count. */
const noun = (n, one) => (n === 1 ? one : `${one}s`);

/**
 * The section being read: the last section whose top has passed a line 30% down the screen ("all"
 * above the first). Read from the four sections' positions at most once per frame while scrolling
 * (reliable after a jump too, unlike an observer that only reports crossings).
 */
function useSectionSpy(ids) {
  const [active, setActive] = useState("all");
  const key = ids.join(",");
  useEffect(() => {
    const els = key.split(",").map((id) => document.getElementById(id)).filter(Boolean);
    let raf = 0;
    const update = () => {
      raf = 0;
      const line = window.innerHeight * 0.3;
      let current = "all";
      for (const el of els) if (el.getBoundingClientRect().top <= line) current = el.id;
      setActive(current);
    };
    const onScroll = () => (raf ||= requestAnimationFrame(update));
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [key]);
  return active;
}

/**
 * When to load the page's motion. Arriving from the site: at once (the h1 reveal needs it). On a
 * direct load, everything above the fold is already final, so it waits for the reader to scroll, tap or
 * press a key — or a few seconds after load — keeping the first paint's main thread free.
 */
const MOTION_EVENTS = ["scroll", "wheel", "touchstart", "pointerdown", "keydown"];
function useWanted(now) {
  const [wanted, setWanted] = useState(now);
  useEffect(() => {
    if (wanted) return;
    const go = () => setWanted(true);
    MOTION_EVENTS.forEach((t) => window.addEventListener(t, go, { once: true, passive: true }));
    const t = setTimeout(go, 3500);
    return () => {
      clearTimeout(t);
      MOTION_EVENTS.forEach((t) => window.removeEventListener(t, go));
    };
  }, [wanted]);
  return wanted;
}

/** A section heading: a short green line that draws in, then the heading rising word by word. */
function Heading({ id, children }) {
  return (
    <div data-rv="h2">
      <svg aria-hidden="true" className="article-h2-line" viewBox="0 0 64 4" preserveAspectRatio="none">
        <line x1="1" y1="2" x2="63" y2="2" />
      </svg>
      <h2 id={id} className="article-h2 text-[clamp(1.75rem,3vw,2.5rem)] font-semibold leading-tight tracking-tight text-ink">
        {children}
      </h2>
    </div>
  );
}

/**
 * /resources — the Knowledge Hub. A dark hero (energy grid, the h1, count chips from the data), a
 * sticky section bar (FilterBar: glides to a section, follows the one being read), then:
 *   Guides               a bento: the newest guide as a featured card with its live scene, a
 *                        "Start here" panel into its sections, any other guides (GuidesBento)
 *   Datasheets           product cards, each asking for its document on the contact form (DatasheetCards)
 *   FAQs                 the article's animated accordion (ArticleFaq), same words
 *   News & Insights      numbered cards — "Coming soon" while a title has no page (InsightCards)
 * and the article's closing band. The page's background shifts softly between white and light grey
 * as you move through the sections (no hard edges). Headings draw a line and rise word by word,
 * content fades up once (useArticleReveal, once the page's motion has loaded, below the screen only).
 *
 * Every word is in the pre-rendered page and readable without JavaScript; reduced motion is static.
 * Back from a guide opened here: the curtain shrinks back into its card.
 */
export default function Resources() {
  const page = useRef(null);
  const [arrived] = useState(() => typeof window !== "undefined" && !isFirstLoad());
  const motion = useArticleMotion(useWanted(arrived));
  useArticleReveal(page, motion);
  const active = useSectionSpy(SECTIONS.map((s) => s.id));

  // Back from an article opened from a Guides card: the curtain shrinks back into that card.
  const navType = useNavigationType();
  useLayoutEffect(() => {
    if (navType !== "POP") return;
    const back = ARTICLES.find((a) => returningTo(a.slug));
    const card = back && document.querySelector(`[data-slug="${back.slug}"]`);
    if (card) coverBack(card);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The count chips, from the page's own data: guides, each kind of download, FAQs.
  const kinds = datasheets.map((d) => d.kind);
  const chips = [
    { n: ARTICLES.length, label: noun(ARTICLES.length, "Guide") },
    ...[...new Set(kinds)].map((k) => {
      const n = kinds.filter((x) => x === k).length;
      return { n, label: noun(n, k) };
    }),
    { n: faqs.length, label: noun(faqs.length, "FAQ") },
  ];
  const tone = SECTIONS.find((s) => s.id === active)?.tone ?? "white";

  return (
    <div ref={page}>
      <ResourcesHero id="hub" eyebrow="Resources" title={TITLE} chips={chips} reveal={arrived} />
      <FilterBar active={active} items={[{ id: "all", label: "All", target: "hub" }, ...SECTIONS.map((s) => ({ id: s.id, label: s.label, target: s.id }))]} />

      <div data-tone={tone} className="resources-body">
        <section id="guides" aria-labelledby="guides-title" className="scroll-mt-32 py-14 lg:py-20">
          <div className="container-site">
            <Heading id="guides-title">Guides</Heading>
            <GuidesBento articles={[...ARTICLES].sort((x, y) => y.datePublished.localeCompare(x.datePublished))} motion={motion} />
          </div>
        </section>

        <section id="datasheets" aria-labelledby="datasheets-title" className="scroll-mt-32 py-14 lg:py-20">
          <div className="container-site">
            <Heading id="datasheets-title">Datasheets &amp; Brochures</Heading>
            <DatasheetCards items={datasheets} />
          </div>
        </section>

        <ArticleFaq id="faqs" title="FAQs" items={faqs} tone="none" />

        <section id="insights" aria-labelledby="insights-title" className="scroll-mt-32 py-14 lg:py-20">
          <div className="container-site">
            <Heading id="insights-title">News &amp; Insights</Heading>
            <InsightCards items={articles} />
          </div>
        </section>
      </div>

      <ArticleClosingBand />
    </div>
  );
}
