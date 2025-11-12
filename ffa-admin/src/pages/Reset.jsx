import { Link } from 'react-router-dom'

export default function Reset(){
  return (
    <section id="page-reset" className="auth">
      <div className="auth-card">
        <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:8}}>
          <span className="dot"></span>
          <h2 style={{margin:0}}>Set a new password</h2>
        </div>
        <div className="field"><label>New password</label><input type="password" /></div>
        <div className="field"><label>Confirm password</label><input type="password" /></div>
        <button className="btn primary">Update password</button>
        <div className="muted" style={{marginTop:12}}>
          <Link to="/login">Back to login</Link>
        </div>
      </div>
    </section>
  )
}
