import { useState, useEffect } from "react";
import NotificationBell from "../components/NotificationBell";

const CSS = `
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --deep-lilac-50: #f4eef6;
  --deep-lilac-100: #e8ddee;
  --deep-lilac-200: #d1bbdd;
  --deep-lilac-300: #ba99cc;
  --deep-lilac-400: #a377bb;
  --deep-lilac-500: #8c55aa;
  --deep-lilac-600: #704488;
  --deep-lilac-700: #543366;
  --deep-lilac-800: #382244;
  --deep-lilac-900: #1c1122;
  --deep-lilac-950: #140c18;
  
}

body {
  font-family: 'Inter', sans-serif;
  background: #fdf7ff;
  color: #1d1b20;
}

.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  display: inline-block;
  line-height: 1;
}

.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(24px);
}

.id-monolith {
  font-family: 'JetBrains Mono', monospace;
}

.lab-root {
  display: flex;
  min-height: 100vh;
  background: #fdf7ff;
  position: relative;
}

.sidebar {
  width: 256px;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  background: #f8f2fa;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  gap: 0.5rem;
  border-right: 1px solid #e6e1e8;
  overflow-y: auto;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  z-index: 100;
}

.sidebar.open {
  transform: translateX(0);
}

.sidebar-header {
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.sidebar-header:hover {
  opacity: 0.8;
}

.sidebar-icon {
  width: 40px;
  height: 40px;
  background: var(--deep-lilac-500);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.sidebar-title {
  font-size: 1.125rem;
  font-weight: 900;
  color: #543366;
  line-height: 1;
}

.sidebar-subtitle {
  font-size: 0.625rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #4d444f;
  font-weight: 700;
}

.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  margin: 0 0.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  background: none;
  font-family: 'Inter', sans-serif;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--deep-lilac-500);
}

.nav-item:hover {
  background: rgba(140, 85, 170, 0.08);
  transform: scale(1.02);
}

.nav-item.active {
  background: #f2ecf4;
  color: #543366;
  font-weight: 600;
}

.nav-bottom {
  border-top: 1px solid rgba(84, 51, 102, 0.1);
  padding-top: 1rem;
  margin-top: auto;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 100vh;
  overflow: hidden;
}

.topbar {
  width: 100%;
  position: sticky;
  top: 0;
  z-index: 50;
  background: linear-gradient(135deg, var(--deep-lilac-600), var(--deep-lilac-700));
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  height: 64px;
  box-shadow: 0 4px 12px rgba(112, 68, 136, 0.2);
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.topbar-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  letter-spacing: -0.02em;
}

.topbar-stats {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 2rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
}

.stat-dot {
  width: 4px;
  height: 4px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.time-display {
  text-align: right;
  display: none;
}

@media (min-width: 640px) {
  .time-display {
    display: block;
  }
}

.time-main {
  font-size: 0.75rem;
  font-weight: 700;
  color: white;
}

.time-date {
  font-size: 0.625rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: rgba(255, 255, 255, 0.7);
}

.icon-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.2s;
  color: white;
  font-size: 1.25rem;
}

.icon-btn:hover {
  background: rgba(255, 255, 255, 0.25);
}

.profile-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1.5rem;
}

.card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.25rem;
  border: 1px solid #e6e1e8;
  transition: all 0.2s;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.card-title {
  font-weight: 700;
  color: var(--deep-lilac-600);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stat-bar {
  height: 0.375rem;
  background: #e6e1e8;
  border-radius: 9999px;
  overflow: hidden;
}

.stat-bar-fill {
  height: 100%;
  border-radius: 9999px;
  transition: width 0.3s ease;
}

.section-left {
  grid-column: span 12;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1.5rem;
}

@media (min-width: 1024px) {
  .section-left {
    grid-column: span 4;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
}

.section-center {
  grid-column: span 12;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1.5rem;
}

@media (min-width: 1024px) {
  .section-center {
    grid-column: span 4;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
}

.section-right {
  grid-column: span 12;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1.5rem;
}

@media (min-width: 1024px) {
  .section-right {
    grid-column: span 4;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
}

.critical-card {
  background: rgba(186, 26, 26, 0.06);
  border: 1px solid rgba(186, 26, 26, 0.15);
}

.error-text {
  color: #ba1a1a;
}

.table-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e6e1e8;
  font-size: 0.875rem;
}

.table-row:last-child {
  border-bottom: none;
}

.btn-primary {
  background: var(--deep-lilac-600);
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  border: none;
  font-weight: 700;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: var(--deep-lilac-700);
  transform: translateY(-1px);
}

.status-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.status-item {
  background: #fdf7ff;
  padding: 0.75rem;
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.status-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #4d444f;
  letter-spacing: 0.05em;
}

.status-value {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--deep-lilac-600);
  font-family: 'JetBrains Mono', monospace;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  box-shadow: 0 0 8px currentColor;
}

.status-dot.green {
  background: #22c55e;
  color: #22c55e;
}

.status-dot.yellow {
  background: #eab308;
  color: #eab308;
}

.status-dot.red {
  background: #ef4444;
  color: #ef4444;
}

.footer {
  height: 40px;
  background: #f2ecf4;
  display: flex;
  align-items: center;
  padding: 0 1.5rem;
  justify-content: space-between;
  border-top: 1px solid #e6e1e8;
  font-size: 0.75rem;
  font-weight: 700;
  color: #4d444f;
}

.footer-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.footer-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.ai-agent-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem 0;
}

.ai-agent-line {
  width: 4px;
  border-radius: 9999px;
}

.ai-agent-content p {
  font-size: 0.75rem;
  line-height: 1.4;
}

.ai-agent-title {
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.analysis-tracker-row {
  margin-bottom: 1.5rem;
}

.analysis-tracker-row:last-child {
  margin-bottom: 0;
}

.progress-bars {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.25rem;
  margin: 0.75rem 0;
}

.progress-bar-small {
  flex: 1;
  height: 0.5rem;
  background: #e6e1e8;
  border-radius: 9999px;
  overflow: hidden;
}

.progress-bar-small.filled {
  background: var(--deep-lilac-600);
}
`;

