import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, ArrowRight, Activity, ArrowLeft } from 'lucide-react';
import { API } from '../config/api';

export default function Login() {
  const { hospitalId } = useParams();
  const [hospital, setHospital] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHospital, setLoadingHospital] = useState(true);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  // Load selected hospital info
  useEffect(() => {
    if (!hospitalId) { navigate('/login'); return; }
    fetch(API.auth.hospitals)
      .then(r => r.json())
      .then(data => {
        const found = data.hospitals?.find(h => String(h.id) === String(hospitalId));
        setHospital(found || null);
      })
      .catch(() => {})
      .finally(() => setLoadingHospital(false));
  }, [hospitalId]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please enter both email and password.'); return; }
    setLoading(true);
    setError('');

    try {
      const res = await fetch(API.auth.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, hospital_id: hospitalId }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        login(data.user, data.token);
        const dest = location.state?.from ? from : data.redirect || '/';
        navigate(dest, { replace: true });
      } else {
        setError(data.error || 'Login failed.');
      }
    } catch {
      setError('Network error connecting to backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col font-['Manrope']">
      {/* Back button */}
      <div className="p-6">
        <button onClick={() => navigate('/login')} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Change Hospital
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center px-6 pb-12">
        <div className="w-full max-w-md">
          {/* Hospital Badge */}
          <div className="text-center mb-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#bc000c] to-[#ea0012] shadow-xl shadow-red-200/50 mb-5">
              <Activity className="h-8 w-8 text-white" />
            </div>
            {loadingHospital ? (
              <div className="h-7 w-48 bg-slate-200 rounded-lg animate-pulse mx-auto mb-2" />
            ) : (
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                {hospital?.name || 'Staff Login'}
              </h1>
            )}
            <p className="mt-1 text-sm text-slate-500 font-medium">ClinicalPulse Portal</p>
          </div>

          {/* Login Card */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] border border-slate-200/60 p-8">
            <form className="space-y-5" onSubmit={handleLogin}>
              <div>
                <label htmlFor="email" className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                  Work Email
                </label>
                <input
                  id="email" name="email" type="email" required
                  value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-[#bc000c]/25 text-sm font-medium placeholder-slate-400 transition-all"
                  placeholder="e.g. dr.smith@hospital.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                  Password
                </label>
                <input
                  id="password" name="password" type="password" required
                  value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-[#bc000c]/25 text-sm font-medium placeholder-slate-400 transition-all"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="text-sm font-bold text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">
                  {error}
                </div>
              )}

              <button
                type="submit" disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3.5 rounded-xl font-black uppercase tracking-widest text-sm text-white bg-gradient-to-r from-[#bc000c] to-[#ea0012] hover:shadow-xl hover:shadow-red-200/50 disabled:opacity-70 transition-all"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><ArrowRight className="h-4 w-4" /> Secure Login</>}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col gap-3 text-center">
              <button onClick={() => navigate('/signup')} className="text-sm font-bold text-[#bc000c] hover:text-[#9a000a] transition-colors">
                Don't have an account? Request Access
              </button>
              <button onClick={() => navigate('/register-hospital')} className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">
                Register a New Hospital
              </button>
            </div>
          </div>

          {/* Demo logins */}
          <div className="mt-8 text-center text-xs text-slate-400 space-y-1.5">
            <p className="font-black uppercase tracking-widest text-slate-500">Apex Demo Logins · Password: password123</p>
            <p>Admin: <span className="font-mono text-slate-600">drarunsharma@apex.com</span></p>
            <p>Dispatcher: <span className="font-mono text-slate-600">ravikapoor@apex.com</span></p>
            <p>ER Doctor: <span className="font-mono text-slate-600">drsureshverma@apex.com</span></p>
            <p>Paramedic: <span className="font-mono text-slate-600">rajeshtiwari@apex.com</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
