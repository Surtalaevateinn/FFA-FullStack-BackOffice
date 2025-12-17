import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion"; 
import { Loader2 } from "lucide-react";   
import api from "../api/api";

export default function Dicts({ ui }) {
  const TABS = [
    { key: "countries", label: "Countries", apiPath: "/ffaAPI/admin/countries" },
    { key: "cities", label: "Cities", apiPath: "/ffaAPI/admin/cities" },
    { key: "embassies", label: "Embassies", apiPath: "/ffaAPI/admin/embassies" },
  ];

  const [currentTab, setCurrentTab] = useState(TABS[0]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  
  const [form, setForm] = useState({ 
    id: null, 
    name: "", 
    // Country specific
    phoneNumberIndicator: "", 
    continentId: "",
    // City specific
    postalCode: "",
    departmentId: "",
    // Embassy specific
    address: "",
    // Shared foreign key (used by Embassy)
    countryId: ""
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get(currentTab.apiPath, { params: { page: 0, size: 100 } });
      const body = res.data || {};
      if (body.success === false) {
        ui.showToast(body.message || "Load failed");
        return;
      }

      // Handle different pagination structures
      const list = body.data?.content || body.data?.records || [];
      
      // --- ADDED: Sort by ID Ascending ---
      list.sort((a, b) => a.id - b.id);
      
      setRows(list);
    } catch (e) {
      ui.showToast("Network error");
    } finally {
      // Smooth out rapid loading flicker
      setTimeout(() => setLoading(false), 200);
    }
  };

  useEffect(() => {
    setRows([]);
    setFormOpen(false);
    load();
    // eslint-disable-next-line
  }, [currentTab]);

  const onSave = async () => {
    if (!form.name) { ui.showToast("Name is required"); return; }
    
    try {
      const payload = { name: form.name };
      
      if (currentTab.key === 'countries') {
        payload.phoneNumberIndicator = form.phoneNumberIndicator;
        payload.continentId = form.continentId ? Number(form.continentId) : null;
      } else if (currentTab.key === 'cities') {
        payload.postalCode = form.postalCode;
        payload.departmentId = form.departmentId ? Number(form.departmentId) : null;
      } else if (currentTab.key === 'embassies') {
        payload.address = form.address;
        payload.countryId = form.countryId ? Number(form.countryId) : null;
      }

      if (form.id) {
        // Update: PUT /{path}/{id}
        await api.put(`${currentTab.apiPath}/${form.id}`, payload);
        ui.showToast("Updated successfully");
      } else {
        // Create: POST /{path}
        await api.post(currentTab.apiPath, payload);
        ui.showToast("Created successfully");
      }
      setFormOpen(false);
      load();
    } catch (e) {
      ui.showToast(e?.response?.data?.message || "Save failed");
    }
  };

  const onDelete = async (id) => {
    ui.openConfirm("Confirm delete?", async () => {
      try {
        await api.delete(`${currentTab.apiPath}/${id}`);
        ui.showToast("Deleted");
        load();
      } catch (e) {
        ui.showToast("Delete failed");
      }
    });
  };

  const openEdit = (row) => {
    setForm({
      id: row.id,
      name: row.name || "",
      phoneNumberIndicator: row.phoneNumberIndicator || "",
      continentId: row.continentId || "",
      postalCode: row.postalCode || "", 
      departmentId: row.departmentId || "",
      address: row.address || "",
      countryId: row.countryId || "" 
    });
    setFormOpen(true);
  };

  const openCreate = () => {
    setForm({ 
      id: null, 
      name: "", 
      phoneNumberIndicator: "", 
      continentId: "", 
      postalCode: "", 
      departmentId: "", 
      address: "", 
      countryId: "" 
    });
    setFormOpen(true);
  };

  return (
    <div className="dicts-page">
      {/* CSS Styles - Unified Dark/Transparent Theme */}
      <style>{`
        .dicts-page { padding: 20px; font-family: -apple-system, sans-serif; color: inherit; }
        
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

        /* Buttons */
        .btn {
          padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer;
          font-weight: 500; transition: all 0.2s;
        }
        .btn:hover { opacity: 0.9; }
        .primary { background: #1890ff; color: white; }
        .default { background: transparent; border: 1px solid #777; color: inherit; }
        .ghost { background: transparent; color: inherit; opacity: 0.7; }
        .ghost:hover { background: rgba(255,255,255,0.1); opacity: 1; }
        .danger { background: #ff4d4f; color: white; }
        .sm { padding: 4px 8px; font-size: 12px; margin-right: 4px; }
        
        /* Tab Buttons specifically */
        .tab-btn { margin-right: 5px; border: 1px solid transparent; }
        .tab-btn.active { background: #1890ff; color: white; }
        .tab-btn.inactive { background: transparent; border: 1px solid #555; color: #aaa; }

        /* Table */
        .data-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .data-table th, .data-table td {
          border: 1px solid rgba(255,255,255,0.1); padding: 12px; text-align: left;
        }
        .data-table th { background: transparent; font-weight: 600; }

        /* Modal Styles */
        .modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          background: #1f1f1f; 
          color: #e0e0e0;
          width: 500px; max-width: 95%; padding: 25px;
          border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          border: 1px solid #333;
        }
        .modal-header { font-size: 18px; font-weight: bold; margin-bottom: 20px; border-bottom: 1px solid #333; padding-bottom: 10px;}
        
        .form-group { margin-bottom: 15px; }
        .form-group label { display: block; margin-bottom: 5px; font-weight: 500; font-size: 13px; }
        .form-group input, .form-group select {
          width: 100%; box-sizing: border-box; background: #2b2b2b; border: 1px solid #444; color: #fff;
        }
        .modal-footer { text-align: right; margin-top: 20px; }
      `}</style>

      {/* Toolbar & Tabs */}
      <div className="toolbar">
        <div style={{ marginRight: 20 }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>System Dictionaries</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>Dicts</div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex' }}>
          {TABS.map(tab => (
            <button 
              key={tab.key}
              className={`btn tab-btn ${currentTab.key === tab.key ? 'active' : 'inactive'}`}
              onClick={() => setCurrentTab(tab)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ flex: 1 }}></div>
        
        <button className="btn primary" onClick={load} style={{ marginRight: 10 }}>Refresh</button>
        <button className="btn success" onClick={openCreate} style={{ background: '#52c41a', color: 'white' }}>
          + Add {currentTab.label.slice(0, -1)}
        </button>
      </div>

      {/* Table with Animation */}
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
                <th style={{ width: 60 }}>ID</th>
                <th>Name</th>
                
                {currentTab.key === 'countries' && <th>Phone Indicator</th>}
                {currentTab.key === 'countries' && <th>Continent ID</th>}
                
                {currentTab.key === 'cities' && <th>Postal Code</th>}
                {currentTab.key === 'cities' && <th>Dept ID</th>}
                
                {currentTab.key === 'embassies' && <th>Address</th>}
                {currentTab.key === 'embassies' && <th>Country ID</th>}
                
                <th style={{ width: 140 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                 <tr><td colSpan={6} style={{textAlign:'center', padding: 20, color: '#999'}}>No data found</td></tr>
              ) : (
                rows.map(r => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td><strong>{r.name}</strong></td>
                    
                    {currentTab.key === 'countries' && <td>{r.phoneNumberIndicator || '-'}</td>}
                    {currentTab.key === 'countries' && <td>{r.continentId || '-'}</td>}
                    
                    {currentTab.key === 'cities' && <td>{r.postalCode || '-'}</td>}
                    {currentTab.key === 'cities' && <td>{r.departmentId || '-'}</td>}
                    
                    {currentTab.key === 'embassies' && <td>{r.address || '-'}</td>}
                    {currentTab.key === 'embassies' && <td>{r.countryId || '-'}</td>}

                    <td>
                      <button className="btn sm primary" onClick={() => openEdit(r)}>Edit</button>
                      <button className="btn sm danger" onClick={() => onDelete(r.id)}>Del</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* Modal Form with AnimatePresence */}
      <AnimatePresence>
        {formOpen && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="modal-content"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="modal-header">
                {form.id ? 'Edit' : 'Create'} {currentTab.label.slice(0, -1)}
              </div>
              
              <div className="form-group">
                <label>Name *</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Enter name" />
              </div>

              {/* Country Fields */}
              {currentTab.key === 'countries' && (
                <>
                  <div className="form-group">
                    <label>Phone Indicator</label>
                    <input placeholder="e.g. +33" value={form.phoneNumberIndicator} onChange={e => setForm({...form, phoneNumberIndicator: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Continent ID</label>
                    <input type="number" value={form.continentId} onChange={e => setForm({...form, continentId: e.target.value})} placeholder="ID Number" />
                  </div>
                </>
              )}

              {/* City Fields */}
              {currentTab.key === 'cities' && (
                <>
                  <div className="form-group">
                    <label>Postal Code</label>
                    <input value={form.postalCode} onChange={e => setForm({...form, postalCode: e.target.value})} placeholder="e.g. 75001" />
                  </div>
                  <div className="form-group">
                    <label>Department ID</label>
                    <input type="number" value={form.departmentId} onChange={e => setForm({...form, departmentId: e.target.value})} placeholder="ID Number" />
                  </div>
                </>
              )}

              {/* Embassy Fields */}
              {currentTab.key === 'embassies' && (
                <>
                  <div className="form-group">
                    <label>Address</label>
                    <input value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Full address" />
                  </div>
                  <div className="form-group">
                    <label>Country ID</label>
                    <input type="number" value={form.countryId} onChange={e => setForm({...form, countryId: e.target.value})} placeholder="ID Number" />
                  </div>
                </>
              )}

              <div className="modal-footer">
                <button className="btn default" onClick={() => setFormOpen(false)} style={{ marginRight: 10 }}>Cancel</button>
                <button className="btn primary" onClick={onSave}>Save Changes</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
