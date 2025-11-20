import { useState } from 'react'
import SectionHeading from '../components/SectionHeading'
import BibleSearchPanel from '../components/BibleSearchPanel'
import TopicBrowser from '../components/TopicBrowser'
import VerseDetail from '../components/VerseDetail'

export default function Bible() {
  const [selection, setSelection] = useState(null)

  return (
    <section className="section-shell bible-page">
      <SectionHeading
        eyebrow="Bible & search"
        title="Search the NIV and surface topical guidance"
        description="Built-in NIV text, full-text search, and filters from the hero copy help you move between reference lookup, context, and topical pathways."
      />

      <div className="search-grid">
        <BibleSearchPanel onSelectVerse={setSelection} />
        <VerseDetail selection={selection} />
      </div>

      <TopicBrowser onSelectVerse={setSelection} />
    </section>
  )
}
