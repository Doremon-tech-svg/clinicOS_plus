import { useAuth } from '../../context/AuthContext';
import { Clock, Thermometer } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Header() {
  const { user, logout } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-30 font-['Manrope']">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-extrabold tracking-tight text-slate-800">
          Apex Medical Center
        </h1>
        <div className="hidden md:flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">System Normal</span>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-4 text-slate-500">
          <div className="flex items-center gap-1.5">
            <Clock size={16} />
            <span className="text-xs font-mono font-medium text-slate-600">{currentTime}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Thermometer size={16} />
            <span className="text-xs font-medium text-slate-600">24°C</span>
          </div>
        </div>
        
        {user && (
          <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold text-slate-800">{user.name}</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-[#EC9A04]">{user.role}</div>
            </div>
            <button 
              onClick={logout} 
              className="h-10 w-10 rounded-full border-2 border-slate-200 bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 hover:bg-red-500 hover:text-white hover:border-red-600 transition-colors" 
              title="Logout"
            >
              {user.name.charAt(0)}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
