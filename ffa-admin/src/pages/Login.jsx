import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import api from '../api/api'  // <=== 新增

export default function Login() {
  const nav = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const onSubmit = async () => {
    setErr('')
    if (!username || !password) {
      setErr('请输入用户名与密码')
      return
    }
    setLoading(true)
    try {
      // 后端：POST /ffaAPI/auth/login  {username, password}
      const { data } = await api.post('/auth/login', { username, password })
      localStorage.setItem('token', data.token)
      localStorage.setItem('username', data.username)
      localStorage.setItem('role', data.role || 'ADMIN')
      nav('/dashboard')
    } catch (e) {
      setErr(e?.response?.data?.message || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="auth-root">
      <div className="auth-card">
        <div className="logo">
          <span className="dot"></span>
          <h2>Sign in</h2>
        </div>

        <div className="field">
          <label>Username</label>
          <input
            type="text"
            placeholder="ffa"
            value={username}
            onChange={e=>setUsername(e.target.value)}
          />
        </div>

        <div className="field">
          <label>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e=>setPassword(e.target.value)}
            onKeyDown={e=>{ if(e.key==='Enter') onSubmit() }}
          />
        </div>

        {err && <div style={{color:'#e11d48', fontSize:13}}>{err}</div>}

        <button className="btn primary" onClick={onSubmit} disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>

        <div className="bottom-link">
          <Link to="/forgot">Forgot password?</Link>
        </div>
      </div>

      {/* 保留你原来的样式 */}
      <style jsx>{`
        .auth-root { position: fixed; inset: 0; display: grid; place-items: center; background: radial-gradient(1000px 600px at 20% 50%, #e9efff 0%, #f5f7fb 40%, #eef2f7 100%); font-family: 'Segoe UI', system-ui, -apple-system, Arial, sans-serif; }
        .auth-card { width: 360px; max-width: calc(100vw - 32px); background: #fff; padding: 28px 24px; border-radius: 14px; box-shadow: 0 12px 30px rgba(23, 37, 84, 0.12); display: flex; flex-direction: column; gap: 14px; }
        .logo { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
        .logo .dot { width: 12px; height: 12px; background: #2563eb; border-radius: 50%; box-shadow: 0 0 0 6px rgba(37, 99, 235, 0.1); }
        .logo h2 { font-size: 22px; margin: 0; color: #0f172a; letter-spacing: .2px; }
        .field { display: flex; flex-direction: column; gap: 6px; }
        label { font-size: 13px; color: #64748b; }
        input { padding: 10px 12px; font-size: 14px; border: 1px solid #d7dfeb; border-radius: 8px; outline: none; background: #fafbff; }
        input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15); background: #fff; }
        .btn.primary { margin-top: 6px; background: #2563eb; color: #fff; border: none; border-radius: 8px; padding: 11px 0; font-weight: 600; cursor: pointer; transition: transform .02s ease, box-shadow .2s ease, background .2s ease; box-shadow: 0 6px 16px rgba(37, 99, 235, 0.25); }
        .btn.primary:hover { background: #1f4fe0; }
        .btn.primary:active { transform: translateY(1px); box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25); }
        .bottom-link { margin-top: 4px; text-align: right; font-size: 13px; }
        .bottom-link a { color: #2563eb; text-decoration: none; }
        .bottom-link a:hover { text-decoration: underline; }
        @media (max-width: 420px) { .auth-card { padding: 22px 18px; border-radius: 12px; } }
      `}</style>
    </section>
  )
}
