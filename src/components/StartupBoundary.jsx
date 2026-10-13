import { Component } from "react";
import { CONTACT_EMAIL, CONTACT_PHONE, telHref } from "../lib/enquiry";

/** The head tags the pre-rendered page carries and <Seo> takes over (main.jsx). */
const HEAD_SELECTOR = 'title, meta[name="description"], link[rel="canonical"], meta[name="robots"]';
const selectorFor = (el) =>
  el.tagName === "TITLE" ? "title" : el.tagName === "LINK" ? `link[rel="${el.getAttribute("rel")}"]` : `meta[name="${el.getAttribute("name")}"]`;
export const captureHead = () => [...document.head.querySelectorAll(HEAD_SELECTOR)].map((el) => el.cloneNode(true));
/** Whether the app has stopped on an error (StartupBoundary marks <html data-app-error>). */
export const appFailed = () => document.documentElement.hasAttribute("data-app-error");

const link = (href, text) => Object.assign(document.createElement("a"), { href, textContent: text });
/**
 * The served page's forms send through the app, so without it they are switched off: never submitted
 * (a plain submit would post the page to itself and send nothing), every control disabled
 * (so nothing is typed in vain, and nothing would be sent anyway), and a note at the top of the form
 * says so — with the site's phone and email where it has them (lib/enquiry), else to reload and retry.
 */
function closeForms(page) {
  page.querySelectorAll("form").forEach((form, i) => {
    form.addEventListener("submit", (e) => e.preventDefault());
    for (const el of form.elements) el.disabled = true;
    const note = document.createElement("p");
    note.id = `app-fallback-note-${i + 1}`;
    note.className = "app-fallback-note";
    note.append("This form can’t be sent right now. ");
    if (CONTACT_PHONE || CONTACT_EMAIL) {
      note.append("Please ");
      if (CONTACT_PHONE) note.append("call ", link(telHref(CONTACT_PHONE), CONTACT_PHONE));
      if (CONTACT_PHONE && CONTACT_EMAIL) note.append(" or ");
      if (CONTACT_EMAIL) note.append("email ", link(`mailto:${CONTACT_EMAIL}`, CONTACT_EMAIL));
      note.append(", or reload the page and try again.");
    } else note.append("Please reload the page and try again.");
    form.prepend(note);
    form.setAttribute("aria-describedby", note.id);
  });
}

/**
 * Wraps the app in the browser (not the pre-renderer: it adds no markup, so hydration is unchanged).
 * React removes the whole page when an error escapes a render or an effect; without this, one such
 * error leaves an empty <div id="root"> — what a crawler that runs JavaScript then indexes.
 *
 * On such an error: on the page that was opened (`path`), its pre-rendered markup (`html`, captured
 * before hydration) is put back as plain HTML — content, headings and links as served, nothing held
 * hidden for a reveal (js-motion is dropped) — with its title, description and canonical (`head`).
 * What needs the app is not presented as working: forms are switched off with a note (closeForms),
 * and on phones the header shows its links instead of the menu button (index.css, "App fallback").
 * After a client-side navigation, the new URL is loaded afresh instead (its own pre-rendered page).
 *
 * Nothing is hidden: React reports the error to the console as usual, this logs that the fallback
 * is in use, and <html data-app-error> marks it. Errors in event handlers and async callbacks don't
 * reach here (React keeps the page for those).
 */
export default class StartupBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    const html = document.documentElement;
    html.setAttribute("data-app-error", "");
    html.classList.remove("js-motion");
    console.error("NEXERA: the app stopped on the error above; the page is shown as pre-rendered, without the app.", error);
    if (window.location.pathname !== this.props.path) {
      window.location.reload();
      return;
    }
    // <Seo>'s tags went with the app: the served ones come back (once now, once after this commit).
    const restore = () => {
      for (const el of this.props.head) if (!document.head.querySelector(selectorFor(el))) document.head.append(el.cloneNode(true));
    };
    restore();
    setTimeout(restore);
    // The restored page is in place by now (this runs after the fallback is committed).
    closeForms(document.getElementById("root"));
  }

  render() {
    if (!this.state.failed) return this.props.children;
    if (window.location.pathname !== this.props.path || !this.props.html) return null;
    return <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: this.props.html }} />;
  }
}
