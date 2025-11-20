import SectionHeading from '../components/SectionHeading'

export default function NotFound() {
  return (
    <section className="section-shell">
      <SectionHeading title="We couldn’t find that page" description="Try heading back to Home or selecting a section from the navigation." />
      <div className="page-panel">
        <p>Use the navigation above to continue exploring the devotional experience.</p>
      </div>
    </section>
  )
}
