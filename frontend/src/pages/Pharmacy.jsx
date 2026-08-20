import { useState } from 'react';
import { Pill, Search, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Pharmacy() {
  const { user } = useAuth();
  
  const [prescriptions] = useState([
    { id: 'RX-1001', patient: 'Priya Sharma', room: 'ICU-2', drug: 'Aspirin 81mg', status: 'pending', priority: 'Stat' },
    { id: 'RX-1002', patient: 'Rajesh Gupta', room: '2B-1', drug: 'Ceftriaxone 1g IV', status: 'dispensed', priority: 'Routine' },
    { id: 'RX-1003', patient: 'Arjun Kapoor', room: '6B-2', drug: 'Atorvastatin 40mg', status: 'pending', priority: 'Routine' },
    { id: 'RX-1004', patient: 'Anjali Roy', room: 'ICU-2', drug: 'Norepinephrine', status: 'pending', priority: 'Stat' }
  ]);

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-slate-800 font-['Manrope'] pb-12">
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
            <Pill className="text-orange-600 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">Pharmacy Operations</h1>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{user?.hospital_id === 1 ? 'Apex Medical Center' : 'Hospital Pharmacy'}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search RX..." className="pl-9 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm font-medium focus:ring-2 focus:ring-orange-500/30" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Pending RX', val: '12', color: 'orange' },
            { label: 'Stat Orders', val: '3', color: 'red' },
            { label: 'Dispensed Today', val: '145', color: 'green' },
            { label: 'Low Stock Alerts', val: '4', color: 'slate' }
          ].map(s => (
            <div key={s.label} className={`bg-white p-6 rounded-3xl border border-${s.color}-200 shadow-sm flex flex-col items-center justify-center`}>
              <div className={`text-4xl font-black text-${s.color}-600`}>{s.val}</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-2">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-800">Active Prescriptions</h2>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-white text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">RX ID</th>
                <th className="px-6 py-4">Patient & Location</th>
                <th className="px-6 py-4">Medication</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {prescriptions.map(rx => (
                <tr key={rx.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-slate-600">{rx.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800">{rx.patient}</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{rx.room}</div>
                  </td>
                  <td className="px-6 py-4 font-medium">{rx.drug}</td>
                  <td className="px-6 py-4">
                    {rx.priority === 'Stat' ? (
                      <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-50 px-2 py-1 rounded-lg w-max"><AlertTriangle className="w-3 h-3" /> Stat</span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">Routine</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {rx.status === 'pending' ? (
                      <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-orange-600 bg-orange-50 px-2 py-1 rounded-lg w-max border border-orange-200"><Clock className="w-3 h-3" /> Pending</span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-green-600 bg-green-50 px-2 py-1 rounded-lg w-max border border-green-200"><CheckCircle2 className="w-3 h-3" /> Dispensed</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {rx.status === 'pending' ? (
                      <button className="px-4 py-2 bg-orange-100 text-orange-700 hover:bg-orange-600 hover:text-white transition-colors rounded-xl text-xs font-bold uppercase tracking-widest">Dispense</button>
                    ) : (
                      <button disabled className="px-4 py-2 bg-slate-100 text-slate-400 rounded-xl text-xs font-bold uppercase tracking-widest">Done</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
