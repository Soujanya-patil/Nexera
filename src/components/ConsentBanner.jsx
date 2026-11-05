import { useEffect, useRef, useSyncExternalStore } from "react";
import { Link } from "react-router-dom";
import { consentChoice, consentOpen, setConsent, subscribeConsent } from "../lib/analytics";
import { useBottomClaim } from "../lib/floatingBottom";
import { useMediaQuery } from "../lib/scrollSteps";

/*
 * The cookie consent banner (lib/analytics). Shown until the visitor chooses, and again from the
 * footer's Cookie settings. A small fixed panel at the bottom — bottom-left from 768 px, full width on
 * phones, where it lifts the call-back pill above itself (lib/floatingBottom) — so it never moves the
 * page (no layout shift). Not a modal: the page stays usable and focus isn't trapped. "Accept" and
 * "Reject" are styled exactly alike. It's its own chunk, mounted after the page has loaded (Layout).
 *
 * The privacy link goes to /contact: the site has no privacy policy page yet.
 */
const snapshot = () => `${consentOpen()}|${consentChoice()}`;
const BUTTON =
  "inline-flex min-h-11 flex-1 items-center justify-center rounded-full border border-white/60 px-5 text-button font-semibold text-white transition-colors duration-fast hover:border-white hover:bg-white/10 focus-visible:border-white focus-visible:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export default function ConsentBanner() {
  const state = useSyncExternalStore(subscribeConsent, snapshot, () => "false|null");
  const [reopened, choice] = state.split("|");
  const visible = reopened === "true" || choice === "null";
  const ref = useRef(null);
  const phone = useMediaQuery("(max-width: 767px)");
  useBottomClaim("consent", ref, visible && phone);

  // Reopened from Cookie settings: take keyboard focus to the banner; after the choice, back to the button.
  const fromSettings = useRef(false);
  useEffect(() => {
    if (reopened === "true") {
      fromSettings.current = true;
      ref.current?.focus();
    }
  }, [reopened]);
  const choose = (c) => {
    setConsent(c);
    if (fromSettings.current) document.querySelector("[data-cookie-settings]")?.focus();
    fromSettings.current = false;
  };

  if (!visible) return null;
  return (
    <section
      ref={ref}
      tabIndex={-1}
      aria-labelledby="consent-title"
      className="fixed inset-x-3 bottom-3 z-50 rounded-card border border-white/10 bg-deep-grid p-5 text-white shadow-float outline-none animate-[spec-row_0.4s_ease-out_both] motion-reduce:animate-none md:inset-x-auto md:bottom-6 md:left-6 md:w-[26rem]"
    >
      <h2 id="consent-title" className="sr-only">
        Cookie consent
      </h2>
      <p className="text-small text-paper/90">
        We use cookies to understand how visitors use our site.{" "}
        <Link to="/contact" className="link-inline font-semibold text-white">
          Privacy questions? Contact us
        </Link>
      </p>
      <div className="mt-4 flex gap-3">
        <button type="button" onClick={() => choose("granted")} className={BUTTON}>
          Accept
        </button>
        <button type="button" onClick={() => choose("denied")} className={BUTTON}>
          Reject
        </button>
      </div>
    </section>
  );
}
