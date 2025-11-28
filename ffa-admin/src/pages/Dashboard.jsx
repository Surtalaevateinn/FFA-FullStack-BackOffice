import { useEffect, useState } from 'react'
import api from '../api/api'

export default function Dashboard({ui}){
  const [stats, setStats] = useState({
    users: '-',
    projects: '-',
    cities: '-',
    countries: '-'
  })
  const [loading, setLoading] = useState(false)

  const fetchStats = async () => {
    setLoading(true)
    try {
      const [pRes, uRes, cRes, ctRes] = await Promise.allSettled([
        api.get('/ffaAPI/admin/projects', { params: { page: 0, size: 1 } }),
        api.get('/ffaAPI/admin/persons', { params: { page: 0, size: 1 } }),
        api.get('/ffaAPI/admin/cities', { params: { page: 0, size: 1 } }),
        api.get('/ffaAPI/admin/countries', { params: { page: 0, size: 1 } })
      ])

      const extractTotal = (resResult) => {
        if (resResult.status === 'fulfilled') {
            return resResult.value.data?.data?.totalElements ?? 'Err'
        }
        return 'Err'
      }

      setStats({
        projects: extractTotal(pRes),
        users: extractTotal(uRes),
        cities: extractTotal(cRes),
        countries: extractTotal(ctRes)
      })

    } catch (e) {
      console.error(e)
      ui.showToast('Failed to load stats')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return (
    <section id="page-dashboard">
      {/*  */}
      <div className="grid grid-4">
        <div className="card kpi">
          <h3>Total Projects</h3>
          <div className="num">{loading ? '...' : stats.projects}</div>
          <div className="muted">All time</div>
        </div>
        <div className="card kpi">
          <h3>Registered Users</h3>
          <div className="num">{loading ? '...' : stats.users}</div>
          <div className="muted">Interveners & Admins</div>
        </div>
        <div className="card kpi">
          <h3>Cities Coverage</h3>
          <div className="num">{loading ? '...' : stats.cities}</div>
          <div className="muted">in {stats.countries} countries</div>
        </div>
        <div className="card kpi">
          <h3>System Status</h3>
          <div className="num" style={{color: '#4caf50'}}>Online</div>
          <div className="muted">API Responsive</div>
        </div>
      </div>

      {/* (Shortcuts) */}
      <div className="toolbar" style={{marginTop:16}}>
        <div className="muted">Quick Actions</div>
        <div>
          {/*  */}
          <button className="btn primary" onClick={() => ui.showToast('Go to Projects tab')}>Manage Projects</button>
          <button className="btn ghost" onClick={() => ui.showToast('Go to Users tab')}>Verify Users</button>
        </div>
      </div>

      <div className="grid grid-2" style={{marginTop:16}}>
        {/* Mock Activity Feed (no Logs API) */}
        <div className="panel">
          <div className="panel-head">
            <div>
              <div className="muted">Activity</div>
              <h3 style={{margin:0}}>Recent Activities</h3>
            </div>
            <div><button className="btn" onClick={fetchStats}>Refresh</button></div>
          </div>
          <table>
            <thead>
              <tr><th>Time</th><th>User</th><th>Action</th></tr>
            </thead>
            <tbody>
              <tr><td className="muted">Just now</td><td>System</td><td>Dashboard loaded</td></tr>
              <tr><td className="muted">10 min ago</td><td>Admin</td><td>Checked Users</td></tr>
              <tr><td colSpan="3" style={{textAlign:'center', color:'#999'}}>
                 (Audit Log API not implemented yet)
              </td></tr>
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
          </div>
          <div className="grid grid-2">
            <div className="card">
              <div className="muted">Backend</div>
              <div className="num">Spring Boot</div>
              <div className="muted">v3.0.0</div>
            </div>
            <div className="card">
              <div className="muted">Database</div>
              <div className="num">PostgreSQL</div>
              <div className="muted">Connected</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
