import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, Users, FolderKanban, FileText, Globe, 
  MapPin, Building2, Bell, RefreshCw, Activity,
  TrendingUp, PieChart as PieIcon, Wallet, Megaphone,
  ArrowUpRight
} from 'lucide-react'
import api from '../api/api'

// --- Cold & Corporate Theme Palette ---
const THEME = {
  bg: '#121212',
  card: '#1e1e1e',
  border: '#2a2a2a',
  textPrimary: '#ffffff',
  textSecondary: '#a0a0a0',
  accent: '#3b82f6', 
  charts: [
    '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', 
    '#ec4899', '#06b6d4', '#6366f1', '#f43f5e', 
    '#84cc16', '#a855f7', '#14b8a6', '#f97316'
  ]
};

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 50, damping: 20 }
  }
}

export default function Dashboard({ ui }) {
  const navigate = useNavigate()

  // --- State ---
  const [stats, setStats] = useState({
    users: 0, projects: 0, applications: 0,
    embassies: 0, cities: 0, countries: 0
  })
  
  const [recentActivities, setRecentActivities] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [chartData, setChartData] = useState({
    trend: [], status: [], budget: [], roles: [], announceCats: []
  })
  
  const [loading, setLoading] = useState(true)

  // --- Data Fetching ---
  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const results = await Promise.allSettled([
        api.get('/ffaAPI/admin/projects', { params: { page: 0, size: 50 } }), 
        api.get('/ffaAPI/admin/persons', { params: { page: 0, size: 100 } }),    
        api.get('/ffaAPI/admin/applications', { params: { page: 0, size: 10 } }),
        api.get('/ffaAPI/admin/cities', { params: { page: 0, size: 10 } }),      
        api.get('/ffaAPI/admin/countries', { params: { page: 0, size: 10 } }),   
        api.get('/ffaAPI/admin/embassies', { params: { page: 0, size: 10 } }),   
        api.get('/ffaAPI/admin/announcements', { params: { page: 0, size: 50 } })
      ])

      const getData = (idx) => results[idx].status === 'fulfilled' ? results[idx].value.data?.data : null;
      const getCount = (idx) => getData(idx)?.totalElements || 0;
      const getList = (idx) => getData(idx)?.content || getData(idx)?.records || [];

      setStats({
        projects: getCount(0), users: getCount(1), applications: getCount(2),
        cities: getCount(3), countries: getCount(4), embassies: getCount(5)
      })

      const rawProjects = getList(0);
      const rawPersons = getList(1);
      const rawAnnouncements = getList(6);
      setAnnouncements([...rawAnnouncements].sort((a, b) => b.id - a.id).slice(0, 5));

      const dateMap = {}, statusMap = {}, budgetMap = {}, roleMap = {}, announceCatMap = {};
      
      rawProjects.forEach(p => {
        const d = p.submissionDate ? p.submissionDate.substring(0, 10) : null;
        if (d) dateMap[d] = (dateMap[d] || 0) + 1;
        const s = p.status || 'DRAFT';
        statusMap[s] = (statusMap[s] || 0) + 1;
        budgetMap[s] = (budgetMap[s] || 0) + (p.totalBudget ? Number(p.totalBudget) : 0);
      });

      rawPersons.forEach(u => {
        const r = u.role ? u.role.name : (u.roleId ? `Role ${u.roleId}` : 'Unknown');
        roleMap[r] = (roleMap[r] || 0) + 1;
      });

      rawAnnouncements.forEach(a => {
        const c = a.category || 'GENERAL';
        announceCatMap[c] = (announceCatMap[c] || 0) + 1;
      });

      setChartData({
        trend: Object.keys(dateMap).sort().map(d => ({ date: d, count: dateMap[d] })),
        status: Object.keys(statusMap).map(k => ({ name: k, value: statusMap[k] })),
        budget: Object.keys(budgetMap).map(k => ({ name: k, value: budgetMap[k] })), 
        roles: Object.keys(roleMap).map(k => ({ name: k, value: roleMap[k] })),
        announceCats: Object.keys(announceCatMap).map(k => ({ name: k, value: announceCatMap[k] })) 
      });

      const formatActivity = (list, type, nameKey, detailsStr) => 
        list.map(i => ({ type, id: i.id, name: i[nameKey] || `Item #${i.id}`, details: detailsStr, sortId: i.id }));

      const combined = [
        ...formatActivity(rawProjects.slice(0,5), 'PROJECT', 'name', 'Project Created'),
        ...formatActivity(rawPersons.slice(0,5), 'USER', 'login', 'User Joined'),
        ...formatActivity(rawAnnouncements.slice(0,5), 'ANNOUNCE', 'title', 'New Notice')
      ].sort((a, b) => b.sortId - a.sortId).slice(0, 8);
      
      setRecentActivities(combined);

    } catch (e) { console.error(e); ui?.showToast?.('Dashboard sync error'); } 
    finally { setLoading(false); }
  }

  useEffect(() => { fetchDashboardData() }, [])

  // --- Sub-Components ---
  
  const StatCard = ({ title, value, sub, icon: Icon, color }) => (
    <motion.div 
      variants={itemVariants}
      whileHover={{ y: -5, boxShadow: `0 10px 30px -10px ${color}40` }}
      className="card stat-card"
      style={{ borderBottom: `2px solid ${color}` }} // Changed to bottom border for gravity feel
    >
      <div className="stat-icon-wrapper" style={{ borderColor: `${color}40` }}>
        <div className="stat-icon" style={{ backgroundColor: `${color}15`, color: color }}>
          <Icon size={22} />
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <div className="muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</div>
        <div className="stat-value">{loading ? '-' : value}</div>
        <div className="stat-sub">
          {sub} <ArrowUpRight size={10} style={{ marginLeft: 2, opacity: 0.7 }} />
        </div>
      </div>
    </motion.div>
  )

  const SectionHeader = ({ icon: Icon, title, action, live }) => (
    <div className="panel-head">
      <div className="flex-center">
        {Icon && <Icon size={18} className="text-accent" style={{ marginRight: 8 }} />}
        <h3>{title}</h3>
        {live && (
          <span className="live-dot-container">
            <span className="live-dot-ping"></span>
            <span className="live-dot"></span>
          </span>
        )}
      </div>
      {action}
    </div>
  )

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const isBudget = payload[0].name === 'Budget' || payload[0].payload.name === 'Budget';
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label || payload[0].name}</p>
          <p className="tooltip-value">
            {payload[0].value.toLocaleString()} 
            {(payload[0].value > 1000 || payload[0].payload.name === 'PUBLISHED') && isBudget ? ' €' : ''}
          </p>
        </div>
      );
    }
    return null;
  };

  const PieWidget = ({ title, icon, data, colorOffset = 0 }) => (
    <motion.div variants={itemVariants} className="card" style={{ minHeight: 300, display: 'flex', flexDirection: 'column' }}>
      <SectionHeader icon={icon} title={title} />
      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie 
              data={data} cx="50%" cy="50%" 
              innerRadius={55} outerRadius={75} paddingAngle={5} 
              dataKey="value" stroke="none"
              cornerRadius={4}
            >
              {data.map((e, i) => {
                const colorIndex = (i + colorOffset) % THEME.charts.length;
                return <Cell key={`cell-${i}`} fill={THEME.charts[colorIndex]} />
              })}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" wrapperStyle={{fontSize: '11px', opacity: 0.6, paddingTop: '10px'}} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )

  return (
    <div className="dashboard-container">
      <style>{`
        :root { --bg: ${THEME.bg}; --card: ${THEME.card}; --border: ${THEME.border}; --text: ${THEME.textPrimary}; --muted: ${THEME.textSecondary}; --accent: ${THEME.accent}; }
        .dashboard-container { padding: 32px; min-height: 100vh; background-color: var(--bg); color: var(--text); font-family: -apple-system, sans-serif; }
        
        /* Layout Structure */
        .grid-main { display: grid; grid-template-columns: 2.2fr 1fr; gap: 24px; margin-bottom: 24px; }
        .grid-charts { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; margin-top: 24px; }
        .grid-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
        
        @media (max-width: 1300px) { .grid-main { grid-template-columns: 1fr; } }

        /* Card Styles */
        .card { 
          background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 24px; 
          box-shadow: 0 4px 20px rgba(0,0,0,0.1); 
          position: relative; overflow: hidden;
        }
        
        /* Typography */
        h3 { margin: 0; font-size: 15px; font-weight: 600; letter-spacing: 0.2px; }
        .muted { color: var(--muted); font-size: 13px; }
        .flex-center { display: flex; align-items: center; }
        .text-accent { color: var(--accent); }

        /* Buttons */
        .btn { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 500; cursor: pointer; transition: 0.2s; border: 1px solid var(--border); background: rgba(255,255,255,0.03); color: var(--text); }
        .btn:hover { background: rgba(255,255,255,0.08); border-color: #555; }
        
        /* Stat Card Specifics */
        .stat-card { display: flex; align-items: center; gap: 16px; transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .stat-icon-wrapper { padding: 3px; border: 1px dashed; border-radius: 12px; }
        .stat-icon { width: 48px; height: 48px; border-radius: 9px; display: flex; align-items: center; justify-content: center; }
        .stat-value { font-size: 26px; font-weight: 700; letter-spacing: -1px; margin: 4px 0 2px; line-height: 1; }
        .stat-sub { font-size: 11px; opacity: 0.5; display: flex; align-items: center; }
        
        /* Panel Header */
        .panel-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
        
        /* Activity List */
        .activity-item { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid #2a2a2a; transition: background 0.2s; }
        .activity-item:hover { background: rgba(255,255,255,0.02); padding-left: 8px; padding-right: 8px; border-radius: 6px; border-bottom-color: transparent; }
        .tag-dot { width: 8px; height: 8px; border-radius: 50%; box-shadow: 0 0 8px rgba(0,0,0,0.5); }
        
        /* Live Dot Animation */
        .live-dot-container { position: relative; width: 8px; height: 8px; margin-left: 8px; display: flex; align-items: center; justify-content: center; }
        .live-dot { width: 6px; height: 6px; background-color: #ef4444; border-radius: 50%; z-index: 2; }
        .live-dot-ping { position: absolute; width: 100%; height: 100%; border-radius: 50%; background-color: #ef4444; opacity: 0.75; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; }
        @keyframes ping { 75%, 100% { transform: scale(2.5); opacity: 0; } }

        /* Custom Tooltip */
        .custom-tooltip { background: rgba(20, 20, 20, 0.9); backdrop-filter: blur(8px); border: 1px solid #444; padding: 10px 14px; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.6); }
        .tooltip-label { margin: 0 0 4px 0; font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
        .tooltip-value { margin: 0; font-size: 16px; font-weight: 700; color: #fff; }
      `}</style>

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="flex-center" style={{ justifyContent: 'space-between', marginBottom: 32 }}
      >
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: '-0.5px', background: 'linear-gradient(to right, #fff, #888)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Mission Control
          </h1>
          <div className="muted" style={{ marginTop: 4 }}>System Overview & Real-time Analytics</div>
        </div>
        <button className="btn" onClick={fetchDashboardData} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> {loading ? 'Syncing...' : 'Refresh Data'}
        </button>
      </motion.div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        
        {/* TOP SECTION: VISUALS (Charts + Lists) */}
        <div className="grid-main">
          {/* LEFT: Main Charts */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            
            {/* Trend Chart (Hero Visual) */}
            <motion.div variants={itemVariants} className="card" style={{ height: 360, marginBottom: 24 }}>
              <SectionHeader icon={TrendingUp} title="Submission Velocity" />
              <div style={{ height: 'calc(100% - 40px)' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData.trend}>
                    <defs>
                      <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={THEME.accent} stopOpacity={0.4}/>
                        <stop offset="95%" stopColor={THEME.accent} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                    <XAxis dataKey="date" tickFormatter={d => d.slice(5)} tick={{fill:'#666', fontSize:11}} axisLine={false} tickLine={false} dy={10} />
                    <YAxis tick={{fill:'#666', fontSize:11}} axisLine={false} tickLine={false} dx={-10} />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#444', strokeDasharray: '4 4' }} />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      stroke={THEME.accent} 
                      strokeWidth={3}
                      fill="url(#grad)" 
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Bento Grid: 4 Pie Charts */}
            <div className="grid-charts">
              <PieWidget title="Status Distribution" icon={PieIcon} data={chartData.status} colorOffset={0} />
              <PieWidget title="User Composition" icon={Users} data={chartData.roles} colorOffset={6} />
              <PieWidget title="Financial Gravity" icon={Wallet} data={chartData.budget} colorOffset={3} />
              <PieWidget title="Signal Entropy" icon={Megaphone} data={chartData.announceCats} colorOffset={9} />
            </div>
          </div>

          {/* RIGHT: Feeds & Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            {/* Live Feed */}
            <motion.div variants={itemVariants} className="card" style={{ flex: 1, minHeight: 400 }}>
              <SectionHeader icon={Activity} title="Live Signals" live={true} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {recentActivities.map((item, idx) => (
                  <div key={`${item.type}-${item.id}-${idx}`} className="activity-item">
                    <div className="tag-dot" style={{ backgroundColor: item.type === 'PROJECT' ? '#3b82f6' : item.type === 'USER' ? '#10b981' : '#f59e0b' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, truncate: true }}>{item.name}</div>
                      <div className="muted" style={{ fontSize: 11 }}>{item.details}</div>
                    </div>
                    <div style={{ fontSize: 9, opacity: 0.5, border: '1px solid #444', padding: '1px 4px', borderRadius: 3 }}>
                      {item.type.substr(0,3)}
                    </div>
                  </div>
                ))}
                {recentActivities.length === 0 && !loading && <div className="muted" style={{textAlign:'center', padding:20}}>Scanning...</div>}
              </div>
            </motion.div>

            {/* Quick Notices */}
            <motion.div variants={itemVariants} className="card">
              <SectionHeader icon={Bell} title="System Notices" action={<button className="btn" onClick={() => navigate('/announce')}>All</button>} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {announcements.map(n => (
                  <div key={n.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ marginTop: 6, width: 4, height: 4, borderRadius: '50%', background: n.status === 'PUBLISHED' ? '#10b981' : '#f59e0b', boxShadow: `0 0 5px ${n.status === 'PUBLISHED' ? '#10b981' : '#f59e0b'}` }} />
                    <div>
                      <div style={{ fontSize: 13, lineHeight: 1.4, fontWeight: 500 }}>{n.title}</div>
                      <div className="muted" style={{ fontSize: 10, marginTop: 2 }}>{n.category}</div>
                    </div>
                  </div>
                ))}
                {announcements.length === 0 && <div className="muted" style={{textAlign:'center', padding:10}}>No active notices</div>}
              </div>
            </motion.div>

            {/* Shortcuts */}
            <motion.div variants={itemVariants} className="card" style={{background: 'linear-gradient(145deg, #1e1e1e, #252525)'}}>
               <SectionHeader icon={LayoutDashboard} title="Quick Access" />
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <button className="btn" style={{justifyContent:'center', padding: 12, background: 'rgba(59, 130, 246, 0.1)', borderColor: '#3b82f6'}} onClick={() => navigate('/projects')}>
                    Manage Projects
                  </button>
                  <button className="btn" style={{justifyContent:'center', padding: 12}} onClick={() => navigate('/users')}>
                    User Directory
                  </button>
               </div>
            </motion.div>
          </div>
        </div>

        {/* BOTTOM SECTION: KPI STATS (The Foundation) */}
        <div className="grid-stats">
          <StatCard title="Initiatives" value={stats.projects} sub="Active Projects" icon={FolderKanban} color="#3b82f6" />
          <StatCard title="Applications" value={stats.applications} sub="Candidates" icon={FileText} color="#10b981" />
          <StatCard title="Network" value={stats.users} sub="Total Users" icon={Users} color="#f59e0b" />
          <StatCard title="Global" value={stats.countries} sub="Countries" icon={Globe} color="#8b5cf6" />
          <StatCard title="Reach" value={stats.cities} sub="Cities" icon={MapPin} color="#ec4899" />
        </div>

      </motion.div>
    </div>
  )
}
