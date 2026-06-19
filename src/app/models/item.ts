export interface Item {
  id?: string;
  user_id?: string;
  description?: string;
  type?: string;
  where?: string;
  scheduled_date?: string | null;
  carried_from?: string | null;
  obs?: string;
  started: boolean;
  finished: boolean;
  important: boolean;
  canceled: boolean;
  focus_seconds_total?: number;
  estimated_pomodoros?: number;
  pomodoros_completed?: number;
  task_focus_progress?: number;
  is_overdue?: boolean;
}
