#!/usr/bin/env node
import { Box, Text, render, useInput } from 'ink'
import TextInput from 'ink-text-input'
import { useState, useEffect } from 'react'
import { PhaseBar } from './components/PhaseBar.js'
import { Sidebar } from './components/Sidebar.js'
import { AiChat } from './components/AiChat.js'
import { DocPanel } from './components/DocPanel.js'
import {
  PHASE_FOLDERS,
  PHASE_GROUPS,
  phaseStatusToGroupId,
} from './model/types.js'
import type { FileEntry, PhaseStatus, Project } from './model/types.js'
import {
  archiveAndWrite,
  createProject,
  detectPhase,
  listProjects,
  scanPhaseFolder,
} from './model/projectFs.js'
import { readFile } from './lib/fs.js'

function App() {
  const rootPath = process.argv[2] || process.cwd()

  const [project, setProject] = useState<Project | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [phaseStatus, setPhaseStatus] = useState<PhaseStatus>('plan-not-started')
  const [activePhaseIdx, setActivePhaseIdx] = useState(0)
  const [folderFiles, setFolderFiles] = useState<Record<string, FileEntry[]>>({})
  const [activeFolderIdx, setActiveFolderIdx] = useState(0)
  const [activeFileIdx, setActiveFileIdx] = useState(0)
  const [fileContent, setFileContent] = useState('')
  const [pendingDocument, setPendingDocument] = useState<string | null>(null)
  const [focus, setFocus] = useState<'sidebar' | 'chat'>('chat')

  // 프로젝트 선택 화면
  const [selectIdx, setSelectIdx] = useState(0)
  const [isCreating, setIsCreating] = useState(false)
  const [newName, setNewName] = useState('')

  const activePhase = PHASE_GROUPS[activePhaseIdx]
  const currentFolders = activePhase?.folders ?? []
  const activeFolderName = currentFolders[activeFolderIdx] ?? ''
  const files = folderFiles[activeFolderName] ?? []
  const activeFile = files[activeFileIdx] ?? null

  // "새 프로젝트" 옵션을 포함한 메뉴 아이템
  const menuItems = [...projects.map((p) => p.name), '+ 새 프로젝트 만들기']

  function refreshProjects() {
    listProjects(rootPath).then(setProjects)
  }

  // 초기 로드
  useEffect(() => {
    refreshProjects()
  }, [rootPath])

  // 프로젝트 선택 시 phase 로드
  useEffect(() => {
    if (!project) return
    ;(async () => {
      const status = await detectPhase(project.dirPath)
      setPhaseStatus(status)
      const phaseId = phaseStatusToGroupId(status)
      const idx = PHASE_GROUPS.findIndex((g) => g.id === phaseId)
      setActivePhaseIdx(idx >= 0 ? idx : 0)
    })()
  }, [project])

  // phase 변경 시 폴더 파일 로드
  useEffect(() => {
    if (!project || !activePhase) return
    ;(async () => {
      const newFiles: Record<string, FileEntry[]> = {}
      for (const folderName of activePhase.folders) {
        const config = PHASE_FOLDERS.find((f) => f.folderName === folderName)
        if (!config) continue
        newFiles[folderName] = await scanPhaseFolder(project.dirPath, folderName, {
          hasHistory: config.hasHistory,
          sequential: config.sequential,
        })
      }
      setFolderFiles(newFiles)
      setActiveFolderIdx(0)
      setActiveFileIdx(0)
    })()
  }, [project, activePhaseIdx])

  // 파일 선택 시 내용 로드
  useEffect(() => {
    if (!activeFile) {
      setFileContent('')
      return
    }
    readFile(activeFile.path).then(setFileContent)
  }, [activeFile?.path])

  // 키보드 입력
  useInput((input, key) => {
    // 프로젝트 생성 중이면 TextInput이 처리
    if (!project && isCreating) return

    // 프로젝트 미선택 상태
    if (!project) {
      if (key.upArrow) setSelectIdx((i) => Math.max(0, i - 1))
      if (key.downArrow) setSelectIdx((i) => Math.min(menuItems.length - 1, i + 1))
      if (key.return) {
        if (selectIdx < projects.length) {
          setProject(projects[selectIdx])
        } else {
          setIsCreating(true)
        }
      }
      if (input === 'q') process.exit(0)
      return
    }

    // 문서 승인/거절
    if (pendingDocument) {
      if (input === 'y') {
        archiveAndWrite(project.dirPath, activeFolderName, pendingDocument).then(() => {
          setPendingDocument(null)
          const config = PHASE_FOLDERS.find((f) => f.folderName === activeFolderName)
          if (config) {
            scanPhaseFolder(project.dirPath, activeFolderName, {
              hasHistory: config.hasHistory,
              sequential: config.sequential,
            }).then((entries) => {
              setFolderFiles((prev) => ({ ...prev, [activeFolderName]: entries }))
              setActiveFileIdx(0)
            })
          }
        })
      }
      if (input === 'n') setPendingDocument(null)
      return
    }

    // Tab: 포커스 전환
    if (key.tab) {
      setFocus((f) => (f === 'sidebar' ? 'chat' : 'sidebar'))
      return
    }

    // Phase 전환: ← →
    if (key.leftArrow && focus === 'sidebar') {
      setActivePhaseIdx((i) => Math.max(0, i - 1))
      return
    }
    if (key.rightArrow && focus === 'sidebar') {
      setActivePhaseIdx((i) => Math.min(PHASE_GROUPS.length - 1, i + 1))
      return
    }

    // 사이드바: ↑↓ 파일 선택
    if (focus === 'sidebar') {
      if (key.upArrow) setActiveFileIdx((i) => Math.max(0, i - 1))
      if (key.downArrow) setActiveFileIdx((i) => Math.min(files.length - 1, i + 1))
    }

    // q: 종료 (사이드바 포커스일 때만)
    if (input === 'q' && focus === 'sidebar') process.exit(0)
  })

  // 새 프로젝트 생성 핸들러
  async function handleCreateProject(name: string) {
    if (!name.trim()) {
      setIsCreating(false)
      return
    }
    const newProject = await createProject(rootPath, name.trim())
    refreshProjects()
    setProject(newProject)
    setIsCreating(false)
    setNewName('')
  }

  // 프로젝트 선택 화면
  if (!project) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text bold color="green">Harness</Text>
        <Text dimColor>경로: {rootPath}</Text>
        <Text />

        {isCreating ? (
          <Box flexDirection="column">
            <Text>프로젝트 이름을 입력하세요:</Text>
            <Box>
              <Text color="green">{'> '}</Text>
              <TextInput
                value={newName}
                onChange={setNewName}
                onSubmit={handleCreateProject}
              />
            </Box>
            <Text dimColor>Enter: 생성 / Esc로 취소 불가 — 빈 입력 시 취소</Text>
          </Box>
        ) : (
          <Box flexDirection="column">
            <Text>프로젝트를 선택하세요 (↑↓ Enter, q: 종료)</Text>
            <Box marginTop={1} flexDirection="column">
              {menuItems.map((item, i) => (
                <Text
                  key={item}
                  color={i === selectIdx ? 'green' : i < projects.length ? 'white' : 'yellow'}
                  bold={i === selectIdx}
                >
                  {i === selectIdx ? '▸ ' : '  '}{item}
                </Text>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    )
  }

  return (
    <Box flexDirection="column" height={process.stdout.rows || 30}>
      {/* Header */}
      <Box paddingX={1}>
        <Text bold color="green">Harness</Text>
        <Text dimColor> — {project.name}</Text>
        <Box flexGrow={1} />
        <Text dimColor>Tab:전환 q:종료</Text>
      </Box>

      {/* Phase Bar */}
      <PhaseBar
        phases={PHASE_GROUPS}
        activePhaseId={activePhase?.id ?? 'plan'}
        phaseStatus={phaseStatus}
      />

      {/* Main: Sidebar | Chat | Doc */}
      <Box flexGrow={1}>
        <Sidebar
          folders={currentFolders.map((fn) => {
            const config = PHASE_FOLDERS.find((f) => f.folderName === fn)
            return {
              folderName: fn,
              label: config?.label ?? fn,
              hasFiles: (folderFiles[fn] ?? []).length > 0,
            }
          })}
          activeFolderName={activeFolderName}
          files={files}
          activeFileName={activeFile?.name ?? ''}
          selectedIndex={activeFileIdx}
        />

        <AiChat
          projectName={project.name}
          phaseId={activePhase?.id ?? 'plan'}
          folderName={activeFolderName}
          fileName={activeFile?.name ?? ''}
          fileContent={fileContent}
          onDocumentGenerated={setPendingDocument}
          isInputActive={focus === 'chat'}
        />

        <DocPanel
          folderName={activeFolderName}
          fileName={activeFile?.name ?? 'current.md'}
          content={fileContent}
          pendingContent={pendingDocument}
          isEditable={activeFile?.isEditable ?? true}
        />
      </Box>
    </Box>
  )
}

render(<App />)
