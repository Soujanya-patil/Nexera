import HomeSolutions from "./HomeSolutions";
import HomePartners from "./HomePartners";
import HomeWhyNow from "./HomeWhyNow";
import HomeContact from "./HomeContact";

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
      <HomeContact />
    </>
  );
}
