import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'
import api from '../api/api'

// Chart Colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function Dashboard({ ui }) {
  const navigate = useNavigate()

  // 1. State Management
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
  
  // Chart Data States
  const [trendData, setTrendData] = useState([]) 
  const [statusData, setStatusData] = useState([]) 
  const [budgetData, setBudgetData] = useState([])

  const [loading, setLoading] = useState(true)

  // 2. Data Fetching Strategy
  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const results = await Promise.allSettled([
        api.get('/ffaAPI/admin/projects', { params: { page: 0, size: 50 } }), // Increased size for charts
        api.get('/ffaAPI/admin/persons', { params: { page: 0, size: 5 } }),     
        api.get('/ffaAPI/admin/applications', { params: { page: 0, size: 1 } }),
        api.get('/ffaAPI/admin/cities', { params: { page: 0, size: 1 } }),      
        api.get('/ffaAPI/admin/countries', { params: { page: 0, size: 1 } }),   
        api.get('/ffaAPI/admin/embassies', { params: { page: 0, size: 1 } }),   
        api.get('/ffaAPI/admin/announcements', { params: { page: 0, size: 5 } })
      ])

      const getCount = (index) => {
        if (results[index].status === 'fulfilled') {
          return results[index].value.data?.data?.totalElements || 0
        }
        return '-'
      }

      const getList = (index) => {
        if (results[index].status === 'fulfilled') {
          const data = results[index].value.data?.data
          return data?.content || data?.records || []
        }
        return []
      }

      // Update KPIs
      setStats({
        projects: getCount(0),
        users: getCount(1),
        applications: getCount(2),
        cities: getCount(3),
        countries: getCount(4),
        embassies: getCount(5)
      })

      // Update Announcements (Sorted by ID DESC)
      const rawAnnouncements = getList(6);
      setAnnouncements(rawAnnouncements.sort((a, b) => b.id - a.id));

      // --- Data Processing for Charts ---
      const rawProjects = getList(0);

      // A. Trend Chart (Time)
      const dateMap = {};
      // B. Status & Budget Aggregation
      const statusCountMap = {};
      const statusBudgetMap = {};

      rawProjects.forEach(p => {
        // Date Aggregation
        const dateKey = p.submissionDate ? p.submissionDate.substring(0, 10) : null;
        if (dateKey) dateMap[dateKey] = (dateMap[dateKey] || 0) + 1;

        // Status & Budget Aggregation
        const statusKey = p.status || 'DRAFT';
        const budgetVal = p.totalBudget ? Number(p.totalBudget) : 0;

        statusCountMap[statusKey] = (statusCountMap[statusKey] || 0) + 1;
        statusBudgetMap[statusKey] = (statusBudgetMap[statusKey] || 0) + budgetVal;
      });

      // Transform to Arrays
      setTrendData(Object.keys(dateMap).sort().map(d => ({ date: d, count: dateMap[d] })));
      setStatusData(Object.keys(statusCountMap).map(k => ({ name: k, value: statusCountMap[k] })));
      setBudgetData(Object.keys(statusBudgetMap).map(k => ({ name: k, value: statusBudgetMap[k] })));
      
      // Recent Activity Stream
      const latestProjects = rawProjects.slice(0, 5).map(p => ({
        type: 'PROJECT',
        id: p.id,
        name: p.name || 'Untitled',
        details: `Budget: ${p.totalBudget || 0} EUR`,
        sortId: p.id
      }))

      const latestUsers = getList(1).map(u => ({
        type: 'USER',
        id: u.id,
        name: u.login,
        details: u.email,
        sortId: u.id
      }))

      setRecentActivities([...latestProjects, ...latestUsers].sort((a, b) => b.sortId - a.sortId).slice(0, 7))

    } catch (e) {
      console.error('Dashboard Load Error', e)
      ui.showToast('Partial data load failure')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDashboardData() }, [])
  const navigateTo = (path) => navigate(path)

  // Custom Tooltip for Pie Charts
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: '#fff', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: 0, fontWeight: 600 }}>{payload[0].name}</p>
          <p style={{ margin: 0 }}>Value: {payload[0].value.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <section id="page-dashboard">
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

      {/* === SECTION 1: ALL KPIs === */}
      <div className="grid grid-3" style={{ gap: 16, marginBottom: 16 }}>
        {/* Business KPIs */}
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
        
        {/* Geographic KPIs */}
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

      {/* === SECTION 2: VISUALIZATION (CHARTS) === */}
      
      {/* Trend Chart - Full Width */}
      <div className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-head">
          <h3 style={{ margin: 0 }}>Submission Trend</h3>
          <span className="muted" style={{ fontSize: 12 }}>Daily Submissions (Last 50 Projects)</span>
        </div>
        <div style={{ width: '100%', height: 220, marginTop: 10 }}>
          <ResponsiveContainer>
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tickFormatter={(v) => v.slice(5)} tick={{fontSize: 12}} />
              <YAxis allowDecimals={false} />
              <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
              <Bar dataKey="count" fill="#2196f3" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Charts - 2 Columns */}
      <div className="grid grid-2" style={{ gap: 20, marginBottom: 20 }}>
        <div className="panel">
          <div className="panel-head"><h3 style={{ margin: 0 }}>Status Distribution</h3></div>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} fill="#8884d8" paddingAngle={5} dataKey="value">
                  {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head"><h3 style={{ margin: 0 }}>Budget Allocation</h3></div>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={budgetData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} fill="#82ca9d" paddingAngle={5} dataKey="value">
                  {budgetData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* === SECTION 3: LISTS & ACTIONS (Bottom) === */}
      <div className="grid grid-2" style={{ gap: 20 }}>
        
        {/* Left: Activity Stream */}
        <div className="panel">
          <div className="panel-head" style={{ marginBottom: 12, borderBottom: '1px solid #eee', paddingBottom: 8 }}>
            <h3 style={{ margin: 0 }}>Recent Activity</h3>
          </div>
          <table className="compact">
            <tbody>
              {recentActivities.map((item, idx) => (
                <tr key={`${item.type}-${item.id}-${idx}`}>
                  <td><span className={`tag ${item.type === 'PROJECT' ? 'primary' : ''}`} style={{fontSize: 10}}>{item.type}</span></td>
                  <td><strong>{item.name}</strong></td>
                  <td className="muted" style={{fontSize: 13}}>{item.details}</td>
                </tr>
              ))}
              {recentActivities.length === 0 && !loading && <tr><td colSpan="3" style={{textAlign:'center', padding:20}}>No activity</td></tr>}
            </tbody>
          </table>
        </div>

        {/* Right: Stacked Widgets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Announcements */}
          <div className="panel" style={{ minHeight: 200 }}>
            <div className="panel-head" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ margin: 0 }}>Announcements</h3>
              <button className="btn small primary" onClick={() => navigateTo('/announce')}>Manage</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {announcements.length > 0 ? announcements.map(n => (
                <div key={n.id} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{n.title}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginTop: 4 }}>
                    <span className={n.status === 'PUBLISHED' ? 'text-green' : 'text-orange'}>{n.status}</span>
                  </div>
                </div>
              )) : <div className="muted" style={{textAlign:'center'}}>No active notices</div>}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="panel">
            <h3 style={{ margin: '0 0 12px 0' }}>Quick Actions</h3>
            <div className="grid grid-2" style={{ gap: 10 }}>
              <button className="btn ghost" onClick={() => navigateTo('/users')}>User Manager</button>
              <button className="btn ghost" onClick={() => navigateTo('/projects')}>Project Review</button>
            </div>
          </div>

          {/* Infrastructure */}
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
