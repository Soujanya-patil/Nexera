import { useEffect, useRef } from "react";

// A damped spring, integrated per frame (the same model and parameters Motion's useSpring used):
// stiffness k, damping c, mass m; x'' = (-k (x - target) - c x') / m.
function stepSpring(s, target, dt, { stiffness = 100, damping = 10, mass = 1 }) {
  const a = (-stiffness * (s.x - target) - damping * s.v) / mass;
  s.v += a * dt;
  s.x += s.v * dt;
}

/**
 * Pointer tilt: the element leans toward the cursor (rotateX / rotateY up to `rotationFactor`
 * degrees), each axis following the pointer through a spring (`springOptions`), and settles back to
 * flat when the pointer leaves. Transform only, written at most once per frame, and only while
 * something is moving. Rendered as a plain <div> (identical on the server and in the browser); the
 * tilt is switched on after mount, and only when `enabled()` says so (e.g. a fine pointer).
 */
export function Tilt({ children, className, style, rotationFactor = 15, isReverse = false, springOptions = {}, enabled = () => true }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled()) return;
    el.style.transformStyle = "preserve-3d";
    const target = { x: 0, y: 0 }; // pointer position, -0.5 … 0.5 across the element
    const sx = { x: 0, v: 0 };
    const sy = { x: 0, v: 0 };
    let raf = 0;
    let last = 0;
    const paint = () => {
      const f = isReverse ? -1 : 1;
      const rx = f * rotationFactor * 2 * sy.x; // y -0.5 → -factor … 0.5 → +factor (rotateX)
      const ry = -f * rotationFactor * 2 * sx.x; // x -0.5 → +factor … 0.5 → -factor (rotateY)
      el.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    };
    const tick = (now) => {
      // Fixed small steps keep the spring stable whatever the frame rate.
      let dt = Math.min((now - last) / 1000, 0.064);
      last = now;
      while (dt > 0) {
        const h = Math.min(dt, 1 / 240);
        stepSpring(sx, target.x, h, springOptions);
        stepSpring(sy, target.y, h, springOptions);
        dt -= h;
      }
      paint();
      const resting = [sx, sy].every((s, i) => Math.abs(s.v) < 1e-4 && Math.abs(s.x - (i ? target.y : target.x)) < 1e-4);
      raf = resting ? 0 : requestAnimationFrame(tick);
    };
    const kick = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    const move = (e) => {
      const r = el.getBoundingClientRect();
      target.x = (e.clientX - r.left) / r.width - 0.5;
      target.y = (e.clientY - r.top) / r.height - 0.5;
      kick();
    };
    const leave = () => {
      target.x = 0;
      target.y = 0;
      kick();
    };
    el.addEventListener("mousemove", move);
    el.addEventListener("mouseleave", leave);
    return () => {
      el.removeEventListener("mousemove", move);
      el.removeEventListener("mouseleave", leave);
      cancelAnimationFrame(raf);
      el.style.transform = "";
      el.style.transformStyle = "";
    };
    // The spring settings are fixed per surface.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rotationFactor, isReverse]);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
