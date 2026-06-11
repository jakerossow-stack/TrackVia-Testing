import { useEffect, useRef } from 'react';

export function RiskGauge({ score, size = 160 }) {
  const prevScore = useRef(score);
  const needleRef = useRef(null);

  const color = score >= 70 ? 'var(--red)' : score >= 50 ? 'var(--amber)' : 'var(--green)';
  const label = score >= 70 ? 'Critical' : score >= 50 ? 'Warning' : 'Low Risk';

  // SVG gauge: 180° arc from left to right
  const r = (size / 2) - 16;
  const cx = size / 2;
  const cy = size / 2 + 8;

  function polarToXY(angleDeg, radius) {
    const rad = (angleDeg - 180) * (Math.PI / 180);
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  }

  function arcPath(startDeg, endDeg, radius) {
    const s = polarToXY(startDeg, radius);
    const e = polarToXY(endDeg, radius);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${large} 1 ${e.x} ${e.y}`;
  }

  const needleAngle = score * 1.8; // 0→0°, 100→180°
  const needleEnd = polarToXY(needleAngle, r - 8);

  useEffect(() => {
    prevScore.current = score;
  }, [score]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={size} height={size / 2 + 24} style={{ overflow: 'visible' }}>
        {/* Track */}
        <path d={arcPath(0, 180, r)} fill="none" stroke="var(--border)" strokeWidth={10} strokeLinecap="round" />
        {/* Green zone 0-50 */}
        <path d={arcPath(0, 90, r)} fill="none" stroke="var(--green)" strokeWidth={10} strokeLinecap="round" opacity={0.25} />
        {/* Amber zone 50-70 */}
        <path d={arcPath(90, 126, r)} fill="none" stroke="var(--amber)" strokeWidth={10} strokeLinecap="round" opacity={0.25} />
        {/* Red zone 70-100 */}
        <path d={arcPath(126, 180, r)} fill="none" stroke="var(--red)" strokeWidth={10} strokeLinecap="round" opacity={0.25} />
        {/* Score arc */}
        <path d={arcPath(0, needleAngle, r)} fill="none" stroke={color} strokeWidth={10} strokeLinecap="round" style={{ transition: 'all 0.6s ease' }} />
        {/* Needle */}
        <line
          ref={needleRef}
          x1={cx} y1={cy}
          x2={needleEnd.x} y2={needleEnd.y}
          stroke={color} strokeWidth={3} strokeLinecap="round"
          style={{ transition: 'all 0.6s ease' }}
        />
        <circle cx={cx} cy={cy} r={5} fill={color} style={{ transition: 'fill 0.6s ease' }} />
        {/* Score */}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize={28} fontWeight={700} fontFamily="DM Mono" fill={color} style={{ transition: 'fill 0.6s ease' }}>
          {score}
        </text>
        <text x={cx} y={cy + 16} textAnchor="middle" fontSize={11} fill="var(--ink-3)" fontFamily="DM Sans">
          {label}
        </text>
      </svg>
    </div>
  );
}
