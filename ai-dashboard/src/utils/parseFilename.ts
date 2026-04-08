import type { MdFile } from '../types';

export function parseFilenameDisplay(f: MdFile): { date: string; feature: string } | null {
  if (f.parsedDate) {
    return { date: f.parsedDate.slice(5), feature: f.parsedFeature || f.name };
  }
  const m = f.name.match(/^(\d{4}-\d{2}-\d{2})-(.+)\.md$/);
  if (!m) return null;
  const parts = m[2].split('-');
  const feature = parts.length < 2 ? m[2] : parts.slice(0, -1).join('-');
  return { date: m[1].slice(5), feature };
}