export default function Laboratory() {
  const [activeNav, setActiveNav] = useState("Overview");
  const [time, setTime] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [tests, setTests] = useState([]);
  const [stats, setStats] = useState({ Pending: 0, 'In Progress': 0, Completed: 0, Flagged: 0 });

  const fetchLabData = async () => {
    try {
      const testsRes = await fetch("http://localhost:8000/api/lab/tests");
      const testsData = await testsRes.json();
      setTests(testsData.tests || []);

      const statsRes = await fetch("http://localhost:8000/api/lab/stats");
      const statsData = await statsRes.json();
      setStats(statsData);
    } catch (e) {
      console.error("Failed to fetch lab data", e);
    }
  };

  useEffect(() => {
    fetchLabData();
    const t = setInterval(fetchLabData, 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const timeStr = time.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const dateStr = time.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <>
      <style>{CSS}</style>
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.3)",
            zIndex: 99,
          }}
        ></div>
      )}
      <div className="lab-root">
        {/* SIDEBAR */}
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="sidebar-header" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <div className="sidebar-icon">
              <span className="material-symbols-outlined">biotech</span>
            </div>
            <div>
              <h2 className="sidebar-title">Core Lab</h2>
              <p className="sidebar-subtitle">Unit 7B</p>
            </div>
          </div>

          <nav className="sidebar-nav">
            {["Overview", "Specimens", "Instruments", "AI Insights", "Archive"].map(
              (item) => (
                <button
                  key={item}
                  className={`nav-item ${activeNav === item ? "active" : ""}`}
                  onClick={() => setActiveNav(item)}
                >
                  <span className="material-symbols-outlined">
                    {item === "Overview"
                      ? "dashboard"
                      : item === "Specimens"
                        ? "biotech"
                        : item === "Instruments"
                          ? "precision_manufacturing"
                          : item === "AI Insights"
                            ? "psychology"
                            : "history"}
                  </span>
                  <span>{item}</span>
                </button>
              )
            )}
          </nav>

          <div className="nav-bottom">
            <button className="nav-item">
              <span className="material-symbols-outlined">help</span>
              <span>Support</span>
            </button>
            <button className="nav-item">
              <span className="material-symbols-outlined">logout</span>
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <div className="main-container">
          {/* TOPBAR */}
          <header className="topbar">
            <div className="topbar-left">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="icon-btn"
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  marginRight: "1rem",
                }}
              >
                <span className="material-symbols-outlined">menu</span>
              </button>
              <h1 className="topbar-title">🔬 Laboratory Command (Violet Zone)</h1>
              <div className="topbar-stats">
                <span>Pending: {stats.Pending || 0}</span>
                <div className="stat-dot"></div>
                <span>In Progress: {stats['In Progress'] || 0}</span>
                <div className="stat-dot"></div>
                <span>Completed: {stats.Completed || 0}</span>
              </div>
            </div>
            <div className="topbar-right">
              <div className="time-display">
                <p className="time-main">{timeStr}</p>
                <p className="time-date">{dateStr.toUpperCase()}</p>
              </div>
              <NotificationBell />
              <button className="icon-btn">
                <span className="material-symbols-outlined">settings</span>
              </button>
              <img
                alt="Pathologist Profile"
                className="profile-img"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0W8Ma_DZcuR_XbG29FgXkgr1LtS33aGCLiZMOFhWjzgYDPJ1atFK0heknHoISDiXo8H2ywroFo03HlkluyiwueEo0md1oAwOsdrNWXfHdbkISdmulHNhXqtu9GaixQF0tG09nTOhlMlS0XQSHT4SNGMEmUyq05RQ51u9M_Cz7ZT9iTlNj5uBKgNBt00n1OcCHz1vpe0nrAe3ptS7yKfd5xhumGs3d6ORM1VYG9CC0WQ-3KY5UzaCm5toYQtTO8cbNrBxV07Kam1E"
              />
            </div>
          </header>

          {/* CONTENT GRID */}
          <div className="content">
            {/* LEFT COLUMN */}
            <section className="section-left">
              {/* STAT Orders */}
              <div className="card">
                <h3 className="card-title">
                  <span className="material-symbols-outlined">priority_high</span>
                  STAT Orders
                </h3>
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                  <span
                    style={{
                      fontSize: "0.625rem",
                      fontWeight: "700",
                      background: "rgba(186, 26, 26, 0.15)",
                      color: "#ba1a1a",
                      padding: "0.25rem 0.5rem",
                      borderRadius: "9999px",
                    }}
                  >
                    {tests.filter(t => t.priority === 'Stat' && t.status !== 'Completed').length} CRITICAL
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {tests.filter(t => t.priority === 'Stat' && t.status !== 'Completed').slice(0,3).map((item, i) => (
                    <div key={item.id} className="glass-card" style={{ padding: "1rem", borderRadius: "0.5rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: "900" }}>
                          {item.patient_name} — <span style={{ color: "var(--deep-lilac-600)" }}>{item.patient_room}</span>
                        </span>
                        <span style={{ fontSize: "0.625rem", fontFamily: "monospace", color: "#4d444f" }}>
                          {item.status}
                        </span>
                      </div>
                      <p style={{ fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.75rem" }}>
                        {item.test_name}
                      </p>
                      <div className="stat-bar">
                        <div
                          className="stat-bar-fill"
                          style={{
                            width: item.status === 'In Progress' ? '50%' : '10%',
                            background: item.status === 'In Progress' ? "var(--deep-lilac-600)" : "#ba1a1a",
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                  {tests.filter(t => t.priority === 'Stat' && t.status !== 'Completed').length === 0 && (
                     <div style={{ padding: "1rem", textAlign: "center", fontSize:"0.875rem", color:"gray" }}>No active STAT orders</div>
                  )}
                </div>
              </div>

              {/* Sample Collection */}
              <div className="card">
                <h3 className="card-title">
                  <span className="material-symbols-outlined">vaccines</span>
                  Sample Collection
                </h3>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", textAlign: "left", fontSize: "0.75rem" }}>
                    <thead style={{ borderBottom: "1px solid #e6e1e8", color: "#4d444f" }}>
                      <tr>
                        <th style={{ padding: "0.5rem 0", fontWeight: "700" }}>Room</th>
                        <th style={{ padding: "0.5rem 0", fontWeight: "700" }}>Patient</th>
                        <th style={{ padding: "0.5rem 0", fontWeight: "700" }}>Test</th>
                        <th style={{ padding: "0.5rem 0", fontWeight: "700", textAlign: "right" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody style={{ borderTop: "1px solid #e6e1e8" }}>
                      {tests.filter(t => t.status === 'Pending').slice(0,5).map((row, i) => (
                        <tr key={row.id} style={{ borderBottom: "1px solid #e6e1e8" }}>
                          <td style={{ padding: "0.75rem 0", fontFamily: "monospace" }}>{row.patient_room}</td>
                          <td style={{ padding: "0.75rem 0" }}>{row.patient_name}</td>
                          <td style={{ padding: "0.75rem 0" }}>{row.test_name}</td>
                          <td style={{ padding: "0.75rem 0", textAlign: "right" }}>
                            <button onClick={() => {
                               fetch(`http://localhost:8000/api/lab/tests/${row.id}`, {
                                 method: 'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({status:'In Progress'})
                               }).then(fetchLabData);
                            }} className="btn-primary">COLLECT</button>
                          </td>
                        </tr>
                      ))}
                      {tests.filter(t => t.status === 'Pending').length === 0 && (
                        <tr><td colSpan="4" style={{padding:'1rem',textAlign:'center',color:'gray'}}>No pending collections</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* CENTER COLUMN */}
            <section className="section-center">
              {/* Active Analysis Tracker */}
              <div className="card">
                <h3 className="card-title">
                  <span className="material-symbols-outlined">query_stats</span>
                  Active Analysis Tracker
                </h3>

                {tests.filter(t => t.status === 'In Progress').slice(0,4).map((lab, i) => (
                  <div key={lab.id} className="analysis-tracker-row">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <span style={{ fontSize: "0.625rem", fontWeight: "900", textTransform: "uppercase", color: "#4d444f" }}>
                        {lab.patient_name} — {lab.test_name}
                      </span>
                      <span
                        style={{
                          fontSize: "0.625rem",
                          fontFamily: "monospace",
                          background: "#f2ecf4",
                          padding: "0.25rem 0.5rem",
                          borderRadius: "0.25rem",
                        }}
                      >
                        {lab.test_type}
                      </span>
                    </div>
                    <div className="progress-bars">
                       <div className="progress-bar-small filled"></div>
                       <div className="progress-bar-small filled"></div>
                       <div className="progress-bar-small"></div>
                       <div className="progress-bar-small"></div>
                       <div className="progress-bar-small"></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: "0.625rem", fontWeight: "600", color: "var(--deep-lilac-600)" }}>
                        PROCESSING
                      </span>
                      <button onClick={() => {
                        fetch(`http://localhost:8000/api/lab/tests/${lab.id}`, {
                          method: 'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({status:'Completed', result:'Normal Result'})
                        }).then(fetchLabData);
                      }} className="btn-primary" style={{ padding: "0.2rem 0.5rem", fontSize: "0.65rem" }}>MARK DONE</button>
                    </div>
                  </div>
                ))}
                {tests.filter(t => t.status === 'In Progress').length === 0 && (
                   <div style={{ padding: "1rem", textAlign: "center", fontSize:"0.875rem", color:"gray" }}>No tests currently processing</div>
                )}
              </div>

              {/* Instrument Grid */}
              <div className="card">
                <h3 className="card-title">
                  <span className="material-symbols-outlined">settings_input_component</span>
                  Instrument Grid
                </h3>
                <div className="status-grid">
                  {[
                    { name: "Hematology\nAnalyzer A1", status: "LOAD: 82%", dot: "green" },
                    { name: "Flow\nCytometer", status: "CALIBRATION DUE", dot: "yellow" },
                    { name: "HPLC\nUnit 4", status: "READY", dot: "green" },
                    { name: "Spectro\nScanner", status: "ERROR: E-022", dot: "red" },
                  ].map((item, i) => (
                    <div key={i} className="status-item">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: "700", lineHeight: "1.2" }}>
                          {item.name}
                        </span>
                        <div className={`status-dot ${item.dot}`}></div>
                      </div>
                      <p className="status-value" style={{ fontSize: "0.7rem", color: item.dot === "red" ? "#ba1a1a" : "var(--deep-lilac-600)" }}>
                        {item.status}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* RIGHT COLUMN */}
            <section className="section-right">
              {/* Critical Values */}
              <div className="card critical-card">
                <h3 className="card-title error-text">
                  <span className="material-symbols-outlined">warning</span>
                  Critical Values
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {[
                    { label: "Potassium (K+)", value: "6.8", unit: "mmol/L" },
                    { label: "Glucose", value: "24", unit: "mg/dL" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      style={{
                        background: "rgba(255, 255, 255, 0.8)",
                        borderRadius: "0.5rem",
                        padding: "0.75rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <p style={{ fontSize: "0.625rem", fontWeight: "900", color: "#4d444f", textTransform: "uppercase" }}>
                          {item.label}
                        </p>
                        <p style={{ fontSize: "1.125rem", fontWeight: "900", color: "#ba1a1a", fontFamily: "monospace" }}>
                          {item.value} <span style={{ fontSize: "0.75rem" }}>{item.unit}</span>
                        </p>
                      </div>
                      <button style={{ background: "#ba1a1a", color: "white", fontSize: "0.625rem", fontWeight: "700", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "none", cursor: "pointer" }}>
                        NOTIFY CLINICIAN
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chain Verification & AI Activity */}
              <div className="card">
                <div style={{ marginBottom: "1.5rem" }}>
                  <h3 className="card-title">
                    <span className="material-symbols-outlined">verified_user</span>
                    Chain Verification
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem", background: "#fdf7ff", borderRadius: "0.5rem" }}>
                    <span className="material-symbols-outlined" style={{ color: "var(--deep-lilac-600)" }}>
                      shield
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: "0.625rem", fontWeight: "700", color: "#1d1b20" }}>Histopathology Verified</p>
                      <p style={{ fontSize: "0.7rem", fontFamily: "monospace", color: "#7e7480", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        0x72a...8c55aa
                      </p>
                    </div>
                  </div>
                </div>

                <h3 className="card-title">
                  <span className="material-symbols-outlined">smart_toy</span>
                  AI Agent Activity
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.75rem" }}>
                  {[
                    { title: "Triage Agent", text: "Elevating Specimen #V-8840 to Priority STAT based on clinical history.", color: "var(--deep-lilac-600)" },
                    { title: "Decision Support", text: "Suspected Leucocytosis. Suggesting Peripheral Smear verification.", color: "#555800" },
                  ].map((item, i) => (
                    <div key={i} className="ai-agent-item">
                      <div className="ai-agent-line" style={{ background: item.color }}></div>
                      <div className="ai-agent-content">
                        <p className="ai-agent-title" style={{ color: item.color }}>
                          {item.title}
                        </p>
                        <p style={{ color: "#4d444f", lineHeight: "1.4" }}>{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Blood Bank Status */}
              <div className="card">
                <h3 className="card-title">
                  <span className="material-symbols-outlined">bloodtype</span>
                  Blood Bank Status
                </h3>
                <div className="status-grid" style={{ marginBottom: "1rem" }}>
                  {[
                    { label: "O-Negative", value: "12" },
                    { label: "A-Positive", value: "48" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "0.75rem",
                        background: "rgba(255, 255, 255, 0.5)",
                        borderRadius: "0.5rem",
                        textAlign: "center",
                      }}
                    >
                      <p className="status-label">{item.label}</p>
                      <p style={{ fontSize: "1.25rem", fontWeight: "900", color: "var(--deep-lilac-600)" }}>
                        {item.value} <span style={{ fontSize: "0.625rem", fontWeight: "500" }}>Units</span>
                      </p>
                    </div>
                  ))}
                </div>
                <div style={{ padding: "0.75rem", background: "rgba(186, 26, 26, 0.1)", borderRadius: "0.5rem", border: "1px solid rgba(186, 26, 26, 0.15)" }}>
                  <p style={{ fontSize: "0.625rem", fontWeight: "900", color: "#ba1a1a", textTransform: "uppercase", marginBottom: "0.25rem" }}>
                    Active Crossmatch
                  </p>
                  <p style={{ fontSize: "0.75rem", fontWeight: "500" }}>Mrs. Sharma (OT Silver) — Urgent</p>
                </div>
              </div>
            </section>
          </div>

          {/* FOOTER */}
          <footer className="footer">
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              {[
                { label: "Connected to: OT Silver", color: "var(--deep-lilac-600)" },
                { label: "Nursing Blue", color: "#3b82f6" },
                { label: "Pharmacy Orange", color: "#f97316" },
              ].map((item, i) => (
                <div key={i} className="footer-item">
                  <div className="footer-dot" style={{ background: item.color }}></div>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
            <div style={{ fontFamily: "monospace", fontSize: "0.7rem" }}>
              SECURE HANDSHAKE V3.2 // NODES: 14/14 ACTIVE
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}