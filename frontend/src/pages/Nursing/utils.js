// ─── NURSING SHARED UTILITIES ─────────────────────────────────────────────────

export function genHash() {
  return "0x" + Math.random().toString(16).slice(2, 8) + "..." + Math.random().toString(16).slice(2, 6);
}

export function nowTime() {
  return new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export function nowDate() {
  return new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
}

export const actTypeColor = {
  voice: "#2f92d0", ai: "#8c55aa", med: "#d97706", blockchain: "#16a34a",
  task: "#2f92d0", discharge: "#e53e3e", vitals: "#e11d48", alert: "#e53e3e",
};
export const actTypeIcon = {
  voice: "🎙", ai: "🧠", med: "💊", blockchain: "🔒",
  task: "✅", discharge: "🚪", vitals: "📊", alert: "🚨",
};
