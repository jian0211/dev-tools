import { useState } from 'react';
import type { WorkspaceData, HarnessProject } from '../types';
import { PHASE_COLORS } from '../constants';
import { S } from '../styles/app.styles';
import { PhaseBar } from './common/PhaseBar';
import { CreateProjectModal } from './CreateProjectModal';

export function ProjectListView({ data, onSelect, workspacePath, onRefresh }: {
  data: WorkspaceData;
  onSelect: (p: HarnessProject) => void;
  workspacePath: string;
  onRefresh: () => void;
}) {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div style={S.listPage}>
      {showCreate && (
        <CreateProjectModal
          workspacePath={workspacePath}
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); onRefresh(); }}
        />
      )}

      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h2 style={{ ...S.sectionLabel, margin: 0 }}>Projects</h2>
          <button style={S.createBtn} onClick={() => setShowCreate(true)}>+ New Project</button>
        </div>
        {data.harness.length === 0 ? (
          <div style={S.emptyState}>
            <p style={S.emptyText}>.harness/ 폴더가 없습니다</p>
          </div>
        ) : (
          <div style={S.projectGrid}>
            {data.harness.map((p) => (
              <button key={p.name} style={S.projectCard} onClick={() => onSelect(p)}>
                <div style={S.projectCardTop}>
                  <span style={S.projectName}>{p.name}</span>
                  <span style={{ ...S.phaseBadgeSmall, backgroundColor: PHASE_COLORS[p.phase] || '#a8a29e' }}>
                    {p.phase.replace(/-/g, ' ')}
                  </span>
                </div>
                <PhaseBar phase={p.phase} />
                <div style={S.cardMeta}>
                  <span style={S.metaItem}>{p.folders.length} folders</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
