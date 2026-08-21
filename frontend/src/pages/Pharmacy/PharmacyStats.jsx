// Stats bar at top of pharmacy
export default function PharmacyStats({ stats }) {
  const items = [
    { label: 'Pending Orders', val: stats.pending,         color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
    { label: 'Stat / Urgent',  val: stats.stat_orders,     color: 'text-red-600',    bg: 'bg-red-50',    border: 'border-red-200' },
    { label: 'Dispensed Today',val: stats.dispensed_today, color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-200' },
    { label: 'Low Stock Items',val: stats.low_stock,        color: 'text-slate-600',  bg: 'bg-slate-50',  border: 'border-slate-200' },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {items.map(s => (
        <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl p-5 flex flex-col items-center justify-center`}>
          <div className={`text-4xl font-black ${s.color}`}>{s.val}</div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1 text-center">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
