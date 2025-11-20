import { useEffect, useState } from 'react'
import Card from './Card'
import SectionHeading from './SectionHeading'
import { api } from '../lib/apiClient'

export default function VerseDetail({ selection }) {
  const [detail, setDetail] = useState(null)
  const [context, setContext] = useState([])
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    if (!selection) {
      setDetail(null)
      setContext([])
      setTopics([])
      return () => {
        active = false
      }
    }

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await api.lookupVerse({
          book: selection.book,
          chapter: selection.chapter,
          verse: selection.verse,
        })
        if (!active) return
        setDetail(res.verse)
        setContext(res.context || [])
        setTopics(res.topics || [])
      } catch (err) {
        if (active) setError(err.message)
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [selection])

  return (
    <div className="page-panel verse-detail">
      <SectionHeading
        eyebrow="Verse detail"
        title="Context & surrounding verses"
        description="View the verse in place, skim nearby sentences, and see which topical filters reference it."
      />

      {!selection && <p className="card__meta-line">Select a verse to preview its text and nearby context.</p>}
      {loading && <p className="card__meta-line">Loading verse…</p>}
      {error && <p className="card__meta-line">{error}</p>}

      {detail && (
        <Card title={`${detail.book} ${detail.chapter}:${detail.verse}`} subtitle={detail.testament}>
          <p className="verse-text">{detail.text}</p>
          <div className="context">{context.map((row) => (
            <p key={`${detail.book}-${detail.chapter}-${row.verse}`} className="context__line">
              <span className="context__ref">{row.verse}</span> {row.text}
            </p>
          ))}</div>
          {topics.length > 0 && (
            <div className="pill-row pill-row--compact" aria-label="Topics referencing this verse">
              {topics.map((topic) => (
                <span key={topic.slug} className="pill pill--ghost">
                  {topic.title}
                </span>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
