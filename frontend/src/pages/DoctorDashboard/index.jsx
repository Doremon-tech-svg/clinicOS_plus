import { useNavigate } from 'react-router-dom';
import { API } from '../../config/api';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import PatientList from './components/PatientList';
import DeptTabs    from './components/DeptTabs';
import ERPanel     from './components/ERPanel';
import { getDoctorDepts } from './deptConfig';
import { Stethoscope, Loader2, Activity, Settings, User, LogOut } from 'lucide-react';

function ProfileModal({ user, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-xl font-bold">×</button>
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-black">
            {user?.name?.charAt(0)}
          </div>
          <div>
            <div className="text-lg font-black text-slate-900">{user?.name}</div>
            <div className="text-xs font-bold uppercase text-blue-600 tracking-widest mt-0.5">{user?.role}</div>
            {user?.department && <div className="text-xs text-slate-400 mt-0.5">{user.department}</div>}
          </div>
          <div className="w-full mt-2 space-y-2 text-sm text-left">
            <div className="flex justify-between bg-slate-50 rounded-xl px-4 py-2.5">
              <span className="text-slate-400 font-bold">Email</span>
              <span className="font-bold text-slate-700">{user?.email || '—'}</span>
            </div>
            <div className="flex justify-between bg-slate-50 rounded-xl px-4 py-2.5">
              <span className="text-slate-400 font-bold">Hospital ID</span>
              <span className="font-bold text-slate-700">{user?.hospital_id || '—'}</span>
            </div>
            <div className="flex justify-between bg-slate-50 rounded-xl px-4 py-2.5">
              <span className="text-slate-400 font-bold">Role</span>
              <span className="font-bold text-slate-700">{user?.role}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-xl font-bold">×</button>
        <h3 className="text-base font-black mb-4 text-slate-800">Doctor Settings</h3>
        <div className="space-y-3 text-sm text-slate-600">
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="font-bold text-slate-700 mb-1">Notifications</p>
            <p className="text-xs text-slate-400">Patient update alerts are active by default.</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="font-bold text-slate-700 mb-1">Session</p>
            <p className="text-xs text-slate-400">12-hour JWT session. Auto-logout on expiry.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const DEPT_ROUTE = {
  'Emergency':  '/emergency',
  'Surgery':    '/surgery',
  'Maternity':  '/maternity',
  'Nursing':    '/nursing',
  'Pharmacy':   '/pharmacy',
  'Cardiology': '/nursing',
  'ICU':        '/nursing',
  'Neurology':  '/nursing',
  'Radiology':  '/nursing',
  'OPD':        '/nursing',
  'Lab':        '/nursing',
};

export default function DoctorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const depts    = getDoctorDepts(user);
  const [activeTab, setActiveTab] = useState(depts[0] || 'Patients');

  const handleWardRound = () => {
    const dept = user?.department || depts[0];
    const route = DEPT_ROUTE[dept] || '/nursing';
    navigate(route);
  };

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res  = await fetch(API.patients);
        const data = await res.json();
        const mine = (data.patients || []).filter(p => {
          if (user.role === 'dept_head') return p.department === user.department;
          return p.attending_doctor_id === user.profile_id;
        });
        setPatients(mine);
      } catch {} finally { setLoading(false); }
    };
    if (user) fetchPatients();
  }, [user]);

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-slate-800 font-['Manrope'] pb-12">
      {showProfile  && <ProfileModal  user={user} onClose={() => setShowProfile(false)} />}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}

      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Stethoscope className="text-blue-600 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">Physician Dashboard</h1>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              {user?.department || 'General'} · {user?.role === 'dept_head' ? 'Dept Head' : 'Attending'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-bold text-slate-800">{user?.name}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-blue-600">{user?.department}</div>
          </div>
          <button onClick={() => setShowSettings(true)} className="h-9 w-9 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors" title="Settings">
            <Settings className="h-4 w-4" />
          </button>
          <button onClick={() => setShowProfile(true)} className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-black shadow" title="Profile">
            {user?.name?.charAt(0) || 'D'}
          </button>
          <button onClick={logout} className="h-9 w-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors" title="Logout">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-8">
        {/* Stats */}
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
            <button
              onClick={handleWardRound}
              className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold uppercase tracking-widest text-xs hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
            >
              <Activity className="w-4 h-4" /> Start Ward Rounds
            </button>
          </div>
        </div>

        {/* Dept Tabs — only if assigned to specific depts */}
        {depts.length > 1 && (
          <DeptTabs depts={['Patients', ...depts]} active={activeTab} onSelect={setActiveTab} />
        )}

        {/* ER Tab */}
        {activeTab === 'Emergency' && <ERPanel />}

        {/* Default: My Patients */}
        {(activeTab === 'Patients' || depts.length <= 1) && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-extrabold text-slate-800">My Patients</h2>
            </div>
            {loading
              ? <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-slate-400" /></div>
              : <PatientList patients={patients} />
            }
          </>
        )}

        {/* Other dept placeholders */}
        {activeTab !== 'Emergency' && activeTab !== 'Patients' && (
          <div className="flex flex-col items-center py-20 text-slate-400 gap-2">
            <div className="text-4xl">🏛️</div>
            <p className="text-sm font-bold">{activeTab} module coming soon</p>
          </div>
        )}
      </main>
    </div>
  );
}
