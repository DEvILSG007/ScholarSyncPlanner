import React, { useState, useEffect } from 'react';
import { Task, Subject, Priority, RecurrenceType } from '../types';
import { X, Calendar as CalendarIcon, Clock, Save, Trash2, Repeat, AlignLeft, Tag, Flag } from 'lucide-react';
import { auth } from '../services/firebase';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id'> | Task) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
  existingTask?: Task;
  subjects: Subject[];
  initialDate?: Date;
  initialHour?: number;
}

const DAYS_OF_WEEK = [
  { label: 'S', value: 0 },
  { label: 'M', value: 1 },
  { label: 'T', value: 2 },
  { label: 'W', value: 3 },
  { label: 'T', value: 4 },
  { label: 'F', value: 5 },
  { label: 'S', value: 6 },
];

const TaskModal: React.FC<TaskModalProps> = ({ 
  isOpen, onClose, onSave, onDelete, existingTask, subjects, initialDate, initialHour 
}) => {
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [priority, setPriority] = useState<Priority>(Priority.Medium);
  const [notes, setNotes] = useState('');
  
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('daily');
  const [recurrenceDays, setRecurrenceDays] = useState<number[]>([]);
  const [recurrenceEnd, setRecurrenceEnd] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (existingTask) {
        setTitle(existingTask.title);
        setSubjectId(existingTask.subjectId);
        const start = new Date(existingTask.start);
        const end = new Date(existingTask.end);
        setDate(start.toISOString().split('T')[0]);
        setStartTime(start.toTimeString().slice(0,5));
        setEndTime(end.toTimeString().slice(0,5));
        setPriority(existingTask.priority);
        setNotes(existingTask.notes || '');
        if (existingTask.recurrence && existingTask.recurrence.type !== 'none') {
          setIsRecurring(true);
          setRecurrenceType(existingTask.recurrence.type);
          setRecurrenceDays(existingTask.recurrence.daysOfWeek || []);
          setRecurrenceEnd(existingTask.recurrence.endDate?.split('T')[0] || '');
        } else {
          setIsRecurring(false);
          setRecurrenceDays([]);
          setRecurrenceEnd('');
        }
      } else {
        setTitle('');
        setSubjectId(subjects[0]?.id || '');
        const d = initialDate || new Date();
        setDate(d.toISOString().split('T')[0]);
        const h = initialHour ?? 9;
        setStartTime(`${h.toString().padStart(2,'0')}:00`);
        setEndTime(`${(h+1).toString().padStart(2,'0')}:00`);
        setPriority(Priority.Medium);
        setNotes('');
        setIsRecurring(false);
        setRecurrenceDays([]);
        setRecurrenceEnd('');
      }
    }
  }, [isOpen, existingTask, subjects, initialDate, initialHour]);

  const toggleDay = (day: number) => {
    if (recurrenceDays.includes(day)) setRecurrenceDays(prev => prev.filter(d => d !== day));
    else setRecurrenceDays(prev => [...prev, day].sort());
  };

  const handleSave = async () => {
    if (!title || !subjectId || !date || !startTime || !endTime) {
      alert("Please fill all fields");
      return;
    }
    
    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);
    
    if (endDateTime <= startDateTime) {
      alert("End time must be after start time.");
      return;
    }

    const taskData: any = {
      title,
      subjectId,
      start: startDateTime.toISOString(),
      end: endDateTime.toISOString(),
      completed: existingTask?.completed || false,
      priority,
      notes,
    };

    if (auth.currentUser && !existingTask) {
        taskData.userId = auth.currentUser.uid;
    }

    if (isRecurring) {
      taskData.recurrence = {
        type: recurrenceType,
        daysOfWeek: recurrenceType === 'weekly' ? recurrenceDays : undefined,
        endDate: recurrenceEnd ? new Date(recurrenceEnd).toISOString() : undefined
      };
    } else {
      taskData.recurrence = { type: 'none' };
    }

    if (existingTask) {
        await onSave({ ...taskData, id: existingTask.id });
    } else {
        await onSave(taskData);
    }
    onClose();
  };

  const handleDelete = async () => {
    if (existingTask) {
        await onDelete(existingTask.id);
        onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 w-full max-w-lg rounded-2xl border border-slate-700 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-800 bg-slate-900/50">
          <h2 className="text-xl font-bold text-white tracking-tight">{existingTask ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors bg-slate-800 p-1.5 rounded-full hover:bg-slate-700">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
          
          {/* Title Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Title</label>
            <input 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="What do you need to do?"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            {/* Subject */}
            <div className="space-y-1.5">
              <label className="flex items-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <Tag size={12} className="mr-1.5" /> Subject
              </label>
              <select 
                value={subjectId} 
                onChange={e => setSubjectId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
              >
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            {/* Priority */}
            <div className="space-y-1.5">
              <label className="flex items-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <Flag size={12} className="mr-1.5" /> Priority
              </label>
              <select 
                value={priority} 
                onChange={e => setPriority(e.target.value as Priority)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
              >
                {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="h-px bg-slate-800 my-2"></div>

          {/* Date & Time */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</label>
              <div className="relative">
                <CalendarIcon size={16} className="absolute left-3.5 top-3 text-slate-500" />
                <input 
                  type="date" 
                  value={date} 
                  onChange={e => setDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Start</label>
                <div className="relative">
                  <Clock size={16} className="absolute left-3.5 top-3 text-slate-500" />
                  <input 
                    type="time" 
                    value={startTime} 
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">End</label>
                <div className="relative">
                  <Clock size={16} className="absolute left-3.5 top-3 text-slate-500" />
                  <input 
                    type="time" 
                    value={endTime} 
                    onChange={e => setEndTime(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Recurrence Toggle */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="bg-blue-500/10 p-1.5 rounded-lg">
                  <Repeat size={18} className="text-blue-400" />
                </div>
                <span className="text-sm font-medium text-slate-200">Recurring Task</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                    type="checkbox" 
                    checked={isRecurring} 
                    onChange={e => setIsRecurring(e.target.checked)} 
                    className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 rounded-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
            
            {isRecurring && (
                <div className="mt-4 space-y-4 pt-4 border-t border-slate-700/50 animate-in slide-in-from-top-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Frequency</label>
                        <select 
                            value={recurrenceType}
                            onChange={(e) => setRecurrenceType(e.target.value as RecurrenceType)}
                            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm outline-none"
                        >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                         <label className="text-[10px] font-bold text-slate-500 uppercase">Ends (Optional)</label>
                         <input 
                            type="date" 
                            value={recurrenceEnd} 
                            onChange={e => setRecurrenceEnd(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm outline-none"
                        />
                      </div>
                    </div>

                    {recurrenceType === 'weekly' && (
                        <div className="space-y-2">
                             <label className="text-[10px] font-bold text-slate-500 uppercase">Repeat On</label>
                             <div className="flex justify-between gap-1">
                                {DAYS_OF_WEEK.map((d) => (
                                    <button
                                        key={d.value}
                                        onClick={() => toggleDay(d.value)}
                                        className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${recurrenceDays.includes(d.value) ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 scale-110' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
                                    >
                                        {d.label}
                                    </button>
                                ))}
                             </div>
                        </div>
                    )}
                </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
             <label className="flex items-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
               <AlignLeft size={12} className="mr-1.5" /> Notes
             </label>
             <textarea 
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px] resize-y"
                placeholder="Add details, links, or subtasks..."
             />
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-800 bg-slate-900/50 flex justify-between items-center backdrop-blur-sm">
            {existingTask && onDelete ? (
                 <button 
                    onClick={handleDelete}
                    className="flex items-center px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-sm font-medium"
                >
                    <Trash2 size={16} className="mr-2" /> Delete
                 </button>
            ) : (<div></div>)}

            <div className="flex space-x-3">
                 <button onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm font-medium">Cancel</button>
                 <button 
                    onClick={handleSave}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium flex items-center shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
                >
                    <Save size={18} className="mr-2" /> Save Task
                 </button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default TaskModal;