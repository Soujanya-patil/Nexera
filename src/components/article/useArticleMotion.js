import { useEffect, useState } from "react";
import { loadArticleMotion } from "./motion";

/**
 * The article motion bundle once it has loaded (null until then, and always under reduced motion).
 * Its own module, so a page using it (the Resources hub) doesn't also pull in the article's scenes.
 */
export function useArticleMotion(enabled = true) {
  const [motion, setMotion] = useState(null);
  useEffect(() => {
    if (!enabled) return;
    let live = true;
    loadArticleMotion()
      .then((m) => live && setMotion(m))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [enabled]);
  return motion;
}
