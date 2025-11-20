import SectionHeading from '../components/SectionHeading'

export default function Admin() {
  return (
    <section className="section-shell">
      <SectionHeading
        eyebrow="Admin"
        title="Steward the devotional library"
        description="Create and schedule studies, approve NIV passages, and monitor gentle progress metrics."
      />
      <div className="page-panel">
        <h2>Admin checkpoints</h2>
        <ul>
          <li>Publish and archive studies with outlines and prayer prompts.</li>
          <li>Review reader feedback and surface insights for writers.</li>
          <li>Monitor adoption without intrusive dashboards—just steady health checks.</li>
        </ul>
      </div>
    </section>
  )
}
