export default function Logs({ui}){
  
  const handleFilter = () => {
      ui.showToast('Filter API not implemented')
  }

  const handleExport = () => {
      ui.showToast('Export API not implemented')
  }

  return (
    <section id="page-logs">
      <div className="toolbar">
        <div>
          <div className="muted">Compliance</div>
          <div style={{fontSize:20, fontWeight:700}}>Audit Logs</div>
        </div>
        <div style={{display:'flex', gap:8}}>
          <button className="btn ghost" onClick={handleExport}>Export CSV</button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="panel" style={{marginBottom:12}}>
        <div className="grid grid-4">
          <div className="field"><label>Actor (User)</label><input placeholder="User ID / Login" /></div>
          <div className="field"><label>Entity Type</label>
            <select defaultValue="ALL">
              <option value="ALL">All</option>
              <option>PROJECT</option>
              <option>USER</option>
              <option>DICT</option>
            </select>
          </div>
          <div className="field"><label>Date From</label><input type="date" /></div>
          <div className="field" style={{display:'flex', alignItems:'flex-end'}}>
              <button className="btn primary" style={{width:'100%'}} onClick={handleFilter}>Apply Filter</button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      <div className="panel">
        <table>
          <thead><tr><th>Time</th><th>User</th><th>Action</th><th>Entity</th><th>IP</th></tr></thead>
          <tbody>
            <tr>
                <td colSpan={5} style={{textAlign:'center', padding:40, color:'#999'}}>
                    Audit Log Controller is missing in backend.<br/>
                    Please implement <code>/ffaAPI/admin/logs</code>
                </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}
