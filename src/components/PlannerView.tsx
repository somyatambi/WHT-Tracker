import { useState, useEffect } from 'react';
import type { HabitState } from '../hooks/useHabits';
import type { TaskState } from '../hooks/useTasks';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { AppSettings, WeekNote } from '../types';
import { formatDateId, getStreak, getDisplayWeekRange } from '../utils/dateUtils';
import { format } from 'date-fns';
import type { useWeek } from '../hooks/useWeek';

import { StatCard } from './StatsCard';
import { HabitTracker } from './HabitTracker';
import { DayColumn } from './DayColumn';
import { WeekNotes } from './WeekNotes';
import { StickyNotes } from './StickyNotes';
import { HabitEditModal } from './HabitEditModal';

type WeekNav = ReturnType<typeof useWeek>;

interface PlannerViewProps {
  settings: AppSettings;
  habitState: HabitState;
  taskState: TaskState;
  weekNav: WeekNav;
  addToast: (message: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

export function PlannerView({ settings: _settings, habitState, taskState, weekNav, addToast }: PlannerViewProps) {
  const { weekId, weekDates, nextWeek, prevWeek, jumpToToday } = weekNav;
  const { habits, logs, addHabit, removeHabit, toggleHabit } = habitState;
  const { tasks, addTask, updateTask, removeTask } = taskState;
  const [weekNotesStore, setWeekNotesStore] = useLocalStorage<WeekNote[]>('momentum_week_notes', []);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName);
      if (e.ctrlKey) {
        if (e.key === 'ArrowRight') { e.preventDefault(); nextWeek(); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); prevWeek(); }
        else if (e.key === 't' || e.key === 'T') { e.preventDefault(); jumpToToday(); }
      }
      if (e.key === 'Escape' && !isTyping) {
        setShowEditHabits(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextWeek, prevWeek, jumpToToday]);

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

  const [showEditHabits, setShowEditHabits] = useState(false);

  // A task belongs to the week whose columns contain its day. Matching on weekId
  // too would hide tasks saved under a differently-derived id.
  const weekDayIds = new Set(weekDates.map(formatDateId));

  // Weekly Stats
  const weekTasks = tasks.filter(t => weekDayIds.has(t.dayDate));
  const totalTasks = weekTasks.length;
  const completedTasks = weekTasks.filter(t => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const weeklyProgress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  const streaks = habits.map(h => getStreak(h.id, logs));
  const maxStreak = streaks.length ? Math.max(...streaks) : 0;

  return (
    <>
      {/* ── Week range subtitle ── */}
      <div style={{
        textAlign: 'center',
        padding: '16px 0 0',
        fontSize: 13,
        color: 'var(--text-muted)',
        fontWeight: 500,
      }}>
        {getDisplayWeekRange(weekDates)}
      </div>

      {/* ── 1. Stats Bar ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16,
        marginTop: 16,
      }}>
        <StatCard title="Tasks Done"        value={completedTasks}      index={0} />
        <StatCard title="Tasks Pending"     value={pendingTasks}         index={1} />
        <StatCard title="Longest Streak"    value={maxStreak}            index={2} />
        <StatCard title="Overall Progress"  value={`${weeklyProgress}%`} index={3} progressValue={weeklyProgress} />
      </div>

      {/* ── 2. Day Columns row ── */}
      <div style={{
        display: 'flex',
        gap: 14,
        overflowX: 'auto',
        paddingBottom: 12,
        marginTop: 20,
        scrollSnapType: 'x mandatory',
      }}>
        {weekDates.map((date, i) => {
          const dStr = formatDateId(date);
          const dTasks = weekTasks.filter(t => t.dayDate === dStr);
          const isTodayDate = format(new Date(), 'yyyy-MM-dd') === dStr;

          return (
            <DayColumn
              key={dStr}
              date={date}
              isToday={isTodayDate}
              tasks={dTasks}
              weekId={weekId}
              onAddTask={(text: string) => addTask(weekId, dStr, text)}
              onUpdateTask={updateTask}
              onDeleteTask={removeTask}
              animationDelay={i * 80}
              addToast={addToast}
            />
          );
        })}
      </div>

      {/* ── 3. Weekly Reflection (full width) ── */}
      <WeekNotes weekNote={weekNote} updateWeekNote={updateWeekNote} />

      {/* ── 4. Habit Tracker + Long-Term Notes side by side ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 20,
        marginTop: 20,
      }}>
        <HabitTracker
          showEditHabits={showEditHabits}
          setShowEditHabits={setShowEditHabits}
          habits={habits}
          weekDates={weekDates}
          logs={logs}
          toggleHabit={toggleHabit}
        />
        <StickyNotes />
      </div>

      <HabitEditModal
        showEditHabits={showEditHabits}
        setShowEditHabits={setShowEditHabits}
        habits={habits}
        addHabit={addHabit}
        removeHabit={removeHabit}
      />
    </>
  );
}
