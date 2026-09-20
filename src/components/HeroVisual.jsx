import { useEffect, useRef, useState } from "react";

const STEEL = "#0066CC";
const SIGNAL = "#00A78E";
const LINE_COUNT = 10;

function makeLines(count) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.2;
    return {
      angle,
      length: 0.62 + Math.random() * 0.3,
      color: i % 2 === 0 ? STEEL : SIGNAL,
      speed: 0.35 + Math.random() * 0.4,
      phase: Math.random(),
    };
  });
}

/**
 * Canvas energy-pulse animation: lines of current converging into a glowing
 * core. Desktop + motion-enabled only — callers must not mount this on
 * mobile viewports or under prefers-reduced-motion (see Hero.jsx).
 */
export default function HeroVisual() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const linesRef = useRef(makeLines(LINE_COUNT));

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    let raf;
    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const start = performance.now();

    const draw = (now) => {
      const t = (now - start) / 1000;
      const cx = width / 2;
      const cy = height / 2;
      const coreRadius = Math.min(width, height) * 0.09;
      const fieldRadius = Math.min(width, height) * 0.46;

      ctx.clearRect(0, 0, width, height);

      // Faint static spokes so the form reads even between particle pulses
      linesRef.current.forEach((line) => {
        const x2 = cx + Math.cos(line.angle) * fieldRadius * line.length;
        const y2 = cy + Math.sin(line.angle) * fieldRadius * line.length;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = line.color;
        ctx.globalAlpha = 0.12;
        ctx.lineWidth = 1;
        ctx.stroke();
      });
      ctx.globalAlpha = 1;

      // Traveling energy particles converging toward the core
      linesRef.current.forEach((line) => {
        const progress = (t * line.speed + line.phase) % 1;
        const dist = fieldRadius * line.length * (1 - progress);
        const x = cx + Math.cos(line.angle) * dist;
        const y = cy + Math.sin(line.angle) * dist;
        const fade = Math.sin(progress * Math.PI);

        ctx.beginPath();
        ctx.arc(x, y, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = line.color;
        ctx.globalAlpha = 0.25 + fade * 0.65;
        ctx.shadowColor = line.color;
        ctx.shadowBlur = 10;
        ctx.fill();
      });
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;

      // Glowing core
      const pulse = 0.85 + Math.sin(t * 1.8) * 0.15;
      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreRadius * 2.2 * pulse);
      gradient.addColorStop(0, "rgba(255,255,255,0.9)");
      gradient.addColorStop(0.25, `${STEEL}CC`);
      gradient.addColorStop(0.6, `${SIGNAL}55`);
      gradient.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath();
      ctx.arc(cx, cy, coreRadius * 2.2 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, coreRadius * 0.55, 0, Math.PI * 2);
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0">
      <canvas ref={canvasRef} className="block" />
    </div>
  );
}

/** Static, dependency-free fallback for mobile and prefers-reduced-motion. */
export function HeroVisualStatic() {
  const [staticPositions] = useState(() => makeLines(LINE_COUNT));
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true">
        {staticPositions.map((line, i) => {
          const x2 = 100 + Math.cos(line.angle) * 90 * line.length;
          const y2 = 100 + Math.sin(line.angle) * 90 * line.length;
          return (
            <line
              key={i}
              x1="100"
              y1="100"
              x2={x2}
              y2={y2}
              stroke={line.color}
              strokeWidth="1"
              opacity="0.2"
            />
          );
        })}
        <circle cx="100" cy="100" r="34" fill="url(#nexera-core-glow)" />
        <circle cx="100" cy="100" r="9" fill="#FFFFFF" />
        <defs>
          <radialGradient id="nexera-core-glow">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="30%" stopColor={STEEL} stopOpacity="0.8" />
            <stop offset="65%" stopColor={SIGNAL} stopOpacity="0.35" />
            <stop offset="100%" stopColor={SIGNAL} stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}
