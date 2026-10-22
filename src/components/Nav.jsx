import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import Wordmark from "./Wordmark";
import { useMagnetic } from "../lib/magnetic";

/** Desktop nav item with a very small magnetic pull (3 px; off for touch and reduced motion). */
function Magnetic({ max = 3, children }) {
  const ref = useMagnetic({ max, radius: 28 });
  return (
    <span ref={ref} className="inline-block">
      {children}
    </span>
  );
}

/**
 * Thin reading-progress line along the header's bottom edge. Written straight to the element's
 * transform (at most once per frame, only when the page scrolls), so it never re-renders React. It
 * reports position rather than animating, so it has no easing and needs no reduced-motion variant.
 */
function ScrollProgress() {
  const bar = useRef(null);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (bar.current) bar.current.style.transform = `scaleX(${p.toFixed(4)})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 -bottom-px h-[2px] overflow-hidden">
      <span ref={bar} className="block h-full origin-left bg-signal/80" style={{ transform: "scaleX(0)" }} />
    </span>
  );
}

// "For EPCs" has no page of its own: it maps to the existing Become a Partner route (confirmed
// direction), so the nav matches the mockup without placeholders.
const links = [
  { label: "Solutions", href: "/solutions" },
  { label: "Products", href: "/products" },
  { label: "For EPCs", href: "/become-a-partner" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
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

  // The phone menu closes with Escape (focus back on its button).
  const toggle = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      toggle.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // The underline draws by transform (scaleX), on hover and keyboard focus alike.
  const desktopLink = ({ isActive }) =>
    `relative py-1 text-small transition-colors duration-fast after:absolute after:-bottom-[0.9rem] after:left-0 after:h-0.5 after:w-full after:origin-left after:bg-signal after:transition-transform after:duration-base after:ease-emphasized ${
      isActive ? "text-signal after:scale-x-100" : "text-ice/85 after:scale-x-0 hover:text-white hover:after:scale-x-100 focus-visible:text-white focus-visible:after:scale-x-100"
    }`;

  return (
    // Scrolled: the bar slides up 8 px (it reads 56 px tall instead of 64 — its box keeps its height, so
    // nothing below moves), its ground turns translucent over a blur, and a hairline and shadow fade in.
    // Transform and opacity only.
    <header
      data-scrolled={scrolled || undefined}
      data-ground="dark"
      className={`sticky top-0 z-50 isolate transition-[translate] duration-base ease-emphasized ${scrolled ? "-translate-y-2" : ""}`}
    >
      <span aria-hidden="true" className={`absolute inset-0 -z-10 bg-ink transition-opacity duration-base ease-emphasized ${scrolled ? "opacity-90" : ""}`} />
      <span aria-hidden="true" className="absolute inset-0 -z-20 backdrop-blur-md" />
      <span
        aria-hidden="true"
        className={`absolute inset-0 -z-10 border-b border-white/10 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.6)] transition-opacity duration-base ease-emphasized ${scrolled ? "" : "opacity-0"}`}
      />
      <span aria-hidden="true" className={`absolute inset-x-0 bottom-0 -z-10 h-px bg-white/5 ${scrolled ? "opacity-0" : ""}`} />
      <nav className={`flex h-16 container-site items-center justify-between transition-[translate] duration-base ease-emphasized ${scrolled ? "translate-y-1" : ""}`}>
        <div className="flex items-center gap-5">
          {/* The logo is the way home on every page (there is no separate Home link). */}
          <Link to="/" aria-label="NEXERA Powertech home" className="inline-flex min-h-11 items-center text-white">
            <Wordmark className="text-lg" />
          </Link>
          <p className="hidden border-l border-white/20 pl-5 eyebrow text-ice/80 xl:block">
            Store today
            <br />
            Power tomorrow
          </p>
        </div>
        {/* data-nav-links / -cta / -toggle: without JavaScript (or the app stopped), phones show these
            links and the Contact button, and hide the menu button (index.css, "App fallback"). */}
        <ul data-nav-links className="hidden items-center gap-8 lg:flex">
          {links.map((link) => (
            <li key={link.label}>
              <Magnetic>
                <NavLink to={link.href} end={link.end} className={desktopLink}>
                  {link.label}
                </NavLink>
              </Magnetic>
            </li>
          ))}
        </ul>
        <span data-nav-cta className="hidden lg:inline-block">
          <Magnetic max={5}>
            <Link
              to="/contact"
              className="btn-motion inline-flex items-center rounded-full bg-signal px-5 py-2 text-button font-semibold text-forest hover:bg-[#a4e39d] focus-visible:bg-[#a4e39d] hover:shadow-[0_0_20px_2px_rgba(144,217,136,0.35)] focus-visible:shadow-[0_0_20px_2px_rgba(144,217,136,0.35)]"
            >
              Contact Us
            </Link>
          </Magnetic>
        </span>

        {/* Mobile menu toggle */}
        <button
          ref={toggle}
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          data-nav-toggle
          aria-label={open ? "Close menu" : "Open menu"}
          className="-mr-2 inline-flex h-11 w-11 flex-col items-center justify-center gap-1.5 lg:hidden"
        >
          <span className={`block h-0.5 w-6 bg-white transition-transform duration-base ease-emphasized ${open ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`block h-0.5 w-6 bg-white transition-opacity duration-fast ${open ? "opacity-0" : ""}`} />
          <span className={`block h-0.5 w-6 bg-white transition-transform duration-base ease-emphasized ${open ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>
      </nav>
      <ScrollProgress />

      {/* Mobile menu panel: opens over the content (rather than pushing it down) with a fade and a short
          slide, and closes the same way (.mobile-menu in index.css: display switches with the
          transition, so the closed panel is not rendered at all). */}
      <div
        id="mobile-menu"
        data-open={open || undefined}
        inert={!open}
        className="mobile-menu absolute inset-x-0 top-full border-t border-white/10 bg-ink px-6 pb-6 pt-2 shadow-[0_24px_40px_-24px_rgba(0,0,0,0.7)] lg:hidden"
      >
          <ul className="flex flex-col">
            {links.map((link) => (
              <li key={link.label}>
                <NavLink
                  to={link.href}
                  end={link.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex min-h-11 items-center text-body transition-colors duration-fast ${isActive ? "text-signal" : "text-ice/85 hover:text-white"}`
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
            className="btn-motion mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-signal px-4 py-3 text-button font-semibold text-forest hover:bg-[#a4e39d] focus-visible:bg-[#a4e39d]"
          >
            Contact Us
          </Link>
      </div>
    </header>
  );
}
