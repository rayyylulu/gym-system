import { createState } from './data.js';

const KEY = 'gym-system-v1';

function isValidState(data) {
  return Boolean(
    data && data.version === 1 && data.player && Array.isArray(data.history)
    && Array.isArray(data.inventory) && Array.isArray(data.plans) && Array.isArray(data.exercises),
  );
}

export function load() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY));
    if (isValidState(data)) return { ...createState(), ...data };
  } catch {
    // Beschädigte oder gesperrte Daten dürfen den Start nicht verhindern.
  }
  return createState();
}

export function save(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function requestPersistentStorage() {
  navigator.storage?.persist?.().catch(() => {});
}

export async function exportBackup(state) {
  const day = new Date().toISOString().slice(0, 10);
  const file = new File([JSON.stringify(state)], `gym-system-backup-${day}.json`, { type: 'application/json' });

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return true;
    } catch (error) {
      if (error.name === 'AbortError') return false;
    }
  }

  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name;
  link.click();
  URL.revokeObjectURL(url);
  return true;
}

export function parseBackup(text) {
  try {
    const data = JSON.parse(text);
    return isValidState(data) ? { ...createState(), ...data } : null;
  } catch {
    return null;
  }
}
