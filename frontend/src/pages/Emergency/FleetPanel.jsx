import { useState } from 'react';
import { Zap, Plus, Trash2, Loader2, Edit2, Check } from 'lucide-react';
import { FLEET_COLOR } from '../constants';

function FleetStats({ fleet }) {
  const total = fleet.length;
  const avail = fleet.filter(f => f.status === 'Available').length;
  const busy  = fleet.filter(f => f.status === 'Busy').length;
  const maint = fleet.filter(f => f.status === 'Maintenance').length;
  return (
    <div className="grid grid-cols-4 gap-2 mb-4">
      {[
        { label:'Total',       val:total, color:'text-slate-800' },
        { label:'Available',   val:avail, color:'text-green-600' },
        { label:'Active',      val:busy,  color:'text-red-600' },
        { label:'Maintenance', val:maint, color:'text-slate-400' },
      ].map(s => (
        <div key={s.label} className="bg-white rounded-xl p-3 text-center border border-slate-100">
          <div className={`text-2xl font-black ${s.color}`}>{s.val}</div>
          <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

function AddUnitForm({ onAdd, onCancel }) {
  const [name, setName]   = useState('');
  const [driver, setDriver] = useState('');
  const [type, setType]   = useState('BLS');
  const [reg, setReg]     = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await onAdd({ unit_name: name, driver_name: driver, vehicle_type: type, vehicle_reg: reg });
    setSaving(false);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 slide-in">
      <p className="text-[10px] font-black uppercase tracking-widest text-[#bc000c]">Add New Unit</p>
      <div className="grid grid-cols-2 gap-2">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Unit Name *"
          className="h-9 rounded-lg bg-slate-50 border border-slate-200 px-3 text-xs font-bold outline-none" />
        <select value={type} onChange={e => setType(e.target.value)}
          className="h-9 rounded-lg bg-slate-50 border border-slate-200 px-3 text-xs font-bold outline-none">
          {['ALS','BLS','NICU','Bariatric'].map(t => <option key={t}>{t}</option>)}
        </select>
        <input value={driver} onChange={e => setDriver(e.target.value)} placeholder="Driver Name"
          className="h-9 rounded-lg bg-slate-50 border border-slate-200 px-3 text-xs font-bold outline-none" />
        <input value={reg} onChange={e => setReg(e.target.value)} placeholder="Vehicle Reg"
          className="h-9 rounded-lg bg-slate-50 border border-slate-200 px-3 text-xs font-bold outline-none" />
      </div>
      <div className="flex gap-2">
        <button onClick={handleSubmit} disabled={saving || !name.trim()}
          className="flex-1 h-9 rounded-xl bg-[#bc000c] text-white text-[10px] font-black uppercase flex items-center justify-center gap-1 disabled:opacity-40">
          {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />} Add
        </button>
        <button onClick={onCancel} className="px-4 h-9 rounded-xl bg-slate-100 text-slate-600 text-[10px] font-black uppercase">Cancel</button>
      </div>
    </div>
  );
}

export default function FleetPanel({ fleet, markFleet, addFleet, removeFleet, loading, canEdit }) {
  const [showAdd, setShowAdd]     = useState(false);
  const [editId, setEditId]       = useState(null);
  const [newStatus, setNewStatus] = useState('');

  const handleAdd = async (data) => {
    await addFleet(data);
    setShowAdd(false);
  };

  if (loading && fleet.length === 0)
    return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-[#bc000c]" /></div>;

  return (
    <div className="glass ghost-border rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-[#bc000c]" />
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-700">Fleet Management</h3>
        </div>
        {canEdit && (
          <button onClick={() => setShowAdd(s => !s)}
            className="flex items-center gap-1 text-[10px] font-black text-[#bc000c] bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-1 rounded-lg transition-colors">
            <Plus className="h-3 w-3" /> Add Unit
          </button>
        )}
      </div>

      <div className="p-4">
        <FleetStats fleet={fleet} />

        {showAdd && canEdit && (
          <div className="mb-3">
            <AddUnitForm onAdd={handleAdd} onCancel={() => setShowAdd(false)} />
          </div>
        )}

        <div className="divide-y divide-slate-50">
          {fleet.map(unit => (
            <div key={unit.id} className="py-3 flex items-center justify-between hover:bg-slate-50/50 transition-colors rounded-lg px-2">
              <div>
                <div className="font-bold text-sm text-slate-800">{unit.unit_name}
                  <span className="ml-2 text-[9px] font-black uppercase text-slate-400">{unit.vehicle_type}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  🧑 {unit.driver_name || '—'}
                  {unit.paramedic_name ? ` · 🚑 ${unit.paramedic_name}` : ''}
                  {unit.vehicle_reg ? ` · ${unit.vehicle_reg}` : ''}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {editId === unit.id && canEdit ? (
                  <div className="flex items-center gap-1">
                    <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                      className="text-[10px] font-bold bg-white border border-slate-200 rounded-lg px-2 h-7">
                      {['Available','Busy','Maintenance'].map(s => <option key={s}>{s}</option>)}
                    </select>
                    <button onClick={() => { markFleet(unit.id, newStatus); setEditId(null); }}
                      className="h-7 w-7 rounded-lg bg-green-600 text-white flex items-center justify-center">
                      <Check className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg border ${FLEET_COLOR[unit.status] || 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                    {unit.status}
                  </span>
                )}
                {canEdit && editId !== unit.id && (
                  <button onClick={() => { setEditId(unit.id); setNewStatus(unit.status); }}
                    className="text-[10px] text-slate-400 hover:text-[#bc000c] p-1 rounded-lg hover:bg-red-50 transition-colors">
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                )}
                {canEdit && removeFleet && unit.status !== 'Busy' && (
                  <button onClick={() => removeFleet(unit.id)}
                    className="text-[10px] text-slate-300 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
          {fleet.length === 0 && (
            <div className="py-6 text-center text-xs text-slate-400">No fleet data</div>
          )}
        </div>
      </div>
    </div>
  );
}
