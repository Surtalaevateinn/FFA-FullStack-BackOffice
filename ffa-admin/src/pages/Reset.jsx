import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useMemo } from 'react'
import api from '../api/api'

export default function Reset() {
  const location = useLocation()
  const nav = useNavigate()


  const token = useMemo(() => {
    const params = new URLSearchParams(location.search)
    return params.get('token') || ''
  }, [location.search])

  const [pwd, setPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [okMsg, setOkMsg] = useState('')

  const onSubmit = async () => {
    setErr('')
    setOkMsg('')

    if (!token) {
      setErr('Reset token is missing or invalid.')
      return
    }
    if (!pwd || !confirmPwd) {
      setErr('Please fill in both password fields.')
      return
    }
    if (pwd !== confirmPwd) {
      setErr('Passwords do not match.')
      return
    }

    setLoading(true)
    try {

      const res = await api.post('/auth/reset-password', null, {
        params: {
          token,
          newPassword: pwd,
        },
      })

      const body = res.data || {}
      if (body.success === false) {
        setErr(body.message || 'Failed to reset password.')
        return
      }

      setOkMsg('Password updated successfully. You can now log in.')
      setTimeout(() => nav('/login'), 1500)
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        'Failed to reset password.'
      setErr(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="page-reset" className="auth">
      <div className="auth-card">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 8,
          }}
        >
          <span className="dot"></span>
          <h2 style={{ margin: 0 }}>Set a new password</h2>
        </div>

        {!token && (
          <div className="auth-error" style={{ marginBottom: 12 }}>
            Invalid or missing reset token. Please open the link from your email.
          </div>
        )}

        <div className="field">
          <label>New password</label>
          <input
            type="password"
            value={pwd}
            onChange={e => setPwd(e.target.value)}
          />
        </div>

        <div className="field">
          <label>Confirm password</label>
          <input
            type="password"
            value={confirmPwd}
            onChange={e => setConfirmPwd(e.target.value)}
          />
        </div>

        {err && <div className="auth-error">{err}</div>}
        {okMsg && <div className="auth-success">{okMsg}</div>}

        <button
          className="btn primary"
          disabled={loading || !token}
          onClick={onSubmit}
        >
          {loading ? 'Updating…' : 'Update password'}
        </button>

        <div className="muted" style={{ marginTop: 12 }}>
          <Link to="/login">Back to login</Link>
        </div>
      </div>
    </section>
  )
}
