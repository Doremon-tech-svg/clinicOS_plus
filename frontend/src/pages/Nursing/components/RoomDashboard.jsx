import { useState, useMemo } from "react";
import { Bed, Users, X, Activity, User, CheckCircle2 } from "lucide-react";
import { WARD_COLOR } from "../constants";

const STATUS_CONFIG = {
  Occupied:  { color: "#e53e3e", bg: "#fff5f5", border: "#fecaca", label: "Occupied"  },
  Available: { color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", label: "Available" },
  Maintenance:  { color: "#d97706", bg: "#fffbeb", border: "#fde68a", label: "Maintenance"  },
};

export function RoomDashboard({ patients, bedCount, rawBeds = [] }) {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedBed, setSelectedBed] = useState(null);

  // Group beds by room
  const rooms = useMemo(() => {
    const grouped = {};
    rawBeds.forEach(bed => {
      if (!grouped[bed.room]) {
        grouped[bed.room] = { name: bed.room, ward: bed.ward, beds: [], total: 0, occupied: 0 };
      }
      grouped[bed.room].beds.push(bed);
      grouped[bed.room].total++;
      if (bed.status === 'Occupied') grouped[bed.room].occupied++;
    });
    return Object.values(grouped).sort((a,b) => a.name.localeCompare(b.name));
  }, [rawBeds]);

  // If a room is selected, show its beds
  if (selectedRoom) {
    const room = rooms.find(r => r.name === selectedRoom);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontWeight: 800, fontSize: 18, color: "#1e293b", display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={() => setSelectedRoom(null)} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontWeight: 700, color: "#475569" }}>
              ← Back
            </button>
            Room {room.name} <span style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", background: "#f8fafc", padding: "2px 8px", borderRadius: 12 }}>{room.ward}</span>
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: WARD_COLOR }}>
            {room.occupied} / {room.total} Beds Occupied
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
          {room.beds.map(bed => {
            const cfg = STATUS_CONFIG[bed.status] || STATUS_CONFIG.Available;
            const patient = bed.patient_id ? patients.find(p => p.id === bed.patient_id) : null;
            // Mock "Freeing soon" logic for AI feature later
            const freeingSoon = bed.status === "Occupied" && bed.id % 5 === 0;

            return (
              <div key={bed.id} 
                onClick={() => bed.status === "Occupied" ? setSelectedBed(bed) : null}
                style={{
                  background: cfg.bg, border: `1.5px solid ${cfg.border}`, borderRadius: 12, padding: "14px",
                  cursor: bed.status === "Occupied" ? "pointer" : "default",
                  transition: "transform 0.15s",
                  boxShadow: bed.status === "Occupied" ? "0 2px 8px rgba(0,0,0,0.04)" : "none",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ fontWeight: 800, fontSize: 16, color: cfg.color }}>Bed {bed.bed}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, background: cfg.color, color: "#fff", padding: "2px 8px", borderRadius: 12 }}>
                    {cfg.label}
                  </div>
                </div>

                {bed.status === "Occupied" && patient && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#1e293b", display: "flex", alignItems: "center", gap: 5 }}>
                      <User size={14} color="#64748b" /> {patient.name}
                    </div>
                    <div style={{ display: "flex", gap: 8, fontSize: 11, color: "#475569" }}>
                      <span style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: 4 }}>Age: {patient.age}</span>
                      <span style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: 4 }}>{patient.gender}</span>
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#1e293b", marginTop: 4 }}>
                      <Activity size={12} color="#e53e3e" style={{ verticalAlign: "middle", marginRight: 4 }} /> 
                      HR: {patient.hr} · SpO₂: {patient.spo2}%
                    </div>
                    {freeingSoon && (
                      <div style={{ marginTop: 8, fontSize: 10, fontWeight: 800, color: "#059669", background: "#d1fae5", padding: "4px 8px", borderRadius: 6, display: "inline-block", textAlign: "center" }}>
                        ✨ AI Prediction: Discharging Soon
                      </div>
                    )}
                  </div>
                )}
                
                {bed.status === "Available" && (
                  <div style={{ fontSize: 12, color: "#16a34a", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                    <CheckCircle2 size={14} /> Ready for admission
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Patient Detail Modal */}
        {selectedBed && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
            <div style={{ background: "#fff", borderRadius: 16, width: 400, padding: 24, position: "relative" }}>
              <button onClick={() => setSelectedBed(null)} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer" }}>
                <X size={20} color="#64748b" />
              </button>
              
              {(() => {
                const pat = patients.find(p => p.id === selectedBed.patient_id);
                if (!pat) return <div>Patient data not found.</div>;
                return (
                  <div>
                    <h3 style={{ margin: "0 0 16px 0", fontSize: 18, color: "#1e293b", display: "flex", alignItems: "center", gap: 8 }}>
                      <User color={WARD_COLOR} /> {pat.name}
                    </h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                      <div style={{ background: "#f8fafc", padding: 10, borderRadius: 8 }}>
                        <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>Room / Bed</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>{selectedBed.room} / {selectedBed.bed}</div>
                      </div>
                      <div style={{ background: "#f8fafc", padding: 10, borderRadius: 8 }}>
                        <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>Diagnosis</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{pat.diagnosis || "N/A"}</div>
                      </div>
                    </div>
                    
                    <div style={{ background: "#fff5f5", border: "1px solid #fecaca", padding: 12, borderRadius: 8 }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: "#e53e3e", marginBottom: 8, textTransform: "uppercase" }}>Current Vitals</div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <div><span style={{ fontSize: 10, color: "#64748b" }}>HR:</span> <span style={{ fontWeight: 700 }}>{pat.hr} bpm</span></div>
                        <div><span style={{ fontSize: 10, color: "#64748b" }}>BP:</span> <span style={{ fontWeight: 700 }}>{pat.bp}</span></div>
                        <div><span style={{ fontSize: 10, color: "#64748b" }}>SpO₂:</span> <span style={{ fontWeight: 700 }}>{pat.spo2}%</span></div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render Room Overview
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ fontWeight: 800, fontSize: 16, display: "flex", alignItems: "center", gap: 7, color: "#1e293b" }}>
        <Bed size={18} color={WARD_COLOR} /> Room Dashboard
      </div>

      {/* Summary pills */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {[
          { label: "Total Beds", val: rawBeds.length, color: "#2f92d0", bg: "#eff6ff" },
          { label: "Occupied",  val: bedCount.occupied, color: "#e53e3e", bg: "#fff5f5" },
          { label: "Available", val: bedCount.total - bedCount.occupied, color: "#16a34a", bg: "#f0fdf4" },
        ].map(p => (
          <div key={p.label} style={{ background: p.bg, borderRadius: 12, padding: "12px 20px", textAlign: "center", flex: 1, minWidth: 100 }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: p.color }}>{p.val}</div>
            <div style={{ fontSize: 10, fontWeight: 800, color: "#94a3b8", letterSpacing: 0.5, textTransform: "uppercase", marginTop: 4 }}>{p.label}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 13, fontWeight: 700, color: "#64748b", marginTop: 10 }}>Select a room to view beds:</div>

      {/* Room Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
        {rooms.map(room => {
          const isFull = room.occupied === room.total;
          const isEmpty = room.occupied === 0;
          return (
            <div key={room.name} 
              onClick={() => setSelectedRoom(room.name)}
              style={{
                background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "16px",
                cursor: "pointer", transition: "all 0.2s",
                boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
                borderLeft: `4px solid ${isFull ? "#e53e3e" : isEmpty ? "#16a34a" : "#d97706"}`
              }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontWeight: 800, fontSize: 18, color: "#1e293b" }}>{room.name}</div>
                <div style={{ background: "#f8fafc", color: "#64748b", padding: "4px 8px", borderRadius: 8, fontSize: 11, fontWeight: 700 }}>
                  {room.ward}
                </div>
              </div>
              
              <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#475569" }}>
                <Users size={14} color="#94a3b8" />
                {room.occupied} / {room.total} Occupied
              </div>
              
              <div style={{ marginTop: 10, height: 6, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ 
                  height: "100%", 
                  width: `${(room.occupied / room.total) * 100}%`,
                  background: isFull ? "#e53e3e" : "#d97706",
                  borderRadius: 4 
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
