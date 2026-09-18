import { SignInButton } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Target, FileCheck, Zap } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

const features = [
  {
    icon: Target,
    title: "ATS Keyword Gap Analysis",
    description: "Pinpoint exactly which keywords your resume is missing against any target job description.",
  },
  {
    icon: FileCheck,
    title: "Precision Rewriting",
    description: "Select and apply AI-generated improvements tailored to match the role requirements.",
  },
  {
    icon: Zap,
    title: "Instant Optimized PDF",
    description: "Generate a cleaner, ATS-friendly version of your resume from the improvements you select.",
  },
];

export default function LandingPage() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col items-center justify-center mt-8 sm:mt-14 lg:mt-20"
    >
      <motion.div
        variants={itemVariants}
        className="bg-[#141416] p-7 sm:p-10 lg:p-14 rounded-3xl border border-[#23232a] text-center max-w-3xl mx-auto relative overflow-hidden"
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #f5f5f7 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative">
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#17192a] text-[#7a9bff] text-xs font-medium border border-[#282c44] mb-7"
          >
            <Sparkles className="w-3.5 h-3.5" /> Powered by Gemini AI
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-[#f5f5f7] tracking-tight text-balance leading-[1.1]"
          >
            Optimize Your Resume for the
            <span className="text-[#5b8def]"> Modern ATS</span>
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg text-[#8a8f98] mb-10 leading-relaxed max-w-xl mx-auto text-balance"
          >
            Sign in to securely analyze your resume against target job descriptions,
            discover missing keywords, and automatically rewrite your experience
            to present your experience more clearly and align it with the role.
          </motion.p>

          <motion.div variants={itemVariants}>
            <SignInButton mode="modal">
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="group flex items-center gap-2 mx-auto bg-[#5b8def] hover:bg-[#4f7df6] text-white font-semibold py-3.5 px-7 sm:py-4 sm:px-8 rounded-xl transition-colors shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset,0_4px_14px_-4px_rgba(91,141,239,0.4)]"
              >
                Get Started Securely
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </motion.button>
            </SignInButton>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mt-10 sm:mt-14 w-full max-w-4xl mx-auto"
      >
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            variants={itemVariants}
            custom={i}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="bg-[#101013] p-5 sm:p-6 rounded-2xl border border-[#1f1f26] transition-colors duration-200 hover:border-[#2a2a34]"
          >
            <div className="bg-[#17192a] w-10 h-10 rounded-lg flex items-center justify-center mb-4 border border-[#282c44]">
              <feature.icon className="w-5 h-5 text-[#5b8def]" strokeWidth={2} />
            </div>
            <h3 className="text-[15px] font-semibold text-[#f5f5f7] mb-1.5 tracking-tight">
              {feature.title}
            </h3>
            <p className="text-sm text-[#7a7f88] leading-relaxed">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
