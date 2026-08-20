import { User, Mail, Phone, Shield, Edit2 } from "lucide-react";
import { useState } from "react";
import { WARD_COLOR } from "../constants";

const INITIAL_PROFILE = {
  name: "Nurse Priya Sharma",
  id: "NR-2847",
  designation: "Senior Registered Nurse",
  ward: "Blue Zone — Ward 4B",
  shift: "Night Shift (7PM – 7AM)",
  experience: "8 years",
  specialization: "ICU & Critical Care",
  phone: "+91 98765 43210",
  email: "priya.sharma@aetherhealth.in",
  certifications: ["ACLS Certified", "BLS Certified", "PALS Certified", "IV Therapy"],
  skills: ["Critical Care", "Medication Administration", "Wound Care", "Patient Assessment", "Fall Prevention", "Emergency Response"],
  supervisor: "Dr. Ramesh Kumar (HOD)",
  department: "Nursing Division",
};

export function Profile() {
  const [profile] = useState(INITIAL_PROFILE);
  const [editing, setEditing] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 600 }}>
      <div style={{ fontWeight: 800, fontSize: 15, display: "flex", alignItems: "center", gap: 7 }}>
        <User size={16} color={WARD_COLOR} /> My Profile
      </div>

      {/* Avatar card */}
      <div style={{ background: `linear-gradient(135deg, ${WARD_COLOR}, #1a6bbf)`, borderRadius: 16, padding: "24px 20px", display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "3px solid rgba(255,255,255,0.5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 900, color: "#fff" }}>
          {profile.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>{profile.name}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>{profile.designation}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>{profile.id}</div>
        </div>
        <button onClick={() => setEditing(e => !e)} style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 8, padding: "6px 12px", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
          <Edit2 size={11} /> Edit
        </button>
      </div>

      {/* Details */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden" }}>
        {[
          { icon: "🏥", label: "Ward", value: profile.ward },
          { icon: "🕐", label: "Shift", value: profile.shift },
          { icon: "⏳", label: "Experience", value: profile.experience },
          { icon: "🎯", label: "Specialization", value: profile.specialization },
          { icon: "👨‍⚕️", label: "Supervisor", value: profile.supervisor },
          { icon: "🏢", label: "Department", value: profile.department },
        ].map((row, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", borderBottom: i < 5 ? "1px solid #f1f5f9" : "none" }}>
            <span style={{ fontSize: 16, width: 20, textAlign: "center", flexShrink: 0 }}>{row.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", letterSpacing: 0.5, textTransform: "uppercase" }}>{row.label}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#1e293b", marginTop: 1 }}>{row.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Contact */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "14px 16px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 10 }}>Contact</div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, background: "#f8faff", border: "1px solid #dbeafe", borderRadius: 9, padding: "8px 12px" }}>
            <Phone size={13} color={WARD_COLOR} />
            <span style={{ fontSize: 12, color: "#1e293b" }}>{profile.phone}</span>
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, background: "#f8faff", border: "1px solid #dbeafe", borderRadius: 9, padding: "8px 12px" }}>
            <Mail size={13} color={WARD_COLOR} />
            <span style={{ fontSize: 11, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{profile.email}</span>
          </div>
        </div>
      </div>

      {/* Certifications */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "14px 16px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 10 }}>
          <Shield size={11} style={{ marginRight: 4, verticalAlign: "middle", color: "#16a34a" }} />Certifications
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {profile.certifications.map(c => (
            <span key={c} style={{ fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 20, background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}>✓ {c}</span>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "14px 16px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 10 }}>Skills</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {profile.skills.map(s => (
            <span key={s} style={{ fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 20, background: "#eff6ff", color: WARD_COLOR, border: `1px solid ${WARD_COLOR}44` }}>{s}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
