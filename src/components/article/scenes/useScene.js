import { useEffect, useRef } from "react";

/**
 * A scene's motion: `build({ gsap, ...plugins }, root)` returns a timeline (or nothing), run inside a
 * gsap.context scoped to the scene. It is built — from the scene's hidden start — each time the scene
 * becomes active, so the scene replays as the reader arrives (in either direction); it pauses while
 * the scene is inactive or off screen, and everything is reverted on unmount. Without `motion`
 * (reduced motion, no JavaScript yet) nothing runs: the markup is the final, static state.
 */
export function useSceneMotion(ref, motion, active, build, deps = []) {
  const ctx = useRef(null);
  const tl = useRef(null);
  const buildRef = useRef(build);
  buildRef.current = build;

  useEffect(() => {
    if (!motion || !ref.current) return;
    if (!active) {
      tl.current?.pause();
      return;
    }
    ctx.current?.revert();
    ctx.current = motion.gsap.context(() => {
      tl.current = buildRef.current(motion, ref.current) ?? null;
    }, ref);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [motion, active, ...deps]);

  useEffect(() => () => ctx.current?.revert(), []);
}
