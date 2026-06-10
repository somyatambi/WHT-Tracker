export interface Habit {
  id: string;          // uuid
  name: string;
  order: number;
  createdAt: string;   // ISO date
}

export interface HabitLog {
  habitId: string;
  date: string;        // YYYY-MM-DD
  completed: boolean;
}

export interface Task {
  id: string;          // uuid
  dayDate: string;     // YYYY-MM-DD (which day this task belongs to)
  weekId: string;      // "YYYY-WW" format (ISO week number)
  text: string;
  completed: boolean;
  order: number;
  createdAt: string;
}

export interface WeekNote {
  weekId: string;      // "YYYY-WW"
  content: string;
  updatedAt: string;
}

export interface AppSettings {
  weekStartDay: 'sunday' | 'monday';
  darkMode: boolean;
  reminderEnabled: boolean;
  reminderTime: string; // "HH:MM"
}

export type StorageKeys = 
  | 'momentum_habits'
  | 'momentum_habit_logs'
  | 'momentum_tasks'
  | 'momentum_week_notes'
  | 'momentum_settings';

export interface ChartDataPoint {
  name: string;
  done: number;
  remaining: number;
}

export interface DonutDataPoint {
  name: string;
  value: number;
}
