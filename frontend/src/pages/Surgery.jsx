import { useState, useEffect } from "react";
import NotificationBell from "../components/NotificationBell";

export default function Surgery() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [otStatus, setOtStatus] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  const fetchData = async () => {
    try {
      const [otRes, schedRes, auditRes] = await Promise.all([
        fetch("http://localhost:8000/api/surgery/ot-status"),
        fetch("http://localhost:8000/api/surgery/schedule"),
        fetch("http://localhost:8000/api/blockchain/events")
      ]);
      const otData = await otRes.json();
      const schedData = await schedRes.json();
      const auditData = await auditRes.json();
      setOtStatus(otData.ot_status || []);
      setSchedule(schedData.surgeries || []);
      setAuditLogs(auditData.events || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
    const t = setInterval(fetchData, 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

        * { box-sizing: border-box; }
        html, body, #root { height: 100%; margin: 0; padding: 0; }
        body {
          background-color: #F2F2F2;
          color: #808080;
          font-family: 'Manrope', sans-serif;
          overflow: hidden;
        }
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          font-family: 'Material Symbols Outlined';
        }
        .glass-panel {
          background: rgba(230, 230, 230, 0.4);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
        }
        .ghost-border {
          border: 1px solid #CCCCCC;
        }
        .critical-pulse {
          animation: pulse-gray 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse-gray {
          0%, 100% { opacity: 1; }
          50% { opacity: .7; }
        }

        /* Layout */
        .app-shell { display: flex; height: 100vh; overflow: hidden; }

        /* Sidebar slide-in */
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          width: 16rem;
          padding: 1rem;
          gap: 0.5rem;
          background-color: #F2F2F2;
          border-right: 1px solid #CCCCCC;
          display: flex;
          flex-direction: column;
          z-index: 60;
          transform: translateX(-100%);
          transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .sidebar.open { transform: translateX(0); }

        .sidebar-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.25);
          backdrop-filter: blur(2px);
          z-index: 55;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }
        .sidebar-backdrop.show { opacity: 1; pointer-events: auto; }

        .main { flex: 1; display: flex; flex-direction: column; height: 100vh; overflow: hidden; }

        /* Top header */
        .top-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          padding: 0 1.5rem;
          height: 4rem;
          background: rgba(242,242,242,0.8);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-bottom: 1px solid #CCCCCC;
        }

        .silver-zone-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.25rem 0.5rem;
          border-radius: 0.5rem;
          cursor: pointer;
          background: transparent;
          border: none;
          transition: background 0.2s;
        }
        .silver-zone-btn:hover { background: #E6E6E6; }

        .icon-square {
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 0.25rem;
          background: #333333;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 0.75rem;
          color: #808080;
          text-decoration: none;
          border-radius: 0.25rem;
          transition: all 0.2s;
        }
        .nav-link:hover { color: #333333; }
        .nav-link.active {
          color: #333333;
          background: #E6E6E6;
        }
        .nav-label {
          font-family: 'Manrope', sans-serif;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.15em;
          font-weight: 700;
        }
        .section-label {
          padding: 0 0.5rem;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          font-size: 10px;
          letter-spacing: 0.15em;
          font-weight: 700;
          color: #999999;
        }

        .top-link {
          font-family: 'Manrope', sans-serif;
          font-weight: 500;
          color: #808080;
          text-decoration: none;
          transition: color 0.2s;
        }
        .top-link:hover { color: #333333; }
        .top-link.active {
          font-weight: 700;
          color: #333333;
          border-bottom: 2px solid #333333;
        }

        .content {
          flex: 1;
          padding: 1.5rem;
          overflow-y: auto;
        }
        .content > * + * { margin-top: 1.5rem; }

        .grid-12 { display: grid; grid-template-columns: repeat(12, minmax(0,1fr)); gap: 1.5rem; }
        @media (max-width: 1024px) {
          .col-lg-8, .col-lg-4 { grid-column: span 12 / span 12; }
        }
        @media (min-width: 1024px) {
          .col-lg-8 { grid-column: span 8 / span 8; }
          .col-lg-4 { grid-column: span 4 / span 4; }
        }

        .grid-5 { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 0.75rem; }
        @media (min-width: 768px) {
          .grid-5 { grid-template-columns: repeat(5, minmax(0,1fr)); }
        }

        .grid-2 { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
        @media (min-width: 768px) {
          .grid-2 { grid-template-columns: repeat(2, minmax(0,1fr)); }
        }

        .grid-3 { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
        @media (min-width: 1024px) {
          .grid-3 { grid-template-columns: repeat(3, minmax(0,1fr)); }
          .col-lg-2 { grid-column: span 2 / span 2; }
        }

        .grid-actions {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }
        @media (min-width: 768px) {
          .grid-actions { grid-template-columns: repeat(4, minmax(0,1fr)); }
          .col-md-3 { grid-column: span 3 / span 3; }
        }

        .actions-inner {
          display: grid;
          grid-template-columns: repeat(2, minmax(0,1fr));
          gap: 1rem;
        }
        @media (min-width: 768px) {
          .actions-inner { grid-template-columns: repeat(4, minmax(0,1fr)); }
        }

        .ot-card {
          padding: 1rem;
          border-radius: 0.25rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 8rem;
        }

        .dot { width: 0.5rem; height: 0.5rem; border-radius: 9999px; }

        .alert-card {
          padding: 1rem;
          border-radius: 0.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          color: white;
        }

        .icon-btn {
          background: rgba(255,255,255,0.1);
          padding: 0.5rem;
          border-radius: 0.125rem;
          border: none;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .icon-btn:hover { background: rgba(255,255,255,0.2); }

        table { width: 100%; text-align: left; border-collapse: collapse; font-size: 0.875rem; }
        thead { border-bottom: 1px solid #CCCCCC; }
        th { padding-bottom: 0.75rem; font-weight: 700; color: #333333; }
        tbody tr { border-bottom: 1px solid #E6E6E6; }
        tbody tr:last-child { border-bottom: none; }
        td { padding: 1rem 0; }

        .badge {
          display: inline-block;
          padding: 0.125rem 0.5rem;
          border-radius: 0.125rem;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .equip-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem;
          background: #E6E6E6;
          border-radius: 0.125rem;
        }

        .audit-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.5rem 0;
          border-bottom: 1px solid #CCCCCC;
        }

        .ai-row {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }
        .ai-icon-circle {
          width: 2rem;
          height: 2rem;
          border-radius: 9999px;
          background: #E6E6E6;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .qa-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 1rem;
          border-radius: 0.25rem;
          cursor: pointer;
          transition: all 0.2s;
          background: rgba(230, 230, 230, 0.4);
          backdrop-filter: blur(24px);
          border: 1px solid #CCCCCC;
        }
        .qa-btn:hover { background: #333333; }
        .qa-btn:hover * { color: white !important; }

        .new-procedure-btn {
          width: 100%;
          margin-bottom: 1rem;
          padding: 0.75rem;
          background: #4D4D4D;
          color: white;
          border: none;
          border-radius: 0.125rem;
          cursor: pointer;
          font-family: 'Manrope', sans-serif;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.15em;
          font-weight: 700;
          transition: background 0.2s;
        }
        .new-procedure-btn:hover { background: #333333; }

        .emergency-override {
          background: #1A1A1A;
          color: white;
          padding: 0.375rem 1rem;
          border-radius: 0.125rem;
          font-size: 0.875rem;
          font-weight: 700;
          letter-spacing: -0.01em;
          border: none;
          cursor: pointer;
        }
        .emergency-override:hover { background: #121212; }

        .header-icon-btn {
          padding: 0.5rem;
          color: #B3B3B3;
          background: transparent;
          border: none;
          border-radius: 9999px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .header-icon-btn:hover { background: #E6E6E6; }

        .avatar {
          height: 2rem;
          width: 2rem;
          border-radius: 9999px;
          overflow: hidden;
          border: 1px solid #CCCCCC;
          filter: grayscale(100%);
        }
        .avatar img { height: 100%; width: 100%; object-fit: cover; }
      `}</style>

      <div className="app-shell">
        {/* Backdrop */}
        <div
          className={`sidebar-backdrop ${sidebarOpen ? "show" : ""}`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* SIDE NAV BAR */}
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0 0.5rem", marginBottom: "1.5rem" }}>
            <div className="icon-square">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>shield_with_heart</span>
            </div>
            <div>
              <h2 style={{ fontSize: "1.125rem", fontWeight: 900, color: "#333333", lineHeight: 1.1, margin: 0 }}>Silver Zone</h2>
              <p style={{ margin: 0, textTransform: "uppercase", fontSize: 11, letterSpacing: "0.15em", fontWeight: 700, color: "#999999" }}>OT Sector A-1</p>
            </div>
          </div>

          <nav style={{ flex: 1 }}>
            <div className="section-label">Main Control</div>
            <a href="#" className="nav-link active">
              <span className="material-symbols-outlined">dashboard</span>
              <span className="nav-label">Dashboard</span>
            </a>
            <a href="#" className="nav-link">
              <span className="material-symbols-outlined" style={{ color: "#B3B3B3" }}>clinical_notes</span>
              <span className="nav-label">OT Status</span>
            </a>
            <a href="#" className="nav-link">
              <span className="material-symbols-outlined" style={{ color: "#B3B3B3" }}>groups</span>
              <span className="nav-label">Staffing</span>
            </a>
            <a href="#" className="nav-link">
              <span className="material-symbols-outlined" style={{ color: "#B3B3B3" }}>psychology</span>
              <span className="nav-label">AI Analytics</span>
            </a>
            <a href="#" className="nav-link">
              <span className="material-symbols-outlined" style={{ color: "#B3B3B3" }}>inventory_2</span>
              <span className="nav-label">Inventory</span>
            </a>
          </nav>

          <div style={{ marginTop: "auto" }}>
            <button className="new-procedure-btn">New Procedure</button>
            <a href="#" className="nav-link">
              <span className="material-symbols-outlined" style={{ color: "#B3B3B3" }}>help</span>
              <span className="nav-label">Support</span>
            </a>
            <a href="#" className="nav-link">
              <span className="material-symbols-outlined" style={{ color: "#B3B3B3" }}>history</span>
              <span className="nav-label">Logs</span>
            </a>
          </div>
        </aside>

        {/* MAIN CANVAS */}
        <main className="main">
          {/* TOP NAV BAR */}
          <header className="top-header">
            <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
              <button className="silver-zone-btn" onClick={() => setSidebarOpen(true)}>
                <div className="icon-square">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>shield_with_heart</span>
                </div>
                <div style={{ textAlign: "left" }}>
                  <h2 style={{ fontSize: "1rem", fontWeight: 900, color: "#333333", lineHeight: 1.1, margin: 0 }}>Silver Zone</h2>
                  <p style={{ margin: 0, textTransform: "uppercase", fontSize: 10, letterSpacing: "0.15em", fontWeight: 700, color: "#999999" }}>OT Sector A-1</p>
                </div>
              </button>

              <h1 style={{ fontSize: "1.25rem", fontWeight: 800, letterSpacing: "-0.02em", color: "#333333", margin: 0 }}>OT Command Center</h1>

              <div style={{ display: "flex", gap: "1.5rem" }} className="hidden-md">
                <a href="#" className="top-link">Live Feeds</a>
                <a href="#" className="top-link">Surgical Schedule</a>
                <a href="#" className="top-link active">Alert Logs</a>
              </div>
            </div>

              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <button className="emergency-override">Emergency Override</button>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <NotificationBell />
                <button className="header-icon-btn"><span className="material-symbols-outlined">settings</span></button>
              </div>
              <div className="avatar">
                <img alt="Chief Surgeon" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCNTZT5aQ_ZfgPyolGwqDTFDj2a_s2udB83KqWcdBcWa9A-_L4hVqZ5-qnpeMTtMoLCWq9GG6-FQ-8sII33YV-9QUU5C9CzQKAwpMh00kC__8CqTzomee7VqpV2-ynkZxahKIY24LVbWcwHUXK6Di3Fg39PPlJq5u-clrAO7EhtFYYUnue3trwRGbvWSZVSeB6jV2QydGKpTdO7UQRjQO3Mi-6VLR-sC8aDmXqYGVeMPfbc0NftDxLo-Ce-21eqTCVxFNodQwQ-pjE" />
              </div>
            </div>
          </header>

          {/* DASHBOARD CONTENT */}
          <div className="content">
            {/* SECTION 1 & 2 */}
            <div className="grid-12">
              {/* Live OT Status Grid */}
              <section className="col-lg-8" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <h3 style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "#999999", margin: 0 }}>Live OT Status Grid</h3>
                  <span style={{ fontSize: 10, fontFamily: "monospace", color: "#B3B3B3" }}>REAL-TIME TELEMETRY ACTIVE</span>
                </div>
                <div className="grid-5">
                  {otStatus.map((ot) => (
                    <div key={ot.room} className="glass-panel ghost-border ot-card">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <span style={{ fontSize: "0.875rem", fontWeight: 900, color: "#333333" }}>{ot.room}</span>
                        <div className={`dot ${ot.status === 'In Progress' ? "critical-pulse" : ""}`} 
                             style={{ background: ot.status === 'In Progress' ? "#ba1a1a" : ot.status === 'Scheduled' ? "#eab308" : "#22c55e" }} />
                      </div>
                      <div>
                        <p style={{ fontSize: 10, textTransform: "uppercase", fontWeight: 700, color: "#999999", margin: "0 0 0.25rem 0" }}>Status</p>
                        <p style={{ fontSize: "0.75rem", fontWeight: 700, color: ot.status === 'In Progress' ? "#ba1a1a" : ot.status === 'Scheduled' ? "#ca8a04" : "#16a34a", margin: 0 }}>
                          {ot.status}
                        </p>
                        {ot.patient && (
                          <p style={{ fontSize: 10, color: "#808080", marginTop: "4px" }}>{ot.patient}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Incoming Surgical Alerts */}
              <section className="col-lg-4" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <h3 style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "#999999", margin: 0 }}>Incoming Alerts</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div className="alert-card" style={{ background: "#1A1A1A" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "1.875rem", color: "#B3B3B3", fontVariationSettings: "'FILL' 1" }}>emergency_home</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 10, textTransform: "uppercase", fontWeight: 700, color: "#999999", margin: 0 }}>Trauma Case</p>
                      <p style={{ fontWeight: 700, margin: 0 }}>ETA 06 MINS</p>
                    </div>
                    <button className="icon-btn"><span className="material-symbols-outlined">chevron_right</span></button>
                  </div>
                  <div className="alert-card" style={{ background: "#4D4D4D" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "1.875rem", color: "#B3B3B3" }}>medical_services</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 10, textTransform: "uppercase", fontWeight: 700, color: "#999999", margin: 0 }}>Appendectomy</p>
                      <p style={{ fontWeight: 700, margin: 0 }}>ETA 22 MINS</p>
                    </div>
                    <button className="icon-btn"><span className="material-symbols-outlined">chevron_right</span></button>
                  </div>
                </div>
              </section>
            </div>

            {/* SECTION 3 & 4 */}
            <div className="grid-2">
              {/* Surgical Team & Staffing */}
              <section className="glass-panel ghost-border" style={{ padding: "1.5rem", borderRadius: "0.5rem" }}>
                <h3 style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "#999999", margin: "0 0 1rem 0" }}>Surgical Team & Staffing</h3>
                <div style={{ overflow: "hidden" }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Staff Member</th>
                        <th>Role</th>
                        <th>Assigned</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schedule.slice(0, 5).map((s) => (
                        <tr key={s.id}>
                          <td style={{ fontWeight: 500, color: "#808080" }}>{s.surgeon_name || 'Unassigned'}</td>
                          <td style={{ color: "#999999" }}>Surgeon</td>
                          <td style={{ color: "#999999" }}>{s.ot_room}</td>
                          <td>
                            <span className="badge" style={{ 
                              background: s.status === 'In Progress' ? "#121212" : "#E6E6E6", 
                              color: s.status === 'In Progress' ? "white" : "#808080",
                              border: s.status === 'In Progress' ? "none" : "1px solid #CCCCCC" 
                            }}>
                              {s.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {schedule.length === 0 && (
                        <tr><td colSpan="4" style={{ textAlign:'center' }}>No scheduled surgeries</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Equipment Readiness */}
              <section className="glass-panel ghost-border" style={{ padding: "1.5rem", borderRadius: "0.5rem" }}>
                <h3 style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "#999999", margin: "0 0 1rem 0" }}>Equipment Readiness</h3>
                <div style={{ display: "grid", gap: "0.75rem" }}>
                  {[
                    { icon: "precision_manufacturing", name: "Da Vinci Xi Robot", sub: "System Check: Optimal", status: "100% READY", statusColor: "#121212" },
                    { icon: "monitor_heart", name: "Ventilator V-402", sub: "Last Calibrated: 2h ago", status: "98% READY", statusColor: "#666666" },
                    { icon: "biotech", name: "Laser Scalpel Mod-9", sub: "Charging Station 4", status: "84% CALIBRATING", statusColor: "#999999" },
                  ].map((eq) => (
                    <div key={eq.name} className="equip-row">
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <span className="material-symbols-outlined" style={{ color: "#B3B3B3" }}>{eq.icon}</span>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: "0.875rem", color: "#333333", margin: 0 }}>{eq.name}</p>
                          <p style={{ fontSize: 10, color: "#999999", margin: 0 }}>{eq.sub}</p>
                        </div>
                      </div>
                      <span style={{ fontSize: "0.75rem", fontFamily: "monospace", fontWeight: 700, color: eq.statusColor }}>{eq.status}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* SECTION 5 & 6 */}
            <div className="grid-3">
              {/* Blockchain Audit Log */}
              <section className="glass-panel ghost-border col-lg-2" style={{ padding: "1.5rem", borderRadius: "0.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <h3 style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "#999999", margin: 0 }}>Blockchain Audit Log</h3>
                  <span style={{ padding: "0.125rem 0.5rem", background: "#121212", color: "white", borderRadius: "0.125rem", fontSize: 9, fontFamily: "monospace" }}>HASH: VERIFIED</span>
                </div>
                <div>
                  {auditLogs.slice(0, 5).map((row) => (
                    <div key={row.id} className="audit-row">
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <span style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#B3B3B3" }}>
                          {new Date(row.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
                        </span>
                        <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "#808080", margin: 0 }}>
                          {row.action}: {row.details.slice(0,30)}
                        </p>
                      </div>
                      <span style={{ fontFamily: "monospace", fontSize: 10, color: "#B3B3B3" }}>
                        {row.tx_hash.slice(0,10)}...
                      </span>
                    </div>
                  ))}
                  {auditLogs.length === 0 && (
                    <div style={{ padding: '1rem', textAlign: 'center' }}>No audit logs found</div>
                  )}
                </div>
              </section>

              {/* AI Agent Activity Log */}
              <section className="glass-panel ghost-border" style={{ padding: "1.5rem", borderRadius: "0.5rem" }}>
                <h3 style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "#999999", margin: "0 0 1rem 0" }}>AI Agent Activity</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {[
                    { icon: "psychology", title: "Triage Engine", txt: "Re-routed trauma case to Sector A-1 (6 min arrival)." },
                    { icon: "local_pharmacy", title: "Pharmacy Bot", txt: "Pre-calculating anaesthesia dosages for Case #995." },
                    { icon: "cleaning_services", title: "Turnover AI", txt: "Cleaning cycle optimized for OT-04 (Duration: 8m)." },
                  ].map((ai) => (
                    <div key={ai.title} className="ai-row">
                      <div className="ai-icon-circle">
                        <span className="material-symbols-outlined" style={{ color: "#666666", fontSize: "1.125rem" }}>{ai.icon}</span>
                      </div>
                      <div>
                        <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#333333", margin: 0 }}>{ai.title}</p>
                        <p style={{ fontSize: 11, color: "#808080", margin: 0 }}>{ai.txt}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* SECTION 7 & 8 */}
            <div className="grid-actions" style={{ paddingBottom: "1.5rem" }}>
              <div className="col-md-3 actions-inner">
                {[
                  { icon: "lock_open", label: "Door Lock" },
                  { icon: "air_purifier", label: "HVAC Flush" },
                  { icon: "call", label: "PA Broadcast" },
                  { icon: "video_chat", label: "Tele-Cons" },
                ].map((qa) => (
                  <button key={qa.label} className="qa-btn">
                    <span className="material-symbols-outlined" style={{ color: "#B3B3B3" }}>{qa.icon}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "#808080" }}>{qa.label}</span>
                  </button>
                ))}
              </div>

              <div className="glass-panel ghost-border" style={{ padding: "1rem", borderRadius: "0.25rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ position: "relative", width: "3rem", height: "3rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="48" height="48" style={{ transform: "rotate(-90deg)" }}>
                    <circle cx="24" cy="24" r="20" fill="transparent" stroke="#CCCCCC" strokeWidth="4" />
                    <circle cx="24" cy="24" r="20" fill="transparent" stroke="#333333" strokeWidth="4" strokeDasharray="125.6" strokeDashoffset="30.2" />
                  </svg>
                  <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, color: "#333333" }}>76%</span>
                </div>
                <div>
                  <h4 style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "#333333", margin: 0 }}>Eco-Efficiency</h4>
                  <p style={{ fontSize: 11, color: "#808080", margin: 0 }}>HVAC Energy Saving active</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}