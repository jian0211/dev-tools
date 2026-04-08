import { useState } from 'react';
import type { MdFile } from '../types';
import { T } from '../styles/taskBoard.styles';

function parseTaskFile(f: MdFile) {
  const lines = f.content.split('\n');
  const title = (lines.find((l) => l.startsWith('# '))?.replace(/^#\s+/, '') || f.name).trim();

  const summaryMatch = f.content.match(/## 概要\n([^\n#]+)/);
  const summary = summaryMatch?.[1]?.trim() || '';

  const checkboxes = f.content.match(/- \[[ x]\] .+/g) || [];
  const items = checkboxes.map((line) => ({
    done: line.includes('[x]'),
    text: line.replace(/- \[[ x]\] /, ''),
  }));
  const total = items.length;
  const done = items.filter((i) => i.done).length;

  const filesMatch = f.content.match(/## 対象ファイル\n([\s\S]*?)(?=\n##|$)/);
  const targetFiles = filesMatch?.[1]?.match(/- .+/g)?.map((l) => l.replace(/^- /, '')) || [];

  const dateMatch = f.name.match(/^(\d{4}-\d{2}-\d{2})/);
  const date = dateMatch?.[1] || '';

  const status: 'done' | 'in-progress' | 'todo' =
    total > 0 && done === total ? 'done' : done > 0 ? 'in-progress' : 'todo';

  return { title, summary, items, total, done, status, targetFiles, date, fileName: f.name };
}

export function TaskBoardView({ files }: { files: MdFile[] }) {
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  const tasks = files.map(parseTaskFile);
  const grouped = [
    ...tasks.filter((t) => t.status === 'in-progress'),
    ...tasks.filter((t) => t.status === 'todo'),
    ...tasks.filter((t) => t.status === 'done'),
  ];

  const totalAll = tasks.reduce((s, t) => s + t.total, 0);
  const doneAll = tasks.reduce((s, t) => s + t.done, 0);

  const statusColor = { done: '#15803d', 'in-progress': '#d97706', todo: '#a8a29e' };
  const statusLabel = { done: 'Done', 'in-progress': 'In Progress', todo: 'Todo' };

  return (
    <div style={T.board}>
      <div style={T.boardHeader}>
        <div style={T.boardSummary}>
          <span style={T.boardTitle}>{tasks.length} Tasks</span>
          <span style={T.boardCount}>{doneAll}/{totalAll} items completed</span>
        </div>
        <div style={T.boardProgress}>
          <div style={{ ...T.boardProgressFill, width: `${totalAll > 0 ? (doneAll / totalAll) * 100 : 0}%` }} />
        </div>
        <div style={T.boardStats}>
          {(['in-progress', 'todo', 'done'] as const).map((s) => {
            const count = tasks.filter((t) => t.status === s).length;
            return count > 0 ? (
              <span key={s} style={{ ...T.statBadge, backgroundColor: statusColor[s] + '18', color: statusColor[s] }}>
                {statusLabel[s]} {count}
              </span>
            ) : null;
          })}
        </div>
      </div>

      <div style={T.cardList}>
        {grouped.map((task) => {
          const isExpanded = expandedTask === task.fileName;
          const pct = task.total > 0 ? Math.round((task.done / task.total) * 100) : 0;
          return (
            <div key={task.fileName} style={T.card}>
              <button style={T.cardHeader} onClick={() => setExpandedTask(isExpanded ? null : task.fileName)}>
                <div style={T.cardHeaderLeft}>
                  <span style={{ ...T.statusDot, backgroundColor: statusColor[task.status] }} />
                  <span style={T.cardTitle}>{task.title}</span>
                </div>
                <div style={T.cardHeaderRight}>
                  <span style={T.cardPct}>{pct}%</span>
                  <span style={T.expandIcon}>{isExpanded ? '▾' : '▸'}</span>
                </div>
              </button>

              <div style={T.cardBody}>
                {task.summary && <p style={T.cardSummary}>{task.summary}</p>}
                <div style={T.cardProgressBg}>
                  <div style={{ ...T.cardProgressFill, width: `${pct}%`, backgroundColor: statusColor[task.status] }} />
                </div>
                <div style={T.cardMeta}>
                  <span style={T.cardMetaText}>{task.done}/{task.total}</span>
                  {task.date && <span style={T.cardMetaDate}>{task.date.slice(5)}</span>}
                  {task.targetFiles.length > 0 && <span style={T.cardMetaFile}>{task.targetFiles[0]}</span>}
                </div>
              </div>

              {isExpanded && (
                <div style={T.cardExpanded}>
                  {task.items.map((item, i) => (
                    <div key={i} style={T.checkItem}>
                      <span style={{ ...T.checkBox, color: item.done ? '#15803d' : '#d6d0c4' }}>
                        {item.done ? '☑' : '☐'}
                      </span>
                      <span style={{ ...T.checkText, ...(item.done ? { textDecoration: 'line-through', color: '#a8a29e' } : {}) }}>
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
