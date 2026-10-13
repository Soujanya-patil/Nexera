import { useEffect, useRef, useState } from "react";
import { useArticleMotion } from "../components/article/useArticleMotion";
import { useArticleReveal } from "../components/article/useArticleReveal";
import ArticleFaq from "../components/article/ArticleFaq";
import ArticleClosingBand from "../components/article/ArticleClosingBand";
import ResourcesHero from "../components/resources/ResourcesHero";
import FilterBar from "../components/resources/FilterBar";
import DatasheetCards from "../components/resources/DatasheetCards";
import InsightCards from "../components/resources/InsightCards";
import { useWanted } from "../components/resources/useWanted";
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
 *   Datasheets           product cards, each asking for its document on the contact form (DatasheetCards)
 *   FAQs                 the article's animated accordion (ArticleFaq), same words
 *   News & Insights      numbered cards — "Coming soon" while a title has no page (InsightCards)
 * and the article's closing band. The page's background shifts softly between white and light grey
 * as you move through the sections (no hard edges). Headings draw a line and rise word by word,
 * content fades up once (useArticleReveal, once the page's motion has loaded, below the screen only).
 *
 * Every word is in the pre-rendered page and readable without JavaScript; reduced motion is static.
 * The articles live on the Blog (/blog), reached from the header and footer.
 */
export default function Resources() {
  const page = useRef(null);
  const [arrived] = useState(() => typeof window !== "undefined" && !isFirstLoad());
  const motion = useArticleMotion(useWanted(arrived));
  useArticleReveal(page, motion);
  const active = useSectionSpy(SECTIONS.map((s) => s.id));

  // The count chips, from the page's own data: each kind of download, FAQs.
  const kinds = datasheets.map((d) => d.kind);
  const chips = [
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
