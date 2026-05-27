const C = {
  bg: "#080808",
  surface: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.08)",
  text: "#FFFFFF",
  muted: "#A1A1AA",
  dim: "#3F3F46",
  grad: "linear-gradient(135deg, #3B82F6 0%, #06B6D4 55%, #818CF8 100%)",
};

const gradText = {
  background:
    "linear-gradient(135deg, #ffffff 0%, #e0f2fe 30%, #a5f3fc 60%, #c4b5fd 100%)",
  WebkitBackgroundClip: "text" as const,
  WebkitTextFillColor: "transparent" as const,
  backgroundClip: "text" as const,
};

function DashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <defs>
        <linearGradient
          id="diA"
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
        stroke="url(#diA)"
        strokeWidth="1.4"
      />
      <line
        x1="6"
        y1="1"
        x2="6"
        y2="4"
        stroke="url(#diA)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <line
        x1="12"
        y1="1"
        x2="12"
        y2="4"
        stroke="url(#diA)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <line
        x1="2"
        y1="6.5"
        x2="16"
        y2="6.5"
        stroke="url(#diA)"
        strokeWidth="0.9"
        opacity="0.4"
      />
      <rect x="4" y="8.5" width="10" height="1.8" rx="0.9" fill="url(#diA)" />
      <rect
        x="4"
        y="11.5"
        width="6.5"
        height="1.8"
        rx="0.9"
        fill="url(#diA)"
        opacity="0.55"
      />
    </svg>
  );
}

function PrepIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <defs>
        <linearGradient
          id="piA"
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
        stroke="url(#piA)"
        strokeWidth="2"
        strokeDasharray="40.84"
        strokeDashoffset="13.07"
        strokeLinecap="round"
        transform="rotate(-90 9 9)"
      />
      <path
        d="M 6 9 L 8 11.2 L 12.5 6.5"
        stroke="url(#piA)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ServiceIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <defs>
        <linearGradient
          id="siA"
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
      <circle cx="9" cy="9" r="7" stroke="url(#siA)" strokeWidth="1.4" />
      <line
        x1="9"
        y1="3"
        x2="9"
        y2="4.2"
        stroke="url(#siA)"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.6"
      />
      <line
        x1="15"
        y1="9"
        x2="13.8"
        y2="9"
        stroke="url(#siA)"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.6"
      />
      <line
        x1="9"
        y1="15"
        x2="9"
        y2="13.8"
        stroke="url(#siA)"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M 9 9 L 6 5.8"
        stroke="url(#siA)"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M 9 9 L 12 5.5"
        stroke="url(#siA)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="9" cy="9" r="1.2" fill="url(#siA)" />
    </svg>
  );
}

const CARDS = [
  {
    label: "Today",
    sub: "All functions at a glance",
    stat: "4 live",
    icon: <DashIcon />,
    statColor: "#06B6D4",
    statBg: "rgba(6,182,212,0.1)",
    statBorder: "rgba(6,182,212,0.2)",
  },
  {
    label: "Prep",
    sub: "Team tasks & progress",
    stat: "68% done",
    icon: <PrepIcon />,
    statColor: "#818CF8",
    statBg: "rgba(129,140,248,0.1)",
    statBorder: "rgba(129,140,248,0.2)",
  },
  {
    label: "Service",
    sub: "Fire courses in real-time",
    stat: "Main away",
    icon: <ServiceIcon />,
    statColor: "#06B6D4",
    statBg: "rgba(6,182,212,0.1)",
    statBorder: "rgba(6,182,212,0.2)",
  },
];

