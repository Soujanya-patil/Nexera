import { Link } from "react-router-dom";
import Logo from "./Logo";
import { ADDRESS, PHONE, phoneHref } from "../data/business";
import { SOLUTION_PAGES } from "../data/solutions";
import { openConsent } from "../lib/analytics";

// Every group lists existing routes only, each page once. Partner pages keep their order (Hithium,
// TCL); the Blog and its published articles come from data/articles.js (drafts are never listed).
const groups = [
  {
    title: "Solutions",
    links: [
      { label: "All solutions", href: "/solutions" },
      ...Object.values(SOLUTION_PAGES).map((s) => ({ label: s.label, href: s.path })),
    ],
  },
  {
    title: "Products",
    links: [
      { label: "All products", href: "/products" },
      { label: "Hithium", href: "/partners/hithium" },
      { label: "TCL", href: "/partners/tcl" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "How It Works", href: "/how-it-works" },
      { label: "Where We Operate", href: "/where-we-operate" },
      { label: "Bengaluru", href: "/locations/bengaluru" },
      { label: "Service & Training", href: "/service-training" },
      { label: "Become a Partner", href: "/become-a-partner" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Resources", href: "/resources" },
      { label: "Blog", href: "/blog" },
      { label: "What is a BESS?", href: "/blog/what-is-bess" },
    ],
  },
];

// Navy links on the light footer; hover and focus draw the underline (.link), the colour stays.
const linkClass = "link inline-flex items-center text-navy pointer-coarse:min-h-11 pointer-coarse:min-w-11";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-paper text-copy">
      {/* Brand and contact first (full width on phones and tablets), then four link groups: two
          columns on phones, four from 768 px, beside the brand column from 1024 px. */}
      <div className="container-site grid gap-x-10 gap-y-12 py-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,2fr)] lg:py-16">
        <div className="max-w-sm">
          <Logo className="h-10" />
          <address className="mt-5 text-small not-italic leading-relaxed">{ADDRESS}</address>
          {PHONE && (
            <p className="mt-3 text-small">
              <a href={phoneHref(PHONE)} className={`${linkClass} font-medium`}>
                {PHONE}
              </a>
            </p>
          )}
          <p className="mt-3 text-small">Head office: Bengaluru · Training centre: Kalaburagi, opening 2027</p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
          {groups.map((g) => (
            <div key={g.title}>
              <p className="eyebrow text-navy">{g.title}</p>
              <ul className="mt-4 grid gap-2.5 text-small pointer-coarse:gap-0">
                {g.links.map((l) => (
                  <li key={l.href}>
                    <Link to={l.href} className={linkClass}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div className="border-t border-line">
        {/* Phones: room at the end for the bottom action bar (MobileBar: 4rem + the home indicator). */}
        <div className="container-site flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-5 text-micro text-muted max-md:pb-[calc(1.25rem+4rem+env(safe-area-inset-bottom))]">
          <p>© {new Date().getFullYear()} Nexera Powertech Private Limited. All rights reserved.</p>
          {/* Reopens the cookie consent banner (lib/analytics). */}
          <button type="button" data-cookie-settings onClick={openConsent} className="link inline-flex items-center text-muted pointer-coarse:min-h-11">
            Cookie settings
          </button>
        </div>
      </div>
    </footer>
  );
}
