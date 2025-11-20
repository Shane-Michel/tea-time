import Button from '../components/Button'
import Card from '../components/Card'
import SectionHeading from '../components/SectionHeading'

const studies = [
  {
    title: 'Gospel of Matthew',
    subtitle: 'Walking with Jesus',
    description:
      'A 30-day journey that follows the life of Jesus, highlighting His teachings, miracles, and fulfillment of prophecy.',
    days: 30,
  },
  {
    title: 'Book of Esther',
    subtitle: 'Courage in the Quiet',
    description:
      'Ten contemplative readings that uncover God’s hidden work in seasons of uncertainty and waiting.',
    days: 10,
  },
  {
    title: 'Fasting (Topical)',
    subtitle: 'Hungry for God',
    description:
      'A focused, 7-day topical study exploring the heart, practice, and blessing of Biblical fasting.',
    days: 7,
  },
]

const features = [
  {
    title: 'Guided Readings',
    description:
      'Every day includes curated passages, historical notes, and reflection prompts so you can linger without wondering what to read next.',
  },
  {
    title: 'Progress & Bookmarks',
    description:
      'Stay gently accountable with automatic checkmarks, saved places, and tea-time reminders that keep your rhythm steady.',
  },
  {
    title: 'Notes & Reflections',
    description:
      'Write private prayers, attach notes to verses, and review your story with the Lord across every study.',
  },
  {
    title: 'Searchable NIV Bible',
    description: 'Look up verses, jump to contexts, and find topical connections using the built-in NIV text and search.',
  },
]

const topics = ['Peace in Waiting', 'Identity in Christ', 'Hospitality', 'Prayer & Fasting', 'Wisdom for Work', 'Hope in Suffering']

export default function Home() {
  return (
    <div className="section-shell">
      <header className="hero">
        <div className="hero__badge">Tea Time · Daily Bible Study</div>
        <h1>Slow down, sip, and sit with Scripture.</h1>
        <p>
          Created for Shane & Vicki Michel’s morning and evening ritual, Tea Time offers a peaceful, guided Bible study
          experience you can revisit every day. No streaks. No noise. Just the Word, gentle prompts, and space to respond.
        </p>
        <div className="hero__cta">
          <Button variant="primary">Start today’s reading</Button>
          <Button variant="ghost" as="a" href="#studies">
            Preview the studies
          </Button>
        </div>
        <ul className="hero__meta">
          <li>
            <strong>3</strong>
            Foundational studies at launch
          </li>
          <li>
            <strong>Daily</strong>
            Readings & reflection prompts
          </li>
          <li>
            <strong>Private</strong>
            Notes saved to your account
          </li>
        </ul>
      </header>

      <section className="section-shell" aria-labelledby="studies-heading" id="studies">
        <SectionHeading
          eyebrow="Guided Studies"
          title="Deeply devotional journeys"
          description="Each study includes Scripture readings, commentary, and quiet prompts designed for 10–30 day rhythms."
          id="studies-heading"
        />
        <div className="grid">
          {studies.map((study) => (
            <Card
              key={study.title}
              title={study.title}
              subtitle={study.subtitle}
              meta={
                <>
                  <span>{study.days} day plan</span>
                  <Button as="a" href="#" variant="link">
                    View outline →
                  </Button>
                </>
              }
            >
              <p>{study.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="section-shell" aria-labelledby="features-heading">
        <SectionHeading eyebrow="Spiritual Rhythm Tools" title="Features that feel like a journal, not an app" id="features-heading" />
        <div className="grid">
          {features.map((feature) => (
            <Card key={feature.title} title={feature.title} variant="soft">
              <p>{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="section-shell" aria-labelledby="topics-heading">
        <SectionHeading
          eyebrow="Topics Library"
          title="Verses, commentary, and practices"
          description="Searchable Bible text, NIV translation, and curated topical meditations help you find the right scripture for the moment."
          id="topics-heading"
        />
        <div className="topics__list">
          {topics.map((topic) => (
            <span key={topic}>{topic}</span>
          ))}
        </div>
      </section>

      <section className="cta" id="join">
        <div>
          <p className="eyebrow">Mission</p>
          <h2>Tea Time helps Shane & Vicki grow closer to God and invite others into the practice.</h2>
          <p>
            We’re building a quiet place to open Scripture, talk with Jesus, and remember what He’s teaching from one season to the next.
            No jargon—just simple rhythms that keep hearts anchored to the Word.
          </p>
        </div>
        <Button variant="primary">Join the waiting list</Button>
      </section>
    </div>
  )
}
