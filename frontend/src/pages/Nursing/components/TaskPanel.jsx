import { CheckCircle2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { WARD_COLOR } from "../constants";

const CATEGORIES = ["All", "Assessment", "Medication", "Wound Care", "IV Care", "Discharge", "Respiratory", "Other"];

export function TaskPanel({ taskList, remaining, onToggle, onAdd }) {
  const [filter, setFilter] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ patient: "", room: "", desc: "", priority: "Medium", category: "Other" });

  const filtered = filter === "All" ? taskList : taskList.filter(t => t.category === filter);

  const handleAdd = () => {
    if (!form.desc) return;
    onAdd({ ...form, priorityColor: form.priority === "High" ? "#e53e3e" : form.priority === "Medium" ? "#d97706" : "#2f92d0", source: "Manual" });
    setForm({ patient: "", room: "", desc: "", priority: "Medium", category: "Other" });
    setShowAdd(false);
  };

  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #e2e8f0", flex: 1, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontWeight: 800, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
          <CheckCircle2 size={15} color="#16a34a" /> Priority Tasks
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", background: "#f1f5f9", borderRadius: 20, padding: "2px 8px" }}>{remaining} left</span>
          <button onClick={() => setShowAdd(s => !s)} style={{ width: 24, height: 24, borderRadius: "50%", background: WARD_COLOR, border: "none", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <Plus size={12} />
          </button>
        </div>
      </div>

      {/* Category filter */}
      <div style={{ display: "flex", gap: 4, overflowX: "auto", marginBottom: 10, paddingBottom: 2 }}>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setFilter(c)} style={{
            fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 20, border: "none", cursor: "pointer", flexShrink: 0,
            background: filter === c ? WARD_COLOR : "#f1f5f9",
            color: filter === c ? "#fff" : "#64748b",
            transition: "all 0.15s",
          }}>{c}</button>
        ))}
      </div>

      {/* Add form */}
      {showAdd && (
        <div style={{ background: "#f8faff", border: "1px solid #dbeafe", borderRadius: 10, padding: 12, marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#1e293b", marginBottom: 8 }}>Add Task</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <input placeholder="Description *" value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
              style={{ padding: "6px 10px", borderRadius: 7, border: "1px solid #e2e8f0", fontSize: 11, outline: "none" }} />
            <div style={{ display: "flex", gap: 6 }}>
              <input placeholder="Patient" value={form.patient} onChange={e => setForm(f => ({ ...f, patient: e.target.value }))}
                style={{ flex: 1, padding: "6px 10px", borderRadius: 7, border: "1px solid #e2e8f0", fontSize: 11, outline: "none" }} />
              <input placeholder="Room" value={form.room} onChange={e => setForm(f => ({ ...f, room: e.target.value }))}
                style={{ width: 70, padding: "6px 10px", borderRadius: 7, border: "1px solid #e2e8f0", fontSize: 11, outline: "none" }} />
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                style={{ flex: 1, padding: "6px 10px", borderRadius: 7, border: "1px solid #e2e8f0", fontSize: 11, outline: "none", background: "#fff" }}>
                <option>High</option><option>Medium</option><option>Low</option>
              </select>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                style={{ flex: 1, padding: "6px 10px", borderRadius: 7, border: "1px solid #e2e8f0", fontSize: 11, outline: "none", background: "#fff" }}>
                {CATEGORIES.slice(1).map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={handleAdd} style={{ flex: 1, padding: "7px", borderRadius: 7, border: "none", background: WARD_COLOR, color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Add Task</button>
              <button onClick={() => setShowAdd(false)} style={{ padding: "7px 12px", borderRadius: 7, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: 11, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Task list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 7, overflowY: "auto", flex: 1 }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "20px 0", color: "#94a3b8", fontSize: 12 }}>No tasks in this category</div>
        )}
        {filtered.map(task => (
          <div key={task.id} onClick={() => onToggle(task.id)}
            style={{
              border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 12px",
              display: "flex", alignItems: "flex-start", gap: 10,
              cursor: "pointer", opacity: task.done ? 0.5 : 1,
              background: task.done ? "#f8fafc" : "#fff",
              transition: "all 0.2s",
              borderLeft: `3px solid ${task.priorityColor}`,
            }}>
            <div style={{
              width: 16, height: 16, borderRadius: 4, flexShrink: 0, marginTop: 1,
              border: `2px solid ${task.done ? "#16a34a" : "#cbd5e1"}`,
              background: task.done ? "#16a34a" : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {task.done && <span style={{ color: "#fff", fontSize: 9, fontWeight: 900 }}>✓</span>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }}>
                <span style={{ fontWeight: 700, fontSize: 11, textDecoration: task.done ? "line-through" : "none", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {task.patient} {task.room && `· ${task.room}`}
                </span>
                <span style={{ fontSize: 9, fontWeight: 800, color: "#fff", background: task.priorityColor, borderRadius: 20, padding: "1px 7px", flexShrink: 0 }}>{task.priority}</span>
              </div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{task.desc}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 4, alignItems: "center" }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: WARD_COLOR }}>{task.category}</span>
                <span style={{ fontSize: 9, color: "#94a3b8" }}>{task.source} · {task.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
