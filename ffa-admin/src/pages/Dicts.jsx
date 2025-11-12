// src/pages/Dicts.jsx
import { useEffect, useState } from "react";
import api from "../api/api";

export default function Dicts({ ui }) {
  // 国家
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ id: null, name: "", isoCode: "" });
  const [kw, setKw] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      // 后端：GET /ffaAPI/admin/countries/list
      const res = await api.get("/admin/countries/list");
      setCountries(res.data || []);
    } catch (e) {
      console.error(e);
      ui?.showToast?.("加载失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onCreate = async () => {
    if (!form.name?.trim()) {
      ui?.showToast?.("名称必填");
      return;
    }
    try {
      // POST /admin/countries/create
      await api.post("/admin/countries/create", {
        name: form.name.trim(),
        isoCode: form.isoCode?.trim() || null,
      });
      ui?.showToast?.("创建成功");
      setForm({ id: null, name: "", isoCode: "" });
      setFormOpen(false);
      load();
    } catch (e) {
      console.error(e);
      ui?.showToast?.(e?.response?.data?.message || "创建失败");
    }
  };

  const onUpdate = async () => {
    try {
      // PUT /admin/countries/update/{id}
      await api.put(`/admin/countries/update/${form.id}`, {
        name: form.name?.trim(),
        isoCode: form.isoCode?.trim() || null,
      });
      ui?.showToast?.("更新成功");
      setForm({ id: null, name: "", isoCode: "" });
      setFormOpen(false);
      load();
    } catch (e) {
      console.error(e);
      ui?.showToast?.(e?.response?.data?.message || "更新失败");
    }
  };

  const onDelete = async (id) => {
    if (!confirm("确认删除该国家？")) return;
    try {
      // DELETE /admin/countries/delete/{id}
      await api.delete(`/admin/countries/delete/${id}`);
      ui?.showToast?.("已删除");
      load();
    } catch (e) {
      console.error(e);
      ui?.showToast?.(e?.response?.data?.message || "删除失败");
    }
  };

  const filtered = countries.filter((c) => {
    if (!kw.trim()) return true;
    const s = kw.trim().toLowerCase();
    return (
      String(c.id).includes(s) ||
      c.name?.toLowerCase().includes(s) ||
      c.isoCode?.toLowerCase().includes(s)
    );
  });

  return (
    <section id="page-dicts">
      <div className="toolbar">
        <div>
          <div className="muted">System Dictionaries</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>Dictionaries</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn" onClick={load}>
            重新加载
          </button>
          <button
            className="btn primary"
            onClick={() => {
              setForm({ id: null, name: "", isoCode: "" });
              setFormOpen(true);
            }}
          >
            新增国家
          </button>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 12 }}>
        <div className="grid grid-3">
          <div className="field">
            <label>关键词</label>
            <input
              placeholder="ID / 名称 / ISO"
              value={kw}
              onChange={(e) => setKw(e.target.value)}
            />
          </div>
          <div className="field">
            <label>健康检查</label>
            <button
              className="btn"
              onClick={async () => {
                try {
                  const res = await api.get("/health");
                  ui?.showToast?.(`后端：${res.data}`);
                } catch {
                  ui?.showToast?.("后端不可达");
                }
              }}
            >
              /ffaAPI/health
            </button>
          </div>
        </div>
      </div>

      <div className="panel">
        <table>
          <thead>
            <tr>
              <th style={{ width: 80 }}>ID</th>
              <th>名称</th>
              <th style={{ width: 120 }}>ISO</th>
              <th style={{ width: 160 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4}>加载中...</td>
              </tr>
            ) : filtered.length ? (
              filtered.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.name}</td>
                  <td>{c.isoCode || "-"}</td>
                  <td>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        className="btn"
                        onClick={() => {
                          setForm({ id: c.id, name: c.name, isoCode: c.isoCode || "" });
                          setFormOpen(true);
                        }}
                      >
                        编辑
                      </button>
                      <button className="btn ghost" onClick={() => onDelete(c.id)}>
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4}>暂无数据</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 简易内联表单（你也可以换成全局 Drawer/Modal） */}
      {formOpen && (
        <div className="panel" style={{ marginTop: 12 }}>
          <div className="grid grid-3">
            <div className="field">
              <label>名称</label>
              <input
                value={form.name}
                onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                placeholder="France"
              />
            </div>
            <div className="field">
              <label>ISO</label>
              <input
                value={form.isoCode}
                onChange={(e) => setForm((s) => ({ ...s, isoCode: e.target.value }))}
                placeholder="FR"
              />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button className="btn" onClick={() => setFormOpen(false)}>
              取消
            </button>
            {form.id ? (
              <button className="btn primary" onClick={onUpdate}>
                保存修改
              </button>
            ) : (
              <button className="btn primary" onClick={onCreate}>
                创建
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
