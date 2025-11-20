import SectionHeading from '../components/SectionHeading'

export default function Account() {
  return (
    <section className="section-shell">
      <SectionHeading
        eyebrow="Account"
        title="Your peaceful study home"
        description="Manage reminders, privacy settings, and preferences for how you engage with Tea Time."
      />
      <div className="page-panel">
        <h2>What you can manage</h2>
        <ul>
          <li>Daily reminders for morning or evening rhythms.</li>
          <li>Profile, security, and backup options for notes.</li>
          <li>Theme controls to keep the brand experience consistent.</li>
        </ul>
      </div>
    </section>
  )
}
