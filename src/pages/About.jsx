import { useRef } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  BadgeCheck,
  Check,
  Container,
  Cpu,
  DraftingCompass,
  GraduationCap,
  Headset,
  Layers,
  Mail,
  MapPin,
  Network,
  Package,
  Phone,
  ShieldCheck,
  Sun,
  Wrench,
} from "lucide-react";
import Crumbs from "../components/Crumbs";
import SceneImg from "../components/SceneImg";
import MagneticButton from "../components/ui/MagneticButton";
import { ArrowLink, ArrowUnderline } from "../components/solutions/Interactive";
import { ADDRESS, BRANCH_ADDRESS, EMAIL, PHONE, phoneHref } from "../data/business";
import { DIRECTIONS_HREF } from "../data/locations";
import tclLogo from "../assets/partners/tcl-logo.png";
import hithiumLogo from "../assets/partners/hithium-logo.png";
import { useIntro } from "../lib/intro";
import { useScrollReveal } from "../lib/scrollReveal";
import { DUR, RISE, STAGGER } from "../lib/tokens";

/*
 * /about — the director's "About Section" (Step 9), word for word, in the about-redesign layout:
 * split hero → intro + partners → field experience → vision and goal (dark) → the support lifecycle →
 * the Academy (opening 2027) → leadership → where we are → work with us. No projects or MW figures,
 * no team photos. Motion: the hero's entrance (useIntro, client-side visits only) and the site's one
 * scroll reveal (data-sr); both show everything at once under prefers-reduced-motion.
 */

// The hero's three highlight chips (the about-redesign brief's own words).
const CHIPS = ["BESS solutions across India", "Residential, C&I and utility-scale", "Design, commissioning and after-sales support"];

const FIELD = [
  { icon: Sun, title: "EPC", text: "We have designed and built rooftop and ground-mounted solar plants for commercial and industrial customers." },
  {
    icon: Wrench,
    title: "Operations & maintenance",
    text: "We have maintained plants over many years, so we understand how systems age, where they fail, and what keeps them performing.",
  },
  {
    icon: Container,
    title: "Module trading",
    text: "We have imported and distributed solar modules for over a decade, and we know supply chains, logistics and import compliance.",
  },
  { icon: Network, title: "Inverter distribution", text: "We have built distributor and installer networks across India and supported them after the sale." },
];

const GOALS = [
  "Build an all-India network of trained distributors and EPC partners.",
  "Keep stock and spares in India so customers get fast delivery, not 60 to 90 day waits.",
  "Make every partner able to design, install and service storage systems with confidence.",
];

// The support lifecycle, in this order (no added steps: EPC partners carry out the installation).
const SUPPORT = [
  {
    icon: DraftingCompass,
    title: "System design and sizing",
    text: "Load analysis, right-sized configurations, and a project single-line diagram, including earthing and neutral layout.",
  },
  {
    icon: Cpu,
    title: "Commissioning support",
    text: "We commission your system, or supervise your team, and issue the commissioning report and warranty registration.",
  },
  { icon: Activity, title: "Remote diagnostics", text: "Our team monitors and diagnoses issues from system data, so problems are caught early." },
  { icon: ShieldCheck, title: "Warranty and claims", text: "We register every system and handle claims with the manufacturer on your behalf." },
  { icon: Package, title: "India spares stock", text: "Parts are available locally, so downtime is short." },
  { icon: Headset, title: "Technical guidance", text: "From pre-sales questions to long-term performance, our engineers are a call away." },
];

const ACADEMY = [
  { icon: Layers, text: "how BESS systems are designed, installed and commissioned" },
  { icon: ShieldCheck, text: "safe handling, protection and earthing practices" },
  { icon: Wrench, text: "troubleshooting and service, so partners can handle their own service calls" },
  { icon: BadgeCheck, text: "certification, so every installer works to one standard" },
];

// Leadership: simple cards, no photos, in the order given (roles exactly as given; none for Raviraj).
const LEADERS = [
  { name: "Ankit Jain", initials: "AJ", role: "Co-founder" },
  { name: "Narendra", initials: "N", role: "Co-founder" },
  { name: "Siddhant S Patil", initials: "SP", role: "Co-founder" },
  { name: "Raviraj", initials: "R" },
];

