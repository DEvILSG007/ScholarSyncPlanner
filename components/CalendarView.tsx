import React, { useState, useMemo } from 'react';
import { Task, Subject } from '../types';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Settings } from 'lucide-react';
import TaskModal from './TaskModal';
import SubjectManager from './SubjectManager';

const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 7 AM to 9 PM
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface CalendarViewProps {
  tasks: Task[];
  subjects: Subject[];
  onAddTask: (task: Omit<Task, 'id'>) => Promise<void>;
  onUpdateTask: (task: Task) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  onAddSubject: (subject: Omit<Subject, 'id'>) => Promise<void>;
  onDeleteSubject: (id: string) => Promise<void>;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  subjects,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onAddSubject,
  onDeleteSubject
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubjectManagerOpen, setIsSubjectManagerOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [modalInitialDate, setModalInitialDate] = useState<Date | undefined>(undefined);
  const [modalInitialHour, setModalInitialHour] = useState<number | undefined>(undefined);

  // Navigation
  const startOfWeek = useMemo(() => {
    const d = new Date(currentDate);
    const day = d.getDay();
    const diff = d.getDate() - day;
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [currentDate]);

  const weekDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [startOfWeek]);

  const nextWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  };

  const prevWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  };

  // Task Modal
  const openNewTaskModal = (date?: Date, hour?: number) => {
    setEditingTask(undefined);
    setModalInitialDate(date || new Date());
    setModalInitialHour(hour);
    setIsModalOpen(true);
  };

  const openEditTaskModal = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  // Recurring Task Expansion
  const displayTasks = useMemo(() => {
    const weekStart = new Date(weekDates[0]);
    weekStart.setHours(0,0,0,0);
    const weekEnd = new Date(weekDates[6]);
    weekEnd.setHours(23,59,59,999);
    const instances: Task[] = [];

    tasks.forEach(task => {
      const taskStart = new Date(task.start);
      const taskEnd = new Date(task.end);
      const duration = taskEnd.getTime() - taskStart.getTime();

      if (!task.recurrence || task.recurrence.type === 'none') {
        if (taskStart < weekEnd && taskEnd > weekStart) instances.push(task);
        return;
      }

      weekDates.forEach(day => {
        const dayStart = new Date(day); dayStart.setHours(0,0,0,0);
        const dayEnd = new Date(day); dayEnd.setHours(23,59,59,999);

        if (taskStart > dayEnd) return;
        if (task.recurrence?.endDate && dayStart > new Date(task.recurrence.endDate)) return;

        let isMatch = false;
        if (task.recurrence.type === 'daily') isMatch = true;
        else if (task.recurrence.type === 'weekly' && task.recurrence.daysOfWeek?.includes(day.getDay())) isMatch = true;

        if (isMatch) {
          const instanceStart = new Date(day);
          instanceStart.setHours(taskStart.getHours(), taskStart.getMinutes(), 0, 0);
          const instanceEnd = new Date(instanceStart.getTime() + duration);
          instances.push({ ...task, start: instanceStart.toISOString(), end: instanceEnd.toISOString() });
        }
      });
    });

    return instances;
  }, [tasks, weekDates]);

  const getTaskStyle = (task: Task) => {
    const start = new Date(task.start);
    const end = new Date(task.end);
    const startHour = start.getHours() + start.getMinutes()/60;
    const endHour = end.getHours() + end.getMinutes()/60;
    const duration = endHour - startHour;
    const topOffset = (startHour - 7)*60;
    const height = Math.max(duration*60, 24); // Minimum height
    const subject = subjects.find(s => s.id === task.subjectId);
    const color = subject ? subject.color : '#94a3b8';
    
    return { 
        top: `${topOffset}px`, 
        height: `${height}px`, 
        backgroundColor: `${color}15`, // Very transparent background
        borderLeft: `3px solid ${color}`,
        color: '#e2e8f0'
    };
  };

  return (
    <div className="h-full flex flex-col p-6 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-white flex items-center tracking-tight">
            <span className="bg-blue-500/10 p-2 rounded-lg mr-3">
                 <CalendarIcon className="text-blue-500" size={24}/>
            </span>
            {startOfWeek.toLocaleDateString('en-US', { month:'long', year:'numeric' })}
          </h2>
          <div className="flex space-x-2">
            <button onClick={() => openNewTaskModal()} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95">
              <Plus size={18} className="mr-1.5"/> New Event
            </button>
            <button onClick={() => setIsSubjectManagerOpen(true)} className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg flex items-center text-sm font-medium border border-slate-700 transition-colors">
              <Settings size={18} className="mr-1.5"/> Subjects
            </button>
          </div>
        </div>
        
        <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
          <button onClick={prevWeek} className="p-2 hover:bg-slate-700 rounded-md text-slate-400 hover:text-white transition-colors"><ChevronLeft size={20}/></button>
          <div className="h-5 w-px bg-slate-700 mx-1"></div>
          <button onClick={() => setCurrentDate(new Date())} className="px-4 py-1 hover:bg-slate-700 rounded-md text-sm font-medium text-slate-300 hover:text-white transition-colors">Today</button>
          <div className="h-5 w-px bg-slate-700 mx-1"></div>
          <button onClick={nextWeek} className="p-2 hover:bg-slate-700 rounded-md text-slate-400 hover:text-white transition-colors"><ChevronRight size={20}/></button>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="flex-1 overflow-auto bg-slate-900 rounded-2xl border border-slate-800 shadow-xl relative custom-scrollbar">
        <div className="grid grid-cols-8 min-w-[900px]">
          
          {/* Time Column */}
          <div className="border-r border-slate-800 bg-slate-900 sticky left-0 z-20">
            <div className="h-14 border-b border-slate-800 sticky top-0 bg-slate-900 z-30"></div>
            {HOURS.map(hour => (
                <div key={hour} className="h-[60px] border-b border-slate-800/50 text-[11px] text-slate-500 font-medium flex items-start justify-end pr-2 pt-2 -mt-2.5">
                    {hour > 12 ? hour - 12 : hour} {hour >= 12 ? 'PM' : 'AM'}
                </div>
            ))}
          </div>

          {/* Days Columns */}
          {weekDates.map((date, dayIdx) => {
            const isToday = date.toDateString() === new Date().toDateString();
            return (
              <div key={dayIdx} className="relative border-r border-slate-800 last:border-r-0 min-w-[120px] bg-slate-900/50">
                {/* Day Header */}
                <div className={`h-14 border-b border-slate-800 flex flex-col justify-center items-center sticky top-0 z-10 backdrop-blur-md ${isToday ? 'bg-blue-900/20' : 'bg-slate-900/90'}`}>
                  <span className={`text-[10px] uppercase font-bold tracking-wider mb-0.5 ${isToday ? 'text-blue-400' : 'text-slate-500'}`}>{DAYS[date.getDay()]}</span>
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full text-lg font-bold ${isToday ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-300'}`}>
                    {date.getDate()}
                  </div>
                </div>

                {/* Grid Cells & Events */}
                <div className="relative">
                  {HOURS.map(hour => (
                    <div 
                        key={hour} 
                        className="h-[60px] border-b border-slate-800/40 hover:bg-slate-800/30 transition-colors cursor-pointer group"
                        onClick={() => openNewTaskModal(date, hour)}
                    >
                        <div className="hidden group-hover:flex h-full items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Plus size={16} className="text-slate-600"/>
                        </div>
                    </div>
                  ))}
                  
                  {displayTasks.filter(t => new Date(t.start).toDateString()===date.toDateString()).map((task, idx) => {
                    const subject = subjects.find(s => s.id === task.subjectId);
                    const color = subject ? subject.color : '#94a3b8';
                    
                    return (
                        <div key={`${task.id}-${idx}`} style={getTaskStyle(task)} 
                            className="absolute w-[94%] left-[3%] rounded-md p-2 text-xs overflow-hidden cursor-pointer hover:brightness-125 shadow-sm z-0 group transition-all"
                            onClick={e => { e.stopPropagation(); openEditTaskModal(task); }}>
                        <div className="flex flex-col h-full">
                            <div className="flex justify-between items-start mb-0.5">
                                <span className={`font-semibold truncate leading-tight ${task.completed ? 'line-through opacity-70' : 'text-slate-200'}`}>{task.title}</span>
                                {task.recurrence && <span className="text-[10px] opacity-70 ml-1">↻</span>}
                            </div>
                            <div className="text-[10px] opacity-70 font-medium">
                                {new Date(task.start).toLocaleTimeString([], {hour:'numeric', minute:'2-digit'})}
                            </div>
                            <div className="mt-auto hidden group-hover:block" style={{ backgroundColor: color, height: '2px', width: '20px' }}></div>
                        </div>
                        </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <TaskModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={async t => {
          if ('id' in t) await onUpdateTask(t as Task);
          else await onAddTask(t as Omit<Task, 'id'>);
        }}
        onDelete={async id => await onDeleteTask(id)}
        existingTask={editingTask}
        subjects={subjects}
        initialDate={modalInitialDate}
        initialHour={modalInitialHour}
      />

      <SubjectManager 
        isOpen={isSubjectManagerOpen}
        onClose={() => setIsSubjectManagerOpen(false)}
        subjects={subjects}
        onAddSubject={onAddSubject}
        onDeleteSubject={onDeleteSubject}
      />
    </div>
  );
};

export default CalendarView;