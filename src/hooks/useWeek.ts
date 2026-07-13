import { useState, useCallback } from 'react';
import { getWeekId, getWeekDates } from '../utils/dateUtils';
import { addWeeks, subWeeks, startOfToday } from 'date-fns';

export function useWeek(weekStartDay: 0 | 1) {
  const [currentDate, setCurrentDate] = useState(startOfToday());

  const weekId = getWeekId(currentDate, weekStartDay);
  const weekDates = getWeekDates(currentDate, weekStartDay);

  const nextWeek = useCallback(() => setCurrentDate(d => addWeeks(d, 1)), []);
  const prevWeek = useCallback(() => setCurrentDate(d => subWeeks(d, 1)), []);
  const jumpToToday = useCallback(() => setCurrentDate(startOfToday()), []);

  return { weekId, currentDate, weekDates, nextWeek, prevWeek, jumpToToday };
}