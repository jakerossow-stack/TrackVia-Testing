import { useEffect, useRef, useState } from 'react';

// Animated semicircular risk gauge. Re-colors against thresholds and animates
// score transitions over 0.6s ease.
export default function RiskGauge({
  score,
  warningThreshold = 50,
  criticalThreshold = 70,
  size = 180,
  label = 'Risk score',
}) {
  const [display, setDisplay] = useState(score);
  const raf = useRef(null);

  useEffect(() => {
    const from = display;
    const to = score;
    if (from === to) return;
    const start = performance.now();
    const duration = 600;
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      setDisplay(Math.round(from + (to - from) * ease(t)));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score]);

  const color =
    display >= criticalThreshold ? 'var(--red)' : display >= warningThreshold ? 'var(--amber)' : 'var(--green)';
  const tier = display >= criticalThreshold ? 'Critical' : display >= warningThreshold ? 'Warning' : 'Watch';

  const w = size;
  const h = size * 0.62;
  const cx = w / 2;
  const cy = h - 8;
  const r = w / 2 - 14;
  const angle = Math.PI * (1 - display / 100); // 100 → 0 rad, 0 → π
  const needleX = cx + r * 0.78 * Math.cos(angle);
  const needleY = cy - r * 0.78 * Math.sin(angle);

  const arc = (from, to, stroke, swidth) => {
    const a1 = Math.PI * (1 - from / 100);
    const a2 = Math.PI * (1 - to / 100);
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy - r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2);
    const y2 = cy - r * Math.sin(a2);
    return <path d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`} fill="none" stroke={stroke} strokeWidth={swidth} strokeLinecap="round" />;
  };

  return (
    <div className="flex flex-col items-center" role="img" aria-label={`${label}: ${display} out of 100, ${tier} tier`}>
      <svg width={w} height={h} aria-hidden="true">
        {arc(0, warningThreshold, 'var(--green-border)', 8)}
        {arc(warningThreshold, criticalThreshold, 'var(--amber-border)', 8)}
        {arc(criticalThreshold, 100, 'var(--red-border)', 8)}
        {arc(0, Math.max(1, display), color, 8)}
        <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke={color} strokeWidth="3" strokeLinecap="round" style={{ transition: 'all 0.6s ease' }} />
        <circle cx={cx} cy={cy} r="5" fill={color} style={{ transition: 'fill 0.6s ease' }} />
      </svg>
      <div className="-mt-2 text-center">
        <div className="font-mono text-3xl font-medium" style={{ color, transition: 'color 0.6s ease' }}>
          {display}
        </div>
        <div className="text-[10px] font-medium uppercase tracking-wide text-ink-4">
          {label} · <span style={{ color }}>{tier}</span>
        </div>
      </div>
    </div>
  );
}
