import { parseISO } from 'date-fns';
import { getWeekId } from './dateUtils';
import type { AppSettings, WeekNote } from '../types';

const SCHEMA_KEY = 'momentum_schema_version';
const CURRENT_VERSION = 2;

/**
 * v2: weekId is now derived from the first day of the displayed week instead of
 * the raw date. Notes written Mon-Sat under the old ISO-week scheme carry the id
 * of the *following* Sunday-start week, so re-key them from their own timestamp.
 *
 * Must run before React mounts — the storage hooks read their initial value once.
 */
function migrateWeekNoteIds() {
  const raw = localStorage.getItem('momentum_week_notes');
  if (!raw) return;

  const settings: Partial<AppSettings> = JSON.parse(localStorage.getItem('momentum_settings') || '{}');
  const weekStartsOn = settings.weekStartDay === 'monday' ? 1 : 0;

  const notes: WeekNote[] = JSON.parse(raw);
  const byWeek = new Map<string, WeekNote>();

  for (const note of notes) {
    if (!note?.updatedAt) continue;
    const migrated = { ...note, weekId: getWeekId(parseISO(note.updatedAt), weekStartsOn) };
    const clash = byWeek.get(migrated.weekId);
    if (clash && clash.updatedAt > migrated.updatedAt) continue;
    byWeek.set(migrated.weekId, migrated);
  }

  localStorage.setItem('momentum_week_notes', JSON.stringify([...byWeek.values()]));
}

export function runMigrations() {
  try {
    if (Number(localStorage.getItem(SCHEMA_KEY) ?? 0) >= CURRENT_VERSION) return;
    migrateWeekNoteIds();
    localStorage.setItem(SCHEMA_KEY, String(CURRENT_VERSION));
  } catch (error) {
    console.error('Migration failed, leaving stored data untouched:', error);
  }
}
