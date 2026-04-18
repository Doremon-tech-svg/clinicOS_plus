import { useState } from 'react'
import { AlertTriangle, CheckCircle, X, BarChart2 } from 'lucide-react'

const PATIENTS = [
  {
    name: 'Mrs. Sharma',
    age: 78,
    bed: 'Bed 4A',
    risk: 'High',
    score: 82,
    shap: [
      { feature: 'Age > 70', value: 0.38, direction: 'positive' },
      { feature: 'Diuretic Medication', value: 0.29, direction: 'positive' },
      { feature: 'Mobility Score 3/10', value: 0.21, direction: 'positive' },
    ],
    summary: 'Patient is on diuretics and has limited mobility. High fall risk — recommend bed rails and frequent checks.',
  },
  {
    name: 'Mr. Gupta',
    age: 45,
    bed: 'Bed 2B',
    risk: 'Low',
    score: 18,
    shap: [
      { feature: 'Age < 60', value: 0.31, direction: 'negative' },
      { feature: 'Good Mobility 8/10', value: 0.25, direction: 'negative' },
      { feature: 'No Prior Falls', value: 0.18, direction: 'negative' },
    ],
    summary: 'Patient has good mobility and no history of falls. Standard precautions are sufficient.',
  },
]

export default function FallRiskCard() {
  const [selected, setSelected] = useState(null)

  return (
    <>
      <div className="space-y-3">
        {PATIENTS.map((p) => (
          <div key={p.name} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-gray-100 transition-colors">
            <div>
              <p className="font-semibold text-sm text-gray-800">{p.name}</p>
              <p className="text-xs text-gray-400">{p.age} yrs · {p.bed}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-gray-500">Score: {p.score}</span>
              <button
                onClick={() => setSelected(p)}
                className="badge cursor-pointer hover:opacity-80 transition-opacity"
                style={{
                  background: p.risk === 'High' ? '#FFF1F2' : '#F0FDF4',
                  color: p.risk === 'High' ? '#D0021B' : '#7ED321',
                }}
              >
                {p.risk === 'High'
                  ? <AlertTriangle size={10} />
                  : <CheckCircle size={10} />
                }
                {p.risk} Risk
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* SHAP Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h3 className="font-display font-bold text-gray-900">{selected.name}</h3>
                <p className="text-xs text-gray-400">SHAP Explanation · Bed Flow Optimizer Agent</p>
              </div>
              <button onClick={() => setSelected(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center gap-2 p-3 rounded-xl" style={{
                background: selected.risk === 'High' ? '#FFF1F2' : '#F0FDF4',
              }}>
                {selected.risk === 'High'
                  ? <AlertTriangle size={16} color="#D0021B" />
                  : <CheckCircle size={16} color="#7ED321" />
                }
                <div>
                  <p className="text-sm font-semibold" style={{ color: selected.risk === 'High' ? '#D0021B' : '#7ED321' }}>
                    {selected.risk} Risk · Score {selected.score}/100
                  </p>
                  <p className="text-xs text-gray-500">{selected.summary}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-3">
                  <BarChart2 size={14} className="text-purple-500" />
                  <p className="text-sm font-semibold text-gray-700">Top Contributing Factors</p>
                </div>
                <div className="space-y-2">
                  {selected.shap.map((s, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>{s.feature}</span>
                        <span className="font-mono" style={{ color: s.direction === 'positive' ? '#D0021B' : '#7ED321' }}>
                          {s.direction === 'positive' ? '+' : '-'}{(s.value * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${s.value * 100}%`,
                            background: s.direction === 'positive'
                              ? 'linear-gradient(90deg, #FCA5A5, #D0021B)'
                              : 'linear-gradient(90deg, #86EFAC, #7ED321)',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}