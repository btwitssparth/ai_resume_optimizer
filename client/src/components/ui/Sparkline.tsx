interface SparklineProps {
  points: { date: string | Date; score: number }[];
}

const ACCENT = "#5b8def";

export default function Sparkline({ points }: SparklineProps) {
  const recentPoints = points.slice(-10);

  if (recentPoints.length === 0) {
    return null;
  }

  const paddingX = 8;
  const paddingY = 8;
  const width = 320;
  const height = 96;
  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingY * 2;

  const xStep = recentPoints.length > 1
    ? innerWidth / (recentPoints.length - 1)
    : innerWidth / 2;

  const minScore = 0;
  const maxScore = 100;

  const coords = recentPoints.map((p, i) => {
    const x = paddingX + i * xStep;
    const normalized = (p.score - minScore) / (maxScore - minScore);
    const y = paddingY + innerHeight * (1 - normalized);
    return { x, y, score: p.score };
  });

  const polylinePoints = coords.map((c) => `${c.x},${c.y}`).join(" ");
  const lastPoint = coords[coords.length - 1];

  return (
    <div className="w-full h-24">
      <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-full"
      preserveAspectRatio="none"
    >
      <polyline
        fill="none"
        stroke={ACCENT}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={polylinePoints}
      />
      {lastPoint && (
        <circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r={4}
          fill={ACCENT}
        />
      )}
    </svg>
    </div>
  );
}
