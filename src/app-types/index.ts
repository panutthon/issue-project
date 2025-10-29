export type IssueStatus = "pending" | "in progress" | "solved" | "archived";
export type IssuePriority = "low" | "medium" | "high";

export interface Issue {
  id: string;
  topic: string;
  status: IssueStatus;
  solution: string;
  priority: IssuePriority;
  assignee: string;
  note: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  client: string;
  issues: Issue[];
}

export interface AppData {
  meetings: Meeting[];
}

export interface DashboardStats {
  totalMeetings: number;
  totalIssues: number;
  pendingIssues: number;
  inProgressIssues: number;
  solvedIssues: number;
  archivedIssues: number;
}

export interface QuickNote {
  id: string;
  content: string;
  createdAt: string;
  title?: string;
}
