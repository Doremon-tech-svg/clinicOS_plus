import { useState, useEffect } from "react";

const CSS = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --pink-50: #fff0f6;
  --pink-100: #ffe0ee;
  --pink-200: #ffb3d1;
  --pink-300: #ff80b0;
  --pink-400: #f953a0;
  --pink-500: #e8187e;
  --pink-600: #c4006a;
  --pink-700: #96004f;
  --pink-800: #6a0038;
  --pink-900: #420023;
  --bg: #fff5f9;
  --card: #ffffff;
  --border: rgba(232,24,126,0.13);
  --border-soft: rgba(232,24,126,0.08);
  --shadow: 0 2px 14px rgba(196,0,106,0.08);
  --shadow-lg: 0 8px 32px rgba(196,0,106,0.15);
  --text-primary: #3a0020;
  --text-secondary: #7a2050;
  --text-muted: #b06080;
  --radius: 16px;
  --radius-sm: 10px;
  --sidebar-w: 230px;
}

body { font-family: 'Inter', sans-serif; background: var(--bg); }

/* ── ROOT ── */
.mat-root {
  min-height: 100vh;
  background: var(--bg);
  background-image: radial-gradient(ellipse 70% 35% at 50% -5%, rgba(232,24,126,0.09) 0%, transparent 65%);
  display: flex; flex-direction: column;
  font-family: 'Inter', sans-serif;
  overflow: hidden;
}

/* ── TOPBAR ── */
.mat-topbar {
  height: 56px;
  background: linear-gradient(135deg, var(--pink-600), var(--pink-700));
  backdrop-filter: blur(18px);
  border-bottom: 1px solid rgba(255,255,255,0.2);
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 22px;
  position: sticky; top: 0; z-index: 200;
  box-shadow: 0 4px 16px rgba(196,0,106,0.25);
}
.mat-logo-btn {
  display: flex; align-items: center; gap: 9px; cursor: pointer;
  background: none; border: none; padding: 6px 10px;
  border-radius: 10px; transition: background 0.18s;
}
.mat-logo-btn:hover { background: rgba(255,255,255,0.15); }
.mat-logo-icon {
  width: 32px; height: 32px; border-radius: 9px;
  background: linear-gradient(135deg, var(--pink-400), var(--pink-600));
  display: flex; align-items: center; justify-content: center;
  font-size: 15px; box-shadow: 0 2px 8px rgba(196,0,106,0.3);
  flex-shrink: 0;
}
.mat-logo-title {
  font-family: 'Inter', sans-serif; font-weight: 800; font-size: 1rem;
  color: white; letter-spacing: -0.3px;
}
.mat-logo-subtitle { font-size: 0.68rem; color: rgba(255,255,255,0.8); font-weight: 400; }

.connected-badge {
  display: flex; align-items: center; gap: 6px;
  padding: 5px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 600;
  background: rgba(255,255,255,0.15); color: white;
  border: 1px solid rgba(255,255,255,0.3);
}
.connected-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--pink-400); animation: blink 2s ease-in-out infinite; }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.4} }

.topbar-right { display: flex; align-items: center; gap: 12px; }
.topbar-time { text-align: right; }
.topbar-time-main { font-family: 'Inter', sans-serif; font-size: 1rem; font-weight: 700; color: white; }
.topbar-time-date { font-size: 0.68rem; color: rgba(255,255,255,0.7); }
.top-icon-btn {
  width: 34px; height: 34px; border-radius: 9px; border: 1px solid rgba(255,255,255,0.3);
  background: rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center;
  cursor: pointer; font-size: 14px; transition: all 0.18s; color: white; position: relative;
}
.top-icon-btn:hover { background: rgba(255,255,255,0.25); transform: translateY(-1px); }
.notif-badge {
  position: absolute; top: -3px; right: -3px; width: 16px; height: 16px;
  border-radius: 50%; background: var(--pink-500); color: white;
  font-size: 0.6rem; font-weight: 700; display: flex; align-items: center; justify-content: center;
  border: 1.5px solid white;
}
.avatar-sm {
  width: 32px; height: 32px; border-radius: 50%;
  background: rgba(255,255,255,0.25);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.72rem; font-weight: 700; color: white; cursor: pointer;
  border: 2px solid white; box-shadow: 0 1px 6px rgba(0,0,0,0.25);
}

