import { useState } from "react";
import { Settings as SettingsIcon, Bell, Mic, Moon, Shield, Key, Wifi } from "lucide-react";
import { WARD_COLOR } from "../constants";

function Toggle({ value, onChange }) {
  return (
    <div onClick={onChange} style={{ width: 42, height: 24, borderRadius: 12, background: value ? WARD_COLOR : "#d1d5db", cursor: "pointer", position: "relative", transition: "background 0.25s", flexShrink: 0 }}>
      <div style={{ position: "absolute", top: 3, left: value ? 20 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "left 0.25s" }} />
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden" }}>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 8, background: "#f8fafc" }}>
        <Icon size={14} color={WARD_COLOR} />
        <span style={{ fontWeight: 800, fontSize: 13, color: "#1e293b" }}>{title}</span>
      </div>
      <div>{children}</div>
    </div>
  );
}

function Row({ label, sub, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #f1f5f9" }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{sub}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

export function Settings({ medReminderActive, setMedReminderActive }) {
  const [notif, setNotif]         = useState({ sound: true, desktop: true, critical: true, meds: medReminderActive });
  const [voice, setVoice]         = useState({ autoDetect: true, aiParse: true, confirmAction: false });
  const [privacy, setPrivacy]     = useState({ twoFactor: false, sessionTimeout: "30min" });
  const [display, setDisplay]     = useState({ darkMode: false, compactView: false });
  const [apiKey, setApiKey]       = useState(import.meta.env.VITE_GEMINI_API_KEY ? "••••••••••••••••" : "");
  const [apiSaved, setApiSaved]   = useState(false);

  const toggle = (setFn, key) => setFn(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 560 }}>
      <div style={{ fontWeight: 800, fontSize: 15, display: "flex", alignItems: "center", gap: 7 }}>
        <SettingsIcon size={16} color={WARD_COLOR} /> Settings
      </div>

      <Section title="Notifications" icon={Bell}>
        <Row label="Alert Sounds" sub="Play audio for critical alerts">
          <Toggle value={notif.sound} onChange={() => toggle(setNotif, "sound")} />
        </Row>
        <Row label="Desktop Notifications" sub="Browser push notifications">
          <Toggle value={notif.desktop} onChange={() => toggle(setNotif, "desktop")} />
        </Row>
        <Row label="Critical Alert Banner" sub="Show full-screen banner for critical events">
          <Toggle value={notif.critical} onChange={() => toggle(setNotif, "critical")} />
        </Row>
        <Row label="Medication Reminders" sub="Auto-remind for pending medications">
          <Toggle value={medReminderActive} onChange={() => setMedReminderActive(v => !v)} />
        </Row>
      </Section>

      <Section title="Voice & AI" icon={Mic}>
        <Row label="Auto-detect Microphone" sub="Automatically find available mic">
          <Toggle value={voice.autoDetect} onChange={() => toggle(setVoice, "autoDetect")} />
        </Row>
        <Row label="Gemini AI Command Parsing" sub="Use Gemini AI to understand complex voice commands">
          <Toggle value={voice.aiParse} onChange={() => toggle(setVoice, "aiParse")} />
        </Row>
        <Row label="Confirm Before Dispatching" sub="Ask for confirmation before sending commands">
          <Toggle value={voice.confirmAction} onChange={() => toggle(setVoice, "confirmAction")} />
        </Row>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 6 }}>Gemini API Key</div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="password"
              value={apiKey}
              onChange={e => { setApiKey(e.target.value); setApiSaved(false); }}
              placeholder="Enter your Gemini API key…"
              style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12, outline: "none", fontFamily: "monospace" }}
            />
            <button onClick={() => setApiSaved(true)} style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: apiSaved ? "#16a34a" : WARD_COLOR, color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
              {apiSaved ? "✓ Saved" : "Save"}
            </button>
          </div>
          <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 5 }}>
            Set VITE_GEMINI_API_KEY in your .env file for production use. Key is stored locally.
          </div>
        </div>
      </Section>

      <Section title="Display" icon={Moon}>
        <Row label="Dark Mode" sub="Switch to dark theme (coming soon)">
          <Toggle value={display.darkMode} onChange={() => toggle(setDisplay, "darkMode")} />
        </Row>
        <Row label="Compact View" sub="Reduce padding and spacing">
          <Toggle value={display.compactView} onChange={() => toggle(setDisplay, "compactView")} />
        </Row>
      </Section>

      <Section title="Security & Privacy" icon={Shield}>
        <Row label="Two-Factor Authentication" sub="Require OTP for login">
          <Toggle value={privacy.twoFactor} onChange={() => toggle(setPrivacy, "twoFactor")} />
        </Row>
        <Row label="Session Timeout" sub="Auto-logout after inactivity">
          <select value={privacy.sessionTimeout} onChange={e => setPrivacy(p => ({ ...p, sessionTimeout: e.target.value }))}
            style={{ padding: "6px 10px", borderRadius: 7, border: "1px solid #e2e8f0", fontSize: 11, outline: "none", background: "#fff", color: "#1e293b", cursor: "pointer" }}>
            <option value="15min">15 minutes</option>
            <option value="30min">30 minutes</option>
            <option value="1hr">1 hour</option>
            <option value="never">Never</option>
          </select>
        </Row>
      </Section>

      <Section title="Connection" icon={Wifi}>
        <Row label="Backend API" sub="http://localhost:8000">
          <span style={{ fontSize: 10, fontWeight: 700, color: "#16a34a", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 20, padding: "2px 8px" }}>● Connected</span>
        </Row>
        <Row label="Blockchain Logger" sub="Audit trail enabled">
          <span style={{ fontSize: 10, fontWeight: 700, color: "#2f92d0", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 20, padding: "2px 8px" }}>Active</span>
        </Row>
      </Section>
    </div>
  );
}
