import { Link, NavLink, Routes, Route, useLocation } from 'react-router-dom'
import { useState } from 'react'

import Dashboard from './pages/Dashboard.jsx'
import Projects from './pages/Projects.jsx'
import Users from './pages/Users.jsx'
import Dicts from './pages/Dicts.jsx'
import Announce from './pages/Announce.jsx'
import Logs from './pages/Logs.jsx'
import Analytics from './pages/Analytics.jsx'
import Login from './pages/Login.jsx'
import Forgot from './pages/Forgot.jsx'
import Reset from './pages/Reset.jsx'
import Register from './pages/Register.jsx'


import Drawer from './components/Drawer.jsx'
import Modal from './components/Modal.jsx'
import Toast from './components/Toast.jsx'

export default function App(){
  const location = useLocation()


  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerTitle, setDrawerTitle] = useState('Project Review')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalText, setModalText] = useState('Are you sure?')
  const [toast, setToast] = useState(null)

  const ui = {
    openDrawer: (title) => { setDrawerTitle(title || 'Details'); setDrawerOpen(true) },
    closeDrawer: () => setDrawerOpen(false),
    openConfirm: (text) => { setModalText(text || 'Confirm?'); setModalOpen(true) },
    closeConfirm: () => setModalOpen(false),
    showToast: (msg) => { setToast(msg); setTimeout(()=> setToast(null), 1400) },
  }

  const breadcrumb = location.pathname === '/' ? 'Dashboard'
    : location.pathname.slice(1).split('/')[0].replace(/^\w/, c=>c.toUpperCase())

  const authPaths = ['/login', '/forgot', '/reset', '/register']
  const isAuth = authPaths.includes(location.pathname)

  return (
    <div className="app">
      {!isAuth && (
        <aside className="sidebar">
          <div className="brand"><span className="dot"></span> FFA Admin</div>
          <nav className="nav" id="nav">
            <NavLink to="/" end>🏠 Dashboard</NavLink>
            <NavLink to="/projects">📁 Project Approval</NavLink>
            <NavLink to="/users">👥 Users & Roles</NavLink>
            <NavLink to="/dicts">🗂️ Dictionaries</NavLink>
            <NavLink to="/announce">📣 Announcements</NavLink>
            <NavLink to="/logs">🧾 Audit Logs</NavLink>
            <NavLink to="/analytics">📈 Analytics</NavLink>
            <div className="sep"></div>
            <Link to="/login">🚪 Logout</Link>
          </nav>
          <div style={{marginTop:'auto', fontSize:12, color:'#94a3b8'}}>© FFA 2025 · v0.3</div>
        </aside>
      )}

      <main className="main">
        {!isAuth && (
          <div className="topbar">
            <div id="breadcrumb" className="muted">{breadcrumb}</div>
            <div className="actions">
              <button className="btn ghost" onClick={()=>ui.showToast('All changes saved')}>Save</button>
              <div className="avatar" title="Admin"></div>
            </div>
          </div>
        )}

        <div className="content" style={isAuth ? {paddingInline:0, paddingTop:0} : {}}>
          <Routes>
            <Route path="/" element={<Dashboard ui={ui} />} />
            <Route path="/projects" element={<Projects ui={ui} />} />
            <Route path="/users" element={<Users ui={ui} />} />
            <Route path="/dicts" element={<Dicts ui={ui} />} />
            <Route path="/announce" element={<Announce ui={ui} />} />
            <Route path="/logs" element={<Logs ui={ui} />} />
            <Route path="/analytics" element={<Analytics ui={ui} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot" element={<Forgot />} />
            <Route path="/reset" element={<Reset />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </div>
      </main>

      {!isAuth && (
        <>
          <Drawer open={drawerOpen} title={drawerTitle} onClose={ui.closeDrawer} />
          <Modal open={modalOpen} text={modalText} onClose={ui.closeConfirm}
                onConfirm={()=>{ ui.showToast('Action confirmed'); ui.closeConfirm() }} />
          <Toast message={toast} />
        </>
      )}
    </div>
  )
}
