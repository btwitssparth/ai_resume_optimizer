import { useEffect, useState } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, Target, ArrowRight, Clock, Plus, Briefcase } from "lucide-react";
import { getRecentHistory, getDashboardStats } from "../services/historyService";
import type { HistoryItem, DashboardStats } from "../services/mock/mockHistoryStore";

export default function Dashboard() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const [statsData, historyData] = await Promise.all([
          getDashboardStats(token),
          getRecentHistory(token, 4),
        ]);
        if (!cancelled) { setStats(statsData); setRecent(historyData); }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void fetchData();
    return () => { cancelled = true; };
  }, [getToken]);

  return (
    <div className="w-full py-2 sm:py-4">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#f5f5f7]">Welcome back, {user?.firstName || "Optimizer"}</h1>
          <p className="text-sm text-[#8a8f98] mt-1">Track your resume optimization activity.</p>
        </div>
        <Link to="/app/resume/analyzer" className="flex items-center justify-center gap-2 bg-[#5b8def] hover:bg-[#4f7df6] text-white font-medium py-2.5 px-4 rounded-lg shadow-sm transition-colors text-sm">
          <Plus className="w-4 h-4" /> New Analysis
        </Link>
      </motion.div>

      {error && (
        <div className="mb-6 rounded-lg border border-rose-200 bg-[#251216] px-4 py-3 text-sm text-[#fb858f]">
          We couldn't load your dashboard data. Please refresh and try again.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <StatCard title="Total Analyzed" value={loading ? null : stats?.totalAnalyzed} icon={<FileText className="w-5 h-5 text-[#6d95ff]" />} loading={loading} />
        <StatCard title="Average ATS Score" value={loading ? null : `${stats?.averageScore}%`} icon={<Target className="w-5 h-5 text-emerald-600" />} loading={loading} />
        
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 bg-[#111114] rounded-xl shadow-sm border border-[#23232a] overflow-hidden">
          <div className="px-6 py-5 border-b border-[#1f1f26] flex items-center justify-between">
            <h2 className="font-semibold text-[#f5f5f7] flex items-center gap-2"><Clock className="w-4 h-4 text-[#8a8f98]" /> Recent Analyses</h2>
            <Link to="/app/history" className="text-sm font-medium text-[#6d95ff] hover:text-[#8aaaff] flex items-center gap-1">View All <ArrowRight className="w-4 h-4" /></Link>
          </div>
          <div className="divide-y divide-slate-100">
            {loading ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-6 flex items-center justify-between">
                <div className="space-y-2"><div className="h-5 w-48 bg-[#1a1a20] rounded animate-pulse" /><div className="h-4 w-32 bg-[#151519] rounded animate-pulse" /></div>
                <div className="h-8 w-16 bg-[#1a1a20] rounded-full animate-pulse" />
              </div>
            )) : recent.length ? recent.map(item => (
              <div key={item.id} className="p-6 flex items-center justify-between hover:bg-[#151519] transition-colors">
                <div className="flex items-start gap-4">
                  <div className="bg-[#1a1a20] p-2 rounded-lg mt-0.5"><Briefcase className="w-5 h-5 text-[#8a8f98]" /></div>
                  <div><h3 className="font-medium text-[#f5f5f7]">{item.jobTitle}</h3><p className="text-sm text-[#8a8f98] mt-0.5">{item.company} • {new Date(item.date).toLocaleDateString()}</p></div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${item.score >= 80 ? "bg-[#102219] text-[#6ee7a0]" : item.score >= 60 ? "bg-[#241d0b] text-[#f6c85f]" : "bg-[#251216] text-[#fb858f]"}`}>{item.score}/100</span>
              </div>
            )) : (
              <div className="p-12 text-center text-[#8a8f98]"><FileText className="w-10 h-10 mx-auto text-[#454a55] mb-3" /><p>No resumes analyzed yet.</p><Link to="/app/resume/analyzer" className="text-[#6d95ff] font-medium text-sm hover:underline mt-2 inline-block">Start your first analysis</Link></div>
            )}
          </div>
        </section>

        <aside className="space-y-6">
          <div className="bg-indigo-900 rounded-xl shadow-sm border border-indigo-800 p-6 text-white">
            <h2 className="font-semibold text-lg mb-2">Improve your match score</h2>
            <p className="text-indigo-200 text-sm mb-6 leading-relaxed">Compare your resume with a target role and make evidence-based improvements.</p>
            <Link to="/app/resume/analyzer" className="bg-[#111114] text-indigo-900 hover:bg-[#17192a] font-medium py-2.5 px-4 rounded-lg transition-colors text-sm w-full flex justify-center items-center gap-2">Analyze a Resume <ArrowRight className="w-4 h-4" /></Link>
          </div>
          <div className="bg-[#111114] rounded-xl shadow-sm border border-[#23232a] p-6">
            <h2 className="font-semibold text-[#f5f5f7] mb-4">Quick Links</h2>
            <div className="space-y-2">
              <QuickLink to="/app/resume/builder" icon={<FileText className="w-4 h-4" />} text="Resume Builder" />
              <QuickLink to="/app/settings" icon={<Target className="w-4 h-4" />} text="Settings" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, loading }: { title: string; value: string | number | null | undefined; icon: React.ReactNode; loading: boolean }) {
  return <motion.div className="bg-[#111114] p-6 rounded-xl shadow-sm border border-[#23232a]">
    <div className="flex justify-between items-start mb-4"><h3 className="text-sm font-medium text-[#8a8f98]">{title}</h3><div className="p-2 bg-[#151519] rounded-lg border border-[#1f1f26]">{icon}</div></div>
    {loading ? <div className="h-8 w-16 bg-[#1a1a20] rounded animate-pulse mt-1" /> : <p className="text-3xl font-bold text-[#f5f5f7]">{value}</p>}
  </motion.div>;
}

function QuickLink({ to, icon, text }: { to: string; icon: React.ReactNode; text: string }) {
  return <Link to={to} className="flex items-center justify-between p-3 rounded-lg hover:bg-[#151519] transition-colors text-[#b8bdc9] hover:text-[#6d95ff] group">
    <div className="flex items-center gap-3 text-sm font-medium"><span className="text-[#6f7480] group-hover:text-[#6d95ff]">{icon}</span>{text}</div><ArrowRight className="w-4 h-4 text-[#454a55] group-hover:text-indigo-500" />
  </Link>;
}
