export interface SoundLayer {
  id: string;
  volume: number;
  /** For intermittent (oneshot) sounds: 0 = rare, 1 = frequent. */
  density?: number;
}

export interface FocusSettings {
  id?: string;
  user_id?: string;
  work_minutes: number;
  short_break_minutes: number;
  long_break_minutes: number;
  long_break_interval: number;
  ambient_sound?: string;
  sound_volume?: number;
  ambient_mix: SoundLayer[];
  background_id: string;
  auto_start_breaks: boolean;
  auto_start_focus: boolean;
  notify_on_complete: boolean;
}

export type FocusSettingsUpdate = Partial<
  Omit<FocusSettings, 'id' | 'user_id'>
>;

export interface PomodoroSession {
  id: string;
  user_id: string;
  item_id: string;
  status: 'running' | 'paused' | 'completed' | 'abandoned';
  target_seconds: number;
  elapsed_seconds: number;
  credited_seconds: number;
  started_at: string;
  paused_at: string | null;
  ended_at: string | null;
  cycle_progress: number;
  item_focus_seconds_total: number;
  item_estimated_pomodoros: number;
  item_pomodoros_completed: number;
}

export interface PomodoroSessionList {
  sessions: PomodoroSession[];
}

export interface PomodoroSessionStart {
  item_id: string;
}

export interface PomodoroSessionSync {
  elapsed_seconds: number;
}

export interface PomodoroSessionAbandon {
  elapsed_seconds: number;
  credit_partial: boolean;
}
