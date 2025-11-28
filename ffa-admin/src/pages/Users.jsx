import { useEffect, useState } from 'react'
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


  const loadPersons = async () => {
    setLoading(true)
    try {

      const isSearch = !!keyword.trim()
      const url = isSearch ? '/ffaAPI/admin/persons/search' : '/ffaAPI/admin/persons'
      const params = { page: 0, size: 50 } 
      if (isSearch) params.keyword = keyword.trim()

      const res = await api.get(url, { params })
      const body = res.data || {}

      if (body.success === false) {
        ui.showToast(body.message || 'Failed to load users')
        return
      }


      const pageData = body.data || {}
      setPersons(pageData.content || pageData.records || [])
    } catch (e) {
      ui.showToast(e?.response?.data?.message || 'Request failed')
    } finally {
      setLoading(false)
    }
  }


  const onSave = async () => {
    if (!form.login || !form.email) {
      ui.showToast('Login and Email are required')
      return
    }
    if (!form.roleId) {
      ui.showToast('Please select a role')
      return
    }

    try {

      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        login: form.login,
        password: form.password || undefined, 
        role: { id: Number(form.roleId) }     
      }

      if (form.id) {
        // Update: PUT /ffaAPI/admin/persons/{id}
        await api.put(`/ffaAPI/admin/persons/${form.id}`, payload)
        ui.showToast('User updated')
      } else {
        // Create: POST /ffaAPI/admin/persons
        await api.post('/ffaAPI/admin/persons', payload)
        ui.showToast('User created')
      }

      setFormOpen(false)
      setForm(initialForm)
      loadPersons()
    } catch (e) {
      ui.showToast(e?.response?.data?.message || 'Save failed')
    }
  }


  const deleteUser = (id, name) => {
    ui.openConfirm(`Delete user ${name}?`, async () => {
      try {
        await api.delete(`/ffaAPI/admin/persons/${id}`)
        ui.showToast('User deleted')
        loadPersons()
      } catch (e) {
        ui.showToast(e?.response?.data?.message || 'Delete failed')
      }
    })
  }


  useEffect(() => {
    loadRoles()    
    loadPersons() 
  }, [])


  const openEdit = (p) => {
    setForm({
      id: p.id,
      firstName: p.firstName || '',
      lastName: p.lastName || '',
      email: p.email || '',
      login: p.login || '',
      password: '',
      roleId: p.role?.id || '' 
    })
    setFormOpen(true)
    setTimeout(() => document.getElementById('user-form')?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  const openCreate = () => {
    setForm(initialForm)
    setFormOpen(true)
    setTimeout(() => document.getElementById('user-form')?.scrollIntoView({ behavior: 'smooth' }), 100)
  }


  const filteredPersons = roleFilter === 'ALL'
    ? persons
    : persons.filter(p => String(p.role?.id) === String(roleFilter))

  const getDisplayName = (p) => [p.firstName, p.lastName].filter(Boolean).join(' ') || p.login

  return (
    <section id="page-users">
      <div className="toolbar">
        <div>
          <div className="muted">User Management</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>Users & Roles</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={loadPersons} disabled={loading}>Refresh</button>
          <button className="btn primary" onClick={openCreate}>New User</button>
        </div>
      </div>

      {/* */}
      <div className="panel" style={{ marginBottom: 12 }}>
        <div className="grid grid-3">
          <div className="field">
            <label>Keyword</label>
            <input 
              placeholder="Search..." 
              value={keyword} 
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && loadPersons()}
            />
          </div>
          
          {/* [API] Filter by Role */}
          <div className="field">
            <label>Filter by Role</label>
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
            >
              <option value="ALL">All Roles</option>
              {roles.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
             <button className="btn primary" onClick={loadPersons}>Search</button>
          </div>
        </div>
      </div>

      {/*  */}
      <div className="panel">
        <table>
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
            {filteredPersons.map(p => (
              <tr key={p.id}>
                <td><strong>{getDisplayName(p)}</strong></td>
                <td>{p.email || '-'}</td>
                <td>{p.login || '-'}</td>
                <td><span className="tag">{p.role?.name || 'No Role'}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn small" onClick={() => openEdit(p)}>Edit</button>
                    <button className="btn small danger" onClick={() => deleteUser(p.id, getDisplayName(p))}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredPersons.length === 0 && !loading && (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: 20 }}>No users found</td></tr>
            )}
            {loading && (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: 20 }}>Loading...</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/*  */}
      {formOpen && (
        <div id="user-form" className="panel" style={{ marginTop: 20, border: '2px solid #eee' }}>
          <h3>{form.id ? 'Edit User' : 'Create New User'}</h3>
          <div className="grid grid-2">
            <div className="field">
              <label>Login *</label>
              <input 
                value={form.login} 
                onChange={e => setForm({ ...form, login: e.target.value })} 
                disabled={!!form.id} 
              />
            </div>
            <div className="field">
              <label>Email *</label>
              <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="field">
                <label>First Name</label>
                <input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
            </div>
            <div className="field">
                <label>Last Name</label>
                <input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
            </div>

            {/* [API] Select Role */}
            <div className="field">
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

            <div className="field">
              <label>Password</label>
              <input 
                type="password"
                placeholder={form.id ? 'Leave blank to keep unchanged' : 'Required'}
                value={form.password} 
                onChange={e => setForm({ ...form, password: e.target.value })} 
              />
            </div>
          </div>
          <div style={{ marginTop: 16, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn" onClick={() => setFormOpen(false)}>Cancel</button>
            <button className="btn primary" onClick={onSave}>{form.id ? 'Save Changes' : 'Create User'}</button>
          </div>
        </div>
      )}
    </section>
  )
}
