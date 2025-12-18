export enum Priority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
}

export type RecurrenceType = 'none' | 'daily' | 'weekly';

export interface RecurrenceRule {
  type: RecurrenceType;
  daysOfWeek?: number[]; // 0 = Sunday, 1 = Monday, etc.
  endDate?: string;      // ISO String for when recurrence stops
}

export interface Subject {
  id: string;
  userId?: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  userId?: string;
  title: string;
  subjectId: string;
  start: string; // ISO String of the FIRST occurrence
  end: string;   // ISO String of the FIRST occurrence
  completed: boolean;
  priority: Priority;
  notes?: string;
  recurrence?: RecurrenceRule;
}

export interface StudySession {
  id: string;
  taskId: string | null;
  subjectId: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  userId?: string;
}

export interface Goal {
  id: string;
  userId?: string;
  title: string;
  targetMinutes: number;
  currentMinutes: number;
  period: 'daily' | 'weekly';
}

export type ViewState = 'dashboard' | 'calendar' | 'focus' | 'insights';