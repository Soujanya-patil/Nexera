import { useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Clock, DraftingCompass, Factory, GraduationCap, House, MapPin, Phone, ShieldCheck, UtilityPole, Wrench } from "lucide-react";
import ScenePicture from "../components/ScenePicture";
import MagneticButton from "../components/ui/MagneticButton";
import PillLink from "../components/PillLink";
import HomeCta from "../components/HomeCta";
import { ArrowLink, ArrowUnderline, PartnerStrip } from "../components/solutions/Interactive";
import { CardGrid, FaqList, FeatureGrid, Section } from "../components/solutions/SolutionBlocks";
import { useIntro } from "../lib/intro";
import { DUR, RISE, STAGGER } from "../lib/tokens";
import { ADDRESS, BRANCH_ADDRESS, PHONE, phoneHref } from "../data/business";
import { BENGALURU_FAQ, DIRECTIONS_HREF, HOURS_LINE, OFFERS, SUPPORT } from "../data/locations";

/*
 * Battery Energy Storage in Bengaluru & Karnataka (/locations/bengaluru): the site's local page. Every
 * fact is one the site already states (data/locations.js names each source); the sections reuse the
 * Solutions pages' blocks, the Solutions partner strip and the shared closing band.
 */

const OFFER_ICONS = { residential: House, ci: Factory, utility: UtilityPole };
const SUPPORT_ICONS = { sizing: DraftingCompass, commissioning: Wrench, training: GraduationCap, "after-sales": ShieldCheck };

/**
 * Hero: the Solutions heroes' look (dark ground, the C&I dusk scene on the right melting into it,
 * full-bleed and dimmed on phones), with the plain pages' entrance — on a client-side visit the copy
 * rises in turn; on a direct load the pre-rendered hero is simply there.
 */
function Hero() {
  const root = useRef(null);
  const intro = useIntro(root, ({ tl, q }) => {
    tl.fromTo(q("[data-a]"), { opacity: 0, y: RISE }, { opacity: 1, y: 0, duration: DUR.slow, stagger: STAGGER, clearProps: "all" });
  });
  return (
    <section ref={root} data-intro={intro} className="relative overflow-hidden bg-deep-grid hero-ground text-white">
      <div className="absolute inset-0 overflow-hidden lg:left-[46%] xl:left-[38%] lg:[mask-image:linear-gradient(to_right,transparent,#000_42%)] xl:[mask-image:linear-gradient(to_right,transparent,#000_26%)]">
        {/* The C&I dusk scene (the same files as the /solutions header and the C&I hero). */}
        <ScenePicture
          name="ci"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          sizes="(min-width: 1024px) 62vw, 100vw"
          alt="Render of three TCL battery cabinets beside a commercial building at dusk"
          className="h-full w-full object-cover object-[55%_50%] md:object-[35%_50%] lg:object-[85%_50%]"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-deep-grid/75 lg:bg-transparent lg:bg-gradient-to-r lg:from-deep-grid lg:via-deep-grid/60 lg:to-deep-grid/10" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-deep-grid/90 to-transparent" />
      </div>

      <div className="relative container-site py-14 lg:py-24">
        <nav aria-label="Breadcrumb" className="text-micro text-paper/75">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link to="/where-we-operate" className="hit-area hover:text-white focus-visible:text-white">
                Where We Operate
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="h-3.5 w-3.5" />
            </li>
            <li aria-current="page" className="text-paper/90">
              Bengaluru
            </li>
          </ol>
        </nav>
        <div className="mt-10 max-w-2xl">
          <p data-a className="flex items-center gap-3 eyebrow text-label">
            <span aria-hidden="true" className="h-px w-8 bg-accent/70" />
            Bengaluru · Karnataka
          </p>
          <h1 data-a className="mt-eyebrow text-h1 font-semibold">
            Battery Energy Storage in Bengaluru &amp; Karnataka
          </h1>
          <p data-a className="mt-heading max-w-xl text-lead text-paper/90">
            NEXERA supplies battery energy storage systems from TCL and Hithium to homes, businesses and utility projects across Karnataka, from our Bengaluru office.
          </p>
          <div data-a className="mt-9 flex flex-wrap items-center gap-4">
            <MagneticButton to="/contact" arrow spotlight>
              Talk to our Bengaluru team
            </MagneticButton>
            {PHONE && (
              <PillLink href={phoneHref(PHONE)} variant="outline">
                <Phone aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
                Call {PHONE}
              </PillLink>
            )}
          </div>
        </div>
      </div>
      <p className="absolute bottom-4 right-6 hidden rounded-full bg-deep-grid/85 px-3 py-1 text-micro tracking-[0.14em] text-paper/90 backdrop-blur-sm lg:block">Illustrative image</p>
    </section>
  );
}

