import { useState } from 'react'

export default function Announce({ui}){
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  return (
    <section id="page-announce">
      <div className="toolbar">
        <div>
          <div className="muted">System Notices</div>
          <div style={{fontSize:20, fontWeight:700}}>Announcements</div>
        </div>
        <div style={{display:'flex', gap:8}}>
          <button className="btn" onClick={()=>ui.showToast('Saved draft')}>Save draft</button>
          <button className="btn primary" onClick={()=>{
            ui.openConfirm('Publish this announcement?')
          }}>Publish</button>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="panel">
          <div className="field">
            <label>Title</label>
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Maintenance on Nov 30" />
          </div>
          <div className="field">
            <label>Content</label>
            <textarea rows={10} value={content} onChange={e=>setContent(e.target.value)}
              placeholder="We will perform maintenance on ..."></textarea>
          </div>
          <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
            <button className="btn ghost" onClick={()=>{setTitle(''); setContent('')}}>Clear</button>
            <button className="btn primary" onClick={()=>ui.showToast('Preview opened')}>Preview</button>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head"><h3 style={{margin:0}}>Recent Announcements</h3></div>
          <table>
            <thead><tr><th>Title</th><th>Author</th><th>Time</th><th style={{width:120}}>Actions</th></tr></thead>
            <tbody>
              {[
                {title:'Policy Update', author:'Admin', time:'2025-11-05 10:00'},
                {title:'New Feature', author:'PM', time:'2025-11-02 09:30'},
              ].map((a,i)=>(
                <tr key={i}>
                  <td>{a.title}</td>
                  <td>{a.author}</td>
                  <td>{a.time}</td>
                  <td>
                    <div style={{display:'flex', gap:8}}>
                      <button className="btn" onClick={()=>ui.openDrawer(`Preview · ${a.title}`)}>View</button>
                      <button className="btn ghost" onClick={()=>ui.openConfirm(`Delete "${a.title}"?`)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
