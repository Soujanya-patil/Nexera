import PillLink from "../PillLink";
import { useMagnetic } from "../../lib/magnetic";

/**
 * A PillLink with a subtle magnetic pull toward the cursor (the Unlumen UI magnetic-button
 * interaction, driven by the project's existing GSAP `useMagnetic` hook rather than a second
 * animation runtime). Desktop pointer + motion allowed only; elsewhere it is a plain PillLink.
 *
 * The pull moves a wrapper, never the link itself: GSAP owns `transform` on whatever it animates and
 * resets the CSS `scale`/`translate` properties there, which would cancel the link's own hover
 * scale/lift and press feedback.
 *
 * Reserved for hero-level calls to action (interaction hierarchy): Explore Solutions and Partner
 * with Us in the hero, Get in Touch and Become a Partner in the closing band, and a product page's
 * Enquire button — never whole groups of buttons.
 */
export default function MagneticButton(props) {
  const ref = useMagnetic();
  return (
    <span ref={ref} className="inline-block">
      <PillLink {...props} />
    </span>
  );
}
