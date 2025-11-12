export default function Users({ui}){
  return (
    <section id="page-users">
      <div className="toolbar">
        <div>
          <div className="muted">User Management</div>
          <div style={{fontSize:20, fontWeight:700}}>Users & Roles</div>
        </div>
        <div style={{display:'flex', gap:8}}>
          <button className="btn primary" onClick={()=>ui.openConfirm('Create user?')}>New User</button>
          <button className="btn ghost" onClick={()=>ui.showToast('Exported')}>Export</button>
        </div>
      </div>

      <div className="panel" style={{marginBottom:12}}>
        <div className="grid grid-3">
          <div className="field"><label>Keyword</label><input placeholder="name / email" /></div>
          <div className="field">
            <label>Role</label>
            <select defaultValue="ALL">
              <option value="ALL">All</option>
              <option>Admin</option>
              <option>Auditor</option>
              <option>Intervener</option>
            </select>
          </div>
          <div className="field">
            <label>Status</label>
            <select defaultValue="ALL">
              <option value="ALL">All</option>
              <option>Active</option>
              <option>Suspended</option>
              <option>Invited</option>
            </select>
          </div>
        </div>
      </div>

      <div className="panel">
        <table>
          <thead>
            <tr>
              <th>User</th><th>Email</th><th>Role</th><th>Status</th><th style={{width:220}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {[
              {name:'Admin', email:'admin@example.com', role:'Admin', status:'Active'},
              {name:'Mary', email:'mary@example.com', role:'Intervener', status:'Invited'},
              {name:'Audit Bot', email:'audit@example.com', role:'Auditor', status:'Active'},
              {name:'John', email:'john@example.com', role:'Intervener', status:'Suspended'},
            ].map((u,i)=>(
              <tr key={i}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  <span className={
                    'status ' + (
                      u.status==='Active' ? 'approved' :
                      u.status==='Suspended' ? 'rejected' : 'pending'
                    )
                  }>{u.status}</span>
                </td>
                <td>
                  <div style={{display:'flex', gap:8}}>
                    <button className="btn" onClick={()=>ui.openDrawer(`Edit User · ${u.name}`)}>Edit</button>
                    <button className="btn ghost" onClick={()=>ui.openConfirm(`Reset password for ${u.name}?`)}>Reset PW</button>
                    <button className="btn danger" onClick={()=>ui.openConfirm(`Delete ${u.name}?`)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
