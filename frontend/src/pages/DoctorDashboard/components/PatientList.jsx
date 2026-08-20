import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Stethoscope, User, Clock, AlertTriangle, FileText, Pill } from 'lucide-react';

export default function PatientList({ patients }) {
  if (patients.length === 0) {
    return (
      <div className="bg-white p-10 rounded-[2rem] border border-slate-200 shadow-sm text-center">
        <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">No active patients</h3>
        <p className="text-slate-500 text-sm">You have no admitted patients under your care right now.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {patients.map(p => (
        <div key={p.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Room: {p.room}</span>
                {p.risk_label === 'High' || p.risk_label === 'Critical' ? (
                  <span className="text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-50 px-2 py-0.5 rounded-full flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {p.risk_label}</span>
                ) : (
                  <span className="text-[10px] font-black uppercase tracking-widest text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{p.risk_label} Risk</span>
                )}
              </div>
              <h3 className="text-lg font-black text-slate-800">{p.name}</h3>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">MRN: {p.mrn} · {p.age}y {p.gender}</p>
            </div>
          </div>
          
          <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Primary Diagnosis</div>
            <p className="text-sm font-bold text-slate-700 leading-snug">{p.diagnosis || 'Pending Diagnosis'}</p>
          </div>

          <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
            <div className="flex gap-2">
              <button className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors" title="View Labs">
                <FileText className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center hover:bg-orange-600 hover:text-white transition-colors" title="Prescribe Medication">
                <Pill className="w-4 h-4" />
              </button>
            </div>
            <button className="text-xs font-bold text-[#bc000c] group-hover:text-white group-hover:bg-[#bc000c] px-3 py-1.5 rounded-lg transition-colors">
              Open Chart →
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
