
const C = {
  bg: "#080808",
  border: "rgba(255,255,255,0.08)",
  text: "#FFFFFF",
  muted: "#A1A1AA",
  dim: "#3F3F46",
  grad: "linear-gradient(135deg, #3B82F6 0%, #06B6D4 55%, #818CF8 100%)",
};

const gradText = {
  background: "linear-gradient(135deg, #ffffff 0%, #e0f2fe 30%, #a5f3fc 60%, #c4b5fd 100%)",
  WebkitBackgroundClip: "text" as const,
  WebkitTextFillColor: "transparent" as const,
  backgroundClip: "text" as const,
};

function DashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
      <defs><linearGradient id="diB" x1="0" y1="0" x2="18" y2="18" gradientUnits="userSpaceOnUse"><stop stopColor="#60A5FA" /><stop offset="1" stopColor="#22D3EE" /></linearGradient></defs>
      <rect x="2" y="2.5" width="14" height="13" rx="2.5" stroke="url(#diB)" strokeWidth="1.4" />
      <line x1="6" y1="1" x2="6" y2="4" stroke="url(#diB)" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="12" y1="1" x2="12" y2="4" stroke="url(#diB)" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="2" y1="6.5" x2="16" y2="6.5" stroke="url(#diB)" strokeWidth="0.9" opacity="0.4" />
      <rect x="4" y="8.5" width="10" height="1.8" rx="0.9" fill="url(#diB)" />
      <rect x="4" y="11.5" width="6.5" height="1.8" rx="0.9" fill="url(#diB)" opacity="0.55" />
    </svg>
  );
}

function PrepIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
      <defs><linearGradient id="piB" x1="0" y1="0" x2="18" y2="18" gradientUnits="userSpaceOnUse"><stop stopColor="#818CF8" /><stop offset="1" stopColor="#22D3EE" /></linearGradient></defs>
      <circle cx="9" cy="9" r="6.5" stroke="rgba(129,140,248,0.18)" strokeWidth="2" />
      <circle cx="9" cy="9" r="6.5" stroke="url(#piB)" strokeWidth="2" strokeDasharray="40.84" strokeDashoffset="13.07" strokeLinecap="round" transform="rotate(-90 9 9)" />
      <path d="M 6 9 L 8 11.2 L 12.5 6.5" stroke="url(#piB)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ServiceIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
      <defs><linearGradient id="siB" x1="0" y1="0" x2="18" y2="18" gradientUnits="userSpaceOnUse"><stop stopColor="#22D3EE" /><stop offset="1" stopColor="#A78BFA" /></linearGradient></defs>
      <circle cx="9" cy="9" r="7" stroke="url(#siB)" strokeWidth="1.4" />
      <line x1="9" y1="3" x2="9" y2="4.2" stroke="url(#siB)" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
      <line x1="15" y1="9" x2="13.8" y2="9" stroke="url(#siB)" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
      <line x1="9" y1="15" x2="9" y2="13.8" stroke="url(#siB)" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
      <path d="M 9 9 L 6 5.8" stroke="url(#siB)" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M 9 9 L 12 5.5" stroke="url(#siB)" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="9" cy="9" r="1.2" fill="url(#siB)" />
    </svg>
  );
}

const CARDS = [
  { label: "Today",   sub: "All functions at a glance", stat: "4 live",    icon: <DashIcon />,    color: "#06B6D4", bar: "100%" },
  { label: "Prep",    sub: "Team tasks & progress",     stat: "68% done",  icon: <PrepIcon />,    color: "#818CF8", bar: "68%" },
  { label: "Service", sub: "Fire courses in real-time", stat: "Main away", icon: <ServiceIcon />, color: "#06B6D4", bar: "45%" },
];

