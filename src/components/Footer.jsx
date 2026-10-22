import { Link } from "react-router-dom";
import Wordmark from "./Wordmark";
import { ADDRESS, PHONE, phoneHref } from "../data/business";

const links = [
  { label: "About", href: "/about" },
  { label: "Products", href: "/products" },
  { label: "Solutions", href: "/solutions" },
  { label: "Become a Partner", href: "/become-a-partner" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Service & Training", href: "/service-training" },
  { label: "Resources", href: "/resources" },
  { label: "Contact", href: "/contact" },
];

// The Blog and its published articles (data/articles.js; drafts are never listed).
const guides = [
  { label: "Blog", href: "/blog" },
  { label: "What is a BESS?", href: "/blog/what-is-bess" },
];

// The technology partners' pages.
const partners = [
  { label: "Hithium", href: "/partners/hithium" },
  { label: "TCL", href: "/partners/tcl" },
  { label: "CLOU", href: "/partners/clou" },
  { label: "Midea", href: "/partners/midea" },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-deep text-ice/70">
      <div className="container-site py-14 grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto]">
        <div>
          <Wordmark className="text-lg text-white" />
          <address className="mt-3 text-small not-italic">{ADDRESS}</address>
          {PHONE && (
            <p className="mt-1 text-small">
              <a href={phoneHref(PHONE)} className="link inline-flex items-center transition-colors duration-fast hover:text-signal focus-visible:text-signal pointer-coarse:min-h-11 pointer-coarse:min-w-11">
                {PHONE}
              </a>
            </p>
          )}
          <p className="mt-1 text-small">Regional offices: Kalaburagi, Nagpur (planned), Delhi (planned)</p>
        </div>
        <div>
          <p className="text-small font-medium text-white/90">Quick links</p>
          <ul className="mt-3 grid grid-cols-2 gap-2 text-small pointer-coarse:gap-0">
            {links.map((l) => (
              <li key={l.label}>
                <Link to={l.href} className="link inline-flex items-center transition-colors duration-fast hover:text-signal focus-visible:text-signal pointer-coarse:min-h-11 pointer-coarse:min-w-11">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-small font-medium text-white/90">Resources</p>
          <ul className="mt-3 grid gap-2 text-small pointer-coarse:gap-0">
            {guides.map((l) => (
              <li key={l.label}>
                <Link to={l.href} className="link inline-flex items-center transition-colors duration-fast hover:text-signal focus-visible:text-signal pointer-coarse:min-h-11 pointer-coarse:min-w-11">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-small font-medium text-white/90">Partners</p>
          <ul className="mt-3 grid gap-2 text-small pointer-coarse:gap-0">
            {partners.map((l) => (
              <li key={l.label}>
                <Link to={l.href} className="link inline-flex items-center transition-colors duration-fast hover:text-signal focus-visible:text-signal pointer-coarse:min-h-11 pointer-coarse:min-w-11">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="container-site py-5 text-micro text-ice/50">
          © {new Date().getFullYear()} Nexera Powertech Private Limited. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
