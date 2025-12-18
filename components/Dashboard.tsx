import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Task, StudySession, Goal, Subject } from '../types';
import { Clock, CheckCircle, Target, TrendingUp, Plus, Edit2 } from 'lucide-react';
import GoalModal from './GoalModal';

interface DashboardProps {
  tasks: Task[];
  sessions: StudySession[];
  goals: Goal[];
  subjects: Subject[];
  onAddGoal: (goal: Omit<Goal, 'id'>) => void;
  onUpdateGoal: (goal: Goal) => void;
  onDeleteGoal: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  tasks, sessions, goals, subjects, onAddGoal, onUpdateGoal, onDeleteGoal 
}) => {
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>(undefined);

  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const totalStudyMinutes = sessions.reduce((acc, curr) => acc + curr.durationMinutes, 0);
  const totalHours = (totalStudyMinutes / 60).toFixed(1);

  const subjectData = useMemo(() => {
    const data: Record<string, number> = {};
    sessions.forEach(session => {
      const subject = subjects.find(s => s.id === session.subjectId);
      if (subject) {
        data[subject.name] = (data[subject.name] || 0) + session.durationMinutes;
      }
    });
    return Object.keys(data).map(name => ({ name, minutes: data[name] }));
  }, [sessions, subjects]);

  const pieData = [
    { name: 'Completed', value: completedTasks },
    { name: 'Pending', value: totalTasks - completedTasks },
  ];
  const PIE_COLORS = ['#3b82f6', '#1e293b']; // Blue and Dark Slate

  const openAddGoal = () => {
    setEditingGoal(undefined);
    setIsGoalModalOpen(true);
  };

  const openEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setIsGoalModalOpen(true);
  };

  return (
    <div className="p-6 space-y-8 animate-fade-in pb-20 overflow-y-auto h-full custom-scrollbar">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Dashboard</h2>
        <p className="text-slate-400">Track your academic progress and productivity.</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
            icon={<CheckCircle size={24} className="text-emerald-400" />}
            label="Task Completion"
            value={`${completionRate}%`}
            subtext={`${completedTasks}/${totalTasks} tasks`}
            color="emerald"
        />
        <StatCard 
            icon={<Clock size={24} className="text-blue-400" />}
            label="Total Study Time"
            value={`${totalHours}h`}
            subtext="Across all subjects"
            color="blue"
        />
        <StatCard 
            icon={<Target size={24} className="text-purple-400" />}
            label="Active Goals"
            value={goals.length.toString()}
            subtext="Tracked metrics"
            color="purple"
        />
        <StatCard 
            icon={<TrendingUp size={24} className="text-amber-400" />}
            label="Study Sessions"
            value={sessions.length.toString()}
            subtext="Recorded sessions"
            color="amber"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Study Distribution */}
        <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-sm hover:border-slate-600 transition-colors">
          <h3 className="text-lg font-bold text-slate-200 mb-6">Study Distribution (Minutes)</h3>
          <div className="h-64 w-full">
            {subjectData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectData}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
                        cursor={{fill: '#1e293b', opacity: 0.5}}
                    />
                    <Bar dataKey="minutes" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500">
                    <TrendingUp size={32} className="mb-2 opacity-50"/>
                    <p>No study data yet</p>
                </div>
            )}
          </div>
        </div>

        {/* Task Progress */}
        <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-sm hover:border-slate-600 transition-colors">
          <h3 className="text-lg font-bold text-slate-200 mb-6">Task Status</h3>
          <div className="h-64 w-full flex justify-center items-center relative">
             {totalTasks > 0 ? (
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                    </PieChart>
                 </ResponsiveContainer>
             ) : (
                 <div className="flex flex-col items-center justify-center text-slate-500">
                     <CheckCircle size={32} className="mb-2 opacity-50"/>
                     <p>No tasks created</p>
                 </div>
             )}
             {/* Center Text */}
             {totalTasks > 0 && (
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                     <div className="text-center">
                         <span className="text-2xl font-bold text-white">{completionRate}%</span>
                         <p className="text-[10px] text-slate-400 uppercase tracking-wider">Done</p>
                     </div>
                 </div>
             )}
          </div>
        </div>
      </div>

      {/* Goal Tracking */}
      <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-sm">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h3 className="text-lg font-bold text-slate-200">Goal Progress</h3>
                <p className="text-sm text-slate-400">Keep up the momentum!</p>
            </div>
            <button 
                onClick={openAddGoal}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20"
            >
                <Plus size={16} />
                <span>Add Goal</span>
            </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.length === 0 && (
                <div className="col-span-full py-8 text-center border-2 border-dashed border-slate-700 rounded-xl">
                    <p className="text-slate-500">No goals set yet. Set a target to stay motivated!</p>
                </div>
            )}
            {goals.map(goal => {
                const percent = Math.min(100, Math.round((goal.currentMinutes / goal.targetMinutes) * 100));
                return (
                    <div key={goal.id} className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 hover:border-slate-700 transition-all group">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h4 className="font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">{goal.title}</h4>
                                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{goal.period}</span>
                            </div>
                            <button 
                                onClick={() => openEditGoal(goal)}
                                className="text-slate-600 hover:text-white transition-colors p-1"
                            >
                                <Edit2 size={14} />
                            </button>
                        </div>
                        
                        <div className="flex items-end justify-between mb-2">
                             <span className="text-2xl font-bold text-white">{percent}%</span>
                             <span className="text-xs text-slate-400 mb-1">{goal.currentMinutes} / {goal.targetMinutes} min</span>
                        </div>
                        
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                            <div 
                                className={`h-full rounded-full transition-all duration-1000 ease-out ${percent >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                                style={{ width: `${percent}%` }}
                            ></div>
                        </div>
                    </div>
                );
            })}
        </div>
      </div>

      <GoalModal 
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSave={(g) => {
            if ('id' in g) {
                onUpdateGoal(g as Goal);
            } else {
                onAddGoal(g);
            }
        }}
        onDelete={onDeleteGoal}
        existingGoal={editingGoal}
      />
    </div>
  );
};

const StatCard = ({ icon, label, value, subtext, color }: { icon: React.ReactNode, label: string, value: string, subtext: string, color: string }) => (
    <div className="bg-slate-800/50 backdrop-blur-sm p-5 rounded-2xl border border-slate-700/50 shadow-sm hover:bg-slate-800/80 transition-all group">
        <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-xl bg-${color}-500/10 group-hover:bg-${color}-500/20 transition-colors`}>
                {icon}
            </div>
            {/* Optional: Add sparkline or trend arrow here */}
        </div>
        <div>
            <p className="text-sm font-medium text-slate-400">{label}</p>
            <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
            <p className="text-xs text-slate-500 mt-1">{subtext}</p>
        </div>
    </div>
);

export default Dashboard;