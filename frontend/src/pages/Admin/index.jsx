import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DepartmentOverview from './components/DepartmentOverview';
import ShiftManagement from './components/ShiftManagement';

export default function AdminPortal() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-[#f9f9f9] flex font-['Manrope'] selection:bg-amber-500/30">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Header />
        
        <main className="p-8 flex-1">
          {activeTab === 'overview' && <DepartmentOverview />}
          {activeTab === 'shifts' && <ShiftManagement />}
          
          {/* Placeholder for others */}
          {activeTab === 'departments' && (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
              <h2 className="text-xl font-bold text-slate-800 mb-2">Department Deep Dive</h2>
              <p className="text-slate-500">Select a department from the Overview to view detailed metrics.</p>
            </div>
          )}
          
          {activeTab === 'staff' && (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
              <h2 className="text-xl font-bold text-slate-800 mb-2">Staff Roster & Payroll</h2>
              <p className="text-slate-500">Module under construction.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
