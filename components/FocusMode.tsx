import React, { useState, useEffect, useCallback } from 'react';
import { Subject, StudySession } from '../types';
import { Play, Pause, RotateCcw, Save } from 'lucide-react';

interface FocusModeProps {
  subjects: Subject[];
  onSaveSession: (session: StudySession) => void;
}

const FocusMode: React.FC<FocusModeProps> = ({ subjects, onSaveSession }) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'study' | 'break'>('study');
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes default
  const [sessionStartTime, setSessionStartTime] = useState<string | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = useCallback(() => {
    if (!isActive && mode === 'study' && !sessionStartTime) {
        setSessionStartTime(new Date().toISOString());
    }
    setIsActive(!isActive);
  }, [isActive, mode, sessionStartTime]);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'study' ? 25 * 60 : 5 * 60);
    setSessionStartTime(null);
  };

  const switchMode = (newMode: 'study' | 'break') => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(newMode === 'study' ? 25 * 60 : 5 * 60);
    setSessionStartTime(null);
  };

  useEffect(() => {
    let interval: any;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Play sound?
      if (mode === 'study' && sessionStartTime) {
          // Auto save or prompt? Let's auto-save for simplicity in this demo
          handleSaveSession();
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, sessionStartTime]);

  const handleSaveSession = () => {
     if (!sessionStartTime) return;
     
     const endTime = new Date().toISOString();
     const duration = 25; // Assuming full Pomodoro for this simplistic logic, or calculate elapsed.
     
     // In a real app, calculate actual elapsed time if stopped early.
     // For this demo, if they click save manually or timer ends:
     
     const newSession: StudySession = {
         id: crypto.randomUUID(),
         subjectId: selectedSubjectId,
         taskId: null, // Generic focus session
         startTime: sessionStartTime,
         endTime: endTime,
         durationMinutes: duration
     };
     
     onSaveSession(newSession);
     alert("Session saved! Great job.");
     setSessionStartTime(null);
  };

  const progress = mode === 'study' 
    ? ((25 * 60 - timeLeft) / (25 * 60)) * 100 
    : ((5 * 60 - timeLeft) / (5 * 60)) * 100;

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 animate-fade-in">
      <div className="max-w-md w-full bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-xl text-center">
        
        {/* Mode Toggles */}
        <div className="flex justify-center space-x-4 mb-8">
            <button 
                onClick={() => switchMode('study')}
                className={`px-4 py-2 rounded-full font-medium transition-all ${mode === 'study' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-700 text-slate-400'}`}
            >
                Focus
            </button>
            <button 
                onClick={() => switchMode('break')}
                className={`px-4 py-2 rounded-full font-medium transition-all ${mode === 'break' ? 'bg-green-600 text-white shadow-lg shadow-green-500/30' : 'bg-slate-700 text-slate-400'}`}
            >
                Break
            </button>
        </div>

        {/* Timer Display */}
        <div className="relative w-64 h-64 mx-auto mb-8 flex items-center justify-center">
             {/* Circular Progress Ring (SVG) */}
             <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90">
                <circle cx="128" cy="128" r="120" stroke="#1e293b" strokeWidth="8" fill="none" />
                <circle 
                    cx="128" cy="128" r="120" 
                    stroke={mode === 'study' ? '#3b82f6' : '#10b981'} 
                    strokeWidth="8" 
                    fill="none" 
                    strokeDasharray={2 * Math.PI * 120}
                    strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
                    className="transition-all duration-1000 ease-linear"
                />
             </svg>
             <div className="text-6xl font-mono font-bold text-white z-10">
                 {formatTime(timeLeft)}
             </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-6 mb-6">
            <button 
                onClick={toggleTimer}
                className="w-16 h-16 rounded-full bg-slate-200 hover:bg-white text-slate-900 flex items-center justify-center transition-transform hover:scale-105"
            >
                {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
            </button>
            <button 
                onClick={resetTimer}
                className="w-12 h-12 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-200 flex items-center justify-center transition-colors"
            >
                <RotateCcw size={20} />
            </button>
        </div>

        {/* Subject Selector & Save */}
        {mode === 'study' && (
            <div className="space-y-4 pt-4 border-t border-slate-700">
                <div className="flex flex-col text-left">
                    <label className="text-sm text-slate-400 mb-1">Select Subject</label>
                    <select 
                        value={selectedSubjectId}
                        onChange={(e) => setSelectedSubjectId(e.target.value)}
                        className="bg-slate-900 border border-slate-600 text-slate-200 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        {subjects.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>
                {sessionStartTime && !isActive && (
                    <button 
                        onClick={handleSaveSession}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded flex items-center justify-center space-x-2 font-medium"
                    >
                        <Save size={18} />
                        <span>Log Session Manually</span>
                    </button>
                )}
            </div>
        )}

      </div>
    </div>
  );
};

export default FocusMode;