/* ── LAYOUT ── */
.mat-layout { display: flex; flex: 1; overflow: hidden; height: calc(100vh - 56px); }

/* ── SIDEBAR ── */
.mat-sidebar {
  width: var(--sidebar-w);
  background: rgba(255,255,255,0.97);
  border-right: 1px solid var(--border);
  display: flex; flex-direction: column;
  overflow: hidden;
  flex-shrink: 0;
  transform: translateX(0);
  transition: width 0.32s cubic-bezier(0.4,0,0.2,1), opacity 0.28s ease;
  position: relative;
}
.mat-sidebar.collapsed {
  width: 0;
  opacity: 0;
  pointer-events: none;
}

.sidebar-zone-header {
  padding: 18px 16px 14px;
  border-bottom: 1px solid var(--border-soft);
  display: flex; align-items: center; gap: 10px;
}
.zone-avatar {
  width: 36px; height: 36px; border-radius: 10px;
  background: linear-gradient(135deg, var(--pink-200), var(--pink-400));
  display: flex; align-items: center; justify-content: center; font-size: 18px;
}
.zone-name { font-family: 'Inter', sans-serif; font-weight: 700; font-size: 0.88rem; color: var(--text-primary); }
.zone-sub { font-size: 0.66rem; color: var(--text-muted); letter-spacing: 0.6px; text-transform: uppercase; font-weight: 600; }

.sidebar-nav { padding: 10px 8px; flex: 1; display: flex; flex-direction: column; gap: 2px; }
.nav-item {
  display: flex; align-items: center; gap: 10px; padding: 9px 12px;
  border-radius: 9px; cursor: pointer; transition: all 0.18s;
  border: none; background: none; width: 100%; text-align: left;
  font-family: 'DM Sans', sans-serif; font-size: 0.83rem; font-weight: 500;
  color: var(--text-muted); white-space: nowrap;
}
.nav-item:hover { background: var(--pink-50); color: var(--pink-600); }
.nav-item.active {
  background: linear-gradient(135deg, var(--pink-50), rgba(232,24,126,0.06));
  color: var(--pink-600); font-weight: 700;
  border-left: 3px solid var(--pink-500); padding-left: 9px;
}
.nav-item-icon { font-size: 15px; flex-shrink: 0; }

.sidebar-bottom { padding: 12px 8px; border-top: 1px solid var(--border-soft); }
.new-admission-btn {
  width: 100%; padding: 11px 14px; border-radius: 10px; border: none; cursor: pointer;
  background: linear-gradient(135deg, var(--pink-500), var(--pink-700));
  color: white; font-weight: 700; font-size: 0.82rem; font-family: 'Syne', sans-serif;
  letter-spacing: 0.4px; display: flex; align-items: center; justify-content: center; gap: 7px;
  transition: all 0.22s; box-shadow: 0 3px 12px rgba(196,0,106,0.3);
}
.new-admission-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(196,0,106,0.4); filter: brightness(1.06); }

/* ── MAIN ── */
.mat-main {
  flex: 1; overflow-y: auto; padding: 20px;
  display: flex; flex-direction: column; gap: 18px;
}
.mat-main::-webkit-scrollbar { width: 5px; }
.mat-main::-webkit-scrollbar-thumb { background: var(--pink-200); border-radius: 5px; }

/* ── GRID ── */
.main-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 16px;
  flex: 1;
}

/* ── CARD ── */
.card {
  background: var(--card); border: 1px solid var(--border);
  border-radius: var(--radius); box-shadow: var(--shadow);
  overflow: hidden; transition: box-shadow 0.22s, transform 0.2s;
}
.card:hover { box-shadow: var(--shadow-lg); }
.card-hd {
  padding: 14px 16px 0; display: flex; align-items: center; justify-content: space-between;
}
.card-title {
  font-family: 'Inter', sans-serif; font-weight: 700; font-size: 0.88rem;
  color: var(--text-primary); display: flex; align-items: center; gap: 7px;
}
.card-bd { padding: 12px 16px 16px; }

