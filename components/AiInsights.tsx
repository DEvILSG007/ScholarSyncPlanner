import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { Task, Goal, StudySession } from '../types';
import { Sparkles, Loader2, Quote, Lightbulb } from 'lucide-react';

interface AiInsightsProps {
  tasks: Task[];
  goals: Goal[];
  sessions: StudySession[];
}

interface AnalysisResult {
  analysis: string;
  suggestions: string[];
  quote: string;
}

const AiInsights: React.FC<AiInsightsProps> = ({ tasks, goals, sessions }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const data = await geminiService.analyzeSchedule(tasks, goals, sessions);
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch insights. Check your API key or connectivity.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col items-center overflow-auto animate-fade-in">
      <div className="w-full max-w-3xl space-y-6">
        
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-8 shadow-lg text-white">
          <div className="flex items-start justify-between">
            <div>
                <h2 className="text-3xl font-bold mb-2 flex items-center">
                    <Sparkles className="mr-3 text-yellow-300" /> 
                    AI Study Coach
                </h2>
                <p className="text-indigo-100 max-w-xl">
                    Get personalized feedback on your schedule, identify productivity gaps, and receive motivation to keep going.
                </p>
            </div>
            <button 
                onClick={handleAnalyze}
                disabled={loading}
                className="bg-white text-indigo-700 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-md disabled:opacity-70 flex items-center"
            >
                {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                {loading ? 'Analyzing...' : 'Generate Insights'}
            </button>
          </div>
        </div>

        {result && (
            <div className="space-y-6 animate-slide-up">
                {/* Quote Card */}
                <div className="bg-slate-800 border-l-4 border-yellow-400 p-6 rounded-r-xl shadow-md">
                    <div className="flex items-start">
                        <Quote className="text-yellow-400 mr-4 flex-shrink-0" size={32} />
                        <div>
                            <p className="text-xl font-serif italic text-slate-200">"{result.quote}"</p>
                        </div>
                    </div>
                </div>

                {/* Analysis Main */}
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm">
                    <h3 className="text-lg font-semibold text-white mb-3">Productivity Analysis</h3>
                    <p className="text-slate-300 leading-relaxed">
                        {result.analysis}
                    </p>
                </div>

                {/* Suggestions */}
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <Lightbulb className="mr-2 text-emerald-400" size={20}/>
                        Actionable Suggestions
                    </h3>
                    <ul className="space-y-3">
                        {result.suggestions.map((suggestion, idx) => (
                            <li key={idx} className="flex items-start bg-slate-900/50 p-3 rounded-lg">
                                <span className="bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded text-sm mr-3 mt-0.5">{idx + 1}</span>
                                <span className="text-slate-300">{suggestion}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default AiInsights;