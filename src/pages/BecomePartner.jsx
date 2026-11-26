import EpcHero from "../components/epc/EpcHero";
import WhyPartner from "../components/epc/WhyPartner";
import PartnerJourney from "../components/epc/PartnerJourney";
import SupportCapabilities from "../components/epc/SupportCapabilities";
import TechPartners from "../components/epc/TechPartners";
import ProjectStory from "../components/epc/ProjectStory";
import ApplicationsShowcase from "../components/epc/ApplicationsShowcase";
import NetworkMap from "../components/epc/NetworkMap";
import WhyEpcs from "../components/epc/WhyEpcs";
import EpcCta from "../components/epc/EpcCta";
import PartnerForm from "../components/epc/PartnerForm";
import WhyStorageNow from "../components/epc/WhyStorageNow";
import SellTable from "../components/epc/SellTable";
import DistributorSteps from "../components/epc/DistributorSteps";
import { FaqList } from "../components/solutions/SolutionBlocks";
import { BECOME_PARTNER_FAQ } from "../data/becomePartner";

/**
 * For EPCs (/become-a-partner) — answers one question: why should an EPC work with NEXERA? Its search
 * focus is "BESS distributor" (title, h1, the hero's first words, the steps and the FAQ).
 *
 * Hero → why partner → why storage, why now → partnership journey (the project lifecycle, pinned and
 * scroll-driven) → what NEXERA brings (horizontal capability showcase) → technology partners → products
 * you can sell (table) → project story → applications → network → why EPCs → five steps → FAQ (also the
 * page's FAQPage data, data/becomePartner.js) → partner CTA → partner enquiry form.
 *
 * Content rule: every statement restates something the site already establishes (sources listed in
 * components/epc/content.js). NEXERA is positioned as the authorised partner and solution provider;
 * the systems are designed and manufactured by TCL and Hithium.
 */
export default function BecomePartner() {
  return (
    <>
      <EpcHero />
      <WhyPartner />
      <WhyStorageNow />
      <PartnerJourney />
      <SupportCapabilities />
      <TechPartners />
      <SellTable />
      <ProjectStory />
      <ApplicationsShowcase />
      <NetworkMap />
      <WhyEpcs />
      <DistributorSteps />
      <FaqList id="faq" title="BESS Distributor FAQs" items={BECOME_PARTNER_FAQ} />
      <EpcCta />
      <PartnerForm />
    </>
  );
}