// Layout B — Split: text left, stacked product cards right
export function LayoutB() {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "Inter, -apple-system, sans-serif", color: C.text, display: "flex", alignItems: "center", padding: "80px 48px", overflow: "hidden", position: "relative" }}>

      {/* dot grid */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />
      {/* orbs */}
      <div style={{ position: "absolute", top: "20%", left: "-5%", width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.14) 0%, transparent 68%)", filter: "blur(64px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "10%", right: "8%", width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle, rgba(129,140,248,0.12) 0%, transparent 68%)", filter: "blur(64px)", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72, alignItems: "center" }}>

        {/* LEFT — all text content */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>

          {/* Badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 9999, padding: "1px", background: C.grad, marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.bg, borderRadius: 9999, padding: "5px 14px" }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: C.grad, display: "inline-block" }} />
              <span style={{ color: C.muted, fontSize: 12, fontWeight: 500, letterSpacing: "0.01em" }}>iOS, Android, Windows and More</span>
            </div>
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: "clamp(48px, 6vw, 80px)", fontWeight: 700, lineHeight: 0.95, letterSpacing: "-0.055em", margin: 0, marginBottom: 24 }}>
            <span style={gradText}>PrepFlows</span>
          </h1>

          {/* Tagline */}
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase", color: "#3F3F46", margin: 0, marginBottom: 20 }}>
            Plan · Prep · Service · Scale
          </p>

          {/* Description */}
          <p style={{ fontSize: "clamp(15px, 1.8vw, 18px)", fontWeight: 300, color: "#71717A", letterSpacing: "-0.02em", margin: 0, marginBottom: 40, lineHeight: 1.55, maxWidth: 380 }}>
            The operating system for professional kitchens. From download to live operations in ten minutes.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 320 }}>
            <button style={{ background: C.grad, color: "#fff", fontSize: 15, fontWeight: 600, padding: "15px 28px", borderRadius: 12, border: "none", cursor: "pointer", letterSpacing: "-0.02em", boxShadow: "0 0 28px rgba(59,130,246,0.28)", textAlign: "center" }}>
              Try first month free
            </button>
            <button style={{ background: "rgba(255,255,255,0.04)", color: C.muted, fontSize: 14, fontWeight: 500, padding: "13px 28px", borderRadius: 12, border: `1px solid ${C.border}`, cursor: "pointer", letterSpacing: "-0.01em", textAlign: "center" }}>
              View demo →
            </button>
          </div>

          {/* Social proof — left-aligned */}
          <div style={{ marginTop: 40, display: "flex", flexWrap: "wrap", gap: "8px 20px" }}>
            {["Hotel chains", "Wedding venues", "Function centres", "Catering companies"].map((t) => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#3F3F46" }}>
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="5" stroke="url(#ckB)" strokeWidth="1.2" />
                  <defs><linearGradient id="ckB" x1="0" y1="0" x2="12" y2="12" gradientUnits="userSpaceOnUse"><stop stopColor="#3B82F6" /><stop offset="1" stopColor="#06B6D4" /></linearGradient></defs>
                  <path d="M 3.5 6 L 5.2 7.8 L 8.5 4.5" stroke="url(#ckB)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — stacked product cards, full height */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {CARDS.map((s, i) => (
            <div key={s.label} style={{ position: "relative", background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "24px 28px", overflow: "hidden", display: "flex", alignItems: "center", gap: 20 }}>
              {/* Left gradient stripe */}
              <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 2, background: C.grad, opacity: i === 1 ? 0.8 : 0.35, borderRadius: "2px 0 0 2px" }} />
              {/* Icon */}
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, rgba(59,130,246,0.18), rgba(6,182,212,0.12))", border: "1px solid rgba(59,130,246,0.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {s.icon}
              </div>
              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 3, letterSpacing: "-0.025em" }}>{s.label}</div>
                <div style={{ fontSize: 12, color: "#52525B" }}>{s.sub}</div>
                {/* Progress */}
                <div style={{ marginTop: 10, height: 2, borderRadius: 9999, background: "rgba(255,255,255,0.06)" }}>
                  <div style={{ height: "100%", borderRadius: 9999, background: C.grad, width: s.bar, opacity: 0.7, transition: "width 0.6s ease" }} />
                </div>
              </div>
              {/* Stat badge */}
              <span style={{ fontSize: 11, fontWeight: 700, color: s.color, background: `${s.color}18`, border: `1px solid ${s.color}30`, borderRadius: 8, padding: "4px 10px", letterSpacing: "0.01em", flexShrink: 0, whiteSpace: "nowrap" }}>{s.stat}</span>
            </div>
          ))}

          {/* Divider stat row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 6 }}>
            {[["10 min", "to go live"], ["100%", "offline"], ["Any role", "plain language"]].map(([num, label]) => (
              <div key={num} style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.04em", ...gradText, marginBottom: 3 }}>{num}</div>
                <div style={{ fontSize: 11, color: "#52525B", letterSpacing: "0.01em" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
