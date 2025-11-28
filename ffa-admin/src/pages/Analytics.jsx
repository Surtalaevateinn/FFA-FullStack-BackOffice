export default function Analytics({ui}){
  return (
    <section id="page-analytics">
      <div className="toolbar">
        <div>
          <div className="muted">Metrics</div>
          <div style={{fontSize:20, fontWeight:700}}>Analytics</div>
        </div>
        <div style={{display:'flex', gap:8}}>
          <button className="btn" onClick={()=>ui.showToast('Refreshed')}>Refresh</button>
          <button className="btn ghost" onClick={()=>ui.showToast('Exported CSV')}>Export</button>
        </div>
      </div>

      <div className="grid grid-4">
        <div className="card kpi"><h3>DAU</h3><div className="num">1,284</div><div className="muted">+4.2% WoW</div></div>
        <div className="card kpi"><h3>Avg. Review Time</h3><div className="num">14m</div><div className="muted">-2m vs last week</div></div>
        <div className="card kpi"><h3>Approval Rate</h3><div className="num">72%</div><div className="muted">stable</div></div>
        <div className="card kpi"><h3>Errors (24h)</h3><div className="num">17</div><div className="muted">-5 vs 24h</div></div>
      </div>

      <div className="grid grid-2" style={{marginTop:16}}>
        <div className="panel">
          <div className="panel-head"><h3 style={{margin:0}}>Projects per Day</h3></div>
          <div style={{height:260, display:'grid', placeItems:'center'}} className="muted">
            [Chart Placeholder]
          </div>
        </div>
        <div className="panel">
          <div className="panel-head"><h3 style={{margin:0}}>Review Time Distribution</h3></div>
          <div style={{height:260, display:'grid', placeItems:'center'}} className="muted">
            [Chart Placeholder]
          </div>
        </div>
      </div>
    </section>
  )
}
