const C = {
  bg: "#080808",
  border: "rgba(255,255,255,0.08)",
  text: "#FFFFFF",
  muted: "#A1A1AA",
  grad: "linear-gradient(135deg, #3B82F6 0%, #06B6D4 55%, #818CF8 100%)",
};

const gradText = {
  background:
    "linear-gradient(135deg, #ffffff 0%, #e0f2fe 30%, #a5f3fc 60%, #c4b5fd 100%)",
  WebkitBackgroundClip: "text" as const,
  WebkitTextFillColor: "transparent" as const,
  backgroundClip: "text" as const,
};

function DashIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <defs>
        <linearGradient
          id="diC"
          x1="0"
          y1="0"
          x2="18"
          y2="18"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#60A5FA" />
          <stop offset="1" stopColor="#22D3EE" />
        </linearGradient>
      </defs>
      <rect
        x="2"
        y="2.5"
        width="14"
        height="13"
        rx="2.5"
        stroke="url(#diC)"
        strokeWidth="1.4"
      />
      <line
        x1="6"
        y1="1"
        x2="6"
        y2="4"
        stroke="url(#diC)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <line
        x1="12"
        y1="1"
        x2="12"
        y2="4"
        stroke="url(#diC)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <line
        x1="2"
        y1="6.5"
        x2="16"
        y2="6.5"
        stroke="url(#diC)"
        strokeWidth="0.9"
        opacity="0.4"
      />
      <rect x="4" y="8.5" width="10" height="1.8" rx="0.9" fill="url(#diC)" />
      <rect
        x="4"
        y="11.5"
        width="6.5"
        height="1.8"
        rx="0.9"
        fill="url(#diC)"
        opacity="0.55"
      />
    </svg>
  );
}

function PrepIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <defs>
        <linearGradient
          id="piC"
          x1="0"
          y1="0"
          x2="18"
          y2="18"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#818CF8" />
          <stop offset="1" stopColor="#22D3EE" />
        </linearGradient>
      </defs>
      <circle
        cx="9"
        cy="9"
        r="6.5"
        stroke="rgba(129,140,248,0.18)"
        strokeWidth="2"
      />
      <circle
        cx="9"
        cy="9"
        r="6.5"
        stroke="url(#piC)"
        strokeWidth="2"
        strokeDasharray="40.84"
        strokeDashoffset="13.07"
        strokeLinecap="round"
        transform="rotate(-90 9 9)"
      />
      <path
        d="M 6 9 L 8 11.2 L 12.5 6.5"
        stroke="url(#piC)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ServiceIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <defs>
        <linearGradient
          id="siC"
          x1="0"
          y1="0"
          x2="18"
          y2="18"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#22D3EE" />
          <stop offset="1" stopColor="#A78BFA" />
        </linearGradient>
      </defs>
      <circle cx="9" cy="9" r="7" stroke="url(#siC)" strokeWidth="1.4" />
      <line
        x1="9"
        y1="3"
        x2="9"
        y2="4.2"
        stroke="url(#siC)"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.6"
      />
      <line
        x1="15"
        y1="9"
        x2="13.8"
        y2="9"
        stroke="url(#siC)"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.6"
      />
      <line
        x1="9"
        y1="15"
        x2="9"
        y2="13.8"
        stroke="url(#siC)"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M 9 9 L 6 5.8"
        stroke="url(#siC)"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M 9 9 L 12 5.5"
        stroke="url(#siC)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="9" cy="9" r="1.2" fill="url(#siC)" />
    </svg>
  );
}

