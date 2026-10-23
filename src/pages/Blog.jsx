import { useLayoutEffect, useRef, useState } from "react";
import { useNavigationType } from "react-router-dom";
import { ARTICLES } from "../data/articles";
import { coverBack, returningTo } from "../components/article/curtain";
import { useArticleMotion } from "../components/article/useArticleMotion";
import { useArticleReveal } from "../components/article/useArticleReveal";
import ArticleClosingBand from "../components/article/ArticleClosingBand";
import ResourcesHero from "../components/resources/ResourcesHero";
import GuidesBento from "../components/resources/GuidesBento";
import { useWanted } from "../components/resources/useWanted";
import { isFirstLoad } from "../lib/firstLoad";

/**
 * /blog — every article (data/articles.js), newest first, in the Resources hub's look: the dark hero
 * over the energy grid (h1 "NEXERA Blog" and the intro), then the bento (GuidesBento): the newest
 * article as the large featured card with its live scene and a "Start here" panel into its sections,
 * the others as cards below — each a real link, with the spotlight hover and the curtain transition
 * into the article; Back from one shrinks the curtain into its card. With a single article the page
 * is the featured card and its panel (no empty grid). Then the closing band.
 *
 * The h1 shows at once on a direct load (the page's largest paint); the motion loads after the first
 * interaction then (useWanted). Reduced motion: static. Every word is in the pre-rendered page.
 */
export default function Blog() {
  const page = useRef(null);
  const [arrived] = useState(() => typeof window !== "undefined" && !isFirstLoad());
  const motion = useArticleMotion(useWanted(arrived));
  useArticleReveal(page, motion);

  // Back from an article opened here: the curtain shrinks back into its card.
  const navType = useNavigationType();
  useLayoutEffect(() => {
    if (navType !== "POP") return;
    const back = ARTICLES.find((a) => returningTo(a.slug));
    const card = back && document.querySelector(`[data-slug="${back.slug}"]`);
    if (card) coverBack(card);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const posts = [...ARTICLES].sort((x, y) => y.datePublished.localeCompare(x.datePublished));
  return (
    <div ref={page}>
      <ResourcesHero id="blog" eyebrow="Blog" title="NEXERA Blog" intro="Plain guides on battery energy storage for homes, businesses and the grid." reveal={arrived} />
      <section aria-label="Articles" className="bg-white pb-section pt-6 lg:pt-12">
        <div className="container-site">
          <GuidesBento articles={posts} motion={motion} />
        </div>
      </section>
      <ArticleClosingBand />
    </div>
  );
}
