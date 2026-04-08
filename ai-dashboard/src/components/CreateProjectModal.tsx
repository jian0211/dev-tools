import { useState } from 'react';
import { S } from '../styles/app.styles';

export function CreateProjectModal({ workspacePath, onClose, onCreated }: {
  workspacePath: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    const trimmed = name.trim().toLowerCase().replace(/\s+/g, '-');
    if (!trimmed) return;
    setCreating(true);
    setError('');
    const result = await window.electronAPI!.createHarnessProject(workspacePath, trimmed);
    setCreating(false);
    if (result.ok) {
      onCreated();
    } else {
      setError(result.error || 'Failed');
    }
  };

  return (
    <div style={S.modalOverlay} onClick={onClose}>
      <div style={S.modal} onClick={(e) => e.stopPropagation()}>
        <h3 style={S.modalTitle}>New Project</h3>

        <label style={S.fieldLabel}>Workspace</label>
        <div style={S.fieldValue}>{workspacePath}</div>

        <label style={S.fieldLabel}>Project Name</label>
        <input
          style={S.modalInput}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          placeholder="e.g. beer-seo-optimization"
          autoFocus
        />
        <div style={S.fieldHint}>.harness/{name.trim().toLowerCase().replace(/\s+/g, '-') || '...'}/</div>

        {error && <div style={S.modalError}>{error}</div>}

        <div style={S.modalActions}>
          <button style={S.btnGhost} onClick={onClose}>Cancel</button>
          <button style={S.btn} onClick={handleCreate} disabled={creating || !name.trim()}>
            {creating ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}
