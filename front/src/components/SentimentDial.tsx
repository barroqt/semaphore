import { useEffect, useRef } from 'react';
import type { SentimentLabel } from '../types';

interface Props {
  score: number;
  label: SentimentLabel;
  size?: number;
}

const LABEL_COLORS: Record<SentimentLabel, string> = {
  'Extreme Fear': '#ad180b',
  'Fear': '#f03014',
  'Neutral': '#c8871e',
  'Greed': '#52a843',
  'Extreme Greed': '#2e7a32',
};

const LABEL_ZONES = [
  { label: 'EF', start: 0, end: 20, color: '#ad180b' },
  { label: 'F', start: 20, end: 40, color: '#f03014' },
  { label: 'N', start: 40, end: 60, color: '#c8871e' },
  { label: 'G', start: 60, end: 80, color: '#52a843' },
  { label: 'EG', start: 80, end: 100, color: '#2e7a32' },
];

function scoreToAngle(score: number): number {
  // Map 0-100 to -135deg to +135deg (270 degree sweep)
  return -135 + (score / 100) * 270;
}

export function SentimentDial({ score, label, size = 120 }: Props) {
  const needleRef = useRef<SVGLineElement>(null);
  const animatedRef = useRef(false);

  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;
  const strokeWidth = size * 0.055;
  const gapAngle = 90; // total gap at the bottom (45 each side)
  const startAngle = 90 + gapAngle / 2; // in SVG degrees (clockwise from right)
  const endAngle = 90 - gapAngle / 2 + 360;

  function polarToXY(angleDeg: number, radius: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad),
    };
  }

  function describeArc(startDeg: number, endDeg: number, radius: number) {
    const s = polarToXY(startDeg, radius);
    const e = polarToXY(endDeg, radius);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${large} 1 ${e.x} ${e.y}`;
  }

  // Arc spans from 135deg to 405deg (270 degrees total), with 0-100 mapped across
  const arcStartDeg = 135;
  const arcEndDeg = 405;
  const arcSpan = arcEndDeg - arcStartDeg;

  function scoreToArcDeg(s: number) {
    return arcStartDeg + (s / 100) * arcSpan;
  }

  const needleAngleDeg = scoreToArcDeg(score);
  const needleRad = ((needleAngleDeg - 90) * Math.PI) / 180;
  const needleLen = r * 0.78;
  const needleTip = {
    x: cx + needleLen * Math.cos(needleRad),
    y: cy + needleLen * Math.sin(needleRad),
  };
  const needleBase1 = {
    x: cx + (r * 0.12) * Math.cos(needleRad + Math.PI / 2),
    y: cy + (r * 0.12) * Math.sin(needleRad + Math.PI / 2),
  };
  const needleBase2 = {
    x: cx + (r * 0.12) * Math.cos(needleRad - Math.PI / 2),
    y: cy + (r * 0.12) * Math.sin(needleRad - Math.PI / 2),
  };

  const color = LABEL_COLORS[label];

  const tickMarks = Array.from({ length: 11 }, (_, i) => {
    const s = i * 10;
    const deg = scoreToArcDeg(s);
    const rad = ((deg - 90) * Math.PI) / 180;
    const inner = r - strokeWidth / 2 - size * 0.035;
    const outer = r - strokeWidth / 2 - size * 0.01;
    const isMajor = i % 5 === 0;
    return {
      x1: cx + inner * Math.cos(rad),
      y1: cy + inner * Math.sin(rad),
      x2: cx + (isMajor ? outer + size * 0.03 : outer) * Math.cos(rad),
      y2: cy + (isMajor ? outer + size * 0.03 : outer) * Math.sin(rad),
      isMajor,
    };
  });

  useEffect(() => {
    animatedRef.current = false;
  }, [score]);

  return (
    <div className="relative flex flex-col items-center">
      <svg width={size} height={size * 0.82} viewBox={`0 0 ${size} ${size * 0.82}`}>
        {/* Dial face background */}
        <defs>
          <radialGradient id={`dialBg-${score}`} cx="40%" cy="30%">
            <stop offset="0%" stopColor="#4a3820" />
            <stop offset="60%" stopColor="#2a1e10" />
            <stop offset="100%" stopColor="#1a1208" />
          </radialGradient>
        </defs>
        <circle
          cx={cx} cy={cy} r={r + strokeWidth}
          fill={`url(#dialBg-${score})`}
          stroke="rgba(94, 61, 27, 0.8)"
          strokeWidth="1.5"
        />

        {/* Background arc (full range) */}
        <path
          d={describeArc(arcStartDeg, arcEndDeg - 0.01, r)}
          fill="none"
          stroke="rgba(0,0,0,0.5)"
          strokeWidth={strokeWidth}
          strokeLinecap="butt"
        />

        {/* Colored zone arcs */}
        {LABEL_ZONES.map((zone) => (
          <path
            key={zone.label}
            d={describeArc(scoreToArcDeg(zone.start), scoreToArcDeg(zone.end) - 0.01, r)}
            fill="none"
            stroke={zone.color}
            strokeWidth={strokeWidth}
            strokeLinecap="butt"
            opacity="0.35"
          />
        ))}

        {/* Active arc up to current score */}
        <path
          d={describeArc(arcStartDeg, scoreToArcDeg(score), r)}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth * 0.55}
          strokeLinecap="round"
          opacity="0.85"
          style={{ filter: `drop-shadow(0 0 ${size * 0.04}px ${color})` }}
        />

        {/* Tick marks */}
        {tickMarks.map((t, i) => (
          <line
            key={i}
            x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
            stroke={t.isMajor ? 'rgba(200, 135, 30, 0.7)' : 'rgba(200, 135, 30, 0.35)'}
            strokeWidth={t.isMajor ? 1.5 : 0.8}
          />
        ))}

        {/* Needle */}
        <polygon
          points={`${needleTip.x},${needleTip.y} ${needleBase1.x},${needleBase1.y} ${needleBase2.x},${needleBase2.y}`}
          fill={color}
          style={{ filter: `drop-shadow(0 1px 3px rgba(0,0,0,0.6))` }}
        />

        {/* Needle pivot */}
        <circle
          cx={cx} cy={cy} r={size * 0.055}
          fill="radial-gradient(circle, #e8be4e, #5e3d1b)"
          stroke="rgba(200, 135, 30, 0.8)"
          strokeWidth="1"
        />
        <circle cx={cx} cy={cy} r={size * 0.035} fill="#c8871e" />
        <circle cx={cx} cy={cy} r={size * 0.015} fill="#1a1208" />

        {/* Score readout */}
        <text
          x={cx} y={cy + r * 0.52 + strokeWidth}
          textAnchor="middle"
          fill={color}
          fontSize={size * 0.175}
          fontFamily='"Courier Prime", monospace'
          fontWeight="700"
          style={{ filter: `drop-shadow(0 0 4px ${color}40)` }}
        >
          {score}
        </text>
      </svg>
    </div>
  );
}
