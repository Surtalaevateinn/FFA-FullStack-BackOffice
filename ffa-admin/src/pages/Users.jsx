import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion' 
import { Loader2 } from 'lucide-react' 
import api from '../api/api'

export default function Users({ ui }) {
  const [persons, setPersons] = useState([])
  const [roles, setRoles] = useState([]) 
  const [loading, setLoading] = useState(false)
  
  const [keyword, setKeyword] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')

  const initialForm = {
    id: null,
    firstName: '',
    lastName: '',
    email: '',
    login: '',
    password: '',
    roleId: ''    
  }
  const [form, setForm] = useState(initialForm)
  const [formOpen, setFormOpen] = useState(false)

  // Load available roles for the dropdown
  const loadRoles = async () => {
    try {
      const res = await api.get('/ffaAPI/admin/roles')
      const body = res.data || {}
      
      if (body.success === false) {
        console.warn('Failed to load roles:', body.message)
        return
      }

      setRoles(body.data || []) 
    } catch (e) {
      console.error('API Error loading roles:', e)
      ui.showToast('Failed to load role list')
    }
  }

  // Load users from backend
  const loadPersons = async () => {
    setLoading(true)
    try {
      const isSearch = !!keyword.trim()
      let url = '/ffaAPI/admin/persons'
      const params = { page: 0, size: 50 } 

      if (isSearch) {
        url = '/ffaAPI/admin/persons/search'
        params.keyword = keyword.trim()
      } else {
        if (roleFilter !== 'ALL') {
          params.roleId = roleFilter
        }
      }

      const res = await api.get(url, { params })
      const body = res.data || {}

      if (body.success === false) {
        ui.showToast(body.message || 'Failed to load users')
        setPersons([]) 
        return
      }

      const pageData = body.data || {}
      setPersons(pageData.content || pageData.records || [])
    } catch (e) {
      ui.showToast(e?.response?.data?.message || 'Request failed')
      setPersons([])
    } finally {
      // Smooth out rapid loading flicker
      setTimeout(() => setLoading(false), 200)
    }
  }

 // Create or Update user
  const onSave = async () => {
    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        login: form.login,
        password: form.password || undefined, 
        roleId: Number(form.roleId)     
      }

      let res; 
      if (form.id) {
        res = await api.put(`/ffaAPI/admin/persons/${form.id}`, payload)
      } else {
        res = await api.post('/ffaAPI/admin/persons', payload)
      }

      const body = res.data || {}
      if (body.success === false) {
        ui.showToast(body.message || 'Operation failed')
        return 
      }
      
      ui.showToast(form.id ? 'User updated' : 'User created')
      setFormOpen(false)
      setForm(initialForm)
      loadPersons() 
    } catch (e) {
      ui.showToast(e?.response?.data?.message || 'Save failed')
    }
  }

  // Use window.confirm instead of ui.openConfirm
  const deleteUser = async (id, name) => {
    if (!window.confirm(`Delete user ${name}?`)) return
    
    try {
      await api.delete(`/ffaAPI/admin/persons/${id}`)
      ui.showToast('User deleted')
      loadPersons()
    } catch (e) {
      ui.showToast(e?.response?.data?.message || 'Delete failed')
    }
  }

  // Initial load
  useEffect(() => {
    loadRoles()    
  }, [])

  useEffect(() => {
    loadPersons()
  }, [roleFilter]) 

  const openEdit = (p) => {
    setForm({
      id: p.id,
      firstName: p.firstName || '',
      lastName: p.lastName || '',
      email: p.email || '',
      login: p.login || '',
      password: '',
      roleId: p.roleId || p.role?.id || '' 
    })
    setFormOpen(true)
    setTimeout(() => document.getElementById('user-form')?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  const openCreate = () => {
    setForm(initialForm)
    setFormOpen(true)
    setTimeout(() => document.getElementById('user-form')?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  const getDisplayName = (p) => [p.firstName, p.lastName].filter(Boolean).join(' ') || p.login

  return (
    <div className="users-page">
       {/* CSS Styles - Unified with Announce.jsx (Transparent/Dark) */}
       <style>{`
        .users-page { padding: 20px; font-family: -apple-system, sans-serif; color: inherit; }
        
        /* Spin Animation */
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }

        /* Toolbar: Transparent background, consistent with Announce */
        .toolbar { 
          display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; 
          background: transparent; 
          padding: 15px; border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
          align-items: center;
        }
        
        /* Inputs: Dark/Transparent background */
        .form-control, .form-select, input, textarea, select {
          padding: 8px 12px; 
          border: 1px solid #555; 
          border-radius: 4px;
          background: rgba(0, 0, 0, 0.2); 
          color: inherit;
        }

        /* Buttons */
        .btn {
          padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer;
          font-weight: 500; transition: all 0.2s;
        }
        .btn:hover { opacity: 0.9; }
        .primary { background: #1890ff; color: white; }
        .default { background: transparent; border: 1px solid #777; color: inherit; }
        .success { background: #52c41a; color: white; }
        .danger { background: #ff4d4f; color: white; }
        .sm { padding: 4px 8px; font-size: 12px; }

        /* Table: Transparent headers and cells */
        .data-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .data-table th, .data-table td {
          border: 1px solid rgba(255,255,255,0.1); padding: 12px; text-align: left;
        }
        .data-table th { background: transparent; font-weight: 600; }
        
        /* Badges */
        .role-badge {
          padding: 2px 8px; border-radius: 10px; font-size: 12px;
          background: rgba(24, 144, 255, 0.2); color: #1890ff; border: 1px solid #1890ff;
        }
        .role-badge.no-role {
          background: rgba(153, 153, 153, 0.2); color: #999; border: 1px solid #777;
        }

        /* Form Container (Replaces Panel) - Dark Theme */
        .form-container {
          background: #1f1f1f; 
          color: #e0e0e0;
          padding: 25px;
          border-radius: 8px; 
          border: 1px solid #333;
          margin-top: 20px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        .form-header { font-size: 18px; font-weight: bold; margin-bottom: 20px; border-bottom: 1px solid #333; padding-bottom: 10px; }
        
        /* Grid for Form */
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .form-group { margin-bottom: 15px; }
        .form-group label { display: block; margin-bottom: 5px; font-weight: 500; font-size: 14px; }
        .form-group input, .form-group select { width: 100%; box-sizing: border-box; background: #2b2b2b; border: 1px solid #444; color: #fff; }
        
        .form-actions {
          margin-top: 20px; display: flex; justify-content: flex-end; gap: 10px;
        }
      `}</style>

      {/* 1. Top Toolbar & Filters */}
      <div className="toolbar">
        {/* Title Area */}
        <div style={{ marginRight: 'auto' }}>
          <div style={{ fontSize: '12px', opacity: 0.7 }}>User Management</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>Users & Roles</div>
        </div>

        {/* Filters */}
        <input 
          style={{ width: '200px' }}
          placeholder="Name / Email / Login" 
          value={keyword} 
          onChange={e => setKeyword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && loadPersons()}
        />
        
        <select
          style={{ width: '150px' }}
          value={roleFilter}
          onChange={e => {
            setRoleFilter(e.target.value)
            setKeyword('') 
          }}
        >
          <option value="ALL">All Roles</option>
          {roles.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>

        <button className="btn primary" onClick={loadPersons}>Search</button>
        <button className="btn default" onClick={() => {
            setKeyword('');
            setRoleFilter('ALL');
            loadPersons();
        }}>Reset</button>

        <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)', height: '30px', margin: '0 10px' }}></div>

        <button className="btn success" onClick={openCreate}>+ New User</button>
      </div>

      {/* 2. Data Table */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60, color: '#666' }}>
          <Loader2 className="animate-spin" size={24} />
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.3 }}
        >
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Login</th>
                <th>Role</th>
                <th style={{ width: 180 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {persons.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', color: '#999', padding: 20 }}>No users found</td></tr>
              ) : (
                persons.map(p => (
                  <tr key={p.id}>
                    <td><strong>{getDisplayName(p)}</strong></td>
                    <td>{p.email || '-'}</td>
                    <td>{p.login || '-'}</td>
                    <td>
                      <span className={`role-badge ${!p.role && !p.roleId ? 'no-role' : ''}`}>
                        {p.role ? p.role.name : (p.roleId ? `Role #${p.roleId}` : 'No Role')}
                      </span>
                    </td>
                    <td>
                      <button className="btn sm primary" onClick={() => openEdit(p)} style={{ marginRight: 8 }}>Edit</button>
                      <button className="btn sm danger" onClick={() => deleteUser(p.id, getDisplayName(p))}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* 3. Form Section (Styled like a dark card instead of generic panel) */}
      <AnimatePresence>
        {formOpen && (
          <motion.div 
            id="user-form" 
            className="form-container"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <div className="form-header">
              {form.id ? 'Edit User' : 'Create New User'}
            </div>
            
            <div className="form-grid">
              {/* Left Column */}
              <div>
                <div className="form-group">
                  <label>Login (Username) *</label>
                  <input 
                    value={form.login} 
                    onChange={e => setForm({ ...form, login: e.target.value })} 
                    disabled={!!form.id} 
                    placeholder="e.g. jdoe"
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input 
                    value={form.email} 
                    onChange={e => setForm({ ...form, email: e.target.value })} 
                    placeholder="e.g. user@example.com"
                  />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input 
                    type="password"
                    placeholder={form.id ? 'Leave blank to keep unchanged' : 'Required for new user'}
                    value={form.password} 
                    onChange={e => setForm({ ...form, password: e.target.value })} 
                  />
                </div>
              </div>

              {/* Right Column */}
              <div>
                <div className="form-group">
                  <label>First Name</label>
                  <input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Role *</label>
                  <select 
                    value={form.roleId} 
                    onChange={e => setForm({ ...form, roleId: e.target.value })}
                  >
                    <option value="">-- Select Role --</option>
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button className="btn default" onClick={() => setFormOpen(false)}>Cancel</button>
              <button className="btn primary" onClick={onSave}>
                {form.id ? 'Save Changes' : 'Create User'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
