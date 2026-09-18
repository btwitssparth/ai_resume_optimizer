import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckSquare,
  Sparkles,
  Loader2,
} from "lucide-react";
import type { AnalysisResultDTO } from "../services/api";

interface AnalysisResultsProps {
  result: AnalysisResultDTO | null;
  acceptedEdits: string[];
  onToggleEdit: (edit: string) => void;
  onRegenerate: () => Promise<void>;
  isRegenerating: boolean;
}

function AnimatedScore({ value }: { value: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 1.1,
      ease: [0.22, 1, 0.36, 1],
      delay: 0.15,
    });
    return controls.stop;
  }, [count, value]);

  useEffect(() => {
    return rounded.on("change", (v) => setDisplay(v));
  }, [rounded]);

  return <span className="font-mono">{display}</span>;
}

function ScoreRing({ score }: { score: number }) {
  const progress = useMotionValue(0);
  const circumference = 2 * Math.PI * 44;
  const offset = useTransform(
    progress,
    (p) => circumference - (p / 100) * circumference
  );
  const [dashOffset, setDashOffset] = useState(circumference);

  useEffect(() => {
    const controls = animate(progress, score, {
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1],
      delay: 0.1,
    });
    return controls.stop;
  }, [progress, score]);

  useEffect(() => {
    return offset.on("change", (v) => setDashOffset(v));
  }, [offset]);

  const scoreColor =
    score >= 80 ? "#4ade80" : score >= 55 ? "#fbbf24" : "#f87171";

  return (
    <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle
          cx="50"
          cy="50"
          r="44"
          fill="none"
          stroke="#1f1f26"
          strokeWidth="6"
        />
        <motion.circle
          cx="50"
          cy="50"
          r="44"
          fill="none"
          stroke={scoreColor}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <AnimatedScore value={score} />
      </div>
    </div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

export default function AnalysisResults({
  result,
  acceptedEdits,
  onToggleEdit,
  onRegenerate,
  isRegenerating,
}: AnalysisResultsProps) {
  const score = Math.max(0, Math.min(100, result?.overall_score ?? 0));
  const missingKeywords = result?.missing_keywords ?? [];
  const suggestedEdits = result?.suggested_edits ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="bg-[#111114] p-6 sm:p-7 lg:p-8 rounded-2xl border border-[#23232a]"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex items-center justify-between mb-7 pb-6 border-b border-[#23232a]"
      >
        <motion.div variants={itemVariants}>
          <h2 className="text-[15px] font-semibold text-[#f5f5f7] flex items-center gap-2 tracking-tight">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#241d0b] border border-amber-200">
              <Sparkles className="w-3.5 h-3.5 text-[#f5c95b]" />
            </span>
            AI Insights
          </h2>
          <p className="text-xs text-[#6f7480] mt-1.5">
            Based on the provided job description.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <div className="flex items-baseline gap-0.5">
              <span className="text-2xl sm:text-3xl font-bold text-[#f5f5f7] animate-number font-mono tracking-tight">
                <AnimatedScore value={score} />
              </span>
              <span className="text-sm text-[#6f7480] font-medium font-mono">
                /100
              </span>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6f7480] mt-1">
              Match Score
            </span>
          </div>
          <ScoreRing score={score} />
        </motion.div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-7"
      >
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-[13.5px] text-[#d1d5db] flex items-center gap-2 tracking-tight">
              <AlertTriangle className="w-4 h-4 text-[#f88585]" />
              Missing Keywords
            </h3>
            <span className="text-[10.5px] font-mono text-[#6f7480] bg-[#151519] px-2 py-0.5 rounded-md border border-[#23232a]">
              {missingKeywords.length}
            </span>
          </div>

          {missingKeywords.length === 0 ? (
            <div className="text-sm text-[#6f7480] bg-[#151519] rounded-xl border border-[#23232a] px-4 py-3">
              No critical keywords detected as missing.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {missingKeywords.map((kw: string, i: number) => (
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: 0.25 + i * 0.04,
                    duration: 0.3,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  whileHover={{ y: -1, scale: 1.03 }}
                  key={i}
                  className="bg-[#1a1113] text-[#ff9d9d] px-3 py-1.5 rounded-lg text-[12.5px] font-medium border border-[#3a2025]"
                >
                  {kw}
                </motion.span>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="font-semibold text-[13.5px] text-[#d1d5db] flex items-center gap-2 tracking-tight">
              <CheckSquare className="w-4 h-4 text-[#72e4a2]" />
              Suggested Improvements
            </h3>
            {acceptedEdits.length > 0 && (
              <span className="text-[10.5px] font-mono text-[#7a9bff] bg-[#12162a] px-2 py-0.5 rounded-md border border-[#2a3258]">
                {acceptedEdits.length} selected
              </span>
            )}
          </div>
          <p className="text-xs text-[#6f7480] mb-4">
            Select the enhancements you want applied to your resume.
          </p>

          {suggestedEdits.length === 0 ? (
            <div className="text-sm text-[#6f7480] bg-[#151519] rounded-xl border border-[#23232a] px-4 py-3">
              No specific edits suggested for this resume/job pair.
            </div>
          ) : (
            <div className="space-y-2.5">
              {suggestedEdits.map((edit: string, i: number) => {
                const isChecked = acceptedEdits.includes(edit);
                return (
                  <motion.label
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.35 + i * 0.07,
                      duration: 0.35,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    htmlFor={`edit-${i}`}
                    className={`group flex items-start gap-3.5 p-4 rounded-xl cursor-pointer border transition-all duration-200 ${
                      isChecked
                        ? "bg-[#11152a] border-[#3a4a86]"
                        : "bg-[#151519] border-[#23232a] hover:border-[#2f2f39] hover:bg-[#121216]"
                    }`}
                  >
                    <div className="relative flex-shrink-0 mt-0.5">
                      <input
                        id={`edit-${i}`}
                        type="checkbox"
                        className="peer sr-only"
                        checked={isChecked}
                        onChange={() => onToggleEdit(edit)}
                      />
                      <div
                        className={`w-4.5 h-4.5 rounded-[5px] border-2 flex items-center justify-center transition-all duration-200 ${
                          isChecked
                            ? "bg-[#5b8def] border-[#5b8def]"
                            : "bg-[#111114] border-[#3f434c] group-hover:border-[#565b66]"
                        }`}
                        style={{ width: "18px", height: "18px" }}
                      >
                        {isChecked && (
                          <motion.svg
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 22,
                            }}
                            viewBox="0 0 16 16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-3 h-3 text-white"
                          >
                            <polyline points="3,8.5 6.5,12 13,5" />
                          </motion.svg>
                        )}
                      </div>
                    </div>
                    <span
                      className={`text-[13.5px] leading-relaxed ${
                        isChecked ? "text-[#e0e4ef] font-medium" : "text-[#b8bdc9]"
                      }`}
                    >
                      {edit}
                    </span>
                  </motion.label>
                );
              })}
            </div>
          )}
        </motion.div>
      </motion.div>

      <motion.div variants={itemVariants} className="mt-7">
        <motion.button
          onClick={onRegenerate}
          disabled={isRegenerating || acceptedEdits.length === 0}
          whileHover={
            !isRegenerating && acceptedEdits.length > 0 ? { y: -1 } : {}
          }
          whileTap={
            !isRegenerating && acceptedEdits.length > 0 ? { scale: 0.985 } : {}
          }
          transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className={`w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl font-semibold text-[14.5px] transition-all duration-200 border ${
            isRegenerating || acceptedEdits.length === 0
              ? "bg-[#1a1a20] border-[#2a2a34] text-[#6f7480] cursor-not-allowed"
              : "bg-[#f5f5f7] border-transparent text-[#0a0a0b] hover:bg-[#111114] shadow-[0_1px_0_0_rgba(255,255,255,0.35)_inset,0_6px_20px_-10px_rgba(245,245,247,0.35)]"
          }`}
        >
          {isRegenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Rewriting Resume…
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              {acceptedEdits.length === 0
                ? "Select edits to apply"
                : acceptedEdits.length === 1
                ? "Apply 1 Edit & Regenerate"
                : `Apply ${acceptedEdits.length} Edits & Regenerate`}
            </>
          )}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
