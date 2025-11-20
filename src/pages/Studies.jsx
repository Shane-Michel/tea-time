import { useEffect, useState } from 'react'
import Card from '../components/Card'
import SectionHeading from '../components/SectionHeading'
import StudyJourney from '../components/StudyJourney'
import { api } from '../lib/apiClient'

export default function Studies() {
  const [studyPlans, setStudyPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api
      .getStudies()
      .then((res) => setStudyPlans(res.studies || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="section-shell">
      <SectionHeading
        eyebrow="Studies"
        title="Choose a pace that fits your season"
        description="Plan daily rhythms with curated readings, prompts, and reflection questions. Track progress quietly as you move through each day."
      />

      {loading && <p className="page-panel">Loading studies…</p>}
      {error && <p className="page-panel">{error}</p>}

      <div className="grid">
        {studyPlans.map((plan) => (
          <Card
            key={plan.id}
            title={plan.title}
            subtitle={`${plan.subtitle} · ${plan.days.length} days`}
            variant="soft"
            meta={<span>{plan.estimatedMinutes} min / day</span>}
          >
            <p>{plan.summary}</p>
            <p className="card__meta-line">Theme: {plan.theme}</p>
          </Card>
        ))}
      </div>

      <div className="journey-stack">
        {studyPlans.map((plan) => (
          <StudyJourney key={plan.id} plan={plan} />
        ))}
      </div>
    </section>
  )
}
