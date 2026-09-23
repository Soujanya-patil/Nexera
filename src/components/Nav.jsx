import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Wordmark from "./Wordmark";

const links = [
  { label: "About Us", href: "/about" },
  { label: "Our Brands", href: "/brands" },
  { label: "Solutions", href: "/solutions" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Contact", href: "/contact" },
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

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-300 ${
        scrolled
          ? "bg-ink/90 border-white/15 backdrop-blur-md"
          : "bg-ink/70 border-white/10 backdrop-blur"
      }`}
    >
      <nav
        className={`mx-auto max-w-6xl px-6 flex items-center justify-between transition-[height] duration-300 ${
          scrolled ? "h-14" : "h-16"
        }`}
      >
        <Link to="/" className="text-white">
          <Wordmark className="text-lg" />
        </Link>
        <ul className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <li key={link.label}>
              <Link
                to={link.href}
                className="relative text-sm text-ice/90 transition-colors hover:text-white after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-signal after:transition-all after:duration-300 hover:after:w-full"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <Link
          to="/become-a-partner"
          className="hidden md:inline-flex items-center rounded-md bg-signal px-4 py-2 text-sm font-medium text-ink transition-all duration-300 hover:bg-signal/90 hover:shadow-[0_0_20px_2px_rgba(0,167,142,0.4)]"
        >
          Become a Distributor
        </Link>

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="md:hidden inline-flex flex-col justify-center gap-1.5 w-9 h-9 items-center"
        >
          <span className={`block h-0.5 w-6 bg-white transition-transform ${open ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`block h-0.5 w-6 bg-white transition-opacity ${open ? "opacity-0" : ""}`} />
          <span className={`block h-0.5 w-6 bg-white transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>
      </nav>

      {/* Mobile menu panel */}
      {open && (
        <div className="md:hidden border-t border-white/10 bg-ink px-6 py-4">
          <ul className="flex flex-col gap-4">
            {links.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.href}
                  onClick={() => setOpen(false)}
                  className="block text-base text-ice/85 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            to="/become-a-partner"
            onClick={() => setOpen(false)}
            className="mt-5 inline-flex w-full items-center justify-center rounded-md bg-signal px-4 py-3 text-sm font-medium text-ink hover:bg-signal/90 transition-colors"
          >
            Become a Distributor
          </Link>
        </div>
      )}
    </header>
  );
}
