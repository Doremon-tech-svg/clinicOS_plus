import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Loader2, ArrowRight, Activity } from 'lucide-react';

import { useParams } from 'react-router-dom';

export default function Login() {
  const { hospitalId } = useParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If user tried to go to a protected route, redirect there after login.
  const from = location.state?.from?.pathname || '/';

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, hospital_id: hospitalId }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        login(data.user, data.token);
        // Use the redirect provided by backend, or the intended destination if it was a deep link
        const dest = location.state?.from ? from : data.redirect || '/';
        navigate(dest, { replace: true });
      } else {
        setError(data.error || 'Login failed. Please check credentials.');
      }
    } catch (err) {
      setError('Network error connecting to backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f3f3] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-['Manrope'] text-slate-800">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#bc000c] to-[#ea0012] shadow-xl shadow-red-200 mb-6">
          <Activity className="h-8 w-8 text-white" />
        </div>
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
          Staff Login
        </h2>
        <p className="mt-2 text-sm text-slate-500 font-medium">
          Access your facility's ClinicalPulse portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/80 backdrop-blur-xl py-10 px-6 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] sm:rounded-3xl sm:px-12 border border-[#ebbbb5]/30">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                Work Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border-none bg-slate-100 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#bc000c]/30 sm:text-sm font-medium transition-all"
                  placeholder="e.g. dr.smith@apex.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border-none bg-slate-100 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#bc000c]/30 sm:text-sm font-medium transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="text-sm font-bold text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-black uppercase tracking-widest text-white bg-gradient-to-r from-[#bc000c] to-[#ea0012] hover:shadow-xl hover:from-[#a0000a] hover:to-[#bc000c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#bc000c] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Secure Login
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="w-full text-sm font-bold text-[#bc000c] hover:text-[#ea0012] transition-colors"
            >
              Don't have an account? Sign Up
            </button>
            <button
              type="button"
              onClick={() => navigate('/register-hospital')}
              className="w-full text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
            >
              Register a New Hospital
            </button>
          </div>
        </div>
        
        {/* Helper text for demo */}
        <div className="mt-8 text-center text-xs text-slate-400 space-y-1">
          <p className="font-bold uppercase tracking-widest text-slate-500">Demo Logins (Password: password123)</p>
          <p>Admin: <span className="font-mono text-slate-600">drarunsharma@apex.com</span></p>
          <p>Dispatcher: <span className="font-mono text-slate-600">ravikapoor@apex.com</span></p>
          <p>ER Doctor: <span className="font-mono text-slate-600">drsureshverma@apex.com</span></p>
          <p>Paramedic: <span className="font-mono text-slate-600">rajeshtiwari@apex.com</span></p>
        </div>
      </div>
    </div>
  );
}
