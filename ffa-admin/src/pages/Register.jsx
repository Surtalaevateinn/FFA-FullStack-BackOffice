import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { UserPlus, Mail, Lock, User, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import api from '../api/api'

export default function Register() {
  const nav = useNavigate()

  const [form, setForm] = useState({
    login: '', email: '', password: '', firstName: '', lastName: ''
  })

  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [okMsg, setOkMsg] = useState('')

  const onChange = (field, value) => setForm(s => ({ ...s, [field]: value }))

  const submit = async () => {
    setErr(''); setOkMsg('')

    if (!form.login.trim() || !form.password.trim()) {
      setErr('Essential credentials (Login & Password) are required.')
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

      if (!res.data?.success) {
        setErr(res.data?.message || 'Registration rejected by server.')
        return
      }

      setOkMsg('Account provisioned successfully. Redirecting...')
      setTimeout(() => nav('/login'), 1500)

    } catch (e) {
      setErr(e?.response?.data?.message || 'Registration failed.')
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
        initial={{ opacity: 0, scale: 0.98 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ duration: 0.3 }}
        className="card auth"
        style={{ 
          maxWidth: 480, width: '90%', background: '#1e1e1e', 
          border: '1px solid #2a2a2a', padding: 32, borderRadius: 16 
        }} 
      >
        <div style={{ marginBottom: 24, textAlign: 'center' }}>
           <div style={{ display: 'inline-flex', padding: 10, background: 'rgba(59, 130, 246, 0.1)', borderRadius: 12, marginBottom: 15, color: '#3b82f6' }}>
             <UserPlus size={24} />
           </div>
           <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#fff' }}>Initialize Account</h2>
           <p className="muted" style={{ marginTop: 6, fontSize: 13 }}>Create a new identity in the FFA Registry.</p>
        </div>

        <div className="grid" style={{ gap: 16 }}>
          {/* Names Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
             <div className="field">
                <label style={{ fontSize: 11, color: '#888', fontWeight: 600, marginBottom: 4, display: 'block' }}>First Name</label>
                <div style={wrapperStyle}>
                  <User size={14} style={iconStyle} />
                  <input style={inputStyle} value={form.firstName} onChange={e => onChange('firstName', e.target.value)} placeholder="John" />
                </div>
             </div>
             <div className="field">
                <label style={{ fontSize: 11, color: '#888', fontWeight: 600, marginBottom: 4, display: 'block' }}>Last Name</label>
                <div style={wrapperStyle}>
                  <User size={14} style={iconStyle} />
                  <input style={inputStyle} value={form.lastName} onChange={e => onChange('lastName', e.target.value)} placeholder="Doe" />
                </div>
             </div>
          </div>

          <div className="field">
            <label style={{ fontSize: 11, color: '#888', fontWeight: 600, marginBottom: 4, display: 'block' }}>Login ID *</label>
            <div style={wrapperStyle}>
              <User size={14} style={iconStyle} />
              <input value={form.login} onChange={e => onChange('login', e.target.value)} placeholder="username" style={inputStyle} />
            </div>
          </div>

          <div className="field">
            <label style={{ fontSize: 11, color: '#888', fontWeight: 600, marginBottom: 4, display: 'block' }}>Email Address</label>
            <div style={wrapperStyle}>
              <Mail size={14} style={iconStyle} />
              <input type="email" value={form.email} onChange={e => onChange('email', e.target.value)} placeholder="user@ffa.com" style={inputStyle} />
            </div>
          </div>

          <div className="field">
            <label style={{ fontSize: 11, color: '#888', fontWeight: 600, marginBottom: 4, display: 'block' }}>Password *</label>
            <div style={wrapperStyle}>
              <Lock size={14} style={iconStyle} />
              <input type="password" value={form.password} onChange={e => onChange('password', e.target.value)} placeholder="••••••" style={inputStyle} />
            </div>
          </div>
        </div>

        {err && <div className="auth-error" style={{marginTop: 20, display:'flex', gap:8, alignItems:'center', color: '#ef4444', fontSize: 13}}><AlertCircle size={16}/> {err}</div>}
        {okMsg && <div className="auth-success" style={{marginTop: 20, display:'flex', gap:8, alignItems:'center', color: '#10b981', fontSize: 13}}><CheckCircle size={16}/> {okMsg}</div>}

        <button 
          className="btn primary" 
          disabled={loading} 
          style={{ width: '100%', marginTop: 24, height: 44, background: '#3b82f6', border: 'none', color: '#fff', fontSize: 14 }} 
          onClick={submit}
        >
          {loading ? 'Registering...' : 'Confirm Registration'}
        </button>

        <div style={{ marginTop: 20, textAlign: 'center', borderTop: '1px solid #2a2a2a', paddingTop: 20 }}>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#a0a0a0', textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Return to Login
          </Link>
        </div>
      </motion.div>
    </section>
  )
}
