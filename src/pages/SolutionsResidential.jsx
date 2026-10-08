import { lazy, Suspense, useState } from "react";
import {
  BatteryCharging,
  ExternalLink,
  Expand,
  Home,
  Leaf,
  MonitorCheck,
  ShieldCheck,
  Sun,
  CloudSun,
  Wallet,
} from "lucide-react";
import { RESIDENTIAL_BENEFITS, RESIDENTIAL_FAQ } from "../data/solutions";
import { CTA_TOPICS } from "../data/solutionTopics";
import { AfterIdle, ArrowLink, KeywordTicker, NearViewport, SectionRail } from "../components/solutions/Interactive";
const SegmentSwitcher = lazy(() => import("../components/solutions/SegmentSwitcher"));

// The energy-flow diagram and its day slider are their own chunk, loaded when "Solutions for Every Home" is near.
const EnergyFlow = lazy(() => import("../components/solutions/EnergyFlow"));
const DaySlider = lazy(() => import("../components/solutions/EnergyFlow").then((m) => ({ default: m.DaySlider })));

// What the diagram shows for each system, for screen readers (the diagram itself is decorative).
const FLOW_SUMMARY = {
  1: "Energy flow for Solar + Grid: solar panels and the grid both supply the home.",
  2: "Energy flow for Solar + Battery: solar supplies the home and charges the battery, and the battery supplies the home later.",
  3: "Energy flow for Solar + Battery + Backup: as Solar + Battery, and during a grid outage the battery keeps selected backup loads running.",
  4: "Energy flow for Complete Smart Home Energy: solar, battery, grid, home, EV charger and backup loads all connected.",
};
import {
  BenefitStrip,
  CardGrid,
  CtaBand,
  DataTable,
  FaqList,
  FeatureGrid,
  FlowSteps,
  PartnerMark,
  Section,
  SolutionHero,
  Stats,
} from "../components/solutions/SolutionBlocks";

/*
 * /solutions/residential — copy from the director-approved Solutions content. Midea has no logo in
 * src/assets, so its name is set in type. The FAQ text comes from data/solutions.js and is also this
 * page's FAQPage data. PM Surya Ghar: only the scheme wording supplied (no claim about a 2.0 subsidy).
 */

const PARTNERS = [
  {
    key: "midea",
    name: "Midea",
    title: "Midea — A global technology group founded in 1968.",
    stats: [
      ["US$64.3 billion", "revenue (2025)"],
      ["~190,000", "employees"],
      ["65", "production centres"],
      ["41", "R&D centres"],
      ["#231", "in the 2026 Fortune Global 500"],
    ],
    copy: "Midea operates across Smart Home, Industrial Technology, Building Technology, Robotics & Automation, Healthcare, Logistics and New Energy. Its New Energy business includes residential energy storage, inverters, distributed PV and utility/C&I energy storage.",
    cta: { label: "Explore Midea Residential Solutions", to: "/contact?intent=residential&brand=midea" },
  },
  {
    key: "tcl",
    partner: "tcl",
    title: "TCL — A global technology group with deep capabilities across displays, electronics, photovoltaics and energy storage.",
    stats: [["US$49.67 billion+", "group revenue (2025), across TCL Industries and TCL Technology"]],
    copy: "TCL has built capabilities across the PV value chain and expanded into energy storage, including PV, inverters and energy-storage systems.",
    cta: { label: "Explore TCL BlueArk X1", to: "/products/tcl-blueark-x1" },
  },
];

const SYSTEMS = [
  {
    title: "Solar + Grid",
    lead: "For homes focused on reducing electricity bills.",
    copy: "Solar PV generates electricity during the day and the grid supplies power when required.",
    ideal: "Homes with predictable daytime consumption.",
  },
  {
    title: "Solar + Battery",
    lead: "For greater solar self-consumption.",
    copy: "Store excess daytime solar and use it when your home needs it.",
    ideal: "Homes with significant evening and night-time consumption.",
  },
  {
    title: "Solar + Battery + Backup",
    lead: "For energy independence and backup.",
    copy: "Solar generates. Battery stores. The system automatically supports selected loads during grid outages.",
    ideal: "Premium homes, villas and locations where reliable backup is important.",
  },
  {
    title: "Complete Smart Home Energy",
    lead: "Solar + Battery + EV + Intelligent Energy Management.",
    copy: "Bring your home's energy ecosystem together: solar generation, battery storage, EV charging and household consumption working together through an intelligent energy-management platform.",
  },
];

