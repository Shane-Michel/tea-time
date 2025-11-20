import SectionHeading from '../components/SectionHeading'

export default function Reader() {
  return (
    <section className="section-shell">
      <SectionHeading
        eyebrow="Reader"
        title="A quiet place to read, pray, and respond"
        description="Built-in NIV text, commentary, and prayer prompts keep everything together for focused devotional time."
      />
      <div className="page-panel">
        <h2>What you’ll see</h2>
        <ul>
          <li>Daily scripture with historical and literary context.</li>
          <li>Guided reflection questions and a space to journal prayers.</li>
          <li>Progress indicators and bookmarks that remember where you left off.</li>
        </ul>
      </div>
    </section>
  )
}
