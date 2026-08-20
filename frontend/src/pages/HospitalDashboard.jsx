import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield, Crown, AlertTriangle, Activity, Zap, Settings, Clock,
  Thermometer, ShieldCheck, Ambulance, Stethoscope, Baby, Trash2,
  Lock, Pill, FlaskConical, Radio, LayoutGrid, TrendingUp, Lightbulb,
  ExternalLink, ChevronRight, Droplets, Recycle, Brain, Loader2
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utility ---
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// --- Department Data ---
const DEPARTMENTS = [
  { id: 'admin', name: 'Admin', color: '#f4b13e', status: 'active', metric: '98%', icon: ShieldCheck, route: '/admin' },
  { id: 'ambulance', name: 'AMB', color: '#ef4444', status: 'critical', metric: '14', icon: Ambulance, route: '/emergency' },
  { id: 'surgery', name: 'OT', color: '#94a3b8', status: 'busy', metric: 'Silver', icon: Stethoscope, route: '/surgery' },
  { id: 'nursing', name: 'Nurse', color: '#3b82f6', status: 'active', metric: '42', icon: Activity, route: '/nursing' },
  { id: 'general', name: 'GEN', color: '#22c55e', status: 'active', metric: '85%', icon: Shield, route: '/opd' },
  { id: 'maternity', name: 'MAT', color: '#ec4899', status: 'active', metric: '8', icon: Baby, route: '/maternity' },
  { id: 'cleaning', name: 'Clean', color: '#64748b', status: 'on-schedule', metric: 'OK', icon: Trash2, route: '#' },
  { id: 'security', name: 'SEC', color: '#1e293b', status: 'all-clear', metric: '10', icon: ShieldCheck, route: '#' },
  { id: 'pharmacy', name: 'PHAR', color: '#f97316', status: 'good', metric: 'Low', icon: Pill, route: '#' },
  { id: 'lab', name: 'LAB', color: '#8b5cf6', status: 'pending', metric: '112', icon: FlaskConical, route: '/lab' },
  { id: 'radiology', name: 'RAD', color: '#14b8a6', status: 'idle', metric: '3', icon: Radio, route: '/radiology' },
];

const INITIAL_CHART_DATA = Array.from({ length: 24 }, (_, i) => ({
  time: `${i.toString().padStart(2, '0')}:00`,
  energy: 250 + Math.random() * 100,
  occupancy: 60 + Math.random() * 30,
}));

const LOW_OCCUPANCY_DATA = Array.from({ length: 24 }, (_, i) => ({
  time: `${i.toString().padStart(2, '0')}:00`,
  energy: 150 + Math.random() * 50,
  occupancy: 30 + Math.random() * 20,
}));

// Removed hardcoded logs and blockchain events

