import { useEffect, useState } from 'react'
import api from '../api/api'

export default function Announce({ ui }) {
  // --- State Definitions ---
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(false)
  
  // Filters
  const [filters, setFilters] = useState({
    keyword: '',
    status: 'ALL', 
    category: 'ALL' 
  })

  // Editor State
  const initialForm = {
    id: null,
    title: '',
    content: '',
    category: 'GENERAL',
    status: 'DRAFT'
  }
  const [form, setForm] = useState(initialForm)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  // --- API Actions ---

  const loadAnnouncements = async () => {
    setLoading(true)
    try {
      const params = { page: 0, size: 20 }
      if (filters.keyword.trim()) params.keyword = filters.keyword.trim()
      if (filters.status !== 'ALL') params.status = filters.status
      if (filters.category !== 'ALL') params.category = filters.category 

      const res = await api.get('/ffaAPI/admin/announcements', { params })
      const body = res.data || {}

      if (body.success === false) {
        ui.showToast(body.message || 'Failed to load data')
        setAnnouncements([])
        return
      }

      const pageData = body.data || {}
      setAnnouncements(pageData.content || pageData.records || [])
    } catch (e) {
      console.error(e)
      ui.showToast('Network error')
      setAnnouncements([])
    } finally {
      setLoading(false)
    }
  }

  // Handle Save (Create or Update)
  const onSave = async (targetStatus = 'DRAFT') => {
    if (!form.title.trim() || !form.content.trim()) {
      ui.showToast('Title and content are required')
      return
    }

    try {
      const payload = {
        ...form,
        category: form.category || 'GENERAL', 
        status: targetStatus
      }

      let res
      if (form.id) {
        res = await api.put(`/ffaAPI/admin/announcements/${form.id}`, payload)
      } else {
        res = await api.post('/ffaAPI/admin/announcements', payload)
      }

      const body = res.data || {}
      if (body.success === false) {
        ui.showToast(body.message || 'Operation failed')
        return
      }

      ui.showToast(form.id ? 'Updated successfully' : 'Created successfully')
      setIsEditorOpen(false)
      loadAnnouncements()
    } catch (e) {
      ui.showToast(e?.response?.data?.message || 'Save failed')
    }
  }

  // Handle Delete
  const onDelete = (id, title) => {
    ui.openConfirm(`Delete "${title}"?`, async () => {
      try {
        await api.delete(`/ffaAPI/admin/announcements/${id}`)
        ui.showToast('Deleted successfully')
        loadAnnouncements()
      } catch (e) {
        ui.showToast('Delete failed')
      }
    })
  }

  // Handle Quick Publish
  const onPublish = (id) => {
    ui.openConfirm('Publish this announcement now?', async () => {
      try {
        const res = await api.post(`/ffaAPI/admin/announcements/${id}/publish`)
        if (res.data?.success !== false) {
          ui.showToast('Published successfully')
          loadAnnouncements()
        } else {
          ui.showToast(res.data?.message || 'Publish failed')
        }
      } catch (e) {
        ui.showToast('Request failed')
      }
    })
  }

  // --- UI Handlers ---

  useEffect(() => {
    loadAnnouncements()
  }, [filters])

  const openNew = () => {
    setForm(initialForm)
    setShowPreview(false)
    setIsEditorOpen(true)
  }

  const openEdit = (item) => {
    setForm({
      id: item.id,
      title: item.title,
      content: item.content,
      category: item.category || 'GENERAL', 
      status: item.status
    })
    setShowPreview(false)
    setIsEditorOpen(true)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString() + ' ' + new Date(dateStr).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
  }

  const formatCategory = (cat) => {
    if (!cat) return 'General'
    return cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase()
  }

  return (
    <section id="page-announce" style={{ position: 'relative' }}>
      
      {/* --- Toolbar --- */}
      <div className="toolbar">
        <div>
          <div className="muted">System</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>Announcement Manager</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={loadAnnouncements} disabled={loading}>Refresh</button>
          <button className="btn primary" onClick={openNew}>+ New Announcement</button>
        </div>
      </div>

      {/* --- Filters --- */}
      <div className="panel" style={{ marginBottom: 12 }}>
        <div className="grid grid-4">
          <div className="field">
            <label>Keyword</label>
            <input 
              type="text"
              placeholder="Title / Content" 
              value={filters.keyword} 
              onChange={e => setFilters({ ...filters, keyword: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && loadAnnouncements()}
            />
          </div>

          <div className="field">
            <label>Status</label>
            {/* UPDATED: Added form-select class */}
            <select 
              className="form-select"
              value={filters.status} 
              onChange={e => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="ALL">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </div>

          <div className="field">
            <label>Category</label>
            {/* UPDATED: Added form-select class */}
            <select 
              className="form-select"
              value={filters.category} 
              onChange={e => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="ALL">All Categories</option>
              <option value="GENERAL">General</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="NEWS">News</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <button className="btn primary" onClick={loadAnnouncements}>Filter</button>
            <button className="btn ghost" onClick={() => {
              setFilters({ keyword: '', status: 'ALL', category: 'ALL' });
              loadAnnouncements();
            }}>Reset</button>
          </div>
        </div>
      </div>

      {/* --- Data Table --- */}
      <div className="panel">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #f0f0f0', textAlign: 'left' }}>
              <th style={{ padding: 12 }}>Announcement Details</th>
              <th style={{ padding: 12, width: 120 }}>Category</th>
              <th style={{ padding: 12, width: 100 }}>Status</th>
              <th style={{ padding: 12, width: 160 }}>Last Updated</th>
              <th style={{ padding: 12, width: 200, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {announcements.map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                <td style={{ padding: 12 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, color: '#333' }}>{item.title}</div>
                  <div style={{ color: '#888', fontSize: 13, marginTop: 4, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.content}
                  </div>
                </td>
                <td style={{ padding: 12 }}>
                  <span className="tag">{formatCategory(item.category)}</span>
                </td>
                <td style={{ padding: 12 }}>
                  <span 
                    className="tag"
                    style={{ 
                      backgroundColor: item.status === 'PUBLISHED' ? '#f6ffed' : '#fffbe6',
                      borderColor: item.status === 'PUBLISHED' ? '#b7eb8f' : '#ffe58f',
                      color: item.status === 'PUBLISHED' ? '#52c41a' : '#faad14',
                      border: '1px solid'
                    }}
                  >
                    {item.status}
                  </span>
                </td>
                <td style={{ padding: 12, fontSize: 13, color: '#666' }}>
                  {formatDate(item.updatedAt || item.createdAt)}
                </td>
                <td style={{ padding: 12, textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    {item.status !== 'PUBLISHED' && (
                      <button className="btn sm success" title="Publish" onClick={() => onPublish(item.id)}>
                        Publish
                      </button>
                    )}
                    <button className="btn sm" onClick={() => openEdit(item)}>Edit</button>
                    <button className="btn sm danger" onClick={() => onDelete(item.id, item.title)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            
            {announcements.length === 0 && !loading && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                  No announcements found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- Editor Modal --- */}
      {isEditorOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div className="panel" style={{ width: '90%', maxWidth: 800, maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: 0 }}>
            
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>{form.id ? 'Edit Announcement' : 'New Announcement'}</h3>
              <button className="btn sm" onClick={() => setIsEditorOpen(false)}>Close</button>
            </div>

            <div style={{ padding: '24px', flex: 1 }}>
              
              {!showPreview ? (
                /* Edit Mode */
                <div className="grid grid-2" style={{ gap: 20 }}>
                  <div className="field" style={{ gridColumn: 'span 2' }}>
                    <label>Title *</label>
                    <input 
                      value={form.title} 
                      onChange={e => setForm({...form, title: e.target.value})}
                      placeholder="Announcement Title"
                    />
                  </div>

                  <div className="field">
                    <label>Category</label>
                    {/* UPDATED: Added form-select class */}
                    <select 
                        className="form-select"
                        value={form.category} 
                        onChange={e => setForm({...form, category: e.target.value})}
                    >
                      <option value="GENERAL">General</option>
                      <option value="MAINTENANCE">Maintenance</option>
                      <option value="NEWS">News</option>
                    </select>
                  </div>

                  <div className="field">
                    <label>Status (Current)</label>
                    <input value={form.status} disabled style={{ background: '#f9f9f9', cursor: 'not-allowed' }} />
                  </div>

                  <div className="field" style={{ gridColumn: 'span 2' }}>
                    <label>Content *</label>
                    <textarea 
                      rows={10}
                      value={form.content}
                      onChange={e => setForm({...form, content: e.target.value})}
                      placeholder="Write content here..."
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                </div>
              ) : (
                /* Preview Mode */
                <div style={{ background: '#f9f9f9', padding: 30, borderRadius: 8, border: '1px solid #eee' }}>
                   <div style={{ marginBottom: 15 }}>
                     <span className="tag">{formatCategory(form.category)}</span>
                     <span style={{ marginLeft: 10, color: '#999', fontSize: 12 }}>Preview Mode</span>
                   </div>
                   <h2 style={{ margin: '0 0 15px 0', color: '#333' }}>{form.title || 'Untitled'}</h2>
                   <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: '#444' }}>
                     {form.content || 'No content provided.'}
                   </div>
                </div>
              )}

            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid #eee', background: '#fdfdfd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button className="btn" onClick={() => setShowPreview(!showPreview)}>
                {showPreview ? 'Back to Edit' : 'Show Preview'}
              </button>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn" onClick={() => setIsEditorOpen(false)}>Cancel</button>
                <button className="btn" onClick={() => onSave('DRAFT')}>
                  {form.id ? 'Save Draft' : 'Create as Draft'}
                </button>
                <button className="btn primary" onClick={() => onSave('PUBLISHED')}>
                  {form.status === 'PUBLISHED' ? 'Update & Publish' : 'Publish Immediately'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* UPDATED: Enhanced styles */}
      <style>{`
        .tag {
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          background: #e6f7ff;
          color: #1890ff;
          border: 1px solid #91d5ff;
          display: inline-block;
        }
        .btn.sm {
          padding: 2px 8px;
          font-size: 12px;
          height: 28px;
          line-height: 1;
        }
        .success { background-color: #52c41a; color: white; border: none; }
        .danger { background-color: #ff4d4f; color: white; border: none; }

        /* UNIFIED SELECT STYLE */
        .form-select {
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          background-color: #fff;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23999' d='M6 8.825L1.175 4 2.238 2.938 6 6.7 9.763 2.938 10.825 4z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 10px center;
          border: 1px solid #d9d9d9;
          border-radius: 4px;
          padding: 6px 30px 6px 12px;
          font-size: 14px;
          color: #333;
          transition: all 0.2s;
          outline: none;
          height: 38px; 
          width: 100%;
        }
        .form-select:focus {
          border-color: #40a9ff;
          box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
        }
        .form-select:hover {
          border-color: #40a9ff;
        }
      `}</style>
    </section>
  )
}
