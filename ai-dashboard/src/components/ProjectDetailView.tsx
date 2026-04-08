import type { HarnessProject, MdFile, PhaseKey } from '../types';
import { PHASE_TABS } from '../types';
import { S } from '../styles/app.styles';
import { parseFilenameDisplay } from '../utils/parseFilename';
import { TaskBoardView } from './TaskBoardView';
import { PrReviewView } from './PrReviewView';
import { AskPanel } from './AskPanel';

export function ProjectDetailView({
  project, activePhase, activeSubTab, folderFiles, selectedFile,
  onPhaseChange, onSubTabChange, onFileSelect, workspacePath,
}: {
  project: HarnessProject; activePhase: PhaseKey; activeSubTab: string;
  folderFiles: MdFile[]; selectedFile: MdFile | null;
  onPhaseChange: (p: PhaseKey) => void; onSubTabChange: (tab: string) => void;
  onFileSelect: (f: MdFile) => void; workspacePath: string;
}) {
  const phases = Object.keys(PHASE_TABS) as PhaseKey[];
  const subTabs = PHASE_TABS[activePhase].subTabs;

  return (
    <div style={S.detailPage}>
      <nav style={S.phaseTabs}>
        {phases.map((p) => (
          <button
            key={p}
            style={{ ...S.phaseTab, ...(p === activePhase ? S.phaseTabActive : {}) }}
            onClick={() => onPhaseChange(p)}
          >
            {PHASE_TABS[p].label}
          </button>
        ))}
      </nav>

      <nav style={S.subTabs}>
        {subTabs.map((tab) => {
          const exists = project.folders.includes(tab);
          return (
            <button
              key={tab}
              style={{
                ...S.subTab,
                ...(tab === activeSubTab ? S.subTabActive : {}),
                opacity: exists ? 1 : 0.35,
              }}
              onClick={() => onSubTabChange(tab)}
            >
              {tab}
              {exists && <span style={S.dot} />}
            </button>
          );
        })}
      </nav>

      {activeSubTab === 'tasks' ? (
        <TaskBoardView files={folderFiles} />
      ) : activeSubTab === 'pr' ? (
        <PrReviewView files={folderFiles} />
      ) : (
        <div style={S.contentArea}>
          <aside style={S.fileSidebar}>
            <div style={S.sidebarHeader}>{activeSubTab}/</div>
            {folderFiles.length === 0 ? (
              <p style={S.emptySmall}>No files</p>
            ) : (
              folderFiles.map((f) => {
                const parsed = parseFilenameDisplay(f);
                const isCurrent = f.name === 'current.md';
                return (
                  <button
                    key={f.name}
                    style={{ ...S.fileItem, ...(selectedFile?.name === f.name ? S.fileItemActive : {}) }}
                    onClick={() => onFileSelect(f)}
                  >
                    {isCurrent ? (
                      <>
                        <span style={S.fileIcon}>◉</span>
                        current.md
                      </>
                    ) : parsed ? (
                      <>
                        <span style={S.fileDate}>{parsed.date}</span>
                        <span style={S.fileFeature}>{parsed.feature}</span>
                      </>
                    ) : (
                      <>
                        <span style={S.fileIcon}>○</span>
                        {f.name}
                      </>
                    )}
                  </button>
                );
              })
            )}
          </aside>

          <main style={S.docViewerWrap}>
            <div style={S.docViewer}>
              {selectedFile ? (
                <>
                  <div style={S.docHeader}>
                    <span style={S.docFileName}>{selectedFile.name}</span>
                  </div>
                  <pre style={S.docContent}>{selectedFile.content}</pre>
                </>
              ) : (
                <div style={S.emptyDoc}>
                  <p style={S.emptySmall}>Select a document</p>
                </div>
              )}
            </div>
            <AskPanel
              workspacePath={workspacePath}
              project={project.name}
              phase={activePhase}
              subTab={activeSubTab}
              docContent={selectedFile?.content || ''}
              docName={selectedFile?.name || ''}
            />
          </main>
        </div>
      )}
    </div>
  );
}
