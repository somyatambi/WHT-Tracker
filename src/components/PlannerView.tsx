import { useState, useEffect } from 'react';
import { useWeek } from '../hooks/useWeek';
import type { HabitState } from '../hooks/useHabits';
import type { TaskState } from '../hooks/useTasks';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { AppSettings, WeekNote, ChartDataPoint, DonutDataPoint } from '../types';
import { formatDateId, getStreak, getDisplayWeekRange } from '../utils/dateUtils';
import { format } from 'date-fns';
import { ArrowLeft, ArrowRight } from 'lucide-react';

import { WeekOverview } from './WeekOverview';
import { HabitTracker } from './HabitTracker';
import { DayColumn } from './DayColumn';
import { WeekNotes } from './WeekNotes';
import { HabitEditModal } from './HabitEditModal';

interface PlannerViewProps {
  settings: AppSettings;
  habitState: HabitState;
  taskState: TaskState;
}

export function PlannerView({ settings, habitState, taskState }: PlannerViewProps) {
  const weekStartDayNum = settings.weekStartDay === 'sunday' ? 0 : 1;
  const { weekId, currentDate, weekDates, nextWeek, prevWeek, jumpToToday } = useWeek(weekStartDayNum);
  const { habits, logs, addHabit, removeHabit, reorderHabits, toggleHabit } = habitState;
  const { tasks, addTask, updateTask, removeTask } = taskState;
  const [weekNotesStore, setWeekNotesStore] = useLocalStorage<WeekNote[]>('momentum_week_notes', []);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey) {
        if (e.key === 'ArrowRight') {
          nextWeek();
        } else if (e.key === 'ArrowLeft') {
          prevWeek();
        } else if (e.key === 't' || e.key === 'T') {
          e.preventDefault();
          jumpToToday();
        }
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

  // Weekly Stats
  const weekTasks = tasks.filter(t => t.weekId === weekId);
  const totalTasks = weekTasks.length;
  const completedTasks = weekTasks.filter(t => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const weeklyProgress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const streaks = habits.map(h => getStreak(h.id, logs));
  const maxStreak = streaks.length ? Math.max(...streaks) : 0;

  // Chart Data
  const chartData: ChartDataPoint[] = weekDates.map(date => {
    const dStr = formatDateId(date);
    const dTasks = weekTasks.filter(t => t.dayDate === dStr);
    const dCompleted = dTasks.filter(t => t.completed).length;
    return {
      name: format(date, 'eee'),
      done: dCompleted,
      remaining: dTasks.length - dCompleted
    };
  });

  const donutData: DonutDataPoint[] = [
    { name: 'Completed', value: completedTasks },
    { name: 'Remaining', value: pendingTasks }
  ];

  return (
    <>
      {/* Week Navigation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        marginBottom: '4px',
      }}>
        <button onClick={prevWeek} className="ghost-btn">
          <ArrowLeft style={{ width: 18, height: 18 }} />
        </button>
        <span style={{
          fontSize: 15,
          fontWeight: 500,
          color: 'var(--text-primary)',
          width: 200,
          textAlign: 'center',
        }}>
          {getDisplayWeekRange(weekDates)}
        </span>
        <button onClick={nextWeek} className="ghost-btn">
          <ArrowRight style={{ width: 18, height: 18 }} />
        </button>
        <button
          onClick={jumpToToday}
          style={{
            background: 'var(--accent)',
            color: '#000',
            fontWeight: 600,
            borderRadius: 20,
            padding: '6px 16px',
            fontSize: 13,
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          Today
        </button>
      </div>

      <WeekOverview
        completedTasks={completedTasks}
        pendingTasks={pendingTasks}
        maxStreak={maxStreak}
        weeklyProgress={weeklyProgress}
        chartData={chartData}
        donutData={donutData}
        settings={settings}
      />

      <HabitTracker
        showEditHabits={showEditHabits}
        setShowEditHabits={setShowEditHabits}
        habits={habits}
        weekDates={weekDates}
        logs={logs}
        toggleHabit={toggleHabit}
      />

      {/* Daily Tasks — 7-column grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 12,
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
              animationDelay={i * 100}
            />
          );
        })}
      </div>

      <WeekNotes weekNote={weekNote} updateWeekNote={updateWeekNote} />

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