const PARTNER_LOGOS = [
  { id: "tcl", name: "TCL", src: tclLogo, size: [86, 31], className: "h-9" },
  { id: "hithium", name: "Hithium", src: hithiumLogo, size: [355, 89], className: "h-10" },
];

const H2 = "text-h2 font-semibold text-ink";
const PAD2 = (n) => String(n).padStart(2, "0");
const LINK = "group/arrow inline-flex min-h-11 items-center gap-1.5 text-button font-semibold text-accent hover:text-link focus-visible:text-link focus-visible:outline-2 focus-visible:outline-offset-4";

/** Fine technical grid lines, faded out towards the edges (decorative). */
function TechLines({ dark = true, at = "70% 40%", className = "" }) {
  const line = dark ? "rgb(255 255 255 / 0.05)" : "rgb(28 44 92 / 0.06)";
  const mask = `radial-gradient(ellipse 70% 80% at ${at}, black, transparent)`;
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{
        backgroundImage: `linear-gradient(to right, ${line} 1px, transparent 1px), linear-gradient(to bottom, ${line} 1px, transparent 1px)`,
        backgroundSize: "56px 56px",
        maskImage: mask,
        WebkitMaskImage: mask,
      }}
    />
  );
}

/** A soft green glow (decorative), for the dark grounds. */
function Glow({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute rounded-full ${className}`}
      style={{ background: "radial-gradient(closest-side, color-mix(in srgb, var(--color-signal) 9%, transparent), transparent)" }}
    />
  );
}

function Hero() {
  const root = useRef(null);
  const intro = useIntro(root, ({ tl, q }) => {
    tl.fromTo(q("[data-a]"), { opacity: 0, y: RISE }, { opacity: 1, y: 0, duration: DUR.slow, stagger: STAGGER, clearProps: "all" });
  });
  return (
    <section ref={root} data-intro={intro} className="relative overflow-hidden bg-deep-grid hero-ground text-white">
      <TechLines at="75% 45%" />
      <Glow className="-right-40 top-1/2 h-[40rem] w-[40rem] -translate-y-1/2" />
      <div className="relative container-site py-8 md:py-12 lg:py-16">
        {/* The eyebrow and the breadcrumbs on one row, as on every plain page hero. */}
        <div className="flex items-center justify-between gap-4">
          <p data-a className="shrink-0 eyebrow text-label">
            About Us
          </p>
          <Crumbs trail={[["About", "/about"]]} />
        </div>
        <div className="mt-6 grid items-center gap-10 lg:mt-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-14">
          <div>
            <h1 data-a className="max-w-intro text-h1 font-semibold">
              About Nexera Powertech
            </h1>
            <p data-a className="mt-heading max-w-measure text-lead text-paper/80">
              Powering India’s energy storage future, backed by 15 years of hands-on solar experience
            </p>
            <ul data-a className="mt-7 flex flex-wrap gap-2.5">
              {CHIPS.map((c) => (
                <li key={c} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-small text-paper/90">
                  <Check aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-accent" strokeWidth={2.6} />
                  {c}
                </li>
              ))}
            </ul>
          </div>
          <div data-a className="relative">
            <div className="overflow-hidden rounded-card border border-white/10 shadow-float">
              <SceneImg
                name="storage-tcl"
                eager
                fetchPriority="high"
                sizes="(min-width: 1280px) 640px, (min-width: 1024px) 50vw, 100vw"
                alt="TCL energy storage systems, from home batteries to commercial and industrial cabinets, on a reflective stage"
                className="aspect-[16/10] h-auto w-full object-cover object-[50%_88%]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function About() {
  // The site's scroll reveal: headings rise from their masks, copy and cards fade up (lib/scrollReveal).
  const root = useRef(null);
  const reveal = useScrollReveal(root);
  return (
    <div ref={root} data-sr-state={reveal}>
      <Hero />

      {/* Intro: the two paragraphs, beside the partner panel (each logo links to its partner page). */}
      <section className="bg-white">
        <div className="container-site grid items-center gap-12 py-section lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-20">
          <div>
            <p data-sr className="max-w-measure text-lead text-ink">
              Nexera Powertech is an energy storage company built by people who have spent 15+ years in Indian solar. Our promoters have
              designed, installed and maintained solar plants, traded solar modules at container scale, and distributed inverters across the
              country. We know what works on Indian rooftops and factory floors, and what fails. Nexera brings that experience to battery
              energy storage (BESS).
            </p>
            <p data-sr className="mt-6 max-w-measure border-l-2 border-accent pl-5 text-body text-copy">
              We are an authorised partner of TCL and Hithium, two leading global energy storage manufacturers. We supply their systems across
              India and back each one with local design, commissioning, training and service.
            </p>
          </div>
          <div data-sr className="relative overflow-hidden rounded-card border border-line bg-paper p-6 sm:p-8">
            <TechLines dark={false} at="50% 50%" />
            <ul className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {PARTNER_LOGOS.map((l) => (
                <li key={l.id}>
                  <Link
                    to={`/partners/${l.id}`}
                    className="card-hover flex min-h-28 items-center justify-center rounded-card border border-line bg-white px-6 py-8 focus-visible:outline-2 focus-visible:outline-offset-4"
                  >
                    <img src={l.src} width={l.size[0]} height={l.size[1]} loading="lazy" decoding="async" alt={`${l.name} logo`} className={`${l.className} w-auto`} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Experience that comes from the field: four cards, then the line under them as a pull-quote. */}
      <section className="bg-paper border-y border-line">
        <div className="container-site py-section">
          <h2 data-sr="heading" className={`max-w-2xl ${H2}`}>
            Experience that comes from the field
          </h2>
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FIELD.map(({ icon: Icon, title, text }) => (
              <li key={title} data-sr className="card-hover group/hl flex flex-col rounded-card border border-line bg-white p-6">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-ice text-ink transition-colors duration-fast group-hover/hl:bg-accent/15 group-hover/hl:text-accent">
                  <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.7} />
                </span>
                <h3 className="mt-5 text-h4 font-semibold text-ink">{title}</h3>
                <p className="mt-2 text-small text-copy">{text}</p>
              </li>
            ))}
          </ul>
          <figure data-sr className="mt-14 max-w-3xl">
            <span aria-hidden="true" className="block h-0.5 w-12 bg-accent" />
            <blockquote className="mt-5 text-h3 font-medium text-ink">
              <p>
                This background shapes how we work. We don&rsquo;t just ship equipment. We think like the EPC who has to install it and the
                customer who has to live with it for 10 years.
              </p>
            </blockquote>
          </figure>
        </div>
      </section>

      {/* Our vision / Our goal: the site's dark ground. */}
      <section className="relative overflow-hidden bg-deep-grid text-white">
        <TechLines at="20% 30%" />
        <Glow className="-left-48 -top-48 h-[36rem] w-[36rem]" />
        <div className="relative container-site grid gap-14 py-section lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-20">
          <div>
            <h2 data-sr className="eyebrow text-label">
              Our vision
            </h2>
            <p data-sr className="mt-6 max-w-2xl text-[clamp(1.375rem,1.05rem+1.25vw,2.125rem)] font-medium leading-[1.3] tracking-[-0.015em] text-white">
              To make reliable, safe and affordable energy storage a normal part of every Indian business, home and grid, and to build the skilled
              network that keeps those systems running.
            </p>
          </div>
          <div>
            <h2 data-sr className="eyebrow text-label">
              Our goal
            </h2>
            <ul className="mt-6 divide-y divide-white/10 border-y border-white/10">
              {GOALS.map((g, i) => (
                <li data-sr key={g} className="flex gap-4 py-5 text-body text-paper/85">
                  <span aria-hidden="true" className="mt-0.5 text-small font-semibold tabular-nums text-accent">
                    {PAD2(i + 1)}
                  </span>
                  {g}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Support that goes beyond the sale: the six items as one numbered lifecycle (a row on desktop,
          a vertical line on phones and tablets). */}
      <section className="bg-white">
        <div className="container-site py-section">
          <h2 data-sr="heading" className={`max-w-2xl ${H2}`}>
            Support that goes beyond the sale
          </h2>
          <p data-sr className="mt-heading max-w-measure text-body text-copy">
            A battery system is only as good as its design and commissioning. Nexera stands behind every project:
          </p>
          {/* The connector through the step numbers on desktop (a pseudo-element: the list holds only the
              six steps), from the first number's centre to the last's. */}
          <ol className="relative mt-12 grid lg:grid-cols-6 lg:gap-6 lg:before:absolute lg:before:left-[calc(100%/12)] lg:before:right-[calc(100%/12)] lg:before:top-[1.375rem] lg:before:h-px lg:before:bg-line lg:before:content-['']">
            {SUPPORT.map(({ icon: Icon, title, text }, i) => (
              <li data-sr key={title} className="relative flex gap-5 pb-10 last:pb-0 lg:block lg:pb-0 lg:text-center">
                {i < SUPPORT.length - 1 && <span aria-hidden="true" className="absolute bottom-0 left-[1.375rem] top-11 w-px bg-line lg:hidden" />}
                <span className="relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink text-small font-semibold tabular-nums text-white ring-8 ring-white lg:mx-auto">
                  {PAD2(i + 1)}
                </span>
                <div className="min-w-0 pt-2 lg:pt-5">
                  <Icon aria-hidden="true" className="hidden h-5 w-5 text-muted lg:mx-auto lg:mb-3 lg:block" strokeWidth={1.7} />
                  <h3 className="text-h4 font-semibold text-ink">{title}</h3>
                  <p className="mt-2 text-small text-copy">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* The Nexera Training Academy: opening 2027 (a badge says so; no training-centre photos). */}
      <section className="bg-paper border-y border-line">
        <div className="container-site py-section">
          <div data-sr className="relative overflow-hidden rounded-card bg-forest text-white lg:grid lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
            <TechLines at="15% 20%" />
            <div className="relative p-6 sm:p-10 lg:p-12">
              <p className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3.5 py-1.5 text-small font-semibold text-accent">
                <GraduationCap aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
                Opening 2027 · Kalaburagi
              </p>
              <h2 className="mt-6 text-h2 font-semibold">The Nexera Training Academy</h2>
              <p className="mt-heading max-w-measure text-body text-paper/80">
                Energy storage needs skilled people, and India doesn&rsquo;t have enough of them yet. So we are building the Nexera Training
                Academy, a dedicated hands-on training centre for commercial and industrial battery storage, opening in Kalaburagi in 2027.
              </p>
              <p className="mt-4 max-w-measure text-body text-paper/80">Technicians and engineers from EPC companies will work on live systems and learn:</p>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {ACADEMY.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex gap-3 rounded-card border border-white/10 bg-white/5 p-4 text-small text-paper/90">
                    <Icon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-accent" strokeWidth={1.7} />
                    {text}
                  </li>
                ))}
              </ul>
              <p className="mt-6 max-w-measure text-body text-paper/80">
                Nexera-certified installers deliver better projects, protect warranties, and give customers confidence.
              </p>
            </div>
            {/* An engineering view of an open storage cabinet, fading into the panel. */}
            <div className="relative min-h-64 lg:min-h-0">
              <SceneImg
                name="tech-cabinet"
                alt="An open battery storage cabinet showing its stacked battery modules"
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="absolute inset-0 h-full w-full object-cover object-[50%_50%]"
              />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-forest via-forest/20 to-forest/40 lg:bg-gradient-to-r lg:from-forest lg:via-forest/25 lg:to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Leadership: four simple cards, initials only (no photos). */}
      <section className="bg-white">
        <div className="container-site py-section">
          <h2 data-sr="heading" className={H2}>
            Leadership
          </h2>
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {LEADERS.map((l) => (
              <li data-sr key={l.name} className="flex items-center gap-4 rounded-card border border-line bg-white p-6">
                <span aria-hidden="true" className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-ink text-h4 font-semibold text-white">
                  {l.initials}
                </span>
                <div className="min-w-0">
                  <p className="text-h4 font-semibold text-ink">{l.name}</p>
                  {l.role && <p className="mt-1 text-small text-muted">{l.role}</p>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Where we are: the offices and the Academy, then phone, email and Where we operate. */}
      <section className="bg-paper border-y border-line">
        <div className="container-site py-section">
          <h2 data-sr="heading" className={H2}>
            Where we are
          </h2>
          <ul className="mt-10 grid gap-5 md:grid-cols-3">
            <li data-sr className="flex flex-col rounded-card border border-line bg-white p-6">
              <MapPin aria-hidden="true" className="h-5 w-5 text-muted" strokeWidth={1.7} />
              <h3 className="mt-4 text-h4 font-semibold text-ink">Bengaluru</h3>
              <address className="mt-1 not-italic text-small text-copy">
                <span className="block font-semibold text-ink">Head office</span>
                {ADDRESS}
              </address>
              <a href={DIRECTIONS_HREF} target="_blank" rel="noopener noreferrer" className={`${LINK} mt-auto pt-3`}>
                <ArrowUnderline>
                  Get directions<span className="sr-only"> to the head office (opens in a new tab)</span>
                </ArrowUnderline>
              </a>
            </li>
            <li data-sr className="flex flex-col rounded-card border border-line bg-white p-6">
              <MapPin aria-hidden="true" className="h-5 w-5 text-muted" strokeWidth={1.7} />
              <h3 className="mt-4 text-h4 font-semibold text-ink">Bengaluru</h3>
              <address className="mt-1 not-italic text-small text-copy">
                <span className="block font-semibold text-ink">Branch office</span>
                {BRANCH_ADDRESS}
              </address>
            </li>
            <li data-sr className="flex flex-col rounded-card border border-line bg-white p-6">
              <GraduationCap aria-hidden="true" className="h-5 w-5 text-muted" strokeWidth={1.7} />
              <h3 className="mt-4 text-h4 font-semibold text-ink">Kalaburagi</h3>
              <p className="mt-1 text-small text-copy">Nexera Training Academy, opening 2027</p>
            </li>
          </ul>
          <div data-sr className="mt-8 flex flex-col gap-x-8 gap-y-1 sm:flex-row sm:flex-wrap sm:items-center">
            {PHONE && (
              <a href={phoneHref(PHONE)} className="inline-flex min-h-11 items-center gap-2 text-body font-semibold text-accent hover:text-link">
                <Phone aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
                {PHONE}
              </a>
            )}
            <a href={`mailto:${EMAIL}`} className="inline-flex min-h-11 items-center gap-2 text-body font-semibold text-accent hover:text-link">
              <Mail aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
              {EMAIL}
            </a>
            <ArrowLink to="/where-we-operate" className="min-h-11 sm:ml-auto">
              Where we operate
            </ArrowLink>
          </div>
        </div>
      </section>

      {/* Work with us: the page's closing band (in place of the shared one, so the page ends on one ask). */}
      <section aria-labelledby="work-with-us" className="relative overflow-hidden bg-deep-grid hero-ground text-white">
        <TechLines at="80% 50%" />
        <Glow className="-right-32 top-1/2 h-[34rem] w-[34rem] -translate-y-1/2" />
        <div className="relative container-site py-section">
          <h2 id="work-with-us" data-sr="heading" className="text-h2 font-semibold">
            Work with us
          </h2>
          <p data-sr className="mt-heading max-w-measure text-body text-paper/80">
            Whether you are an EPC company, a distributor or a business planning to add storage, we&rsquo;d like to hear from you.
          </p>
          <div data-sr className="mt-8 flex flex-wrap items-center gap-4">
            <MagneticButton to="/contact" arrow spotlight>
              Talk to our team
            </MagneticButton>
            <MagneticButton to="/become-a-partner" variant="outline" sweep>
              Become a partner
            </MagneticButton>
            <MagneticButton to="/service-training#training" variant="outline" sweep>
              Join the Academy
            </MagneticButton>
          </div>
        </div>
      </section>
    </div>
  );
}
