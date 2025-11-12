export default function Dashboard({ui}){
  return (
    <section id="page-dashboard">
      {/* KPI 区 */}
      <div className="grid grid-4">
        <div className="card kpi">
          <h3>Pending Projects</h3>
          <div className="num">12</div>
          <div className="muted">+3 since last week</div>
        </div>
        <div className="card kpi">
          <h3>New Applications</h3>
          <div className="num">87</div>
          <div className="muted">-12 vs avg</div>
        </div>
        <div className="card kpi">
          <h3>Interveners to Verify</h3>
          <div className="num">5</div>
          <div className="muted">2 urgent</div>
        </div>
        <div className="card kpi">
          <h3>Uptime</h3>
          <div className="num">99.9%</div>
          <div className="muted">past 30 days</div>
        </div>
      </div>

      {/* 快捷操作 */}
      <div className="toolbar" style={{marginTop:16}}>
        <div className="muted">Quick Actions</div>
        <div>
          <a className="btn primary" href="/projects">Review Pending Projects</a>
          <a className="btn ghost" href="/users">Verify Interveners</a>
          <a className="btn ghost" href="/announce">Create Announcement</a>
        </div>
      </div>

      <div className="grid grid-2" style={{marginTop:16}}>
        {/* Recent Activities */}
        <div className="panel">
          <div className="panel-head">
            <div>
              <div className="muted">Activity</div>
              <h3 style={{margin:0}}>Recent Activities</h3>
            </div>
            <div><button className="btn" onClick={()=>ui.showToast('Refreshed')}>Refresh</button></div>
          </div>
          <table>
            <thead>
              <tr><th>Time</th><th>User</th><th>Action</th><th>Target</th></tr>
            </thead>
            <tbody>
              <tr><td>10:21</td><td>admin</td><td>Approved</td><td>P-1021</td></tr>
              <tr><td>09:58</td><td>mary</td><td>Updated</td><td>Dict “Countries”</td></tr>
              <tr><td>09:40</td><td>audit</td><td>Exported</td><td>Logs</td></tr>
              <tr><td>09:10</td><td>john</td><td>Created</td><td>Announcement</td></tr>
            </tbody>
          </table>
        </div>

        {/* System Health */}
        <div className="panel">
          <div className="panel-head">
            <div>
              <div className="muted">System</div>
              <h3 style={{margin:0}}>Health & Status</h3>
            </div>
            <div><button className="btn ghost" onClick={()=>ui.showToast('OK')}>Run check</button></div>
          </div>
          <div className="grid grid-2">
            <div className="card">
              <div className="muted">API Latency</div>
              <div className="num">78 ms</div>
              <div className="muted">avg today</div>
            </div>
            <div className="card">
              <div className="muted">Error Rate</div>
              <div className="num">0.12%</div>
              <div className="muted">past hour</div>
            </div>
          </div>
          <div className="panel" style={{marginTop:12}}>
            <div className="muted">Incidents</div>
            <ul style={{marginTop:8}}>
              <li>No active incidents.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