/* ── BADGE ── */
.badge {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 3px 9px; border-radius: 20px; font-size: 0.68rem; font-weight: 700;
  letter-spacing: 0.4px;
}
.badge-monitoring { background: rgba(249,115,22,0.1); color: #c2410c; border: 1px solid rgba(249,115,22,0.25); }
.badge-room { background: rgba(232,24,126,0.1); color: var(--pink-600); border: 1px solid rgba(232,24,126,0.25); }
.badge-preop { background: rgba(249,115,22,0.1); color: #c2410c; border: 1px solid rgba(249,115,22,0.2); font-size: 0.65rem; }
.badge-scheduled { background: rgba(16,185,129,0.1); color: #065f46; border: 1px solid rgba(16,185,129,0.25); font-size: 0.65rem; }
.badge-immutable { background: rgba(16,185,129,0.1); color: #065f46; border: 1px solid rgba(16,185,129,0.3); font-size: 0.67rem; font-weight: 700; }

/* ── LABOR CARD ── */
.labor-card {
  border: 1px solid var(--border); border-radius: 12px; padding: 12px 14px;
  margin-bottom: 10px; transition: all 0.2s; position: relative; overflow: hidden;
}
.labor-card:hover { border-color: var(--pink-300); box-shadow: 0 2px 12px rgba(196,0,106,0.12); }
.labor-card::before {
  content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
  background: linear-gradient(180deg, var(--pink-400), var(--pink-600));
  border-radius: 3px 0 0 3px;
}
.labor-patient { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.labor-name { font-family: 'Inter', sans-serif; font-weight: 700; font-size: 0.9rem; color: var(--text-primary); }
.labor-vitals { display: flex; gap: 14px; font-size: 0.76rem; color: var(--text-muted); margin-bottom: 8px; }
.vital-item { display: flex; align-items: center; gap: 4px; }
.fhr-section { }
.fhr-label { font-size: 0.66rem; color: var(--text-muted); font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; }
.fhr-value { font-size: 1.2rem; font-weight: 800; color: var(--pink-600); font-family: 'Inter', sans-serif; }
.fhr-bars { display: flex; gap: 3px; align-items: flex-end; height: 24px; margin-top: 4px; }
.fhr-bar {
  width: 5px; border-radius: 3px;
  background: linear-gradient(180deg, var(--pink-400), var(--pink-200));
  animation: fhrAnim 1.2s ease-in-out infinite;
}
@keyframes fhrAnim { 0%,100%{transform:scaleY(0.6)} 50%{transform:scaleY(1)} }
.view-trace-btn {
  display: block; width: 100%; text-align: center; padding: 6px;
  border: 1px solid var(--border); border-radius: 8px; background: none;
  font-size: 0.75rem; font-weight: 600; color: var(--pink-500); cursor: pointer;
  transition: all 0.18s; margin-top: 8px;
}
.view-trace-btn:hover { background: var(--pink-50); border-color: var(--pink-300); }

/* ── EMERGENCY ── */
.emergency-card {
  background: linear-gradient(135deg, #fff0f3, #fff5f9);
  border: 1.5px solid rgba(239,68,68,0.25);
}
.emergency-header {
  padding: 14px 16px 10px; display: flex; align-items: center; gap: 8px;
  border-bottom: 1px solid rgba(239,68,68,0.12);
}
.emergency-label {
  font-family: 'Inter', sans-serif; font-weight: 800; font-size: 0.75rem;
  color: #dc2626; letter-spacing: 1px; text-transform: uppercase;
  animation: pulse-label 1.5s ease-in-out infinite;
}
@keyframes pulse-label { 0%,100%{opacity:1} 50%{opacity:0.6} }
.emergency-body { padding: 14px 16px; }
.eta-huge {
  font-family: 'Inter', sans-serif; font-weight: 800;
  font-size: 3.2rem; color: #dc2626; line-height: 1;
  letter-spacing: -2px;
}
.eta-unit { font-size: 1.1rem; font-weight: 700; }
.eta-row { display: flex; align-items: flex-end; gap: 14px; margin-bottom: 4px; }
.eta-detail { font-size: 0.82rem; color: var(--text-secondary); font-weight: 500; }
.eta-condition { font-size: 0.78rem; color: #dc2626; font-weight: 700; }
.eta-sublabel { font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 6px; }

.alerted-depts { padding: 10px 14px; background: rgba(239,68,68,0.04); border-radius: 9px; margin: 10px 0; }
.alerted-label { font-size: 0.65rem; color: var(--text-muted); font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 7px; }
.dept-tags { display: flex; gap: 6px; flex-wrap: wrap; }
.dept-tag {
  padding: 3px 9px; border-radius: 6px; font-size: 0.7rem; font-weight: 700;
  letter-spacing: 0.3px;
}
.tag-pink { background: rgba(232,24,126,0.1); color: var(--pink-600); border: 1px solid rgba(232,24,126,0.25); }
.tag-silver { background: rgba(156,163,175,0.15); color: #374151; border: 1px solid rgba(156,163,175,0.3); }
.tag-violet { background: rgba(139,92,246,0.1); color: #4c1d95; border: 1px solid rgba(139,92,246,0.25); }
.tag-blood { background: rgba(239,68,68,0.1); color: #7f1d1d; border: 1px solid rgba(239,68,68,0.25); }

.preparing-note {
  display: flex; align-items: center; gap: 6px;
  font-size: 0.78rem; color: #065f46; font-weight: 500; margin-bottom: 12px;
}
.acknowledge-btn {
  width: 100%; padding: 13px; border-radius: 11px; border: none; cursor: pointer;
  background: linear-gradient(135deg, #dc2626, #991b1b);
  color: white; font-family: 'Inter', sans-serif; font-weight: 800;
  font-size: 0.82rem; letter-spacing: 0.8px; text-transform: uppercase;
  transition: all 0.22s;
  box-shadow: 0 3px 14px rgba(220,38,38,0.35);
  animation: pulse-btn 2s ease-in-out infinite;
}
@keyframes pulse-btn { 0%,100%{box-shadow:0 3px 14px rgba(220,38,38,0.35)} 50%{box-shadow:0 6px 24px rgba(220,38,38,0.55)} }
.acknowledge-btn:hover { transform: translateY(-2px); filter: brightness(1.08); }

/* ── BED STATUS ── */
.bed-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.bed-cell {
  padding: 10px 12px; border-radius: 10px; border: 1.5px solid;
  transition: all 0.18s;
}
.bed-cell:hover { transform: scale(1.02); }
.bed-cell.in-labor { background: rgba(232,24,126,0.06); border-color: rgba(232,24,126,0.3); }
.bed-cell.postpartum { background: rgba(16,185,129,0.05); border-color: rgba(16,185,129,0.25); }
.bed-cell.empty { background: #f9fafb; border-color: #e5e7eb; border-style: dashed; }
.bed-cell.cleanup { background: rgba(249,115,22,0.05); border-color: rgba(249,115,22,0.25); }
.bed-num { font-family: 'Inter', sans-serif; font-weight: 800; font-size: 1.1rem; color: var(--text-primary); }
.bed-status-tag {
  display: inline-block; font-size: 0.58rem; font-weight: 700; padding: 1px 6px;
  border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px; margin-left: 5px;
  vertical-align: middle;
}
.bst-labor { background: rgba(232,24,126,0.15); color: var(--pink-600); }
.bst-post { background: rgba(16,185,129,0.12); color: #065f46; }
.bst-empty { background: #f3f4f6; color: #6b7280; }
.bst-clean { background: rgba(249,115,22,0.12); color: #c2410c; }
.bed-patient { font-size: 0.75rem; color: var(--text-muted); margin-top: 3px; }
.view-floor-btn {
  display: block; width: 100%; text-align: center; padding: 6px;
  border: none; background: none; font-size: 0.75rem; font-weight: 600;
  color: var(--pink-500); cursor: pointer; margin-top: 10px;
  transition: opacity 0.18s;
}
.view-floor-btn:hover { opacity: 0.7; text-decoration: underline; }

/* ── SCHEDULE ── */
.sched-item { display: flex; gap: 12px; padding: 9px 0; border-bottom: 1px solid var(--border-soft); }
.sched-item:last-child { border-bottom: none; }
.sched-time { font-size: 0.75rem; font-weight: 700; color: var(--pink-500); width: 62px; flex-shrink: 0; padding-top: 2px; }
.sched-info { flex: 1; }
.sched-title { font-size: 0.83rem; font-weight: 700; color: var(--text-primary); }
.sched-location { font-size: 0.71rem; color: var(--text-muted); margin-top: 2px; display: flex; align-items: center; gap: 4px; }

/* ── NICU ── */
.nicu-stats { display: flex; gap: 10px; margin-bottom: 12px; }
.nicu-stat {
  flex: 1; padding: 12px; border-radius: 10px; text-align: center;
  font-family: 'Inter', sans-serif;
}
.nicu-stat.occupied { background: rgba(232,24,126,0.08); border: 1px solid rgba(232,24,126,0.2); }
.nicu-stat.available { background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.2); }
.nicu-val { font-size: 1.5rem; font-weight: 800; }
.nicu-val.occ-val { color: var(--pink-600); }
.nicu-val.avail-val { color: #059669; }
.nicu-label { font-size: 0.65rem; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; color: var(--text-muted); margin-top: 2px; }

.doctor-row { display: flex; align-items: center; gap: 10px; padding: 7px 0; border-bottom: 1px solid var(--border-soft); }
.doctor-row:last-child { border-bottom: none; }
.doc-av-sm {
  width: 32px; height: 32px; border-radius: 50%; overflow: hidden;
  background: linear-gradient(135deg, var(--pink-200), var(--pink-400));
  display: flex; align-items: center; justify-content: center;
  font-size: 0.72rem; font-weight: 700; color: white; flex-shrink: 0;
}
.doc-info { flex: 1; }
.doc-name { font-size: 0.8rem; font-weight: 600; color: var(--text-primary); }
.doc-role { font-size: 0.7rem; color: var(--text-muted); }
.doc-status { display: flex; align-items: center; gap: 4px; font-size: 0.7rem; font-weight: 600; }
.online-dot { width: 7px; height: 7px; border-radius: 50%; background: #10b981; }
.online-dot.oncall { background: #f59e0b; }

/* ── BIRTH LEDGER ── */
.bc-entry {
  padding: 10px 12px; border-radius: 9px; margin-bottom: 8px;
  background: linear-gradient(135deg, rgba(232,24,126,0.04), transparent);
  border: 1px solid var(--border);
}
.bc-baby { font-size: 0.85rem; font-weight: 700; color: var(--text-primary); }
.bc-time { font-size: 0.7rem; color: var(--text-muted); }
.bc-hash { font-family: monospace; font-size: 0.7rem; color: var(--pink-500); margin-top: 3px; }
.register-btn {
  width: 100%; padding: 10px; border-radius: 10px; border: none; cursor: pointer;
  background: var(--text-primary); color: white;
  font-family: 'Inter', sans-serif; font-weight: 700; font-size: 0.8rem;
  letter-spacing: 0.4px; display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: all 0.2s; margin-top: 10px;
}
.register-btn:hover { background: var(--pink-800); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(58,0,32,0.25); }

/* ── AI PANEL ── */
.ai-panel {
  background: linear-gradient(135deg, var(--pink-600), var(--pink-800));
  border: none; color: white;
}
.ai-panel .card-title { color: white; }
.ai-entry { padding: 9px 0; border-bottom: 1px solid rgba(255,255,255,0.12); }
.ai-entry:last-child { border-bottom: none; }
.ai-time { font-size: 0.68rem; font-weight: 700; color: rgba(255,255,255,0.6); }
.ai-text { font-size: 0.78rem; color: rgba(255,255,255,0.9); margin-top: 2px; line-height: 1.45; }
.ai-confidence {
  display: inline-flex; align-items: center; gap: 4px;
  background: rgba(16,185,129,0.2); border-radius: 5px;
  padding: 2px 7px; font-size: 0.68rem; font-weight: 700;
  color: #6ee7b7; margin-top: 4px;
}
.ask-ai-btn {
  width: 100%; padding: 9px; border-radius: 9px; border: 1px solid rgba(255,255,255,0.3);
  background: rgba(255,255,255,0.08); color: white; font-size: 0.78rem; font-weight: 600;
  font-family: 'Inter', sans-serif; cursor: pointer; display: flex; align-items: center;
  justify-content: center; gap: 7px; transition: all 0.2s; margin-top: 10px;
}
.ask-ai-btn:hover { background: rgba(255,255,255,0.16); transform: translateY(-1px); }

/* ── ANIMATIONS ── */
@keyframes fadeSlideUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
@keyframes fadeIn { from{opacity:0} to{opacity:1} }
.a1{animation:fadeSlideUp 0.4s 0.05s ease both;}
.a2{animation:fadeSlideUp 0.4s 0.12s ease both;}
.a3{animation:fadeSlideUp 0.4s 0.18s ease both;}
.a4{animation:fadeSlideUp 0.4s 0.24s ease both;}
.a5{animation:fadeSlideUp 0.4s 0.30s ease both;}
`;

// ── FHR Bars ──────────────────────────────────────────────────────────────
function FHRBars({ bpm }) {
  const heights = [10, 18, 14, 22, 16, 20, 12, 18, 24, 15];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
      <div>
        <div className="fhr-label">FETAL HEART RATE</div>
        <div className="fhr-value">{bpm} <span style={{ fontSize: "0.75rem", fontWeight: 500 }}>bpm</span></div>
      </div>
      <div className="fhr-bars">
        {heights.map((h, i) => (
          <div key={i} className="fhr-bar"
            style={{ height: h, animationDelay: `${i * 0.12}s` }} />
        ))}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────
export default function MaternityDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("DASHBOARD");
  const [time, setTime] = useState(new Date());
  const [acknowledged, setAcknowledged] = useState(false);
  const [activeDay, setActiveDay] = useState(9);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const navItems = [
    { icon: "⊞", label: "DASHBOARD" },
    { icon: "🤰", label: "LABOR TRACKER" },
    { icon: "👶", label: "NICU STATUS" },
    { icon: "📋", label: "BIRTH REGISTRY" },
    { icon: "⚙️", label: "SETTINGS" },
  ];

  const beds = [
    { num: 201, status: "in-labor",  bstClass: "bst-labor",  bstLabel: "IN LABOR",    patient: "S. Jenkins" },
    { num: 205, status: "empty",     bstClass: "bst-empty",  bstLabel: "EMPTY",       patient: "Available" },
    { num: 202, status: "postpartum",bstClass: "bst-post",   bstLabel: "POSTPARTUM",  patient: "Mrs. Chen" },
    { num: 204, status: "in-labor",  bstClass: "bst-labor",  bstLabel: "IN LABOR",    patient: "E. Fisher" },
    { num: 206, status: "postpartum",bstClass: "bst-post",   bstLabel: "POSTPARTUM",  patient: "Mrs. Kapoor" },
    { num: 207, status: "cleanup",   bstClass: "bst-clean",  bstLabel: "CLEAN-UP",    patient: "Pending" },
  ];

  const dateStr = time.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }).toUpperCase();
  const timeStr = time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      <style>{CSS}</style>
      <div className="mat-root">

        {/* ── TOPBAR ── */}
        <header className="mat-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* Clicking title toggles sidebar */}
            <button className="mat-logo-btn" onClick={() => setSidebarOpen(v => !v)} title="Toggle sidebar">
              <div className="mat-logo-icon">🤱</div>
              <div>
                <div className="mat-logo-title">Maternity Ward</div>
                <div className="mat-logo-subtitle">Pink Zone · Labor &amp; Delivery</div>
              </div>
              <span style={{ marginLeft: 4, fontSize: 12, color: "var(--text-muted)", transition: "transform 0.3s", display: "inline-block", transform: sidebarOpen ? "rotate(0deg)" : "rotate(-90deg)" }}>▼</span>
            </button>
            <div className="connected-badge">
              <span className="connected-dot" />
              Connected: OT Silver &amp; Lab Violet
            </div>
          </div>
          <div className="topbar-right">
            <div className="topbar-time">
              <div className="topbar-time-main">{timeStr}</div>
              <div className="topbar-time-date">{dateStr}</div>
            </div>
            <button className="top-icon-btn">
              🔔
              <span className="notif-badge">2</span>
            </button>
            <button className="top-icon-btn">⚙️</button>
            <div className="avatar-sm">KS</div>
          </div>
        </header>

        <div className="mat-layout">
          {/* ── SIDEBAR (slides in/out) ── */}
          <aside className={`mat-sidebar ${sidebarOpen ? "" : "collapsed"}`}>
            <div className="sidebar-zone-header">
              <div className="zone-avatar">🤱</div>
              <div>
                <div className="zone-name">Pink Zone</div>
                <div className="zone-sub">Labor &amp; Delivery</div>
              </div>
            </div>
            <nav className="sidebar-nav">
              {navItems.map(n => (
                <button key={n.label}
                  className={`nav-item ${activeNav === n.label ? "active" : ""}`}
                  onClick={() => setActiveNav(n.label)}>
                  <span className="nav-item-icon">{n.icon}</span>
                  {n.label}
                </button>
              ))}
            </nav>
            <div className="sidebar-bottom">
              <button className="new-admission-btn">
                <span>＋</span> New Admission
              </button>
            </div>
          </aside>

          {/* ── MAIN ── */}
          <main className="mat-main">
            <div className="main-grid">

              {/* COL 1: Active Labors + Schedule */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                {/* Active Labors */}
                <div className="card a1">
                  <div className="card-hd">
                    <div className="card-title">🤰 Active Labors</div>
                    <span className="badge badge-monitoring">● 2 MONITORING</span>
                  </div>
                  <div className="card-bd">
                    {/* Patient 1 */}
                    <div className="labor-card">
                      <div className="labor-patient">
                        <span className="labor-name">Sarah Jenkins (G2P1)</span>
                        <span className="badge badge-room">RM 201</span>
                      </div>
                      <div className="labor-vitals">
                        <span className="vital-item">🛏 6 cm dilated</span>
                        <span className="vital-item">💓 3 min freq</span>
                      </div>
                      <FHRBars bpm={142} />
                      <button className="view-trace-btn">View Full Trace →</button>
                    </div>
                    {/* Patient 2 */}
                    <div className="labor-card">
                      <div className="labor-patient">
                        <span className="labor-name">Elena Fisher (G1P0)</span>
                        <span className="badge badge-room">RM 204</span>
                      </div>
                      <div className="labor-vitals">
                        <span className="vital-item">🛏 4 cm dilated</span>
                        <span className="vital-item">💓 5 min freq</span>
                      </div>
                      <FHRBars bpm={138} />
                      <button className="view-trace-btn">View Full Trace →</button>
                    </div>
                  </div>
                </div>

                {/* Today's Schedule */}
                <div className="card a2">
                  <div className="card-hd">
                    <div className="card-title">📅 Today's Schedule</div>
                  </div>
                  <div className="card-bd">
                    <div className="sched-item">
                      <div className="sched-time">11:30 AM</div>
                      <div className="sched-info">
                        <div className="sched-title">Mrs. Gupta — C-Section</div>
                        <div className="sched-location">🏥 OT 2 · Silver Zone</div>
                        <span className="badge badge-preop" style={{ marginTop: 5 }}>PRE-OP</span>
                      </div>
                    </div>
                    <div className="sched-item">
                      <div className="sched-time">01:00 PM</div>
                      <div className="sched-info">
                        <div className="sched-title">Mrs. Thorne — Induction</div>
                        <div className="sched-location">🗓 Scheduled Admission</div>
                        <span className="badge badge-scheduled" style={{ marginTop: 5 }}>SCHEDULED</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* COL 2: Emergency + Bed Status */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                {/* Incoming Emergency */}
                <div className={`card emergency-card a3 ${acknowledged ? "" : ""}`}>
                  <div className="emergency-header">
                    <span style={{ fontSize: 16 }}>🚨</span>
                    <span className="emergency-label">Incoming Obstetric Emergency</span>
                  </div>
                  <div className="emergency-body">
                    <div className="eta-row">
                      <div>
                        <div className="eta-huge">6 <span className="eta-unit">MINS</span></div>
                        <div className="eta-sublabel">Estimated Arrival</div>
                      </div>
                      <div>
                        <div className="eta-detail" style={{ fontWeight: 700 }}>32 Weeks Gestation</div>
                        <div className="eta-condition">Severe Bleeding / Triage 1</div>
                      </div>
                    </div>
                    <div className="alerted-depts">
                      <div className="alerted-label">Alerted Departments</div>
                      <div className="dept-tags">
                        <span className="dept-tag tag-pink">PINK (MATERNITY)</span>
                        <span className="dept-tag tag-silver">SILVER (OT)</span>
                        <span className="dept-tag tag-violet">VIOLET (LAB)</span>
                        <span className="dept-tag tag-blood">BLOOD BANK</span>
                      </div>
                    </div>
                    <div className="preparing-note">
                      ✅ Preparing OR 2 and NICU team
                    </div>
                    <button
                      className="acknowledge-btn"
                      onClick={() => setAcknowledged(true)}
                      style={acknowledged ? { background: "linear-gradient(135deg,#059669,#047857)", animation: "none", boxShadow: "0 3px 14px rgba(5,150,105,0.35)" } : {}}
                    >
                      {acknowledged ? "✅ PROTOCOL ACTIVATED" : "ACKNOWLEDGE & ACTIVATE PROTOCOL"}
                    </button>
                  </div>
                </div>

                {/* Bed Status */}
                <div className="card a4">
                  <div className="card-hd">
                    <div className="card-title">🛏 Bed Status</div>
                    <div style={{ display: "flex", gap: 4 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--pink-500)", display: "inline-block" }} />
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#e5e7eb", display: "inline-block" }} />
                    </div>
                  </div>
                  <div className="card-bd">
                    <div className="bed-grid">
                      {beds.map(b => (
                        <div key={b.num} className={`bed-cell ${b.status}`}>
                          <div>
                            <span className="bed-num">{b.num}</span>
                            <span className={`bed-status-tag ${b.bstClass}`}>{b.bstLabel}</span>
                          </div>
                          <div className="bed-patient">{b.patient}</div>
                        </div>
                      ))}
                    </div>
                    <button className="view-floor-btn">View Full Floor Plan →</button>
                  </div>
                </div>
              </div>

              {/* COL 3: NICU + Birth Ledger + AI */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                {/* NICU & Neonatal */}
                <div className="card a3">
                  <div className="card-hd">
                    <div className="card-title">👶 NICU &amp; Neonatal</div>
                  </div>
                  <div className="card-bd">
                    <div className="nicu-stats">
                      <div className="nicu-stat occupied">
                        <div className="nicu-val occ-val">4/8</div>
                        <div className="nicu-label">Occupied</div>
                      </div>
                      <div className="nicu-stat available">
                        <div className="nicu-val avail-val">2</div>
                        <div className="nicu-label">Available</div>
                      </div>
                    </div>
                    <div className="doctor-row">
                      <div className="doc-av-sm">PM</div>
                      <div className="doc-info">
                        <div className="doc-name">Dr. Priya Mehta</div>
                        <div className="doc-role">Neonatologist</div>
                      </div>
                      <div className="doc-status">
                        <span className="online-dot oncall" />
                        On-call
                      </div>
                    </div>
                    <div className="doctor-row">
                      <div className="doc-av-sm" style={{ background: "linear-gradient(135deg,#93c5fd,#3b82f6)" }}>RS</div>
                      <div className="doc-info">
                        <div className="doc-name">Dr. Rohan Sharma</div>
                        <div className="doc-role">Paediatrician</div>
                      </div>
                      <div className="doc-status">
                        <span className="online-dot" />
                        On-site
                      </div>
                    </div>
                  </div>
                </div>

                {/* Birth Ledger */}
                <div className="card a4">
                  <div className="card-hd">
                    <div className="card-title">🔗 Birth Ledger</div>
                    <span className="badge badge-immutable">● IMMUTABLE</span>
                  </div>
                  <div className="card-bd">
                    <div className="bc-entry">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div className="bc-baby">Baby Boy Jenkins</div>
                        <div className="bc-time">10:15 AM</div>
                      </div>
                      <div className="bc-hash">Hash: 0x7a2d8f9e11c60b4c...8892</div>
                    </div>
                    <div className="bc-entry">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div className="bc-baby">Baby Girl Chen</div>
                        <div className="bc-time">08:42 AM</div>
                      </div>
                      <div className="bc-hash">Hash: 0x3c1fa22e8b04d7a1...5541</div>
                    </div>
                    <button className="register-btn">
                      🔗 Register New Birth
                    </button>
                  </div>
                </div>

                {/* Maternity AI */}
                <div className="card ai-panel a5">
                  <div className="card-hd" style={{ padding: "14px 16px 0" }}>
                    <div className="card-title">🤖 Maternity AI</div>
                  </div>
                  <div className="card-bd">
                    <div className="ai-entry">
                      <div className="ai-time">10:32</div>
                      <div className="ai-text">Triage Agent routed ambulance emergency.</div>
                      <div className="ai-confidence">✅ Confidence 96%</div>
                    </div>
                    <div className="ai-entry">
                      <div className="ai-time">10:15</div>
                      <div className="ai-text">Bed Flow Agent predicts discharge for Mrs. Kapoor (4h).</div>
                    </div>
                    <div className="ai-entry">
                      <div className="ai-time">09:58</div>
                      <div className="ai-text">NLP Agent flagged FHR anomaly for Room 204. Alert sent to Dr. Sharma.</div>
                      <div className="ai-confidence" style={{ background: "rgba(251,191,36,0.2)", color: "#fde68a" }}>⚠ Review Recommended</div>
                    </div>
                    <button className="ask-ai-btn">
                      💬 ASK ASSISTANT
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}