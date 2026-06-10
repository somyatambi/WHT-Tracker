import { useLocalStorage } from './useLocalStorage';
import type { Habit, HabitLog } from '../types';
import { v4 as uuidv4 } from 'uuid';

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

export type HabitState = ReturnType<typeof useHabits>;