import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useToast } from "../contexts/ToastContext";
import { analyzeResume, regenerateResume } from "../services/api";

export function useResumeOptimizer() {
  const { getToken } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<typeof analyzeResume>> | null>(null);
  const [acceptedEdits, setAcceptedEdits] = useState<string[]>([]);
  const [regeneratedText, setRegeneratedText] = useState<string | null>(null);

  const handleAnalyze = async (file: File, jobDescription: string, jobTitle: string, company: string) => {
    setLoading(true); setResult(null); setRegeneratedText(null); setAcceptedEdits([]);
    try {
      const token = await getToken();
      if (!token) throw new Error("Authentication required.");
      setResult(await analyzeResume(file, jobDescription, jobTitle, company, token));
      addToast("Resume analyzed successfully.", "success");
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Analysis failed.", "error");
    } finally { setLoading(false); }
  };

  const toggleEdit = (edit: string) => setAcceptedEdits(prev => prev.includes(edit) ? prev.filter(e => e !== edit) : [...prev, edit]);

  const handleRegenerate = async () => {
    if (!result || acceptedEdits.length === 0) return;
    setIsRegenerating(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("Authentication required.");
      const response = await regenerateResume(result.resume_id, acceptedEdits, token);
      setRegeneratedText(response.updated_resume_text);
      addToast("Your optimized resume is ready.", "success");
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Regeneration failed.", "error");
    } finally { setIsRegenerating(false); }
  };

  return { result, loading, acceptedEdits, isRegenerating, regeneratedText, handleAnalyze, handleRegenerate,
    toggleEdit, resetRegeneration: () => setRegeneratedText(null) };
}
