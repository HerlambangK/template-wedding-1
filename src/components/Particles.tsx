"use client";

import { useEffect, useState, useCallback } from "react";

interface ParticleData {
  id: number;
  x: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
  type: "circle" | "diamond" | "star";
}

export default function Particles() {
  const [particles, setParticles] = useState<ParticleData[]>([]);

  useEffect(() => {
    const types: ParticleData["type"][] = ["circle", "diamond", "star"];
    const newParticles: ParticleData[] = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * 5 + 2,
      delay: Math.random() * 15,
      duration: Math.random() * 20 + 15,
      opacity: Math.random() * 0.3 + 0.1,
      type: types[Math.floor(Math.random() * types.length)],
    }));
    setParticles(newParticles);
  }, []);

  const renderShape = useCallback((type: ParticleData["type"], size: number) => {
    switch (type) {
      case "diamond":
        return (
          <div
            style={{
              width: size,
              height: size,
              transform: "rotate(45deg)",
              background: "var(--primary)",
            }}
          />
        );
      case "star":
        return (
          <div
            style={{
              width: size * 1.5,
              height: size * 1.5,
              fontSize: size * 1.5,
              lineHeight: 1,
              color: "var(--primary)",
            }}
          >
            ✦
          </div>
        );
      default:
        return (
          <div
            style={{
              width: size,
              height: size,
              borderRadius: "50%",
              background: `radial-gradient(circle, var(--primary), transparent)`,
            }}
          />
        );
    }
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: `${p.x}%`,
            bottom: `-${p.size * 2}px`,
            opacity: p.opacity,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        >
          {renderShape(p.type, p.size)}
        </div>
      ))}
    </div>
  );
}
