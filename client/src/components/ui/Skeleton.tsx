interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className = "" }: SkeletonCardProps) {
  return (
    <div
      className={`bg-[#1f1f26] rounded-xl skeleton-shimmer ${className}`}
    />
  );
}

interface SkeletonLineProps {
  className?: string;
}

export function SkeletonLine({ className = "" }: SkeletonLineProps) {
  return (
    <div
      className={`bg-[#1f1f26] rounded-full skeleton-shimmer ${className}`}
    />
  );
}

interface SkeletonCircleProps {
  className?: string;
}

export function SkeletonCircle({ className = "" }: SkeletonCircleProps) {
  return (
    <div
      className={`bg-[#1f1f26] rounded-full skeleton-shimmer ${className}`}
    />
  );
}

export function SkeletonStyles() {
  return (
    <style>{`
      @keyframes skeleton-shimmer {
        0% {
          opacity: 0.35;
        }
        50% {
          opacity: 0.6;
        }
        100% {
          opacity: 0.35;
        }
      }
      .skeleton-shimmer {
        animation: skeleton-shimmer 1.6s ease-in-out infinite;
      }
    `}</style>
  );
}
