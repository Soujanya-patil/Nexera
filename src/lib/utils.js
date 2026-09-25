import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Class-name helper used by the registry components (Magic UI / SmoothUI / Unlumen UI). */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
