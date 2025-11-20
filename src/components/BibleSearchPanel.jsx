import { useEffect, useMemo, useState } from 'react'
import Button from './Button'
import Card from './Card'
import SectionHeading from './SectionHeading'
import { api } from '../lib/apiClient'

const focusFilters = [
  { value: 'peace', label: 'Peaceful', helper: 'Calm anxious hearts and point toward rest.' },
  { value: 'prayer', label: 'Prayer & Fasting', helper: 'Practices for dependence and hidden rooms.' },
  { value: 'courage', label: 'Courage', helper: 'Encouragement for bold, obedient steps.' },
  { value: 'identity', label: 'Identity', helper: 'Remind the reader who they are in Christ.' },
  { value: 'hope', label: 'Hope', helper: 'Lift eyes toward future glory and presence.' },
]

export default function BibleSearchPanel({ onSelectVerse }) {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState({ testament: '', topic: '', focus: '' })
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [topics, setTopics] = useState([])

  useEffect(() => {
    api
      .listTopics()
      .then((res) => setTopics(res.topics || []))
      .catch(() => setTopics([]))
  }, [])

  const topicOptions = useMemo(
    () => topics.map((topic) => ({ value: topic.slug, label: topic.title })),
    [topics],
  )

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!query.trim()) {
      setError('Enter a keyword, phrase, or verse reference to search the NIV text.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await api.searchBible({
        q: query,
        testament: filters.testament || undefined,
        topic: filters.topic || undefined,
        filter: filters.focus || undefined,
      })
      setResults(res.results || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-panel">
      <SectionHeading
        eyebrow="NIV search"
        title="Look up verses and find related passages"
        description="Run keyword searches, narrow by Testament, and overlay topic filters from the hero copy."
      />

      <form className="form" onSubmit={handleSubmit}>
        <label>
          <span>Search the Bible</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='e.g., "rest" or "Psalm 23:4"'
          />
        </label>
        <div className="filter-row">
          <label>
            <span>Testament</span>
            <select
              value={filters.testament}
              onChange={(e) => setFilters({ ...filters, testament: e.target.value })}
            >
              <option value="">Any</option>
              <option value="OT">Old Testament</option>
              <option value="NT">New Testament</option>
            </select>
          </label>
          <label>
            <span>Topic</span>
            <select value={filters.topic} onChange={(e) => setFilters({ ...filters, topic: e.target.value })}>
              <option value="">Any</option>
              {topicOptions.map((topic) => (
                <option key={topic.value} value={topic.value}>
                  {topic.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="pill-row" role="group" aria-label="Focus filters">
          {focusFilters.map((filter) => {
            const active = filter.value === filters.focus
            return (
              <button
                key={filter.value}
                type="button"
                className={`pill${active ? ' pill--active' : ''}`}
                onClick={() => setFilters({ ...filters, focus: active ? '' : filter.value })}
              >
                <span className="pill__label">{filter.label}</span>
                <span className="pill__helper">{filter.helper}</span>
              </button>
            )
          })}
        </div>

        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Searching…' : 'Search NIV'}
        </Button>
        {error && <p className="card__meta-line">{error}</p>}
      </form>

      <div className="results">
        {results.length === 0 && !loading && <p className="card__meta-line">No verses yet—run a search to see matches.</p>}
        {results.map((result) => (
          <Card
            key={`${result.book}-${result.chapter}-${result.verse}`}
            title={`${result.book} ${result.chapter}:${result.verse}`}
            subtitle={result.testament === 'OT' ? 'Old Testament' : 'New Testament'}
            variant="soft"
          >
            <p className="search-snippet" dangerouslySetInnerHTML={{ __html: result.snippet || result.text }} />
            <div className="card__meta">
              <span>{result.text.slice(0, 96)}{result.text.length > 96 ? '…' : ''}</span>
              <Button variant="link" type="button" onClick={() => onSelectVerse?.(result)}>
                View context →
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
