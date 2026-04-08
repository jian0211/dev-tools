import * as path from 'path';
import * as fs from 'fs';
import { readDirSafe, readFileSafe } from './fileSystem';

export function readClaudeConfig(workspacePath: string) {
  const claudeDir = path.join(workspacePath, '.claude');
  if (!fs.existsSync(claudeDir)) return null;

  const readMdFiles = (dir: string) => {
    const files = readDirSafe(dir).filter((f) => f.endsWith('.md'));
    return files.map((f) => ({
      name: f,
      content: readFileSafe(path.join(dir, f))?.slice(0, 500) || '',
    }));
  };

  return {
    plans: readMdFiles(path.join(claudeDir, 'plans')),
    agents: readMdFiles(path.join(claudeDir, 'agents')),
    commands: readDirSafe(path.join(claudeDir, 'commands')),
    skills: readDirSafe(path.join(claudeDir, 'skills')),
    hooks: readDirSafe(path.join(claudeDir, 'hooks')),
    settings: JSON.parse(readFileSafe(path.join(claudeDir, 'settings.json')) || '{}'),
  };
}

export function readAiTasks(workspacePath: string) {
  const tasksDir = path.join(workspacePath, 'ai-tasks');
  if (!fs.existsSync(tasksDir)) return [];

  const files = readDirSafe(tasksDir).filter((f) => f.endsWith('.md'));
  return files.map((f) => {
    const content = readFileSafe(path.join(tasksDir, f)) || '';
    const checkboxes = content.match(/- \[[ x]\]/g) || [];
    const done = checkboxes.filter((c) => c.includes('[x]')).length;
    return {
      name: f.replace('.md', ''),
      file: f,
      total: checkboxes.length,
      done,
      preview: content.slice(0, 300),
    };
  });
}
