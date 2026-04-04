import { Box, Text, useInput } from 'ink'
import type { Project } from '../model/types.js'
import { PHASE_FOLDERS, PHASE_GROUPS } from '../model/types.js'
import { useWorkspace } from '../hooks/useWorkspace.js'
import { PhaseBar } from '../components/PhaseBar.js'
import { Sidebar } from '../components/Sidebar.js'
import { AiChat } from '../components/AiChat.js'
import { DocPanel } from '../components/DocPanel.js'
import { ErrorView } from '../components/ErrorView.js'
import { useState } from 'react'

type Props = { project: Project }

export function WorkspacePage({ project }: Props) {
  const ws = useWorkspace(project)
  const [focus, setFocus] = useState<'sidebar' | 'chat'>('chat')

  useInput((input, key) => {
    if (ws.error) {
      if (input === 'q') process.exit(0)
      ws.setError('')
      return
    }

    if (ws.pendingDocument) {
      if (input === 'y') ws.approve()
      if (input === 'n') ws.reject()
      return
    }

    if (key.tab) {
      setFocus((f) => (f === 'sidebar' ? 'chat' : 'sidebar'))
      return
    }

    if (focus === 'sidebar') {
      if (key.leftArrow) ws.prevPhase()
      if (key.rightArrow) ws.nextPhase()
      if (key.upArrow) ws.prevFile()
      if (key.downArrow) ws.nextFile()
      if (input === 'q') process.exit(0)
    }
  })

  if (ws.error) return <ErrorView message={ws.error} />

  return (
    <Box flexDirection="column">
      <Box paddingX={1}>
        <Text bold color="green">Harness</Text>
        <Text dimColor> — {project.name}</Text>
        <Box flexGrow={1} />
        <Text dimColor>
          Tab: {focus === 'sidebar' ? '채팅' : '사이드바'}
          {focus === 'sidebar' ? ' | ←→: Phase | ↑↓: 파일 | q: 종료' : ''}
        </Text>
      </Box>

      <PhaseBar
        phases={PHASE_GROUPS}
        activePhaseId={ws.phase?.id ?? 'plan'}
        phaseStatus={ws.phaseStatus}
      />

      <Box>
        <Sidebar
          folders={ws.folders.map((fn) => {
            const config = PHASE_FOLDERS.find((f) => f.folderName === fn)
            return {
              folderName: fn,
              label: config?.label ?? fn,
              hasFiles: (ws.folderFiles[fn] ?? []).length > 0,
            }
          })}
          activeFolderName={ws.folderName}
          files={ws.files}
          activeFileName={ws.activeFile?.name ?? ''}
          selectedIndex={ws.fileIdx}
        />

        <AiChat
          projectName={project.name}
          phaseId={ws.phase?.id ?? 'plan'}
          folderName={ws.folderName}
          fileName={ws.activeFile?.name ?? ''}
          fileContent={ws.fileContent}
          onDocumentGenerated={ws.setPendingDocument}
          isInputActive={focus === 'chat'}
        />

        <DocPanel
          folderName={ws.folderName}
          fileName={ws.activeFile?.name ?? 'current.md'}
          content={ws.fileContent}
          pendingContent={ws.pendingDocument}
          isEditable={ws.activeFile?.isEditable ?? true}
        />
      </Box>
    </Box>
  )
}
