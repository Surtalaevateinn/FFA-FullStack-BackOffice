import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/api'

export default function Dashboard({ ui }) {
  const navigate = useNavigate()

  // 1. State Management: KPIs, Activity Stream, and System Status
  const [stats, setStats] = useState({
    users: 0,
    projects: 0,
    applications: 0,
    embassies: 0,
    cities: 0,
    countries: 0
  })
  
  const [recentActivities, setRecentActivities] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)

  // 2. Data Fetching Strategy: Aggregated Parallel Requests
  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Execute all requests in parallel. 
      // Using allSettled ensures that one failed endpoint doesn't crash the whole dashboard.
      const results = await Promise.allSettled([
        api.get('/ffaAPI/admin/projects', { params: { page: 0, size: 5 } }),    // [0] Projects
        api.get('/ffaAPI/admin/persons', { params: { page: 0, size: 5 } }),     // [1] Users
        api.get('/ffaAPI/admin/applications', { params: { page: 0, size: 1 } }),// [2] Applications
        api.get('/ffaAPI/admin/cities', { params: { page: 0, size: 1 } }),      // [3] Cities
        api.get('/ffaAPI/admin/countries', { params: { page: 0, size: 1 } }),   // [4] Countries
        api.get('/ffaAPI/admin/embassies', { params: { page: 0, size: 1 } }),   // [5] Embassies
        api.get('/ffaAPI/admin/announcements', { params: { page: 0, size: 5 } })// [6] Announcements
      ])

      // Helper: Safely extract totalElements from pagination response
      const getCount = (index) => {
        if (results[index].status === 'fulfilled') {
          return results[index].value.data?.data?.totalElements || 0
        }
        return '-'
      }

      // Helper: Safely extract content list
      const getList = (index) => {
        if (results[index].status === 'fulfilled') {
          const data = results[index].value.data?.data
          return data?.content || data?.records || []
        }
        return []
      }

      // Update KPI Statistics
      setStats({
        projects: getCount(0),
        users: getCount(1),
        applications: getCount(2),
        cities: getCount(3),
        countries: getCount(4),
        embassies: getCount(5)
      })

      // Update Announcements
      setAnnouncements(getList(6))

      // Generate "Recent Activity" stream by merging latest Projects and Users
      // In a real audit system, this would come from a dedicated /logs endpoint.
      const latestProjects = getList(0).map(p => ({
        type: 'PROJECT',
        id: p.id,
        name: p.name || p.description?.substring(0, 20) || 'Untitled',
        date: p.dateCreation || new Date().toISOString(), 
        details: `Budget: ${p.budget} EUR`,
        sortId: p.id
      }))

      const latestUsers = getList(1).map(u => ({
        type: 'USER',
        id: u.id,
        name: u.login,
        date: new Date().toISOString(),
        details: u.email,
        sortId: u.id
      }))

      // Merge, sort by ID (descending), and take top 7
      const combined = [...latestProjects, ...latestUsers]
        .sort((a, b) => b.sortId - a.sortId)
        .slice(0, 7)
      
      setRecentActivities(combined)

    } catch (e) {
      console.error('Dashboard Load Error', e)
      ui.showToast('Partial data load failure')
    } finally {
      setLoading(false)
    }
  }

  // Initial Load
  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Navigation Helper using React Router
  const navigateTo = (path) => {
    navigate(path)
  }

  return (
    <section id="page-dashboard">
      {/* Header Toolbar */}
      <div className="toolbar">
        <div>
          <div className="muted">Overview</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>System Dashboard</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={fetchDashboardData} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      {/* Row 1: Business KPIs */}
      <div className="grid grid-3" style={{ gap: 16, marginBottom: 20 }}>
        <div className="card kpi">
          <div className="muted">Total Projects</div>
          <div className="num">{stats.projects}</div>
          <div className="muted">Active Initiatives</div>
        </div>
        <div className="card kpi">
          <div className="muted">Total Applications</div>
          <div className="num">{stats.applications}</div>
          <div className="muted">Candidate Submissions</div>
        </div>
        <div className="card kpi">
          <div className="muted">Registered Users</div>
          <div className="num">{stats.users}</div>
          <div className="muted">Admins & Interveners</div>
        </div>
      </div>

      {/* Row 2: Geographic Reach KPIs */}
      <div className="grid grid-3" style={{ gap: 16, marginBottom: 20 }}>
         <div className="card kpi" style={{ borderLeft: '4px solid #2196f3' }}>
          <div className="muted">Global Coverage</div>
          <div style={{ fontSize: 24, fontWeight: 'bold', marginTop: 8 }}>
            {stats.countries} <span style={{fontSize:14, fontWeight:'normal', color:'#666'}}>Countries</span>
          </div>
        </div>
        <div className="card kpi" style={{ borderLeft: '4px solid #9c27b0' }}>
          <div className="muted">Network</div>
          <div style={{ fontSize: 24, fontWeight: 'bold', marginTop: 8 }}>
            {stats.embassies} <span style={{fontSize:14, fontWeight:'normal', color:'#666'}}>Embassies</span>
          </div>
        </div>
        <div className="card kpi" style={{ borderLeft: '4px solid #ff9800' }}>
          <div className="muted">Local Reach</div>
          <div style={{ fontSize: 24, fontWeight: 'bold', marginTop: 8 }}>
            {stats.cities} <span style={{fontSize:14, fontWeight:'normal', color:'#666'}}>Cities</span>
          </div>
        </div>
      </div>

      <div className="grid grid-2" style={{ gap: 20 }}>
        
        {/* Left Column: Activity Stream */}
        <div className="panel">
          <div className="panel-head" style={{ marginBottom: 12, borderBottom: '1px solid #eee', paddingBottom: 8 }}>
            <div>
              <h3 style={{ margin: 0 }}>Recent Activity</h3>
              <span className="muted" style={{ fontSize: 12 }}>New Users & Projects</span>
            </div>
          </div>
          
          <table className="compact">
            <thead>
              <tr>
                <th>Type</th>
                <th>Name/Login</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {recentActivities.map((item, idx) => (
                <tr key={`${item.type}-${item.id}-${idx}`}>
                  <td>
                    <span className={`tag ${item.type === 'PROJECT' ? 'primary' : ''}`} style={{fontSize: 10}}>
                      {item.type}
                    </span>
                  </td>
                  <td><strong>{item.name}</strong></td>
                  <td className="muted" style={{fontSize: 13}}>{item.details}</td>
                </tr>
              ))}
              {recentActivities.length === 0 && !loading && (
                <tr><td colSpan="3" style={{textAlign: 'center', padding: 20, color: '#999'}}>No recent activity found</td></tr>
              )}
              {loading && (
                <tr><td colSpan="3" style={{textAlign: 'center', padding: 20}}>Loading stream...</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Right Column: Announcements & Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Announcements Panel */}
          <div className="panel" style={{ minHeight: 200 }}>
            <div className="panel-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0 }}>Announcements</h3>
              <button className="btn small primary" onClick={() => navigateTo('/announce')}>
                Manage
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {announcements.length > 0 ? (
                announcements.map(notice => (
                  <div key={notice.id} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{notice.title || 'Untitled Notice'}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginTop: 4 }}>
                      <span className={notice.status === 'PUBLISHED' ? 'text-green' : 'text-orange'}>
                        {notice.status}
                      </span>
                      <span className="muted">
                        {notice.date ? new Date(notice.date).toLocaleDateString() : 'No Date'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="muted" style={{ fontStyle: 'italic', textAlign: 'center', padding: 20 }}>
                  No active announcements.
                </div>
              )}
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="panel">
            <h3 style={{ margin: '0 0 12px 0' }}>Quick Actions</h3>
            <div className="grid grid-2" style={{ gap: 10 }}>
              <button className="btn ghost" onClick={() => navigateTo('/users')}>
                 User Manager
              </button>
              <button className="btn ghost" onClick={() => navigateTo('/projects')}>
                 Project Review
              </button>
            </div>
          </div>

          {/* System Health Status */}
          <div className="panel">
            <h3 style={{ margin: '0 0 12px 0' }}>Infrastructure</h3>
            <div className="grid grid-2">
              <div className="card" style={{ padding: 10, textAlign:'center' }}>
                <div className="muted" style={{fontSize:11}}>Backend API</div>
                <div style={{ color: '#4caf50', fontWeight: 700, fontSize: 13 }}>● Online</div>
              </div>
              <div className="card" style={{ padding: 10, textAlign:'center' }}>
                <div className="muted" style={{fontSize:11}}>Database</div>
                <div style={{ color: '#4caf50', fontWeight: 700, fontSize: 13 }}>● Connected</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
