import { API } from '../../config/api';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import PatientList from './components/PatientList';
import { Stethoscope, Loader2, Activity } from 'lucide-react';

export default function DoctorDashboard() {
  const { user, logout } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch patients assigned to this doctor
    // For demo, we just fetch all patients and filter by doctor ID (user.profile_id)
    const fetchPatients = async () => {
      try {
        const res = await fetch(API.patients);
        const data = await res.json();
        
        // Ensure the doctor only sees their own patients, or if department head, patients in their dept
        const myPatients = (data.patients || []).filter(p => {
          if (user.role === 'dept_head') return p.department === user.department;
          return p.attending_doctor_id === user.profile_id;
        });
        
        setPatients(myPatients);
      } catch (err) {
        console.error("Failed to load patients", err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchPatients();
  }, [user]);

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-slate-800 font-['Manrope'] pb-12">
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Stethoscope className="text-blue-600 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">Physician Dashboard</h1>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{user?.department} Department</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-bold text-slate-800">{user?.name}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-blue-600">{user?.role === 'dept_head' ? 'Dept Head' : 'Attending'}</div>
          </div>
          <button onClick={logout} className="h-10 w-10 rounded-full border-2 border-slate-200 bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 hover:bg-red-500 hover:text-white hover:border-red-600 transition-colors" title="Logout">
            {user?.name?.charAt(0) || 'U'}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-[2rem] text-white shadow-lg shadow-blue-200">
            <h2 className="text-sm font-black uppercase tracking-widest text-blue-200 mb-1">My Active Patients</h2>
            <div className="text-5xl font-extrabold">{patients.length}</div>
          </div>
          
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-center">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Critical / High Risk</h2>
            <div className="text-3xl font-extrabold text-red-600">
              {patients.filter(p => p.risk_label === 'High' || p.risk_label === 'Critical').length}
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-center items-center">
            <button className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold uppercase tracking-widest text-xs hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
              <Activity className="w-4 h-4" /> Start Ward Rounds
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-extrabold text-slate-800">My Patients</h2>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-slate-400" /></div>
        ) : (
          <PatientList patients={patients} />
        )}
      </main>
    </div>
  );
}
