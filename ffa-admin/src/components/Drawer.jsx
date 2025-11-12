export default function Drawer({open, title, onClose, children}) {
  return (
    <div id="drawer" className="drawer" style={{right: open?0:-560}} aria-hidden={!open}>
      <div className="head">
        <div style={{fontWeight:700}} id="drawer-title">{title || 'Details'}</div>
        <button className="btn icon" onClick={onClose}>✖</button>
      </div>
      <div className="content">
        {children || (
          <div className="grid">
            <div className="panel">
              <div className="grid grid-2">
                <div className="field"><label>Project ID</label><input type="text" value="P-1022" disabled /></div>
                <div className="field"><label>Intervener</label><input type="text" value="M. Smith" disabled /></div>
                <div className="field"><label>Start Date</label><input type="date" value="2025-11-01" disabled /></div>
                <div className="field"><label>Deadline</label><input type="date" value="2025-11-30" disabled /></div>
                <div className="field" style={{gridColumn:'1 / -1'}}>
                  <label>Notes</label>
                  <textarea rows={4} defaultValue="Auto-filled details to review..." />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
