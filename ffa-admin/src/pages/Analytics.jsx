import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts'
import { 
  Activity, Users, Clock, CheckCircle, AlertTriangle, 
  Download, RefreshCw, TrendingUp, BarChart3
} from 'lucide-react'

// --- Theme & Data ---
const THEME = {
  accent: '#3b82f6',
  grid: '#333',
  text: '#888'
}

// Mock Data for Visualization
const DAILY_DATA = Array.from({ length: 7 }, (_, i) => ({
  day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
  projects: Math.floor(Math.random() * 20) + 5,
  reviews: Math.floor(Math.random() * 15) + 3,
}))

const TIME_DIST_DATA = [
  { range: '<1h', count: 12 },
  { range: '1-4h', count: 25 },
  { range: '4-12h', count: 18 },
  { range: '12-24h', count: 8 },
  { range: '>24h', count: 4 },
]

// --- Animation Variants ---
const containerVar = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }
const itemVar = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }

export default function Analytics({ ui }) {
  const [loading, setLoading] = useState(false)

  const handleRefresh = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      ui.showToast('Metrics updated')
    }, 800)
  }

  // Sub-component: KPI Card
  const KpiCard = ({ title, value, sub, icon: Icon, color }) => (
    <motion.div 
      variants={itemVar}
      className="card"
      whileHover={{ y: -4, boxShadow: `0 10px 30px -10px ${color}20` }}
      style={{ borderTop: `3px solid ${color}`, padding: 20 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div>
          <div className="muted" style={{ fontSize: 11, textTransform: 'uppercase', marginBottom: 4 }}>{title}</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>{value}</div>
        </div>
        <div style={{ padding: 8, background: `${color}15`, borderRadius: 8, color: color }}>
          <Icon size={20} />
        </div>
      </div>
      <div className="muted" style={{ fontSize: 12, marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
        {sub}
      </div>
    </motion.div>
  )

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'rgba(20,20,20,0.9)', border: '1px solid #333', padding: '8px 12px', borderRadius: 4, backdropFilter: 'blur(4px)' }}>
          <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>{label}</div>
          <div style={{ color: '#fff', fontWeight: 600 }}>{payload[0].value} units</div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="analytics-page">
      <style>{`
        .analytics-page { padding: 24px; font-family: -apple-system, sans-serif; color: #fff; }
        .grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
        .grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 24px; }
        .card { background: #1e1e1e; border: 1px solid #2a2a2a; border-radius: 12px; }
        .chart-head { padding: 16px 20px; border-bottom: 1px solid #2a2a2a; display: flex; align-items: center; gap: 8px; }
        .chart-body { height: 280px; padding: 20px; }
        .btn { display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; transition: 0.2s; border: 1px solid #333; background: transparent; color: #ccc; }
        .btn:hover { background: rgba(255,255,255,0.05); color: #fff; border-color: #555; }
        .muted { color: #a0a0a0; }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>System Analytics</h1>
          <div className="muted" style={{ marginTop: 4, fontSize: 13 }}>Performance metrics & usage statistics</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn" onClick={handleRefresh}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button className="btn" onClick={() => ui.showToast('Report downloaded')}>
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      <motion.div variants={containerVar} initial="hidden" animate="visible">
        
        {/* KPI Row */}
        <div className="grid-4" style={{ marginBottom: 24 }}>
          <KpiCard title="Active Users" value="1,284" sub={<span style={{color:'#10b981'}}>+4.2% this week</span>} icon={Users} color="#3b82f6" />
          <KpiCard title="Avg Review Time" value="14m" sub={<span style={{color:'#10b981'}}>-2m vs average</span>} icon={Clock} color="#8b5cf6" />
          <KpiCard title="Success Rate" value="98.2%" sub={<span style={{color:'#a0a0a0'}}>Stable performance</span>} icon={CheckCircle} color="#10b981" />
          <KpiCard title="System Errors" value="3" sub={<span style={{color:'#ef4444'}}>+1 in last hour</span>} icon={AlertTriangle} color="#f59e0b" />
        </div>

        {/* Charts Row */}
        <div className="grid-2">
          
          {/* Trend Chart */}
          <motion.div variants={itemVar} className="card">
            <div className="chart-head">
              <TrendingUp size={18} className="muted" />
              <h3 style={{ margin: 0, fontSize: 15 }}>Projects Velocity</h3>
            </div>
            <div className="chart-body">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={DAILY_DATA}>
                  <defs>
                    <linearGradient id="colorProj" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={THEME.accent} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={THEME.accent} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={THEME.grid} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: THEME.text, fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: THEME.text, fontSize: 12}} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="projects" stroke={THEME.accent} fillOpacity={1} fill="url(#colorProj)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Distribution Chart */}
          <motion.div variants={itemVar} className="card">
            <div className="chart-head">
              <BarChart3 size={18} className="muted" />
              <h3 style={{ margin: 0, fontSize: 15 }}>Review Time Distribution</h3>
            </div>
            <div className="chart-body">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={TIME_DIST_DATA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={THEME.grid} />
                  <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{fill: THEME.text, fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: THEME.text, fontSize: 12}} />
                  <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

        </div>
      </motion.div>
    </div>
  )
}
