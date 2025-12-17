import { Link, NavLink, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { useState } from 'react'
import { 
  LayoutDashboard, 
  FolderKanban, 
  Users, 
  BookOpen, 
  Megaphone, 
  ScrollText, 
  BarChart3, 
  LogOut, 
  ChevronRight,
  Command,
  Settings
} from 'lucide-react'

// Page Imports
import Dashboard from './pages/Dashboard.jsx'
import Projects from './pages/Projects.jsx'
import UsersPage from './pages/Users.jsx'
import Dicts from './pages/Dicts.jsx'
import Announce from './pages/Announce.jsx'
import Logs from './pages/Logs.jsx'
import Analytics from './pages/Analytics.jsx'
import Login from './pages/Login.jsx'
import Forgot from './pages/Forgot.jsx'
import Reset from './pages/Reset.jsx'
import Register from './pages/Register.jsx'

// Component Imports
import Drawer from './components/Drawer.jsx'
import Modal from './components/Modal.jsx'
import Toast from './components/Toast.jsx'

// Assets Import
import adminAvatar from './avatar.png' 

export default function App() {
  const location = useLocation()

  // Determine if the current page is an authentication page
  // We treat the root path '/' as an auth path to ensure immediate redirection to login
  const authPaths = ['/login', '/forgot', '/reset', '/register']
  const isAuthPage = authPaths.some(path => location.pathname.startsWith(path)) || location.pathname === '/'

  const currentPath = location.pathname.slice(1).split('/')[0]
  const pageTitle = currentPath ? currentPath.charAt(0).toUpperCase() + currentPath.slice(1) : 'Dashboard'

  // Global UI State
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerTitle, setDrawerTitle] = useState('Details')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalText, setModalText] = useState('Confirm action?')
  const [toast, setToast] = useState(null)

  // UI Helper
  const ui = {
    openDrawer: (title) => { setDrawerTitle(title || 'Details'); setDrawerOpen(true) },
    closeDrawer: () => setDrawerOpen(false),
    openConfirm: (text) => { setModalText(text || 'Confirm?'); setModalOpen(true) },
    closeConfirm: () => setModalOpen(false),
    showToast: (msg) => { setToast(msg); setTimeout(() => setToast(null), 2000) },
  }

  // Navigation Config
  const NAV_ITEMS = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/projects', icon: FolderKanban, label: 'Projects' },
    { to: '/users', icon: Users, label: 'Users & Roles' },
    { to: '/dicts', icon: BookOpen, label: 'Dictionaries' },
    { to: '/announce', icon: Megaphone, label: 'Announcements' },
    { to: '/logs', icon: ScrollText, label: 'Audit Logs' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  ]

  // --- RENDER LOGIC ---

  // Scenario A: Authentication Pages (Full Screen, No Sidebar)
  // This cleanly separates the layout to avoid CSS grid issues.
  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot" element={<Forgot />} />
        <Route path="/reset" element={<Reset />} />
        <Route path="/register" element={<Register />} />
        
        {/* Default redirect to Login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  // Scenario B: Admin Dashboard (Sidebar + Main Content Grid)
  return (
    <div className="app"> 
      
      {/* 1. SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">
            <Command size={16} />
          </div>
          FFA Admin
        </div>

        <nav className="nav">
          {NAV_ITEMS.map((item) => (
            <NavLink 
              key={item.to} 
              to={item.to} 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}

          <div className="nav-sep"></div>

          <Link to="/login" className="nav-item">
            <LogOut size={18} />
            Sign Out
          </Link>
        </nav>

        <div className="sidebar-footer">
          <div className="user-mini">
            <img 
              src={adminAvatar} 
              alt="Admin" 
              className="avatar" 
              style={{ objectFit: 'cover', background: 'transparent' }} 
            />
            <div style={{flex: 1}}>
              <div style={{fontSize: 13, fontWeight: 600}}>Admin User</div>
              <div style={{fontSize: 11, color: '#666'}}>admin@ffa.com</div>
            </div>
            <Settings size={14} className="muted" />
          </div>
          <div style={{fontSize: 10, color: '#444', marginTop: 15, paddingLeft: 8}}>
            v2.4.0 · System Stable
          </div>
        </div>
      </aside>

      {/* 2. MAIN AREA */}
      <main className="main">
        <header className="topbar">
          <div className="breadcrumbs">
            <span className="muted">System</span>
            <ChevronRight size={14} className="muted" />
            <span className="breadcrumb-active">{pageTitle}</span>
          </div>
          
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn ghost" onClick={() => ui.showToast('System Cache Cleared')}>
              Clear Cache
            </button>
          </div>
        </header>

        <div className="content">
          <Routes>
            <Route path="/dashboard" element={<Dashboard ui={ui} />} />
            <Route path="/projects" element={<Projects ui={ui} />} />
            <Route path="/users" element={<UsersPage ui={ui} />} />
            <Route path="/dicts" element={<Dicts ui={ui} />} />
            <Route path="/announce" element={<Announce ui={ui} />} />
            <Route path="/logs" element={<Logs ui={ui} />} />
            <Route path="/analytics" element={<Analytics ui={ui} />} />
            
            {/* Fallback for logged-in users trying to access unknown routes */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </main>

      {/* 3. OVERLAYS */}
      <Drawer open={drawerOpen} title={drawerTitle} onClose={ui.closeDrawer} />
      <Modal 
        open={modalOpen} 
        text={modalText} 
        onClose={ui.closeConfirm}
        onConfirm={() => { ui.showToast('Confirmed'); ui.closeConfirm() }} 
      />
      <Toast message={toast} />
    </div>
  )
}
