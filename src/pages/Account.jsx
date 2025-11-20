import { useState } from 'react'
import SectionHeading from '../components/SectionHeading'
import { useAuth } from '../lib/useAuth'

export default function Account() {
  const { user, login, register, logout } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [mode, setMode] = useState('login')
  const [message, setMessage] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')
    try {
      if (mode === 'login') {
        await login({ email: form.email, password: form.password })
        setMessage('Welcome back!')
      } else {
        await register(form)
        setMessage('Account created and signed in.')
      }
    } catch (err) {
      setMessage(err.message)
    }
  }

  const handleLogout = async () => {
    await logout()
    setMessage('Signed out successfully.')
  }

  return (
    <section className="section-shell">
      <SectionHeading
        eyebrow="Account"
        title="Your peaceful study home"
        description="Manage reminders, privacy settings, and preferences for how you engage with Tea Time."
      />
      <div className="page-panel">
        {user ? (
          <>
            <p className="eyebrow">Signed in</p>
            <p>
              You are signed in as <strong>{user.name}</strong> ({user.email}).
            </p>
            <button className="btn" type="button" onClick={handleLogout}>
              Sign out
            </button>
          </>
        ) : (
          <>
            <div className="panel__tabs">
              <button className={`btn btn--ghost ${mode === 'login' ? 'is-active' : ''}`} onClick={() => setMode('login')}>
                Login
              </button>
              <button
                className={`btn btn--ghost ${mode === 'register' ? 'is-active' : ''}`}
                onClick={() => setMode('register')}
              >
                Register
              </button>
            </div>
            <form className="form" onSubmit={handleSubmit}>
              {mode === 'register' && (
                <label>
                  <span>Name</span>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </label>
              )}
              <label>
                <span>Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </label>
              <label>
                <span>Password</span>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </label>
              <button className="btn" type="submit">
                {mode === 'login' ? 'Login' : 'Create account'}
              </button>
            </form>
          </>
        )}
        {message && <p className="card__meta-line">{message}</p>}
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
