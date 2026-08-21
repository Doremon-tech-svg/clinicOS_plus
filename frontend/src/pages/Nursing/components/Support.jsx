import { HelpCircle, Phone, Mail, MessageSquare, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { WARD_COLOR } from "../constants";

const FAQS = [
  { q: "How do I use the Voice Assistant?", a: "Tap the microphone button and speak clearly. Commands like 'wheelchair for bed 2', 'crash cart', 'discharge Mr. Smith', or 'IV fluid needed for bed 7' are supported. The AI will route your command to the right department automatically." },
  { q: "How does the Gemini AI parsing work?", a: "When a Gemini API key is configured in Settings, voice commands are sent to Google's Gemini AI for intelligent parsing. It can understand complex, natural language commands and route them to the correct department with urgency classification." },
  { q: "What does the Fall Risk % mean?", a: "The fall risk score is calculated using an XGBoost ML model trained on patient vitals, medication history, age, and mobility data. Scores above 70% are HIGH risk requiring immediate attention." },
  { q: "How do I discharge a patient?", a: "Either say 'discharge [patient name]' via voice command, or open a patient card, tap 'Discharge', and confirm. The system will free the bed, notify cleaning, and log the event to the blockchain audit trail." },
  { q: "What is the blockchain logging?", a: "Every significant action (voice commands, discharges, medication administration) is logged with a blockchain hash for tamper-proof audit trails. These appear in the Voice Logs & Activity section." },
  { q: "How do I acknowledge a critical alert?", a: "Go to Critical Alerts tab or the alerts panel. Click 'Acknowledge' on any active alert. Acknowledged alerts are moved to the reviewed section and logged in the activity trail." },
  { q: "Can I add tasks manually?", a: "Yes! In the Tasks panel, click the + button at the top right. Fill in the description, patient, room, priority, and category then click Add Task." },
];

function FAQ({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden", marginBottom: 8 }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: open ? "#f8faff" : "#fff", border: "none", cursor: "pointer", textAlign: "left", gap: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{item.q}</span>
        {open ? <ChevronUp size={14} color="#94a3b8" /> : <ChevronDown size={14} color="#94a3b8" />}
      </button>
      {open && (
        <div style={{ padding: "0 14px 14px", fontSize: 12, color: "#475569", lineHeight: 1.6, background: "#f8faff", borderTop: "1px solid #e2e8f0" }}>
          {item.a}
        </div>
      )}
    </div>
  );
}

export function Support() {
  const [ticket, setTicket] = useState({ subject: "", desc: "", priority: "Medium" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!ticket.subject || !ticket.desc) return;
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setTicket({ subject: "", desc: "", priority: "Medium" });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 800, margin: "0 auto", width: "100%" }}>
      <div style={{ fontWeight: 800, fontSize: 15, display: "flex", alignItems: "center", gap: 7 }}>
        <HelpCircle size={16} color={WARD_COLOR} /> Help & Support
      </div>

      {/* Quick contact */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[
          { icon: Phone, label: "Emergency Helpline", value: "+91 1800-HEALTH", color: "#e53e3e" },
          { icon: Phone, label: "IT Support", value: "+91 98765 11111", color: WARD_COLOR },
          { icon: Mail, label: "Nursing Office", value: "nursing@clinicalpulseos.in", color: "#7c3aed" },
          { icon: MessageSquare, label: "Live Chat", value: "Available 24/7", color: "#16a34a" },
        ].map((c, i) => (
          <div key={i} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px 14px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: c.color + "15", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <c.icon size={16} color={c.color} />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5 }}>{c.label}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#1e293b", marginTop: 2 }}>{c.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Submit a ticket */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "18px 16px" }}>
        <div style={{ fontWeight: 800, fontSize: 13, color: "#1e293b", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
          <MessageSquare size={14} color={WARD_COLOR} /> Submit a Support Ticket
        </div>
        {submitted ? (
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "16px", textAlign: "center" }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>✅</div>
            <div style={{ fontWeight: 700, color: "#16a34a" }}>Ticket Submitted!</div>
            <div style={{ fontSize: 11, color: "#4ade80", marginTop: 3 }}>Our team will respond within 2 hours.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input value={ticket.subject} onChange={e => setTicket(t => ({ ...t, subject: e.target.value }))}
              placeholder="Subject *" style={{ padding: "9px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12, outline: "none" }} />
            <textarea value={ticket.desc} onChange={e => setTicket(t => ({ ...t, desc: e.target.value }))}
              placeholder="Describe your issue…" rows={4}
              style={{ padding: "9px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12, outline: "none", resize: "vertical", fontFamily: "inherit" }} />
            <div style={{ display: "flex", gap: 8 }}>
              <select value={ticket.priority} onChange={e => setTicket(t => ({ ...t, priority: e.target.value }))}
                style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12, outline: "none", background: "#fff" }}>
                <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
              </select>
              <button onClick={handleSubmit} style={{ flex: 2, padding: "8px", borderRadius: 8, border: "none", background: WARD_COLOR, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                Submit Ticket
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FAQ */}
      <div>
        <div style={{ fontWeight: 800, fontSize: 13, color: "#1e293b", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
          <BookOpen size={14} color={WARD_COLOR} /> Frequently Asked Questions
        </div>
        {FAQS.map((item, i) => <FAQ key={i} item={item} />)}
      </div>

      {/* Version info */}
      <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 14px", fontSize: 11, color: "#94a3b8" }}>
        ClinicalPulseOS Nursing Station v2.4.1 · Last updated Aug 2026
      </div>
    </div>
  );
}