/** A contact card: icon circle (the feature grids' style), h3, its content. */
function InfoCard({ icon: Icon, title, children }) {
  return (
    <div className="h-full rounded-card border border-line bg-ice/60 p-6">
      <span aria-hidden="true" className="grid h-11 w-11 place-items-center rounded-full bg-white text-ink">
        <Icon className="h-5 w-5" strokeWidth={1.7} />
      </span>
      <h3 className="mt-4 font-semibold text-ink">{title}</h3>
      <div className="mt-1.5 text-small text-copy">{children}</div>
    </div>
  );
}

const linkClass = "group/arrow inline-flex min-h-11 items-center gap-1.5 text-button font-semibold text-accent hover:text-link focus-visible:text-link focus-visible:outline-2 focus-visible:outline-offset-4";

export default function LocationBengaluru() {
  return (
    <>
      <Hero />

      <Section id="visit" tone="paper" title="Visit or call us">
        <CardGrid columns={3} className="mt-10">
          {[
          <InfoCard key="office" icon={MapPin} title="Offices">
            <address className="not-italic">
              <span className="block font-semibold text-ink">Head office</span>
              {ADDRESS}
            </address>
            {/* A plain link to Google Maps directions (new tab): no map embed, so the page stays light. */}
            <a href={DIRECTIONS_HREF} target="_blank" rel="noopener noreferrer" className={`${linkClass} mt-3`}>
              <ArrowUnderline>
                Get directions<span className="sr-only"> to the head office (opens in a new tab)</span>
              </ArrowUnderline>
            </a>
            <address className="mt-4 not-italic">
              <span className="block font-semibold text-ink">Branch office</span>
              {BRANCH_ADDRESS}
            </address>
          </InfoCard>,
          PHONE && (
            <InfoCard key="phone" icon={Phone} title="Phone">
              <a href={phoneHref(PHONE)} className="link-inline inline-flex min-h-11 items-center text-body font-semibold text-accent">
                {PHONE}
              </a>
            </InfoCard>
          ),
          <InfoCard key="hours" icon={Clock} title="Opening hours">
            <p>{HOURS_LINE}</p>
          </InfoCard>,
          ].filter(Boolean)}
        </CardGrid>
      </Section>

      <Section id="offer" tone="ice" title="What we offer in Karnataka">
        <CardGrid columns={3} className="mt-10">
          {OFFERS.map((o) => {
            const Icon = OFFER_ICONS[o.id];
            return (
              <Link
                key={o.id}
                to={o.path}
                className="card-hover group flex h-full flex-col rounded-card border border-line bg-white p-6 focus-visible:outline-2 focus-visible:outline-offset-2 md:p-7"
              >
                <span aria-hidden="true" className="grid h-11 w-11 place-items-center rounded-full bg-ice text-ink transition-colors duration-fast group-hover:bg-accent/25 group-hover:text-accent group-focus-visible:bg-accent/25 group-focus-visible:text-accent">
                  <Icon className="h-5 w-5" strokeWidth={1.7} />
                </span>
                <h3 className="mt-4 text-h4 font-semibold text-ink">{o.label}</h3>
                <p className="mt-1.5 text-small text-copy">{o.line}</p>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-small font-semibold text-accent">
                  <ArrowUnderline group="card">{o.cta}</ArrowUnderline>
                </span>
              </Link>
            );
          })}
        </CardGrid>
      </Section>

      <Section
        id="support"
        tone="paper"
        title="How we support local projects"
        intro="NEXERA's head office is in Bengaluru, with a technician training centre opening in Kalaburagi, Karnataka, in 2027."
      >
        <FeatureGrid columns={4} items={SUPPORT.map((s) => ({ ...s, icon: SUPPORT_ICONS[s.key] }))} />
        <div className="mt-10 flex flex-wrap gap-x-8 gap-y-2">
          <ArrowLink to="/service-training" className="min-h-11">
            Service &amp; Training
          </ArrowLink>
          <ArrowLink to="/how-it-works" className="min-h-11">
            How It Works
          </ArrowLink>
        </div>
      </Section>

      <Section
        id="partners"
        tone="ice"
        title="Partner products"
        intro="NEXERA brings systems from world-leading BESS manufacturers — TCL and Hithium — with products across residential, C&I and utility-scale segments."
      >
        <PartnerStrip partners={["tcl", "hithium"]} className="mt-12" />
        <div className="mt-10 text-center">
          <ArrowLink to="/products" className="min-h-11">
            Explore all products
          </ArrowLink>
        </div>
      </Section>

      <FaqList id="faq" tone="paper" title="Frequently Asked Questions" items={BENGALURU_FAQ} />

      {/* The shared closing band. */}
      <HomeCta />
    </>
  );
}
