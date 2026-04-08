import { useState } from 'react';
import type { MdFile } from '../types';
import { parseFilenameDisplay } from '../utils/parseFilename';
import { P } from '../styles/prReview.styles';

interface PrTask {
  title: string;
  done: boolean;
  description: string;
  commits: Array<{ hash: string; message: string }>;
  changedFiles: string[];
}

interface PrData {
  title: string;
  branch: string;
  author: string;
  reviewers: string;
  summary: string;
  tasks: PrTask[];
  stats: string;
  fileName: string;
}

function parsePrFile(f: MdFile): PrData {
  const lines = f.content.split('\n');
  const title = (lines.find((l) => l.startsWith('# '))?.replace(/^#\s+/, '') || f.name).trim();

  const metaLines = lines.filter((l) => l.startsWith('> '));
  const branch = (metaLines[0] || '').replace(/^>\s*/, '').trim();
  const authorLine = metaLines[1] || '';
  const author = authorLine.match(/Author:\s*([^|]+)/)?.[1]?.trim() || '';
  const reviewers = authorLine.match(/Reviewers?:\s*(.+)/)?.[1]?.trim() || '';

  const summary = f.content.match(/## Summary\n([\s\S]*?)(?=\n## )/)?.[1]?.trim() || '';
  const stats = f.content.match(/## Stats\n([\s\S]*?)$/)?.[1]?.trim() || '';

  const tasks: PrTask[] = [];
  const taskSections = f.content.split(/### \[[ x]\] /);
  taskSections.slice(1).forEach((section) => {
    const sectionLines = section.split('\n');
    const titleLine = sectionLines[0] || '';
    const done = f.content.includes(`### [x] ${titleLine}`);

    const descLines: string[] = [];
    const commits: Array<{ hash: string; message: string }> = [];
    const changedFiles: string[] = [];
    let mode: 'desc' | 'commits' | 'files' | 'none' = 'desc';

    for (let i = 1; i < sectionLines.length; i++) {
      const line = sectionLines[i];
      if (line.startsWith('#### Commits')) { mode = 'commits'; continue; }
      if (line.startsWith('#### Changed Files')) { mode = 'files'; continue; }
      if (line.startsWith('### ')) break;

      if (mode === 'desc' && line.trim() && !line.startsWith('#')) descLines.push(line.trim());
      if (mode === 'commits' && line.startsWith('- `')) {
        const m = line.match(/^- `([^`]+)` (.+)/);
        if (m) commits.push({ hash: m[1], message: m[2] });
      }
      if (mode === 'files' && line.startsWith('- ')) changedFiles.push(line.replace(/^- /, ''));
    }

    tasks.push({ title: titleLine.trim(), done, description: descLines.join(' '), commits, changedFiles });
  });

  return { title, branch, author, reviewers, summary, tasks, stats, fileName: f.name };
}

export function PrReviewView({ files }: { files: MdFile[] }) {
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [selectedPr, setSelectedPr] = useState(0);

  if (files.length === 0) {
    return (
      <div style={{ ...P.board, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#a8a29e', fontSize: 13 }}>No PR files</p>
      </div>
    );
  }

  const pr = parsePrFile(files[selectedPr] || files[0]);
  const allDone = pr.tasks.length > 0 && pr.tasks.every((t) => t.done);
  const doneCount = pr.tasks.filter((t) => t.done).length;
  const totalCommits = pr.tasks.reduce((s, t) => s + t.commits.length, 0);

  return (
    <div style={P.board}>
      {files.length > 1 && (
        <div style={P.prSelector}>
          {files.map((f, i) => {
            const parsed = parseFilenameDisplay(f);
            return (
              <button
                key={f.name}
                style={{ ...P.prSelectorBtn, ...(i === selectedPr ? P.prSelectorBtnActive : {}) }}
                onClick={() => setSelectedPr(i)}
              >
                {parsed ? parsed.feature : f.name}
              </button>
            );
          })}
        </div>
      )}

      <div style={P.prHeader}>
        <div style={P.prTitleRow}>
          <span style={P.prStatusIcon}>{allDone ? '✓' : '○'}</span>
          <h2 style={P.prTitle}>{pr.title}</h2>
        </div>
        <div style={P.prMeta}>
          <code style={P.prBranch}>{pr.branch}</code>
          {pr.author && <span style={P.prAuthor}>by {pr.author}</span>}
          {pr.reviewers && <span style={P.prReviewers}>→ {pr.reviewers}</span>}
        </div>
        {pr.summary && <p style={P.prSummary}>{pr.summary}</p>}
        <div style={P.prStats}>
          <span style={P.prStatItem}>{doneCount}/{pr.tasks.length} tasks</span>
          <span style={P.prStatItem}>{totalCommits} commits</span>
          {pr.stats && pr.stats.split('\n').map((line, i) => {
            const m = line.match(/^- (.+)/);
            return m ? <span key={i} style={P.prStatItem}>{m[1]}</span> : null;
          })}
        </div>
      </div>

      <div style={P.taskList}>
        {pr.tasks.map((task, idx) => {
          const isExpanded = expandedTask === `${idx}`;
          return (
            <div key={idx} style={P.taskCard}>
              <button style={P.taskHeader} onClick={() => setExpandedTask(isExpanded ? null : `${idx}`)}>
                <div style={P.taskHeaderLeft}>
                  <span style={{ ...P.taskCheck, color: task.done ? '#15803d' : '#d6d0c4' }}>
                    {task.done ? '☑' : '☐'}
                  </span>
                  <span style={{ ...P.taskTitle, ...(task.done ? { color: '#a8a29e' } : {}) }}>
                    {task.title}
                  </span>
                </div>
                <div style={P.taskHeaderRight}>
                  <span style={P.commitCount}>{task.commits.length} commits</span>
                  <span style={P.expandIcon}>{isExpanded ? '▾' : '▸'}</span>
                </div>
              </button>

              {task.description && <p style={P.taskDesc}>{task.description}</p>}

              {isExpanded && (
                <div style={P.taskExpanded}>
                  <div style={P.commitSection}>
                    <div style={P.commitSectionLabel}>Commits</div>
                    {task.commits.map((c, ci) => (
                      <div key={ci} style={P.commitRow}>
                        <code style={P.commitHash}>{c.hash}</code>
                        <span style={P.commitMsg}>{c.message}</span>
                      </div>
                    ))}
                  </div>
                  {task.changedFiles.length > 0 && (
                    <div style={P.filesSection}>
                      <div style={P.commitSectionLabel}>Changed Files</div>
                      {task.changedFiles.map((file, fi) => (
                        <div key={fi} style={P.fileRow}>
                          <span style={P.fileIcon}>📄</span>
                          <code style={P.filePath}>{file}</code>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
