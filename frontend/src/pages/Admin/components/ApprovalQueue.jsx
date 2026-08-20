import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { UserCheck, UserX, Loader2, Clock } from 'lucide-react';
import { API } from '../../../config/api';

export default function ApprovalQueue() {
  const { user } = useAuth();
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  const fetchPending = async () => {
    if (!user?.hospital_id) return;
    try {
      const res = await fetch(`${API.base}/api/auth/pending-users?hospital_id=${user.hospital_id}`);
      const data = await res.json();
      setPending(data.users || []);
    } catch (e) {
      console.error('Failed to load pending users', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPending(); }, [user]);

  const handleAction = async (userId, action) => {
    setProcessing(userId + action);
    try {
      await fetch(`${API.base}/api/auth/approve-user`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, action }),
      });
      setPending(prev => prev.filter(u => u.id !== userId));
    } catch (e) {
      console.error('Action failed', e);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 bg-amber-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-amber-600" />
          <h2 className="text-base font-extrabold text-amber-900 uppercase tracking-widest">Pending Approvals</h2>
        </div>
        {pending.length > 0 && (
          <span className="text-xs font-black bg-amber-500 text-white px-2.5 py-1 rounded-full">{pending.length}</span>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
      ) : pending.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <UserCheck className="w-10 h-10 mx-auto mb-3 text-green-400" />
          <p className="font-bold text-sm text-slate-500">All caught up — no pending approvals.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {pending.map(u => (
            <div key={u.id} className="px-6 py-5 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800">{u.name || 'Unnamed User'}</div>
                <div className="text-xs font-medium text-slate-500">{u.email}</div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{u.role}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{u.department || 'No Dept'}</span>
                  <span className="text-[10px] text-slate-400">Applied {new Date(u.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4 shrink-0">
                <button
                  onClick={() => handleAction(u.id, 'reject')}
                  disabled={!!processing}
                  className="w-9 h-9 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors flex items-center justify-center"
                  title="Reject"
                >
                  {processing === u.id + 'reject' ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserX className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleAction(u.id, 'approve')}
                  disabled={!!processing}
                  className="px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl bg-green-100 text-green-700 hover:bg-green-600 hover:text-white transition-colors flex items-center gap-1.5"
                  title="Approve"
                >
                  {processing === u.id + 'approve' ? <Loader2 className="w-4 h-4 animate-spin" /> : <><UserCheck className="w-4 h-4" /> Approve</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
