import { useState } from 'react'
import StatusMessage from '../components/StatusMessage.jsx'

export default function LoginPage({ onLogin, sessionError }) {
  const [email, setEmail] = useState('demo@example.com')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')

    try {
      await onLogin({ email, password })
    } catch (failure) {
      setError(failure.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="login-screen">
      <section className="login-intro">
        <div className="login-icon">◈</div>
        <span className="eyebrow">PERSONAL EXPENSE TRACKER</span>
        <h1>Know where your money goes.</h1>
        <p>Keep a clear record of your daily expenses. Sign in to manage your own transactions and categories.</p>
      </section>
      <section className="card login-card" aria-labelledby="login-title">
        <h2 id="login-title">Welcome back</h2>
        <p className="muted">Sign in with your demo account.</p>
        <StatusMessage message={error || sessionError} />
        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="login-email">Email</label>
            <input id="login-email" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="login-password">Password</label>
            <input id="login-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </div>
          <button className="button button--primary login-submit" type="submit" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="login-hint">Development demo: <strong>demo@example.com</strong> / <strong>password</strong></p>
        <p className="login-hint">Second account: <strong>second@example.com</strong> / <strong>password</strong></p>
      </section>
    </main>
  )
}
