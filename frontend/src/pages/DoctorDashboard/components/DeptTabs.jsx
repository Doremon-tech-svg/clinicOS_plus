// Tab bar showing the departments the doctor has duty in
export default function DeptTabs({ depts, active, onSelect }) {
  if (!depts.length) return null;
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 mb-6 scrollbar-hide">
      {depts.map(dept => (
        <button
          key={dept}
          onClick={() => onSelect(dept)}
          className={`shrink-0 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest border transition-all ${
            active === dept
              ? 'bg-blue-600 text-white border-blue-700 shadow-md shadow-blue-100'
              : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
          }`}
        >
          {dept === 'Emergency' ? '🚨' : dept === 'ICU' ? '🏥' : dept === 'Lab' ? '🧪' : '🏛️'} {dept}
        </button>
      ))}
    </div>
  );
}
