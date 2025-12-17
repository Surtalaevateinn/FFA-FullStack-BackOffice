import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Command, Lock, LogIn, AlertCircle, User, ArrowRight } from 'lucide-react'
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
      setErr('Please enter your credentials.')
      return
    }
    setLoading(true)
    try {
      const res = await api.post('/auth/login', { login, password })
      const body = res.data || {}

      if (body.success === false || !body.data) {
        setErr(body.message || 'Authentication failed')
        return
      }

      const tokens = body.data || {}
      const accessToken = tokens.accessToken || tokens.token
      const refreshToken = tokens.refreshToken
      const user = tokens.user || tokens.person || {}

      if (!accessToken) {
        setErr('Protocol Error: Missing access token.')
        return
      }

      localStorage.setItem('token', accessToken)
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken)
      if (user.login || user.username) localStorage.setItem('username', user.login || user.username)
      
      // Default role fallback
      localStorage.setItem('role', user.role || user.roleName || 'ADMIN')

      nav('/dashboard')
    } catch (e) {
      setErr(e?.response?.data?.message || 'Connection refused or invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  // --- Internal Styles for exact control ---
  const styles = {
    wrapper: {
      position: 'relative',
      width: '100%',
    },
    icon: {
      position: 'absolute',
      left: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#666',
      pointerEvents: 'none'
    },
    input: {
      width: '100%',
      padding: '10px 12px 10px 40px', // Extra padding-left for icon
      borderRadius: '8px',
      border: '1px solid #333',
      background: '#1a1a1a',
      color: '#fff',
      fontSize: '14px',
      outline: 'none',
      transition: 'border-color 0.2s'
    }
  }

  return (
    <section className="center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="card auth"
        style={{ 
          maxWidth: '400px', 
          width: '90%',
          borderTop: '4px solid #3b82f6', // Accent top border
          padding: '32px',
          background: '#1e1e1e',
          border: '1px solid #2a2a2a'
        }} 
      >
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: '48px', 
            height: '48px', 
            background: 'rgba(59, 130, 246, 0.1)', 
            borderRadius: '12px', 
            marginBottom: '16px', 
            color: '#3b82f6' 
          }}>
            <Command size={24} />
          </div>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#fff' }}>Welcome Back</h2>
          <p className="muted" style={{ marginTop: '8px', fontSize: '14px' }}>Sign in to FFA Admin Dashboard</p>
        </div>

        {/* Form Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Login Input */}
          <div className="field">
            <label style={{display:'block', marginBottom: 6, fontSize: 12, color:'#888', fontWeight: 500}}>Identity</label>
            <div style={styles.wrapper}>
              <User size={18} style={styles.icon} />
              <input
                type="text"
                placeholder="Login or Email"
                value={login}
                onChange={e => setLogin(e.target.value)}
                style={styles.input}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#333'}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="field">
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 6}}>
              <label style={{fontSize: 12, color:'#888', fontWeight: 500}}>Credentials</label>
              <Link to="/forgot" style={{ fontSize: 12, color: '#3b82f6', textDecoration: 'none' }}>Forgot password?</Link>
            </div>
            <div style={styles.wrapper}>
              <Lock size={18} style={styles.icon} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={styles.input}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#333'}
                onKeyDown={e => e.key === 'Enter' && onSubmit()}
              />
            </div>
          </div>
        </div>

        {/* Error Feedback */}
        {err && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              marginTop: '20px', 
              padding: '10px', 
              borderRadius: '6px', 
              background: 'rgba(239, 68, 68, 0.1)', 
              color: '#ef4444',
              fontSize: '13px' 
            }}
          >
            <AlertCircle size={16} />
            {err}
          </motion.div>
        )}

        {/* Primary Action */}
        <button
          className="btn primary"
          onClick={onSubmit}
          disabled={loading}
          style={{ 
            width: '100%', 
            marginTop: '24px', 
            height: '44px', 
            justifyContent: 'center', 
            fontSize: '14px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'wait' : 'pointer'
          }}
        >
          {loading ? 'Authenticating...' : (
            <>Sign In <LogIn size={16} style={{marginLeft: 8}} /></>
          )}
        </button>

        {/* Footer Link */}
        <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #2a2a2a' }}>
          <span className="muted" style={{fontSize: 13}}>New to the system? </span>
          <Link to="/register" style={{ fontWeight: 600, color: '#fff', marginLeft: '6px', textDecoration: 'none', fontSize: 13, display: 'inline-flex', alignItems:'center' }}>
            Create account <ArrowRight size={12} style={{marginLeft: 2}}/>
          </Link>
        </div>

      </motion.div>
    </section>
  )
}
