import { Bed } from "lucide-react";
import { WARD_BEDS } from "../constants";

const STATUS_CONFIG = {
  occupied:  { color: "#e53e3e", bg: "#fff5f5", border: "#fecaca", label: "Occupied"  },
  empty:     { color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", label: "Available" },
  cleaning:  { color: "#d97706", bg: "#fffbeb", border: "#fde68a", label: "Cleaning"  },
  reserved:  { color: "#7c3aed", bg: "#faf5ff", border: "#e9d5ff", label: "Reserved"  },
};

const RISK_COLOR = { HIGH: "#e53e3e", MEDIUM: "#d97706", LOW: "#16a34a" };

export function WardView({ patients, bedCount }) {
  const occupied  = WARD_BEDS.filter(b => b.status === "occupied").length;
  const empty     = WARD_BEDS.filter(b => b.status === "empty").length;
  const cleaning  = WARD_BEDS.filter(b => b.status === "cleaning").length;
  const reserved  = WARD_BEDS.filter(b => b.status === "reserved").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ fontWeight: 800, fontSize: 15, display: "flex", alignItems: "center", gap: 7 }}>
        <Bed size={16} color="#2f92d0" /> Ward Map — Blue Zone
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {Object.entries(STATUS_CONFIG).map(([s, cfg]) => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: cfg.color }} />
            <span style={{ fontSize: 11, color: "#64748b" }}>{cfg.label}</span>
          </div>
        ))}
      </div>

      {/* Summary pills */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {[
          { label: "Occupied",  val: occupied,  color: "#e53e3e", bg: "#fff5f5" },
          { label: "Available", val: empty,     color: "#16a34a", bg: "#f0fdf4" },
          { label: "Cleaning",  val: cleaning,  color: "#d97706", bg: "#fffbeb" },
          { label: "Reserved",  val: reserved,  color: "#7c3aed", bg: "#faf5ff" },
        ].map(p => (
          <div key={p.label} style={{ background: p.bg, borderRadius: 10, padding: "8px 14px", textAlign: "center", flex: 1, minWidth: 80 }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: p.color }}>{p.val}</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", letterSpacing: 0.5 }}>{p.label.toUpperCase()}</div>
          </div>
        ))}
      </div>

      {/* Bed grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10 }}>
        {WARD_BEDS.map(bed => {
          const cfg = STATUS_CONFIG[bed.status];
          const patient = patients.find(p => p.name === bed.patient);
          return (
            <div key={bed.id} style={{
              background: cfg.bg,
              border: `1.5px solid ${cfg.border}`,
              borderRadius: 12, padding: "12px 12px",
              position: "relative", transition: "transform 0.15s",
              cursor: bed.status === "occupied" ? "pointer" : "default",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 13, color: cfg.color }}>{bed.id}</div>
                  <div style={{ fontSize: 10, color: "#94a3b8" }}>Room {bed.room}</div>
                </div>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.color, marginTop: 3 }} />
              </div>

              {bed.status === "occupied" && bed.patient && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {bed.patient}
                  </div>
                  {bed.risk && (
                    <span style={{
                      fontSize: 9, fontWeight: 800, color: "#fff",
                      background: RISK_COLOR[bed.risk] || "#94a3b8",
                      borderRadius: 20, padding: "1px 7px", display: "inline-block", marginTop: 3,
                    }}>{bed.risk}</span>
                  )}
                  {patient && (
                    <div style={{ fontSize: 10, color: "#64748b", marginTop: 3 }}>
                      HR: {patient.hr} · SpO₂: {patient.spo2}%
                    </div>
                  )}
                </div>
              )}
              {bed.status === "empty" && (
                <div style={{ marginTop: 6, fontSize: 11, color: cfg.color, fontWeight: 700 }}>Ready</div>
              )}
              {bed.status === "cleaning" && (
                <div style={{ marginTop: 6, fontSize: 11, color: cfg.color, fontWeight: 700 }}>🧹 In Progress</div>
              )}
              {bed.status === "reserved" && (
                <div style={{ marginTop: 6, fontSize: 11, color: cfg.color, fontWeight: 700 }}>📋 Reserved</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Occupancy bar */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#1e293b" }}>Ward Occupancy</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: "#2f92d0" }}>{bedCount.occupied}/{bedCount.total}</span>
        </div>
        <div style={{ height: 8, borderRadius: 8, background: "#e2e8f0", overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: `${Math.round((bedCount.occupied / bedCount.total) * 100)}%`,
            background: "linear-gradient(90deg,#2f92d0,#1a6bbf)",
            borderRadius: 8, transition: "width 0.8s ease",
          }} />
        </div>
        <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 5 }}>
          {Math.round((bedCount.occupied / bedCount.total) * 100)}% occupied · {bedCount.total - bedCount.occupied} beds available
        </div>
      </div>
    </div>
  );
}
