import { useEffect, useState } from 'react'
import SectionHeading from '../components/SectionHeading'
import { api } from '../lib/apiClient'
import { useAuth } from '../lib/useAuth'

export default function Reader() {
  const { user } = useAuth()
  const [bookmarks, setBookmarks] = useState([])
  const [form, setForm] = useState({ study_id: '', reference: '', note: '' })
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true
    const loadBookmarks = async () => {
      if (!user) {
        if (active) setBookmarks([])
        return
      }
      try {
        const res = await api.listBookmarks()
        if (active) setBookmarks(res.bookmarks || [])
      } catch (err) {
        if (active) setMessage(err.message)
      }
    }
    loadBookmarks()
    return () => {
      active = false
    }
  }, [user])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!user) return
    try {
      const res = await api.addBookmark(form)
      setBookmarks([res.bookmark, ...bookmarks])
      setForm({ study_id: '', reference: '', note: '' })
      setMessage('Bookmark saved')
    } catch (err) {
      setMessage(err.message)
    }
  }

  const handleDelete = async (id) => {
    await api.removeBookmark(id)
    setBookmarks(bookmarks.filter((bookmark) => bookmark.id !== id))
  }

  return (
    <section className="section-shell">
      <SectionHeading
        eyebrow="Reader"
        title="A quiet place to read, pray, and respond"
        description="Built-in NIV text, commentary, and prayer prompts keep everything together for focused devotional time."
      />
      <div className="page-panel">
        <h2>Bookmarks</h2>
        {user ? (
          <>
            <form className="form" onSubmit={handleSubmit}>
              <label>
                <span>Reference</span>
                <input
                  type="text"
                  value={form.reference}
                  onChange={(e) => setForm({ ...form, reference: e.target.value })}
                  required
                />
              </label>
              <label>
                <span>Study ID (optional)</span>
                <input
                  type="text"
                  value={form.study_id}
                  onChange={(e) => setForm({ ...form, study_id: e.target.value })}
                />
              </label>
              <label>
                <span>Note</span>
                <textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
              </label>
              <button className="btn" type="submit">
                Save bookmark
              </button>
            </form>
            {message && <p className="card__meta-line">{message}</p>}
            <ul className="journey__list">
              {bookmarks.map((bookmark) => (
                <li key={bookmark.id} className="journey__day-header">
                  <div>
                    <p className="eyebrow">{bookmark.reference}</p>
                    {bookmark.note && <p>{bookmark.note}</p>}
                    <p className="card__meta-line">Saved {bookmark.created_at}</p>
                  </div>
                  <button className="btn btn--ghost" type="button" onClick={() => handleDelete(bookmark.id)}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p>Sign in to save where you left off and keep bookmarks across studies.</p>
        )}
      </div>
    </section>
  )
}
