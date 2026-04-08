import * as fs from 'fs';

export function readDirSafe(dirPath: string): string[] {
  try {
    return fs.readdirSync(dirPath);
  } catch {
    return [];
  }
}

export function readFileSafe(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }
}

const DATE_PREFIX_RE = /^(\d{4}-\d{2}-\d{2})-(.+)\.md$/;

export function parseHarnessFilename(filename: string) {
  const m = filename.match(DATE_PREFIX_RE);
  if (!m) return null;
  const date = m[1];
  const parts = m[2].split('-');
  if (parts.length < 2) return { date, feature: m[2], type: '' };
  const type = parts[parts.length - 1];
  const feature = parts.slice(0, -1).join('-');
  return { date, feature, type };
}
