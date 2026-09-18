import { SignIn } from "@clerk/clerk-react";
import { FileText, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full bg-[#09090b] text-[#f5f5f7] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl grid lg:grid-cols-[1fr_420px] gap-10 items-center">
        <section className="hidden lg:block">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-[#5b8def] p-2.5 rounded-xl">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">ATS Optimizer</h1>
              <p className="text-xs text-[#6f7480]">Resume Intelligence</p>
            </div>
          </div>
          <h2 className="text-5xl font-bold tracking-tight leading-[1.08] max-w-xl">
            Build a resume that gets through the ATS.
          </h2>
          <p className="mt-5 text-lg text-[#8a8f98] max-w-xl leading-relaxed">
            Analyze your resume against a job description, identify keyword gaps,
            improve your content, and build an ATS-friendly PDF.
          </p>
          <div className="mt-8 flex items-center gap-2 text-sm text-[#8a8f98]">
            <ShieldCheck className="w-4 h-4 text-[#5b8def]" />
            Your resumes are tied to your account and stored securely.
          </div>
        </section>

        <section className="w-full">
          <div className="mb-5 lg:hidden text-center">
            <div className="inline-flex items-center gap-2">
              <div className="bg-[#5b8def] p-2 rounded-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold">ATS Optimizer</span>
            </div>
          </div>
          <div className="rounded-2xl border border-[#23232a] bg-[#111114] p-3 sm:p-4 shadow-2xl">
            <SignIn routing="hash" />
          </div>
        </section>
      </div>
    </main>
  );
}
