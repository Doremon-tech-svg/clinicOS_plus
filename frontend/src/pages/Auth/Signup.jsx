import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Shield, ArrowRight, Loader2 } from 'lucide-react';

export default function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    accessCode: '',
    name: '',
    email: '',
    password: '',
    role: 'nurse',
    department: 'General'
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:8000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.error || 'Signup failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#f3f3f3] flex flex-col justify-center py-12 px-6 font-['Manrope'] text-center">
        <h2 className="text-2xl font-black text-green-600 mb-2">Account Created!</h2>
        <p className="text-slate-600">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f3f3] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-['Manrope']">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#bc000c] mb-4 text-white">
          <Activity className="h-6 w-6" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900">Join Your Hospital</h2>
        <p className="mt-2 text-sm text-slate-500">Enter your hospital's access code to register.</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-slate-200">
          <form className="space-y-4" onSubmit={handleSignup}>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Hospital Access Code</label>
              <input name="accessCode" type="text" required onChange={handleChange} className="w-full px-4 py-2 bg-slate-100 rounded-xl focus:ring-2 focus:ring-[#bc000c]/30" placeholder="e.g. APEX2026" />
            </div>
            
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Full Name</label>
              <input name="name" type="text" required onChange={handleChange} className="w-full px-4 py-2 bg-slate-100 rounded-xl focus:ring-2 focus:ring-[#bc000c]/30" placeholder="Dr. John Doe" />
            </div>
            
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Work Email</label>
              <input name="email" type="email" required onChange={handleChange} className="w-full px-4 py-2 bg-slate-100 rounded-xl focus:ring-2 focus:ring-[#bc000c]/30" placeholder="john@hospital.com" />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Password</label>
              <input name="password" type="password" required minLength="6" onChange={handleChange} className="w-full px-4 py-2 bg-slate-100 rounded-xl focus:ring-2 focus:ring-[#bc000c]/30" placeholder="••••••••" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Role</label>
                <select name="role" onChange={handleChange} className="w-full px-4 py-2 bg-slate-100 rounded-xl">
                  <option value="nurse">Nurse</option>
                  <option value="er_doctor">ER Doctor</option>
                  <option value="dept_head">Department Head</option>
                  <option value="paramedic">Paramedic</option>
                  <option value="lab_tech">Lab Technician</option>
                  <option value="radiologist">Radiologist</option>
                  <option value="pharmacist">Pharmacist</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Department</label>
                <select name="department" onChange={handleChange} className="w-full px-4 py-2 bg-slate-100 rounded-xl">
                  <option value="General">General</option>
                  <option value="Emergency">Emergency</option>
                  <option value="ICU">ICU</option>
                  <option value="Surgery">Surgery</option>
                  <option value="Laboratory">Laboratory</option>
                  <option value="Radiology">Radiology</option>
                  <option value="Pharmacy">Pharmacy</option>
                  <option value="Cardiology">Cardiology</option>
                </select>
              </div>
            </div>

            {error && <div className="text-sm font-bold text-red-600 bg-red-50 p-2 rounded">{error}</div>}

            <button type="submit" disabled={loading} className="w-full mt-4 flex justify-center py-3 bg-[#bc000c] text-white rounded-xl font-bold uppercase tracking-widest hover:bg-[#9a000a]">
              {loading ? <Loader2 className="animate-spin" /> : 'Create Account'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <button onClick={() => navigate('/login')} className="text-sm font-bold text-[#bc000c]">Already have an account? Log In</button>
          </div>
        </div>
      </div>
    </div>
  );
}
