import { clsx } from "clsx";

/**
 * Class-name helper used by the registry components (Magic UI / SmoothUI / Unlumen UI): a plain join
 * (clsx). None of the places it is used pass conflicting utilities any more (the Marquee's defaults
 * are CSS fallbacks), so tailwind-merge's class merging — ~100 KB of code — isn't needed.
 */
export function cn(...inputs) {
  return clsx(inputs);
}
