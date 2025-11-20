import { useEffect, useMemo, useState } from 'react'
import Button from './Button'
import Card from './Card'
import SectionHeading from './SectionHeading'
import { api } from '../lib/apiClient'

export default function TopicBrowser({ onSelectVerse }) {
  const [topics, setTopics] = useState([])
  const [activeFilter, setActiveFilter] = useState('')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [passages, setPassages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadTopics = async () => {
    setError(null)
    try {
      const res = await api.listTopics({ filter: activeFilter || undefined, q: search || undefined })
      const topicList = res.topics || []
      setTopics(topicList)
      const selectedInList = topicList.find((topic) => topic.slug === selected?.slug)
      if (!selectedInList && topicList.length > 0) {
        selectTopic(topicList[0])
      }
      if (topicList.length === 0) {
        setSelected(null)
        setPassages([])
      }
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    loadTopics()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter])

  const filterOptions = useMemo(() => {
    const set = new Set()
    topics.forEach((topic) => {
      ;(topic.filters || []).forEach((f) => set.add(f))
    })
    return Array.from(set)
  }, [topics])

  const selectTopic = async (topic) => {
    setSelected(topic)
    setPassages([])
    setLoading(true)
    try {
      const res = await api.getTopic(topic.slug)
      setPassages(res.passages || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (event) => {
    event.preventDefault()
    await loadTopics()
  }

  return (
    <div className="topic-browser">
      <SectionHeading
        eyebrow="Topics library"
        title="Browse themes, practices, and feelings"
        description="Filter meditations from the hero copy—peace, courage, prayerful fasting, identity, and hope—then jump straight into the passage."
      />

      <form className="filter-row" onSubmit={handleSearch}>
        <label>
          <span>Search topics</span>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="e.g., courage or fasting" />
        </label>
        <div className="pill-row pill-row--compact" role="group" aria-label="Topic filters">
          <button
            type="button"
            className={`pill pill--ghost${activeFilter === '' ? ' pill--active' : ''}`}
            onClick={() => setActiveFilter('')}
          >
            All filters
          </button>
          {filterOptions.map((filter) => (
            <button
              key={filter}
              type="button"
              className={`pill pill--ghost${activeFilter === filter ? ' pill--active' : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
        <Button type="submit" variant="primary">
          Apply filters
        </Button>
      </form>

      {error && <p className="card__meta-line">{error}</p>}

      <div className="grid">
        {topics.map((topic) => (
          <Card
            key={topic.slug}
            title={topic.title}
            subtitle={topic.filters?.join(' · ')}
            variant={selected?.slug === topic.slug ? 'default' : 'soft'}
          >
            <p>{topic.summary}</p>
            <div className="card__meta">
              <span>{topic.filters?.slice(0, 3).join(', ')}</span>
              <Button variant="link" type="button" onClick={() => selectTopic(topic)}>
                View verses →
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {selected && (
        <div className="page-panel">
          <SectionHeading
            eyebrow="Verses"
            title={selected.title}
            description={selected.summary || 'Passages that carry this tone and theme.'}
          />
          {loading && <p className="card__meta-line">Loading passages…</p>}
          <div className="verse-list">
            {passages.map((passage) => (
              <div key={`${passage.book}-${passage.chapter}-${passage.verse}`} className="verse-list__item">
                <div>
                  <p className="eyebrow">{`${passage.book} ${passage.chapter}:${passage.verse}`}</p>
                  <p className="verse-text">{passage.text}</p>
                </div>
                <Button variant="link" type="button" onClick={() => onSelectVerse?.(passage)}>
                  Open detail →
                </Button>
              </div>
            ))}
            {passages.length === 0 && !loading && (
              <p className="card__meta-line">No passages found for this topic.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
