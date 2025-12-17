import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ShieldAlert, Search, Download, Filter, 
  Calendar, User, FileText, ServerOff 
} from 'lucide-react'

export default function Logs({ ui }) {
  const [filters, setFilters] = useState({ actor: '', type: 'ALL', date: '' })

  const handleFilter = () => ui.showToast('Filtering is currently disabled')
  const handleExport = () => ui.showToast('Export service unavailable')

  return (
    <div className="logs-page">
      <style>{`
        .logs-page { padding: 24px; font-family: -apple-system, sans-serif; color: #fff; }
        
        /* Toolbar */
        .toolbar { 
          display: flex; gap: 12px; margin-bottom: 24px; padding: 16px; 
          background: #1e1e1e; border: 1px solid #2a2a2a; border-radius: 12px;
          align-items: center; flex-wrap: wrap;
        }
        
        .input-group { position: relative; display: flex; alignItems: center; }
        .input-icon { position: absolute; left: 12px; color: #666; pointer-events: none; }
        .form-control { 
          background: #121212; border: 1px solid #333; color: #fff; 
          padding: 8px 12px 8px 36px; border-radius: 6px; font-size: 13px; min-width: 180px;
        }
        .form-select {
          background: #121212; border: 1px solid #333; color: #fff;
          padding: 8px 12px 8px 36px; border-radius: 6px; font-size: 13px;
        }
        
        .btn { display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; transition: 0.2s; border: none; }
        .btn-primary { background: #3b82f6; color: #fff; }
        .btn-primary:hover { background: #2563eb; }
        .btn-ghost { background: transparent; border: 1px solid #444; color: #ccc; }
        .btn-ghost:hover { background: #333; color: #fff; }

        /* Empty State */
        .empty-state {
          background: #1e1e1e; border: 1px solid #2a2a2a; border-radius: 12px;
          min-height: 400px; display: flex; flexDirection: column;
          align-items: center; justify-content: center; text-align: center;
          padding: 40px; color: #666;
        }
        .code-block {
          background: #121212; padding: 4px 8px; borderRadius: 4px; 
          font-family: monospace; color: #f59e0b; font-size: 12px; margin-top: 8px;
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <ShieldAlert size={24} color="#f59e0b" /> Audit Logs
        </h1>
        <div style={{ color: '#888', fontSize: 13, marginTop: 4, marginLeft: 34 }}>
          Security trail and system access history
        </div>
      </div>

      {/* Filter Toolbar */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }}
        className="toolbar"
      >
        <div className="input-group">
          <User size={14} className="input-icon" />
          <input 
            className="form-control" 
            placeholder="Actor (User ID)" 
            value={filters.actor}
            onChange={e => setFilters({...filters, actor: e.target.value})}
          />
        </div>

        <div className="input-group">
          <FileText size={14} className="input-icon" />
          <select 
            className="form-select"
            value={filters.type}
            onChange={e => setFilters({...filters, type: e.target.value})}
          >
            <option value="ALL">All Entities</option>
            <option value="PROJECT">Project</option>
            <option value="USER">User</option>
            <option value="DICT">System Dict</option>
          </select>
        </div>

        <div className="input-group">
          <Calendar size={14} className="input-icon" />
          <input 
            type="date" 
            className="form-control" 
            value={filters.date}
            onChange={e => setFilters({...filters, date: e.target.value})}
            style={{ colorScheme: 'dark' }}
          />
        </div>

        <button className="btn btn-primary" onClick={handleFilter}>
          <Filter size={14} /> Filter
        </button>

        <div style={{ flex: 1 }} />

        <button className="btn btn-ghost" onClick={handleExport}>
          <Download size={14} /> Export CSV
        </button>
      </motion.div>

      {/* Content Area (Placeholder) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ delay: 0.1 }}
        className="empty-state"
      >
        <div style={{ padding: 24, background: 'rgba(255,255,255,0.03)', borderRadius: '50%', marginBottom: 24 }}>
          <ServerOff size={48} opacity={0.5} />
        </div>
        <h3 style={{ margin: '0 0 8px 0', fontSize: 18, color: '#e0e0e0' }}>Module Not Connected</h3>
        <p style={{ maxWidth: 400, margin: 0, lineHeight: 1.5 }}>
          The Audit Log Controller endpoint is currently unreachable or has not been implemented in the backend API.
        </p>
        <div className="code-block">
          GET /ffaAPI/admin/logs ➔ 404 Not Found
        </div>
      </motion.div>
    </div>
  )
}
