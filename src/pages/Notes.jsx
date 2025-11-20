import SectionHeading from '../components/SectionHeading'

export default function Notes() {
  return (
    <section className="section-shell">
      <SectionHeading
        eyebrow="Notes"
        title="Capture prayers and insights across every study"
        description="Keep reflections organized with tags, verse anchors, and saved prompts that you can revisit anytime."
      />
      <div className="page-panel">
        <h2>Notes toolkit</h2>
        <ul>
          <li>Create private notes tied to verses, passages, or topical searches.</li>
          <li>Filter by study, date, or tag to recall what God highlighted.</li>
          <li>Export or print reflections for small group sharing.</li>
        </ul>
      </div>
    </section>
  )
}