// Layout C — Magazine Grid: large hero card left, asymmetric feature grid right
export function LayoutC() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        fontFamily: "Inter, -apple-system, sans-serif",
        color: C.text,
        display: "flex",
        alignItems: "stretch",
        padding: "72px 40px",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* dot grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "-10%",
          left: "30%",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 68%)",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 1100,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1.1fr 0.9fr",
          gap: 16,
          alignItems: "stretch",
        }}
      >
        {/* LEFT — large hero card */}
        <div
          style={{
            position: "relative",
            background: "rgba(255,255,255,0.03)",
            border: `1px solid ${C.border}`,
            borderRadius: 28,
            padding: "52px 48px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            overflow: "hidden",
            minHeight: 520,
          }}
        >
          {/* Top gradient accent */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 1,
              background: C.grad,
              opacity: 0.5,
            }}
          />
          {/* Background glow */}
          <div
            style={{
              position: "absolute",
              bottom: "-20%",
              right: "-10%",
              width: 400,
              height: 400,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 68%)",
              filter: "blur(60px)",
              pointerEvents: "none",
            }}
          />

          <div>
            {/* Badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                borderRadius: 9999,
                padding: "1px",
                background: C.grad,
                marginBottom: 40,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: C.bg,
                  borderRadius: 9999,
                  padding: "5px 14px",
                }}
              >
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: C.grad,
                    display: "inline-block",
                  }}
                />
                <span style={{ color: C.muted, fontSize: 12, fontWeight: 500 }}>
                  iOS · Android · Windows
                </span>
              </div>
            </div>

            {/* Headline — very large, full-bleed */}
            <h1
              style={{
                fontSize: "clamp(56px, 7vw, 92px)",
                fontWeight: 700,
                lineHeight: 0.92,
                letterSpacing: "-0.06em",
                margin: 0,
                marginBottom: 24,
              }}
            >
              <span style={gradText}>
                Prep
                <br />
                Flows
              </span>
            </h1>

            <p
              style={{
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#3F3F46",
                marginBottom: 24,
              }}
            >
              Plan · Prep · Service · Scale
            </p>

            <p
              style={{
                fontSize: 15,
                fontWeight: 300,
                color: "#5A5A65",
                lineHeight: 1.6,
                margin: 0,
                marginBottom: 44,
                maxWidth: 340,
              }}
            >
              The operating system for professional kitchens. From download to
              live operations in 10 minutes.
            </p>
          </div>

          <div>
            {/* CTAs */}
            <div style={{ display: "flex", gap: 12, marginBottom: 40 }}>
              <button
                style={{
                  flex: 1,
                  background: C.grad,
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 600,
                  padding: "14px 20px",
                  borderRadius: 12,
                  border: "none",
                  cursor: "pointer",
                  letterSpacing: "-0.02em",
                  boxShadow: "0 0 24px rgba(59,130,246,0.25)",
                }}
              >
                Try first month free
              </button>
              <button
                style={{
                  background: "rgba(255,255,255,0.05)",
                  color: C.muted,
                  fontSize: 14,
                  fontWeight: 500,
                  padding: "14px 20px",
                  borderRadius: 12,
                  border: `1px solid ${C.border}`,
                  cursor: "pointer",
                  letterSpacing: "-0.01em",
                  whiteSpace: "nowrap",
                }}
              >
                Demo →
              </button>
            </div>

            {/* Social proof inline */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px" }}>
              {[
                "Hotel chains",
                "Wedding venues",
                "Function centres",
                "Catering companies",
              ].map((t) => (
                <div
                  key={t}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 11,
                    color: "#3F3F46",
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <circle
                      cx="6"
                      cy="6"
                      r="5"
                      stroke="url(#ckC)"
                      strokeWidth="1.2"
                    />
                    <defs>
                      <linearGradient
                        id="ckC"
                        x1="0"
                        y1="0"
                        x2="12"
                        y2="12"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#3B82F6" />
                        <stop offset="1" stopColor="#06B6D4" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 3.5 6 L 5.2 7.8 L 8.5 4.5"
                      stroke="url(#ckC)"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — asymmetric 2x2 grid of smaller module cards */}
        <div
          style={{ display: "grid", gridTemplateRows: "1fr 1fr 1fr", gap: 14 }}
        >
          {/* Row 1 — Today card */}
          <div
            style={{
              position: "relative",
              background: "rgba(255,255,255,0.035)",
              border: `1px solid ${C.border}`,
              borderRadius: 20,
              padding: "24px 24px",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              gap: 18,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 1,
                background: C.grad,
                opacity: 0.45,
              }}
            />
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 13,
                background:
                  "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(6,182,212,0.15))",
                border: "1px solid rgba(59,130,246,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <DashIcon size={22} />
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.text,
                  marginBottom: 3,
                  letterSpacing: "-0.025em",
                }}
              >
                Today's View
              </div>
              <div style={{ fontSize: 11, color: "#52525B", marginBottom: 10 }}>
                All functions at a glance
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {["Wedding 200", "Corp Lunch 80", "+2"].map((tag, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: "#06B6D4",
                      background: "rgba(6,182,212,0.1)",
                      border: "1px solid rgba(6,182,212,0.2)",
                      borderRadius: 6,
                      padding: "2px 8px",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: "-0.05em",
                ...gradText,
                flexShrink: 0,
              }}
            >
              4
            </div>
          </div>

          {/* Row 2 — Prep + Service side by side */}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
          >
            {/* Prep */}
            <div
              style={{
                position: "relative",
                background: "rgba(255,255,255,0.035)",
                border: `1px solid ${C.border}`,
                borderRadius: 20,
                padding: "22px 20px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 1,
                  background: "linear-gradient(135deg, #818CF8, #22D3EE)",
                  opacity: 0.5,
                }}
              />
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 11,
                  background: "rgba(129,140,248,0.15)",
                  border: "1px solid rgba(129,140,248,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 14,
                }}
              >
                <PrepIcon size={18} />
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: C.text,
                  marginBottom: 4,
                  letterSpacing: "-0.02em",
                }}
              >
                Prep
              </div>
              <div style={{ fontSize: 11, color: "#52525B", marginBottom: 14 }}>
                Team tasks
              </div>
              {/* Ring */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <svg width="36" height="36" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    stroke="rgba(129,140,248,0.15)"
                    strokeWidth="3"
                    fill="none"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    stroke="url(#prepRingC)"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray="87.96"
                    strokeDashoffset="28.15"
                    strokeLinecap="round"
                    transform="rotate(-90 18 18)"
                  />
                  <defs>
                    <linearGradient
                      id="prepRingC"
                      x1="0"
                      y1="0"
                      x2="36"
                      y2="36"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#818CF8" />
                      <stop offset="1" stopColor="#22D3EE" />
                    </linearGradient>
                  </defs>
                </svg>
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    letterSpacing: "-0.04em",
                    color: "#818CF8",
                  }}
                >
                  68%
                </span>
              </div>
            </div>

            {/* Service */}
            <div
              style={{
                position: "relative",
                background: "rgba(255,255,255,0.035)",
                border: `1px solid ${C.border}`,
                borderRadius: 20,
                padding: "22px 20px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 1,
                  background: "linear-gradient(135deg, #22D3EE, #A78BFA)",
                  opacity: 0.5,
                }}
              />
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 11,
                  background: "rgba(6,182,212,0.12)",
                  border: "1px solid rgba(6,182,212,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 14,
                }}
              >
                <ServiceIcon size={18} />
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: C.text,
                  marginBottom: 4,
                  letterSpacing: "-0.02em",
                }}
              >
                Service
              </div>
              <div style={{ fontSize: 11, color: "#52525B", marginBottom: 14 }}>
                Live mode
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {[
                  ["Entrees", "#22C55E"],
                  ["Mains", "#EAB308"],
                  ["Dessert", "#52525B"],
                ].map(([course, col]) => (
                  <div
                    key={course}
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: col,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: 11,
                        color: col === "#52525B" ? "#52525B" : C.muted,
                        fontWeight: col === "#EAB308" ? 600 : 400,
                      }}
                    >
                      {course}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Row 3 — Stats strip */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 14,
            }}
          >
            {[
              { num: "10 min", label: "to go live", accent: "#3B82F6" },
              { num: "100%", label: "offline", accent: "#06B6D4" },
              { num: "Any role", label: "plain language", accent: "#818CF8" },
            ].map((s) => (
              <div
                key={s.num}
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: `1px solid ${C.border}`,
                  borderRadius: 16,
                  padding: "18px 14px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                }}
              >
                <div
                  style={{
                    fontSize: s.num.length > 5 ? 14 : 20,
                    fontWeight: 700,
                    letterSpacing: "-0.04em",
                    color: s.accent,
                    textAlign: "center",
                    lineHeight: 1.1,
                  }}
                >
                  {s.num}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "#3F3F46",
                    letterSpacing: "0.02em",
                    textAlign: "center",
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
