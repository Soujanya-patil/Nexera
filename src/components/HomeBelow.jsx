import HomeSolutions from "./HomeSolutions";
import HomePartners from "./HomePartners";
import HomeWhyNow from "./HomeWhyNow";
import HomeCta from "./HomeCta";

/** Home's sections below the first screens, as one chunk (they carry the catalogue data). */
export default function HomeBelow() {
  return (
    <>
      <HomeSolutions />
      <HomePartners />
      <HomeWhyNow />
      <HomeCta />
    </>
  );
}
