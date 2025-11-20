import { useEffect, useState } from 'react'
import SectionHeading from '../components/SectionHeading'
import { api } from '../lib/apiClient'
import { useAuth } from '../lib/useAuth'

export default function Notes() {
  const { user } = useAuth()
  const [notes, setNotes] = useState([])
  const [form, setForm] = useState({ study_id: '', reference: '', content: '' })
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true
    const loadNotes = async () => {
      if (!user) {
        if (active) setNotes([])
        return
      }
      try {
        const res = await api.listNotes()
        if (active) setNotes(res.notes || [])
      } catch (err) {
        if (active) setMessage(err.message)
      }
    }
    loadNotes()
    return () => {
      active = false
    }
  }, [user])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!user) return
    try {
      const res = await api.createNote(form)
      setNotes([res.note, ...notes])
      setForm({ study_id: '', reference: '', content: '' })
      setMessage('Note saved')
    } catch (err) {
      setMessage(err.message)
    }
  }

  const handleDelete = async (id) => {
    await api.deleteNote(id)
    setNotes(notes.filter((note) => note.id !== id))
  }

  if (!user) {
    return (
      <section className="section-shell">
        <SectionHeading
          eyebrow="Notes"
          title="Capture prayers and insights across every study"
          description="Sign in to see and manage your notes."
        />
      </section>
    )
  }

  return (
    <section className="section-shell">
      <SectionHeading
        eyebrow="Notes"
        title="Capture prayers and insights across every study"
        description="Keep reflections organized with tags, verse anchors, and saved prompts that you can revisit anytime."
      />
      <div className="page-panel">
        <form className="form" onSubmit={handleSubmit}>
          <label>
            <span>Study ID (optional)</span>
            <input
              type="text"
              value={form.study_id}
              onChange={(e) => setForm({ ...form, study_id: e.target.value })}
            />
          </label>
          <label>
            <span>Reference</span>
            <input
              type="text"
              value={form.reference}
              onChange={(e) => setForm({ ...form, reference: e.target.value })}
            />
          </label>
          <label>
            <span>Content</span>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              required
            />
          </label>
          <button className="btn" type="submit">
            Save note
          </button>
        </form>
        {message && <p className="card__meta-line">{message}</p>}
        <h2>Your notes</h2>
        <ul className="journey__list">
          {notes.map((note) => (
            <li key={note.id}>
              <div className="journey__day-header">
                <div>
                  <p className="eyebrow">{note.reference || 'Untitled reference'}</p>
                  <p>{note.content}</p>
                  <p className="card__meta-line">Updated {note.updated_at}</p>
                </div>
                <button className="btn btn--ghost" type="button" onClick={() => handleDelete(note.id)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
