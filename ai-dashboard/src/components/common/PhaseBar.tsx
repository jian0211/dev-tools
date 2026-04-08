import { S } from '../../styles/app.styles';

export function PhaseBar({ phase }: { phase: string }) {
  const steps = ['Plan', 'Design', 'Build', 'Deliver'];
  const allPhases = ['plan-not-started', 'plan-in-progress', 'design', 'build', 'deliver-ready', 'deliver-done'];
  const current = allPhases.indexOf(phase);
  const activeStep = current <= 1 ? 0 : current <= 2 ? 1 : current <= 3 ? 2 : 3;

  return (
    <div style={S.phaseBar}>
      {steps.map((s, i) => (
        <div key={s} style={{ ...S.phaseStep, ...(i <= activeStep ? S.phaseStepActive : {}) }}>
          {i < activeStep && <span style={{ marginRight: 3 }}>✓</span>}
          {s}
        </div>
      ))}
    </div>
  );
}

export function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={S.progressBg}>
      <div style={{ ...S.progressFill, width: `${pct}%` }} />
    </div>
  );
}
