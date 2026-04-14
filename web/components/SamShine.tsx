"use client";

export default function SamShine() {
  const SIZE = 320;
  const RING_OFFSET = 30;
  const TOTAL = SIZE + RING_OFFSET * 2;
  const CENTER = TOTAL / 2;
  const OUTER_R = CENTER - 14;
  const INNER_R = OUTER_R - 14;

  const floatingSparkles = [
    { angle: 30,  dist: OUTER_R + 22, size: 9,  delay: 0 },
    { angle: 80,  dist: OUTER_R + 18, size: 6,  delay: 0.6 },
    { angle: 140, dist: OUTER_R + 26, size: 11, delay: 1.1 },
    { angle: 195, dist: OUTER_R + 20, size: 7,  delay: 0.3 },
    { angle: 250, dist: OUTER_R + 24, size: 8,  delay: 1.5 },
    { angle: 310, dist: OUTER_R + 19, size: 5,  delay: 0.9 },
    { angle: 355, dist: OUTER_R + 23, size: 10, delay: 1.8 },
  ];

  const circumference = Math.PI * 2 * (INNER_R + 2);

  return (
    <div style={{
      position: "fixed",
      right: "32px",
      top: "50%",
      transform: "translateY(-50%)",
      width: `${TOTAL}px`,
      height: `${TOTAL}px`,
      zIndex: 10,
      pointerEvents: "none",
    }}>
      <style>{`
        @keyframes spinCW  { to { transform: rotate(360deg);  } }
        @keyframes spinCCW { to { transform: rotate(-360deg); } }
        @keyframes twinkle {
          0%, 100% { opacity: 0;   transform: scale(0.3); }
          45%, 55% { opacity: 1;   transform: scale(1);   }
        }
        @keyframes halopulse1 {
          0%, 100% { opacity: 0.12; }
          50%       { opacity: 0.32; }
        }
        @keyframes halopulse2 {
          0%, 100% { opacity: 0.06; }
          50%       { opacity: 0.18; }
        }
        @keyframes borderGlow {
          0%, 100% { stroke-opacity: 0.45; stroke-width: 2;   }
          50%       { stroke-opacity: 1;   stroke-width: 3.5; }
        }
        .sam-ring1  { animation: spinCW  7s  linear infinite; transform-origin: ${CENTER}px ${CENTER}px; }
        .sam-ring2  { animation: spinCCW 12s linear infinite; transform-origin: ${CENTER}px ${CENTER}px; }
        .sam-shimmer{ animation: spinCW  2.8s linear infinite; transform-origin: ${CENTER}px ${CENTER}px; }
        .sam-border { animation: borderGlow 2.5s ease-in-out infinite; }
        .sam-halo1  { animation: halopulse1 3s ease-in-out infinite; }
        .sam-halo2  { animation: halopulse2 4s ease-in-out 0.7s infinite; }
      `}</style>

      <svg
        viewBox={`0 0 ${TOTAL} ${TOTAL}`}
        width={TOTAL}
        height={TOTAL}
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
      >
        <defs>
          <clipPath id="samCircle">
            <circle cx={CENTER} cy={CENTER} r={INNER_R} />
          </clipPath>
          <radialGradient id="haloGrad1" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#FFB932" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#FFB932" stopOpacity="0"   />
          </radialGradient>
          <radialGradient id="haloGrad2" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#FFD700" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#FFD700" stopOpacity="0"   />
          </radialGradient>
        </defs>

        {/* Double halo pulsant */}
        <circle className="sam-halo2" cx={CENTER} cy={CENTER} r={INNER_R + 28}
          fill="url(#haloGrad2)" />
        <circle className="sam-halo1" cx={CENTER} cy={CENTER} r={INNER_R + 10}
          fill="url(#haloGrad1)" />

        {/* Ring 1 : 16 points dorés */}
        <g className="sam-ring1">
          {Array.from({ length: 16 }, (_, i) => {
            const a = (i / 16) * Math.PI * 2;
            const cx = CENTER + OUTER_R * Math.cos(a);
            const cy = CENTER + OUTER_R * Math.sin(a);
            const big = i % 2 === 0;
            return <circle key={i} cx={cx} cy={cy} r={big ? 4.5 : 2.5}
              fill={big ? "#FFB932" : "#FFE87A"} opacity={big ? 0.9 : 0.45} />;
          })}
        </g>

        {/* Ring 2 : losanges anti-horaire */}
        <g className="sam-ring2">
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2;
            const r = OUTER_R - 17;
            const cx = CENTER + r * Math.cos(a);
            const cy = CENTER + r * Math.sin(a);
            const s = 3.5;
            return <polygon 
              key={i}
              suppressHydrationWarning
              points={`${cx},${cy - s} ${cx + s},${cy} ${cx},${cy + s} ${cx - s},${cy}`}
              fill="#FFD700" 
              opacity={0.55} 
            />;
          })}
        </g>

        {/* Arc shimmer tournant */}
        <g className="sam-shimmer">
          <circle cx={CENTER} cy={CENTER} r={INNER_R + 2}
            fill="none"
            stroke="#FFF8C0"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={`${circumference * 0.18} ${circumference * 0.82}`}
            strokeOpacity="0.95"
          />
          <circle cx={CENTER} cy={CENTER} r={INNER_R + 2}
            fill="none"
            stroke="#FFD700"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={`${circumference * 0.28} ${circumference * 0.72}`}
            strokeOpacity="0.5"
          />
        </g>

        {/* Bordure dorée pulsante */}
        <circle className="sam-border"
          cx={CENTER} cy={CENTER} r={INNER_R}
          fill="none" stroke="#FFD700" strokeWidth="2.5" />

        {/* Image */}
        {(() => {
          const SCALE = 0.65;
          const imgW = INNER_R * 2 / SCALE;
          return (
            <image href="/sam.png"
              x={CENTER - imgW / 2} y={CENTER - imgW / 2}
              width={imgW} height={imgW}
              clipPath="url(#samCircle)"
              preserveAspectRatio="xMidYMid meet"
            />
          );
        })()}

        {/* Sparkles flottantes qui twinklent */}
        {floatingSparkles.map(({ angle, dist, size, delay }, i) => {
          const rad = (angle * Math.PI) / 180;
          const cx = CENTER + dist * Math.cos(rad);
          const cy = CENTER + dist * Math.sin(rad);
          return (
            <g key={i} style={{
              animation: `twinkle ${2.2 + (i % 3) * 0.6}s ease-in-out ${delay}s infinite`,
              transformOrigin: `${cx}px ${cy}px`,
            }}>
              <line x1={cx - size} y1={cy} x2={cx + size} y2={cy}
                stroke="#FFD700" strokeWidth="1.6" strokeLinecap="round" />
              <line x1={cx} y1={cy - size} x2={cx} y2={cy + size}
                stroke="#FFD700" strokeWidth="1.6" strokeLinecap="round" />
              <line x1={cx - size * 0.55} y1={cy - size * 0.55} x2={cx + size * 0.55} y2={cy + size * 0.55}
                stroke="#FFE87A" strokeWidth="0.9" strokeLinecap="round" />
              <line x1={cx + size * 0.55} y1={cy - size * 0.55} x2={cx - size * 0.55} y2={cy + size * 0.55}
                stroke="#FFE87A" strokeWidth="0.9" strokeLinecap="round" />
              <circle cx={cx} cy={cy} r={size * 0.2} fill="#FFF8C0" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}