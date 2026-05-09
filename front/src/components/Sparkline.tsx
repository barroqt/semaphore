import type { SparkPoint } from '../types';

interface Props {
  data: SparkPoint[];
  color: string;
  width?: number;
  height?: number;
}

export function Sparkline({ data, color, width = 160, height = 40 }: Props) {
  if (data.length < 2) return null;

  const scores = data.map((d) => d.score);
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const range = max - min || 1;

  const xStep = width / (data.length - 1);
  const points = data.map((d, i) => ({
    x: i * xStep,
    y: height - ((d.score - min) / range) * (height - 4) - 2,
  }));

  const polyline = points.map((p) => `${p.x},${p.y}`).join(' ');

  // Area fill path
  const areaPath =
    `M ${points[0].x},${height} ` +
    points.map((p) => `L ${p.x},${p.y}`).join(' ') +
    ` L ${points[points.length - 1].x},${height} Z`;

  const gradId = `spark-${color.replace('#', '')}-${width}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} />
      <polyline
        points={polyline}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      />
      {/* Last dot */}
      <circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r="2.5"
        fill={color}
        style={{ filter: `drop-shadow(0 0 3px ${color})` }}
      />
    </svg>
  );
}
