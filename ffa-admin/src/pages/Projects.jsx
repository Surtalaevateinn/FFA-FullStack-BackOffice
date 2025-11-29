import { useEffect, useState } from "react";
import api from "../api/api";

export default function Projects({ ui }) {
  // Data Source
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [kw, setKw] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  
  // Form State
  const emptyForm = { 
    id: null, 
    name: "", 
    description: "", 
    submissionDate: "", 
    startDate: "",
    totalBudget: "",
    status: "DRAFT",
    intervenerId: "", 
    winnerUserId: ""
  };
  const [form, setForm] = useState(emptyForm);
  const [formOpen, setFormOpen] = useState(false);

  // Helper: Error Message
  const getErrorMsg = (e, fallback = 'Request failed') => {
    return (
      e?.response?.data?.message ||
      e?.response?.data?.error ||
      fallback
    )
  }

  // Helper: Format Date
  const formatDate = (iso) => {
    if (!iso) return "-";
    return iso.substring(0, 10); // yyyy-MM-dd
  };

  // ============ API: Load List / Search ============
  const load = async () => {
    setLoading(true);
    try {
      // Determine URL based on keyword presence
      // Backend now supports /search for keywords
      const isSearch = !!kw.trim();
      const url = isSearch ? "/ffaAPI/admin/projects/search" : "/ffaAPI/admin/projects";
      
      const params = { page: 0, size: 50 };
      if (isSearch) {
        params.keyword = kw.trim();
      }

      const res = await api.get(url, { params });
      const body = res.data || {};

      if (body.success === false) {
        ui.showToast(body.message || "Load failed");
        return;
      }

      const pageData = body.data || {};
      const list = pageData.content || pageData.records || [];
      
      // Since backend only filters by Keyword (description), 
      // we apply Date filtering locally on the result
      let finalRows = list;
      if (fromDate || toDate) {
         finalRows = list.filter(r => {
            const subDate = r.submissionDate ? new Date(r.submissionDate) : null;
            if (!subDate) return true;
            let match = true;
            if (fromDate && subDate < new Date(fromDate)) match = false;
            if (toDate && subDate > new Date(toDate)) match = false;
            return match;
         });
      }

      setRows(finalRows);

    } catch (e) {
      ui.showToast(getErrorMsg(e, "Load failed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ============ API: Define Winner ============
  const defineWinner = async (project) => {
    const userIdStr = prompt(`Enter Winner User ID for project "${project.name}":`, project.winnerUserId || "");
    if (userIdStr === null) return; // Cancelled

    try {
      // POST /ffaAPI/admin/projects/{id}/winner
      const res = await api.post(`/ffaAPI/admin/projects/${project.id}/winner`, null, {
        params: { winnerUserId: userIdStr }
      });
      
      if (res.data?.success) {
        ui.showToast("Winner defined successfully");
        load(); 
      } else {
        ui.showToast(res.data?.message || "Failed to define winner");
      }
    } catch (e) {
      ui.showToast(getErrorMsg(e, "Operation failed"));
    }
  };

  // ============ API: Get Statistics ============
  const showStatistics = async (id) => {
    try {
      const res = await api.get(`/ffaAPI/admin/projects/${id}/statistics`);
      if (res.data?.success) {
        const stats = res.data.data;
        const msg = `
          Project ID: ${stats.projectId}
          Has Winner: ${stats.hasWinner ? 'Yes' : 'No'}
          Submission: ${stats.submissionDate || '-'}
          Last Update: ${stats.lastUpdated || '-'}
        `;
        alert(msg);
      } else {
        ui.showToast(res.data?.message || "No stats available");
      }
    } catch (e) {
      ui.showToast(getErrorMsg(e, "Failed to load stats"));
    }
  };

  // ============ API: Create / Update ============
  const onSave = async () => {
    if (!form.name.trim()) { ui.showToast("Name is required"); return; }
    
    // Construct payload strictly matching Project entity
    const payload = {
      name: form.name,
      description: form.description,
      submissionDate: form.submissionDate || null,
      startDate: form.startDate || null,
      totalBudget: form.totalBudget ? Number(form.totalBudget) : null,
      status: form.status,
      intervenerId: form.intervenerId ? Number(form.intervenerId) : null,
      winnerUserId: form.winnerUserId ? Number(form.winnerUserId) : null,
    };

    try {
      if (form.id) {
        // UPDATE: PUT /ffaAPI/admin/projects/{id}
        const res = await api.put(`/ffaAPI/admin/projects/${form.id}`, payload);
        if (res.data?.success === false) throw new Error(res.data.message);
        ui.showToast("Project updated successfully");
      } else {
        // CREATE: POST /ffaAPI/admin/projects
        const res = await api.post("/ffaAPI/admin/projects", payload);
        if (res.data?.success === false) throw new Error(res.data.message);
        ui.showToast("Project created successfully");
      }
      setFormOpen(false);
      load(); // Refresh list
    } catch (e) {
      ui.showToast(getErrorMsg(e, "Save failed"));
    }
  };

  // ============ API: Delete ============
  const onDelete = async (id) => {
    ui.openConfirm(`Delete project ${id}?`, async () => {
      try {
        // DELETE: DELETE /ffaAPI/admin/projects/{id}
        const res = await api.delete(`/ffaAPI/admin/projects/${id}`);
        if (res.data?.success === false) {
           ui.showToast(res.data.message || "Delete failed");
        } else {
           ui.showToast("Project deleted successfully");
           load();
        }
      } catch (e) {
        ui.showToast(getErrorMsg(e, "Delete failed"));
      }
    });
  };

  // UI: Open Edit Modal
  const openEdit = (row) => {
    setForm({
      id: row.id,
      name: row.name || "",
      description: row.description || "",
      submissionDate: row.submissionDate || "",
      startDate: row.startDate || "",
      totalBudget: row.totalBudget || "",
      status: row.status || "DRAFT",
      intervenerId: row.intervenerId || "",
      winnerUserId: row.winnerUserId || "",
    });
    setFormOpen(true);
  };

  // UI: Open Create Modal
  const openCreate = () => {
    setForm(emptyForm);
    setFormOpen(true);
  };

  return (
    <section id="page-projects">
      {/* Toolbar */}
      <div className="toolbar">
        <div>
          <div className="muted">Project Management</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>Projects</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn" onClick={load}>Refresh</button>
          <button className="btn primary" onClick={openCreate}>Create Project</button>
        </div>
      </div>

      {/* Filters */}
      <div className="panel" style={{ marginBottom: 12 }}>
        <div className="grid grid-4">
          <div className="field">
            <label>Keyword</label>
            <input
              type="text"
              placeholder="Name / Description"
              value={kw}
              onChange={(e) => setKw(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && load()}
            />
          </div>
          <div className="field">
            <label>Submission From</label>
            <input type="date" value={fromDate} onChange={e=>setFromDate(e.target.value)} />
          </div>
          <div className="field">
            <label>Submission To</label>
            <input type="date" value={toDate} onChange={e=>setToDate(e.target.value)} />
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
             <button className="btn primary" onClick={load}>Search</button>
             <button className="btn ghost" onClick={() => { setKw(""); setFromDate(""); setToDate(""); load(); }}>Reset</button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="panel">
        <table>
          <thead>
            <tr>
              <th style={{ width: 50 }}>ID</th>
              <th>Name</th>
              <th>Status</th>
              <th>Budget</th>
              <th style={{ width: 100 }}>Start Date</th>
              <th style={{ width: 100 }}>Submission</th>
              <th style={{ width: 80 }}>Winner</th>
              <th style={{ width: 220 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{textAlign:'center', padding:20}}>Loading...</td></tr>
            ) : rows.length ? (
              rows.map(r => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>
                    <strong>{r.name}</strong>
                    <div className="muted" style={{fontSize:'0.85em', maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                      {r.description}
                    </div>
                  </td>
                  <td>
                    <span className={`tag ${r.status === 'PUBLISHED' ? 'success' : r.status === 'DRAFT' ? 'muted' : 'warning'}`}>
                      {r.status || 'DRAFT'}
                    </span>
                  </td>
                  <td>{r.totalBudget ? `$${r.totalBudget}` : '-'}</td>
                  <td>{formatDate(r.startDate)}</td>
                  <td>{formatDate(r.submissionDate)}</td>
                  <td>
                    {r.winnerUserId ? <span className="tag success">User {r.winnerUserId}</span> : "-"}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn small" onClick={() => openEdit(r)}>Edit</button>
                      <button className="btn small primary" onClick={() => defineWinner(r)}>Winner</button>
                      <button className="btn small ghost" onClick={() => showStatistics(r.id)}>Stats</button>
                      <button className="btn small danger" onClick={() => onDelete(r.id)}>Del</button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={8} style={{textAlign:'center', padding:20}}>No projects found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Form Modal */}
      {formOpen && (
        <div className="panel" style={{ marginTop: 12, border: '2px solid #eee' }}>
          <h3 style={{marginTop:0}}>{form.id ? "Edit Project" : "New Project"}</h3>
          
          <div className="grid grid-3">
            <div className="field">
              <label>Name *</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            
            <div className="field">
              <label>Total Budget</label>
              <input type="number" value={form.totalBudget} onChange={e => setForm({...form, totalBudget: e.target.value})} />
            </div>

            <div className="field">
              <label>Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                <option value="DRAFT">Draft</option>
                <option value="PENDING_APPROVAL">Pending Approval</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>

            <div className="field">
              <label>Start Date</label>
              <input type="date" value={formatDate(form.startDate)} onChange={e => setForm({...form, startDate: e.target.value})} />
            </div>

            <div className="field">
              <label>Submission Date</label>
              <input type="date" value={formatDate(form.submissionDate)} onChange={e => setForm({...form, submissionDate: e.target.value})} />
            </div>

            <div className="field">
              <label>Intervener ID</label>
              <input type="number" value={form.intervenerId} onChange={e => setForm({...form, intervenerId: e.target.value})} />
            </div>

            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <label>Description</label>
              <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
            <button className="btn" onClick={() => setFormOpen(false)}>Cancel</button>
            <button className="btn primary" onClick={onSave}>
              {form.id ? "Save Changes" : "Create Project"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
