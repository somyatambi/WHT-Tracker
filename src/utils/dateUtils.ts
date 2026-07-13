import {
  format,
  startOfWeek,
  addDays,
  subWeeks,
  addWeeks,
  getISOWeek,
  getISOWeekYear,
  isToday,
  isFuture,
  parseISO,
  isSameDay,
  subDays,
  isBefore,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval
} from 'date-fns';

// Derived from the first day of the *displayed* week, so all 7 days of a week
// share one id. Using the raw date would split a Sunday-start week across two
// ISO (Monday-based) week numbers.
export const getWeekId = (date: Date, weekStartsOn: 0 | 1 = 0): string => {
  const start = startOfWeek(date, { weekStartsOn });
  return `${getISOWeekYear(start)}-W${getISOWeek(start).toString().padStart(2, '0')}`;
};

export const getWeekDates = (date: Date, weekStartsOn: 0 | 1 = 0): Date[] => {
  const start = startOfWeek(date, { weekStartsOn });
  return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
};

export const formatDateId = (date: Date): string => format(date, 'yyyy-MM-dd');

export const getDisplayWeekRange = (dates: Date[]): string => {
  if (!dates.length) return '';
  const start = dates[0];
  const end = dates[dates.length - 1];
  return `Week of ${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`;
};

export const getStreak = (
  habitId: string,
  logs: { habitId: string; date: string; completed: boolean }[],
  todayStr: string = formatDateId(new Date())
) => {
  const habitLogs = logs.filter(l => l.habitId === habitId && l.completed);
  const completedDates = new Set(habitLogs.map(l => l.date));

  let streak = 0;
  let current = parseISO(todayStr);

  // If today isn't completed, start checking from yesterday
  if (!completedDates.has(todayStr)) {
    current = subDays(current, 1);
  }

  while (completedDates.has(formatDateId(current))) {
    streak++;
    current = subDays(current, 1);
  }

  return streak;
};

export const getBestStreak = (
  habitId: string,
  logs: { habitId: string; date: string; completed: boolean }[]
) => {
  const habitLogs = logs
    .filter(l => l.habitId === habitId && l.completed)
    .map(l => l.date)
    .sort();

  if (habitLogs.length === 0) return 0;

  let currentStreak = 1;
  let bestStreak = 1;

  for (let i = 1; i < habitLogs.length; i++) {
    const prev = parseISO(habitLogs[i - 1]);
    const curr = parseISO(habitLogs[i]);
    if (isSameDay(curr, addDays(prev, 1))) {
      currentStreak++;
      if (currentStreak > bestStreak) {
        bestStreak = currentStreak;
      }
    } else {
      currentStreak = 1;
    }
  }

  return bestStreak;
};
