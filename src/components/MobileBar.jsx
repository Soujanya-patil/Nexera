import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { MessageCircle, Phone, Send } from "lucide-react";
import { PHONE, phoneHref } from "../data/business";
import { useBottomInset } from "../lib/floatingBottom";

/*
 * Phones only (< 768 px): a fixed bottom action bar, like an app's — Call, WhatsApp and Enquire, three
 * equal buttons with an icon and a label (≥ 48 px tall), white with a thin top border, padded for the
 * iPhone home indicator. It replaces the floating "Get a call back" pill there (CallbackWidget renders
 * nothing below 768 px); tablets and desktops keep the pill and never see the bar.
 *
 * It is part of the pre-rendered page (fixed, so it never moves anything: no layout shift); the footer
 * carries matching bottom padding on phones, so the end of the page is never under it. It steps out of
 * the way (slides down; at once under reduced motion):
 *   - while the on-screen keyboard is open (a text field has focus, or the visual viewport shrinks);
 *   - while it would cover a form's submit button;
 *   - while a compare tray holds the bottom of the screen (lib/floatingBottom).
 * The cookie banner sits above it on phones (ConsentBanner).
 *
 * Enquire opens the site's contact page — with the product (?product=) on a product page and the
 * segment (?intent=) on a Solutions page, as the pages' own enquiry buttons do; on /contact itself it
 * takes the visitor to the form. GA4 (only with consent, lib/analytics): click_call and
 * click_whatsapp with link_placement "mobile_bar", and click_enquire.
 */
const digits = PHONE.replace(/\D/g, "");
const WHATSAPP = digits ? `https://wa.me/${digits}?text=Hi%20NEXERA%2C%20I%27m%20interested%20in%20battery%20storage` : null;
const SEGMENT = { "/solutions/residential": "residential", "/solutions/commercial-industrial": "ci", "/solutions/utility-scale": "utility" };

function enquireHref(pathname) {
  const product = pathname.match(/^\/products\/([^/]+)$/)?.[1];
  if (product) return `/contact?product=${product}`;
  if (SEGMENT[pathname]) return `/contact?intent=${SEGMENT[pathname]}`;
  return "/contact";
}

const TEXT_FIELD = 'input:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]):not([type="range"]), textarea, select, [contenteditable="true"]';

/** Whether the bar should step aside right now (keyboard open, or a submit button where the bar is). */
function useStepAside() {
  const [aside, setAside] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => {
    const phone = window.matchMedia("(max-width: 767px)");
    let raf = 0;
    const measure = () => {
      raf = 0;
      if (!phone.matches) return setAside(false);
      const a = document.activeElement;
      const typing = !!a && a.matches?.(TEXT_FIELD);
      const vv = window.visualViewport;
      const keyboard = typing || (vv && vv.height < window.innerHeight * 0.75);
      const barTop = window.innerHeight - 72; // the bar's height plus a little room
      const covers = [...document.querySelectorAll('form button[type="submit"], form input[type="submit"]')].some((el) => {
        if (!el.offsetParent) return false;
        const r = el.getBoundingClientRect();
        return r.bottom > barTop && r.top < window.innerHeight;
      });
      setAside(keyboard || covers);
    };
    const later = () => (raf ||= requestAnimationFrame(measure));
    const blurred = () => setTimeout(later, 50); // focus may just be moving to the next field
    measure();
    // A newly opened page may still be mounting its form: measure again once it has settled.
    const t = setTimeout(later, 600);
    window.addEventListener("scroll", later, { passive: true });
    window.addEventListener("resize", later);
    window.visualViewport?.addEventListener("resize", later);
    document.addEventListener("focusin", later);
    document.addEventListener("focusout", blurred);
    phone.addEventListener("change", later);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
      window.removeEventListener("scroll", later);
      window.removeEventListener("resize", later);
      window.visualViewport?.removeEventListener("resize", later);
      document.removeEventListener("focusin", later);
      document.removeEventListener("focusout", blurred);
      phone.removeEventListener("change", later);
    };
  }, [pathname]);
  return aside;
}

const ITEM = "flex min-h-12 flex-1 flex-col items-center justify-center gap-0.5 rounded-control text-micro font-semibold focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-link";

export default function MobileBar() {
  const { pathname } = useLocation();
  const aside = useStepAside();
  const tray = useBottomInset() > 0;
  const hidden = aside || tray;
  const enquire = enquireHref(pathname);
  // On /contact the form is already the page: Enquire takes the visitor to its first field.
  const toForm = (e) => {
    if (pathname !== "/contact") return;
    const field = document.querySelector("#main form input:not([type='hidden']):not([tabindex='-1'])");
    if (!field) return;
    e.preventDefault();
    field.scrollIntoView({ block: "center" });
    field.focus({ preventScroll: true });
  };
  return (
    <nav
      aria-label="Quick contact"
      data-mobile-bar
      inert={hidden || undefined}
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] transition-transform duration-base ease-standard motion-reduce:transition-none md:hidden ${
        hidden ? "translate-y-full" : "translate-y-0"
      }`}
    >
      <ul className="flex gap-2 px-3 py-2">
        {PHONE && (
          <li className="flex flex-1">
            <a href={phoneHref(PHONE)} className={`${ITEM} text-ink`}>
              <Phone aria-hidden="true" className="h-5 w-5" strokeWidth={1.9} />
              Call
            </a>
          </li>
        )}
        {WHATSAPP && (
          <li className="flex flex-1">
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className={`${ITEM} text-ink`}>
              <MessageCircle aria-hidden="true" className="h-5 w-5" strokeWidth={1.9} />
              WhatsApp<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
        )}
        <li className="flex flex-1">
          <Link to={enquire} onClick={toForm} data-track="click_enquire" className={`${ITEM} bg-signal text-ink`}>
            <Send aria-hidden="true" className="h-5 w-5" strokeWidth={1.9} />
            Enquire
          </Link>
        </li>
      </ul>
    </nav>
  );
}
