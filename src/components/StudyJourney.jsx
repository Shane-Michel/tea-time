import Button from './Button'
import Card from './Card'
import ProgressBar from './ProgressBar'
import { useStudyProgress } from '../lib/useStudyProgress'
import { useAuth } from '../lib/useAuth'

function StudyDayItem({ day, completed, onToggle, disabled }) {
  return (
    <li className={`journey__day ${completed ? 'is-complete' : ''}`}>
      <div className="journey__day-header">
        <div>
          <p className="eyebrow">Day {day.day}</p>
          <h4>{day.title}</h4>
          <p className="journey__summary">{day.summary}</p>
        </div>
        <Button variant="ghost" onClick={() => onToggle(day.day)} disabled={disabled}>
          {completed ? 'Mark as not done' : 'Mark complete'}
        </Button>
      </div>
      <div className="journey__grid">
        <div>
          <p className="eyebrow">Read</p>
          <ul className="journey__list">
            {day.readings.map((reading) => (
              <li key={reading.reference}>
                <strong>{reading.reference}</strong>
                <span>{reading.focus}</span>
                {reading.note && <em>{reading.note}</em>}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow">Prompts</p>
          <ul className="journey__list">
            {day.prompts.map((prompt) => (
              <li key={prompt.question}>
                <strong>{prompt.type || 'Prompt'}</strong>
                <span>{prompt.question}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow">Reflection</p>
          <ul className="journey__list journey__list--tight">
            {day.reflection.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </li>
  )
}

export default function StudyJourney({ plan }) {
  const { user } = useAuth()
  const { completedDays, loading, percentComplete, toggleDay, error } = useStudyProgress(
    plan.id,
    plan.days.length,
  )
  const completedCount = completedDays.size

  return (
    <Card title={plan.title} subtitle={`${plan.subtitle} · ${plan.days.length} days`}>
      <div className="journey__meta">
        <div>
          <p className="eyebrow">Overview</p>
          <p>{plan.summary}</p>
          {!user && <p className="card__meta-line">Sign in to track your progress.</p>}
          {error && <p className="card__meta-line">{error}</p>}
        </div>
        <div className="journey__progress-block">
          <div className="journey__progress-label">
            <span>{loading ? 'Loading progress…' : `${percentComplete}% complete`}</span>
            <span>
              {completedCount} / {plan.days.length} days
            </span>
          </div>
          <ProgressBar value={percentComplete} label={`${plan.title} is ${percentComplete}% complete`} />
        </div>
      </div>
      <ul className="journey">
        {plan.days.map((day) => (
          <StudyDayItem
            key={day.day}
            day={day}
            completed={completedDays.has(day.day)}
            onToggle={toggleDay}
            disabled={!user}
          />
        ))}
      </ul>
    </Card>
  )
}
