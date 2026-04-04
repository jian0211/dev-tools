import type { PhaseGroup, PhaseStatus } from '../../../entities/project'

type Props = {
  phases: PhaseGroup[]
  activePhaseId: string
  phaseStatus: PhaseStatus
  onPhaseChange: (phaseId: string) => void
}

const PHASE_ORDER: PhaseGroup['id'][] = ['plan', 'design', 'build', 'deliver']

function getPhaseIndex(status: PhaseStatus): number {
  switch (status) {
    case 'plan-not-started':
    case 'plan-in-progress':
      return 0
    case 'design':
      return 1
    case 'build':
      return 2
    case 'deliver-ready':
    case 'deliver-done':
      return 3
  }
}

export function PhaseTabBar({
  phases,
  activePhaseId,
  phaseStatus,
  onPhaseChange,
}: Props) {
  const currentPhaseIndex = getPhaseIndex(phaseStatus)

  return (
    <div className="px-6 pt-4 pb-0 border-b border-zinc-200">
      <div className="flex items-center gap-0">
        {phases.map((phase) => {
          const i = PHASE_ORDER.indexOf(phase.id)
          const isActive = phase.id === activePhaseId
          const isDone = i < currentPhaseIndex
          const isCurrent = i === currentPhaseIndex

          return (
            <button
              type="button"
              key={phase.id}
              onClick={() => onPhaseChange(phase.id)}
              className={[
                'flex items-center gap-2 px-5 py-2.5 text-sm border-b-2 transition-colors cursor-pointer',
                isActive
                  ? 'border-zinc-900 text-zinc-900 font-medium'
                  : 'border-transparent text-zinc-400 hover:text-zinc-600',
              ].join(' ')}
            >
              <span
                className={[
                  'w-1.5 h-1.5 rounded-full',
                  isActive
                    ? 'bg-zinc-900'
                    : isDone
                      ? 'bg-emerald-400'
                      : isCurrent
                        ? 'bg-zinc-400'
                        : 'bg-zinc-200',
                ].join(' ')}
              />
              {phase.label}
              {isDone && <span className="text-xs text-emerald-400">✓</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
