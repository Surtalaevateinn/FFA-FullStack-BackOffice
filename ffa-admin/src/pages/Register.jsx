import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import api from '../api/api'

export default function Register() {
  const nav = useNavigate()

  const [form, setForm] = useState({
    login: '',
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  })

  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [okMsg, setOkMsg] = useState('')

  const onChange = (field, value) => {
    setForm(s => ({ ...s, [field]: value }))
  }

  const submit = async () => {
    setErr('')
    setOkMsg('')

    if (!form.login.trim() || !form.password.trim()) {
      setErr('Login and password are required.')
      return
    }

    setLoading(true)
    try {
      const res = await api.post('/auth/register', {
        login: form.login.trim(),
        email: form.email.trim() || null,
        password: form.password,
        firstName: form.firstName.trim() || null,
        lastName: form.lastName.trim() || null,
      })

      const body = res.data || {}
      if (!body.success) {
        setErr(body.message || 'Registration failed.')
        return
      }

      setOkMsg('Account created successfully! Redirecting...')
      setTimeout(() => nav('/login'), 1500)

    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        'Registration failed.'
      setErr(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="center">
      <div className="card auth">

        <div className="logo">
          <span className="dot" />
          <div>
            <h2>Create account</h2>
            <p className="auth-subtitle">Register as a new FFA user.</p>
          </div>
        </div>

        <div className="grid" style={{ gap: 12, marginTop: 8 }}>
          <div className="field">
            <label>Login *</label>
            <input
              value={form.login}
              onChange={e => onChange('login', e.target.value)}
              placeholder="your-login"
            />
          </div>

          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => onChange('email', e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="field">
            <label>Password *</label>
            <input
              type="password"
              value={form.password}
              onChange={e => onChange('password', e.target.value)}
              placeholder="******"
            />
          </div>

          <div className="field">
            <label>First Name</label>
            <input
              value={form.firstName}
              onChange={e => onChange('firstName', e.target.value)}
              placeholder="John"
            />
          </div>

          <div className="field">
            <label>Last Name</label>
            <input
              value={form.lastName}
              onChange={e => onChange('lastName', e.target.value)}
              placeholder="Doe"
            />
          </div>

          {err && <div className="auth-error">{err}</div>}
          {okMsg && <div className="auth-success">{okMsg}</div>}
        </div>

        <button
          className="btn primary"
          disabled={loading}
          style={{ width: '100%', marginTop: 10 }}
          onClick={submit}
        >
          {loading ? 'Registering…' : 'Create account'}
        </button>

        <div className="bottom-link">
          <Link to="/login">← Back to login</Link>
        </div>

      </div>
    </section>
  )
}
