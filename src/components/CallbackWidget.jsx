import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Phone, X } from "lucide-react";
import { loadGsap } from "../lib/motion";
import { getLenis, jumpTo } from "../lib/lenis";
import { scrollToId } from "../lib/scrollTo";
import { useBottomInset } from "../lib/floatingBottom";
import { INTERESTS, LIMITS, MIN_FILL_MS, afterPress, fieldError, prettyMobile, sendEnquiry } from "../lib/enquiry";
import { DUR, EASE } from "../lib/tokens";

const EMPTY = { name: "", mobile: "", interest: "", website: "" };
const FIELDS = ["name", "mobile", "interest"];
const SHORT = { interest: "Please choose one." };
const NUDGE_KEY = "nexera-callback-nudge"; // sessionStorage: the nudge has been shown this session
const NUDGE_AFTER_MS = 25000;
const AUTO_CLOSE_MS = 4000;
const NUDGE_PHONE_MS = 6000; // phones: the nudge hides by itself after this long
const DRAG_PX = 6; // a press that moves further than this is a drag, not a tap
const EDGE = 8; // a dragged pill stays this far inside the viewport (and below the site header)
const GAP = 12; // between a dragged pill and its card
const CARD_W = 360; // the card's width from sm up

/** The bottom of the site header (fixed / sticky at the top), the highest a dragged pill may go. */
const headerBottom = () => Math.max(0, document.querySelector("header")?.getBoundingClientRect().bottom ?? 64);
/** A pill position kept fully on screen: EDGE from every side, below the header. */
const clampPos = ({ x, y, w, h }) => ({
  x: Math.min(Math.max(EDGE, x), window.innerWidth - w - EDGE),
  y: Math.min(Math.max(headerBottom() + EDGE, y), window.innerHeight - h - EDGE),
  w,
  h,
});

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const phone = () => window.matchMedia("(max-width: 639.98px)").matches;
const nudgeSeen = () => {
  try {
    return sessionStorage.getItem(NUDGE_KEY) === "1";
  } catch {
    return false;
  }
};
const markNudgeSeen = () => {
  try {
    sessionStorage.setItem(NUDGE_KEY, "1");
  } catch {
    /* storage unavailable: the nudge may show again on the next page */
  }
};
// Phones (bottom sheet): the page doesn't scroll behind the open sheet.
const lockScroll = (on) => {
  const lenis = getLenis();
  if (lenis) on ? lenis.stop() : lenis.start();
  else document.documentElement.style.overflow = on ? "hidden" : "";
};

/**
 * Site-wide call-back widget (mounted in Layout, loaded once the page is idle; nothing of it is in the
 * pre-rendered HTML). A floating "Get a call back" pill at the bottom right:
 *   - appears once the visitor is into the page — on the homepage when the hero has scrolled out, on
 *     every other page after 300px — with one soft pulse ring the first time;
 *   - steps aside while the homepage contact section (#contact) or the /contact page's form is on
 *     screen, so it never doubles a form that is already there;
 *   - sits above a compare tray (Solutions, Products) while one is shown (lib/floatingBottom); the
 *     Solutions segment switcher is at the top of the screen, clear of it.
 * Opening it is always the visitor's choice: a small card springs up above the pill (a bottom sheet on
 * phones) with name, mobile and the interest as four chips. Focus moves into the card and is kept
 * there; Esc, ✕ or a click outside closes it and focus returns to the pill. It sends through the
 * shared helper (lib/enquiry → /api/contact.php) with source "quick" — the "Call-back request" email —
 * and the 3 s minimum fill time runs from when the card opens. Success: a check that draws itself and
 * "Thank you, {first name}. We'll call you on {mobile}.", then it closes by itself after 4 s. Failure
 * keeps every value.
 *
 * The pill can be dragged (mouse, touch, pen): a press that moves more than 6px drags it, and it stays
 * exactly where it is dropped, kept on screen (8px from the edges, below the header; again on resize).
 * The dropped place lasts only for that page — it is back in its default corner on every route change
 * (nothing is stored). Once dragged, its place wins over the lift above a compare tray, and the card
 * opens beside it, above or below, left or right, whichever fits (phones keep the bottom sheet). A tap
 * (or Enter / Space) opens the card as before; the release that ends a drag doesn't.
 *
 * One nudge per browser session: after 25 s on a page or half-way down it, a small bubble beside the
 * pill ("Need help choosing a battery? We'll call you.") until it is dismissed (✕) or the card opens
 * (tapping it opens the card); on phones (< 768px) it also hides by itself after 6 s. Never on /contact.
 *
 * Motion: GSAP springs the card open and eases it closed; reduced motion: no pulse, no spring.
 */
