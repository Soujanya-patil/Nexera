import { Link } from "react-router-dom";
import LegalPage, { LegalSection } from "../components/LegalPage";
import { EMAIL, PHONE, phoneHref } from "../data/business";

// The director's text, word for word (Step 6).
const SHOWN_PHONE = PHONE || "+91 97423 53341";

export default function TermsOfUse() {
  return (
    <LegalPage title="Terms of Use" crumb="Terms of Use">
      <p>
        These terms apply when you use nexerapower.com, the website of Nexera Powertech Private Limited (&ldquo;Nexera&rdquo;, &ldquo;we&rdquo;,
        &ldquo;us&rdquo;). By using the website, you agree to them.
      </p>

      <LegalSection title="About Nexera">
        <p>
          Nexera is an authorised distributor of battery energy storage systems from TCL and Hithium in India. We do not manufacture these
          products.
        </p>
      </LegalSection>

      <LegalSection title="Information on this website">
        <p>
          The information on this website, including product specifications, is for general guidance only. Specifications come from our
          partners and may change without notice. Please contact us to confirm details for your project before you make any decision.
        </p>
      </LegalSection>

      <LegalSection title="Quotes and orders">
        <p>
          Nothing on this website is an offer to sell. Prices, availability, warranty terms and delivery are confirmed only in a written
          quotation or agreement from Nexera.
        </p>
      </LegalSection>

      <LegalSection title="Datasheets and downloads">
        <p>Datasheets and documents are provided for your own evaluation. Please do not republish or sell them.</p>
      </LegalSection>

      <LegalSection title="Trademarks">
        <p>
          TCL, BlueArk, Hithium and ∞Power are trademarks of their respective owners and are used to identify their products. The Nexera name
          and logo belong to Nexera Powertech Private Limited.
        </p>
      </LegalSection>

      <LegalSection title="Links to other websites">
        <p>We may link to other websites, such as government sources. We are not responsible for their content.</p>
      </LegalSection>

      <LegalSection title="Liability">
        <p>
          We work to keep the website accurate and available, but we cannot guarantee that it is always error-free or uninterrupted. To the
          extent the law allows, we are not liable for any loss arising from use of the information on this website.
        </p>
      </LegalSection>

      <LegalSection title="Privacy">
        <p>
          Our{" "}
          <Link to="/privacy-policy" className="link-inline font-semibold text-accent">
            Privacy Policy
          </Link>{" "}
          explains how we handle your personal details.
        </p>
      </LegalSection>

      <LegalSection title="Governing law">
        <p>These terms are governed by the laws of India, and the courts of Bengaluru, Karnataka have jurisdiction.</p>
      </LegalSection>

      <LegalSection title="Contact us">
        <p>
          Email:{" "}
          <a href={`mailto:${EMAIL}`} className="link-inline font-semibold text-accent">
            {EMAIL}
          </a>{" "}
          · Phone:{" "}
          <a href={phoneHref(SHOWN_PHONE)} className="link-inline font-semibold text-accent">
            {SHOWN_PHONE}
          </a>
        </p>
      </LegalSection>
    </LegalPage>
  );
}
