import React, { useState, useEffect } from 'react';
import { Goal } from '../types';
import { X, Save, Trash2, Target } from 'lucide-react';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: Omit<Goal, 'id'> | Goal) => void;
  onDelete?: (id: string) => void;
  existingGoal?: Goal;
}

const GoalModal: React.FC<GoalModalProps> = ({ isOpen, onClose, onSave, onDelete, existingGoal }) => {
  const [title, setTitle] = useState('');
  const [targetMinutes, setTargetMinutes] = useState(60);
  const [period, setPeriod] = useState<'daily' | 'weekly'>('daily');

  useEffect(() => {
    if (isOpen) {
      if (existingGoal) {
        setTitle(existingGoal.title);
        setTargetMinutes(existingGoal.targetMinutes);
        setPeriod(existingGoal.period);
      } else {
        setTitle('');
        setTargetMinutes(60);
        setPeriod('daily');
      }
    }
  }, [isOpen, existingGoal]);

  const handleSave = () => {
    if (!title.trim()) {
      alert("Please enter a goal title");
      return;
    }

    const goalData: any = {
      title,
      targetMinutes,
      currentMinutes: existingGoal ? existingGoal.currentMinutes : 0,
      period
    };

    if (existingGoal) {
      onSave({ ...goalData, id: existingGoal.id, userId: existingGoal.userId });
    } else {
      onSave(goalData);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-fade-in">
      <div className="bg-slate-900 w-full max-w-md rounded-xl border border-slate-700 shadow-2xl flex flex-col">
        
        <div className="flex justify-between items-center p-4 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white flex items-center">
            <Target className="mr-2 text-blue-500" size={20} />
            {existingGoal ? 'Edit Goal' : 'New Goal'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-4">
            <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Goal Title</label>
                <input 
                    type="text" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. Daily Math Study"
                />
            </div>

            <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Target Time (Minutes)</label>
                <input 
                    type="number" 
                    min="1"
                    value={targetMinutes} 
                    onChange={e => setTargetMinutes(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <p className="text-xs text-slate-500 mt-1">{(targetMinutes / 60).toFixed(1)} hours</p>
            </div>

            <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Period</label>
                <div className="flex space-x-2">
                    <button 
                        onClick={() => setPeriod('daily')}
                        className={`flex-1 py-2 rounded text-sm font-medium transition-colors ${period === 'daily' ? 'bg-blue-600 text-white' : 'bg-slate-800 border border-slate-600 text-slate-300'}`}
                    >
                        Daily
                    </button>
                    <button 
                        onClick={() => setPeriod('weekly')}
                        className={`flex-1 py-2 rounded text-sm font-medium transition-colors ${period === 'weekly' ? 'bg-blue-600 text-white' : 'bg-slate-800 border border-slate-600 text-slate-300'}`}
                    >
                        Weekly
                    </button>
                </div>
            </div>
        </div>

        <div className="p-4 border-t border-slate-800 flex justify-between bg-slate-900 rounded-b-xl">
             {existingGoal && onDelete ? (
                 <button 
                    onClick={() => { onDelete(existingGoal.id); onClose(); }}
                    className="flex items-center text-red-400 hover:text-red-300 transition-colors"
                >
                    <Trash2 size={18} className="mr-2" /> Delete
                 </button>
             ) : (<div></div>)}

             <div className="flex space-x-3">
                 <button onClick={onClose} className="px-4 py-2 text-slate-300 hover:text-white transition-colors">Cancel</button>
                 <button 
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium flex items-center shadow-lg shadow-blue-500/20"
                >
                    <Save size={18} className="mr-2" /> Save Goal
                 </button>
             </div>
        </div>

      </div>
    </div>
  );
};

export default GoalModal;