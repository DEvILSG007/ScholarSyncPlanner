import { Subject, Task, Priority, Goal } from './types';

export const SUBJECTS: Subject[] = [
  { id: 'sub-1', name: 'Mathematics', color: '#3b82f6' }, // Blue
  { id: 'sub-2', name: 'Physics', color: '#ef4444' },     // Red
  { id: 'sub-3', name: 'History', color: '#eab308' },     // Yellow
  { id: 'sub-4', name: 'Computer Sci', color: '#10b981' }, // Emerald
  { id: 'sub-5', name: 'Literature', color: '#a855f7' },   // Purple
];

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

export const MOCK_TASKS: Task[] = [
  {
    id: 't-1',
    title: 'Calculus Review',
    subjectId: 'sub-1',
    start: new Date(today.setHours(9, 0, 0, 0)).toISOString(),
    end: new Date(today.setHours(10, 30, 0, 0)).toISOString(),
    completed: false,
    priority: Priority.High,
  },
  {
    id: 't-2',
    title: 'History Essay Draft',
    subjectId: 'sub-3',
    start: new Date(today.setHours(13, 0, 0, 0)).toISOString(),
    end: new Date(today.setHours(15, 0, 0, 0)).toISOString(),
    completed: true,
    priority: Priority.Medium,
  },
  {
    id: 't-3',
    title: 'React Components Lab',
    subjectId: 'sub-4',
    start: new Date(tomorrow.setHours(10, 0, 0, 0)).toISOString(),
    end: new Date(tomorrow.setHours(12, 0, 0, 0)).toISOString(),
    completed: false,
    priority: Priority.High,
  },
];

export const MOCK_GOALS: Goal[] = [
  { id: 'g-1', title: 'Daily Study Time', targetMinutes: 240, currentMinutes: 120, period: 'daily' },
  { id: 'g-2', title: 'Finish Math Module', targetMinutes: 300, currentMinutes: 250, period: 'weekly' },
];