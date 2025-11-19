import './App.css'

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
    description:
      'Look up verses, jump to contexts, and find topical connections using the built-in NIV text and search.',
  },
]

const topics = [
  'Peace in Waiting',
  'Identity in Christ',
  'Hospitality',
  'Prayer & Fasting',
  'Wisdom for Work',
  'Hope in Suffering',
]

function App() {
  return (
    <div className="app">
      <header className="hero">
        <div className="hero__badge">Tea Time · Daily Bible Study</div>
        <h1>Slow down, sip, and sit with Scripture.</h1>
        <p>
          Created for Shane & Vicki Michel’s morning and evening ritual, Tea Time offers a peaceful, guided Bible study experience
          you can revisit every day. No streaks. No noise. Just the Word, gentle prompts, and space to respond.
        </p>
        <div className="hero__cta">
          <button className="btn primary">Start today’s reading</button>
          <button className="btn ghost">Preview the studies</button>
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

      <section className="studies" aria-labelledby="studies-heading">
        <div className="section-heading">
          <p className="eyebrow">Guided Studies</p>
          <h2 id="studies-heading">Deeply devotional journeys</h2>
          <p>Each study includes Scripture readings, commentary, and quiet prompts designed for 10–30 day rhythms.</p>
        </div>
        <div className="studies__grid">
          {studies.map((study) => (
            <article key={study.title} className="study-card">
              <header>
                <p className="study-card__subtitle">{study.subtitle}</p>
                <h3>{study.title}</h3>
              </header>
              <p>{study.description}</p>
              <div className="study-card__meta">
                <span>{study.days} day plan</span>
                <button className="btn link">View outline →</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="features" aria-labelledby="features-heading">
        <div className="section-heading">
          <p className="eyebrow">Spiritual Rhythm Tools</p>
          <h2 id="features-heading">Features that feel like a journal, not an app</h2>
        </div>
        <div className="features__grid">
          {features.map((feature) => (
            <article key={feature.title} className="feature-card">
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="topics" aria-labelledby="topics-heading">
        <div className="section-heading">
          <p className="eyebrow">Topics Library</p>
          <h2 id="topics-heading">Verses, commentary, and practices</h2>
          <p>Searchable Bible text, NIV translation, and curated topical meditations help you find the right scripture for the moment.</p>
        </div>
        <div className="topics__list">
          {topics.map((topic) => (
            <span key={topic}>{topic}</span>
          ))}
        </div>
      </section>

      <section className="cta">
        <div>
          <p className="eyebrow">Mission</p>
          <h2>Tea Time helps Shane & Vicki grow closer to God and invite others into the practice.</h2>
          <p>
            We’re building a quiet place to open Scripture, talk with Jesus, and remember what He’s teaching from one season to the next.
            No jargon—just simple rhythms that keep hearts anchored to the Word.
          </p>
        </div>
        <button className="btn primary">Join the waiting list</button>
      </section>

      <footer className="footer">
        <p>© {new Date().getFullYear()} Tea Time · Crafted with prayer, peace, and warm mugs.</p>
      </footer>
    </div>
  )
}

export default App
