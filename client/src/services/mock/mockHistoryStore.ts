// client/src/services/mock/mockHistoryStore.ts

export interface HistoryItem {
  id: string;
  jobTitle: string;
  company: string;
  date: string;
  score: number;
  status: 'Optimized' | 'Analyzed' | 'Draft';
}

export interface DashboardStats {
  totalAnalyzed: number;
  averageScore: number;
  interviewsLanded: number;
}

// Isolated mock data - easily replaced by an API call later
export const mockHistory: HistoryItem[] = [
  { id: '1', jobTitle: 'Senior Frontend Engineer', company: 'TechCorp', date: '2023-10-24', score: 85, status: 'Optimized' },
  { id: '2', jobTitle: 'Fullstack Developer', company: 'StartupInc', date: '2023-10-22', score: 72, status: 'Analyzed' },
  { id: '3', jobTitle: 'React Developer', company: 'AgencyX', date: '2023-10-15', score: 91, status: 'Optimized' },
];

export const mockStats: DashboardStats = {
  totalAnalyzed: 12,
  averageScore: 78,
  interviewsLanded: 3,
};