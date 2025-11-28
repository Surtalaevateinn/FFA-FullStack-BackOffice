import { useEffect, useState } from "react";
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
    zipCode: "",
    // Embassy specific
    address: "",
    // Shared foreign key
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

      const list = body.data?.content || body.data?.records || [];
      setRows(list);
    } catch (e) {
      ui.showToast("Network error");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    setRows([]);
    setFormOpen(false);
    load();
  }, [currentTab]);


  const onSave = async () => {
    if (!form.name) { ui.showToast("Name is required"); return; }
    
    try {

      const payload = { name: form.name };
      
      if (currentTab.key === 'countries') {
        payload.phoneNumberIndicator = form.phoneNumberIndicator;
        payload.continentId = form.continentId ? Number(form.continentId) : null;
      } else if (currentTab.key === 'cities') {
        payload.zipCode = form.zipCode;
        payload.countryId = form.countryId ? Number(form.countryId) : null;
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
      zipCode: row.zipCode || "",
      address: row.address || "",
      countryId: row.countryId || "" 
    });
    setFormOpen(true);
  };

  const openCreate = () => {
    setForm({ id: null, name: "", phoneNumberIndicator: "", continentId: "", zipCode: "", address: "", countryId: "" });
    setFormOpen(true);
  };

  return (
    <section id="page-dicts">
      <div className="toolbar">
        <div>
          <div className="muted">System Dictionaries</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>Dictionaries</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn" onClick={load}>Refresh</button>
          <button className="btn primary" onClick={openCreate}>Add {currentTab.label.slice(0, -1)}</button>
        </div>
      </div>

      {/* Tabs switch */}
      <div className="panel" style={{ marginBottom: 12, display: 'flex', gap: 10 }}>
        {TABS.map(tab => (
          <button 
            key={tab.key}
            className={`btn ${currentTab.key === tab.key ? 'primary' : 'ghost'}`}
            onClick={() => setCurrentTab(tab)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/*  */}
      <div className="panel">
        <table>
          <thead>
            <tr>
              <th style={{ width: 60 }}>ID</th>
              <th>Name</th>
              {/*  */}
              {currentTab.key === 'countries' && <th>Indicator</th>}
              {currentTab.key === 'cities' && <th>Zip Code</th>}
              {currentTab.key === 'embassies' && <th>Address</th>}
              
              <th style={{ width: 140 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={5}>Loading...</td></tr> : rows.map(r => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.name}</td>
                
                {currentTab.key === 'countries' && <td>{r.phoneNumberIndicator || '-'}</td>}
                {currentTab.key === 'cities' && <td>{r.zipCode || '-'}</td>}
                {currentTab.key === 'embassies' && <td>{r.address || '-'}</td>}

                <td>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn small" onClick={() => openEdit(r)}>Edit</button>
                    <button className="btn small danger" onClick={() => onDelete(r.id)}>Del</button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && rows.length === 0 && <tr><td colSpan={5} style={{textAlign:'center'}}>No data</td></tr>}
          </tbody>
        </table>
      </div>

      {/*  */}
      {formOpen && (
        <div className="panel" style={{ marginTop: 12, border: '2px solid #eee' }}>
          <h3>{form.id ? 'Edit' : 'Create'} {currentTab.label.slice(0, -1)}</h3>
          <div className="grid grid-3">
            <div className="field">
              <label>Name *</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>

            {/* Country Fields */}
            {currentTab.key === 'countries' && (
              <>
                <div className="field">
                  <label>Phone Indicator</label>
                  <input placeholder="+33" value={form.phoneNumberIndicator} onChange={e => setForm({...form, phoneNumberIndicator: e.target.value})} />
                </div>
                <div className="field">
                  <label>Continent ID</label>
                  <input type="number" value={form.continentId} onChange={e => setForm({...form, continentId: e.target.value})} />
                </div>
              </>
            )}

            {/* City Fields */}
            {currentTab.key === 'cities' && (
              <>
                <div className="field">
                  <label>Zip Code</label>
                  <input value={form.zipCode} onChange={e => setForm({...form, zipCode: e.target.value})} />
                </div>
                <div className="field">
                  <label>Country ID</label>
                  <input type="number" value={form.countryId} onChange={e => setForm({...form, countryId: e.target.value})} />
                </div>
              </>
            )}

            {/* Embassy Fields */}
            {currentTab.key === 'embassies' && (
              <>
                <div className="field">
                  <label>Address</label>
                  <input value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
                </div>
                <div className="field">
                  <label>Country ID</label>
                  <input type="number" value={form.countryId} onChange={e => setForm({...form, countryId: e.target.value})} />
                </div>
              </>
            )}
          </div>
          
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 10 }}>
            <button className="btn" onClick={() => setFormOpen(false)}>Cancel</button>
            <button className="btn primary" onClick={onSave}>Save</button>
          </div>
        </div>
      )}
    </section>
  );
}
