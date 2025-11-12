export default function Modal({open, text, onClose, onConfirm}) {
  if(!open) return null
  return (
    <div id="backdrop" className="backdrop" style={{display:'flex'}}>
      <div className="modal">
        <header>
          <div style={{fontWeight:700}}>Confirm action</div>
          <button className="btn icon" onClick={onClose}>✖</button>
        </header>
        <div className="body">
          <div id="confirm-text" style={{marginBottom:14}}>{text}</div>
          <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
            <button className="btn" onClick={onClose}>Cancel</button>
            <button className="btn danger" onClick={onConfirm}>Confirm</button>
          </div>
        </div>
      </div>
    </div>
  )
}
