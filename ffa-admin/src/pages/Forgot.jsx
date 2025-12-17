import { Link } from 'react-router-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { KeyRound, Mail, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import api from '../api/api'

export default function Forgot() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [okMsg, setOkMsg] = useState('')

  const onSubmit = async () => {
    setErr(''); setOkMsg('')
    if (!email.trim()) {
      setErr('Email address is required.')
      return
    }
    setLoading(true)
    try {
      const res = await api.post('/auth/forgot-password', null, { params: { email: email.trim() } })
      
      if (res.data?.success === false) {
        setErr(res.data?.message || 'Request failed.')
      } else {
        setOkMsg('Security link dispatched. Check your inbox.')
      }
    } catch (e) {
      setErr(e?.response?.data?.message || 'Transmission failed.')
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
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="card auth"
        style={{ 
          maxWidth: 400, width: '90%', background: '#1e1e1e', 
          border: '1px solid #2a2a2a', padding: 32, borderRadius: 16 
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ display: 'inline-flex', padding: 12, background: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', marginBottom: 16, color: '#f59e0b' }}>
            <KeyRound size={28} />
          </div>
          <h2 style={{ margin: 0, fontSize: 20, color: '#fff' }}>Recovery</h2>
          <p className="muted" style={{ marginTop: 8, fontSize: 13 }}>Enter your email to receive a reset token.</p>
        </div>

        <div className="field">
          <label style={{ fontSize: 11, color: '#888', fontWeight: 600, marginBottom: 4, display: 'block' }}>Email Address</label>
          <div style={wrapperStyle}>
            <Mail size={16} style={iconStyle} />
            <input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        {err && <div className="auth-error" style={{marginTop: 16, display:'flex', gap:8, alignItems:'center', color: '#ef4444', fontSize: 13}}><AlertCircle size={16}/> {err}</div>}
        {okMsg && <div className="auth-success" style={{marginTop: 16, display:'flex', gap:8, alignItems:'center', color: '#10b981', fontSize: 13}}><CheckCircle size={16}/> {okMsg}</div>}

        <button 
          className="btn primary" 
          style={{ width: '100%', marginTop: 24, height: 44, background: '#3b82f6', border: 'none', color: '#fff', fontSize: 14 }} 
          disabled={loading} 
          onClick={onSubmit}
        >
          {loading ? 'Processing...' : 'Send Link'}
        </button>

        <div style={{ marginTop: 20, textAlign: 'center', borderTop: '1px solid #2a2a2a', paddingTop: 20 }}>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#a0a0a0', textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Back to Login
          </Link>
        </div>
      </motion.div>
    </section>
  )
}