// --- Department Card Component (no hooks, safe) ---
const DeptCard = ({ dept, index, onClick }) => {
  const IconComp = dept.icon;
  const isClickable = dept.route && dept.route !== '#';
  const statusConfig = {
    critical: { label: 'Critical', dot: '#ef4444', pulse: true },
    busy: { label: 'Busy', dot: '#f59e0b', pulse: false },
    active: { label: 'Active', dot: '#22c55e', pulse: false },
    'on-schedule': { label: 'On Schedule', dot: '#22c55e', pulse: false },
    'all-clear': { label: 'All Clear', dot: '#22c55e', pulse: false },
    good: { label: 'Good', dot: '#22c55e', pulse: false },
    pending: { label: 'Pending', dot: '#f59e0b', pulse: true },
    idle: { label: 'Idle', dot: '#94a3b8', pulse: false },
  };
  const cfg = statusConfig[dept.status] || statusConfig.active;
  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r},${g},${b}`;
  };
  const rgb = hexToRgb(dept.color === '#1e293b' ? '#334155' : dept.color);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      whileHover={{ y: -6, scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="relative flex flex-col items-center gap-3 p-4 rounded-3xl border backdrop-blur-md select-none group"
      style={{
        background: `rgba(${rgb}, 0.08)`,
        borderColor: `rgba(${rgb}, 0.28)`,
        cursor: isClickable ? 'pointer' : 'default',
        minWidth: 88,
        boxShadow: `0 4px 20px rgba(${rgb}, 0.10)`,
      }}
    >
      <div className="absolute top-0 left-4 right-4 h-px rounded-full opacity-60"
        style={{ background: `linear-gradient(90deg, transparent, ${dept.color}, transparent)` }} />
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md relative"
        style={{ background: `linear-gradient(135deg, ${dept.color}dd, ${dept.color}88)` }}>
        <IconComp size={20} className="text-white" strokeWidth={1.8} />
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ boxShadow: `0 0 18px 4px ${dept.color}66` }} />
      </div>
      <p className="text-[11px] font-extrabold uppercase tracking-wider leading-none text-center"
        style={{ color: dept.color === '#1e293b' ? '#475569' : dept.color }}>{dept.name}</p>
      <p className="text-lg font-extrabold text-slate-800 leading-none tracking-tight">{dept.metric}</p>
      <div className="flex items-center gap-1.5">
        <span className={cn("w-2 h-2 rounded-full shrink-0", cfg.pulse && "animate-pulse")} style={{ backgroundColor: cfg.dot }} />
        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">{cfg.label}</span>
      </div>
      {isClickable && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: `${dept.color}22` }}>
          <ChevronRight size={10} style={{ color: dept.color }} />
        </div>
      )}
    </motion.div>
  );
};

// --- Main Component (all hooks inside) ---
export default function ClinicalCommandCenter() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [chaosMode, setChaosMode] = useState(false);
  const [chartData, setChartData] = useState(INITIAL_CHART_DATA);
  const [isLowOccupancy, setIsLowOccupancy] = useState(false);
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [predictedDischarges, setPredictedDischarges] = useState(12);
  const [ambulanceAlert, setAmbulanceAlert] = useState(null);
  const [ambulanceLoading, setAmbulanceLoading] = useState(true);


  const [aiLogs, setAiLogs] = useState([]);
  const [blockchainEvents, setBlockchainEvents] = useState([]);

  // Fetch bed flow predictions
  useEffect(() => {
    fetch('http://localhost:8000/api/bed-optimizer')
      .then(res => res.json())
      .then(data => {
        const soon = data.patients?.filter(p => p.predicted_discharge_days <= 1).length || 12;
        setPredictedDischarges(soon);
      })
      .catch(err => console.error('Bed flow fetch error:', err));
  }, []);

  // Fetch AI logs and blockchain events
  useEffect(() => {
    fetch('http://localhost:8000/api/admin/ai-audit')
      .then(res => res.json())
      .then(data => {
        const records = data.records || [];
        setAiLogs(records.map(r => ({
          id: r.id,
          time: new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          agent: `🤖 ${r.model_used || 'AI Agent'}`,
          action: `${r.decision_type.toUpperCase()}: ${r.input_text.slice(0, 30)}... Confidence: ${r.confidence}%`,
          status: 'success'
        })));
        
        // Also map to blockchain events if they have a hash
        setBlockchainEvents(records.filter(r => r.blockchain_tx).map(r => ({
          id: r.id,
          time: new Date(r.created_at).toLocaleTimeString(),
          action: 'AI Decision',
          patient: r.decision_type,
          hash: r.blockchain_tx
        })));
      })
      .catch(err => console.error('AI audit fetch error:', err));
  }, []);


  // Fetch ambulance live alerts
  useEffect(() => {
    const fetchAmbulance = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/live-alerts');
        if (res.ok) {
          const data = await res.json();
          const active = data.alerts?.filter(a => a.status === 'En Route' || a.status === 'Dispatched') || [];
          const sorted = active.sort((a, b) => {
            if (a.severity === 'Critical' && b.severity !== 'Critical') return -1;
            if (b.severity === 'Critical' && a.severity !== 'Critical') return 1;
            return (parseInt(a.eta) || 99) - (parseInt(b.eta) || 99);
          });
          setAmbulanceAlert(sorted[0] || null);
        }
      } catch (err) {
        console.error('Ambulance fetch error:', err);
      } finally {
        setAmbulanceLoading(false);
      }
    };
    fetchAmbulance();
    const interval = setInterval(fetchAmbulance, 20000);
    return () => clearInterval(interval);
  }, []);

  // Clock update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleChaosMode = () => setChaosMode(!chaosMode);
  const simulateLowOccupancy = () => {
    setIsLowOccupancy(true);
    setChartData(LOW_OCCUPANCY_DATA);
    setShowRecommendation(true);
  };
  const handleDeptClick = (dept) => {
    if (dept.route && dept.route !== '#') navigate(dept.route);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-body selection:bg-amber-500/30">

      {/* Header */}
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-8 h-16 bg-[#EC9A04] shadow-md border-b border-amber-600/20">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <Crown className="text-white fill-white/20 w-6 h-6" />
            <h1 className="text-xl font-extrabold tracking-tighter text-white font-headline">Clinical Command</h1>
          </div>
          <nav className="hidden md:flex gap-6 items-center h-full">
            <a href="#" className="text-white border-b-2 border-white h-full flex items-center px-1 font-headline font-semibold tracking-tight">Admin Command Center</a>
            <a href="#" className="text-white/80 hover:text-white transition-colors h-full flex items-center px-1 font-headline font-semibold tracking-tight">Intelligence</a>
            <a href="#" className="text-white/80 hover:text-white transition-colors h-full flex items-center px-1 font-headline font-semibold tracking-tight">Sustainability</a>
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 bg-white/20 px-3 py-1.5 rounded-full border border-white/30">
            <span className="w-2 h-2 rounded-full bg-teal-300 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-widest text-white">Normal Operations</span>
          </div>
          <button onClick={toggleChaosMode} className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full transition-all border", chaosMode ? "bg-slate-800 text-white border-slate-700" : "bg-white/20 text-white border-white/30 hover:bg-white/30")}>
            <Settings size={14} />
            <span className="text-xs font-bold uppercase">Chaos Mode</span>
          </button>
          <div className="flex items-center gap-4 text-white/90">
            <div className="flex items-center gap-1.5"><Clock size={16} /><span className="text-xs font-mono font-medium">{currentTime}</span></div>
            <div className="flex items-center gap-1.5"><Thermometer size={16} /><span className="text-xs font-medium">24°C</span></div>
          </div>
          
          {user && (
            <div className="flex items-center gap-3 border-l border-white/20 pl-4 ml-2">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-white">{user.name}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-white/70">{user.role}</div>
              </div>
              <button onClick={logout} className="h-10 w-10 rounded-full border-2 border-white/50 bg-white/20 flex items-center justify-center text-sm font-bold text-white hover:bg-red-500 transition-colors" title="Logout">
                {user.name.charAt(0)}
              </button>
            </div>
          )}
        </div>
      </header>

      <main className={cn("max-w-7xl mx-auto pt-24 px-8 pb-20 transition-all duration-700 ease-in-out", chaosMode && "grayscale contrast-125 brightness-110")}>


        {/* Department Cards */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3"><Shield className="text-[#EC9A04] w-6 h-6" /><h2 className="text-2xl font-headline font-bold tracking-tight text-slate-800">Admin Command Center</h2></div>
            <div className="flex gap-2"><div className="h-1.5 w-12 bg-[#EC9A04] rounded-full"></div><div className="h-1.5 w-4 bg-slate-200 rounded-full"></div><div className="h-1.5 w-4 bg-slate-200 rounded-full"></div></div>
          </div>
          <div className="w-full rounded-[2rem] p-6 border border-amber-200/50 backdrop-blur-md" style={{ background: 'rgba(255,248,230,0.55)' }}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2"><Crown className="text-[#EC9A04] w-4 h-4 fill-amber-400/20" /><span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-amber-700">Live Department Status</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" /><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">All Systems Nominal</span></div>
            </div>
            <div className="grid grid-cols-11 gap-3">
              {DEPARTMENTS.map((dept, i) => <DeptCard key={dept.id} dept={dept} index={i} onClick={() => handleDeptClick(dept)} />)}
            </div>
            <div className="flex items-center gap-6 mt-5 pt-4 border-t border-amber-200/40">
              {[{ dot: '#ef4444', label: 'Critical', pulse: true }, { dot: '#f59e0b', label: 'Busy / Pending', pulse: false }, { dot: '#22c55e', label: 'Active / Clear', pulse: false }, { dot: '#94a3b8', label: 'Idle', pulse: false }].map(s => (
                <div key={s.label} className="flex items-center gap-1.5"><span className={cn("w-2 h-2 rounded-full", s.pulse && "animate-pulse")} style={{ backgroundColor: s.dot }} /><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</span></div>
              ))}
              <div className="ml-auto flex items-center gap-1.5"><ChevronRight size={10} className="text-amber-400" /><span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Click a card to open dashboard</span></div>
            </div>
          </div>
        </section>


        <div className="grid grid-cols-12 gap-8">

          {/* Left Panel */}
          <div className="col-span-12 lg:col-span-4 space-y-8">
            <div className="glass-panel p-8 rounded-[2.5rem] bg-amber-100/30 backdrop-blur-md border border-amber-200/50 shadow-sm relative overflow-hidden group">
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-colors" />
              <div className="flex justify-between items-center mb-6"><h3 className="text-lg font-headline font-bold text-slate-800">Bed Occupancy</h3><Settings className="text-slate-400 w-5 h-5 cursor-pointer hover:rotate-90 transition-transform" /></div>
              <div className="relative w-52 h-52 mx-auto mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart><Pie data={[{ name: 'Occupied', value: 187 }, { name: 'Available', value: 63 }]} innerRadius={75} outerRadius={95} paddingAngle={5} dataKey="value" startAngle={90} endAngle={450}><Cell fill="#EC9A04" stroke="none" /><Cell fill="rgba(255,255,255,0.4)" stroke="none" /></Pie></PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center"><p className="text-5xl font-extrabold font-headline text-slate-800">187</p><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">/ 250 Beds</p></div>
              </div>
              <div className="bg-amber-100/40 rounded-2xl p-4 flex items-start gap-4 border border-amber-200/50">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0"><Brain className="text-[#EC9A04] w-6 h-6" /></div>
                <div><p className="text-xs font-bold text-amber-600 uppercase tracking-tight">Bed Flow Optimizer</p><p className="text-sm text-slate-700 font-semibold leading-relaxed">AI Predicted Discharges (Next 24h): <span className="text-amber-700">{predictedDischarges}</span></p></div>
              </div>
            </div>
            <div className="space-y-4">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full bg-[#ef4444] text-white py-6 rounded-3xl flex items-center justify-center gap-4 shadow-xl shadow-red-200 border border-red-400 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <AlertTriangle className="w-8 h-8 fill-white/20 animate-pulse" />
                <div className="text-left"><p className="text-lg font-bold font-headline leading-tight tracking-tight uppercase">Activate Code Blue</p><p className="text-xs text-white/70 font-medium">Manual Emergency Protocol</p></div>
              </motion.button>
              <button className="w-full bg-amber-100/40 backdrop-blur-md hover:bg-amber-100/60 transition-all py-5 rounded-3xl flex items-center justify-center gap-4 border border-amber-200/50 text-slate-700 group"><LayoutGrid className="w-5 h-5 text-amber-600 group-hover:rotate-12 transition-transform" /><span className="text-sm font-bold uppercase tracking-[0.15em]">Generate Shift Report</span></button>
            </div>
          </div>


          {/* Center Panel */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">


              {/* Ambulance Tracker - Live */}
              <div className="glass-panel rounded-[2.5rem] overflow-hidden bg-amber-100/30 backdrop-blur-md border border-amber-200/50 shadow-sm">
                <div className="p-6 bg-amber-100/40 border-b border-amber-200/40 flex justify-between items-center">
                  <div className="flex items-center gap-3"><Ambulance className="text-red-500 w-5 h-5" /><span className="font-headline font-bold text-slate-800">Ambulance Tracker</span></div>
                  <div className="flex items-center gap-2">{ambulanceLoading && <Loader2 className="w-4 h-4 animate-spin text-amber-600" />}<span className="flex items-center gap-1.5 text-[10px] font-bold text-red-500 bg-red-50 px-3 py-1 rounded-full animate-pulse border border-red-100 uppercase tracking-widest">Live</span></div>
                </div>
                <div className="relative h-44 group">
                  <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800" alt="Map" className="w-full h-full object-cover opacity-60 contrast-75 brightness-95" />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center p-6">
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-amber-50/95 backdrop-blur-xl p-5 rounded-3xl border border-amber-100 shadow-2xl w-full">
                      {ambulanceAlert ? (
                        <>
                          <div className="flex items-center gap-4 mb-3">
                            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center shrink-0"><Activity className="text-red-600 w-6 h-6" /></div>
                            <div><p className="text-sm font-bold text-slate-800">{ambulanceAlert.incident}</p><p className="text-xs font-semibold text-slate-500">Unit: {ambulanceAlert.unit} · Routing to: <span className="text-slate-800 font-bold">{ambulanceAlert.department || 'OT Silver'}</span></p></div>
                          </div>
                          <div className="flex justify-between items-end">
                            <div><p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-0.5">ETA</p><p className="text-3xl font-extrabold text-red-600 font-headline leading-none">{ambulanceAlert.eta}</p></div>
                            <button onClick={() => navigate('/emergency')} className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#EC9A04] border-2 border-[#EC9A04]/20 px-4 py-2 rounded-xl hover:bg-[#EC9A04] hover:text-white transition-all flex items-center gap-1">View Details <ExternalLink size={10} /></button>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-4"><p className="text-sm font-medium text-slate-500">No active ambulance dispatches</p><button onClick={() => navigate('/emergency')} className="mt-2 text-xs font-bold text-[#EC9A04] hover:underline">Go to Emergency Portal →</button></div>
                      )}
                    </motion.div>
                  </div>
                </div>
              </div>


              {/* Energy Chart */}
              <div className="glass-panel rounded-[2.5rem] p-8 bg-amber-100/30 backdrop-blur-md border border-amber-200/50 shadow-sm relative overflow-hidden group">
                <div className="flex justify-between items-center mb-6"><div className="flex items-center gap-2"><Zap className="text-amber-500 w-5 h-5" /><h3 className="font-headline font-bold text-slate-800">Utilization Flux</h3></div>
                  <button onClick={simulateLowOccupancy} disabled={isLowOccupancy} className={cn("text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full transition-all border", isLowOccupancy ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed" : "bg-amber-100/50 hover:bg-amber-100 text-slate-600 border-amber-200 shadow-sm")}>Simulate Low</button>
                </div>
                <div className="h-40 -mx-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs><linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient><linearGradient id="colorOcc" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#14b8a6" stopOpacity={0.1} /><stop offset="95%" stopColor="#14b8a6" stopOpacity={0} /></linearGradient></defs>
                      <Area type="monotone" dataKey="energy" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorEnergy)" />
                      <Area type="monotone" dataKey="occupancy" stroke="#14b8a6" strokeWidth={2} fillOpacity={1} fill="url(#colorOcc)" />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} itemStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 flex gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500" /> Energy</div><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-teal-500" /> Occupancy</div></div>
                <AnimatePresence>{showRecommendation && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-6 bg-teal-50 border border-teal-100 p-4 rounded-2xl flex items-start gap-3"><Lightbulb className="text-teal-600 w-5 h-5 shrink-0 mt-0.5" /><div><p className="text-xs font-bold text-teal-800 uppercase tracking-tight mb-0.5">Green Strategy Detected</p><p className="text-sm text-teal-700 leading-snug">Reduce AC in Green Wing. Estimated savings: <span className="font-bold">₹1,200/day</span>.</p></div></motion.div>)}</AnimatePresence>
              </div>
            </div>


            {/* AI Agent Log */}
            <div className="glass-panel rounded-[2.5rem] bg-amber-100/30 backdrop-blur-md border border-amber-200/50 shadow-sm overflow-hidden">
              <div className="p-6 bg-amber-100/30 border-b border-amber-200/40 flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center"><Brain className="text-amber-600 w-5 h-5" /></div><h3 className="font-headline font-bold text-slate-800">AI Agent Activity Log</h3></div><div className="flex items-center gap-4"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Live Stream</span><ExternalLink className="w-4 h-4 text-slate-300 hover:text-amber-500 transition-colors cursor-pointer" /></div></div>
              <div className="p-8 space-y-6 max-h-[300px] overflow-y-auto scrollbar-hide">
                {aiLogs.length === 0 ? <p className="text-sm text-slate-500 text-center py-4">No AI logs available</p> : aiLogs.map((log) => (
                  <motion.div initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} key={log.id} className="flex gap-5 group">
                    <div className="flex flex-col items-center"><div className={cn("w-3 h-3 rounded-full mt-1.5 shrink-0 transition-all", log.status === 'success' ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]')} /><div className="w-px h-full bg-slate-200 mt-2" /></div>
                    <div><div className="flex items-center gap-2 mb-1"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{log.time}</span><span className="w-1 h-1 rounded-full bg-slate-200" /><span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-tight">{log.agent}</span></div><p className="text-sm text-slate-700 font-medium leading-relaxed group-hover:text-slate-900 transition-colors">{log.action}</p></div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>


        {/* Trust & Sustainability */}
        <section className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-panel rounded-[2.5rem] bg-amber-100/30 backdrop-blur-md border border-amber-200/50 shadow-sm overflow-hidden flex flex-col">
            <div className="p-8 border-b border-amber-200/40 flex justify-between items-center bg-amber-100/20"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center"><Lock className="text-purple-600 w-6 h-6" /></div><div><h3 className="font-headline font-bold text-slate-800">Blockchain Trust Ledger</h3><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Immutable Consent Tracking</p></div></div><div className="flex flex-col items-end gap-1"><span className="text-xs font-bold text-purple-700">34 Active Consents</span><span className="bg-red-100 text-red-600 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest border border-red-200">2 Expiring Soon</span></div></div>
            <div className="flex-grow overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-amber-100/10 text-slate-400 font-label text-[10px] uppercase tracking-[0.2em] border-b border-amber-200/20"><tr><th className="px-8 py-4 font-bold">Timestamp</th><th className="px-8 py-4 font-bold">Action</th><th className="px-8 py-4 font-bold">Hash</th><th className="px-8 py-4 font-bold">Verification</th></tr></thead><tbody className="divide-y divide-white/20">{blockchainEvents.length === 0 ? <tr><td colSpan={4} className="px-8 py-5 text-center text-slate-500 text-xs">No blockchain events found</td></tr> : blockchainEvents.map((evt) => (<tr key={evt.id} className="hover:bg-amber-100/30 transition-colors group"><td className="px-8 py-5 font-mono text-[11px] text-slate-500 font-medium">{evt.time}</td><td className="px-8 py-5"><div className="flex flex-col"><span className="font-bold text-slate-700 tracking-tight">{evt.action}</span><span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: {evt.patient}</span></div></td><td className="px-8 py-5 font-mono text-[11px] text-amber-600/70 font-semibold group-hover:text-amber-600 transition-colors">{evt.hash.slice(0,10)}...{evt.hash.slice(-6)}</td><td className="px-8 py-5 text-right"><button className="text-[10px] font-bold text-teal-600 uppercase tracking-widest hover:text-teal-700 flex items-center gap-2 transition-colors ml-auto">Verify <ExternalLink size={10} /></button></td></tr>))}</tbody></table></div>
            <div className="p-4 bg-amber-100/30 border-t border-amber-200/40"><button className="w-full py-3 text-[10px] font-extrabold uppercase tracking-[0.3em] text-slate-500 hover:text-slate-800 transition-all flex items-center justify-center gap-2">Explore Full Ledger <ChevronRight size={14} /></button></div>
          </div>
          <div className="glass-panel rounded-[2.5rem] p-8 bg-amber-100/30 backdrop-blur-md border border-amber-200/50 shadow-sm relative flex flex-col justify-between overflow-hidden">
            <div className="absolute -right-20 -top-20 w-60 h-60 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="flex justify-between items-start mb-10 relative z-10"><div><h3 className="font-headline font-bold flex items-center gap-3 text-slate-800 text-xl"><div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center"><Droplets className="text-emerald-600 w-6 h-6" /></div>Sustainability Dashboard</h3><p className="text-xs text-slate-500 font-medium mt-1">Real-time carbon footprint optimization</p></div><div className="text-right"><p className="text-4xl font-extrabold font-headline text-emerald-700 leading-none tracking-tighter">245<span className="text-lg">kW</span></p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Current Usage / 380kW Baseline</p></div></div>
            <div className="space-y-8 relative z-10">
              <div><div className="flex justify-between items-end mb-2"><span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Energy Efficiency</span><span className="text-xs font-extrabold text-emerald-700">64.5%</span></div><div className="w-full bg-emerald-100 h-3 rounded-full overflow-hidden shadow-inner border border-emerald-200/50 p-0.5"><motion.div initial={{ width: 0 }} animate={{ width: '64.5%' }} transition={{ duration: 1.5, ease: "easeOut" }} className="h-full bg-emerald-500 rounded-full relative"><div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]" /></motion.div></div></div>
              <div className="grid grid-cols-2 gap-6"><div className="bg-amber-100/50 p-4 rounded-3xl border border-amber-200/80"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1">Water Recycled</p><div className="flex items-center gap-2"><TrendingUp size={14} className="text-emerald-500" /><span className="text-xl font-extrabold text-slate-800">1,240 <span className="text-xs">L</span></span></div></div><div className="bg-amber-100/50 p-4 rounded-3xl border border-amber-200/80"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1">Waste Redirected</p><div className="flex items-center gap-2"><Recycle size={14} className="text-amber-500" /><span className="text-xl font-extrabold text-slate-800">85<span className="text-xs">%</span></span></div></div></div>
              <motion.div whileHover={{ y: -5 }} className="bg-emerald-600 p-6 rounded-[2rem] border border-emerald-500 shadow-xl shadow-emerald-200/50 relative overflow-hidden group"><Lightbulb className="absolute -right-4 -top-4 w-24 h-24 text-white/10 group-hover:scale-110 transition-transform duration-500" /><div className="flex items-start gap-4 relative z-10"><div className="w-12 h-12 bg-amber-100/30 rounded-2xl flex items-center justify-center shrink-0 backdrop-blur-md"><Brain className="text-white w-6 h-6" /></div><div><p className="text-xs font-bold uppercase tracking-widest text-emerald-100 mb-1">AI Recommendation</p><p className="text-sm font-semibold text-white leading-relaxed">Shift non-urgent MRI scans to 3 AM to 5 AM window. Estimated savings: <span className="underline decoration-emerald-300">₹850/shift</span>.</p><button className="mt-4 bg-white text-emerald-700 text-[10px] font-extrabold py-2 px-6 rounded-full transition-all hover:bg-emerald-50 uppercase tracking-widest shadow-md">Implement Now</button></div></div></motion.div>
            </div>
          </div>
        </section>
      </main>

      <motion.button whileHover={{ scale: 1.1, rotate: 5 }} whileTap={{ scale: 0.9 }} className="fixed bottom-10 right-10 w-16 h-16 bg-[#EC9A04] text-white rounded-[1.5rem] shadow-2xl shadow-amber-500/40 flex items-center justify-center group z-[100]">
        <Zap className="w-8 h-8 fill-white/20 group-hover:scale-110 transition-transform" />
        <div className="absolute right-full mr-4 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Express Action</div>
      </motion.button>

      <style>{`
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .glass-panel { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .glass-panel:hover { transform: translateY(-4px); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02); }
        ::-webkit-scrollbar { width: 0px; background: transparent; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}