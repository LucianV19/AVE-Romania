import { REGIUNI as DEFAULT_REGIONS } from '../formular/constants';

const STORAGE_KEY = 'gala_regions';

export function getRegions(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.every(p => typeof p === 'string')) return parsed;
    }
  } catch (e) {
    // ignore and fallback
  }
  return DEFAULT_REGIONS.slice();
}

export function saveRegions(regions: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(regions));
  } catch (e) {
    console.warn('Could not save regions', e);
  }
}

export function resetRegions() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not reset regions', e);
  }
}

export default { getRegions, saveRegions, resetRegions };
