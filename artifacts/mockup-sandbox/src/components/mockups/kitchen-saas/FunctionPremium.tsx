import React from "react";
import { ArrowLeft, ShieldAlert, CheckCircle2, Circle, Clock } from "lucide-react";

export function FunctionPremium() {
  const tokens = {
    bg: "#0D1117",
    surface: "#161B22",
    border: "rgba(255,255,255,0.08)",
    primary: "#F97316",
    success: "#22C55E",
    warning: "#EAB308",
    danger: "#EF4444",
    textPrimary: "#F0F6FC",
    textSecondary: "#8B949E",
    blue: "#3B82F6",
  };

  const runSheetItems = [
    { time: "09:00", name: "Kitchen Briefing", category: "SETUP", status: "done" },
    { time: "10:30", name: "Mise en Place — Entrée", category: "PREP", status: "done" },
    { time: "11:00", name: "Dietary Meals Prepared", category: "PREP", status: "done" },
    { time: "14:00", name: "Final Mise en Place — Main", category: "PREP", status: "active" },
    { time: "16:00", name: "Room Setup & Lay", category: "SETUP", status: "upcoming" },
    { time: "17:30", name: "Wait Staff Briefing", category: "SERVICE", status: "upcoming" },
    { time: "18:15", name: "Entrée Service", category: "SERVICE", status: "upcoming" },
    { time: "18:45", name: "Main Course Service", category: "SERVICE", status: "upcoming" },
  ];

  const team = [
    { initials: "JT", name: "James T — Head Chef", color: "#6366F1" },
    { initials: "SM", name: "Sarah M — Sous", color: "#EC4899" },
    { initials: "DK", name: "David K — Lead", color: "#14B8A6" },
    { initials: "ML", name: "Maria L — CDP", color: "#F59E0B" },
  ];

  return (
    <div
      style={{
        width: 390,
        minHeight: 844,
        background: tokens.bg,
        overflowY: "auto",
        fontFamily: "'Inter', system-ui, sans-serif",
        padding: "0 0 48px 0",
        color: tokens.textPrimary,
      }}
    >
      {/* HEADER SECTION */}
      <div style={{ padding: "48px 20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, color: tokens.textSecondary, fontSize: 13, fontWeight: 500 }}>
          <ArrowLeft size={16} />
          <span>Functions</span>
        </div>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px 0", letterSpacing: "-0.02em" }}>Hartley Wedding</h1>
            <div style={{ fontSize: 14, color: tokens.textSecondary }}>Ballroom A · Level 2</div>
          </div>
        </div>

        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(249,115,22,0.1)", color: tokens.primary, padding: "6px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600, marginTop: 12 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: tokens.primary }} />
          LIVE · Service in 2h 14m
        </div>
      </div>

      {/* STATS ROW */}
      <div style={{ display: "flex", gap: 8, padding: "0 20px", marginBottom: 32 }}>
        {[
          { val: "190", label: "Covers", color: tokens.textPrimary },
          { val: "6:30pm", label: "Service", color: tokens.primary },
          { val: "8:00pm", label: "End", color: tokens.textPrimary },
          { val: "Gold", label: "Package", color: tokens.warning },
        ].map((stat, i) => (
          <div key={i} style={{ flex: 1, background: tokens.surface, border: `1px solid ${tokens.border}`, borderRadius: 12, padding: "12px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: stat.color }}>{stat.val}</div>
            <div style={{ fontSize: 11, color: tokens.textSecondary, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* DIETARY SUMMARY */}
      <div style={{ padding: "0 20px", marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <ShieldAlert size={16} color={tokens.textSecondary} />
          <h2 style={{ fontSize: 14, fontWeight: 600, color: tokens.textPrimary }}>Dietary Requirements</h2>
        </div>
        
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          <span style={{ background: "rgba(234, 179, 8, 0.15)", color: tokens.warning, padding: "4px 10px", borderRadius: 6, fontSize: 13, fontWeight: 500 }}>12 Gluten Free</span>
          <span style={{ background: "rgba(34, 197, 94, 0.15)", color: tokens.success, padding: "4px 10px", borderRadius: 6, fontSize: 13, fontWeight: 500 }}>8 Vegan</span>
          <span style={{ background: "rgba(239, 68, 68, 0.2)", color: tokens.danger, padding: "4px 10px", borderRadius: 6, fontSize: 13, fontWeight: 700, border: `1px solid rgba(239,68,68,0.3)` }}>3 Nut Allergy</span>
          <span style={{ background: "rgba(34, 197, 94, 0.15)", color: tokens.success, padding: "4px 10px", borderRadius: 6, fontSize: 13, fontWeight: 500 }}>4 Vegetarian</span>
          <span style={{ background: "rgba(59, 130, 246, 0.15)", color: tokens.blue, padding: "4px 10px", borderRadius: 6, fontSize: 13, fontWeight: 500 }}>2 Dairy Free</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, color: tokens.danger, fontSize: 12, fontWeight: 500, background: "rgba(239, 68, 68, 0.05)", padding: "8px 12px", borderRadius: 6, border: `1px dashed rgba(239,68,68,0.3)` }}>
          ⚠ Confirm nut allergy with kitchen before service
        </div>
      </div>

      {/* RUN SHEET */}
      <div style={{ padding: "0 20px", marginBottom: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: tokens.textPrimary }}>Run Sheet</h2>
          <span style={{ fontSize: 13, color: tokens.textSecondary, fontWeight: 500 }}>8 tasks · 3 done</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {runSheetItems.map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 16, padding: "12px 0", borderBottom: i === runSheetItems.length - 1 ? "none" : `1px solid ${tokens.border}`, opacity: item.status === "done" ? 0.6 : 1, position: "relative" }}>
              
              <div style={{ width: 40, fontSize: 12, color: tokens.textSecondary, fontWeight: 600, paddingTop: 2 }}>{item.time}</div>
              
              <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
                <div style={{ 
                  width: 12, 
                  height: 12, 
                  borderRadius: "50%", 
                  background: item.status === "done" ? tokens.success : item.status === "active" ? tokens.primary : tokens.surface,
                  border: item.status === "upcoming" ? `2px solid ${tokens.textSecondary}` : "none",
                  marginTop: 3,
                  zIndex: 2
                }} />
                {i !== runSheetItems.length - 1 && (
                  <div style={{ position: "absolute", top: 15, bottom: -24, width: 2, background: tokens.border, zIndex: 1 }} />
                )}
              </div>

              <div style={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div style={{ 
                  fontSize: 14, 
                  fontWeight: item.status === "active" ? 600 : 500,
                  color: item.status === "done" ? tokens.textSecondary : tokens.textPrimary,
                  textDecoration: item.status === "done" ? "line-through" : "none"
                }}>
                  {item.name}
                </div>
                <div style={{ 
                  fontSize: 10, 
                  fontWeight: 600, 
                  color: tokens.textSecondary, 
                  background: tokens.surface,
                  border: `1px solid ${tokens.border}`,
                  padding: "2px 6px",
                  borderRadius: 4,
                  letterSpacing: "0.05em"
                }}>
                  {item.category}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TEAM */}
      <div style={{ padding: "0 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: tokens.textPrimary }}>Team</h2>
          <span style={{ fontSize: 13, color: tokens.textSecondary, fontWeight: 500 }}>7 staff</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {team.map((staff, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: staff.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>
                {staff.initials}
              </div>
              <div style={{ fontSize: 14, fontWeight: 500, color: tokens.textPrimary }}>
                {staff.name}
              </div>
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: tokens.surface, border: `1px solid ${tokens.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, color: tokens.textSecondary }}>
              +3
            </div>
            <div style={{ fontSize: 14, fontWeight: 500, color: tokens.textSecondary }}>
              more staff
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
