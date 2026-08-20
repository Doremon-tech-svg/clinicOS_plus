import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Ambulance, Stethoscope, Activity, Shield, Baby, Trash2, Pill, FlaskConical, Radio, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const DEPARTMENTS = [
  { id: 'ambulance', name: 'Emergency', color: '#ef4444', status: 'critical', metric: '14 Active', icon: Ambulance, route: '/emergency' },
  { id: 'surgery', name: 'Surgery', color: '#64748b', status: 'busy', metric: '4 OT Run', icon: Stethoscope, route: '/surgery' },
  { id: 'nursing', name: 'Nursing & ICU', color: '#3b82f6', status: 'active', metric: '85% Full', icon: Activity, route: '/nursing' },
  { id: 'general', name: 'OPD General', color: '#22c55e', status: 'active', metric: '32 Wait', icon: Shield, route: '/opd' },
  { id: 'maternity', name: 'Maternity', color: '#ec4899', status: 'active', metric: '8 Born', icon: Baby, route: '/maternity' },
  { id: 'pharmacy', name: 'Pharmacy', color: '#f97316', status: 'good', metric: 'Stock OK', icon: Pill, route: '/pharmacy' },
  { id: 'lab', name: 'Laboratory', color: '#8b5cf6', status: 'pending', metric: '12 Wait', icon: FlaskConical, route: '/lab' },
  { id: 'radiology', name: 'Radiology', color: '#14b8a6', status: 'idle', metric: '3 Scans', icon: Radio, route: '/radiology' },
];

export default function DepartmentOverview() {
  const navigate = useNavigate();

  const getStatusDot = (status) => {
    switch (status) {
      case 'critical': return { color: 'bg-red-500', pulse: true };
      case 'busy': case 'pending': return { color: 'bg-amber-500', pulse: false };
      case 'active': case 'good': return { color: 'bg-green-500', pulse: false };
      default: return { color: 'bg-slate-400', pulse: false };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-800">Department Overview</h2>
        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Critical</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Busy</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500" /> Normal</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {DEPARTMENTS.map((dept, i) => {
          const IconComp = dept.icon;
          const status = getStatusDot(dept.status);
          
          return (
            <motion.div
              key={dept.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(dept.route)}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md"
                  style={{ backgroundColor: dept.color }}
                >
                  <IconComp size={24} />
                </div>
                <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-full border border-slate-100">
                  <span className={`w-2 h-2 rounded-full ${status.color} ${status.pulse ? 'animate-pulse' : ''}`} />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">{dept.status}</span>
                </div>
              </div>
              
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-1">{dept.name}</h3>
              <p className="text-2xl font-extrabold text-slate-800 tracking-tight">{dept.metric}</p>
              
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-sm font-bold text-slate-500 group-hover:text-slate-900 transition-colors">
                Open Dashboard <ChevronRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
