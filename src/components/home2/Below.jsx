import BessFlow from "./BessFlow";
import Explorer from "./Explorer";
import Scale from "./Scale";
import Products from "./Products";
import Partners from "./Partners";
import FinalCta from "./FinalCta";

/** Home v2 below the hero: one chunk (it carries the catalogue data), pre-rendered, hydrated when it arrives. */
export default function Below() {
  return (
    <>
      <BessFlow />
      <Explorer />
      <Scale />
      <Products />
      <Partners />
      <FinalCta />
    </>
  );
}
