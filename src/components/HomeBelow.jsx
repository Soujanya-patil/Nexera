import HomeSolutions from "./HomeSolutions";
import HomePartners from "./HomePartners";
import HomeWhyNow from "./HomeWhyNow";
import HomeContact from "./HomeContact";
import { ArrowLink } from "./solutions/Interactive";
import { FaqList, Section } from "./solutions/SolutionBlocks";
import { HOME_FAQ } from "../data/home";

/**
 * Home's sections below the first screens, as one chunk (they carry the catalogue data). The last is
 * the contact section (#contact); it replaced the closing band, HomeCta, which stays in the codebase,
 * unmounted (project convention).
 */
export default function HomeBelow() {
  return (
    <>
      <HomeSolutions />
      <HomePartners />
      <HomeWhyNow />
      {/* The partner programme and the FAQ (the FAQ is also the page's FAQPage data, word for word). */}
      <Section
        id="partner-programme"
        title="BESS Partner Programme for EPCs and Distributors"
        intro="Sell and install storage with Nexera behind you. We provide sizing and single-line diagrams for each project, commissioning support, installer training and certification, warranty-claim filing with TCL, and spares stock in India."
      >
        <div className="mt-8">
          <ArrowLink to="/become-a-partner" className="min-h-11">
            Become a BESS partner
          </ArrowLink>
        </div>
      </Section>
      <FaqList id="faq" title="Frequently Asked Questions" items={HOME_FAQ} />
      <HomeContact />
    </>
  );
}
