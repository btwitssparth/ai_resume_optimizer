import { useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";
import { useApp } from "../../contexts/AppContext";

interface ScoreCardProps {
  score: number;
  label: string;
  subtitle?: string;
  size?: "md" | "lg";
}

export default function ScoreCard({
  score,
  label,
  subtitle,
  size = "md",
}: ScoreCardProps) {
  const { motionEnabled } = useApp();
  const clampedScore = Math.max(0, Math.min(100, score));

  const count = useMotionValue(motionEnabled ? 0 : clampedScore);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const [display, setDisplay] = useState(motionEnabled ? 0 : clampedScore);

  const progress = useMotionValue(motionEnabled ? 0 : clampedScore);
  const ringSize = size === "lg" ? 56 : 44;
  const strokeWidth = size === "lg" ? 8 : 6;
  const radius = ringSize / 2 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = useTransform(
    progress,
    (p) => circumference - (p / 100) * circumference
  );
  const [dashOffset, setDashOffset] = useState(
    motionEnabled ? circumference : circumference - (clampedScore / 100) * circumference
  );

  useEffect(() => {
    if (!motionEnabled) {
      // Jumping the motion values triggers the "change" subscriptions below
      // synchronously, which is what actually updates `display`/`dashOffset`.
      count.jump(clampedScore);
      progress.jump(clampedScore);
      return;
    }
    const countControls = animate(count, clampedScore, {
      duration: 1.1,
      ease: [0.22, 1, 0.36, 1],
      delay: 0.15,
    });
    const progressControls = animate(progress, clampedScore, {
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1],
      delay: 0.1,
    });
    return () => {
      countControls.stop();
      progressControls.stop();
    };
  }, [count, progress, clampedScore, motionEnabled]);

  useEffect(() => {
    return rounded.on("change", (v) => setDisplay(v));
  }, [rounded]);

  useEffect(() => {
    return offset.on("change", (v) => setDashOffset(v));
  }, [offset]);

  const scoreColor =
    clampedScore >= 80 ? "#4ade80" : clampedScore >= 55 ? "#fbbf24" : "#f87171";

  const containerClass =
    size === "lg"
      ? "bg-[#111114] border border-[#23232a] rounded-2xl p-8 flex flex-col items-center justify-center gap-5"
      : "bg-[#111114] border border-[#23232a] rounded-xl p-5 flex items-center gap-4";

  const ringWrapperClass =
    size === "lg" ? "relative w-36 h-36 flex-shrink-0" : "relative w-24 h-24 flex-shrink-0";

  const scoreTextClass =
    size === "lg"
      ? "text-5xl font-bold text-[#f5f5f7] font-mono tracking-tight animate-number"
      : "text-2xl font-bold text-[#f5f5f7] font-mono tracking-tight animate-number";

  const labelClass =
    size === "lg"
      ? "text-base font-semibold text-[#f5f5f7] tracking-tight"
      : "text-sm font-semibold text-[#f5f5f7] tracking-tight";

  const subtitleClass =
    size === "lg" ? "text-sm text-[#6f7480]" : "text-xs text-[#6f7480]";

  return (
    <div className={containerClass}>
      <div className={ringWrapperClass}>
        <svg
          viewBox={`0 0 ${ringSize} ${ringSize}`}
          className="w-full h-full -rotate-90"
        >
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            fill="none"
            stroke="#1f1f26"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            fill="none"
            stroke={scoreColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
          <span className={scoreTextClass}>{display}</span>
          {size === "lg" && (
            <span className="text-sm text-[#6f7480] font-medium font-mono mt-1">
              /100
            </span>
          )}
        </div>
      </div>
      {size === "lg" ? (
        <div className="text-center">
          <h2 className={labelClass}>{label}</h2>
          {subtitle && <p className={`${subtitleClass} mt-1.5`}>{subtitle}</p>}
        </div>
      ) : (
        <div className="flex-1 min-w-0">
          <h2 className={labelClass}>{label}</h2>
          {subtitle && <p className={`${subtitleClass} mt-1`}>{subtitle}</p>}
        </div>
      )}
    </div>
  );
}
