import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { Bell, Check, X } from 'lucide-react';

export default function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative z-50">
      <button 
        onClick={() => setOpen(!open)}
        className="relative p-2 text-gray-400 hover:text-white transition-colors"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full border-2 border-[#121212]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl overflow-hidden z-50">
          <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
            <h3 className="font-semibold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-blue-400 hover:text-blue-300">
                Mark all read
              </button>
            )}
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white ml-2">
              <X size={16} />
            </button>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No recent notifications
              </div>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n.id} 
                  className={`p-4 border-b border-gray-800/50 cursor-pointer hover:bg-gray-800/50 transition-colors ${n.read ? 'opacity-60' : 'bg-gray-800/20'}`}
                  onClick={() => !n.read && markRead(n.id)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm text-white">{n.title}</span>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-blue-500 mt-1"></span>}
                  </div>
                  <p className="text-sm text-gray-400 line-clamp-2">{n.message}</p>
                  <span className="text-xs text-gray-500 mt-2 block">
                    {new Date(n.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {n.department}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
