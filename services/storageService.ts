import { Task, StudySession, Goal, Subject } from '../types';
import { MOCK_TASKS, SUBJECTS, MOCK_GOALS } from '../constants';

const KEYS = {
  TASKS: 'scholarsync_tasks',
  SESSIONS: 'scholarsync_sessions',
  GOALS: 'scholarsync_goals',
  SUBJECTS: 'scholarsync_subjects',
};

export const storageService = {
  getTasks: (): Task[] => {
    const data = localStorage.getItem(KEYS.TASKS);
    return data ? JSON.parse(data) : MOCK_TASKS;
  },

  saveTasks: (tasks: Task[]) => {
    localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
  },

  getSessions: (): StudySession[] => {
    const data = localStorage.getItem(KEYS.SESSIONS);
    return data ? JSON.parse(data) : [];
  },

  saveSession: (session: StudySession) => {
    const sessions = storageService.getSessions();
    sessions.push(session);
    localStorage.setItem(KEYS.SESSIONS, JSON.stringify(sessions));
    
    // Also update goal progress
    const goals = storageService.getGoals();
    const updatedGoals = goals.map(g => ({
        ...g,
        currentMinutes: g.currentMinutes + session.durationMinutes
    }));
    storageService.saveGoals(updatedGoals);
  },

  getGoals: (): Goal[] => {
    const data = localStorage.getItem(KEYS.GOALS);
    return data ? JSON.parse(data) : MOCK_GOALS;
  },

  saveGoals: (goals: Goal[]) => {
    localStorage.setItem(KEYS.GOALS, JSON.stringify(goals));
  },

  getSubjects: (): Subject[] => {
    const data = localStorage.getItem(KEYS.SUBJECTS);
    return data ? JSON.parse(data) : SUBJECTS;
  }
};