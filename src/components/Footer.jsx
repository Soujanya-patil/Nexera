import { Link } from "react-router-dom";
import Wordmark from "./Wordmark";

const links = [
  { label: "About", href: "/about" },
  { label: "Our Brands", href: "/brands" },
  { label: "Solutions", href: "/solutions" },
  { label: "Become a Partner", href: "/become-a-partner" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Service & Training", href: "/service-training" },
  { label: "Resources", href: "/resources" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-deep text-ice/70">
      <div className="mx-auto max-w-6xl px-6 py-14 grid md:grid-cols-2 gap-10">
        <div>
          <Wordmark className="text-lg text-white" />
          <p className="mt-3 text-sm">Bangalore, Karnataka</p>
          <p className="mt-1 text-sm">Regional offices: Kalaburagi, Nagpur (planned), Delhi (planned)</p>
        </div>
        <div>
          <p className="text-sm font-medium text-white/90">Quick links</p>
          <ul className="mt-3 grid grid-cols-2 gap-2 text-sm">
            {links.map((l) => (
              <li key={l.label}>
                <Link to={l.href} className="transition-colors hover:text-signal">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-6 py-5 text-xs text-ice/50">
          © {new Date().getFullYear()} Nexera Powertech Private Limited. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
