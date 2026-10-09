import BessLetters from "./BessLetters";
import EnergyFlow from "./EnergyFlow";
import CabinetParts from "./CabinetParts";
import KeyTerms from "./KeyTerms";
import ScaleMorph from "./ScaleMorph";
import DayDial from "./DayDial";
import ChooseChips from "./ChooseChips";

/**
 * Article scenes by `visual` id (data/articles.js sections). `inline` is the height each one keeps
 * on phones and tablets, where it sits under its heading (reserved in the pre-rendered page, so it
 * never shifts the text); the scenes with controls (the Charging / Discharging switch, the C-rate
 * slider) are taller than the others.
 */
export const SCENES = {
  "bess-letters": { Scene: BessLetters, inline: 240 },
  "energy-flow": { Scene: EnergyFlow, inline: 320 },
  "cabinet-parts": { Scene: CabinetParts, inline: 260 },
  "key-terms": { Scene: KeyTerms, inline: 380 },
  "scale-morph": { Scene: ScaleMorph, inline: 260 },
  "day-dial": { Scene: DayDial, inline: 300 },
  "choose-chips": { Scene: ChooseChips, inline: 300 },
};
