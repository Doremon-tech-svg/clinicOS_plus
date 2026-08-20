import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, Loader2, Bed } from 'lucide-react';

export default function HospitalSelection() {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/auth/hospitals');
        const data = await res.json();
        if (data.success) {
          setHospitals(data.hospitals);
        } else {
          setError('Failed to load hospitals.');
        }
      } catch (err) {
        setError('Network error connecting to backend.');
      } finally {
        setLoading(false);
      }
    };
    fetchHospitals();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f3f3] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#bc000c]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f3f3] flex flex-col items-center py-12 px-6 font-['Manrope'] text-slate-800">
      <div className="text-center mb-10 mt-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 shadow-xl mb-6">
          <Building2 className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-3xl font-black tracking-tight text-slate-900">
          Select Your Facility
        </h2>
        <p className="mt-2 text-sm text-slate-500 font-medium">
          Choose a hospital network to securely access your workspace.
        </p>
      </div>

      <div className="w-full max-w-4xl">
        {error && (
          <div className="text-sm font-bold text-red-600 bg-red-50 p-4 rounded-xl border border-red-200 mb-6 text-center">
            {error}
          </div>
        )}

        {hospitals.length === 0 && !error ? (
          <div className="text-center text-slate-500 bg-white p-10 rounded-3xl shadow-sm border border-slate-200">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="font-bold text-lg">No hospitals registered yet.</p>
            <button onClick={() => navigate('/register-hospital')} className="mt-4 px-6 py-2 bg-[#bc000c] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#9a000a]">
              Register a Hospital Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hospitals.map(hospital => (
              <div 
                key={hospital.id} 
                onClick={() => navigate(`/login/${hospital.id}`)}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col h-full"
              >
                <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[#bc000c] transition-colors">
                  <Building2 className="w-6 h-6 text-[#bc000c] group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-2">{hospital.name}</h3>
                
                <div className="mt-auto space-y-2 pt-4">
                  <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                    <MapPin className="w-4 h-4 text-slate-400" /> {hospital.city || 'Location unavailable'}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                    <Bed className="w-4 h-4 text-slate-400" /> {hospital.total_beds || 0} Beds Available
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[#bc000c] font-bold text-sm">
                  Access Portal <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="mt-12 text-center flex gap-4">
        <button onClick={() => navigate('/')} className="text-xs font-bold text-slate-500 hover:text-slate-800 uppercase tracking-widest transition-colors">
          Back to Home
        </button>
        <button onClick={() => navigate('/register-hospital')} className="text-xs font-bold text-[#bc000c] hover:text-[#9a000a] uppercase tracking-widest transition-colors">
          Register New Hospital
        </button>
      </div>
    </div>
  );
}
