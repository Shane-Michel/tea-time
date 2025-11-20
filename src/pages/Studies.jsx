import Card from '../components/Card'
import SectionHeading from '../components/SectionHeading'

const tracks = [
  {
    title: 'Devotional Journeys',
    description: '10–30 day plans with scripture readings, commentary, and reflection prompts.',
  },
  {
    title: 'Topical Pathways',
    description: 'Weekly meditations on themes like prayer, hospitality, grief, and justice.',
  },
  {
    title: 'Seasonal Guides',
    description: 'Focused series for Advent, Lent, and personal fasting rhythms.',
  },
]

export default function Studies() {
  return (
    <section className="section-shell">
      <SectionHeading
        eyebrow="Studies"
        title="Choose a pace that fits your season"
        description="Plan daily rhythms, bookmark your place, and stay grounded in scripture without feeling rushed."
      />
      <div className="grid">
        {tracks.map((track) => (
          <Card key={track.title} title={track.title} variant="soft">
            <p>{track.description}</p>
          </Card>
        ))}
      </div>
      <div className="page-panel">
        <h2>How studies work</h2>
        <ul>
          <li>Start with a gentle introduction and preview the readings.</li>
          <li>Track daily progress automatically—no pressure or streaks.</li>
          <li>Open the Reader to see scripture, context notes, and prompts in one place.</li>
        </ul>
      </div>
    </section>
  )
}
