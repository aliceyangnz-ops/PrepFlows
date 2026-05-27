export function IconV4OceanGlow() {
  const S = 300;
  const R = 66;
  const P =
    "M 36 78 L 36 26 C 36 17 46 13 56 13 C 72 13 78 25 78 37 C 78 51 68 59 54 59 L 36 59";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#030810",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        fontFamily: "Inter, sans-serif",
      }}
    >
      <svg
        width={S}
        height={S}
        viewBox="0 0 300 300"
        style={{
          borderRadius: R,
          display: "block",
          boxShadow:
            "0 32px 80px rgba(0,224,255,0.4), 0 8px 24px rgba(0,0,0,0.8)",
        }}
      >
        <defs>
          <linearGradient id="v4bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#020D14" />
            <stop offset="60%" stopColor="#051420" />
            <stop offset="100%" stopColor="#071D30" />
          </linearGradient>
          {/* Teal orb — center-left */}
          <radialGradient id="v4b1" cx="30%" cy="50%" r="65%">
            <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.55" />
            <stop offset="60%" stopColor="#0284C7" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#0284C7" stopOpacity="0" />
          </radialGradient>
          {/* Electric cyan — top right */}
          <radialGradient id="v4b2" cx="75%" cy="25%" r="55%">
            <stop offset="0%" stopColor="#00E0FF" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#00E0FF" stopOpacity="0" />
          </radialGradient>
          {/* Emerald — bottom */}
          <radialGradient id="v4b3" cx="55%" cy="88%" r="48%">
            <stop offset="0%" stopColor="#00F5A0" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#00F5A0" stopOpacity="0" />
          </radialGradient>
          {/* Deep blue accent */}
          <radialGradient id="v4b4" cx="85%" cy="65%" r="40%">
            <stop offset="0%" stopColor="#1D4ED8" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="v4gloss" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.26" />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="v4p" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#E0F9FF" />
            <stop offset="30%" stopColor="#00E0FF" />
            <stop offset="65%" stopColor="#0EA5E9" />
            <stop offset="100%" stopColor="#00F5A0" />
          </linearGradient>
          <filter id="v4blur">
            <feGaussianBlur stdDeviation="30" />
          </filter>
          <filter id="v4pglow">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id="v4clip">
            <rect width="300" height="300" rx={R} />
          </clipPath>
        </defs>
        <g clipPath="url(#v4clip)">
          <rect width="300" height="300" fill="url(#v4bg)" />
          <rect
            width="300"
            height="300"
            fill="url(#v4b1)"
            filter="url(#v4blur)"
          />
          <rect
            width="300"
            height="300"
            fill="url(#v4b2)"
            filter="url(#v4blur)"
          />
          <rect
            width="300"
            height="300"
            fill="url(#v4b3)"
            filter="url(#v4blur)"
          />
          <rect
            width="300"
            height="300"
            fill="url(#v4b4)"
            filter="url(#v4blur)"
          />
          <rect width="300" height="160" fill="url(#v4gloss)" />
        </g>
        <rect
          width="300"
          height="300"
          rx={R}
          fill="none"
          stroke="white"
          strokeOpacity="0.15"
          strokeWidth="1.5"
        />
        <g transform="translate(30, 30) scale(2.4)">
          <path
            d={P}
            stroke="url(#v4p)"
            strokeWidth="11"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#v4pglow)"
          />
        </g>
      </svg>
      <div
        style={{
          color: "#A0B4D0",
          fontSize: 15,
          fontWeight: 600,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        Option 4 — Ocean Glow
      </div>
    </div>
  );
}
