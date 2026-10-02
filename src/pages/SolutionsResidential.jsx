import { Link } from "react-router-dom";
import {
  ArrowRight,
  BatteryCharging,
  ExternalLink,
  Expand,
  Home,
  Leaf,
  MonitorCheck,
  Moon,
  ShieldCheck,
  Smartphone,
  Sun,
  CloudSun,
  Wallet,
  Unplug,
} from "lucide-react";
import { RESIDENTIAL_FAQ } from "../data/solutions";
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
    <div className="solutions-page">
      <SolutionHero
        crumb="Residential"
        eyebrow="Residential Energy Solutions"
        line1="Power Your Home."
        line2="Smarter."
        subheading="Solar power shouldn't stop when the sun goes down."
        body={[
          "NEXERA brings next-generation residential energy storage solutions from Midea and TCL, combining solar, battery storage and intelligent energy management to help Indian homes use more of the energy they generate.",
          "Whether you want to reduce your electricity bill, keep essential appliances running during outages, or build a more energy-independent home, our residential systems are designed to grow with your needs.",
        ]}
        tagline="Solar + Storage + Intelligence: one complete energy solution for your home."
        cta={{ label: "Explore Our Residential Solutions", target: "home-solutions" }}
        image={{
          name: "res-house",
          alt: "Rendering of a home at night with rooftop solar and a wall-mounted TCL battery beside the garage",
          credit: "TCL residential storage · technology partner imagery",
        }}
      />

      <BenefitStrip
        items={[
          { icon: Sun, title: "Store Solar Energy", text: "Use power day and night" },
          { icon: BatteryCharging, title: "Backup During Outages", text: "Keep essential loads running" },
          { icon: Wallet, title: "Reduce Electricity Bills", text: "More savings, more freedom" },
          { icon: Leaf, title: "Cleaner Tomorrow", text: "For your family and the planet" },
        ]}
      />

      <Section id="why-home" eyebrow="Why residential energy storage" title="Why Add Battery Storage to Your Home?">
        <FeatureGrid
          items={[
            { icon: Sun, title: "Store the Solar You Generate", text: "Use excess solar energy generated during the day instead of sending it back to the grid." },
            { icon: Moon, title: "Use Solar After Sunset", text: "Store energy during the day and use it during evening and night-time consumption." },
            { icon: BatteryCharging, title: "Backup When You Need It", text: "Keep essential loads such as lights, fans, refrigerators, Wi-Fi and other selected appliances running during power interruptions." },
            { icon: Unplug, title: "Reduce Grid Dependence", text: "Increase your self-consumption and reduce your dependence on grid electricity." },
            { icon: Smartphone, title: "Monitor Your Energy", text: "Smart monitoring gives you visibility of solar generation, battery status, consumption and energy flows." },
            { icon: Expand, title: "Built to Scale", text: "Start with the capacity your home needs today and expand your storage as your energy requirements grow." },
          ]}
        />
      </Section>

      <Section
        id="partners"
        tone="ice"
        eyebrow="Our global technology partners"
        title="Two Global Technology Brands. One Trusted Platform."
        intro={[
          "NEXERA is bringing residential energy solutions from Midea and TCL to the Indian market. These are not start-up battery brands entering the market overnight. They are backed by large global technology and manufacturing groups with decades of experience in engineering, electronics, manufacturing and energy technologies.",
        ]}
      >
        <CardGrid columns={2}>
          {PARTNERS.map((p) => (
            <article key={p.key} className="flex h-full flex-col rounded-2xl border border-line bg-paper p-6 md:p-8">
              <PartnerMark partner={p.partner} name={p.name} decorative />
              <h3 className="mt-5 text-lg font-semibold leading-snug text-ink">{p.title}</h3>
              <Stats items={p.stats} />
              <p className="mt-5 flex-1 text-sm leading-relaxed text-graphite">{p.copy}</p>
              <Link
                to={p.cta.to}
                className="group/cta mt-6 inline-flex items-center gap-1.5 self-start text-sm font-semibold text-forest hover:text-steel"
              >
                {p.cta.label}
                <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-1" />
              </Link>
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
        eyebrow="Choose your home energy system"
        title="Solutions for Every Home"
        intro="From simple solar systems to complete smart energy homes, choose what fits your needs."
      >
        <CardGrid columns={4}>
          {SYSTEMS.map((s, i) => (
            <article key={s.title} className="relative flex h-full flex-col rounded-2xl border border-line bg-paper p-6">
              <span aria-hidden="true" className="absolute left-6 top-0 h-0.5 w-8 rounded-full bg-signal" />
              <span className="text-3xl font-semibold leading-none tracking-tight text-forest/20">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-4 text-lg font-semibold text-ink">{s.title}</h3>
              <p className="mt-1 text-sm font-semibold text-forest">{s.lead}</p>
              <p className="mt-3 text-sm leading-relaxed text-graphite">{s.copy}</p>
              {s.ideal && (
                <p className="mt-3 flex-1 text-sm leading-relaxed text-graphite">
                  <strong className="font-semibold text-ink">Ideal for:</strong> {s.ideal}
                </p>
              )}
              <Link
                to="/contact?intent=residential"
                className="group/cta mt-6 inline-flex items-center gap-1.5 self-start text-sm font-semibold text-forest hover:text-steel"
              >
                Learn More
                <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-1" />
              </Link>
            </article>
          ))}
        </CardGrid>
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
        checklist={[
          "Recommended solar capacity",
          "Battery capacity",
          "Backup loads",
          "Expected solar self-consumption",
          "Available government subsidy",
          "System configuration",
          "Expansion possibilities",
        ]}
        button={{ label: "Design My Home Energy System", to: "/contact?intent=residential" }}
      />
    </div>
  );
}
