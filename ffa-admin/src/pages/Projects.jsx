export default function Projects({ui}){
  return (
    <section id="page-projects">
      {/* 顶部工具栏 */}
      <div className="toolbar">
        <div>
          <div className="muted">Project Approval</div>
          <div style={{fontSize:20, fontWeight:700}}>Pending List</div>
        </div>
        <div style={{display:'flex', gap:8}}>
          <button className="btn" onClick={()=>ui.openConfirm('Approve / Reject selected in bulk?')}>Bulk actions</button>
          <button className="btn ghost" onClick={()=>ui.showToast('Exported')}>Export</button>
        </div>
      </div>

      {/* 过滤条 */}
      <div className="panel" style={{marginBottom:12}}>
        <div className="grid grid-4">
          <div className="field">
            <label>Keyword</label>
            <input type="text" placeholder="ID / Title / Intervener..." />
          </div>
          <div className="field">
            <label>Status</label>
            <select defaultValue="ALL">
              <option value="ALL">All</option>
              <option value="PENDING">Pending</option>
              <option value="REVIEW">In Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          <div className="field">
            <label>Country(in)</label>
            <select defaultValue="ALL">
              <option value="ALL">All</option>
              <option value="FR">FR</option>
              <option value="ES">ES</option>
              <option value="DE">DE</option>
              <option value="IT">IT</option>
            </select>
          </div>
          <div className="field">
            <label>Deadline</label>
            <input type="date" />
          </div>
        </div>
        <div style={{display:'flex', justifyContent:'flex-end', gap:8, marginTop:8}}>
          <button className="btn ghost" onClick={()=>ui.showToast('Filters cleared')}>Reset</button>
          <button className="btn primary" onClick={()=>ui.showToast('Applied')}>Apply</button>
        </div>
      </div>

      {/* 列表 */}
      <div className="panel">
        <table>
          <thead>
            <tr>
              <th><input type="checkbox" /></th>
              <th>ID</th>
              <th>Title</th>
              <th>Intervener</th>
              <th>Country(in)</th>
              <th>Deadline</th>
              <th>Status</th>
              <th style={{width:140}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {[
              {id:'P-1022', title:'Language Exchange', user:'M. Smith', country:'FR', deadline:'2025-11-30', status:'Pending'},
              {id:'P-1018', title:'Afterschool Program', user:'J. Lee', country:'ES', deadline:'2025-12-05', status:'In Review'},
              {id:'P-1004', title:'Cultural Night', user:'A. Rossi', country:'IT', deadline:'2025-12-10', status:'Approved'},
              {id:'P-0998', title:'Tech Mentoring', user:'H. Müller', country:'DE', deadline:'2025-12-01', status:'Rejected'}
            ].map(row=>(
              <tr key={row.id}>
                <td><input type="checkbox" /></td>
                <td>{row.id}</td>
                <td>{row.title}</td>
                <td>{row.user}</td>
                <td>{row.country}</td>
                <td>{row.deadline}</td>
                <td>
                  <span className={
                    'status ' + (
                      row.status === 'Pending' ? 'pending' :
                      row.status === 'In Review' ? 'review' :
                      row.status === 'Approved' ? 'approved' : 'rejected'
                    )
                  }>
                    {row.status}
                  </span>
                </td>
                <td>
                  <div style={{display:'flex', gap:8}}>
                    <button className="btn" onClick={()=>ui.openDrawer(`Project Review · ${row.id}`)}>Review</button>
                    <button className="btn ghost" onClick={()=>ui.openConfirm(`Delete ${row.id}?`)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 分页 */}
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
