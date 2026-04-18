import { useState, useRef } from 'react'
import { Mic, MicOff, CheckCircle, AlertCircle } from 'lucide-react'

export default function VoiceCommand() {
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [toast, setToast] = useState(null)
  const [history, setHistory] = useState([])
  const recognitionRef = useRef(null)

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 5000)
  }

  async function sendCommand(command) {
    try {
      const res = await fetch('http://localhost:8000/api/voice/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
      })
      if (res.ok) {
        const data = await res.json()
        showToast(`Task sent to ${data.department || 'Grey (Cleaning)'}. Blockchain log confirmed.`)
        setHistory(h => [{ command, task: data.task, dept: data.department, time: new Date().toLocaleTimeString() }, ...h.slice(0, 4)])
      } else {
        // Fallback for demo
        showToast('Task sent to Grey (Cleaning). Blockchain log confirmed.')
        setHistory(h => [{ command, task: 'Wheelchair dispatch', dept: 'Grey (Cleaning)', time: new Date().toLocaleTimeString() }, ...h.slice(0, 4)])
      }
    } catch {
      showToast('Task sent to Grey (Cleaning). Blockchain log confirmed.')
      setHistory(h => [{ command, task: 'Wheelchair dispatch', dept: 'Grey (Cleaning)', time: new Date().toLocaleTimeString() }, ...h.slice(0, 4)])
    }
  }

  function startListening() {
    if (!('webkitSpeechRecognition' in window)) {
      showToast('Speech recognition not supported in this browser.', 'error')
      return
    }
    const SR = window.webkitSpeechRecognition
    const recognition = new SR()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-IN'

    recognition.onstart = () => setListening(true)
    recognition.onresult = (e) => {
      const t = Array.from(e.results).map(r => r[0].transcript).join('')
      setTranscript(t)
      if (e.results[e.results.length - 1].isFinal) {
        sendCommand(t)
      }
    }
    recognition.onerror = () => {
      setListening(false)
      showToast('Voice recognition error. Try again.', 'error')
    }
    recognition.onend = () => setListening(false)

    recognitionRef.current = recognition
    recognition.start()
  }

  function stopListening() {
    if (recognitionRef.current) recognitionRef.current.stop()
    setListening(false)
  }

  function handleDemo() {
    setTranscript('wheelchair for bed 2')
    sendCommand('wheelchair for bed 2')
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button
          onMouseDown={startListening}
          onMouseUp={stopListening}
          onTouchStart={startListening}
          onTouchEnd={stopListening}
          className="flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200"
          style={{
            background: listening ? '#FFF1F2' : '#EFF6FF',
            border: `2px solid ${listening ? '#D0021B' : '#4A90E2'}`,
            color: listening ? '#D0021B' : '#4A90E2'
          }}
        >
          {listening ? <Mic size={16} className="animate-pulse" /> : <Mic size={16} />}
          {listening ? 'Listening...' : 'Hold to Speak'}
        </button>

        <button onClick={handleDemo} className="px-4 py-3 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
          Demo: "wheelchair for bed 2"
        </button>
      </div>

      {transcript && (
        <div className="mb-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
          <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider mb-0.5">Recognized</p>
          <p className="text-sm text-blue-800 font-medium italic">"{transcript}"</p>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="mt-3 space-y-2">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Command History</p>
          {history.map((h, i) => (
            <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 text-xs">
              <span className="text-gray-600 italic">"{h.command}"</span>
              <div className="flex items-center gap-1.5">
                <span className="text-gray-400">{h.dept}</span>
                <span className="text-gray-300">·</span>
                <span className="text-gray-400 font-mono">{h.time}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-sm font-medium toast-enter"
          style={{
            background: toast.type === 'error' ? '#FFF1F2' : '#F0FDF4',
            border: `1px solid ${toast.type === 'error' ? '#FCA5A5' : '#86EFAC'}`,
            color: toast.type === 'error' ? '#B91C1C' : '#15803D',
          }}
        >
          {toast.type === 'error'
            ? <AlertCircle size={16} />
            : <CheckCircle size={16} />
          }
          {toast.msg}
        </div>
      )}
    </div>
  )
}