import { Box, Text } from 'ink'
import type { PhaseGroup, PhaseStatus } from '../model/types.js'

type Props = {
  phases: PhaseGroup[]
  activePhaseId: string
  phaseStatus: PhaseStatus
}

export function PhaseBar({ phases, activePhaseId, phaseStatus }: Props) {
  const statusIndex = phases.findIndex((p) => {
    if (phaseStatus.startsWith('plan')) return p.id === 'plan'
    if (phaseStatus === 'design') return p.id === 'design'
    if (phaseStatus === 'build') return p.id === 'build'
    return p.id === 'deliver'
  })

  return (
    <Box borderStyle="single" paddingX={1}>
      {phases.map((phase, i) => {
        const isActive = phase.id === activePhaseId
        const isDone = i < statusIndex
        const icon = isDone ? '■' : i === statusIndex ? '▶' : '□'

        return (
          <Box key={phase.id} marginRight={2}>
            <Text
              bold={isActive}
              color={isActive ? 'green' : isDone ? 'gray' : 'white'}
            >
              {icon} {phase.label}
            </Text>
          </Box>
        )
      })}
      <Box flexGrow={1} />
      <Text dimColor>←/→ 전환</Text>
    </Box>
  )
}
