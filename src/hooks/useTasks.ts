import { useLocalStorage } from './useLocalStorage';
import type { Task } from '../types';
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

export type TaskState = ReturnType<typeof useTasks>;