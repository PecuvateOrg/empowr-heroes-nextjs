// Funding progress for a project. A null goal means the target isn't set yet:
// show what's been raised without a bar, so a project can go live before it's costed.
export default function ProjectProgress({ raised, goal, large = false }: { raised: number; goal: number | null; large?: boolean }) {
  const raisedLabel = <strong>£{raised.toLocaleString('en-GB')}</strong>

  if (goal === null) {
    return (
      <div className={large ? 'pc-progress pc-progress-lg' : 'pc-progress'}>
        <div className="pc-progress-label">{raisedLabel} raised · funding target coming soon</div>
      </div>
    )
  }

  const pct = Math.min(100, Math.round((raised / goal) * 100))
  return (
    <div className={large ? 'pc-progress pc-progress-lg' : 'pc-progress'}>
      <div className="pc-progress-track">
        <div className="pc-progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="pc-progress-label">
        {raisedLabel} raised of £{goal.toLocaleString('en-GB')} goal
      </div>
    </div>
  )
}
