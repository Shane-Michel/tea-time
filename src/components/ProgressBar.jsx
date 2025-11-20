export default function ProgressBar({ value, label }) {
  const width = Math.min(Math.max(value, 0), 100)

  return (
    <div className="progress">
      <div
        className="progress__bar"
        style={{ width: `${width}%` }}
        aria-valuenow={width}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <span className="progress__sr">{label || `${width}% complete`}</span>
      </div>
    </div>
  )
}
