// src/pages/Forgot.jsx
import { Link } from 'react-router-dom'
import { useState } from 'react'
import api from '../api/api'

export default function Forgot() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [okMsg, setOkMsg] = useState('')

  const onSubmit = async () => {
    setErr('')
    setOkMsg('')

    if (!email.trim()) {
      setErr('Please enter your email.')
      return
    }

    setLoading(true)
    try {

      const res = await api.post('/auth/forgot-password', null, {
        params: { email: email.trim() },
      })
      const body = res.data || {}

      if (body.success === false) {
        setErr(body.message || 'Failed to send reset link.')
        return
      }

      setOkMsg(
        'If this email exists in our system, a reset link has been sent.'
      )
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        'Failed to send reset link.'
      setErr(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="center">
      <div className="card auth">
        {/*  */}
        <div className="logo">
          <span className="dot" />
          <div>
            <h2>Reset password</h2>
            <p className="auth-subtitle">
              We&apos;ll send a secure reset link to your email.
            </p>
          </div>
        </div>

        {/*  */}
        <div className="field" style={{ marginTop: 8 }}>
          <label>Email</label>
          <input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <p className="help">
            Make sure this matches the email associated with your account.
          </p>
        </div>

        {err && <div className="auth-error">{err}</div>}
        {okMsg && <div className="auth-success">{okMsg}</div>}

        {/*  */}
        <button
          className="btn primary"
          style={{ width: '100%', marginTop: 10 }}
          disabled={loading}
          onClick={onSubmit}
        >
          {loading ? 'Sending…' : 'Send reset link'}
        </button>

        <div className="bottom-link">
          <Link to="/login">← Back to login</Link>
        </div>
      </div>
    </section>
  )
}
