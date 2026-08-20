import { useState, useEffect } from 'react';
import NotificationBell from '../components/NotificationBell';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [queue, setQueue] = useState([]);
  const [stats, setStats] = useState({ total: 0, waiting: 0, avgWait: 0 });
  const [doctors, setDoctors] = useState([]);
  const [tokenInput, setTokenInput] = useState('');

  const fetchData = async () => {
    try {
      const [qRes, sRes, dRes] = await Promise.all([
        fetch('http://localhost:8000/api/opd/queue'),
        fetch('http://localhost:8000/api/opd/stats'),
        fetch('http://localhost:8000/api/opd/doctors')
      ]);
      const qData = await qRes.json();
      const sData = await sRes.json();
      const dData = await dRes.json();
      setQueue(qData.queue || []);
      setStats(sData || { total: 0, waiting: 0, avgWait: 0 });
      setDoctors(dData.doctors || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
    const t = setInterval(fetchData, 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    // Inject Manrope + Material Symbols
    const fontLink = document.createElement('link');
    fontLink.href =
      'https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

    const iconLink = document.createElement('link');
    iconLink.href =
      'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
    iconLink.rel = 'stylesheet';
    document.head.appendChild(iconLink);

    document.title = 'General OPD & Clinics Command';
  }, []);

  return (
    <div
      style={{
        fontFamily: "'Manrope', sans-serif",
        backgroundColor: '#eafeef',
        color: '#0e1f16',
      }}
      className="antialiased overflow-x-hidden min-h-screen"
    >
      <style>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          font-family: 'Material Symbols Outlined';
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(190, 201, 191, 0.2);
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes opd-pulse { 0%,100%{opacity:1;} 50%{opacity:.5;} }
        .opd-pulse { animation: opd-pulse 2s cubic-bezier(0.4,0,0.6,1) infinite; }
        .opd-sidebar-enter { transform: translateX(-100%); }
        .opd-sidebar-open { transform: translateX(0); transition: transform .3s ease-out; }
      `}</style>

      {/* Top Navigation Anchor */}
      <header
        className="backdrop-blur-2xl sticky top-0 z-50 w-full"
        style={{
          backgroundColor: 'rgba(234,254,239,0.7)',
          boxShadow: '0 30px 60px -15px rgba(14,31,22,0.06)',
        }}
      >
        <div className="flex justify-between items-center px-8 h-20 w-full tracking-tight antialiased">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-xl font-bold cursor-pointer hover:opacity-70 transition-opacity"
              style={{ color: '#0e1f16' }}
            >
              Evergreen OPD
            </button>
            <span
              className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest"
              style={{ backgroundColor: 'rgba(85,170,123,0.2)', color: '#076c43' }}
            >
              OPD Green
            </span>
          </div>
          <nav className="hidden md:flex gap-8">
            <a
              href="#"
              className="font-bold border-b-2 pb-1 transition-colors duration-300"
              style={{ color: '#076c43', borderColor: '#076c43' }}
            >
              Summary
            </a>
            <a href="#" className="font-medium transition-colors duration-300" style={{ color: '#3f4942' }}>
              Staffing
            </a>
            <a href="#" className="font-medium transition-colors duration-300" style={{ color: '#3f4942' }}>
              Capacity
            </a>
            <a href="#" className="font-medium transition-colors duration-300" style={{ color: '#3f4942' }}>
              Alerts
            </a>
          </nav>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="font-bold text-sm" style={{ color: '#076c43' }}>
                {stats.total} Patients Today
              </span>
              <span className="text-xs font-medium" style={{ color: '#3f4942' }}>
                Avg Wait: {stats.avgWait}m
              </span>
            </div>
            <div className="flex gap-3">
              <NotificationBell />
              <span
                className="material-symbols-outlined cursor-pointer transition-colors"
                style={{ color: '#3f4942' }}
              >
                account_circle
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex flex-col lg:flex-row min-h-screen relative">
        {/* Backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Side Navigation Anchor (slide-in) */}
        <aside
          className={`fixed top-20 left-0 z-50 flex flex-col h-[calc(100vh-5rem)] w-72 py-8 px-4 text-sm uppercase tracking-wider overflow-y-auto shadow-2xl ${
            sidebarOpen ? 'opd-sidebar-open' : 'opd-sidebar-enter'
          }`}
          style={{
            backgroundColor: '#e4f9ea',
            fontFamily: "'Manrope', sans-serif",
            transition: 'transform 0.3s ease-out',
          }}
        >
          <div className="mb-8 px-4 flex justify-between items-start">
            <div>
              <h2 className="font-extrabold text-lg leading-tight" style={{ color: '#0e1f16' }}>
                Command Center
              </h2>
              <p className="opacity-70 normal-case tracking-normal" style={{ color: '#3f4942' }}>
                Departmental Drilling
              </p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="material-symbols-outlined hover:opacity-60"
              style={{ color: '#3f4942' }}
            >
              close
            </button>
          </div>
          <div className="flex flex-col gap-y-1 mb-8">
            <a
              href="#"
              className="flex items-center gap-3 pl-4 py-3 rounded-xl transition-all duration-200"
              style={{ color: '#3f4942' }}
            >
              <span className="material-symbols-outlined">favorite</span> Cardiology
            </a>
            <a
              href="#"
              className="flex items-center gap-3 font-bold border-l-4 pl-4 py-3 rounded-r-xl"
              style={{ color: '#076c43', borderColor: '#076c43', backgroundColor: 'rgba(211,232,217,0.5)' }}
            >
              <span className="material-symbols-outlined">child_care</span> Pediatrics
            </a>
            <a
              href="#"
              className="flex items-center gap-3 pl-4 py-3 rounded-xl transition-all duration-200"
              style={{ color: '#3f4942' }}
            >
              <span className="material-symbols-outlined">hearing</span> ENT
            </a>
            <a
              href="#"
              className="flex items-center gap-3 pl-4 py-3 rounded-xl transition-all duration-200"
              style={{ color: '#3f4942' }}
            >
              <span className="material-symbols-outlined">medical_services</span> Orthopedics
            </a>
            <a
              href="#"
              className="flex items-center gap-3 pl-4 py-3 rounded-xl transition-all duration-200"
              style={{ color: '#3f4942' }}
            >
              <span className="material-symbols-outlined">stethoscope</span> General Med
            </a>
            <a
              href="#"
              className="flex items-center gap-3 pl-4 py-3 rounded-xl transition-all duration-200"
              style={{ color: '#3f4942' }}
            >
              <span className="material-symbols-outlined">biotech</span> Radiology
            </a>
          </div>
          <div className="mt-auto pt-6 border-t" style={{ borderColor: 'rgba(190,201,191,0.2)' }}>
            <button
              className="w-full mb-4 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#076c43', color: '#fff' }}
            >
              <span className="material-symbols-outlined text-sm">ios_share</span> Export Analytics
            </button>
            <div className="flex flex-col gap-y-1">
              <a
                href="#"
                className="flex items-center gap-3 pl-4 py-2 rounded-xl transition-all"
                style={{ color: '#3f4942' }}
              >
                <span className="material-symbols-outlined">help_outline</span> Support
              </a>
              <a
                href="#"
                className="flex items-center gap-3 pl-4 py-2 rounded-xl transition-all"
                style={{ color: '#3f4942' }}
              >
                <span className="material-symbols-outlined">analytics</span> Status
              </a>
            </div>
          </div>
        </aside>

        {/* Main Canvas Content */}
        <div className="flex-1 px-6 lg:px-10 py-10 overflow-x-hidden">
          {/* Page Header */}
          <section className="mb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1
                  className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2"
                  style={{ color: '#0e1f16' }}
                >
                  🏥 General OPD & Clinics Command
                </h1>
                <p className="text-lg" style={{ color: '#3f4942' }}>
                  Green Zone — Outpatient Flow & Consultation Hub
                </p>
              </div>
              <div className="flex gap-4">
                <div className="glass-card p-4 rounded-xl flex items-center gap-4 shadow-sm">
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#b5ecc9', color: '#3a6d50' }}
                  >
                    <span className="material-symbols-outlined">timer</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#3f4942' }}>
                      Wait Time
                    </p>
                    <p className="text-xl font-extrabold" style={{ color: '#076c43' }}>
                      {stats.avgWait}m
                    </p>
                  </div>
                </div>
                <div className="glass-card p-4 rounded-xl flex items-center gap-4 shadow-sm">
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(85,170,123,0.2)', color: '#076c43' }}
                  >
                    <span className="material-symbols-outlined">groups</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#3f4942' }}>
                      Waiting
                    </p>
                    <p className="text-xl font-extrabold" style={{ color: '#0e1f16' }}>
                      {stats.waiting}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Stats & Emergency */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
            <div className="lg:col-span-3 glass-card p-6 rounded-xl flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span
                  className="text-xs font-bold uppercase tracking-widest flex items-center gap-1"
                  style={{ color: '#076c43' }}
                >
                  <span className="material-symbols-outlined text-sm">trending_down</span> Trends
                </span>
                <h3 className="text-lg font-bold">Wait time decreased by 12%</h3>
                <p className="text-sm" style={{ color: '#3f4942' }}>
                  Optimal flow achieved in Pediatrics and ENT sections today.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  className="px-6 py-2 rounded-lg font-bold hover:scale-[0.98] transition-transform"
                  style={{ backgroundColor: '#076c43', color: '#fff' }}
                >
                  Report
                </button>
              </div>
            </div>
            <button
              className="flex items-center justify-center gap-3 font-extrabold p-6 rounded-xl shadow-lg transition-colors"
              style={{ backgroundColor: '#ba1a1a', color: '#fff' }}
            >
              <span className="material-symbols-outlined">warning</span>
              DECLARE OPD EMERGENCY
            </button>
          </div>

          {/* Clinic Status Grid */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-extrabold flex items-center gap-2">
                <span className="w-2 h-8 rounded-full" style={{ backgroundColor: '#076c43' }}></span>{' '}
                Clinic Status
              </h2>
              <span
                className="text-sm font-bold uppercase tracking-widest"
                style={{ color: '#3f4942' }}
              >
                Active Departments
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: 'General Med', doc: 'Dr. Sarah Jenkins', wait: 'Wait: 18m', dot: '#076c43', txt: '#076c43' },
                { name: 'Cardiology', doc: 'Dr. Aris Thorne', wait: 'Wait: 42m', dot: '#076c43', txt: '#076c43' },
                { name: 'Orthopedics', doc: 'Dr. Mike Ross', wait: 'Wait: 12m', dot: '#076c43', txt: '#076c43' },
                { name: 'Pediatrics', doc: 'Dr. Elena Fisher', wait: 'Wait: 5m', dot: '#076c43', txt: '#076c43' },
                { name: 'Dermatology', doc: 'Dr. Kevin Hart', wait: 'Wait: 28m', dot: '#b5ecc9', txt: '#076c43' },
                { name: 'ENT', doc: 'Dr. Linda Gray', wait: 'Wait: 15m', dot: '#076c43', txt: '#076c43' },
                { name: 'Ophtha', doc: 'Dr. Sam Neil', wait: 'Delayed: 55m', dot: '#ba1a1a', txt: '#ba1a1a' },
                { name: 'Psychiatry', doc: 'Dr. Marcus Aurel', wait: 'Wait: 20m', dot: '#076c43', txt: '#076c43' },
              ].map((c) => (
                <div
                  key={c.name}
                  className="glass-card p-5 rounded-xl shadow-sm hover:translate-y-[-2px] transition-transform"
                  style={{ borderLeft: '4px solid #076c43' }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-bold" style={{ color: '#0e1f16' }}>
                      {c.name}
                    </h4>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.dot }}></div>
                  </div>
                  <p className="text-sm mb-1" style={{ color: '#3f4942' }}>
                    {c.doc}
                  </p>
                  <p className="text-sm font-bold" style={{ color: c.txt }}>
                    {c.wait}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
            {/* Live Queue Table */}
            <div className="xl:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-extrabold">📋 Live Patient Queue</h2>
                <div
                  className="flex items-center gap-2 px-3 py-1 rounded-full"
                  style={{ backgroundColor: 'rgba(7,108,67,0.1)' }}
                >
                  <span className="material-symbols-outlined text-sm" style={{ color: '#076c43' }}>
                    psychology
                  </span>
                  <span
                    className="text-[10px] font-bold uppercase tracking-tighter"
                    style={{ color: '#076c43' }}
                  >
                    AI Bed Flow Optimized
                  </span>
                </div>
              </div>
              <div className="glass-card rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead
                      className="text-xs uppercase font-bold"
                      style={{ backgroundColor: '#e4f9ea', color: '#3f4942' }}
                    >
                      <tr>
                        <th className="px-6 py-4">Token</th>
                        <th className="px-6 py-4">Patient Name</th>
                        <th className="px-6 py-4">Department</th>
                        <th className="px-6 py-4">Wait</th>
                        <th className="px-6 py-4">AI Priority</th>
                      </tr>
                    </thead>
                    <tbody>
                      {queue.slice(0, 10).map((r, i) => (
                        <tr
                          key={r.id}
                          className="transition-colors"
                          style={{
                            borderTop: i === 0 ? 'none' : '1px solid rgba(190,201,191,0.1)',
                          }}
                        >
                          <td className="px-6 py-5 font-bold">{r.token}</td>
                          <td className="px-6 py-5" style={{ color: '#0e1f16' }}>
                            {r.patient_name}
                          </td>
                          <td className="px-6 py-5 text-sm">{r.department}</td>
                          <td className="px-6 py-5 text-sm">{r.wait_mins}m</td>
                          <td className="px-6 py-5">
                            <span
                              className="px-3 py-1 rounded-full text-xs font-bold"
                              style={{ 
                                backgroundColor: r.ai_priority === 'High' ? 'rgba(186,26,26,0.1)' : r.ai_priority === 'Medium' ? 'rgba(7,108,67,0.1)' : '#b5ecc9',
                                color: r.ai_priority === 'High' ? '#ba1a1a' : r.ai_priority === 'Medium' ? '#076c43' : '#3a6d50'
                              }}
                            >
                              {r.ai_priority}
                            </span>
                            <button className="ml-4 text-xs font-bold" style={{color: '#076c43'}} onClick={() => {
                              fetch(`http://localhost:8000/api/opd/queue/${r.id}`, { method: 'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({status:'Completed'})}).then(fetchData);
                            }}>DONE</button>
                          </td>
                        </tr>
                      ))}
                      {queue.length === 0 && <tr><td colSpan="5" className="px-6 py-5 text-center">No patients in queue</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Self Check-In Kiosk + Integration */}
            <div className="flex flex-col gap-8">
              <section>
                <h2 className="text-2xl font-extrabold mb-6">🖥️ Kiosk Interface</h2>
                <div
                  className="glass-card p-8 rounded-2xl flex flex-col items-center text-center shadow-lg"
                  style={{ border: '2px solid rgba(85,170,123,0.2)' }}
                >
                  <div className="relative w-48 h-48 mb-6 cursor-pointer">
                    <div
                      className="absolute inset-0 border-2 border-dashed rounded-xl opd-pulse"
                      style={{ borderColor: '#076c43' }}
                    ></div>
                    <div
                      className="absolute inset-4 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(211,232,217,0.5)' }}
                    >
                      <span
                        className="material-symbols-outlined text-6xl"
                        style={{ color: 'rgba(7,108,67,0.4)' }}
                      >
                        qr_code_scanner
                      </span>
                    </div>
                    <div
                      className="absolute top-0 left-0 w-8 h-8 rounded-tl-lg"
                      style={{ borderTop: '4px solid #076c43', borderLeft: '4px solid #076c43' }}
                    ></div>
                    <div
                      className="absolute top-0 right-0 w-8 h-8 rounded-tr-lg"
                      style={{ borderTop: '4px solid #076c43', borderRight: '4px solid #076c43' }}
                    ></div>
                    <div
                      className="absolute bottom-0 left-0 w-8 h-8 rounded-bl-lg"
                      style={{ borderBottom: '4px solid #076c43', borderLeft: '4px solid #076c43' }}
                    ></div>
                    <div
                      className="absolute bottom-0 right-0 w-8 h-8 rounded-br-lg"
                      style={{ borderBottom: '4px solid #076c43', borderRight: '4px solid #076c43' }}
                    ></div>
                  </div>
                  <p className="font-bold mb-6" style={{ color: '#0e1f16' }}>
                    Scan Appointment QR
                  </p>
                  <div className="w-full">
                    <div className="flex flex-col gap-2">
                      <label
                        className="text-[10px] uppercase font-black tracking-widest text-left"
                        style={{ color: '#3f4942' }}
                      >
                        Manual Token Entry
                      </label>
                      <input
                        type="text"
                        placeholder="Patient Name"
                        value={tokenInput}
                        onChange={(e) => setTokenInput(e.target.value)}
                        className="w-full border-none rounded-lg text-center font-bold"
                        style={{ backgroundColor: '#d3e8d9', padding: '12px' }}
                      />
                      <button
                        onClick={async () => {
                          if (!tokenInput.trim()) return;
                          await fetch('http://localhost:8000/api/opd/checkin', {
                            method: 'POST', headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ patient_name: tokenInput, department: 'General Medicine' })
                          });
                          setTokenInput('');
                          fetchData();
                        }}
                        className="mt-2 w-full py-3 rounded-lg font-bold shadow-md hover:opacity-90 active:scale-95 transition-all"
                        style={{ backgroundColor: '#076c43', color: '#fff' }}
                      >
                        CHECK IN
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Integration Hub */}
              <section>
                <h2 className="text-xl font-extrabold mb-4">Integration Hub</h2>
                <div className="flex flex-col gap-3">
                  <div
                    className="p-4 rounded-xl flex items-start gap-4"
                    style={{ backgroundColor: '#fff7ed', borderLeft: '4px solid #fb923c' }}
                  >
                    <span className="material-symbols-outlined" style={{ color: '#f97316' }}>
                      pill
                    </span>
                    <div>
                      <h4 className="font-bold text-sm" style={{ color: '#431407' }}>
                        Pharmacy Ready (Orange Zone)
                      </h4>
                      <p className="text-xs" style={{ color: 'rgba(67,20,7,0.7)' }}>
                        Jameson, Robert — Prescription ready at Counter 4.
                      </p>
                    </div>
                  </div>
                  <div
                    className="p-4 rounded-xl flex items-start gap-4"
                    style={{ backgroundColor: '#f5f3ff', borderLeft: '4px solid #a78bfa' }}
                  >
                    <span className="material-symbols-outlined" style={{ color: '#8b5cf6' }}>
                      lab_panel
                    </span>
                    <div>
                      <h4 className="font-bold text-sm" style={{ color: '#2e1065' }}>
                        Reports Uploaded (Violet Zone)
                      </h4>
                      <p className="text-xs" style={{ color: 'rgba(46,16,101,0.7)' }}>
                        Mendez, Elena — Blood Panel available in Clinical Portal.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Doctor Availability */}
          <section className="mt-16 mb-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-extrabold">👨‍⚕️ Doctor Availability</h2>
              <button
                className="text-sm font-bold flex items-center gap-1 hover:underline"
                style={{ color: '#076c43' }}
              >
                View All Schedules <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {doctors.map((d) => (
                <div
                  key={d.id}
                  className="glass-card p-6 rounded-2xl relative overflow-hidden flex flex-col"
                >
                  <div className="flex gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="material-symbols-outlined text-3xl text-gray-500">person</span>
                    </div>
                    <div>
                      <h3 className="font-extrabold text-lg">{d.name}</h3>
                      <p className="text-sm" style={{ color: '#3f4942' }}>
                        {d.specialization} • {d.department}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 flex-1">
                    <div
                      className="flex justify-between items-center p-3 rounded-lg"
                      style={{ backgroundColor: 'rgba(7,108,67,0.05)' }}
                    >
                      <span className="text-xs font-bold uppercase" style={{ color: '#076c43' }}>
                        Status
                      </span>
                      <span
                        className="text-xs font-bold flex items-center gap-1"
                        style={{ color: d.availability === 'Available' ? '#076c43' : '#ba1a1a' }}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: d.availability === 'Available' ? '#076c43' : '#ba1a1a' }}
                        ></span>{' '}
                        {d.availability}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div
                        className="p-3 rounded-lg text-center"
                        style={{ backgroundColor: '#def3e4' }}
                      >
                        <p
                          className="text-[10px] uppercase font-bold"
                          style={{ color: '#3f4942' }}
                        >
                          Seen Today
                        </p>
                        <p className="text-xl font-black">{d.seen_today || 0}</p>
                      </div>
                      <div
                        className="p-3 rounded-lg text-center"
                        style={{ backgroundColor: '#def3e4' }}
                      >
                        <p
                          className="text-[10px] uppercase font-bold"
                          style={{ color: '#3f4942' }}
                        >
                          Shift
                        </p>
                        <p className="text-xl font-black" style={{ color: '#076c43' }}>
                          {d.shift}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* AI Agent Insights */}
          <section className="mt-12">
            <div className="flex items-center gap-4 mb-6">
              <span
                className="material-symbols-outlined p-2 rounded-lg"
                style={{ color: '#076c43', backgroundColor: 'rgba(7,108,67,0.1)' }}
              >
                robot_2
              </span>
              <h2 className="text-2xl font-extrabold">AI Agent Insights</h2>
            </div>
            <div
              className="glass-card rounded-2xl p-6 shadow-inner"
              style={{ backgroundColor: 'rgba(228,249,234,0.5)' }}
            >
              <div className="flex flex-col gap-4 max-h-60 overflow-y-auto pr-4 scrollbar-hide">
                {[
                  {
                    title: 'Bed Flow Optimizer',
                    text: 'Recommended: Divert Non-emergency Pediatrics to East Wing to reduce wait times by 10 mins.',
                    time: 'Executed 2m ago',
                    icon: 'flowsheet',
                    bg: 'rgba(7,108,67,0.2)',
                    color: '#076c43',
                  },
                  {
                    title: 'Patient Flow Agent',
                    text: 'Arrival surge detected: 5 patients inbound for Cardiology. Notifying Dr. Thorne for priority triage.',
                    time: 'Executed 8m ago',
                    icon: 'directions_run',
                    bg: '#b5ecc9',
                    color: '#3a6d50',
                  },
                  {
                    title: 'Green Sustainability Agent',
                    text: 'Lighting optimization: Reduced power in unoccupied ENT recovery rooms. 4% energy savings projected.',
                    time: 'Executed 15m ago',
                    icon: 'eco',
                    bg: '#9ef5c0',
                    color: '#005231',
                  },
                ].map((a) => (
                  <div
                    key={a.title}
                    className="flex gap-4 p-4 rounded-xl"
                    style={{ backgroundColor: 'rgba(255,255,255,0.6)' }}
                  >
                    <div
                      className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: a.bg, color: a.color }}
                    >
                      <span className="material-symbols-outlined text-sm">{a.icon}</span>
                    </div>
                    <div className="flex flex-col">
                      <span
                        className="text-xs font-black uppercase mb-1"
                        style={{ color: a.color }}
                      >
                        {a.title}
                      </span>
                      <p className="text-sm" style={{ color: '#0e1f16' }}>
                        {a.text}
                      </p>
                      <span className="text-[10px] mt-2" style={{ color: '#3f4942' }}>
                        {a.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Contextual FAB */}
      <button
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[60]"
        style={{ backgroundColor: '#076c43', color: '#fff' }}
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>
    </div>
  );
}