import { motion } from "framer-motion";
import { FileSearch } from "lucide-react";
import UploadForm from "../components/UploadForm";
import AnalysisResults from "../components/AnalysisResults";
import RegeneratedResume from "../components/RegeneratedResume";
import { useResumeOptimizer } from "../hooks/useResumeOptimizer";

export default function Analyzer() {
  const { 
    result, loading, acceptedEdits, isRegenerating, regeneratedText, 
    handleAnalyze, handleRegenerate, toggleEdit, resetRegeneration 
  } = useResumeOptimizer();

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#f5f5f7]">Resume Analyzer</h2>
        <p className="text-sm text-[#8a8f98] mt-1">Upload your resume and target job description to generate AI-driven insights and optimizations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-12">
        <div className="lg:col-span-5 relative">
          <div className="sticky top-24">
            <UploadForm onAnalyze={handleAnalyze} loading={loading} />
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          {result && !regeneratedText && (
            <AnalysisResults 
              result={result} 
              acceptedEdits={acceptedEdits} 
              onToggleEdit={toggleEdit} 
              onRegenerate={handleRegenerate} 
              isRegenerating={isRegenerating} 
            />
          )}

          {regeneratedText && (
            <RegeneratedResume 
              resumeText={regeneratedText} 
              onReset={resetRegeneration} 
            />
          )}

          {!result && !loading && !regeneratedText && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-[#111114] border border-[#23232a] rounded-xl h-[500px] flex flex-col items-center justify-center text-[#6f7480] p-8 text-center shadow-sm"
            >
              <div className="bg-[#151519] p-4 rounded-full mb-4 border border-[#1f1f26]">
                <FileSearch className="w-8 h-8 text-[#6f7480]" />
              </div>
              <h3 className="text-lg font-medium text-[#f5f5f7] mb-1">Awaiting Documents</h3>
              <p className="text-sm text-[#8a8f98] max-w-sm">Submit your resume and target job description on the left to begin the optimization process.</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}