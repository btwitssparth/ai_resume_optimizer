import { motion } from "framer-motion";
import { Download, RefreshCw, CheckCircle2, FileText } from "lucide-react";
import { jsPDF } from "jspdf";

interface RegeneratedResumeProps {
  resumeText: string;
  onReset: () => void;
}

export default function RegeneratedResume({
  resumeText,
  onReset,
}: RegeneratedResumeProps) {
  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    const margin = 15;
    const pdfWidth = doc.internal.pageSize.getWidth();
    const pdfHeight = doc.internal.pageSize.getHeight();
    const maxTextWidth = pdfWidth - margin * 2;

    const textLines = doc.splitTextToSize(resumeText, maxTextWidth);

    let cursorY = margin;
    const lineHeight = 6;

    textLines.forEach((line: string) => {
      if (cursorY + lineHeight > pdfHeight - margin) {
        doc.addPage();
        cursorY = margin;
      }
      doc.text(line, margin, cursorY);
      cursorY += lineHeight;
    });

    doc.save("Optimized_Resume.pdf");
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 24,
        mass: 0.9,
      }}
      className="bg-[#111114] p-6 sm:p-7 lg:p-8 rounded-2xl border border-[#2d4a86] relative overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute top-0 left-0 right-0 h-0.5 bg-[#5b8def]"
      />

      <div className="flex items-center gap-3.5 mb-6">
        <motion.div
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 18,
            delay: 0.1,
          }}
          className="flex-shrink-0 bg-[#13223d] w-12 h-12 rounded-xl border border-[#2a3f72] flex items-center justify-center"
        >
          <CheckCircle2 className="w-6 h-6 text-[#6d95ff]" strokeWidth={2} />
        </motion.div>
        <div className="flex-1 min-w-0">
          <motion.h2
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.08 }}
            className="text-[15.5px] font-semibold text-[#f5f5f7] tracking-tight"
          >
            Optimization Complete
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            className="text-xs text-[#8a8f98] mt-0.5"
          >
            Your tailored resume is ready for download.
          </motion.p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mb-6 border border-[#23232a] rounded-xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#151519] border-b border-[#23232a]">
          <div className="flex items-center gap-2 text-xs text-[#6f7480]">
            <FileText className="w-3.5 h-3.5" />
            <span className="font-medium">Optimized_Resume.pdf</span>
          </div>
          <span className="text-[10.5px] font-mono text-[#6f7480]">
            PREVIEW
          </span>
        </div>
        <div
          className="bg-[#0d0d10] p-5 sm:p-6 h-[360px] sm:h-96 overflow-y-auto custom-scrollbar"
          style={{
            backgroundImage:
              "linear-gradient(#101013 1px, transparent 1px), linear-gradient(90deg, #101013 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            backgroundPosition: "-1px -1px",
          }}
        >
          <div className="bg-[#111114] border border-[#23232a] rounded-lg p-5 sm:p-6 min-h-full">
            <pre className="text-[13px] text-[#c5c9d1] whitespace-pre-wrap font-sans leading-[1.8] tracking-[-0.005em]">
              {resumeText}
            </pre>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.985 }}
          transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
          onClick={handleDownloadPDF}
          className="flex-1 flex justify-center items-center gap-2 bg-[#5b8def] hover:bg-[#5b8def] text-white font-semibold text-[14px] py-3.5 px-4 rounded-xl transition-colors shadow-[0_1px_0_0_rgba(255,255,255,0.08)_inset,0_6px_20px_-8px_rgba(91,141,239,0.55)]"
        >
          <Download className="w-4 h-4" /> Download PDF
        </motion.button>
        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.985 }}
          transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
          onClick={onReset}
          className="flex-1 flex justify-center items-center gap-2 bg-[#151519] border border-[#23232a] hover:bg-[#111114] hover:border-[#2f2f39] text-[#d1d5db] font-semibold text-[14px] py-3.5 px-4 rounded-xl transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Start Over
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
