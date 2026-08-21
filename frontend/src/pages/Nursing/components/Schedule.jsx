import { Calendar, Check } from "lucide-react";

const TYPE_CONFIG = {
  routine:   { color: "#2f92d0", bg: "#eff6ff", icon: "🔄" },
  med:       { color: "#7c3aed", bg: "#faf5ff", icon: "💊" },
  vitals:    { color: "#e11d48", bg: "#fff1f2", icon: "📊" },
  wound:     { color: "#d97706", bg: "#fffbeb", icon: "🩹" },
  resp:      { color: "#0891b2", bg: "#ecfeff", icon: "🫁" },
  assess:    { color: "#16a34a", bg: "#f0fdf4", icon: "📋" },
  iv:        { color: "#2f92d0", bg: "#eff6ff", icon: "💉" },
  discharge: { color: "#16a34a", bg: "#f0fdf4", icon: "🚪" },
  meeting:   { color: "#64748b", bg: "#f8fafc", icon: "👥" },
  education: { color: "#7c3aed", bg: "#faf5ff", icon: "📚" },
};

export function Schedule({ schedule, onToggle }) {
  const done    = schedule.filter(s => s.done).length;
  const pct     = Math.round((done / schedule.length) * 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 800, margin: "0 auto", width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontWeight: 800, fontSize: 15, display: "flex", alignItems: "center", gap: 7 }}>
          <Calendar size={16} color="#2f92d0" /> Today's Schedule
        </div>
        <span style={{ fontSize: 11, color: "#64748b" }}>{done}/{schedule.length} complete</span>
      </div>

      {/* Progress bar */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "12px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#1e293b" }}>Shift Progress</span>
          <span style={{ fontSize: 11, fontWeight: 800, color: "#2f92d0" }}>{pct}%</span>
        </div>
        <div style={{ height: 8, borderRadius: 8, background: "#e2e8f0", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#16a34a,#22c55e)", borderRadius: 8, transition: "width 0.6s ease" }} />
        </div>
      </div>

      {/* Schedule items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {schedule.map(item => {
          const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.routine;
          return (
            <div key={item.id}
              onClick={() => onToggle(item.id)}
              style={{
                background: item.done ? "#f8fafc" : "#fff",
                border: `1px solid ${item.done ? "#e2e8f0" : cfg.color + "44"}`,
                borderLeft: `3px solid ${item.done ? "#16a34a" : cfg.color}`,
                borderRadius: 10, padding: "10px 14px",
                display: "flex", alignItems: "center", gap: 12,
                cursor: "pointer", opacity: item.done ? 0.65 : 1,
                transition: "all 0.15s",
              }}>
              {/* Time */}
              <div style={{ minWidth: 48, textAlign: "center", flexShrink: 0 }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 800, color: item.done ? "#94a3b8" : cfg.color }}>{item.time}</div>
              </div>
              <div style={{ width: 1, height: 32, background: "#e2e8f0", flexShrink: 0 }} />

              {/* Icon */}
              <span style={{ fontSize: 16, flexShrink: 0 }}>{cfg.icon}</span>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: item.done ? "#94a3b8" : "#1e293b", textDecoration: item.done ? "line-through" : "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {item.task}
                </div>
                <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>
                  {item.nurse} · {item.room}
                </div>
              </div>

              {/* Status */}
              <div style={{
                width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                background: item.done ? "#16a34a" : cfg.bg,
                border: `2px solid ${item.done ? "#16a34a" : cfg.color}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {item.done && <Check size={12} color="#fff" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
