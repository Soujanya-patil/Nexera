import { useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { BadgeCheck, ChevronRight, GraduationCap, Ruler, Wrench } from "lucide-react";
import { FaqList, FeatureGrid, Section, Stats } from "../components/solutions/SolutionBlocks";
import { Spotlight } from "../components/solutions/Interactive";
import MagneticButton from "../components/ui/MagneticButton";
import ProductCard from "../components/catalogue/ProductCard";
import HomeCta from "../components/HomeCta";
import NotFound from "./NotFound";
import { partnerOf } from "../data/products";
import { RESIDENTIAL_BENEFITS } from "../data/solutions";
import { PARTNER_LINE, PARTNER_WHY, getPartnerPage, partnerFaq, partnerProducts } from "../data/partners";
import { useIntro } from "../lib/intro";
import { useScrollReveal } from "../lib/scrollReveal";
import { scrollToId } from "../lib/scrollTo";

const WHY_ICONS = [BadgeCheck, Ruler, GraduationCap, Wrench];

/**
 * /partners/:partnerId — one page per technology partner (Hithium, TCL, CLOU, Midea), so each brand
 * has a real page to be found by: the hero (logo, "{Partner} energy storage in India"), about the
 * partner with the figures the site already shows, its systems from the catalogue (Midea has none
 * yet: the residential benefits and an enquiry), why buy it through NEXERA, the FAQ (also the page's
 * FAQPage data) and the homepage's closing band.
 *
 * Built only from existing components (the Solutions pages' sections, the catalogue's product cards,
 * the homepage's closing band) and existing copy (data/partners.js names the source of every line).
 * NEXERA is the authorized distributor; the partner designs and manufactures the systems.
 */
export default function Partner() {
  const { partnerId } = useParams();
  const page = getPartnerPage(partnerId);
  if (!page) return <NotFound />;
  return <PartnerPage key={page.id} page={page} />;
}

function PartnerPage({ page }) {
  const { id, name, interest, about } = page;
  const products = partnerProducts(id);
  const contact = `/#contact?interest=${interest}`;
  const list = useRef(null);
  const reveal = useScrollReveal(list, { stagger: 0.08 });

  return (
    <div>
      <PartnerHero id={id} name={name} contact={contact} />

      <Section id="about" eyebrow="Technology partner" title={`About ${name}`} intro={about.copy}>
        <Stats items={about.stats} className={`mt-8 max-w-4xl ${about.stats.length === 4 ? "sm:grid-cols-4" : "sm:grid-cols-3"}`} />
      </Section>

      <Section
        id="systems"
        tone="ice"
        eyebrow={products.length ? undefined : "Residential energy storage, by enquiry"}
        title={`${name} systems available through NEXERA`}
        className="scroll-mt-16"
      >
        {products.length ? (
          <ul ref={list} data-sr-state={reveal} className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <li data-sr key={p.id}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        ) : (
          <>
            <FeatureGrid items={RESIDENTIAL_BENEFITS} />
            <div className="mt-12">
              <MagneticButton to={contact} arrow spotlight className="hover:scale-[1.02]">
                Talk to us about {name} home storage
              </MagneticButton>
            </div>
          </>
        )}
      </Section>

      <Section id="why" title={`Why buy ${name} through NEXERA`}>
        <FeatureGrid columns={4} items={PARTNER_WHY.map((w, i) => ({ ...w, icon: WHY_ICONS[i] }))} />
      </Section>

      <FaqList id="faq" title={`${name} in India — Frequently Asked Questions`} items={partnerFaq(id)} />

      <HomeCta contactTo={contact} />
    </div>
  );
}

/**
 * The partner's hero, in the Solutions heroes' type and dark ground (no photo: the logo leads). The
 * visible breadcrumb matches the structured data (Products › partner). Entrance on client-side
 * navigation only (lib/intro), as on the other heroes.
 */
function PartnerHero({ id, name, contact }) {
  const root = useRef(null);
  const logo = partnerOf(id);
  const intro = useIntro(root, ({ tl, q }) => {
    const done = { clearProps: "all" };
    tl.fromTo(q('[data-a="logo"]'), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", ...done }, 0)
      .fromTo(q('[data-a="line"]'), { opacity: 1, yPercent: 100 }, { yPercent: 0, duration: 0.65, ease: "expo.out", stagger: 0.09, ...done }, 0.1)
      .fromTo(q('[data-a="desc"]'), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", ...done }, 0.3)
      .fromTo(q('[data-a="cta"]'), { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.45, stagger: 0.08, ease: "power2.out", ...done }, 0.5);
  });

  return (
    <section ref={root} className="relative overflow-hidden bg-night text-white">
      <Spotlight />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(50% 70% at 85% 30%, rgba(144,217,136,0.10), transparent 70%)" }} />
      <div data-intro={intro} className="relative container-site py-14 lg:py-20">
        <nav aria-label="Breadcrumb" className="text-xs text-ice/75">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link to="/products" className="hover:text-white">
                Products
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="h-3.5 w-3.5" />
            </li>
            <li aria-current="page" className="text-ice/90">
              {name}
            </li>
          </ol>
        </nav>
        <div className="mt-10 max-w-2xl">
          {/* The logo on a light panel (as on the product pages); Midea has no logo file: its name in type. */}
          <div data-a="logo" className="inline-flex h-14 items-center rounded-xl bg-paper px-5">
            {logo ? (
              <img src={logo.logo} alt={name} decoding="async" className={`${id === "clou" ? "h-8" : "h-6"} w-auto`} />
            ) : (
              // The site's typeset wordmark for a partner without a logo file (as PartnerMark sets it).
              <span className="text-2xl font-bold uppercase leading-6 tracking-tight text-ink">{name}</span>
            )}
          </div>
          <h1 className="mt-6 text-[clamp(2.6rem,6vw,4.25rem)] font-semibold leading-[1.04] tracking-tight">
            <span className="line-mask">
              <span data-a="line" className="block">
                {name} energy storage
              </span>
            </span>{" "}
            <span className="line-mask">
              <span data-a="line" className="block text-signal">
                in India
              </span>
            </span>
          </h1>
          <p data-a="desc" className="mt-6 max-w-xl text-lg leading-relaxed text-ice/90">
            {PARTNER_LINE}
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <span data-a="cta" className="inline-block">
              <MagneticButton to="#systems" onClick={scrollToId("systems")} arrow spotlight className="hover:scale-[1.02]">
                See {name} systems
              </MagneticButton>
            </span>
            <span data-a="cta" className="inline-block">
              <MagneticButton to={contact} variant="outline" sweep className="hover:-translate-y-0.5">
                Contact Us
              </MagneticButton>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
