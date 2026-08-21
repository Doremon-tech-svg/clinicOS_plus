import { useState } from 'react';
import { Pill, LogOut, Settings, User, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePharmacy } from './usePharmacy';
import PharmacyStats from './PharmacyStats';
import OrdersPanel   from './OrdersPanel';
import StockPanel    from './StockPanel';

const TABS = ['Orders', 'Stock'];

export default function Pharmacy() {
  const { user, logout } = useAuth();
  const [tab, setTab]    = useState('Orders');
  const [refreshing, setRefreshing] = useState(false);

  const { stats, orders, stock, loading, dispense, reject, addStock, updateStock, searchStock, stockQ, refetch } = usePharmacy(user?.hospital_id || 1);

  const canEdit  = ['pharmacist','admin'].includes(user?.role);
  const hospitalName = user?.hospital_name || 'Hospital Pharmacy';

  const doRefresh = async () => { setRefreshing(true); await refetch(); setTimeout(() => setRefreshing(false), 600); };

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-slate-800 font-['Manrope'] pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center shadow-sm">
            <Pill className="text-orange-600 w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">Pharmacy</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{hospitalName}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={doRefresh} className={`h-9 w-9 rounded-full flex items-center justify-center text-slate-400 hover:bg-orange-50 hover:text-orange-500 transition-colors ${refreshing ? 'animate-spin' : ''}`}>
            <RefreshCw className="w-4 h-4" />
          </button>
          <div className="text-right hidden sm:block">
            <div className="text-sm font-bold text-slate-800">{user?.name}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-orange-600">{user?.role}</div>
          </div>
          <button onClick={logout} className="h-9 w-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors" title="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-8">
        {/* Stats */}
        <PharmacyStats stats={stats} />

        {/* Tab bar */}
        <div className="flex gap-2 mb-6 bg-slate-100 rounded-2xl p-1 w-max">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${tab === t ? 'bg-white text-orange-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>
              {t}
              {t === 'Orders' && stats.pending > 0 && (
                <span className="ml-2 bg-orange-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{stats.pending}</span>
              )}
              {t === 'Stock' && stats.low_stock > 0 && (
                <span className="ml-2 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{stats.low_stock}</span>
              )}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
          </div>
        )}

        {!loading && tab === 'Orders' && (
          <OrdersPanel orders={orders} onDispense={dispense} onReject={reject} userId={user?.profile_id} />
        )}

        {!loading && tab === 'Stock' && (
          <StockPanel stock={stock} onUpdate={updateStock} onAdd={addStock} canEdit={canEdit} searchQ={stockQ} onSearch={searchStock} />
        )}
      </main>
    </div>
  );
}
