"use client";

import React, { useEffect, useRef, useMemo } from "react";
import { cn } from "@/lib/utils";

interface LinesGradientProps {
  className?: string;
  bandCount?: number;
  bandSpacing?: number;
  bandThickness?: number;
  waveAmplitude?: number;
  speed?: number;
  colors?: string[];
  targetFps?: number;
}

const DEFAULT_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f97316",
  "#eab308",
];

export function LinesGradient({
  className,
  bandCount = 5,
  bandSpacing = 40,
  bandThickness = 100,
  waveAmplitude = 0.2,
  speed = 1,
  colors = DEFAULT_COLORS,
  targetFps = 60,
}: LinesGradientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  const precomputedColors = useMemo(() => {
    return colors.map((color) => color);
  }, [colors]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    let width = 0;
    let height = 0;
    let time = 0;
    let stopped = false;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${Math.floor(width)}px`;
      canvas.style.height = `${Math.floor(height)}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      if (stopped) return;
      time += 0.01 * speed;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < bandCount; i++) {
        const yOffset = i * bandSpacing + height / 4;
        ctx.beginPath();
        ctx.moveTo(0, yOffset);

        for (let x = 0; x <= width; x += 10) {
          const y =
            yOffset +
            Math.sin(x * 0.005 + time + i) * waveAmplitude * 100;
          ctx.lineTo(x, y);
        }

        ctx.lineWidth = bandThickness;
        ctx.strokeStyle = precomputedColors[i % precomputedColors.length];
        ctx.globalAlpha = 0.4;
        ctx.stroke();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    window.addEventListener("resize", resize);
    resize();
    draw();

    return () => {
      stopped = true;
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [
    speed,
    bandCount,
    bandSpacing,
    bandThickness,
    waveAmplitude,
    precomputedColors,
    targetFps,
  ]);

  return (
    <div
      ref={containerRef}
      className={cn("relative h-full w-full overflow-hidden", className)}
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden
      />
    </div>
  );
}
