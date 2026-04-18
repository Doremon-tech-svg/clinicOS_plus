import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { Zap, TrendingDown } from 'lucide-react'

const normalData = [
  { time: '06:00', energy: 42, occupancy: 55 },
  { time: '08:00', energy: 68, occupancy: 72 },
  { time: '10:00', energy: 89, occupancy: 88 },
  { time: '12:00', energy: 95, occupancy: 91 },
  { time: '14:00', energy: 91, occupancy: 87 },
  { time: '16:00', energy: 85, occupancy: 82 },
  { time: '18:00', energy: 78, occupancy: 76 },
  { time: '20:00', energy: 65, occupancy: 68 },
  { time: '22:00', energy: 50, occupancy: 60 },
  { time: '00:00', energy: 38, occupancy: 52 },
]

const lowOccData = [
  { time: '06:00', energy: 28, occupancy: 32 },
  { time: '08:00', energy: 42, occupancy: 41 },
  { time: '10:00', energy: 55, occupancy: 49 },
  { time: '12:00', energy: 61, occupancy: 53 },
  { time: '14:00', energy: 58, occupancy: 51 },
  { time: '16:00', energy: 52, occupancy: 47 },
  { time: '18:00', energy: 45, occupancy: 42 },
  { time: '20:00', energy: 38, occupancy: 37 },
  { time: '22:00', energy: 29, occupancy: 31 },
  { time: '00:00', energy: 22, occupancy: 28 },
]

export default function EnergyChart() {
  const [lowMode, setLowMode] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const data = lowMode ? lowOccData : normalData

  function handleSimulate() {
    setLowMode(true)
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 6000)
  }

  function handleReset() {
    setLowMode(false)
    setShowAlert(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap size={18} style={{ color: '#F5A623' }} />
          <h3 className="font-display font-semibold text-gray-800">Energy vs Occupancy</h3>
          <span className="badge bg-green-100 text-green-700">Green Sustainability Agent</span>
        </div>
        <div className="flex gap-2">
          {lowMode && (
            <button onClick={handleReset} className="btn-secondary border-gray-200 text-gray-600 text-xs">
              Reset
            </button>
          )}
          <button
            onClick={handleSimulate}
            className="btn-primary text-xs"
            style={{ background: '#7ED321' }}
            disabled={lowMode}
          >
            Simulate Low Occupancy
          </button>
        </div>
      </div>

      {showAlert && (
        <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium flex items-start gap-2 animate-slide-up"
          style={{ background: '#F0FDF4', border: '1px solid #86EFAC', color: '#166534' }}>
          <TrendingDown size={16} className="mt-0.5 flex-shrink-0" />
          <span>
            <strong>🌿 Agent Recommendation:</strong> Reduce AC in Green Wing. Estimated savings: <strong>₹1,200/day</strong>. Current load down 35%.
          </span>
        </div>
      )}

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
          <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} />
          <Tooltip
            contentStyle={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line
            type="monotone"
            dataKey="energy"
            name="Energy (kW)"
            stroke="#F5A623"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="occupancy"
            name="Bed Occupancy (%)"
            stroke="#4A90E2"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5 }}
            strokeDasharray="5 3"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}