// Layout A — Centered Stack with tagline-first hierarchy and horizontal card strip
export function LayoutA() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        fontFamily: "Inter, -apple-system, sans-serif",
        color: C.text,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 32px 80px",
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
            "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          pointerEvents: "none",
        }}
      />
      {/* orbs */}
      <div
        style={{
          position: "absolute",
          top: "5%",
          left: "8%",
          width: 480,
          height: 480,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(59,130,246,0.16) 0%, transparent 68%)",
          filter: "blur(56px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          right: "5%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(129,140,248,0.12) 0%, transparent 68%)",
          filter: "blur(56px)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          maxWidth: 960,
        }}
      >
        {/* Eyebrow tagline — large, spaced, at the top */}
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "#3F3F46",
            marginBottom: 28,
          }}
        >
          Plan &nbsp;·&nbsp; Prep &nbsp;·&nbsp; Service &nbsp;·&nbsp; Scale
        </div>

        {/* Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            borderRadius: 9999,
            padding: "1px",
            background: C.grad,
            marginBottom: 36,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: C.bg,
              borderRadius: 9999,
              padding: "6px 16px",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: C.grad,
                display: "inline-block",
              }}
            />
            <span
              style={{
                color: C.muted,
                fontSize: 13,
                fontWeight: 500,
                letterSpacing: "0.01em",
              }}
            >
              iOS, Android, Windows and More
            </span>
          </div>
        </div>

        {/* Headline — tighter, more focused */}
        <h1
          style={{
            fontSize: "clamp(52px, 8vw, 88px)",
            fontWeight: 700,
            lineHeight: 1.0,
            letterSpacing: "-0.055em",
            margin: 0,
            marginBottom: 20,
            textAlign: "center",
          }}
        >
          <span style={gradText}>PrepFlows</span>
        </h1>

        {/* Sub */}
        <p
          style={{
            fontSize: "clamp(16px, 2.2vw, 22px)",
            fontWeight: 300,
            color: "#71717A",
            letterSpacing: "-0.02em",
            margin: 0,
            marginBottom: 44,
            textAlign: "center",
            maxWidth: 480,
            lineHeight: 1.4,
          }}
        >
          The operating system for
          <br />
          <span style={{ color: C.muted }}>professional kitchens.</span>
        </p>

        {/* CTAs — horizontal, more compact */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            justifyContent: "center",
            marginBottom: 64,
          }}
        >
          <button
            style={{
              background: C.grad,
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              padding: "13px 32px",
              borderRadius: 9999,
              border: "none",
              cursor: "pointer",
              letterSpacing: "-0.02em",
              boxShadow:
                "0 0 28px rgba(59,130,246,0.3), 0 0 56px rgba(6,182,212,0.12)",
            }}
          >
            Try first month free
          </button>
          <button
            style={{
              background: "transparent",
              color: C.muted,
              fontSize: 14,
              fontWeight: 500,
              padding: "13px 32px",
              borderRadius: 9999,
              border: `1px solid ${C.border}`,
              cursor: "pointer",
              letterSpacing: "-0.01em",
            }}
          >
            View demo
          </button>
        </div>

        {/* Cards — horizontal strip, wider cards with more vertical info */}
        <div
          style={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 14,
          }}
        >
          {CARDS.map((s) => (
            <div
              key={s.label}
              style={{
                position: "relative",
                background: "rgba(255,255,255,0.035)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 20,
                padding: "28px 24px 24px",
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
                  background: C.grad,
                  opacity: 0.45,
                }}
              />
              {/* Icon + stat row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 18,
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background:
                      "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(6,182,212,0.15))",
                    border: "1px solid rgba(59,130,246,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {s.icon}
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: s.statColor,
                    background: s.statBg,
                    border: `1px solid ${s.statBorder}`,
                    borderRadius: 9999,
                    padding: "3px 10px",
                    letterSpacing: "0.02em",
                  }}
                >
                  {s.stat}
                </span>
              </div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: C.text,
                  marginBottom: 6,
                  letterSpacing: "-0.03em",
                }}
              >
                {s.label}
              </div>
              <div style={{ fontSize: 12, color: "#52525B", lineHeight: 1.5 }}>
                {s.sub}
              </div>
              {/* Bottom accent bar */}
              <div
                style={{
                  marginTop: 20,
                  height: 3,
                  borderRadius: 9999,
                  background: "rgba(255,255,255,0.05)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    borderRadius: 9999,
                    background: C.grad,
                    width:
                      s.label === "Prep"
                        ? "68%"
                        : s.label === "Today"
                          ? "100%"
                          : "45%",
                    opacity: 0.6,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Social proof */}
        <div
          style={{
            marginTop: 48,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px 24px",
          }}
        >
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
                gap: 7,
                fontSize: 12,
                color: "#3F3F46",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle
                  cx="6"
                  cy="6"
                  r="5"
                  stroke="url(#ckA)"
                  strokeWidth="1.2"
                />
                <defs>
                  <linearGradient
                    id="ckA"
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
                  stroke="url(#ckA)"
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
  );
}
