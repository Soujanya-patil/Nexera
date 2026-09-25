import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import Wordmark from "./Wordmark";

// "For EPCs" has no page of its own: it maps to the existing Become a Partner route (confirmed
// direction), so the nav matches the mockup without placeholders.
const links = [
  { label: "Home", href: "/", end: true },
  { label: "Solutions", href: "/solutions" },
  { label: "Products", href: "/products" },
  { label: "For EPCs", href: "/become-a-partner" },
  { label: "About", href: "/about" },
  { label: "Resources", href: "/resources" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const desktopLink = ({ isActive }) =>
    `relative py-1 text-sm transition-colors after:absolute after:-bottom-[0.9rem] after:left-0 after:h-0.5 after:bg-signal after:transition-all after:duration-300 ${
      isActive ? "text-signal after:w-full" : "text-ice/85 hover:text-white after:w-0 hover:after:w-full"
    }`;

  return (
    <header
      className={`sticky top-0 z-50 border-b bg-ink transition-[border-color,box-shadow] duration-300 ${
        scrolled ? "border-white/10 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.6)]" : "border-white/5"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-5">
          <Link to="/" className="text-white" aria-label="Nexera Powertech home">
            <Wordmark className="text-lg" />
          </Link>
          <p className="hidden border-l border-white/20 pl-5 text-[0.625rem] font-medium uppercase leading-snug tracking-[0.2em] text-ice/80 xl:block">
            Store today
            <br />
            Power tomorrow
          </p>
        </div>
        <ul className="hidden items-center gap-8 lg:flex">
          {links.map((link) => (
            <li key={link.label}>
              <NavLink to={link.href} end={link.end} className={desktopLink}>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <Link
          to="/contact"
          className="hidden items-center rounded-full bg-signal px-5 py-2 text-sm font-semibold text-forest transition-all duration-300 hover:bg-[#a4e39d] hover:shadow-[0_0_20px_2px_rgba(144,217,136,0.35)] lg:inline-flex"
        >
          Contact Us
        </Link>

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="inline-flex h-9 w-9 flex-col items-center justify-center gap-1.5 lg:hidden"
        >
          <span className={`block h-0.5 w-6 bg-white transition-transform ${open ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`block h-0.5 w-6 bg-white transition-opacity ${open ? "opacity-0" : ""}`} />
          <span className={`block h-0.5 w-6 bg-white transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>
      </nav>

      {/* Mobile menu panel */}
      {open && (
        <div className="border-t border-white/10 bg-ink px-6 py-4 lg:hidden">
          <ul className="flex flex-col gap-4">
            {links.map((link) => (
              <li key={link.label}>
                <NavLink
                  to={link.href}
                  end={link.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block text-base transition-colors ${isActive ? "text-signal" : "text-ice/85 hover:text-white"}`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <Link
            to="/contact"
            onClick={() => setOpen(false)}
            className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-signal px-4 py-3 text-sm font-semibold text-forest transition-colors hover:bg-[#a4e39d]"
          >
            Contact Us
          </Link>
        </div>
      )}
    </header>
  );
}
