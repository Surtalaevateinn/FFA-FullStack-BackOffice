import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion"; 
import { Loader2, Trophy, User } from "lucide-react";   
import api from "../api/api";

export default function Projects({ ui }) {
  // Data Source
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  // User Lookup Map (ID -> Name)
  const [userMap, setUserMap] = useState({});

  // Filters
  const [kw, setKw] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  
  // Project Form State (Create/Edit)
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

  // Winner Selection State
  const [winModalOpen, setWinModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);

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

  // ============ API: Load Users for Lookup ============
  const loadUsersForLookup = async () => {
    try {
      // Request a large page size to cover most users for lookup
      const res = await api.get('/ffaAPI/admin/persons', { params: { page: 0, size: 1000 } }); 
      if (res.data?.success) {
        const list = res.data.data?.content || [];
        const map = {};
        list.forEach(u => {
          // Combine names, fallback to login
          const name = [u.firstName, u.lastName].filter(Boolean).join(' ') || u.login;
          map[u.id] = name;
        });
        setUserMap(map);
      }
    } catch (e) {
      console.error("Failed to load user lookup", e);
    }
  };

  // ============ API: Load List / Search ============
  const load = async () => {
    setLoading(true);
    try {
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
      
      // --- Sort by ID Ascending ---
      list.sort((a, b) => a.id - b.id);

      // Local Date Filtering
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
      // Delay loading state slightly to prevent flicker
      setTimeout(() => setLoading(false), 200); 
    }
  };

  useEffect(() => { 
    load(); 
    loadUsersForLookup();
  }, []);

  // ============ WINNER LOGIC START ============

  // 1. Open Modal & Load Applications
  const openWinnerModal = async (project) => {
    setCurrentProject(project);
    setWinModalOpen(true);
    setApplicants([]);
    setLoadingApps(true);

    try {
      // Call the endpoint to get applications for this project
      const res = await api.get(`/ffaAPI/admin/projects/${project.id}/applications`, {
        params: { page: 0, size: 100 }
      });

      if (res.data?.success) {
        const apps = res.data.data?.content || [];
        setApplicants(apps);
      } else {
        ui.showToast(res.data?.message || "Failed to load applications");
      }
    } catch (e) {
      ui.showToast(getErrorMsg(e, "Failed to load applications"));
    } finally {
      setLoadingApps(false);
    }
  };

  // 2. Submit Selected Winner
  const submitWinner = async (userId) => {
    if (!currentProject) return;
    if (!window.confirm(`Set selected user as winner?`)) return;

    try {
      const res = await api.post(`/ffaAPI/admin/projects/${currentProject.id}/winner`, null, {
        params: { winnerUserId: userId }
      });
      
      if (res.data?.success) {
        ui.showToast("Winner defined successfully");
        setWinModalOpen(false);
        load(); // Refresh list
      } else {
        ui.showToast(res.data?.message || "Failed to define winner");
      }
    } catch (e) {
      ui.showToast(getErrorMsg(e, "Operation failed"));
    }
  };

  // Helper to extract User ID from Application object safely
  const getApplicantUserId = (app) => {
    // Try common patterns: app.userId, app.user.id, app.user_id
    if (app.userId) return app.userId;
    if (app.user && app.user.id) return app.user.id;
    if (app.user_id) return app.user_id;
    return null;
  };

  // ============ WINNER LOGIC END ============


  // ============ API: Get Statistics ============
  const showStatistics = async (id) => {
    try {
      const res = await api.get(`/ffaAPI/admin/projects/${id}/statistics`);
      if (res.data?.success) {
        const stats = res.data.data;
        const msg = `Project ID: ${stats.projectId}\nHas Winner: ${stats.hasWinner ? 'Yes' : 'No'}\nSubmission: ${stats.submissionDate || '-'}\nLast Update: ${stats.lastUpdated || '-'}`;
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
        const res = await api.put(`/ffaAPI/admin/projects/${form.id}`, payload);
        if (res.data?.success === false) throw new Error(res.data.message);
        ui.showToast("Project updated successfully");
      } else {
        const res = await api.post("/ffaAPI/admin/projects", payload);
        if (res.data?.success === false) throw new Error(res.data.message);
        ui.showToast("Project created successfully");
      }
      setFormOpen(false);
      load(); 
    } catch (e) {
      ui.showToast(getErrorMsg(e, "Save failed"));
    }
  };

  // ============ API: Delete ============
  const onDelete = async (id) => {
    if (!window.confirm(`Delete project ${id}?`)) return;

    try {
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
  };

  // UI: Open Edit Modal
  const openEdit = (row) => {
    setForm({
      id: row.id,
      name: row.name || "",
      description: row.description || "",
      submissionDate: row.submissionDate ? row.submissionDate.substring(0, 10) : "",
      startDate: row.startDate ? row.startDate.substring(0, 10) : "",
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
    <div className="projects-page">
      {/* CSS Styles */}
      <style>{`
        .projects-page { padding: 20px; font-family: -apple-system, sans-serif; color: inherit; }
        
        /* Spin Animation */
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }

        /* Toolbar */
        .toolbar { 
          display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; 
          background: transparent; 
          padding: 15px; border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
          align-items: center;
        }

        /* Inputs & Selects */
        .form-control, .form-select, input, textarea, select {
          padding: 8px 12px; 
          border: 1px solid #555; 
          border-radius: 4px;
          background: rgba(0, 0, 0, 0.2); 
          color: inherit;
        }
        input[type="date"] { color-scheme: dark; }

        /* Buttons */
        .btn {
          padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer;
          font-weight: 500; transition: all 0.2s;
        }
        .btn:hover { opacity: 0.9; }
        .primary { background: #1890ff; color: white; }
        .default { background: transparent; border: 1px solid #777; color: inherit; }
        .success { background: #52c41a; color: white; }
        .danger { background: #ff4d4f; color: white; }
        .sm { padding: 4px 8px; font-size: 12px; margin-right: 4px; }
        
        /* Table */
        .data-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .data-table th, .data-table td {
          border: 1px solid rgba(255,255,255,0.1); padding: 12px; text-align: left;
        }
        .data-table th { background: transparent; font-weight: 600; }
        
        /* Status Badges */
        .status-badge {
          padding: 2px 8px; border-radius: 10px; font-size: 12px; display: inline-block;
        }
        .status-DRAFT { background: rgba(153, 153, 153, 0.2); color: #999; border: 1px solid #777; }
        .status-PUBLISHED { background: rgba(56, 158, 13, 0.2); color: #389e0d; border: 1px solid #389e0d; }
        .status-PENDING_APPROVAL { background: rgba(24, 144, 255, 0.2); color: #1890ff; border: 1px solid #1890ff; }

        /* Modal Styles */
        .modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          background: #1f1f1f; 
          color: #e0e0e0;
          width: 700px; max-width: 95%; padding: 25px;
          border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          border: 1px solid #333;
        }
        .modal-header { font-size: 18px; font-weight: bold; margin-bottom: 20px; border-bottom: 1px solid #333; padding-bottom: 10px;}
        
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .form-group { margin-bottom: 10px; }
        .form-group label { display: block; margin-bottom: 5px; font-weight: 500; font-size: 13px; }
        .form-group input, .form-group select, .form-group textarea {
          width: 100%; box-sizing: border-box; background: #2b2b2b; border: 1px solid #444; color: #fff;
        }
        .modal-footer { text-align: right; margin-top: 20px; }

        /* Applicant List in Modal */
        .app-list { max-height: 300px; overflow-y: auto; border: 1px solid #333; border-radius: 4px; }
        .app-item {
          display: flex; justify-content: space-between; align-items: center;
          padding: 10px; border-bottom: 1px solid #333; background: #262626;
        }
        .app-item:last-child { border-bottom: none; }
        .app-item:hover { background: #333; }
        .app-info { display: flex; flex-direction: column; }
        .app-name { font-weight: bold; color: #fff; }
        .app-meta { font-size: 12px; color: #999; }
      `}</style>

      {/* Toolbar */}
      <div className="toolbar">
        <input
          placeholder="Keyword..."
          value={kw}
          onChange={(e) => setKw(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && load()}
          style={{ width: '180px' }}
        />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontSize: 12, opacity: 0.7 }}>From:</span>
          <input type="date" value={fromDate} onChange={e=>setFromDate(e.target.value)} style={{ width: '130px' }} />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontSize: 12, opacity: 0.7 }}>To:</span>
          <input type="date" value={toDate} onChange={e=>setToDate(e.target.value)} style={{ width: '130px' }} />
        </div>

        <button className="btn primary" onClick={load}>Search</button>
        <button className="btn default" onClick={() => { setKw(""); setFromDate(""); setToDate(""); load(); }}>Reset</button>

        <div style={{ flex: 1 }}></div>
        <button className="btn success" onClick={openCreate}>+ New Project</button>
      </div>

      {/* Smooth Loading / Data Table */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60, color: '#666' }}>
          <Loader2 className="animate-spin" size={24} />
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.3 }}
        >
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 50 }}>ID</th>
                <th>Name</th>
                <th>Status</th>
                <th>Budget</th>
                <th style={{ width: 100 }}>Start</th>
                <th style={{ width: 100 }}>Submit</th>
                <th style={{ width: 80 }}>Intervener</th>
                <th style={{ width: 80 }}>Winner</th>
                <th style={{ width: 200 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={9} style={{textAlign:'center', padding:40, color: '#999'}}>No projects found</td></tr>
              ) : (
                rows.map(r => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>
                      <div style={{ fontWeight: 'bold' }}>{r.name}</div>
                      <div style={{fontSize:'0.85em', opacity: 0.7, maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                        {r.description}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge status-${r.status}`}>
                        {r.status || 'DRAFT'}
                      </span>
                    </td>
                    <td>{r.totalBudget ? `$${r.totalBudget}` : '-'}</td>
                    <td>{formatDate(r.startDate)}</td>
                    <td>{formatDate(r.submissionDate)}</td>
                    <td>
                        {r.intervenerId ? (userMap[r.intervenerId] || r.intervenerId) : "-"}
                    </td>
                    <td>
                      {r.winnerUserId ? (
                        <span style={{ color: '#52c41a', display:'flex', alignItems:'center', gap: 4 }}>
                            <Trophy size={14} />
                            {userMap[r.winnerUserId] || `User ${r.winnerUserId}`}
                        </span>
                      ) : "-"}
                    </td>
                    <td>
                      <button className="btn sm primary" onClick={() => openEdit(r)}>Edit</button>
                      <button className="btn sm success" onClick={() => openWinnerModal(r)}>Win</button>
                      <button className="btn sm default" onClick={() => showStatistics(r.id)}>Stat</button>
                      <button className="btn sm danger" onClick={() => onDelete(r.id)}>Del</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* Project Editor Modal */}
      <AnimatePresence>
        {formOpen && (
          <div className="modal-overlay">
            <motion.div 
              className="modal-content"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="modal-header">
                {form.id ? "Edit Project" : "New Project"}
              </div>
              
              <div className="form-grid">
                {/* Left Column */}
                <div>
                  <div className="form-group">
                    <label>Project Name *</label>
                    <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Enter name"/>
                  </div>
                  
                  <div className="form-group">
                    <label>Total Budget</label>
                    <input type="number" value={form.totalBudget} onChange={e => setForm({...form, totalBudget: e.target.value})} placeholder="0.00"/>
                  </div>

                  <div className="form-group">
                    <label>Start Date</label>
                    <input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} />
                  </div>

                  <div className="form-group">
                    <label>Intervener ID</label>
                    <input type="number" value={form.intervenerId} onChange={e => setForm({...form, intervenerId: e.target.value})} />
                  </div>
                </div>

                {/* Right Column */}
                <div>
                  <div className="form-group">
                    <label>Status</label>
                    <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                      <option value="DRAFT">Draft</option>
                      <option value="PENDING_APPROVAL">Pending Approval</option>
                      <option value="PUBLISHED">Published</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Submission Deadline</label>
                    <input type="date" value={form.submissionDate} onChange={e => setForm({...form, submissionDate: e.target.value})} />
                  </div>

                  <div className="form-group">
                    <label>Winner User ID (Manual)</label>
                    <input type="number" placeholder="Optional" value={form.winnerUserId} onChange={e => setForm({...form, winnerUserId: e.target.value})} />
                  </div>
                </div>
              </div>

              {/* Full Width */}
              <div className="form-group" style={{ marginTop: 10 }}>
                <label>Description</label>
                <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Project details..." />
              </div>

              <div className="modal-footer">
                <button className="btn default" onClick={() => setFormOpen(false)} style={{ marginRight: 10 }}>Cancel</button>
                <button className="btn primary" onClick={onSave}>
                  {form.id ? "Save Changes" : "Create Project"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Winner Selection Modal */}
      <AnimatePresence>
        {winModalOpen && (
          <div className="modal-overlay">
            <motion.div 
              className="modal-content" style={{ width: 500 }}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="modal-header">
                Select Winner for "{currentProject?.name}"
              </div>

              <div style={{ marginBottom: 15, color: '#aaa', fontSize: '13px' }}>
                Select an applicant from the list below to declare them as the winner.
              </div>

              {loadingApps ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                  <Loader2 className="animate-spin" size={24} />
                </div>
              ) : (
                <div className="app-list">
                  {applicants.length === 0 ? (
                    <div style={{ padding: 20, textAlign: 'center', color: '#666' }}>
                      No applications found for this project.
                    </div>
                  ) : (
                    applicants.map(app => {
                      const uid = getApplicantUserId(app);
                      const name = uid ? (userMap[uid] || `User #${uid}`) : 'Unknown User';
                      return (
                        <div className="app-item" key={app.id}>
                          <div className="app-info">
                            <span className="app-name">
                              <User size={12} style={{ marginRight: 5 }}/>
                              {name}
                            </span>
                            <span className="app-meta">Applied: {formatDate(app.dateApplication)} | Status: {app.status}</span>
                          </div>
                          <button 
                            className="btn sm success" 
                            onClick={() => submitWinner(uid)}
                            disabled={!uid}
                          >
                            Select Winner
                          </button>
                        </div>
                      )
                    })
                  )}
                </div>
              )}

              <div className="modal-footer">
                <button className="btn default" onClick={() => setWinModalOpen(false)}>Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
