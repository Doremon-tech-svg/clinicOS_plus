import { useNavigate } from 'react-router-dom';
import { Activity, Shield, Brain, ArrowRight, Ambulance, HeartPulse, Building2, Stethoscope, FileText, Syringe } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    { icon: Activity, title: 'AI-Powered Triage', desc: 'Predictive analytics for ER patient routing and risk stratification.' },
    { icon: Ambulance, title: 'Smart Fleet Management', desc: 'Real-time GPS tracking and automated dispatch of ambulances.' },
    { icon: Brain, title: 'Bed Flow Optimizer', desc: 'Machine learning predicts discharges to optimize bed utilization.' },
    { icon: Shield, title: 'Blockchain Audit Trail', desc: 'Immutable medical records and AI decision logs for ultimate security.' },
    { icon: Stethoscope, title: 'Clinical Operations', desc: 'Integrated dashboards for Surgeons, Nurses, and Lab Techs.' },
    { icon: Syringe, title: 'Pharmacy & Labs', desc: 'Streamlined medication dispensing and critical lab result flagging.' }
  ];

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-slate-900 font-['Manrope'] selection:bg-red-500/30">
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#bc000c] to-[#ea0012] flex items-center justify-center">
              <HeartPulse className="text-white w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-800">ClinicalPulse<span className="text-[#bc000c]">OS</span></span>
          </div>
          <div className="flex gap-4">
            <button onClick={() => navigate('/login')} className="px-5 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">Login</button>
            <button onClick={() => navigate('/register-hospital')} className="px-5 py-2 text-sm font-bold bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-colors shadow-lg">Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        <div className="lg:w-1/2 space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100 border border-red-200">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-red-700">The Future of Healthcare</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-[1.1] text-slate-900">
            Intelligent <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#bc000c] to-[#ea0012]">Hospital Operating System</span>
          </h1>
          <p className="text-lg text-slate-500 font-medium max-w-xl leading-relaxed">
            Unify your emergency room, wards, laboratories, and fleet under one AI-driven, blockchain-secured platform. ClinicalPulseOS empowers your staff to save lives faster.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={() => navigate('/register-hospital')} className="px-8 py-4 bg-[#bc000c] hover:bg-[#a0000a] text-white rounded-2xl font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 shadow-xl shadow-red-200 transition-all">
              <Building2 className="w-5 h-5" /> Register Your Hospital
            </button>
            <button onClick={() => navigate('/login')} className="px-8 py-4 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-2xl font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 shadow-sm transition-all">
              Staff Portal Login <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="lg:w-1/2 w-full relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-red-100 to-blue-50 rounded-[3rem] blur-3xl opacity-50" />
          <div className="relative bg-white p-2 rounded-[2rem] shadow-2xl border border-slate-200/60">
            <img src="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=1200" alt="Hospital Dashboard" className="rounded-[1.5rem] object-cover w-full h-[400px] contrast-[1.05]" />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-4">Everything your facility needs.</h2>
            <p className="text-slate-500">Built for scale, speed, and security.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div key={i} whileHover={{ y: -5 }} className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl transition-all">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 text-[#bc000c]">
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 text-center">
        <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
          <HeartPulse className="w-5 h-5" />
          <span className="font-extrabold tracking-tight">ClinicalPulse<span className="text-red-500">OS</span></span>
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">© 2026 Apex Medical Systems. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
