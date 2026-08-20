import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DepartmentOverview from './components/DepartmentOverview';
import ShiftManagement from './components/ShiftManagement';
import ApprovalQueue from './components/ApprovalQueue';

export default function AdminPortal() {
  const [activeTab, setActiveTab] = useState('overview');

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':   return <DepartmentOverview />;
      case 'shifts':     return <ShiftManagement />;
      case 'approvals':  return <ApprovalQueue />;
      case 'departments': return (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-black text-slate-800 mb-2">Department Details</h2>
          <p className="text-slate-500">Click a department from the Overview tab to open its dashboard.</p>
        </div>
      );
      case 'staff': return (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
          <h2 className="text-xl font-black text-slate-800 mb-2">Staff Roster</h2>
          <p className="text-slate-500">Staff management module — coming soon.</p>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] flex font-['Manrope']">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Header />
        <main className="p-8 flex-1">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
