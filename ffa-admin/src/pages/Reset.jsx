import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, Lock, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import api from '../api/api'

export default function Reset() {
  const location = useLocation()
  const nav = useNavigate()

  const token = useMemo(() => new URLSearchParams(location.search).get('token') || '', [location.search])
  
  const [pwd, setPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [okMsg, setOkMsg] = useState('')

  const onSubmit = async () => {
    setErr(''); setOkMsg('')
    if (!token) return setErr('Invalid security token.')
    if (!pwd || !confirmPwd) return setErr('All fields are mandatory.')
    if (pwd !== confirmPwd) return setErr('Passwords do not match.')

    setLoading(true)
    try {
      const res = await api.post('/auth/reset-password', null, { params: { token, newPassword: pwd } })
      if (res.data?.success === false) {
        setErr(res.data?.message || 'Reset failed.')
        return
      }
      setOkMsg('Credentials updated. Redirecting to login...')
      setTimeout(() => nav('/login'), 2000)
    } catch (e) {
      setErr(e?.response?.data?.message || 'Operation failed.')
    } finally {
      setLoading(false)
    }
  }

  // Shared Styles
  const wrapperStyle = { position: 'relative', display: 'flex', alignItems: 'center' }
  const iconStyle = { position: 'absolute', left: 12, color: '#666', pointerEvents: 'none' }
  const inputStyle = { 
    width: '100%', padding: '10px 12px 10px 40px', borderRadius: '8px', 
    border: '1px solid #333', background: '#121212', color: '#fff', fontSize: '13px', outline: 'none' 
  }

  return (
    <section className="center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="card auth"
        style={{ 
          maxWidth: 400, width: '90%', background: '#1e1e1e', 
          border: '1px solid #2a2a2a', padding: 32, borderRadius: 16 
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ display: 'inline-flex', padding: 12, background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', marginBottom: 16, color: '#10b981' }}>
             <ShieldCheck size={32} />
          </div>
          <h2 style={{ margin: 0, fontSize: 22, color: '#fff' }}>Secure Reset</h2>
        </div>

        {!token ? (
           <div className="auth-error" style={{ textAlign: 'center', padding: 20, color: '#ef4444', fontSize: 13 }}>
             <AlertCircle size={24} style={{ marginBottom: 10, display: 'block', margin: '0 auto 10px' }} />
             Missing or invalid token. Please ensure you clicked the link in your email.
           </div>
        ) : (
          <div className="grid" style={{ gap: 16 }}>
            <div className="field">
              <label style={{ fontSize: 11, color: '#888', fontWeight: 600, marginBottom: 4, display: 'block' }}>New Password</label>
              <div style={wrapperStyle}>
                <Lock size={16} style={iconStyle} />
                <input type="password" value={pwd} onChange={e => setPwd(e.target.value)} style={inputStyle} />
              </div>
            </div>

            <div className="field">
              <label style={{ fontSize: 11, color: '#888', fontWeight: 600, marginBottom: 4, display: 'block' }}>Confirm Password</label>
              <div style={wrapperStyle}>
                <Lock size={16} style={iconStyle} />
                <input type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} style={inputStyle} />
              </div>
            </div>

            {err && <div className="auth-error" style={{display:'flex', gap:8, alignItems:'center', color: '#ef4444', fontSize: 13}}><AlertCircle size={16}/> {err}</div>}
            {okMsg && <div className="auth-success" style={{display:'flex', gap:8, alignItems:'center', color: '#10b981', fontSize: 13}}><CheckCircle size={16}/> {okMsg}</div>}

            <button 
              className="btn primary" 
              disabled={loading} 
              onClick={onSubmit} 
              style={{ width: '100%', marginTop: 10, height: 44, background: '#3b82f6', border: 'none', color: '#fff', fontSize: 14 }} 
            >
              {loading ? 'Securing...' : 'Update Credentials'}
            </button>
          </div>
        )}

        <div className="muted" style={{ marginTop: 20, textAlign: 'center', borderTop: '1px solid #2a2a2a', paddingTop: 20 }}>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#a0a0a0', textDecoration: 'none' }}>
             <ArrowLeft size={14} /> Back to Sign In
          </Link>
        </div>
      </motion.div>
    </section>
  )
}
