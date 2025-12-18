import React, { useState } from 'react';
import { Subject } from '../types';
import { X, Plus, Trash2 } from 'lucide-react';

interface SubjectManagerProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  onAddSubject: (subject: Omit<Subject, 'id'>) => Promise<void> | void;
  onDeleteSubject: (id: string) => Promise<void> | void;
}

const COLORS = [
  '#ef4444','#f97316','#eab308','#22c55e','#10b981','#06b6d4',
  '#3b82f6','#6366f1','#a855f7','#d946ef','#f43f5e',
];

const SubjectManager: React.FC<SubjectManagerProps> = ({ 
  isOpen, onClose, subjects, onAddSubject, onDeleteSubject 
}) => {
  const [newSubjectName, setNewSubjectName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[6]);

  const handleAdd = async () => {
    if (!newSubjectName.trim()) return;

    const subjectData = {
      name: newSubjectName,
      color: selectedColor,
    };

    try {
      await onAddSubject(subjectData);
      setNewSubjectName('');
    } catch (err) {
      console.error("Failed to add subject:", err);
      alert("Error adding subject");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await onDeleteSubject(id);
    } catch (err) {
      console.error("Failed to delete subject:", err);
      alert("Error deleting subject");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-fade-in">
      <div className="bg-slate-900 w-full max-w-md rounded-xl border border-slate-700 shadow-2xl flex flex-col max-h-[80vh]">
        
        <div className="flex justify-between items-center p-4 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white">Manage Subjects</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
        </div>

        <div className="p-4 border-b border-slate-800 space-y-3">
            <h3 className="text-sm font-medium text-slate-300">Add New Subject</h3>
            <input 
                type="text" 
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                placeholder="Subject Name (e.g., Biology)"
                className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <div className="flex flex-wrap gap-2 mt-2">
                {COLORS.map(color => (
                    <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${selectedColor === color ? 'border-white scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: color }}
                    />
                ))}
            </div>
            <button 
                onClick={handleAdd}
                disabled={!newSubjectName.trim()}
                className="w-full mt-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded font-medium flex items-center justify-center"
            >
                <Plus size={16} className="mr-2" /> Create Subject
            </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <h3 className="text-sm font-medium text-slate-300 mb-2">Existing Subjects</h3>
            {subjects.length === 0 && <p className="text-xs text-slate-500">No subjects created yet.</p>}
            {subjects.map(subject => (
                <div key={subject.id} className="flex items-center justify-between bg-slate-800 p-2 rounded border border-slate-700">
                    <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: subject.color }}></div>
                        <span className="text-slate-200">{subject.name}</span>
                    </div>
                    <button 
                        onClick={() => handleDelete(subject.id)}
                        className="text-slate-500 hover:text-red-400 transition-colors p-1"
                        title="Delete Subject"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ))}
        </div>

      </div>
    </div>
  );
};

export default SubjectManager;