import { createElement } from "react";
import BessLetters from "./BessLetters";
import EnergyFlow from "./EnergyFlow";
import CabinetParts from "./CabinetParts";
import KeyTerms from "./KeyTerms";
import ScaleMorph from "./ScaleMorph";
import DayDial from "./DayDial";
import ChooseChips from "./ChooseChips";
import CellCompare from "./CellCompare";
import GlanceRows from "./GlanceRows";
import WhyLfp from "./WhyLfp";
import CycleLoop from "./CycleLoop";
import SafetyLayers from "./SafetyLayers";
import NexeraLfp from "./NexeraLfp";

// The two-cells scene, focused on LFP, on NMC, or on both (the lithium-ion family).
const CellsLfp = (props) => createElement(CellCompare, { ...props, focus: "lfp" });
const CellsNmc = (props) => createElement(CellCompare, { ...props, focus: "nmc" });
const CellsFamily = (props) => createElement(CellCompare, { ...props, focus: "family" });

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
  // LFP vs NMC — a draft (data/articles.js): its scenes exist in development only, like the article.
  ...(import.meta.env.DEV
    ? {
        "cells-lfp": { Scene: CellsLfp, inline: 260 },
        "cells-nmc": { Scene: CellsNmc, inline: 260 },
        "cells-family": { Scene: CellsFamily, inline: 260 },
        "glance-rows": { Scene: GlanceRows, inline: 320 },
        "why-lfp": { Scene: WhyLfp, inline: 220 },
        "cycle-loop": { Scene: CycleLoop, inline: 280 },
        "safety-layers": { Scene: SafetyLayers, inline: 280 },
        "nexera-lfp": { Scene: NexeraLfp, inline: 240 },
      }
    : {}),
};
