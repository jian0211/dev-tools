import { execSync } from 'child_process';

export function getGitInfo(workspacePath: string) {
  try {
    const opts = { cwd: workspacePath, encoding: 'utf-8' as const };
    const branch = execSync('git rev-parse --abbrev-ref HEAD', opts).trim();
    const status = execSync('git status --short', opts).trim();
    const recentCommits = execSync('git log --oneline -10 --format="%h %s (%ar)"', opts).trim();
    const modifiedFiles = status.split('\n').filter(Boolean).map((line) => {
      const parts = line.trim().split(/\s+/);
      return { status: parts[0], file: parts.slice(1).join(' ') };
    });
    return { branch, modifiedFiles, recentCommits: recentCommits.split('\n').filter(Boolean) };
  } catch {
    return { branch: '', modifiedFiles: [], recentCommits: [] };
  }
}
