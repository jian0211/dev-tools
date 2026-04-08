import * as path from 'path';
import * as fs from 'fs';
import { readDirSafe, readFileSafe, parseHarnessFilename } from './fileSystem';

export function detectHarnessPhase(projectPath: string) {
  const has = (sub: string) => fs.existsSync(path.join(projectPath, sub));
  const hasMd = (sub: string) => readDirSafe(path.join(projectPath, sub)).some((f) => f.endsWith('.md'));
  if (has('pr') && readDirSafe(path.join(projectPath, 'pr')).length > 0) return 'deliver-done';
  if (has('self-review') && hasMd('self-review')) return 'deliver-ready';
  if (has('tasks') && readDirSafe(path.join(projectPath, 'tasks')).length > 0) return 'build';
  if (has('spec') && hasMd('spec')) return 'design';
  if (has('prd') && hasMd('prd')) return 'plan-in-progress';
  return 'plan-not-started';
}

export function readHarnessProjects(workspacePath: string) {
  const harnessDir = path.join(workspacePath, '.harness');
  if (!fs.existsSync(harnessDir)) return [];

  return readDirSafe(harnessDir)
    .filter((f) => fs.statSync(path.join(harnessDir, f)).isDirectory())
    .map((name) => ({
      name,
      phase: detectHarnessPhase(path.join(harnessDir, name)),
      folders: readDirSafe(path.join(harnessDir, name)),
    }));
}

export function readHarnessFolderFiles(workspacePath: string, projectName: string, folder: string) {
  const folderPath = path.join(workspacePath, '.harness', projectName, folder);
  if (!fs.existsSync(folderPath)) return [];

  return readDirSafe(folderPath)
    .filter((f) => f.endsWith('.md'))
    .sort((a, b) => {
      if (a === 'current.md') return -1;
      if (b === 'current.md') return 1;
      const dateA = a.match(/^(\d{4}-\d{2}-\d{2})/)?.[1] || '';
      const dateB = b.match(/^(\d{4}-\d{2}-\d{2})/)?.[1] || '';
      if (dateA && dateB) {
        const cmp = dateB.localeCompare(dateA);
        return cmp !== 0 ? cmp : a.localeCompare(b);
      }
      if (dateA) return -1;
      if (dateB) return 1;
      return b.localeCompare(a);
    })
    .map((f) => {
      const parsed = parseHarnessFilename(f);
      return {
        name: f,
        content: readFileSafe(path.join(folderPath, f)) || '',
        ...(parsed && {
          parsedDate: parsed.date,
          parsedFeature: parsed.feature,
          parsedType: parsed.type,
        }),
      };
    });
}
