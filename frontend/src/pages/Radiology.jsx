import { useState, useEffect } from "react";
import NotificationBell from "../components/NotificationBell";

export default function Radiology() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [time, setTime] = useState(new Date());
  
  const [fleet, setFleet] = useState([]);
  const [queue, setQueue] = useState([]);

  const fetchData = async () => {
    try {
      const [fRes, qRes] = await Promise.all([
        fetch('http://localhost:8000/api/radiology/fleet'),
        fetch('http://localhost:8000/api/radiology/queue')
      ]);
      const fData = await fRes.json();
      const qData = await qRes.json();
      
      setFleet(fData.fleet || []);
      setQueue(qData.queue || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      setTime(new Date());
      fetchData();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const timeStr = time.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-[#eefdf8] flex flex-col">
      <style>{`
        .glass-teal-accent {
          background: rgba(213, 244, 246, 0.4);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        .bioluminescent-gradient {
          background: linear-gradient(135deg, #2bc6d4 0%, #006971 100%);
        }
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          height: 100vh;
          width: 280px;
          background: #f0f7f6;
          border-right: 1px solid #bbc9cb;
          transform: translateX(-100%);
          transition: transform 0.3s ease;
          z-index: 100;
          overflow-y: auto;
        }
        .sidebar.open {
          transform: translateX(0);
        }
      `}</style>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/30 z-50"
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div
          onClick={() => setSidebarOpen(false)}
          className="p-6 border-b border-[#bbc9cb] cursor-pointer hover:bg-[#e8f4f3] transition-colors"
        >
          <h1 className="text-xl font-bold text-[#006971] font-headline">
            Radiology Command
          </h1>
          <p className="text-xs text-[#3c494b] uppercase tracking-wider">
            Teal Zone
          </p>
        </div>

        <nav className="p-4 space-y-2">
          <button className="w-full text-left px-4 py-3 rounded-lg bg-[#2bc6d4]/10 text-[#006971] font-bold text-sm hover:bg-[#2bc6d4]/20 transition">
            <span className="material-symbols-outlined inline mr-2">dashboard</span>
            Dashboard
          </button>
          <button className="w-full text-left px-4 py-3 rounded-lg text-[#3c494b] font-bold text-sm hover:bg-[#2bc6d4]/10 transition">
            <span className="material-symbols-outlined inline mr-2">assignment</span>
            Worklist
          </button>
          <button className="w-full text-left px-4 py-3 rounded-lg text-[#3c494b] font-bold text-sm hover:bg-[#2bc6d4]/10 transition">
            <span className="material-symbols-outlined inline mr-2">history</span>
            Studies
          </button>
          <button className="w-full text-left px-4 py-3 rounded-lg text-[#3c494b] font-bold text-sm hover:bg-[#2bc6d4]/10 transition">
            <span className="material-symbols-outlined inline mr-2">settings</span>
            Settings
          </button>
        </nav>
      </aside>

      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-40 flex justify-between items-center px-6 py-3 bg-[#eefdf8]/80 backdrop-blur-xl shadow-lg border-b border-[#d7e6e1]">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-full hover:bg-[#2bc6d4]/10 text-[#006971]"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="text-xl font-bold tracking-tight text-[#006971] font-headline">
            Radiology Command
          </div>
          <nav className="hidden md:flex gap-4 ml-4">
            <span className="text-[#2bc6d4] border-b-2 border-[#2bc6d4] pb-1 font-semibold cursor-pointer">
              Teal Zone
            </span>
            <span className="text-[#5f7d79] hover:bg-[#2bc6d4]/10 transition-colors px-2 rounded cursor-pointer">
              Diagnostics
            </span>
            <span className="text-[#5f7d79] hover:bg-[#2bc6d4]/10 transition-colors px-2 rounded cursor-pointer">
              Worklist
            </span>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-[#3c494b] font-bold">{timeStr}</span>
          <NotificationBell />
          <button className="p-2 rounded-full hover:bg-[#2bc6d4]/10 text-[#006971]">
            <span className="material-symbols-outlined">settings</span>
          </button>
          <div className="w-8 h-8 rounded-full bg-[#2bc6d4] flex items-center justify-center ml-2 border border-[#006971]/20">
            <span className="text-xs font-bold text-white">DR</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mt-16 flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 overflow-hidden">
        {/* LEFT COLUMN: Pending & Schedule */}
        <section className="lg:col-span-1 flex flex-col gap-4 overflow-y-auto">
          {/* Header Identity */}
          <div className="p-4 bg-white rounded-xl border border-[#d7e6e1]">
            <h1 className="text-lg font-bold font-headline text-[#006971] mb-2">
              🩻 Radiology & Imaging (Teal Zone)
            </h1>
            <div className="flex flex-wrap gap-2 text-[10px] font-bold tracking-tight uppercase">
              <span className="px-2 py-0.5 bg-[#e2f1ec] text-[#006971] rounded">
                MRI: <span className="font-bold">Idle</span>
              </span>
              <span className="px-2 py-0.5 bg-[#2bc6d4]/20 text-[#006971] rounded">
                CT: <span className="font-bold">Busy</span>
              </span>
              <span className="px-2 py-0.5 bg-[#e2f1ec] text-[#ba1a1a] rounded">
                X-Ray: <span className="font-bold">3 Waiting</span>
              </span>
              <span className="px-2 py-0.5 bg-[#e2f1ec] text-[#006971] rounded">
                US: <span className="font-bold">Active</span>
              </span>
            </div>
          </div>

          {/* Pending Orders */}
          <div className="bg-white rounded-xl border border-[#d7e6e1] flex flex-col flex-1 overflow-hidden">
            <div className="p-4 border-b border-[#d7e6e1]">
              <h2 className="font-bold font-headline flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-[#006971]">assignment_late</span>
                📋 Pending Orders
              </h2>
              <div className="flex gap-2 overflow-x-auto pb-2">
                <button className="text-xs font-bold px-3 py-1 bg-[#006971] text-white rounded-full whitespace-nowrap">
                  All
                </button>
                <button className="text-xs font-bold px-3 py-1 border border-[#ba1a1a] text-[#ba1a1a] rounded-full whitespace-nowrap">
                  STAT
                </button>
                <button className="text-xs font-bold px-3 py-1 bg-[#e2f1ec] text-[#3c494b] rounded-full whitespace-nowrap">
                  Routine
                </button>
              </div>
            </div>
            <div className="p-4 space-y-3 overflow-y-auto flex-1">
              {queue.map((order) => (
                <div
                  key={order.id}
                  className={`p-3 rounded-lg border-l-4 ${
                    order.priority === "STAT"
                      ? "border-[#ba1a1a] bg-[#fff5f5]"
                      : "border-[#006971] bg-[#f0f7f6]"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-sm">{order.patient_name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        order.priority === "STAT"
                          ? "bg-[#ba1a1a] text-white"
                          : "bg-[#2bc6d4]/20 text-[#006971]"
                      }`}
                    >
                      {order.priority}
                    </span>
                  </div>
                  <p className="text-xs text-[#3c494b] mb-3">
                    {order.test_type} • {order.status}
                  </p>
                  <button className="text-[10px] font-bold text-white px-3 py-1 rounded bioluminescent-gradient"
                    onClick={() => {
                      fetch(`http://localhost:8000/api/radiology/queue/${order.id}`, {
                        method: 'PATCH', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({status: 'Completed', ai_pre_read: 'Normal Findings'})
                      }).then(fetchData);
                    }}
                  >
                    Mark Complete
                  </button>
                </div>
              ))}
              {queue.length === 0 && <div className="text-xs text-gray-500 text-center py-4">No pending orders</div>}
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="bg-white rounded-xl border border-[#d7e6e1] p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold font-headline text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006971]">calendar_today</span>
                📅 Today's Schedule
              </h2>
              <button className="text-[10px] font-bold text-[#006971] px-2 py-1 bg-[#006971]/10 rounded border border-[#006971]/20 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                AI Slot
              </button>
            </div>
            <div className="space-y-4 text-xs">
              <div className="relative pl-4 border-l-2 border-[#006971]/20 pb-2">
                <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-[#006971] ring-2 ring-white"></div>
                <div className="text-[10px] text-[#3c494b]">10:30 AM</div>
                <div className="font-bold">MRI Suite A - Scanning</div>
              </div>
              <div className="relative pl-4 border-l-2 border-[#006971]/20 pb-2">
                <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-[#e2f1ec] ring-2 ring-white"></div>
                <div className="text-[10px] text-[#3c494b]">11:15 AM</div>
                <div className="text-[#6c797b] italic">CT Available Slot</div>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: Fleet & AI */}
        <section className="lg:col-span-2 flex flex-col gap-4 overflow-y-auto">
          {/* Scanner Fleet Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fleet.map((scanner) => (
              <div key={scanner.id} className="bg-white rounded-xl p-4 border border-[#d7e6e1]">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-xs text-[#3c494b] uppercase tracking-wider">
                      {scanner.machine_type}
                    </div>
                    <h3 className="font-extrabold font-headline text-lg">{scanner.name}</h3>
                  </div>
                  <span className={`material-symbols-outlined text-3xl text-[#006971]`}>
                    {scanner.machine_type.toLowerCase().includes('mri') ? 'mri' : scanner.machine_type.toLowerCase().includes('ct') ? 'ct' : 'sensors'}
                  </span>
                </div>
                {scanner.status === 'Idle' ? (
                  <div className="flex items-center gap-3 py-4">
                    <div className="w-3 h-3 rounded-full bg-[#bbc9cb] animate-pulse"></div>
                    <span className="text-xl font-bold text-[#3c494b] uppercase">Idle Status</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 py-4">
                    <div className="w-3 h-3 rounded-full bg-[#006971]"></div>
                    <span className="text-xl font-bold text-[#006971] uppercase">Active Scanning</span>
                  </div>
                )}
                <div className="mt-auto pt-3 border-t border-[#d7e6e1] flex items-center gap-2 text-[10px] font-bold text-[#006971]">
                  <span className="material-symbols-outlined text-[14px]">
                    {scanner.status === 'Idle' ? "verified" : "sensors"}
                  </span>
                  {scanner.status} - {scanner.utilization_percent}% Utilized
                </div>
              </div>
            ))}
          </div>

          {/* Trauma Imaging Protocol */}
          <div className="bg-white rounded-xl border-2 border-[#ba1a1a] p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <span className="material-symbols-outlined text-9xl">emergency</span>
            </div>
            <div className="relative z-10 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <span className="w-4 h-4 bg-[#ba1a1a] rounded-full animate-ping"></span>
                  <h2 className="text-2xl font-black font-headline text-[#ba1a1a] tracking-tight">
                    🚨 Trauma Imaging Protocol
                  </h2>
                </div>
                <div className="bg-[#ba1a1a] text-white font-bold px-4 py-1 rounded text-sm animate-pulse">
                  Ambulance ETA 5m
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="text-xs text-[#3c494b] uppercase tracking-widest block mb-1">
                      Patient Profile
                    </label>
                    <div className="text-xl font-bold font-headline">
                      Male 45 • Blunt Chest Trauma
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-[#3c494b] uppercase tracking-widest block mb-1">
                      Imaging Protocol
                    </label>
                    <div className="text-xl font-bold font-headline flex items-center gap-2">
                      Pan-Scan (WBCT)
                      <span className="bg-[#e2f1ec] text-[#006971] text-[10px] px-2 py-0.5 rounded">
                        High Priority
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="text-xs text-[#3c494b] uppercase tracking-widest block mb-1">
                      Hardware Status
                    </label>
                    <div className="flex items-center gap-3 bg-[#ba1a1a]/10 p-3 rounded-lg border border-[#ba1a1a]/20">
                      <span className="material-symbols-outlined text-[#ba1a1a]">lock_clock</span>
                      <span className="font-bold font-headline text-[#ba1a1a]">
                        CT-02 Held for Arrival
                      </span>
                    </div>
                  </div>
                  <button className="w-full bioluminescent-gradient text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg">
                    <span className="material-symbols-outlined">launch</span>
                    ACTIVATE PROTOCOL
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section: Queue, Blockchain, AI Agents */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Radiologist Queue */}
            <div className="bg-white rounded-xl border border-[#d7e6e1] p-4">
              <h2 className="font-bold font-headline text-sm mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006971]">visibility</span>
                👨‍⚕️ Radiologist Queue
              </h2>
              <div className="space-y-2">
                {[
                  { id: "#992-MRI-Brain", doctor: "Dr. Miller", status: "AI PRE-READ" },
                  { id: "#104-CT-Thorax", doctor: "Trauma Bay", status: "STAT", urgent: true },
                ].map((item, i) => (
                  <div
                    key={i}
                    className={`p-2 rounded flex items-center justify-between text-xs ${
                      item.urgent
                        ? "bg-[#fff5f5] border-l-4 border-[#ba1a1a]"
                        : "bg-[#f0f7f6]"
                    }`}
                  >
                    <div>
                      <div className="font-bold">{item.id}</div>
                      <div className="text-[#3c494b] text-[10px]">{item.doctor}</div>
                    </div>
                    <span
                      className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                        item.urgent
                          ? "bg-[#ba1a1a] text-white"
                          : "bg-[#2bc6d4]/20 text-[#006971]"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Blockchain Verified */}
            <div className="bg-white rounded-xl border border-[#d7e6e1] p-4">
              <h2 className="font-bold font-headline text-sm mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006971]">verified_user</span>
                🔗 Blockchain-Verified
              </h2>
              <div className="space-y-2 text-[9px]">
                <div className="flex items-center gap-2 p-1.5 bg-[#f0f7f6] rounded">
                  <span className="material-symbols-outlined text-[#006971] text-sm">
                    shield
                  </span>
                  <div className="truncate text-[#3c494b]">0x71C9...8a12</div>
                </div>
                <div className="flex items-center gap-2 p-1.5 bg-[#f0f7f6] rounded">
                  <span className="material-symbols-outlined text-[#006971] text-sm">
                    shield
                  </span>
                  <div className="truncate text-[#3c494b]">0x04F5...b921</div>
                </div>
              </div>
            </div>

            {/* AI Agents */}
            <div className="bg-white rounded-xl border border-[#d7e6e1] p-4">
              <h2 className="font-bold font-headline text-sm mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006971]">smart_toy</span>
                🤖 Imaging AI Agents
              </h2>
              <div className="space-y-3">
                {[
                  { title: "Triage Agent", text: "Reordered queue for 2 Trauma STATs." },
                  { title: "Green Agent", text: "MRI-02 entered power saving mode." },
                  { title: "Bed Flow", text: "Escalated delay in OT-Silver return." },
                ].map((agent, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#2bc6d4]/20 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-[#006971] text-[14px]">
                        {i === 0 ? "shuffle" : i === 1 ? "eco" : "bed"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="text-[10px] font-bold text-[#006971]">{agent.title}</div>
                      <div className="text-[10px] text-[#3c494b]">{agent.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Supplies */}
          <div className="bg-white rounded-xl border border-[#d7e6e1] p-4">
            <h2 className="font-bold font-headline text-sm mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006971]">inventory_2</span>
              💉 Supplies
            </h2>
            <div className="space-y-3">
              {[
                { name: "Omnipaque 350mg", level: 82 },
                { name: "Gadavist 15ml", level: 14, low: true },
              ].map((supply, i) => (
                <div key={i}>
                  <div className="flex justify-between text-[10px] font-bold mb-1">
                    <span>{supply.name}</span>
                    <span className={supply.low ? "text-[#964904]" : "text-[#006971]"}>
                      {supply.level}%{supply.low ? " Low" : ""}
                    </span>
                  </div>
                  <div className="h-1 w-full bg-[#e2f1ec] rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full ${
                        supply.low ? "bg-[#ff9c56]" : "bioluminescent-gradient"
                      }`}
                      style={{ width: `${supply.level}%` }}
                    ></div>
                  </div>
                  {supply.low && (
                    <button className="w-full text-[9px] font-bold border border-[#bbc9cb] py-1 rounded hover:bg-[#f0f7f6] transition-colors">
                      AUTO-REORDER
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="h-10 bg-[#e2f1ec] border-t border-[#d7e6e1] px-6 flex items-center justify-between text-[10px]">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-[#3c494b] uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#bbc9cb]"></span>
            Connected to:
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-bold text-[#006971]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#006971]"></span> OT Silver
            </span>
            <span className="flex items-center gap-1.5 font-bold text-[#ba1a1a]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]"></span> Emergency Red
            </span>
            <span className="flex items-center gap-1.5 font-bold text-[#964904]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#964904]"></span> Lab Violet
            </span>
          </div>
        </div>
        <div>TEAL ZONE CENTRAL SYSTEM • SECURE ENCRYPTED CHANNEL 402-A</div>
      </footer>
    </div>
  );
}