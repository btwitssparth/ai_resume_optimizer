import { useState, useRef } from "react";
import { Upload, FileText, Briefcase, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface UploadFormProps {
  onAnalyze: (file: File, jobDescription: string, jobTitle: string, company: string) => Promise<void>;
  loading: boolean;
}
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function UploadForm({ onAnalyze, loading }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectFile = (candidate: File | undefined) => {
    if (!candidate) return;
    if (candidate.type !== "application/pdf" && !candidate.name.toLowerCase().endsWith(".pdf")) {
      setFile(null); setFileError("Please select a PDF resume."); return;
    }
    if (candidate.size > MAX_FILE_SIZE) {
      setFile(null); setFileError("Resume must be 5MB or smaller."); return;
    }
    setFileError(""); setFile(candidate);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    selectFile(e.dataTransfer.files?.[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !jobDescription.trim() || !jobTitle.trim() || loading) return;
    await onAnalyze(file, jobDescription.trim(), jobTitle.trim(), company.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#111114] p-6 rounded-xl shadow-sm border border-[#23232a]">
      <div className="mb-6">
        <label className="block text-sm font-medium text-[#d1d5db] mb-2" htmlFor="resume-file">Upload Resume (PDF)</label>
        <div className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragActive ? "border-[#282c44]0 bg-[#17192a]" : "border-slate-300 bg-[#151519] hover:bg-[#1a1a20]"}`} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
          <input id="resume-file" ref={fileInputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={e => selectFile(e.target.files?.[0])} />
          <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full cursor-pointer">
            <Upload className={`w-8 h-8 mx-auto mb-3 ${dragActive ? "text-[#6d95ff]" : "text-[#6f7480]"}`} />
            {file ? <span className="text-sm font-medium text-[#6d95ff] bg-[#17192a] py-1 px-3 rounded-full inline-flex items-center gap-2 max-w-full"><FileText className="w-4 h-4 flex-shrink-0" /><span className="truncate">{file.name}</span></span> : <><p className="text-sm font-medium text-[#d1d5db]">Click to upload or drag and drop</p><p className="text-xs text-[#8a8f98] mt-1">PDF up to 5MB</p></>}
          </button>
        </div>
        {fileError && <p className="mt-2 text-xs text-rose-600 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{fileError}</p>}
      </div>
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1"><label className="block text-sm font-medium text-[#d1d5db] mb-2" htmlFor="job-title">Job Title *</label><input id="job-title" type="text" maxLength={200} value={jobTitle} onChange={e => setJobTitle(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-[#23232a] bg-[#151519] focus:bg-[#111114] focus:ring-2 focus:ring-indigo-500 outline-none text-sm" placeholder="e.g. Senior Frontend Engineer" /></div>
        <div className="flex-1"><label className="block text-sm font-medium text-[#d1d5db] mb-2" htmlFor="company">Company</label><input id="company" type="text" maxLength={200} value={company} onChange={e => setCompany(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[#23232a] bg-[#151519] focus:bg-[#111114] focus:ring-2 focus:ring-indigo-500 outline-none text-sm" placeholder="e.g. Google" /></div>
      </div>
      <div className="mb-6">
        <label className="block text-sm font-medium text-[#d1d5db] mb-2 flex items-center gap-2" htmlFor="job-description"><Briefcase className="w-4 h-4 text-[#6f7480]" /> Target Job Description *</label>
        <textarea id="job-description" value={jobDescription} onChange={e => setJobDescription(e.target.value)} maxLength={30000} required className="w-full h-32 px-4 py-3 rounded-xl border border-[#23232a] bg-[#151519] focus:bg-[#111114] focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm custom-scrollbar" placeholder="Paste the full job description here..." />
      </div>
      <button type="submit" disabled={!file || !jobDescription.trim() || !jobTitle.trim() || loading} className="w-full bg-[#5b8def] hover:bg-[#4f7df6] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl shadow-sm transition-colors flex justify-center items-center gap-2">
        {loading ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> : "Analyze Resume"}
      </button>
    </form>
  );
}