export default function CallbackWidget() {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const inset = useBottomInset();
  const pill = useRef(null);
  const dock = useRef(null);
  const card = useRef(null);
  const drag = useRef(null); // the press in progress: where it started, and whether it became a drag
  const swallowClick = useRef(false); // the click that follows a drag's release
  const scrim = useRef(null);
  const thanks = useRef(null);
  const started = useRef(0);
  const closing = useRef(false);
  const isOpen = useRef(false);

  const [past, setPast] = useState(false); // scrolled past the start point
  const [blocked, setBlocked] = useState(false); // a contact form is on screen
  const [open, setOpen] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [wantNudge, setWantNudge] = useState(false);
  const [nudge, setNudge] = useState(false);
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [tried, setTried] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | sending | done | error
  const [sent, setSent] = useState({ firstName: "", mobile: "" });
  const [pos, setPos] = useState(null); // where the pill was dropped ({ x, y, w, h }), or null: its corner
  const [dragging, setDragging] = useState(false);

  const shown = open || (past && !blocked);
  isOpen.current = open;

  // Start point: the homepage hero leaving the screen, or 300px of scroll elsewhere.
  useEffect(() => {
    setPast(false);
    if (pathname === "/") {
      let io;
      let raf;
      const t0 = performance.now();
      const find = () => {
        const hero = document.querySelector("[data-home-hero]");
        if (!hero) {
          if (performance.now() - t0 < 5000) raf = requestAnimationFrame(find);
          return;
        }
        io = new IntersectionObserver(([e]) => setPast(!e.isIntersecting && e.boundingClientRect.top < 0), { rootMargin: "-64px 0px 0px 0px" });
        io.observe(hero);
      };
      find();
      return () => {
        cancelAnimationFrame(raf);
        io?.disconnect();
      };
    }
    const onScroll = () => setPast(window.scrollY > 300);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  // Contact forms on screen: #contact (homepage) and the /contact page's form. They can arrive later
  // (the homepage's lower half is its own chunk), so they are looked for again as the page scrolls.
  useEffect(() => {
    const inView = new Set();
    const watched = new Set();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) e.isIntersecting ? inView.add(e.target) : inView.delete(e.target);
      setBlocked(inView.size > 0);
    });
    const look = () => {
      for (const el of [document.getElementById("contact"), pathname === "/contact" ? document.querySelector("#main form") : null]) {
        if (el && !watched.has(el)) {
          watched.add(el);
          io.observe(el);
        }
      }
    };
    look();
    window.addEventListener("scroll", look, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", look);
      setBlocked(false);
    };
  }, [pathname]);

  // One pulse ring, the first time the pill appears.
  const pulsed = useRef(false);
  useEffect(() => {
    if (!shown || pulsed.current) return;
    pulsed.current = true;
    if (!reduced()) setPulse(true);
  }, [shown]);

  // The nudge: once per session, after 25 s on the page or half-way down it; never on /contact.
  useEffect(() => {
    setWantNudge(false);
    setNudge(false);
    if (pathname === "/contact" || nudgeSeen()) return;
    let done = false;
    const fire = () => {
      if (done) return;
      done = true;
      setWantNudge(true);
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max > 0 && window.scrollY / max >= 0.5) fire();
    };
    const timer = setTimeout(fire, NUDGE_AFTER_MS);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname]);
  // It shows beside the pill, so only while the pill is there (and the card closed).
  useEffect(() => {
    if (wantNudge && shown && !open && !nudgeSeen()) {
      markNudgeSeen();
      setNudge(true);
    }
  }, [wantNudge, shown, open]);
  // Phones (< 768px): it hides by itself after 6 s, so it never sits over the page for long.
  useEffect(() => {
    if (!nudge || !window.matchMedia("(max-width: 767.98px)").matches) return;
    const t = setTimeout(() => setNudge(false), NUDGE_PHONE_MS);
    return () => clearTimeout(t);
  }, [nudge]);

  const reset = () => {
    setValues(EMPTY);
    setErrors({});
    setTried(false);
    setStatus("idle");
    started.current = 0;
  };

  const close = useCallback(({ returnFocus = true, instant = false } = {}) => {
    if (closing.current || !isOpen.current) return;
    closing.current = true;
    const el = card.current;
    const finish = () => {
      closing.current = false;
      setOpen(false);
      if (phone()) lockScroll(false);
      if (returnFocus) pill.current?.focus({ preventScroll: true });
    };
    if (!el || instant || reduced()) return finish();
    loadGsap()
      .then(({ gsap }) => {
        if (scrim.current) gsap.to(scrim.current, { opacity: 0, duration: DUR.fast });
        gsap.to(el, phone() ? { yPercent: 100, duration: DUR.base, ease: EASE.in, onComplete: finish } : { opacity: 0, y: 10, scale: 0.95, duration: DUR.fast, ease: EASE.in, onComplete: finish });
      })
      .catch(finish);
  }, []);

  const toggle = () => {
    if (open) return close();
    setNudge(false);
    setOpen(true);
  };

  // Open: focus into the card, then spring it in.
  useLayoutEffect(() => {
    if (!open) return;
    const el = card.current;
    started.current ||= Date.now();
    if (phone()) lockScroll(true);
    el.querySelector('[name="name"]')?.focus({ preventScroll: true });
    if (reduced()) {
      el.style.opacity = "";
      return;
    }
    loadGsap()
      .then(({ gsap }) => {
        if (scrim.current) gsap.fromTo(scrim.current, { opacity: 0 }, { opacity: 1, duration: DUR.base });
        if (phone()) gsap.fromTo(el, { yPercent: 100, opacity: 1 }, { yPercent: 0, duration: DUR.base, ease: EASE.emphasized });
        else gsap.fromTo(el, { opacity: 0, y: 16, scale: 0.92 }, { opacity: 1, y: 0, scale: 1, duration: DUR.base, ease: EASE.emphasized });
      })
      .catch(() => (el.style.opacity = ""));
  }, [open]);

  // While open: Esc closes, a click outside closes, Tab stays inside the card.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      } else if (e.key === "Tab") {
        // The ✕ comes first and the full-form link (or the ✕ alone, after sending) last.
        const items = [...card.current.querySelectorAll("a[href], button:not([disabled]), input:not([tabindex='-1'])")].filter((n) => !n.closest("[aria-hidden='true']"));
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    const onDown = (e) => {
      if (!card.current?.contains(e.target) && !pill.current?.contains(e.target)) close({ returnFocus: false });
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open, close]);

  // A dragged place lasts only for its page: every route change puts the pill back in its corner.
  useEffect(() => {
    setPos(null);
    setDragging(false);
    drag.current = null;
  }, [pathname]);
  // Resize / rotation: a dragged pill is kept on screen.
  useEffect(() => {
    if (!pos) return;
    const fit = () => setPos((p) => (p ? clampPos(p) : p));
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
    // (Re-subscribed only when the pill is dragged or put back, not on every move.)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!pos]);

  // Dragging the pill (pointer events: mouse, touch, pen). The pill has touch-action: none, so a drag
  // on it never scrolls the page; everywhere else scrolls as usual.
  const onPointerDown = (e) => {
    if (e.button !== 0 || !dock.current) return;
    const r = dock.current.getBoundingClientRect();
    drag.current = { id: e.pointerId, sx: e.clientX, sy: e.clientY, x: r.left, y: r.top, w: r.width, h: r.height, moved: false };
    // Every move of this press comes to the pill, even one that has already left it (a quick flick);
    // the release still lands here, so a tap is still a click.
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.id) return;
    const dx = e.clientX - d.sx;
    const dy = e.clientY - d.sy;
    if (!d.moved) {
      if (Math.hypot(dx, dy) <= DRAG_PX) return;
      d.moved = true;
      setDragging(true);
    }
    setPos(clampPos({ x: d.x + dx, y: d.y + dy, w: d.w, h: d.h }));
  };
  const onPointerEnd = (e) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.id) return;
    drag.current = null;
    if (!d.moved) return;
    setDragging(false);
    // The click that follows this release (dispatched in the same task) doesn't open the card.
    swallowClick.current = true;
    setTimeout(() => (swallowClick.current = false));
  };
  const onPillClick = () => {
    if (swallowClick.current) {
      swallowClick.current = false;
      return;
    }
    toggle();
  };

  // A dragged pill's card (from sm up): beside it, on the side with more room (above or below), lined
  // up with its right edge when that fits, else its left; always fully on screen.
  const cardPlace = () => {
    if (!pos || phone()) return null;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const above = pos.y - GAP - (headerBottom() + EDGE);
    const below = vh - (pos.y + pos.h) - GAP - EDGE;
    const up = above >= below;
    const left = pos.x + pos.w - CARD_W >= EDGE ? pos.x + pos.w - CARD_W : Math.min(Math.max(EDGE, pos.x), vw - CARD_W - EDGE);
    return {
      left,
      right: "auto",
      ...(up ? { bottom: vh - pos.y + GAP, top: "auto", maxHeight: above } : { top: pos.y + pos.h + GAP, bottom: "auto", maxHeight: below }),
      transformOrigin: `${left + CARD_W / 2 < pos.x + pos.w / 2 ? "right" : "left"} ${up ? "bottom" : "top"}`,
    };
  };
  // A pill dragged into the left half has its nudge on its right.
  const nudgeRight = pos && pos.x + pos.w / 2 < window.innerWidth / 2;

  // Leaving the page closes the card at once.
  useEffect(() => () => close({ returnFocus: false, instant: true }), [pathname, close]);
  useEffect(() => () => lockScroll(false), []);

  // Success: focus the thank-you line, then close by itself after 4 s (and start fresh next time).
  useEffect(() => {
    if (status !== "done") return;
    thanks.current?.focus();
    const t = setTimeout(() => close({ returnFocus: card.current?.contains(document.activeElement) }), AUTO_CLOSE_MS);
    return () => clearTimeout(t);
  }, [status, close]);
  useEffect(() => {
    if (!open && status === "done") reset();
  }, [open, status]);

  const check = (k, v) => {
    const e = fieldError(k, v);
    return e ? SHORT[k] || e : "";
  };
  const set = (k) => (e) => {
    const v = e.target.value;
    setValues((s) => ({ ...s, [k]: v }));
    if ((tried || errors[k]) && k !== "website") setErrors((er) => ({ ...er, [k]: check(k, v) || undefined }));
  };
  // A field is checked as the visitor leaves it (an empty one only once they've tried to send).
  const blur = (k) => () => {
    if (!values[k] && !tried) return;
    const e = check(k, values[k]);
    afterPress(() => setErrors((er) => ({ ...er, [k]: e || undefined })));
  };

  const submit = async (e) => {
    e.preventDefault();
    setTried(true);
    const er = {};
    for (const k of FIELDS) {
      const m = check(k, values[k]);
      if (m) er[k] = m;
    }
    setErrors(er);
    const firstBad = FIELDS.find((k) => er[k]);
    if (firstBad) {
      const target = firstBad === "interest" ? card.current.querySelector('input[name="interest"]') : card.current.querySelector(`#${uid}-${firstBad}`);
      target?.focus();
      return;
    }
    setStatus("sending");
    const wait = MIN_FILL_MS - (Date.now() - started.current);
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    const res = await sendEnquiry({ ...values, startedAt: started.current, source: "quick" });
    if (res.ok) {
      setSent({ firstName: values.name.trim().split(/\s+/)[0], mobile: prettyMobile(values.mobile) });
      setStatus("done");
    } else if (res.fields) {
      // The API's own field errors (should it ever disagree with the page) go under their fields.
      setErrors(res.fields);
      setStatus("idle");
      const bad = FIELDS.find((k) => res.fields[k]);
      if (bad) card.current.querySelector(bad === "interest" ? 'input[name="interest"]' : `#${uid}-${bad}`)?.focus();
      else setStatus("error");
    } else setStatus("error");
  };

  // "Prefer the full form?": the homepage's contact section — glide there on the homepage; from any
  // other page, open the homepage and land on it once it has rendered (its lower half is a chunk).
  const toFullForm = (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (pathname === "/") {
      close({ returnFocus: false, instant: true });
      scrollToId("contact")(e);
      return;
    }
    e.preventDefault();
    close({ returnFocus: false, instant: true });
    navigate("/#contact");
    const t0 = performance.now();
    // The page above it can still be settling as it renders (its sections hydrate, images decode), so
    // the landing is checked again a few times and corrected if it drifted.
    const jump = (el) => Math.abs(el.getBoundingClientRect().top - 64) > 2 && jumpTo(el.getBoundingClientRect().top + window.scrollY - 64);
    const land = () => {
      const el = document.getElementById("contact");
      if (!el) return performance.now() - t0 < 5000 && requestAnimationFrame(land);
      jump(el);
      [150, 450, 900, 1600].forEach((ms) => setTimeout(() => el.isConnected && jump(el), ms));
      if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
      el.focus({ preventScroll: true });
    };
    requestAnimationFrame(land);
  };

  const label = "block text-sm font-medium text-ice/90";
  const input =
    "mt-1.5 block h-11 w-full rounded-xl border border-white/15 bg-white/[0.05] px-4 text-base text-white placeholder:text-ice/40 transition-colors hover:border-white/30 focus-visible:border-transparent focus-visible:outline-2 focus-visible:outline-signal aria-[invalid=true]:border-[#ffb0a3]";
  const err = (k) => (
    <p id={`${uid}-${k}-err`} aria-live="polite" className="mt-1 text-xs leading-4 text-[#ffb0a3]">
      {errors[k] || ""}
    </p>
  );
  const done = status === "done";
  const lift = { "--cb-lift": `${inset}px` };

  return (
    <>
      {/* The pill (and the nudge beside it). Lifted above a compare tray while one is shown. */}
      <div
        ref={dock}
        className={`cb-dock fixed bottom-4 right-4 z-[45] transition-[opacity,translate] duration-300 ease-out motion-reduce:transition-none sm:bottom-6 sm:right-6 ${
          shown ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        style={
          pos
            ? // Dropped: exactly there (the lift above a compare tray no longer applies on this page).
              { left: pos.x, top: pos.y, right: "auto", bottom: "auto", translate: `0 ${shown ? "0px" : "12px"}` }
            : { ...lift, translate: `0 calc(${shown ? "0px" : "12px"} - var(--cb-lift))` }
        }
        aria-hidden={!shown || undefined}
        inert={!shown}
      >
        {nudge && !open && !dragging && (
          <div
            role="status"
            data-side={nudgeRight ? "right" : undefined}
            className={`cb-nudge absolute bottom-full mb-3 w-max max-w-[15rem] sm:bottom-1/2 sm:mb-0 sm:translate-y-1/2 ${
              nudgeRight ? "left-0 sm:left-full sm:ml-3" : "right-0 sm:right-full sm:mr-3"
            }`}
          >
            <div className="relative flex items-start gap-1 rounded-2xl border border-white/10 bg-ink py-2.5 pl-4 pr-1.5 text-sm leading-snug text-white shadow-[0_16px_40px_-16px_rgba(0,0,0,0.6)]">
              <button type="button" onClick={toggle} className="text-left focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal">
                Need help choosing a battery? We&rsquo;ll call you.
              </button>
              <button
                type="button"
                onClick={() => setNudge(false)}
                aria-label="Dismiss"
                className="-my-1 grid h-8 w-8 shrink-0 place-items-center rounded-full text-ice/70 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-signal"
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </button>
              <span aria-hidden="true" className="cb-nudge-tail" />
            </div>
          </div>
        )}
        <button
          ref={pill}
          type="button"
          onClick={onPillClick}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
          style={dragging ? { scale: "1.05", boxShadow: "0 24px 44px -14px rgba(7,26,23,0.65)", cursor: "grabbing" } : undefined}
          aria-expanded={open}
          aria-controls={`${uid}-card`}
          aria-haspopup="dialog"
          className="group/cb relative inline-flex h-12 touch-none select-none items-center gap-2 rounded-full bg-signal pl-4 pr-5 text-sm font-semibold text-forest sm:cursor-grab shadow-[0_12px_30px_-10px_rgba(7,26,23,0.55)] transition-[background-color,box-shadow,scale] duration-300 hover:scale-[1.03] hover:bg-[#a4e39d] hover:shadow-[0_0_24px_2px_rgba(144,217,136,0.35)] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal motion-reduce:transition-none sm:h-[52px]"
        >
          {pulse && <span aria-hidden="true" className="cb-ring pointer-events-none absolute inset-0 rounded-full border-2 border-signal" onAnimationEnd={() => setPulse(false)} />}
          {open ? <X aria-hidden="true" className="h-4 w-4" strokeWidth={2.2} /> : <Phone aria-hidden="true" className="h-4 w-4" strokeWidth={2.2} />}
          Get a call back
        </button>
      </div>

      {open && (
        <>
          {/* Phones: a scrim behind the bottom sheet (a tap closes it). */}
          <div ref={scrim} aria-hidden="true" className="fixed inset-0 z-[59] bg-deep/55 sm:hidden" />
          <div
            ref={card}
            id={`${uid}-card`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${uid}-title`}
            data-lenis-prevent
            style={{ ...lift, opacity: 0, ...cardPlace() }}
            className="fixed inset-x-0 bottom-0 z-[60] max-h-[88svh] overflow-y-auto overscroll-contain rounded-t-3xl border border-white/10 bg-night p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-white shadow-[0_-20px_60px_-20px_rgba(0,0,0,0.6)] sm:inset-x-auto sm:bottom-[calc(1.5rem+52px+0.75rem+var(--cb-lift))] sm:right-6 sm:max-h-[calc(100svh-4rem-1.5rem-52px-0.75rem-var(--cb-lift)-1rem)] sm:w-[360px] sm:origin-bottom-right sm:rounded-3xl sm:pb-5 sm:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.7)]"
          >
            <span aria-hidden="true" className="mx-auto -mt-1 mb-3 block h-1 w-10 rounded-full bg-white/20 sm:hidden" />
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id={`${uid}-title`} className="text-lg font-semibold leading-tight">
                  Get a call back
                </h2>
                <p className="mt-1 text-sm text-ice/75">Tell us what you need, we&rsquo;ll call you.</p>
              </div>
              <button
                type="button"
                onClick={() => close()}
                aria-label="Close"
                className="-mr-1.5 -mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-full text-ice/75 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-signal"
              >
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>

            {done ? (
              <div role="status" className="py-8 text-center">
                <svg aria-hidden="true" viewBox="0 0 64 64" className="contact-check mx-auto h-14 w-14" fill="none" stroke="#90D988" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="32" cy="32" r="28" pathLength="1" />
                  <path d="M20 33l8 8 16-17" pathLength="1" />
                </svg>
                <p ref={thanks} tabIndex={-1} className="mx-auto mt-4 max-w-[17rem] text-base font-semibold leading-snug outline-none">
                  Thank you, {sent.firstName}. We&rsquo;ll call you on <span className="whitespace-nowrap">{sent.mobile}</span>.
                </p>
              </div>
            ) : (
              <form method="post" onSubmit={submit} noValidate className="relative mt-4 space-y-3.5">
                <noscript><p className="app-fallback-note">This form needs JavaScript. Please enable it and reload the page.</p></noscript>
                <div>
                  <label htmlFor={`${uid}-name`} className={label}>
                    Name<span className="text-signal"> *</span>
                  </label>
                  <input
                    id={`${uid}-name`}
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    maxLength={LIMITS.name}
                    value={values.name}
                    onChange={set("name")}
                    onBlur={blur("name")}
                    aria-invalid={!!errors.name || undefined}
                    aria-describedby={`${uid}-name-err`}
                    className={input}
                  />
                  {err("name")}
                </div>
                <div>
                  <label htmlFor={`${uid}-mobile`} className={label}>
                    Mobile number<span className="text-signal"> *</span>
                  </label>
                  <input
                    id={`${uid}-mobile`}
                    name="mobile"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    required
                    maxLength={LIMITS.mobile}
                    value={values.mobile}
                    onChange={set("mobile")}
                    onBlur={blur("mobile")}
                    aria-invalid={!!errors.mobile || undefined}
                    aria-describedby={`${uid}-mobile-err`}
                    className={input}
                  />
                  {err("mobile")}
                </div>
                <fieldset>
                  <legend id={`${uid}-interest-legend`} className={label}>
                    I&rsquo;m interested in<span className="text-signal"> *</span>
                  </legend>
                  <div
                    role="radiogroup"
                    aria-labelledby={`${uid}-interest-legend`}
                    aria-required="true"
                    aria-invalid={!!errors.interest || undefined}
                    aria-describedby={`${uid}-interest-err`}
                    className="cb-chips mt-2 grid gap-2"
                  >
                    {INTERESTS.map((it) => (
                      <label key={it.id} className="contact-chip">
                        <input type="radio" name="interest" value={it.id} checked={values.interest === it.id} onChange={set("interest")} className="sr-only" />
                        <span>{it.label}</span>
                      </label>
                    ))}
                  </div>
                  {err("interest")}
                </fieldset>

                {/* Honeypot: hidden from people; bots fill it. */}
                <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                  <label>
                    Website
                    <input type="text" name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={set("website")} />
                  </label>
                </div>

                {status === "error" && (
                  <p role="alert" className="rounded-xl border border-[#ffb0a3]/40 bg-[#ffb0a3]/10 px-3.5 py-2.5 text-sm text-white">
                    Couldn&rsquo;t send. Please try again.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="group/send inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-signal px-6 text-sm font-semibold text-forest transition-[background-color,box-shadow,scale] duration-300 hover:bg-[#a4e39d] hover:shadow-[0_0_24px_2px_rgba(144,217,136,0.35)] active:scale-[0.98] disabled:cursor-wait disabled:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal motion-reduce:transition-none"
                >
                  {status === "sending" ? (
                    <>
                      <span aria-hidden="true" className="contact-spin h-4 w-4 rounded-full border-2 border-forest/30 border-t-forest" />
                      Sending…
                    </>
                  ) : (
                    <>
                      Get a call back
                      <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform duration-300 ease-out group-hover/send:translate-x-1" strokeWidth={2} />
                    </>
                  )}
                </button>
                <p className="text-center text-sm">
                  <a
                    href="/#contact"
                    onClick={toFullForm}
                    className="font-semibold text-signal underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
                  >
                    Prefer the full form? ↓
                  </a>
                </p>
              </form>
            )}
          </div>
        </>
      )}
    </>
  );
}
