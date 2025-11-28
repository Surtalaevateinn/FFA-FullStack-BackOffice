import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import api from '../api/api'

export default function Login() {
  const nav = useNavigate()
  const [login, setLogin] = useState('')       
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const onSubmit = async () => {
    setErr('')
    if (!login || !password) {
      setErr('Please enter your login and password.')
      return
    }
    setLoading(true)
    try {

      const res = await api.post('/auth/login', { login, password })
      const body = res.data || {}


      if (body.success === false || !body.data) {
        setErr(body.message || 'Login failed')
        return
      }

      const tokens = body.data || {}

      const accessToken = tokens.accessToken || tokens.token
      const refreshToken = tokens.refreshToken
      const user = tokens.user || tokens.person || {}

      if (!accessToken) {
        setErr('Login response malformed: missing accessToken.')
        return
      }


      localStorage.setItem('token', accessToken)
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken)
      }
      if (user.login || user.username) {
        localStorage.setItem('username', user.login || user.username)
      }
      if (user.role || user.roleName) {
        localStorage.setItem('role', user.role || user.roleName)
      } else {

        localStorage.setItem('role', 'ADMIN')
      }

      nav('/dashboard')
    } catch (e) {

      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        'Login failed'
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
            <h2>Sign in</h2>
            <p className="auth-subtitle">Access your FFA admin dashboard</p>
          </div>
        </div>

        {/*  */}
        <div className="grid" style={{ gap: 12 }}>
          <div className="field">
            {/* login  */}
            <label>Login / Email</label>
            <input
              type="text"
              placeholder="your.login or you@example.com"
              value={login}
              onChange={e => setLogin(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') onSubmit()
              }}
            />
          </div>
        </div>

        {/*  */}
        {err && <div className="auth-error">{err}</div>}

        {/*  */}
        <div className="auth-meta">
          <span className="muted">Use your FFA admin credentials.</span>
        </div>

        <button
          className="btn primary"
          onClick={onSubmit}
          disabled={loading}
          style={{ width: '100%', marginTop: 10 }}
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>

        <div className="bottom-link">
          <Link to="/forgot">Forgot password?</Link>
        </div>
        <div className="bottom-link">
  <Link to="/register">Create an account</Link>
</div>
      </div>
    </section>
  )
}
