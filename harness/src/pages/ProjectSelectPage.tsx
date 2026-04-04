import { Box, Text, useInput } from 'ink'
import TextInput from 'ink-text-input'
import { useState } from 'react'
import type { Project } from '../model/types.js'

type Props = {
  rootPath: string
  projects: Project[]
  onSelect: (project: Project) => void
  onCreate: (name: string) => Promise<Project>
}

export function ProjectSelectPage({ rootPath, projects, onSelect, onCreate }: Props) {
  const [selectIdx, setSelectIdx] = useState(0)
  const [isCreating, setIsCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [error, setError] = useState('')

  const menuItems = [...projects.map((p) => p.name), '+ 새 프로젝트 만들기']

  useInput((input, key) => {
    if (isCreating) {
      if (key.escape) { setIsCreating(false); setNewName('') }
      return
    }
    if (key.upArrow) setSelectIdx((i) => Math.max(0, i - 1))
    if (key.downArrow) setSelectIdx((i) => Math.min(menuItems.length - 1, i + 1))
    if (key.return) {
      if (selectIdx < projects.length) {
        onSelect(projects[selectIdx])
      } else {
        setIsCreating(true)
      }
    }
    if (input === 'q') process.exit(0)
  })

  async function handleCreate(name: string) {
    if (!name.trim()) { setIsCreating(false); return }
    try {
      const p = await onCreate(name)
      onSelect(p)
    } catch (e) { setError(String(e)) }
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="green">Harness</Text>
      <Text dimColor>경로: {rootPath}</Text>

      {error && <Text color="red">{error}</Text>}

      {isCreating ? (
        <Box flexDirection="column" marginTop={1}>
          <Text>프로젝트 이름 (빈 입력 = 취소):</Text>
          <Box marginTop={1}>
            <Text color="green">{'> '}</Text>
            <TextInput value={newName} onChange={setNewName} onSubmit={handleCreate} />
          </Box>
        </Box>
      ) : (
        <Box flexDirection="column" marginTop={1}>
          <Text dimColor>↑↓: 선택  Enter: 확인  q: 종료</Text>
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