export default function SolutionsResidential() {
  return (
    <div className="solutions-page segment-page">
      <SolutionHero
        segment="residential"
        crumb="Residential"
        eyebrow="Residential Energy Solutions"
        line1="Power Your Home."
        line2="Smarter."
        subheading="Solar power shouldn't stop when the sun goes down."
        body={[
          "NEXERA brings next-generation residential energy storage solutions from Midea and TCL, combining solar, battery storage and intelligent energy management to help Indian homes use more of the energy they generate.",
          "Whether you want to reduce your electricity bill, keep essential appliances running during outages, or build a more energy-independent home, our residential systems give you a solar battery for home, designed to grow with your needs.",
        ]}
        tagline="Solar + Storage + Intelligence: one complete energy solution for your home."
        cta={{ label: "Explore Our Residential Solutions", target: "home-solutions" }}
        image={{
          name: "res-house",
          alt: "Rendering of a home at night with rooftop solar and a wall-mounted TCL battery beside the garage",
          credit: "TCL residential storage · technology partner imagery",
        }}
      />
      {/* Sticky segment switcher (own chunk, mounted once the page is idle): shown once the hero has scrolled away. */}
      <AfterIdle>
        <Suspense fallback={null}>
          <SegmentSwitcher current="residential" />
        </Suspense>
      </AfterIdle>

      <BenefitStrip
        items={[
          { icon: Sun, title: "Store Solar Energy", text: "Use power day and night" },
          { icon: BatteryCharging, title: "Backup During Outages", text: "Keep essential loads running" },
          { icon: Wallet, title: "Reduce Electricity Bills", text: "More savings, more freedom" },
          { icon: Leaf, title: "Cleaner Tomorrow", text: "For your family and the planet" },
        ]}
      />
      <KeywordTicker
        label="Home energy storage capabilities"
        items={["Store Solar Energy", "Use Solar After Sunset", "Backup During Outages", "Smart Monitoring", "Built to Scale", "LFP Battery Technology"]}
      />

      <Section id="why-home" push mark="Battery Storage" eyebrow="Why residential energy storage" title="Why Add Battery Storage to Your Home?">
        <FeatureGrid items={RESIDENTIAL_BENEFITS} />
      </Section>

      <Section
        id="partners"
        mark="Trusted Platform"
        tone="ice"
        eyebrow="Our global technology partners"
        title="Two Global Technology Brands. One Trusted Platform."
        intro={[
          "NEXERA is bringing residential energy solutions from Midea and TCL to the Indian market. These are not start-up battery brands entering the market overnight. They are backed by large global technology and manufacturing groups with decades of experience in engineering, electronics, manufacturing and energy technologies.",
        ]}
      >
        <CardGrid columns={2}>
          {PARTNERS.map((p) => (
            <article key={p.key} className="group/card flex h-full flex-col rounded-2xl border border-line bg-paper p-6 md:p-8">
              <PartnerMark partner={p.partner} name={p.name} decorative />
              <h3 className="mt-5 text-lg font-semibold leading-snug text-ink">{p.title}</h3>
              <Stats items={p.stats} />
              <p className="mt-5 flex-1 text-sm leading-relaxed text-graphite">{p.copy}</p>
              <ArrowLink to={p.cta.to} className="mt-6 self-start">
                {p.cta.label}
              </ArrowLink>
            </article>
          ))}
        </CardGrid>
      </Section>

      <Section
        id="why-nexera"
        eyebrow="Global brands. Professional engineering."
        title="Why NEXERA Residential Solutions?"
        intro={[
          "We don't believe a home battery should be selected simply because it is the cheapest system available. A residential energy storage system is expected to operate for many years. Battery chemistry, thermal management, safety systems, inverter technology, software, monitoring and after-sales support all matter. That's why NEXERA focuses on technology platforms backed by established global manufacturers.",
        ]}
      >
        <h3 className="mt-12 text-xl font-semibold tracking-tight text-ink">What sets our solutions apart</h3>
        <FeatureGrid
          level={4}
          className="mt-8"
          items={[
            {
              icon: Leaf,
              title: "LFP Battery Technology",
              text: (
                <>
                  Designed around Lithium Iron Phosphate chemistry for safety and long service life. Midea&rsquo;s residential battery systems
                  specify LiFePO<sub>4</sub> cells.
                </>
              ),
            },
            {
              icon: ShieldCheck,
              title: "Multi-Level Safety",
              text: "Midea's residential systems include cell-level monitoring, dual overcurrent protection and aerosol fire suppression, with multiple safety mechanisms and rapid risk isolation.",
            },
            { icon: CloudSun, title: "Weather-Ready Design", text: "Selected Midea systems are rated IP65 and specified for operating temperatures from –20°C to 55°C." },
            { icon: MonitorCheck, title: "Smart Energy Management", text: "Monitor generation, consumption and battery operation through connected energy-management platforms." },
            { icon: Expand, title: "Modular & Scalable", text: "Midea's residential systems offer modular battery configurations, with some systems expandable up to 20.4 kWh." },
            { icon: Home, title: "Designed for Modern Homes", text: "Integrates with solar PV, backup loads, EV charging, heat pumps and other home energy loads." },
          ]}
        />
      </Section>

      <Section
        id="home-solutions"
        tone="ice"
        mark="Every Home"
        eyebrow="Choose your home energy system"
        title="Solutions for Every Home"
        intro="From simple solar systems to complete smart energy homes, choose what fits your needs."
      >
        <HomeSystems />
      </Section>

      <Section
        id="pm-surya-ghar"
        eyebrow="Government of India"
        title="PM Surya Ghar: Muft Bijli Yojana"
        intro={[
          "Make Solar More Affordable",
          "The Government of India's PM Surya Ghar: Muft Bijli Yojana is driving residential rooftop solar adoption across India. The scheme has a total outlay of ₹75,021 crore and targets rooftop solar installations for 1 crore households.",
        ]}
      >
        <DataTable
          className="mt-10 max-w-3xl"
          caption="Current Central Financial Assistance (CFA)"
          head={["Residential Solar Capacity", "Current CFA"]}
          rows={[
            ["First 2 kW", "60% of benchmark cost"],
            ["Additional 1 kW", "40% of benchmark cost"],
            ["Beyond 3 kW", "No additional CFA"],
            ["Maximum for an individual household", "₹78,000"],
          ]}
        />
        <p className="mt-6 max-w-3xl text-sm leading-relaxed text-graphite">
          Subsidy eligibility, benchmark costs and implementation requirements are governed by the current MNRE scheme and the National Portal.
          NEXERA can help customers understand the applicable process and coordinate the installation.
        </p>
        <a
          href="https://pmsuryaghar.gov.in"
          target="_blank"
          rel="noopener"
          className="group/pill mt-8 inline-flex items-center gap-2 rounded-full bg-signal px-6 py-3 text-sm font-semibold text-forest transition-[background-color,box-shadow,scale] duration-300 hover:bg-[#a4e39d] hover:shadow-[0_0_24px_2px_rgba(144,217,136,0.35)] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
        >
          PM Surya Ghar National Portal
          <ExternalLink aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
        <div className="mt-12 max-w-3xl rounded-2xl border border-line bg-ice p-6 md:p-8">
          <h3 className="text-xl font-semibold tracking-tight text-ink">What About PM Surya Ghar 2.0?</h3>
          <p className="mt-3 leading-relaxed text-graphite">
            As India moves towards the next generation of rooftop solar, battery storage is expected to play an increasingly important role in
            residential energy systems. NEXERA is ready with the technology to help homeowners move from simply generating solar power to
            intelligently managing their home&rsquo;s energy.
          </p>
        </div>
      </Section>

      <Section
        id="nexera-difference"
        mark="Design Energy Systems"
        tone="ice"
        title="We Don't Just Sell Batteries. We Design Energy Systems."
        intro="With our experience in solar engineering, plant monitoring, energy analysis and system optimisation, NEXERA looks at the complete picture:"
      >
        <FlowSteps items={["Your consumption", "Solar generation", "Battery sizing", "Backup requirement", "Energy management", "Future expansion"]} />
        <p className="mt-8 max-w-3xl leading-relaxed text-graphite">
          The result is a system designed around how your home actually uses electricity, rather than simply selling you a battery of a particular
          size.
        </p>
      </Section>

      <FaqList id="faq" tone="paper" title="Home Battery Storage — Frequently Asked Questions" items={RESIDENTIAL_FAQ} />

      <CtaBand
        id="contact-home"
        eyebrow="Ready to make your home smarter?"
        title="Get a Personalized Energy Recommendation"
        body="Tell us your monthly electricity consumption and your current solar capacity. We'll help you determine:"
        checklist={CTA_TOPICS.residential}
        segment="residential"
        button={{ label: "Design My Home Energy System", to: "/contact?intent=residential" }}
      />
      {/* Last in the DOM, so keyboard users reach the page before the section dots. */}
      <SectionRail />
    </div>
  );
}

