import { useEffect, useState } from "react";
import api from "../api/api";

export default function Projects({ ui }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);


  const [kw, setKw] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [intervenerId, setIntervenerId] = useState("");


  const emptyForm = { 
    id: null, 
    name: "", 
    description: "", 
    submissionDate: "", 
    intervenerId: "", 
    winnerUserId: "", 
    creatorUser: "" 
  };
  const [form, setForm] = useState(emptyForm);
  const [formOpen, setFormOpen] = useState(false);


  const getErrorMsg = (e, fallback = 'Request failed') => {
    return (
      e?.response?.data?.message ||
      e?.response?.data?.error ||
      fallback
    )
  }


  const formatDate = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };


  const load = async () => {
    setLoading(true);
    try {

      const res = await api.get("/ffaAPI/admin/projects", { 
        params: { page: 0, size: 50 } 
      });
      const body = res.data || {};

      if (body.success === false) {
        ui.showToast(body.message || "Load failed");
        return;
      }


      const pageData = body.data || {};
      const list = pageData.content || pageData.records || [];
      setRows(list);


    } catch (e) {
      ui.showToast(getErrorMsg(e, "Load failed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);


  const defineWinner = async (project) => {

    const userIdStr = prompt(`Enter Winner User ID for project "${project.name}":`);
    if (!userIdStr) return;

    try {
      const res = await api.post(`/ffaAPI/admin/projects/${project.id}/winner`, null, {
        params: { winnerUserId: userIdStr }
      });
      const body = res.data || {};

      if (body.success) {
        ui.showToast("Winner defined successfully");
        load(); 
      } else {
        ui.showToast(body.message || "Failed to define winner");
      }
    } catch (e) {
      ui.showToast(getErrorMsg(e, "Operation failed"));
    }
  };


  const showStatistics = async (id) => {
    try {
      const res = await api.get(`/ffaAPI/admin/projects/${id}/statistics`);
      const body = res.data || {};
      if (body.success) {

        const stats = JSON.stringify(body.data, null, 2);
        alert(`Project Statistics:\n${stats}`);
      } else {
        ui.showToast(body.message || "No stats available");
      }
    } catch (e) {
      ui.showToast(getErrorMsg(e, "Failed to load stats"));
    }
  };


  const onCreate = async () => {
    if (!form.name.trim()) { ui.showToast("Name is required"); return; }
    

    console.warn("Backend 'Create Project' endpoint missing.");
    ui.showToast("Feature not implemented in backend yet");
    
    /* try {
      await api.post("/ffaAPI/admin/projects", { ...form });
      ui.showToast("Created successfully");
      setForm(emptyForm); setFormOpen(false);
      load();
    } catch (e) { ... }
    */
  };


  const onUpdate = async () => {

    console.warn("Backend 'Update Project' endpoint missing.");
    ui.showToast("Feature not implemented in backend yet");

    /*
    try {
      await api.put(`/ffaAPI/admin/projects/${form.id}`, { ...form });
      ui.showToast("Saved successfully");
      setForm(emptyForm); setFormOpen(false);
      load();
    } catch (e) { ... }
    */
  };


  const onDelete = async (id) => {
    const ok = await ui?.openConfirm?.(`Confirm delete project ${id}?`);
    if (!ok) return;


    console.warn("Backend 'Delete Project' endpoint missing.");
    ui.showToast("Feature not implemented in backend yet");

    /*
    try {
      await api.delete(`/ffaAPI/admin/projects/${id}`);
      ui.showToast("Deleted");
      load();
    } catch (e) { ... }
    */
  };


  const openEdit = async (row) => {

    setForm({
      id: row.id,
      name: row.name || "",
      description: row.description || "",
      submissionDate: row.submissionDate || "",
      intervenerId: row.intervenerId || "",
      winnerUserId: row.winnerUserId || "",
      creatorUser: row.creatorUser || "",
    });
    setFormOpen(true);
  };

  return (
    <section id="page-projects">
      {/* Top toolbar */}
      <div className="toolbar">
        <div>
          <div className="muted">Project Management</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>Projects</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn" onClick={load}>Refresh</button>
          <button 
            className="btn primary" 
            onClick={() => { setForm(emptyForm); setFormOpen(true); }}
          >
            Create Project
          </button>
        </div>
      </div>

      {/* Filter bar (Visual Only) */}
      <div className="panel" style={{ marginBottom: 12 }}>
        <div className="grid grid-4">
          <div className="field">
            <label>Keyword</label>
            <input
              type="text"
              placeholder="Search not impl. yet"
              value={kw}
              onChange={(e) => setKw(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Submission Date (From)</label>
            <input type="date" value={from} onChange={e=>setFrom(e.target.value)} />
          </div>
          <div className="field">
            <label>Submission Date (To)</label>
            <input type="date" value={to} onChange={e=>setTo(e.target.value)} />
          </div>
          {/* <div className="field">
            <label>Intervener ID</label>
            <input type="number" value={intervenerId} onChange={e=>setIntervenerId(e.target.value)} />
          </div> 
          */}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
          <button className="btn ghost" onClick={() => { setKw(""); setFrom(""); setTo(""); setIntervenerId(""); }}>Reset</button>
          <button className="btn" onClick={() => ui.showToast("Server-side filtering not implemented")}>Apply</button>
        </div>
      </div>

      {/* List */}
      <div className="panel">
        <table>
          <thead>
            <tr>
              <th style={{ width: 60 }}>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th style={{ width: 120 }}>Submission</th>
              <th style={{ width: 80 }}>Intervener</th>
              <th style={{ width: 80 }}>Winner</th>
              <th style={{ width: 280 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{textAlign:'center', padding:20}}>Loading...</td></tr>
            ) : rows.length ? (
              rows.map(r => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.name}</td>
                  <td style={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {r.description}
                  </td>
                  <td>{formatDate(r.submissionDate)}</td>
                  <td>{r.intervenerId || "-"}</td>
                  <td>{r.winnerUserId ? <span className="tag success">User {r.winnerUserId}</span> : "-"}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn small" onClick={() => openEdit(r)}>Edit</button>
                      <button className="btn small primary" onClick={() => defineWinner(r)}>Pick Winner</button>
                      <button className="btn small ghost" onClick={() => showStatistics(r.id)}>Stats</button>
                      <button className="btn small danger" onClick={() => onDelete(r.id)}>Del</button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={7} style={{textAlign:'center', padding:20}}>No projects found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Form Modal (Placeholder Functionality) */}
      {formOpen && (
        <div className="panel" style={{ marginTop: 12, border: '1px solid #ddd' }}>
          <h3 style={{marginTop:0}}>{form.id ? "Edit Project" : "New Project"}</h3>
          <div className="grid grid-3">
            <div className="field">
              <label>Name *</label>
              <input value={form.name} onChange={e => setForm(s => ({ ...s, name: e.target.value }))} />
            </div>
            <div className="field">
              <label>Submission Date</label>
              <input type="date" value={form.submissionDate ? form.submissionDate.substring(0, 10) : ""} onChange={e => setForm(s => ({ ...s, submissionDate: e.target.value }))} />
            </div>
            <div className="field">
              <label>Intervener ID</label>
              <input type="number" value={form.intervenerId || ""} onChange={e => setForm(s => ({ ...s, intervenerId: e.target.value }))} />
            </div>
            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <label>Description</label>
              <textarea rows={3} value={form.description} onChange={e => setForm(s => ({ ...s, description: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
            <button className="btn" onClick={() => setFormOpen(false)}>Cancel</button>
            {form.id ? (
              <button className="btn primary" onClick={onUpdate}>Save Changes</button>
            ) : (
              <button className="btn primary" onClick={onCreate}>Create</button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
