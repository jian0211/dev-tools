import { useState, useEffect, useCallback } from 'react';
import type { WorkspaceData, HarnessProject, MdFile, PhaseKey } from './types';
import { PHASE_TABS } from './types';
import { PHASE_COLORS, DEFAULT_PATH } from './constants';
import { S } from './styles/app.styles';
import { ProjectListView } from './components/ProjectListView';
import { ProjectDetailView } from './components/ProjectDetailView';

export function App() {
  const [workspacePath, setWorkspacePath] = useState(DEFAULT_PATH);
  const [inputPath, setInputPath] = useState(DEFAULT_PATH);
  const [data, setData] = useState<WorkspaceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<HarnessProject | null>(null);
  const [activePhase, setActivePhase] = useState<PhaseKey>('plan');
  const [activeSubTab, setActiveSubTab] = useState<string>('meeting');
  const [folderFiles, setFolderFiles] = useState<MdFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<MdFile | null>(null);

  const isElectron = !!window.electronAPI;

  const loadData = useCallback(async () => {
    if (!isElectron) {
      setError('Electron 환경에서만 동작합니다. npm run dev 로 실행해주세요.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setData(await window.electronAPI!.getWorkspaceData(workspacePath));
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [workspacePath, isElectron]);

  useEffect(() => { loadData(); }, [loadData]);

  const loadFolder = useCallback(async (project: string, folder: string) => {
    if (!isElectron) return;
    const files = await window.electronAPI!.getHarnessFolder(workspacePath, project, folder);
    setFolderFiles(files);
    setSelectedFile(files[0] || null);
  }, [workspacePath, isElectron]);

  useEffect(() => {
    if (selectedProject) loadFolder(selectedProject.name, activeSubTab);
  }, [selectedProject, activeSubTab, loadFolder]);

  const handleSelectProject = (project: HarnessProject) => {
    setSelectedProject(project);
    setActivePhase('plan');
    setActiveSubTab('meeting');
  };

  const handleBack = () => {
    setSelectedProject(null);
    setFolderFiles([]);
    setSelectedFile(null);
  };

  const handlePhaseChange = (phase: PhaseKey) => {
    setActivePhase(phase);
    setActiveSubTab(PHASE_TABS[phase].subTabs[0]);
  };

  return (
    <div style={S.container}>
      <header style={S.header}>
        <div style={S.headerLeft}>
          {selectedProject && (
            <button style={S.backBtn} onClick={handleBack}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
          <h1 style={S.title}>
            {selectedProject ? selectedProject.name : 'AI Dashboard'}
          </h1>
          {selectedProject && (
            <span style={{ ...S.phaseBadge, backgroundColor: PHASE_COLORS[selectedProject.phase] || '#a8a29e' }}>
              {selectedProject.phase.replace(/-/g, ' ')}
            </span>
          )}
        </div>
        {!selectedProject && (
          <div style={S.pathBar}>
            <input
              style={S.pathInput}
              value={inputPath}
              onChange={(e) => setInputPath(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setWorkspacePath(inputPath)}
              placeholder="워크스페이스 경로"
            />
            <button style={S.btn} onClick={() => setWorkspacePath(inputPath)}>Load</button>
            <button style={S.btnGhost} onClick={loadData}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1.5 7a5.5 5.5 0 1 1 1.1 3.3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                <path d="M1.5 10.5V7H5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        )}
      </header>

      {error && <div style={S.error}>{error}</div>}
      {loading && <div style={S.loading}>Loading...</div>}

      {!selectedProject && data && (
        <ProjectListView data={data} onSelect={handleSelectProject} workspacePath={workspacePath} onRefresh={loadData} />
      )}

      {selectedProject && (
        <ProjectDetailView
          project={selectedProject}
          activePhase={activePhase}
          activeSubTab={activeSubTab}
          folderFiles={folderFiles}
          selectedFile={selectedFile}
          onPhaseChange={handlePhaseChange}
          onSubTabChange={setActiveSubTab}
          onFileSelect={setSelectedFile}
          workspacePath={workspacePath}
        />
      )}
    </div>
  );
}