/**
 * "Solutions for Every Home": the energy-flow diagram above the four system cards, with "A day with
 * home storage" under it. Hovering or focusing a card (or tapping it on a phone) switches the diagram
 * to that system; the selected card is outlined and its big outline number fills. Default: 02 Solar +
 * Battery. Moving the day slider (or its first auto-play, or "Power cut") switches to 04 Complete Smart
 * Home Energy and shows that hour's flows. All card text stays visible.
 */
function HomeSystems() {
  const [mode, setMode] = useState(2);
  const [day, setDay] = useState(null); // null, or { hour, outage } while the slider drives the diagram
  const [hour, setHour] = useState(12);
  const pick = (m) => {
    setMode(m);
    setDay(null);
  };
  const onDay = (d) => {
    setMode(4);
    setHour(d.hour);
    setDay(d);
  };
  return (
    <>
      <div className="mt-12 rounded-2xl border border-line bg-paper px-4 py-6 sm:px-8">
        <NearViewport className="aspect-[3/1] w-full">
          <Suspense fallback={null}>
            <EnergyFlow mode={mode} day={day} />
          </Suspense>
        </NearViewport>
        {/* The slider's box is reserved, so nothing shifts when its chunk arrives. */}
        <NearViewport className="min-h-[6.5rem] sm:min-h-[5.25rem]">
          <Suspense fallback={null}>
            <DaySlider day={day} hour={hour} onDay={onDay} />
          </Suspense>
        </NearViewport>
        {!day && (
          <p className="sr-only" aria-live="polite">
            {FLOW_SUMMARY[mode]}
          </p>
        )}
      </div>
      <CardGrid columns={4} className="mt-6">
        {SYSTEMS.map((s, i) => {
          const on = mode === i + 1;
          return (
            <article
              key={s.title}
              onPointerEnter={(e) => e.pointerType === "mouse" && pick(i + 1)}
              onFocus={() => pick(i + 1)}
              onClick={() => pick(i + 1)}
              className={`relative flex h-full cursor-pointer flex-col rounded-2xl border bg-paper p-6 transition-[border-color,box-shadow,translate] duration-300 ${
                on ? "-translate-y-1 border-signal shadow-[0_0_0_1px_var(--color-signal),0_18px_40px_-28px_rgba(7,26,23,0.45)]" : "border-line"
              }`}
            >
              <span aria-hidden="true" className="absolute left-6 top-0 h-0.5 w-8 rounded-full bg-signal" />
              <span className={`step-num text-[4rem] font-semibold leading-none tracking-tight ${on ? "" : "is-outline"}`}>{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-4 text-lg font-semibold text-ink">{s.title}</h3>
              <p className="mt-1 text-sm font-semibold text-forest">{s.lead}</p>
              <p className="mt-3 text-sm leading-relaxed text-graphite">{s.copy}</p>
              {s.ideal && (
                <p className="mt-3 text-sm leading-relaxed text-graphite">
                  <strong className="font-semibold text-ink">Ideal for:</strong> {s.ideal}
                </p>
              )}
              <ArrowLink to="/contact?intent=residential" className="mt-auto self-start pt-6">
                Learn More
              </ArrowLink>
            </article>
          );
        })}
      </CardGrid>
    </>
  );
}
