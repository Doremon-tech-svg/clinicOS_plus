import { useState, useEffect } from 'react'
import { Link2, RefreshCw, Shield } from 'lucide-react'
import { formatTimestamp, truncateHash } from './lib/utils.js'

const MOCK_EVENTS = [
  { timestamp: Date.now() - 120000, action: 'ConsentGranted', patient: 'Priya Sharma', txHash: '0xf3a1b2c8d9e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8' },
  { timestamp: Date.now() - 240000, action: 'AccessLogged', patient: 'Rajesh Kumar', txHash: '0xabc123def456789012345678901234567890abcd' },
  { timestamp: Date.now() - 480000, action: 'ConsentRevoked', patient: 'Meena Devi', txHash: '0x9876543210fedcba9876543210fedcba98765432' },
  { timestamp: Date.now() - 720000, action: 'ConsentGranted', patient: 'Arun Verma', txHash: '0x1234abcd5678efgh9012ijkl3456mnop7890qrst' },
  { timestamp: Date.now() - 900000, action: 'AccessLogged', patient: 'Sunita Patel', txHash: '0xdeadbeef00112233445566778899aabbccddeeff' },
]

const ACTION_COLORS = {
  ConsentGranted: { bg: '#F0FDF4', text: '#16A34A', dot: '#22C55E' },
  ConsentRevoked: { bg: '#FFF1F2', text: '#B91C1C', dot: '#EF4444' },
  AccessLogged: { bg: '#EFF6FF', text: '#1D4ED8', dot: '#3B82F6' },
}

export default function BlockchainLog() {
  const [events, setEvents] = useState(MOCK_EVENTS)
  const [loading, setLoading] = useState(false)

  async function fetchEvents() {
    setLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://codewizrds-deploy.onrender.com'}/api/blockchain/events`)
      if (res.ok) {
        const data = await res.json()
        if (data.events && data.events.length > 0) setEvents(data.events)
        else setEvents(MOCK_EVENTS)
      } else {
        setEvents(MOCK_EVENTS)
      }
    } catch {
      setEvents(MOCK_EVENTS)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchEvents() }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield size={18} style={{ color: '#9013FE' }} />
          <h3 className="font-display font-semibold text-gray-800">Blockchain Audit Log</h3>
        </div>
        <button onClick={fetchEvents} className="btn-secondary border-gray-200 text-gray-500 text-xs flex items-center gap-1.5">
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Timestamp</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Action</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Patient</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Tx Hash</th>
            </tr>
          </thead>
          <tbody>
            {events.map((ev, i) => {
              const style = ACTION_COLORS[ev.action] || ACTION_COLORS['AccessLogged']
              return (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                  <td className="py-2.5 px-3 text-xs text-gray-500 font-mono whitespace-nowrap">
                    {formatTimestamp(ev.timestamp)}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="badge text-xs" style={{ background: style.bg, color: style.text }}>
                      <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: style.dot }} />
                      {ev.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-sm font-medium text-gray-700">{ev.patient}</td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1">
                      <Link2 size={11} className="text-purple-400" />
                      <code className="text-xs font-mono text-purple-600">{truncateHash(ev.txHash)}</code>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}