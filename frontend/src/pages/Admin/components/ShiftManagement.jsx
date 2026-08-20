import { API } from '../../../config/api';
import { useState, useEffect } from 'react';
import { Brain, CheckCircle2, AlertTriangle, CalendarDays, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ShiftManagement() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [showAiRec, setShowAiRec] = useState(true);

  useEffect(() => {
    // Fetch staff for assignment
    const fetchStaff = async () => {
      try {
        const res = await fetch(API.staff);
        const data = await res.json();
        setStaff(data.staff || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, []);

  const handleOptimize = () => {
    setOptimizing(true);
    // Simulate AI optimization delay
    setTimeout(() => {
      setOptimizing(false);
      setShowAiRec(false);
      // Simulate shuffling shifts for demonstration
      setStaff(prev => prev.map(s => ({
        ...s,
        shift: Math.random() > 0.5 ? 'Day' : 'Night',
        department: s.department === 'Emergency' ? (Math.random() > 0.5 ? 'ICU' : 'Emergency') : s.department
      })));
    }, 2000);
  };

  const updateShift = async (id, newShift) => {
    // In a real app, we'd hit a PATCH endpoint here.
    // For now, update local state
    setStaff(prev => prev.map(s => s.id === id ? { ...s, shift: newShift } : s));
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Shift & Duty Management</h2>
          <p className="text-sm text-slate-500 font-medium">Assign staff to departments and shifts. Changes take effect immediately.</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Staff Member</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Department</th>
              <th className="px-6 py-4">Availability</th>
              <th className="px-6 py-4 text-right">Assigned Shift</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {staff.map(s => (
              <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-800">{s.name}</div>
                  <div className="text-xs text-slate-500">{s.specialization || 'General'}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                    {s.role}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold text-slate-700">{s.department}</td>
                <td className="px-6 py-4">
                  {s.availability === 'Available' ? (
                    <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-green-600"><CheckCircle2 className="w-3 h-3" /> Available</span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-orange-600"><AlertTriangle className="w-3 h-3" /> {s.availability}</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <select 
                    value={s.shift || 'Day'} 
                    onChange={(e) => updateShift(s.id, e.target.value)}
                    className={`text-xs font-bold uppercase tracking-widest px-3 py-2 rounded-xl border ${s.shift === 'Night' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}
                  >
                    <option value="Day">Day (08:00 - 20:00)</option>
                    <option value="Night">Night (20:00 - 08:00)</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
