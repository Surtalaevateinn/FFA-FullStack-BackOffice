export default function Logs({ui}){
  return (
    <section id="page-logs">
      <div className="toolbar">
        <div>
          <div className="muted">Compliance</div>
          <div style={{fontSize:20, fontWeight:700}}>Audit Logs</div>
        </div>
        <div style={{display:'flex', gap:8}}>
          <button className="btn" onClick={()=>ui.showToast('Filtered')}>Filter</button>
          <button className="btn ghost" onClick={()=>ui.showToast('Exported')}>Export</button>
        </div>
      </div>

      <div className="panel" style={{marginBottom:12}}>
        <div className="grid grid-4">
          <div className="field"><label>User</label><input placeholder="name/email" /></div>
          <div className="field"><label>Action</label>
            <select defaultValue="ALL">
              <option value="ALL">All</option><option>CREATE</option><option>UPDATE</option><option>DELETE</option><option>EXPORT</option>
            </select>
          </div>
          <div className="field"><label>Date from</label><input type="date" /></div>
          <div className="field"><label>Date to</label><input type="date" /></div>
        </div>
      </div>

      <div className="panel">
        <table>
          <thead><tr><th>Time</th><th>User</th><th>Action</th><th>Target</th><th>IP</th></tr></thead>
          <tbody>
            <tr><td>2025-11-07 10:21</td><td>admin</td><td>APPROVE</td><td>P-1021</td><td>192.168.0.12</td></tr>
            <tr><td>2025-11-07 09:58</td><td>mary</td><td>UPDATE</td><td>Dict: Countries</td><td>192.168.0.33</td></tr>
            <tr><td>2025-11-07 09:40</td><td>audit</td><td>EXPORT</td><td>Logs</td><td>192.168.0.61</td></tr>
            <tr><td>2025-11-07 09:10</td><td>john</td><td>CREATE</td><td>Announcement</td><td>192.168.0.44</td></tr>
          </tbody>
        </table>

        <div className="pagination">
          <button className="btn">Prev</button>
          <button className="btn primary">1</button>
          <button className="btn">2</button>
          <button className="btn">Next</button>
        </div>
      </div>
    </section>
  )
}
