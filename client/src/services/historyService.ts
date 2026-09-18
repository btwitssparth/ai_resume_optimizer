import { listScans, type DashboardStatsDTO } from "./api";
import type { HistoryItem } from "./mock/mockHistoryStore";

export const getRecentHistory = async (token: string, limit = 3): Promise<HistoryItem[]> => {
  const scans = await listScans(token);
  return scans.slice(0, limit).map(scan => ({
    id: scan.id.toString(),
    jobTitle: scan.job_title || "Unknown Role",
    company: scan.company || "Unknown Company",
    date: scan.created_at,
    score: scan.overall_score,
    status: scan.overall_score >= 80 ? "Optimized" : "Analyzed",
  }));
};

export const getDashboardStats = async (token: string): Promise<DashboardStatsDTO> => {
  const scans = await listScans(token);
  const totalAnalyzed = scans.length;
  const averageScore = totalAnalyzed
    ? Math.round(scans.reduce((sum, scan) => sum + scan.overall_score, 0) / totalAnalyzed)
    : 0;
  return { totalAnalyzed, averageScore, interviewsLanded: 0 };
};
