'use client';

export default function FluidBackground() {
  return (
    <>
      <style>{`
        @keyframes blob1 {
          0%,100% { border-radius: 60% 40% 70% 30% / 50% 60% 40% 50%; transform: translate(0,0) scale(1); }
          33% { border-radius: 40% 60% 30% 70% / 60% 40% 60% 40%; transform: translate(30px,-20px) scale(1.05); }
          66% { border-radius: 70% 30% 50% 50% / 40% 70% 30% 60%; transform: translate(-20px,30px) scale(0.97); }
        }
        @keyframes blob2 {
          0%,100% { border-radius: 50% 50% 40% 60% / 60% 40% 60% 40%; transform: translate(0,0) scale(1); }
          33% { border-radius: 30% 70% 60% 40% / 50% 60% 40% 50%; transform: translate(-30px,20px) scale(1.07); }
          66% { border-radius: 60% 40% 50% 50% / 30% 70% 50% 50%; transform: translate(20px,-30px) scale(0.95); }
        }
        @keyframes blob3 {
          0%,100% { border-radius: 40% 60% 60% 40% / 70% 30% 70% 30%; transform: translate(0,0) scale(1); }
          50% { border-radius: 70% 30% 40% 60% / 40% 60% 30% 70%; transform: translate(25px,25px) scale(1.06); }
        }
        @keyframes blob4 {
          0%,100% { border-radius: 55% 45% 65% 35% / 45% 55% 45% 55%; transform: translate(0,0) scale(1); }
          40% { border-radius: 35% 65% 45% 55% / 65% 35% 65% 35%; transform: translate(-25px,-25px) scale(1.04); }
          80% { border-radius: 65% 35% 55% 45% / 35% 65% 35% 65%; transform: translate(15px,20px) scale(0.98); }
        }
        @keyframes blob5 {
          0%,100% { border-radius: 45% 55% 55% 45% / 55% 45% 55% 45%; transform: translate(0,0) scale(1); }
          50% { border-radius: 65% 35% 45% 55% / 35% 65% 45% 55%; transform: translate(20px,-15px) scale(1.05); }
        }
        @keyframes blob6 {
          0%,100% { border-radius: 50% 50% 70% 30% / 30% 70% 50% 50%; transform: translate(0,0) scale(1); }
          33% { border-radius: 70% 30% 50% 50% / 50% 50% 30% 70%; transform: translate(-15px,25px) scale(1.03); }
          66% { border-radius: 30% 70% 30% 70% / 70% 30% 70% 30%; transform: translate(25px,-10px) scale(0.96); }
        }
      `}</style>

      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* SVG gooey filter */}
        <svg className="absolute w-0 h-0">
          <defs>
            <filter id="goo">
              <feGaussianBlur in="SourceGraphic" stdDeviation="18" result="blur" />
              <feColorMatrix in="blur" mode="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 28 -10" result="goo" />
              <feBlend in="SourceGraphic" in2="goo" />
            </filter>
          </defs>
        </svg>

        {/* Ambient glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl mix-blend-screen" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl mix-blend-screen" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-fuchsia-700/15 rounded-full blur-3xl mix-blend-screen" />

        {/* Blobs */}
        <div style={{ filter: 'url(#goo)', position: 'absolute', inset: 0 }}>
          <div style={{ position: 'absolute', top: '10%', left: '15%', width: 340, height: 340, background: 'radial-gradient(circle, rgba(139,92,246,0.55) 0%, rgba(99,102,241,0.3) 60%, transparent 80%)', animation: 'blob1 14s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', top: '50%', right: '10%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(162,28,175,0.5) 0%, rgba(139,92,246,0.28) 60%, transparent 80%)', animation: 'blob2 18s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: '15%', left: '20%', width: 280, height: 280, background: 'radial-gradient(circle, rgba(99,102,241,0.5) 0%, rgba(139,92,246,0.25) 60%, transparent 80%)', animation: 'blob3 16s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', top: '30%', left: '50%', width: 220, height: 220, background: 'radial-gradient(circle, rgba(139,92,246,0.45) 0%, transparent 70%)', animation: 'blob4 20s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: '30%', right: '25%', width: 200, height: 200, background: 'radial-gradient(circle, rgba(162,28,175,0.4) 0%, transparent 70%)', animation: 'blob5 12s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', top: '70%', left: '60%', width: 180, height: 180, background: 'radial-gradient(circle, rgba(99,102,241,0.45) 0%, transparent 70%)', animation: 'blob6 15s ease-in-out infinite' }} />
        </div>

        {/* Grain overlay */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>
      </div>
    </>
  );
}
