const fs = require('fs');
const path = require('path');

const files = {
'src/components/Header.tsx': `
import { Zap, ArrowLeft, ArrowRight, Sun, Moon, Settings, BarChart2 } from 'lucide-react';
import { getDisplayWeekRange } from '../utils/dateUtils';
import { AppSettings } from '../types';

interface HeaderProps {
  settings: AppSettings;
  handleToggleTheme: () => void;
  setShowSettings: (s: boolean) => void;
  setShowAnalytics: (s: boolean) => void;
  showAnalytics: boolean;
  prevWeek: () => void;
  nextWeek: () => void;
  jumpToToday: () => void;
  weekDates: Date[];
}

export function Header({ settings, handleToggleTheme, setShowSettings, setShowAnalytics, showAnalytics, prevWeek, nextWeek, jumpToToday, weekDates }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-forest-green/10 dark:border-gray-700 shadow-sm px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2 text-forest-green dark:text-green-400 font-bold text-xl cursor-pointer" onClick={() => setShowAnalytics(false)}>
        <Zap className="fill-current w-6 h-6" /> Momentum
      </div>
      
      {!showAnalytics && <div className="flex items-center gap-6">
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
      </div>}

      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
        <button onClick={() => setShowAnalytics(!showAnalytics)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition" title="Analytics">
          <BarChart2 className="w-5 h-5" />
        </button>
        <button onClick={handleToggleTheme} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition">
          {settings.darkMode ? <Sun className="w-5 h-5"/> : <Moon className="w-5 h-5"/>}
        </button>
        <button onClick={() => setShowSettings(true)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
`,

'src/components/TaskItem.tsx': `
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Task } from '../types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function TaskItem({ task, onUpdateTask, onDeleteTask, handleConfetti }: any) {
  return (
    <div className="group flex items-start gap-2 p-1.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg">
      <input 
        type="checkbox" 
        checked={task.completed}
        onChange={(e) => {
          if(e.target.checked) handleConfetti(e);
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
  );
}
`,

'src/components/DayColumn.tsx': `
import { TaskItem } from './TaskItem';
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { isPast, isFuture, format } from 'date-fns';
import { useEffect } from 'react';
import confetti from 'canvas-confetti';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function DayColumn({ date, isToday: _isToday, tasks, weekId, onAddTask, onUpdateTask, onDeleteTask }: any) {
  const dCompleted = tasks.filter((t:any) => t.completed).length;
  const dTotal = tasks.length;
  const pct = dTotal === 0 ? 0 : Math.round((dCompleted / dTotal) * 100);
  const isPastDay = isPast(date) && !_isToday;
  const isFutureDay = isFuture(date) && !_isToday;

  const handleConfetti = (e: any) => {
    const rect = e.target.getBoundingClientRect();
    const x = (rect.left + rect.right) / 2 / window.innerWidth;
    const y = (rect.top + rect.bottom) / 2 / window.innerHeight;
    
    if (dCompleted + 1 === dTotal && dTotal > 0) {
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
      "flex flex-col bg-white dark:bg-gray-800 rounded-xl border overflow-hidden shadow-sm h-[600px] min-w-[280px]",
      _isToday ? "border-forest-green ring-1 ring-forest-green/20" : "border-gray-200 dark:border-gray-700",
      isPastDay && "opacity-80"
    )}>
      <div className={cn(
        "p-3 border-b border-gray-100 flex items-center justify-between dark:border-gray-700",
        _isToday ? "bg-forest-green text-white" : "bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
      )}>
        <div>
          <h3 className={cn("font-bold text-xs uppercase opacity-90", _isToday && "text-[14px]")}>
             {_isToday ? "TODAY" : format(date, 'eeee')}
          </h3>
          <div className="font-semibold">{format(date, 'dd-MM-yy')}</div>
        </div>
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ring-2 relative",
          _isToday ? "ring-white/30 bg-white/20" : "ring-forest-green/20 bg-forest-green/10 text-forest-green"
        )}>
          {pct}%
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-1 nice-scrollbar">
        {tasks.map((task:any) => (
          <TaskItem key={task.id} task={task} onUpdateTask={onUpdateTask} onDeleteTask={onDeleteTask} handleConfetti={handleConfetti} />
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
`,

'src/components/StatsCard.tsx': `
export function StatCard({ title, value }: { title: string, value: string | number }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-black/5 dark:border-white/5 flex flex-col justify-center">
      <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">{title}</span>
      <span className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-1">{value}</span>
    </div>
  );
}
`,

'src/components/WeekOverview.tsx': `
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, Tooltip } from 'recharts';
import { StatCard } from './StatsCard';

export function WeekOverview({ completedTasks, pendingTasks, maxStreak, weeklyProgress, chartData, donutData, settings }: any) {
  return (
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
              <Bar dataKey="done" stackId="a" fill="#1a6b3c" radius={[0, 0, 4, 4]} isAnimationActive={true} />
              <Bar dataKey="remaining" stackId="a" fill="#e5e7eb" radius={[4, 4, 0, 0]} isAnimationActive={true} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-black/5 dark:border-white/5 flex flex-col items-center justify-center relative">
         <h3 className="absolute top-4 left-4 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">Weekly Progress</h3>
         <div className="h-40 w-full pt-4 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={donutData} innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value" stroke="none" isAnimationActive={true}>
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
  );
}
`,

'src/components/HabitTracker.tsx': `
import { Edit2 } from 'lucide-react';
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, isToday } from 'date-fns';
import { formatDateId } from '../utils/dateUtils';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function HabitTracker({ showEditHabits, setShowEditHabits, habits, weekDates, logs, toggleHabit }: any) {
  return (
    <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-black/5 dark:border-white/5 overflow-hidden text-sm">
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
        <h2 className="font-semibold text-gray-800 dark:text-gray-200">HABIT TRACKER</h2>
        <button onClick={() => setShowEditHabits(true)} className="flex items-center gap-1.5 text-forest-green hover:underline">
          <Edit2 className="w-4 h-4" /> Edit Habits
        </button>
      </div>
      
      <div className="overflow-x-auto nice-scrollbar">
        <table className="w-full text-left min-w-[700px]">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-700">
              <th className="p-3 w-48 shrink-0 relative bg-white dark:bg-gray-800">Habit</th>
              {weekDates.map((d: Date) => (
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
            {habits.map((habit: any) => {
              const daysCompleted = weekDates.filter((d: Date) => logs.some((l: any) => l.habitId === habit.id && l.date === formatDateId(d) && l.completed)).length;
              const pct = Math.round((daysCompleted / 7) * 100);

              return (
                <tr key={habit.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="p-3 font-medium text-gray-700 dark:text-gray-300 stick left-0 bg-white dark:bg-transparent">{habit.name}</td>
                  {weekDates.map((d: Date) => {
                    const dStr = formatDateId(d);
                    const isDone = logs.some((l: any) => l.habitId === habit.id && l.date === dStr && l.completed);
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
                    <div className="flex items-center gap-2 relative bg-white dark:bg-transparent group/tooltip">
                      <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-forest-green transition-all" style={{width: \`\${pct}%\`}}></div>
                      </div>
                      <span className="text-xs font-semibold w-8 text-right text-gray-500">{pct}%</span>
                      <div className="absolute opacity-0 group-hover/tooltip:opacity-100 right-10 -top-8 bg-gray-800 text-white text-xs p-1 px-2 rounded whitespace-nowrap pointer-events-none transition">
                        {daysCompleted}/7 days completed
                      </div>
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
  );
}
`,

'src/components/HabitEditModal.tsx': `
import { X, Plus, Trash2 } from 'lucide-react';

export function HabitEditModal({ showEditHabits, setShowEditHabits, habits, addHabit, removeHabit }: any) {
  if (!showEditHabits) return null;
  return (
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

          <ul className="space-y-2 max-h-96 overflow-y-auto pr-1 nice-scrollbar">
            {habits.map((habit: any) => (
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
  );
}
`,

'src/components/SettingsModal.tsx': `
import { X, Download, Upload } from 'lucide-react';
import type { AppSettings } from '../types';

export function SettingsModal({ showSettings, setShowSettings, settings, setSettings, setShowEditHabits }: any) {
  if (!showSettings) return null;

  const handleExport = () => {
    const data = {
      momentum_habits: localStorage.getItem('momentum_habits'),
      momentum_habit_logs: localStorage.getItem('momentum_habit_logs'),
      momentum_tasks: localStorage.getItem('momentum_tasks'),
      momentum_week_notes: localStorage.getItem('momentum_week_notes'),
      momentum_settings: localStorage.getItem('momentum_settings')
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = \`momentum-export-\${new Date().toISOString().split('T')[0]}.json\`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.momentum_habits) localStorage.setItem('momentum_habits', data.momentum_habits);
        if (data.momentum_habit_logs) localStorage.setItem('momentum_habit_logs', data.momentum_habit_logs);
        if (data.momentum_tasks) localStorage.setItem('momentum_tasks', data.momentum_tasks);
        if (data.momentum_week_notes) localStorage.setItem('momentum_week_notes', data.momentum_week_notes);
        if (data.momentum_settings) localStorage.setItem('momentum_settings', data.momentum_settings);
        
        alert("Data imported successfully! The page will now reload.");
        window.location.reload();
      } catch (err) {
        alert("Invalid file format.");
      }
    };
    reader.readAsText(file);
  };

  return (
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

            <div>
              <button 
                onClick={() => {
                  setShowSettings(false);
                  setShowEditHabits(true);
                }}
                className="w-full text-left text-forest-green hover:bg-forest-green/10 dark:hover:bg-gray-700 px-3 py-2 rounded-lg font-medium transition"
              >
                Edit Habits
              </button>
            </div>
            
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
              <button 
                onClick={handleExport}
                className="w-full flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-3 py-2 rounded-lg font-medium transition"
              >
                <Download className="w-4 h-4" /> Export Data
              </button>
              
              <label className="w-full flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-3 py-2 rounded-lg font-medium transition cursor-pointer">
                <Upload className="w-4 h-4" /> Import Data
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </label>

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
  );
}
`,

'src/components/WeekNotes.tsx': `
export function WeekNotes({ weekNote, updateWeekNote }: any) {
  return (
    <section className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-black/5 dark:border-white/5">
        <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 uppercase text-sm">Weekly Reflection / Notes</h2>
        <textarea
          className="w-full min-h-[120px] bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-3 resize-y focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent transition-all dark:text-gray-100"
          placeholder="Write your weekly reflection, wins, blockers, or anything on your mind..."
          value={weekNote}
          onChange={e => updateWeekNote(e.target.value)}
        ></textarea>
    </section>
  );
}
`,

'src/components/Analytics.tsx': `
import { useHabits } from '../hooks/useHabits';
import { useTasks } from '../hooks/useTasks';
import { getBestStreak, getStreak, formatDateId } from '../utils/dateUtils';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format, subDays, startOfWeek, addWeeks, subWeeks, parseISO, eachDayOfInterval } from 'date-fns';
import { useMemo } from 'react';

export function Analytics() {
  const { habits, logs } = useHabits();
  const { tasks } = useTasks();

  // Streak data
  const streakData = habits.map((h: any) => ({
    name: h.name,
    current: getStreak(h.id, logs),
    best: getBestStreak(h.id, logs)
  })).sort((a: any, b: any) => b.best - a.best);

  // Completion trend (last 28 days)
  const trendData = useMemo(() => {
    const today = new Date();
    const days = eachDayOfInterval({ start: subDays(today, 27), end: today });
    return days.map(d => {
      const dStr = formatDateId(d);
      const dTasks = tasks.filter((t: any) => t.dayDate === dStr);
      const done = dTasks.filter((t: any) => t.completed).length;
      const pct = dTasks.length ? Math.round((done / dTasks.length) * 100) : 0;
      return { date: format(d, 'MMM d'), pct };
    });
  }, [tasks]);

  // Habit completion breakdown
  const habitLeaderboard = habits.map((h: any) => {
    const habitLogs = logs.filter((l: any) => l.habitId === h.id && l.completed).length;
    return { name: h.name, total: habitLogs };
  }).sort((a: any, b: any) => b.total - a.total);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Analytics</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-black/5 dark:border-white/5">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4 uppercase">Task Completion Trend</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12}} minTickGap={30} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} domain={[0, 100]} tickFormatter={(val) => \`\${val}%\`} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Line type="monotone" dataKey="pct" stroke="#1a6b3c" strokeWidth={3} dot={false} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-black/5 dark:border-white/5">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4 uppercase">Habits Leaderboard (All Time)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={habitLeaderboard} layout="vertical" margin={{ left: 50 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="total" fill="#1a6b3c" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-black/5 dark:border-white/5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4 uppercase">Streaks</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                  <th className="p-3 font-medium">Habit</th>
                  <th className="p-3 font-medium">Current Streak</th>
                  <th className="p-3 font-medium">Best Streak</th>
                </tr>
              </thead>
              <tbody>
                {streakData.map((s: any) => (
                  <tr key={s.name} className="border-b border-gray-50 dark:border-gray-700/50">
                    <td className="p-3 font-medium text-gray-800 dark:text-gray-200">{s.name}</td>
                    <td className="p-3 text-forest-green font-bold">{s.current} days</td>
                    <td className="p-3 font-bold text-gray-600 dark:text-gray-300">{s.best} days</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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
console.log('App components regenerated');