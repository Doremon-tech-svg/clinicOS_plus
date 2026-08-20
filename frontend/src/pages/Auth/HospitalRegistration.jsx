import { API } from '../../config/api';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Loader2, Key } from 'lucide-react';

export default function HospitalRegistration() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    phone: '',
    adminEmail: '',
    adminPassword: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(API.auth.registerHospital, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setSuccessData(data);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    return (
      <div className="min-h-screen bg-[#f3f3f3] flex flex-col justify-center py-12 px-6 font-['Manrope'] text-center">
        <div className="bg-white p-10 rounded-3xl shadow-xl max-w-lg mx-auto">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-6">
            <Key className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-2">Hospital Registered!</h2>
          <p className="text-slate-500 mb-6">Share this access code with your staff so they can sign up.</p>
          
          <div className="bg-slate-100 p-6 rounded-xl border border-slate-200 mb-8">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Access Code</div>
            <div className="text-4xl font-mono font-black text-[#bc000c] tracking-widest">{successData.accessCode}</div>
          </div>
          
          <button onClick={() => navigate('/login')} className="w-full py-4 bg-[#bc000c] text-white rounded-xl font-bold uppercase tracking-widest hover:bg-[#9a000a]">
            Proceed to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f3f3] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-['Manrope']">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 mb-4 text-white">
          <Building2 className="h-6 w-6" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900">Register Hospital</h2>
        <p className="mt-2 text-sm text-slate-500">Deploy ClinicalPulse OS for your facility.</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-8 shadow-xl rounded-3xl border border-slate-200">
          <form className="space-y-6" onSubmit={handleRegister}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Hospital Name</label>
                <input name="name" type="text" required onChange={handleChange} className="w-full px-4 py-2 bg-slate-100 rounded-xl focus:ring-2 focus:ring-[#bc000c]/30" />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Address</label>
                <input name="address" type="text" required onChange={handleChange} className="w-full px-4 py-2 bg-slate-100 rounded-xl focus:ring-2 focus:ring-[#bc000c]/30" />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1">City</label>
                <input name="city" type="text" required onChange={handleChange} className="w-full px-4 py-2 bg-slate-100 rounded-xl focus:ring-2 focus:ring-[#bc000c]/30" />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Contact Phone</label>
                <input name="phone" type="text" required onChange={handleChange} className="w-full px-4 py-2 bg-slate-100 rounded-xl focus:ring-2 focus:ring-[#bc000c]/30" />
              </div>
            </div>

            <hr className="border-slate-100" />

            <div className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-700">Admin Account</h3>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Admin Email</label>
                <input name="adminEmail" type="email" required onChange={handleChange} className="w-full px-4 py-2 bg-slate-100 rounded-xl focus:ring-2 focus:ring-[#bc000c]/30" />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Admin Password</label>
                <input name="adminPassword" type="password" required minLength="6" onChange={handleChange} className="w-full px-4 py-2 bg-slate-100 rounded-xl focus:ring-2 focus:ring-[#bc000c]/30" />
              </div>
            </div>

            {error && <div className="text-sm font-bold text-red-600 bg-red-50 p-2 rounded">{error}</div>}

            <button type="submit" disabled={loading} className="w-full mt-4 flex justify-center py-4 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-slate-800">
              {loading ? <Loader2 className="animate-spin" /> : 'Register & Generate Code'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <button onClick={() => navigate('/login')} className="text-sm font-bold text-slate-500 hover:text-slate-800">Back to Login</button>
          </div>
        </div>
      </div>
    </div>
  );
}
