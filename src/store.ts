import { freshState, sanitize } from './logic';
import type { State } from './types';

const KEY = 'before-you-leave/v1';

export function load(): State {
  try {
    const saved = localStorage.getItem(KEY);
    return saved ? sanitize(JSON.parse(saved)) : freshState();
  } catch {
    return freshState();
  }
}

/** Returns false if the browser refused to save, so the app can warn the player. */
export function save(state: State): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function downloadBackup(state: State): void {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `before-you-leave-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

/** Throws if the file isn't JSON. Unknown contents are dropped by sanitize. */
export async function readBackup(file: File): Promise<State> {
  return sanitize(JSON.parse(await file.text()));
}
