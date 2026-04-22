'use client';

import React, { useEffect, useState } from 'react';

type Particle = {
  id: number;
  content: React.ReactNode;
  x: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  rot: number;
  opacity: number;
  colorClass: string;
};

const SYMBOLS = ['₹', '$', '€', '◈', '▣', '⬡'];
const COLORS = ['text-violet-400', 'text-indigo-400', 'text-fuchsia-400'];

export default function AntigravityEffect() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const newParticles: Particle[] = [];
    const count = Math.floor(Math.random() * 11) + 30; // 30-40

    for (let i = 0; i < count; i++) {
      const isCard = Math.random() > 0.8;
      let content: React.ReactNode;

      if (isCard) {
        content = (
          <div className="w-8 h-5 border border-current rounded opacity-50 shadow-[0_0_8px_currentColor] mix-blend-screen"></div>
        );
      } else {
        content = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      }

      newParticles.push({
        id: i,
        content,
        x: Math.random() * 100, // 0-100vw
        size: Math.random() * 12 + 8, // 8px-20px
        duration: Math.random() * 10 + 6, // 6s-16s
        delay: Math.random() * 8, // 0s-8s
        drift: (Math.random() - 0.5) * 80, // ±40px
        rot: Math.random() * 720, // 0-720deg
        opacity: Math.random() * 0.35 + 0.15, // 0.15-0.5
        colorClass: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
    }

    setParticles(newParticles);
  }, []);

  if (particles.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes rise {
          0%   { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0; }
          10%  { opacity: var(--opacity); }
          50%  { transform: translateY(-50vh) translateX(var(--drift)) rotate(calc(var(--rot) * 0.5)); }
          90%  { opacity: var(--opacity); }
          100% { transform: translateY(-110vh) translateX(calc(var(--drift) * -0.3)) rotate(var(--rot)); opacity: 0; }
        }
      `}</style>

      <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className={`absolute bottom-[-10%] ${p.colorClass}`}
            style={{
              left: `${p.x}vw`,
              fontSize: `${p.size}px`,
              animation: `rise ${p.duration}s linear ${p.delay}s infinite`,
              ['--opacity' as any]: p.opacity,
              ['--drift' as any]: `${p.drift}px`,
              ['--rot' as any]: `${p.rot}deg`,
            }}
          >
            {p.content}
          </div>
        ))}
      </div>
    </>
  );
}
