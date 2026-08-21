import { useState } from 'react';
import { Search, AlertTriangle, Package, Plus, Edit2, Check, X } from 'lucide-react';
import { CATEGORIES } from './constants';

function StockRow({ item, onUpdate, canEdit }) {
  const [editing, setEditing] = useState(false);
  const [qty, setQty]         = useState(item.quantity);
  const [saving, setSaving]   = useState(false);

  const isLow = item.quantity <= item.reorder_level;

  const save = async () => {
    setSaving(true);
    await onUpdate(item.id, { quantity: Number(qty) });
    setSaving(false); setEditing(false);
  };

  return (
    <tr className={`hover:bg-slate-50/50 transition-colors ${isLow ? 'bg-red-50/30' : ''}`}>
      <td className="px-4 py-3">
        <div className="font-bold text-slate-800 text-sm">{item.name}</div>
        <div className="text-[10px] text-slate-400">{item.generic_name}</div>
      </td>
      <td className="px-4 py-3">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{item.category}</span>
      </td>
      <td className="px-4 py-3">
        {editing ? (
          <div className="flex items-center gap-1">
            <input type="number" value={qty} onChange={e => setQty(e.target.value)} min={0}
              className="w-20 h-7 rounded-lg bg-white border border-slate-300 px-2 text-sm font-bold text-center outline-none" />
            <button onClick={save} disabled={saving} className="h-7 w-7 rounded-lg bg-green-500 text-white flex items-center justify-center">
              <Check className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setEditing(false)} className="h-7 w-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className={`font-extrabold text-base ${isLow ? 'text-red-600' : 'text-slate-800'}`}>{item.quantity}</span>
            <span className="text-[10px] text-slate-400">{item.unit}</span>
            {isLow && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
            {canEdit && (
              <button onClick={() => setEditing(true)} className="ml-1 text-slate-300 hover:text-orange-500 transition-colors">
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </td>
      <td className="px-4 py-3 text-xs text-slate-500">{item.reorder_level}</td>
      <td className="px-4 py-3 text-xs text-slate-400">{item.location || '—'}</td>
      <td className="px-4 py-3">
        {isLow
          ? <span className="text-[10px] font-black uppercase text-red-600 bg-red-100 border border-red-200 px-2 py-0.5 rounded-full">Low Stock</span>
          : <span className="text-[10px] font-black uppercase text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">OK</span>
        }
      </td>
    </tr>
  );
}

function AddStockForm({ onAdd, onCancel }) {
  const [form, setForm] = useState({ name:'', generic_name:'', category:'General', unit:'tablets', quantity:0, reorder_level:50, location:'', price_per_unit:0 });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-4 space-y-3">
      <p className="text-xs font-black uppercase tracking-widest text-orange-700">Add New Medicine</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <input value={form.name} onChange={e => set('name',e.target.value)} placeholder="Medicine Name *"
          className="h-9 col-span-2 rounded-xl border border-orange-200 bg-white px-3 text-sm font-bold outline-none" />
        <input value={form.generic_name} onChange={e => set('generic_name',e.target.value)} placeholder="Generic Name"
          className="h-9 rounded-xl border border-orange-200 bg-white px-3 text-sm font-bold outline-none" />
        <select value={form.category} onChange={e => set('category',e.target.value)}
          className="h-9 rounded-xl border border-orange-200 bg-white px-3 text-sm font-bold outline-none">
          {CATEGORIES.filter(c=>c!=='All').map(c=><option key={c}>{c}</option>)}
        </select>
        <input type="number" value={form.quantity} onChange={e => set('quantity',Number(e.target.value))} placeholder="Qty"
          className="h-9 rounded-xl border border-orange-200 bg-white px-3 text-sm font-bold outline-none" />
        <input value={form.unit} onChange={e => set('unit',e.target.value)} placeholder="Unit (tablets)"
          className="h-9 rounded-xl border border-orange-200 bg-white px-3 text-sm font-bold outline-none" />
        <input type="number" value={form.reorder_level} onChange={e => set('reorder_level',Number(e.target.value))} placeholder="Reorder Level"
          className="h-9 rounded-xl border border-orange-200 bg-white px-3 text-sm font-bold outline-none" />
        <input value={form.location} onChange={e => set('location',e.target.value)} placeholder="Location"
          className="h-9 rounded-xl border border-orange-200 bg-white px-3 text-sm font-bold outline-none" />
      </div>
      <div className="flex gap-2">
        <button onClick={() => onAdd(form)} disabled={!form.name.trim()}
          className="px-6 h-9 rounded-xl bg-orange-600 text-white text-xs font-black uppercase disabled:opacity-40 flex items-center gap-1">
          <Check className="w-3.5 h-3.5" /> Add
        </button>
        <button onClick={onCancel} className="px-4 h-9 rounded-xl bg-white border border-slate-200 text-slate-500 text-xs font-black uppercase">Cancel</button>
      </div>
    </div>
  );
}

export default function StockPanel({ stock, onUpdate, onAdd, canEdit, searchQ, onSearch }) {
  const [catFilter, setCatFilter] = useState('All');
  const [showAdd, setShowAdd] = useState(false);

  const filtered = stock.filter(s => catFilter === 'All' || s.category === catFilter);
  const lowCount = stock.filter(s => s.quantity <= s.reorder_level).length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-extrabold text-slate-800">Medicine Stock</h2>
          {lowCount > 0 && (
            <span className="text-[10px] font-black uppercase text-red-700 bg-red-100 border border-red-200 px-2 py-0.5 rounded-full">
              {lowCount} low
            </span>
          )}
        </div>
        <div className="flex gap-2 ml-auto items-center flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={searchQ} onChange={e => onSearch(e.target.value)} placeholder="Search medicines…"
              className="pl-8 pr-4 h-9 bg-slate-100 rounded-xl text-sm font-medium text-slate-700 outline-none w-44 focus:bg-white focus:ring-2 focus:ring-orange-200 border border-transparent focus:border-orange-300 transition-all" />
          </div>
          {canEdit && (
            <button onClick={() => setShowAdd(s=>!s)}
              className="h-9 px-4 rounded-xl bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 hover:bg-orange-700 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          )}
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCatFilter(c)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${catFilter === c ? 'bg-orange-600 text-white border-orange-700' : 'bg-white text-slate-500 border-slate-200 hover:border-orange-300'}`}>
            {c}
          </button>
        ))}
      </div>

      {showAdd && canEdit && <AddStockForm onAdd={async d => { await onAdd(d); setShowAdd(false); }} onCancel={() => setShowAdd(false)} />}

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 bg-slate-50">
              <th className="px-4 py-3">Medicine</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Quantity</th>
              <th className="px-4 py-3">Reorder At</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-400">No medicines found</td></tr>
            )}
            {filtered.map(item => (
              <StockRow key={item.id} item={item} onUpdate={onUpdate} canEdit={canEdit} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
