import React, { useState, useEffect } from 'react';
import { ViewState, Task, StudySession, Goal, Subject } from './types';
import { storageService } from './services/storageService';
import { 
  auth, signInWithGoogle, signOut, 
  subscribeToTasks, addTask, updateTask, deleteTask,
  subscribeToSubjects, addSubject, deleteSubject,
  subscribeToGoals, addGoal, updateGoal, deleteGoal,
  subscribeToSessions, addSession
} from './services/firebase';
import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';
import FocusMode from './components/FocusMode';
import AiInsights from './components/AiInsights';
import { LayoutDashboard, Calendar, Timer, Sparkles, BookOpen, LogOut, LogIn } from 'lucide-react';
import { onAuthStateChanged, User } from 'firebase/auth';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [view, setView] = useState<ViewState>('dashboard');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Auth Listener
  useEffect(() => {
    if (!auth) {
      console.log("App running in local mode (Firebase not configured)");
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Data Loading
  useEffect(() => {
    if (user) {
      const unsubTasks = subscribeToTasks(user.uid, setTasks);
      const unsubSubjects = subscribeToSubjects(user.uid, setSubjects);
      const unsubGoals = subscribeToGoals(user.uid, setGoals);
      const unsubSessions = subscribeToSessions(user.uid, setSessions);
      
      return () => {
        unsubTasks();
        unsubSubjects();
        unsubGoals();
        unsubSessions();
      };
    } else {
      setTasks(storageService.getTasks());
      setSessions(storageService.getSessions());
      setGoals(storageService.getGoals());
      setSubjects(storageService.getSubjects());
    }
  }, [user]);

  // --- Task Handlers ---
  const handleAddTask = async (newTask: Omit<Task, 'id'>) => {
    if (user && auth) {
      await addTask({ ...newTask, userId: user.uid });
    } else {
      const task: Task = { ...newTask, id: crypto.randomUUID() };
      const updated = [...tasks, task];
      setTasks(updated);
      storageService.saveTasks(updated);
    }
  };

  const handleUpdateTask = async (task: Task) => {
      if (user && auth) {
          const { id, ...data } = task;
          await updateTask(id, data);
      } else {
          const updated = tasks.map(t => t.id === task.id ? task : t);
          setTasks(updated);
          storageService.saveTasks(updated);
      }
  };

  const handleDeleteTask = async (id: string) => {
      if (user && auth) {
          await deleteTask(id);
      } else {
          const updated = tasks.filter(t => t.id !== id);
          setTasks(updated);
          storageService.saveTasks(updated);
      }
  };

  // --- Subject Handlers ---
  const handleAddSubject = async (newSubject: Omit<Subject, 'id'>) => {
    if (user && auth) {
        await addSubject({ ...newSubject, userId: user.uid } as any);
    } else {
        const subject = { ...newSubject, id: crypto.randomUUID() };
        setSubjects(prev => [...prev, subject]);
    }
  };

  const handleDeleteSubject = async (id: string) => {
      if (user && auth) {
          await deleteSubject(id);
      } else {
          setSubjects(prev => prev.filter(s => s.id !== id));
      }
  };

  // --- Goal Handlers ---
  const handleAddGoal = async (newGoal: Omit<Goal, 'id'>) => {
      if (user && auth) {
          await addGoal({ ...newGoal, userId: user.uid, currentMinutes: 0 });
      } else {
          const goal: Goal = { ...newGoal, id: crypto.randomUUID(), currentMinutes: 0 };
          const updated = [...goals, goal];
          setGoals(updated);
          storageService.saveGoals(updated);
      }
  };

  const handleUpdateGoal = async (goal: Goal) => {
      if (user && auth) {
          const { id, ...data } = goal;
          await updateGoal(id, data);
      } else {
          const updated = goals.map(g => g.id === goal.id ? goal : g);
          setGoals(updated);
          storageService.saveGoals(updated);
      }
  };

  const handleDeleteGoal = async (id: string) => {
      if (user && auth) {
          await deleteGoal(id);
      } else {
          const updated = goals.filter(g => g.id !== id);
          setGoals(updated);
          storageService.saveGoals(updated);
      }
  };

  const handleSaveSession = async (session: StudySession) => {
    if (user && auth) {
        await addSession({ ...session, userId: user.uid });
        goals.forEach(async (g) => {
             const newMinutes = g.currentMinutes + session.durationMinutes;
             await updateGoal(g.id, { currentMinutes: newMinutes });
        });
    } else {
        storageService.saveSession(session);
        setSessions(storageService.getSessions());
        setGoals(storageService.getGoals());
    }
  };

  if (loading) {
      return (
        <div className="h-screen w-full bg-slate-950 flex flex-col items-center justify-center text-white">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <div className="font-medium text-slate-400">Loading ScholarSync...</div>
        </div>
      );
  }
  
  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans selection:bg-blue-500/30">
      
      {/* Sidebar */}
      <aside className="w-64 hidden md:flex flex-col bg-slate-950 border-r border-slate-800/50">
        <div className="p-6 flex items-center space-x-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
            <BookOpen className="text-white" size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">ScholarSync</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-6">
          <SidebarItem 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            active={view === 'dashboard'} 
            onClick={() => setView('dashboard')} 
          />
          <SidebarItem 
            icon={<Calendar size={20} />} 
            label="Schedule" 
            active={view === 'calendar'} 
            onClick={() => setView('calendar')} 
          />
          <SidebarItem 
            icon={<Timer size={20} />} 
            label="Focus Timer" 
            active={view === 'focus'} 
            onClick={() => setView('focus')} 
          />
          <SidebarItem 
            icon={<Sparkles size={20} />} 
            label="AI Insights" 
            active={view === 'insights'} 
            onClick={() => setView('insights')} 
          />
        </nav>

        <div className="p-4 space-y-3 mx-2 mb-2 bg-slate-900/50 rounded-xl border border-slate-800/50">
            {user ? (
                 <div className="flex flex-col">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Logged In As</div>
                    <div className="text-sm font-medium text-white truncate mb-3 flex items-center">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div>
                        {user.displayName || user.email}
                    </div>
                    <button 
                        onClick={signOut}
                        className="flex items-center justify-center w-full px-3 py-2 text-xs font-medium text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                        <LogOut size={14} className="mr-1.5" /> Sign Out
                    </button>
                 </div>
            ) : (
                <button 
                    onClick={signInWithGoogle}
                    className={`w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-2.5 rounded-lg transition-all shadow-lg shadow-blue-900/20 text-sm font-medium ${!auth ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={!auth}
                    title={!auth ? "Firebase not configured" : "Sign In"}
                >
                    <LogIn size={16} />
                    <span>Sign In</span>
                </button>
            )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-gradient-to-br from-slate-950 to-slate-900">
        
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-4 sticky top-0 z-50">
            <span className="font-bold text-lg">ScholarSync</span>
            <div className="flex space-x-5">
                <button onClick={() => setView('dashboard')} className={view === 'dashboard' ? 'text-blue-500' : 'text-slate-400'}><LayoutDashboard size={22}/></button>
                <button onClick={() => setView('calendar')} className={view === 'calendar' ? 'text-blue-500' : 'text-slate-400'}><Calendar size={22}/></button>
                <button onClick={() => setView('focus')} className={view === 'focus' ? 'text-blue-500' : 'text-slate-400'}><Timer size={22}/></button>
                <button onClick={() => setView('insights')} className={view === 'insights' ? 'text-blue-500' : 'text-slate-400'}><Sparkles size={22}/></button>
            </div>
        </header>

        <div className="flex-1 overflow-hidden relative">
            {view === 'dashboard' && (
                <Dashboard 
                    tasks={tasks} 
                    sessions={sessions} 
                    goals={goals} 
                    subjects={subjects}
                    onAddGoal={handleAddGoal}
                    onUpdateGoal={handleUpdateGoal}
                    onDeleteGoal={handleDeleteGoal}
                />
            )}
            {view === 'calendar' && (
                <CalendarView 
                    tasks={tasks} 
                    subjects={subjects} 
                    onAddTask={handleAddTask} 
                    onUpdateTask={handleUpdateTask}
                    onDeleteTask={handleDeleteTask} 
                    onAddSubject={handleAddSubject}
                    onDeleteSubject={handleDeleteSubject}
                />
            )}
            {view === 'focus' && <FocusMode subjects={subjects} onSaveSession={handleSaveSession} />}
            {view === 'insights' && <AiInsights tasks={tasks} goals={goals} sessions={sessions} />}
        </div>
      </main>
    </div>
  );
};

interface SidebarItemProps {
    icon: React.ReactNode;
    label: string;
    active: boolean;
    onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active, onClick }) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
            active ? 'bg-blue-600/10 text-blue-400 font-medium' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
        }`}
    >
        <div className={`transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
            {icon}
        </div>
        <span className="text-sm">{label}</span>
    </button>
);

export default App;