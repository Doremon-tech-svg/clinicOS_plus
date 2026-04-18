import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from './ThemeContext.jsx'
import { ArrowLeft, Send, Bot, User } from 'lucide-react'

const BOT_RESPONSES = {
  'maternity': 'Go to the 🩷 Pink Zone. Take Elevator A to Floor 2. Estimated wait: 5 minutes.',
  'where is maternity': 'Go to the 🩷 Pink Zone. Take Elevator A to Floor 2. Estimated wait: 5 minutes.',
  'lab results': '🧪 Your blood work is normal. Haemoglobin: 13.2 g/dL, WBC: 7,400/μL. Your doctor will review the full report.',
  'lab': '🧪 Your blood work is normal. Haemoglobin: 13.2 g/dL, WBC: 7,400/μL. Your doctor will review the full report.',
  'pharmacy': '💊 Pharmacy is in the 🟠 Orange Zone, Ground Floor (near the main entrance). Open 24/7.',
  'appointment': '📅 Your next appointment is tomorrow at 10:00 AM with Dr. A. Gupta (Cardiology) — Room 204, Floor 2.',
  'blood pressure': '📊 Your last recorded BP was 122/78 mmHg (normal range). Keep monitoring as advised.',
  'discharge': '🏠 Your estimated discharge date is in 2 days. The nursing team will brief you on post-care instructions.',
  'wifi': '📶 Hospital WiFi SSID: MedNet_Patient | Password: care@2025',
  'food': '🍽️ Cafeteria is on Ground Floor, Block B. Timings: Breakfast 7–9 AM, Lunch 12–2 PM, Dinner 7–9 PM.',
  'billing': '💳 For billing queries, visit the Accounts desk on Floor 1, or call extension 1200.',
  'emergency': '🚨 For immediate help press the nurse call button on your bedside panel, or call extension 100.',
}

const QUICK_REPLIES = [
  'Where is Maternity?',
  'Lab results',
  'Pharmacy location',
  'My appointment',
]

function getBotReply(text) {
  const lower = text.toLowerCase().trim()
  for (const [key, val] of Object.entries(BOT_RESPONSES)) {
    if (lower.includes(key)) return val
  }
  return "I'm sorry, I didn't understand that. Try asking about: maternity ward, lab results, pharmacy, appointment, billing, discharge, or cafeteria."
}

export default function PatientChat() {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const [messages, setMessages] = useState([
    {
      id: 1, from: 'bot',
      text: "Hello Priya! 👋 I'm your hospital assistant. How can I help you today? You can ask me about ward locations, lab results, appointments, and more.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  function sendMessage(text) {
    if (!text.trim()) return
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setMessages(m => [...m, { id: Date.now(), from: 'user', text: text.trim(), time }])
    setInput('')
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      setMessages(m => [...m, {
        id: Date.now() + 1,
        from: 'bot',
        text: getBotReply(text),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }])
    }, 900 + Math.random() * 600)
  }

  function handleSubmit(e) {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <div className="flex flex-col h-screen" style={{ background: '#ECF5E2' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 z-10"
        style={{ background: theme.color, boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>
        <button onClick={() => navigate('/patient')} className="text-white/80 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
          <Bot size={18} color="white" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-white text-sm leading-tight">Hospital Assistant</p>
          <p className="text-xs text-green-100">AI-Powered · 24/7 Support</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-white/70">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          Online
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-end gap-2 ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.from === 'bot' && (
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mb-1"
                style={{ background: theme.color }}>
                <Bot size={14} color="white" />
              </div>
            )}
            <div className="max-w-xs">
              <div
                className={`px-4 py-2.5 text-sm leading-relaxed ${msg.from === 'user' ? 'chat-bubble-out text-white' : 'chat-bubble-in text-gray-800 bg-white shadow-sm'}`}
                style={msg.from === 'user' ? { background: theme.color } : {}}
              >
                {msg.text}
              </div>
              <p className={`text-xs text-gray-400 mt-1 ${msg.from === 'user' ? 'text-right' : 'text-left'}`}>
                {msg.time}
              </p>
            </div>
            {msg.from === 'user' && (
              <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mb-1">
                <User size={14} className="text-gray-500" />
              </div>
            )}
          </div>
        ))}

        {typing && (
          <div className="flex items-end gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: theme.color }}>
              <Bot size={14} color="white" />
            </div>
            <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1 items-center h-4">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full bg-gray-300"
                    style={{ animation: `bounce 1s ${i * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick replies */}
      <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
        {QUICK_REPLIES.map(q => (
          <button
            key={q}
            onClick={() => sendMessage(q)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors hover:bg-green-50"
            style={{ borderColor: `${theme.color}40`, color: theme.color, background: `${theme.color}08` }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="px-4 pb-5 pt-2">
        <div className="flex items-center gap-2 bg-white rounded-2xl px-4 py-2 shadow-sm border border-gray-200">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder-gray-400"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all disabled:opacity-30"
            style={{ background: input.trim() ? theme.color : '#E5E7EB' }}
          >
            <Send size={14} color={input.trim() ? 'white' : '#9CA3AF'} />
          </button>
        </div>
      </form>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  )
}