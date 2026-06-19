export interface Project {
  id?: string;
  user_id?: string;
  name: string;
  icon: string;
  color: string;
  archived?: boolean;
  open_tasks_count?: number;
  focus_seconds_total?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectPayload {
  name: string;
  icon: string;
  color: string;
  archived?: boolean;
}

export interface UnassignedSummary {
  open_count: number;
}
