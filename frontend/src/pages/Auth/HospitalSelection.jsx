import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, Search, Loader2, Bed, ArrowRight, Plus } from 'lucide-react';
import { API } from '../../config/api';

export default function HospitalSelection() {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(API.auth.hospitals)
      .then(r => r.json())
      .then(data => {
        if (data.success) setHospitals(data.hospitals);
        else setError('Could not load hospitals.');
      })
      .catch(() => setError('Backend connection failed. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  // Filter is derived state — recomputed on every query change (dynamic per keystroke)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return hospitals;
    return hospitals.filter(h =>
      h.name.toLowerCase().includes(q) ||
      (h.city || '').toLowerCase().includes(q)
    );
  }, [hospitals, query]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center font-['Manrope']">
      {/* Top bar */}
      <div className="w-full bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#bc000c] flex items-center justify-center">
            <Building2 className="text-white w-4 h-4" />
          </div>
          <span className="font-extrabold text-slate-800 text-lg tracking-tight">
            ClinicalPulse<span className="text-[#bc000c]">OS</span>
          </span>
        </div>
        <button
          onClick={() => navigate('/register-hospital')}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#bc000c] hover:text-[#9a000a] transition-colors"
        >
          <Plus className="w-4 h-4" /> Register Hospital
        </button>
      </div>

      <div className="w-full max-w-3xl px-6 py-16">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-3">Select Your Hospital</h1>
          <p className="text-slate-500 font-medium">Search and choose your facility to securely access your workspace.</p>
        </div>

        {/* Search box */}
        <div className="relative mb-6">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by hospital name or city..."
            className="w-full bg-white border border-slate-200 rounded-2xl pl-14 pr-6 py-5 text-base font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#bc000c]/20 shadow-sm transition-shadow"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 font-bold text-sm"
            >
              ✕
            </button>
          )}
        </div>

        {/* Results count badge */}
        {!loading && hospitals.length > 0 && (
          <p className="text-xs text-slate-400 font-medium mb-4 px-1">
            {query
              ? `${filtered.length} of ${hospitals.length} hospitals match "${query}"`
              : `${hospitals.length} registered facilities`}
          </p>
        )}

        {/* Results */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-[#bc000c]" />
            <p className="text-sm text-slate-400 font-medium">Loading hospitals...</p>
          </div>
        ) : error ? (
          <div className="text-center text-red-600 font-bold bg-red-50 border border-red-200 p-6 rounded-2xl">
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-slate-400 font-bold py-16">
            {query
              ? <>No hospitals matching <span className="text-slate-600">"{query}"</span></>
              : 'No hospitals registered yet.'}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(hospital => (
              <div
                key={hospital.id}
                onClick={() => navigate(`/login/${hospital.id}`)}
                className="bg-white rounded-2xl px-6 py-5 border border-slate-200 hover:border-[#bc000c]/30 hover:shadow-lg cursor-pointer group transition-all flex items-center gap-5"
              >
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-[#bc000c] transition-colors">
                  <Building2 className="w-6 h-6 text-[#bc000c] group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-extrabold text-slate-900 text-base truncate">{hospital.name}</div>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                      <MapPin className="w-3 h-3 shrink-0" /> {hospital.city || 'Location N/A'}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                      <Bed className="w-3 h-3 shrink-0" /> {hospital.total_beds} Beds
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-[#bc000c] group-hover:translate-x-1 transition-all shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
