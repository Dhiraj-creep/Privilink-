import React, { useId } from 'react';

export function Sparkline({
  data = [10, 14, 12, 18, 16, 22, 26],
  color = 'var(--primary)',
  width = 84,
  height = 26,
  strokeWidth = 1.8,
  ariaLabel = 'Metric trend sparkline',
  style = {},
  ...props
}) {
  const reactId = useId();
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min === 0 ? 1 : max - min;
  const padding = 3;

  const points = data.map((val, idx) => {
    const x = padding + (idx / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((val - min) / range) * (height - padding * 2);
    return { x, y };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  const gradientId = `spark-grad-${reactId.replace(/:/g, '')}`;
  const lastPoint = points[points.length - 1];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={ariaLabel}
      style={{ overflow: 'visible', display: 'block', ...style }}
      {...props}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>

      {/* Subtle area fill */}
      <path d={areaD} fill={`url(#${gradientId})`} />

      {/* Main hairline stroke */}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Current value endpoint pulse */}
      <circle
        cx={lastPoint.x}
        cy={lastPoint.y}
        r="2.2"
        fill={color}
        stroke="var(--bg-surface)"
        strokeWidth="1"
      />
    </svg>
  );
}

export default Sparkline;
