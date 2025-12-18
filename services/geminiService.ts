import { GoogleGenAI } from "@google/genai";
import { Task, Goal, StudySession } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  analyzeSchedule: async (tasks: Task[], goals: Goal[], sessions: StudySession[]) => {
    try {
      const prompt = `
        Act as a strict but encouraging academic study coach.
        
        Here is the student's current data:
        Tasks: ${JSON.stringify(tasks.map(t => ({ title: t.title, start: t.start, completed: t.completed })))}
        Goals: ${JSON.stringify(goals)}
        Recent Sessions: ${JSON.stringify(sessions.slice(-5))}

        Please provide a concise analysis in JSON format with the following keys:
        - "analysis": A short paragraph analyzing productivity.
        - "suggestions": An array of 3 specific, actionable bullet points to improve the schedule or habits.
        - "quote": A short motivational quote suitable for a student.

        Do not use markdown code blocks. Just return the raw JSON string.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      return JSON.parse(response.text || '{}');
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  },

  optimizeTime: async (tasks: Task[]) => {
     // Placeholder for more advanced feature: Suggesting rescheduling
     return "Feature coming soon: AI schedule re-balancing.";
  }
};