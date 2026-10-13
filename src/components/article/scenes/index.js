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
import Coupling from "./Coupling";
import CouplingFlow from "./CouplingFlow";
import ExistingPlant from "./ExistingPlant";
import HybridSystem from "./HybridSystem";
import { Building2, Plug, Repeat, Ruler, Wrench } from "lucide-react";
import { AC_DC_GLANCE } from "../../../data/articles";

// The two-cells scene, focused on LFP, on NMC, or on both (the lithium-ion family).
const CellsLfp = (props) => createElement(CellCompare, { ...props, focus: "lfp" });
const CellsNmc = (props) => createElement(CellCompare, { ...props, focus: "nmc" });
const CellsFamily = (props) => createElement(CellCompare, { ...props, focus: "family" });
// AC vs DC coupled: the two flows, and the at-a-glance table with an icon per row.
const DcCoupled = (props) => createElement(CouplingFlow, { ...props, kind: "dc" });
const AcCoupled = (props) => createElement(CouplingFlow, { ...props, kind: "ac" });
const GlanceAcDc = (props) => createElement(GlanceRows, { ...props, table: AC_DC_GLANCE, icons: [Plug, Repeat, Wrench, Ruler, Building2], names: ["DC-coupled", "AC-coupled"] });

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
  // Draft articles' scenes (data/articles.js): in development only, like the articles themselves.
  // LFP vs NMC.
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
        // AC vs DC coupled — also a draft.
        coupling: { Scene: Coupling, inline: 260 },
        "dc-coupled": { Scene: DcCoupled, inline: 280 },
        "ac-coupled": { Scene: AcCoupled, inline: 280 },
        "glance-acdc": { Scene: GlanceAcDc, inline: 340 },
        "existing-plant": { Scene: ExistingPlant, inline: 260 },
        "hybrid-system": { Scene: HybridSystem, inline: 280 },
      }
    : {}),
};
