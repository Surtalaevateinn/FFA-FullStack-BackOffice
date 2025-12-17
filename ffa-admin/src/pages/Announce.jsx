import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import api from '../api/api'

// --- Utility: Date Formatter ---
const formatDate = (dateString) => {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    // Use en-GB or en-US for English format (e.g., "17/12/2025, 18:30")
    return date.toLocaleString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (e) {
    return dateString
  }
}

// --- Component Definition ---
export default function Announce({ ui }) {
  // 1. Data & Loading State
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(false)

  // 2. Filter State
  const [filters, setFilters] = useState({
    keyword: '',
    status: 'ALL',
    category: 'ALL'
  })

  // 3. Form & Editor State
  const initialForm = {
    id: null,
    title: '',
    content: '',
    category: 'GENERAL', // Default
    status: 'DRAFT'      // Default
  }
  const [form, setForm] = useState(initialForm)
  const [isEditorOpen, setIsEditorOpen] = useState(false)

  // --- API Interaction Logic ---

  const loadAnnouncements = async () => {
    setLoading(true)
    try {
      // Build query params
      const params = { page: 0, size: 20 }
      if (filters.keyword.trim()) params.keyword = filters.keyword.trim()
      if (filters.status !== 'ALL') params.status = filters.status
      if (filters.category !== 'ALL') params.category = filters.category

      const res = await api.get('/ffaAPI/admin/announcements', { params })
      const body = res.data || {}

      if (body.success === false) {
        ui.showToast(body.message || 'Failed to load data')
        setAnnouncements([])
      } else {
        // Handle pagination structure or direct list
        const list = body.data?.content || body.data || []
        
        // --- ADDED: Sort by ID Ascending (从小到大) ---
        list.sort((a, b) => a.id - b.id)
        
        setAnnouncements(list)
      }
    } catch (error) {
      console.error(error)
      ui.showToast('Network error, unable to load announcements')
    } finally {
      // Smooth out rapid loading flicker
      setTimeout(() => setLoading(false), 200)
    }
  }

  // Initial Load
  useEffect(() => {
    loadAnnouncements()
  }, [])

  // Handle Search
  const handleSearch = () => {
    loadAnnouncements()
  }

  // --- Editor Operations ---

  const handleOpenCreate = () => {
    setForm(initialForm)
    setIsEditorOpen(true)
  }

  const handleEdit = (item) => {
    // Double check to prevent editing published items via code execution
    if (item.status === 'PUBLISHED') {
      ui.showToast('Published announcements cannot be edited.')
      return
    }
    setForm({ ...item })
    setIsEditorOpen(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return
    try {
      const res = await api.delete(`/ffaAPI/admin/announcements/${id}`)
      if (res.data?.success) {
        ui.showToast('Deleted successfully')
        loadAnnouncements()
      } else {
        ui.showToast(res.data?.message || 'Delete failed')
      }
    } catch (e) {
      ui.showToast('Error during deletion')
    }
  }

  const handlePublish = async (id) => {
    try {
      const res = await api.post(`/ffaAPI/admin/announcements/${id}/publish`)
      if (res.data?.success) {
        ui.showToast('Published successfully')
        loadAnnouncements()
      }
    } catch (e) {
      ui.showToast('Publish failed')
    }
  }

  const handleSave = async () => {
    if (!form.title || !form.content) {
      ui.showToast('Title and Content are required')
      return
    }

    try {
      let res
      if (form.id) {
        // Update
        res = await api.put('/ffaAPI/admin/announcements', form)
      } else {
        // Create
        res = await api.post('/ffaAPI/admin/announcements', form)
      }

      if (res.data?.success) {
        ui.showToast('Saved successfully')
        setIsEditorOpen(false)
        loadAnnouncements()
      } else {
        ui.showToast(res.data?.message || 'Save failed')
      }
    } catch (e) {
      console.error(e)
      ui.showToast('Error saving data')
    }
  }

  // --- Render ---

  return (
    <div className="announce-page">
      {/* CSS Styles - Transparent/Dark Theme */}
      <style>{`
        .announce-page { padding: 20px; font-family: -apple-system, sans-serif; color: inherit; }
        
        /* Spin Animation */
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }

        /* Toolbar: Transparent background */
        .toolbar { 
          display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; 
          background: transparent; 
          padding: 15px; border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
        }
        
        /* Inputs: Dark/Transparent background */
        .form-control, .form-select, input, textarea, select {
          padding: 8px 12px; 
          border: 1px solid #555; 
          border-radius: 4px;
          background: rgba(0, 0, 0, 0.2); 
          color: inherit;
        }
        
        .btn {
          padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer;
          font-weight: 500; transition: all 0.2s;
        }
        .btn:hover { opacity: 0.9; }
        .primary { background: #1890ff; color: white; }
        
        /* Default Button: Transparent */
        .default { background: transparent; border: 1px solid #777; color: inherit; }
        
        .success { background: #52c41a; color: white; }
        .danger { background: #ff4d4f; color: white; }
        .sm { padding: 4px 8px; font-size: 12px; margin-right: 5px; }
        
        /* Table: Transparent headers and cells */
        .data-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .data-table th, .data-table td {
          border: 1px solid rgba(255,255,255,0.1); padding: 12px; text-align: left;
        }
        .data-table th { background: transparent; font-weight: 600; }
        
        .status-badge {
          padding: 2px 8px; border-radius: 10px; font-size: 12px;
        }
        .status-DRAFT { background: rgba(212, 107, 8, 0.2); color: #d46b08; border: 1px solid #d46b08; }
        .status-PUBLISHED { background: rgba(56, 158, 13, 0.2); color: #389e0d; border: 1px solid #389e0d; }

        /* Modal: Dark background for readability */
        .modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          background: #1f1f1f; 
          color: #e0e0e0;
          width: 600px; max-width: 90%; padding: 25px;
          border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          border: 1px solid #333;
        }
        .modal-header { font-size: 18px; font-weight: bold; margin-bottom: 20px; }
        .form-group { margin-bottom: 15px; }
        .form-group label { display: block; margin-bottom: 5px; font-weight: 500; }
        
        .form-group input, .form-group textarea, .form-group select {
          width: 100%; padding: 8px; 
          border: 1px solid #444; 
          border-radius: 4px; 
          box-sizing: border-box;
          background: #2b2b2b; 
          color: #fff;
        }
        .form-group textarea { height: 120px; resize: vertical; }
        .modal-footer { text-align: right; margin-top: 20px; }
      `}</style>

      {/* 1. Top Toolbar */}
      <div className="toolbar">
        <input
          className="form-control"
          placeholder="Search title..."
          value={filters.keyword}
          onChange={e => setFilters({ ...filters, keyword: e.target.value })}
        />
        <select
          className="form-select"
          value={filters.status}
          onChange={e => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="ALL">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
        </select>
        <select
          className="form-select"
          value={filters.category}
          onChange={e => setFilters({ ...filters, category: e.target.value })}
        >
          <option value="ALL">All Categories</option>
          <option value="GENERAL">General</option>
          <option value="NEWS">News</option>
          <option value="MAINTENANCE">Maintenance</option>
        </select>
        
        <button className="btn primary" onClick={handleSearch}>Search</button>
        <button className="btn success" onClick={handleOpenCreate} style={{ marginLeft: 'auto' }}>
          + New Announcement
        </button>
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
                <th>ID</th>
                <th style={{ width: '30%' }}>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Publish Time</th>
                <th>Create Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {announcements.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', color: '#999' }}>No Data</td></tr>
              ) : (
                announcements.map(item => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.title}</td>
                    <td>{item.category}</td>
                    <td>
                      <span className={`status-badge status-${item.status}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>{formatDate(item.publishTime)}</td>
                    <td>{formatDate(item.createTime)}</td>
                    <td>
                      {/* LOGIC: Only show Edit/Publish if NOT Published */}
                      {item.status !== 'PUBLISHED' && (
                         <>
                           <button className="btn sm success" onClick={() => handlePublish(item.id)}>Publish</button>
                           <button className="btn sm primary" onClick={() => handleEdit(item)}>Edit</button>
                         </>
                      )}
                      {/* Delete is always available */}
                      <button className="btn sm danger" onClick={() => handleDelete(item.id)}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* 3. Modal Editor */}
      <AnimatePresence>
        {isEditorOpen && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="modal-content"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="modal-header">
                {form.id ? 'Edit Announcement' : 'New Announcement'}
              </div>
              
              <div className="form-group">
                <label>Title</label>
                <input
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Enter title"
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                >
                  <option value="GENERAL">General</option>
                  <option value="NEWS">News</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>
              </div>

              <div className="form-group">
                <label>Content</label>
                <textarea
                  value={form.content}
                  onChange={e => setForm({ ...form, content: e.target.value })}
                  placeholder="Enter content..."
                />
              </div>

              <div className="modal-footer">
                <button className="btn default" onClick={() => setIsEditorOpen(false)} style={{ marginRight: '10px' }}>
                  Cancel
                </button>
                <button className="btn primary" onClick={handleSave}>
                  {form.id ? 'Save Changes' : 'Create Now'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
