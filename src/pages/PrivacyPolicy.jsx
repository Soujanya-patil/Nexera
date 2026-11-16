import LegalPage, { LegalList, LegalSection } from "../components/LegalPage";
import { ADDRESS, EMAIL, PHONE, phoneHref } from "../data/business";

// The director's text, word for word (Step 6). The address is the head office (data/business).
const SHOWN_PHONE = PHONE || "+91 97423 53341";
const mail = <a href={`mailto:${EMAIL}`} className="link-inline font-semibold text-accent">{EMAIL}</a>;

export default function PrivacyPolicy() {
  return (
    <LegalPage title="Privacy Policy" crumb="Privacy Policy">
      <p>
        Nexera Powertech Private Limited (&ldquo;Nexera&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) runs the website nexerapower.com. This policy explains
        what information we collect through the website, how we use it and the choices you have.
      </p>

      <LegalSection title="Information we collect">
        <LegalList>
          <li>
            <strong className="font-semibold text-ink">Details you send us:</strong> depending on the form, your name, mobile number, email,
            company, city or location, area of interest, company type, project details, project size and message, when you use our enquiry,
            call-back, datasheet or partner forms.
          </li>
          <li>
            <strong className="font-semibold text-ink">Calls and messages:</strong> if you call us or message us on WhatsApp, we receive your
            phone number and what you tell us.
          </li>
          <li>
            <strong className="font-semibold text-ink">Website usage:</strong> if you accept analytics cookies, Google Analytics collects
            information such as the pages you visit, the device and browser you use, and your approximate location. If you decline,
            analytics cookies are not set.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection title="How we use your information">
        <LegalList>
          <li>To reply to your enquiry and follow up on your project.</li>
          <li>To send you the datasheet you asked for.</li>
          <li>To consider partner and distributor applications.</li>
          <li>To understand how visitors use the website and improve it (only with your consent to analytics cookies).</li>
        </LegalList>
        <p>We do not sell your personal data.</p>
      </LegalSection>

      <LegalSection title="Sharing your information">
        <p>
          We may share your details with our technology partners (TCL and Hithium) only where needed to answer your request, for example for a
          technical question or a warranty matter. We also use service providers that help us run the website, such as our hosting provider
          and Google Analytics. We may disclose information where the law requires it.
        </p>
      </LegalSection>

      <LegalSection title="Cookies">
        <p>
          We use analytics cookies only after you click &ldquo;Accept&rdquo; on the cookie banner. You can change your choice at any time with
          &lsquo;Cookie settings&rsquo; at the foot of every page.
        </p>
      </LegalSection>

      <LegalSection title="How long we keep it">
        <p>
          We keep enquiry details only for as long as we need them to respond to you and for our normal business records, unless the law
          requires us to keep them for longer.
        </p>
      </LegalSection>

      <LegalSection title="Your choices">
        <p>
          You can ask us to see, correct or delete the personal details you have sent us, or withdraw your consent to analytics, by writing to{" "}
          {mail}.
        </p>
      </LegalSection>

      <LegalSection title="Contact us">
        <address className="not-italic">
          Nexera Powertech Private Limited
          <br />
          {ADDRESS}
          <br />
          Email: {mail} · Phone:{" "}
          <a href={phoneHref(SHOWN_PHONE)} className="link-inline font-semibold text-accent">
            {SHOWN_PHONE}
          </a>
        </address>
        <p>We may update this policy from time to time. The date at the top shows when it last changed.</p>
      </LegalSection>
    </LegalPage>
  );
}
