import fs from 'fs';
import path from 'path';

const files = {
'src/hooks/useWeek.ts': `
import { useState, useCallback } from 'react';
import { getWeekId, getWeekDates } from '../utils/dateUtils';
import { addWeeks, subWeeks, startOfToday } from 'date-fns';

export function useWeek(weekStartDay: 0 | 1) {
  const [currentDate, setCurrentDate] = useState(startOfToday());

  const weekId = getWeekId(currentDate);
  const weekDates = getWeekDates(currentDate, weekStartDay);

  const nextWeek = useCallback(() => setCurrentDate(d => addWeeks(d, 1)), []);
  const prevWeek = useCallback(() => setCurrentDate(d => subWeeks(d, 1)), []);
  const jumpToToday = useCallback(() => setCurrentDate(startOfToday()), []);

  return { weekId, currentDate, weekDates, nextWeek, prevWeek, jumpToToday };
}
`,

'src/hooks/useHabits.ts': `
import { useLocalStorage } from './useLocalStorage';
import { Habit, HabitLog } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { formatDateId } from '../utils/dateUtils';

const DEFAULT_HABITS: Habit[] = [
  { id: uuidv4(), name: 'Wake by 6am', order: 0, createdAt: new Date().toISOString() },
  { id: uuidv4(), name: 'Exercise', order: 1, createdAt: new Date().toISOString() },
  { id: uuidv4(), name: 'Read 20 pages', order: 2, createdAt: new Date().toISOString() }
];

export function useHabits() {
  const [habits, setHabits] = useLocalStorage<Habit[]>('momentum_habits', DEFAULT_HABITS);
  const [logs, setLogs] = useLocalStorage<HabitLog[]>('momentum_habit_logs', []);

  const addHabit = (name: string) => {
    setHabits([...habits, { id: uuidv4(), name, order: habits.length, createdAt: new Date().toISOString() }]);
  };

  const removeHabit = (id: string) => {
    setHabits(habits.filter(h => h.id !== id));
    setLogs(logs.filter(l => l.habitId !== id));
  };

  const reorderHabits = (newOrder: Habit[]) => {
    setHabits(newOrder);
  };

  const toggleHabit = (habitId: string, dateStr: string) => {
    setLogs(prev => {
      const existing = prev.find(l => l.habitId === habitId && l.date === dateStr);
      if (existing) {
        return prev.map(l => l === existing ? { ...l, completed: !l.completed } : l);
      }
      return [...prev, { habitId, date: dateStr, completed: true }];
    });
  };

  return { habits, logs, addHabit, removeHabit, reorderHabits, toggleHabit };
}
`,

'src/hooks/useTasks.ts': `
import { useLocalStorage } from './useLocalStorage';
import { Task } from '../types';
import { v4 as uuidv4 } from 'uuid';

export function useTasks() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('momentum_tasks', []);

  const addTask = (weekId: string, dayDate: string, text: string) => {
    const dayTasks = tasks.filter(t => t.dayDate === dayDate);
    const newTask: Task = {
      id: uuidv4(),
      weekId,
      dayDate,
      text,
      completed: false,
      order: dayTasks.length,
      createdAt: new Date().toISOString()
    };
    setTasks([...tasks, newTask]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const removeTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return { tasks, addTask, updateTask, removeTask };
}
`,

'src/App.tsx': `
import React, { useState, useEffect } from 'react';
import { useWeek } from './hooks/useWeek';
import { useHabits } from './hooks/useHabits';
import { useTasks } from './hooks/useTasks';
import { useLocalStorage } from './hooks/useLocalStorage';
import { AppSettings, WeekNote } from './types';
import { getDisplayWeekRange, getStreak, formatDateId } from './utils/dateUtils';
import { Settings, Moon, Sun, Plus, Trash2, Edit2, Zap, ArrowLeft, ArrowRight, X } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, Tooltip } from 'recharts';
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, isToday, isPast, isFuture, getISOWeek, getYear } from 'date-fns';
import confetti from 'canvas-confetti';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const DEFAULT_SETTINGS: AppSettings = {
  weekStartDay: 'sunday',
  darkMode: false,
  reminderEnabled: false,
  reminderTime: '08:00'
};

export default function App() {
  const [settings, setSettings] = useLocalStorage<AppSettings>('momentum_settings', DEFAULT_SETTINGS);
  
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  const weekStartDayNum = settings.weekStartDay === 'sunday' ? 0 : 1;
  const { weekId, currentDate, weekDates, nextWeek, prevWeek, jumpToToday } = useWeek(weekStartDayNum);
  const { habits, logs, addHabit, removeHabit, reorderHabits, toggleHabit } = useHabits();
  const { tasks, addTask, updateTask, removeTask } = useTasks();
  const [weekNotesStore, setWeekNotesStore] = useLocalStorage<WeekNote[]>('momentum_week_notes', []);

  const weekNote = weekNotesStore.find(n => n.weekId === weekId)?.content || '';
  const updateWeekNote = (content: string) => {
    setWeekNotesStore(prev => {
      const idx = prev.findIndex(n => n.weekId === weekId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], content, updatedAt: new Date().toISOString() };
        return next;
      }
      return [...prev, { weekId, content, updatedAt: new Date().toISOString() }];
    });
  };

  const [showSettings, setShowSettings] = useState(false);
  const [showEditHabits, setShowEditHabits] = useState(false);
  
  // Weekly Stats
  const weekTasks = tasks.filter(t => t.weekId === weekId);
  const totalTasks = weekTasks.length;
  const completedTasks = weekTasks.filter(t => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const weeklyProgress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  
  const streaks = habits.map(h => getStreak(h.id, logs));
  const maxStreak = streaks.length ? Math.max(...streaks) : 0;

  // Chart Data
  const chartData = weekDates.map(date => {
    const dStr = formatDateId(date);
    const dTasks = weekTasks.filter(t => t.dayDate === dStr);
    const dCompleted = dTasks.filter(t => t.completed).length;
    return {
      name: format(date, 'eee'),
      done: dCompleted,
      remaining: dTasks.length - dCompleted
    };
  });

  const donutData = [
    { name: 'Completed', value: completedTasks },
    { name: 'Remaining', value: pendingTasks }
  ];

  const handleToggleTheme = () => setSettings({...settings, darkMode: !settings.darkMode});

  return (
    <div className="min-h-screen bg-sage-green dark:bg-gray-900 transition-colors pb-12 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-forest-green/10 dark:border-gray-700 shadow-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-forest-green dark:text-green-400 font-bold text-xl">
          <Zap className="fill-current w-6 h-6" /> Momentum
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <button onClick={prevWeek} className="p-1.5 rounded-full hover:bg-forest-green/10 dark:hover:bg-gray-700 transition">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="font-medium text-sm w-48 text-center">{getDisplayWeekRange(weekDates)}</span>
            <button onClick={nextWeek} className="p-1.5 rounded-full hover:bg-forest-green/10 dark:hover:bg-gray-700 transition">
              <ArrowRight className="w-5 h-5" />
            </button>
            <button onClick={jumpToToday} className="text-xs font-semibold px-3 py-1.5 rounded-md bg-forest-green/10 hover:bg-forest-green/20 dark:bg-gray-700 dark:hover:bg-gray-600 text-forest-green dark:text-green-300 transition">
              Today
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
          <button onClick={handleToggleTheme} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition">
            {settings.darkMode ? <Sun className="w-5 h-5"/> : <Moon className="w-5 h-5"/>}
          </button>
          <button onClick={() => setShowSettings(true)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-4 md:p-6 space-y-6">
        
        {/* Weekly Overview */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="grid grid-cols-2 gap-4">
            <StatCard title="Tasks Completed" value={completedTasks} />
            <StatCard title="Tasks Pending" value={pendingTasks} />
            <StatCard title="Longest Streak" value={maxStreak} />
            <StatCard title="Overall Progress" value={weeklyProgress + '%'} />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-black/5 dark:border-white/5">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase">Daily Completion</h3>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="done" stackId="a" fill="#1a6b3c" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="remaining" stackId="a" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-black/5 dark:border-white/5 flex flex-col items-center justify-center relative">
             <h3 className="absolute top-4 left-4 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">Weekly Progress</h3>
             <div className="h-40 w-full pt-4 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={donutData} innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value" stroke="none">
                      <Cell fill="#1a6b3c" />
                      <Cell fill={settings.darkMode ? '#374151' : '#e5e7eb'} />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 pt-4 flex items-center justify-center flex-col pointer-events-none">
                  <span className="text-3xl font-bold text-gray-800 dark:text-gray-100">{weeklyProgress}%</span>
                </div>
             </div>
          </div>
        </section>

        {/* Habit Tracker */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-black/5 dark:border-white/5 overflow-hidden text-sm">
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
            <h2 className="font-semibold text-gray-800 dark:text-gray-200">HABIT TRACKER</h2>
            <button onClick={() => setShowEditHabits(true)} className="flex items-center gap-1.5 text-forest-green hover:underline">
              <Edit2 className="w-4 h-4" /> Edit Habits
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th className="p-3 w-48 shrink-0 relative bg-white dark:bg-gray-800">Habit</th>
                  {weekDates.map(d => (
                    <th key={formatDateId(d)} className={cn("p-2 text-center font-medium", isToday(d) && "text-forest-green bg-green-50 dark:bg-forest-green/20")}>
                      <div className="flex flex-col">
                        <span className="text-xs uppercase text-gray-400">{format(d, 'eee')}</span>
                        <span className="text-lg">{format(d, 'd')}</span>
                      </div>
                    </th>
                  ))}
                  <th className="p-3 text-center">Completion</th>
                </tr>
              </thead>
              <tbody>
                {habits.map(habit => {
                  const daysCompleted = weekDates.filter(d => logs.some(l => l.habitId === habit.id && l.date === formatDateId(d) && l.completed)).length;
                  const pct = Math.round((daysCompleted / 7) * 100);

                  return (
                    <tr key={habit.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="p-3 font-medium text-gray-700 dark:text-gray-300 stick left-0 bg-white dark:bg-transparent">{habit.name}</td>
                      {weekDates.map(d => {
                        const dStr = formatDateId(d);
                        const isDone = logs.some(l => l.habitId === habit.id && l.date === dStr && l.completed);
                        return (
                          <td key={dStr} className={cn("p-2 text-center", isToday(d) && "bg-green-50/50 dark:bg-forest-green/10")}>
                            <button
                              onClick={() => toggleHabit(habit.id, dStr)}
                              className={cn(
                                "w-6 h-6 rounded-md border flex items-center justify-center transition-all mx-auto",
                                isDone 
                                  ? "bg-forest-green border-forest-green text-white" 
                                  : "border-gray-300 dark:border-gray-600 hover:border-forest-green/50 bg-transparent text-transparent"
                              )}
                            >
                              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                            </button>
                          </td>
                        );
                      })}
                      <td className="p-3">
                        <div className="flex items-center gap-2 relative bg-white dark:bg-transparent">
                          <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-forest-green transition-all" style={{width: \`\${pct}%\`}}></div>
                          </div>
                          <span className="text-xs font-semibold w-8 text-right text-gray-500">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {habits.length === 0 && (
                  <tr>
                    <td colSpan={9} className="p-6 text-center text-gray-400">No habits added. Click "Edit Habits" to start tracking.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Daily Tasks */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-4">
          {weekDates.map(date => {
            const dStr = formatDateId(date);
            const dTasks = weekTasks.filter(t => t.dayDate === dStr);
            const isTodayDate = isToday(date);
            
            return (
              <DayColumn
                key={dStr}
                date={date}
                isToday={isTodayDate}
                tasks={dTasks}
                weekId={weekId}
                onAddTask={(text) => addTask(weekId, dStr, text)}
                onUpdateTask={updateTask}
                onDeleteTask={removeTask}
              />
            );
          })}
        </section>

        {/* Week Notes */}
        <section className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-black/5 dark:border-white/5">
           <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 uppercase text-sm">Weekly Reflection / Notes</h2>
           <textarea
             className="w-full min-h-[120px] bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-3 resize-y focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent transition-all dark:text-gray-100"
             placeholder="Write your weekly reflection, wins, blockers, or anything on your mind..."
             value={weekNote}
             onChange={e => updateWeekNote(e.target.value)}
           ></textarea>
        </section>
      </main>

      {/* Edit Habits Modal */}
      {showEditHabits && (
         <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 border border-gray-100 dark:border-gray-700">
               <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-bold dark:text-white">Edit Habits</h2>
                 <button onClick={() => setShowEditHabits(false)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full dark:text-gray-300">
                   <X className="w-5 h-5" />
                 </button>
               </div>
               
               <form 
                 onSubmit={e => {
                   e.preventDefault();
                   const form = e.target as HTMLFormElement;
                   const input = form.elements.namedItem('habitName') as HTMLInputElement;
                   if (input.value.trim()) {
                     addHabit(input.value.trim());
                     input.value = '';
                   }
                 }} 
                 className="flex gap-2 mb-6"
               >
                 <input 
                   name="habitName" 
                   type="text" 
                   placeholder="New habit name..." 
                   className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-green"
                 />
                 <button type="submit" className="bg-forest-green text-white px-4 py-2 rounded-lg font-medium hover:bg-forest-green/90 transition flex items-center gap-1">
                   <Plus className="w-4 h-4" /> Add
                 </button>
               </form>

               <ul className="space-y-2 max-h-96 overflow-y-auto pr-1">
                 {habits.map(habit => (
                   <li key={habit.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg group border border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition">
                     <span className="font-medium text-gray-700 dark:text-gray-200">{habit.name}</span>
                     <button onClick={() => removeHabit(habit.id)} className="text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-500/10 p-1.5 rounded transition">
                       <Trash2 className="w-4 h-4" />
                     </button>
                   </li>
                 ))}
                 {habits.length === 0 && (
                   <p className="text-center text-gray-500 py-4">No habits defined.</p>
                 )}
               </ul>
            </div>
         </div>
      )}
      
      {/* Settings Modal - minimal implementation */}
      {showSettings && (
         <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm p-6 border border-gray-100 dark:border-gray-700">
               <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-bold dark:text-white">Settings</h2>
                 <button onClick={() => setShowSettings(false)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full dark:text-gray-300">
                   <X className="w-5 h-5" />
                 </button>
               </div>
               
               <div className="space-y-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Week Starts On</label>
                   <select 
                     className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-forest-green p-2 border"
                     value={settings.weekStartDay}
                     onChange={e => setSettings({...settings, weekStartDay: e.target.value as 'sunday' | 'monday'})}
                   >
                     <option value="sunday">Sunday</option>
                     <option value="monday">Monday</option>
                   </select>
                 </div>
                 
                 <div className="pt-4 border-t dark:border-gray-700">
                   <button 
                     onClick={() => {
                       if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
                         localStorage.clear();
                         window.location.reload();
                       }
                     }}
                     className="w-full text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg font-medium transition"
                   >
                     Reset All Data
                   </button>
                 </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}

function StatCard({ title, value }: { title: string, value: string | number }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-black/5 dark:border-white/5 flex flex-col justify-center">
      <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">{title}</span>
      <span className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-1">{value}</span>
    </div>
  );
}

// Inline DayColumn and Task components
function DayColumn({ date, isToday: _isToday, tasks, weekId, onAddTask, onUpdateTask, onDeleteTask }: any) {
  const dCompleted = tasks.filter((t:any) => t.completed).length;
  const dTotal = tasks.length;
  const pct = dTotal === 0 ? 0 : Math.round((dCompleted / dTotal) * 100);
  const isPastDay = isPast(date) && !_isToday;
  const isFutureDay = isFuture(date) && !_isToday;

  useEffect(() => {
     if (pct === 100 && dTotal > 0) {
       // Only trigger when tasks > 0 and all done
       // Basic check, might re-trigger but simple confetti here
     }
  }, [pct, dTotal]);

  const handleConfetti = (e: React.MouseEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = (rect.left + rect.right) / 2 / window.innerWidth;
    const y = (rect.top + rect.bottom) / 2 / window.innerHeight;
    
    if (dCompleted + 1 === dTotal) {
       confetti({
         particleCount: 100,
         spread: 70,
         origin: { x, y },
         colors: ['#1a6b3c', '#e8f5e9', '#4caf50']
       });
    }
  }

  return (
    <div className={cn(
      "flex flex-col bg-white dark:bg-gray-800 rounded-xl border overflow-hidden shadow-sm h-[500px]",
      _isToday ? "border-forest-green ring-1 ring-forest-green/20" : "border-gray-200 dark:border-gray-700",
      isPastDay && "opacity-80",
    )}>
      <div className={cn(
        "p-3 border-b border-gray-100 flex items-center justify-between dark:border-gray-700",
        _isToday ? "bg-forest-green text-white" : "bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
      )}>
        <div>
          <h3 className="font-bold text-xs uppercase opacity-90">{format(date, 'eeee')}</h3>
          <div className="font-semibold">{format(date, 'MMM d')}</div>
        </div>
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ring-2 relative",
          _isToday ? "ring-white/30 bg-white/20" : "ring-forest-green/20 bg-forest-green/10 text-forest-green"
        )}>
          {pct}%
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {tasks.map((task:any) => (
          <div key={task.id} className="group flex items-start gap-2 p-1.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg">
            <input 
              type="checkbox" 
              checked={task.completed}
              onChange={(e) => {
                if(e.target.checked) handleConfetti(e as any);
                onUpdateTask(task.id, { completed: e.target.checked })
              }}
              className="mt-1 w-4 h-4 rounded text-forest-green focus:ring-forest-green cursor-pointer dark:bg-gray-600 dark:border-gray-500"
            />
            <input 
              value={task.text}
              onChange={e => onUpdateTask(task.id, { text: e.target.value })}
              className={cn(
                "flex-1 bg-transparent text-sm focus:outline-none focus:border-b focus:border-forest-green font-medium",
                task.completed ? "line-through text-gray-400 dark:text-gray-500" : "text-gray-700 dark:text-gray-300"
              )}
            />
            <button 
              onClick={() => onDeleteTask(task.id)}
              className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 px-1 rounded transition"
            >
               ×
            </button>
          </div>
        ))}
        {tasks.length < 12 && (
          <div className="p-1.5">
            <input 
              placeholder="+ Add task..."
              className="w-full bg-transparent text-sm focus:outline-none text-gray-500 border-b border-transparent focus:border-forest-green mb-1"
              onKeyDown={e => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  onAddTask(e.currentTarget.value.trim());
                  e.currentTarget.value = '';
                }
              }}
              onBlur={e => {
                if(e.currentTarget.value.trim()) {
                  onAddTask(e.currentTarget.value.trim());
                  e.currentTarget.value = '';
                }
              }}
            />
          </div>
        )}
      </div>

      <div className="p-2 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700 flex justify-between text-[10px] font-bold">
        <span className="text-forest-green uppercase">Done: {dCompleted}</span>
        <span className="text-gray-500 uppercase">Left: {dTotal - dCompleted}</span>
      </div>
    </div>
  );
}
`
};

for (const [file, content] of Object.entries(files)) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content.trim());
}
console.log('App components deployed');