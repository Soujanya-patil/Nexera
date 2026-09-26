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

/**
 * For EPCs (/become-a-partner) — answers one question: why should an EPC work with NEXERA?
 *
 * Hero → why partner → partnership journey (the project lifecycle, pinned and scroll-driven) →
 * what NEXERA brings (horizontal capability showcase) → technology partners → project story →
 * applications → network → why EPCs → partner CTA → partner enquiry form.
 *
 * Content rule: every statement restates something the site already establishes (sources listed in
 * components/epc/content.js). NEXERA is positioned as the authorized partner and solution provider;
 * the systems are designed and manufactured by TCL, Hithium and CLOU.
 */
export default function BecomePartner() {
  return (
    <>
      <EpcHero />
      <WhyPartner />
      <PartnerJourney />
      <SupportCapabilities />
      <TechPartners />
      <ProjectStory />
      <ApplicationsShowcase />
      <NetworkMap />
      <WhyEpcs />
      <EpcCta />
      <PartnerForm />
    </>
  );
}
