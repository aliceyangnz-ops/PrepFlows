export function IconV5MidnightGold() {
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
            "0 32px 80px rgba(251,191,36,0.35), 0 8px 24px rgba(0,0,0,0.8)",
        }}
      >
        <defs>
          <linearGradient id="v5bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0A0700" />
            <stop offset="50%" stopColor="#120D02" />
            <stop offset="100%" stopColor="#0E0A05" />
          </linearGradient>
          {/* Warm gold orb — left */}
          <radialGradient id="v5b1" cx="25%" cy="55%" r="60%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.55" />
            <stop offset="60%" stopColor="#D97706" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#D97706" stopOpacity="0" />
          </radialGradient>
          {/* Amber-orange — top right */}
          <radialGradient id="v5b2" cx="78%" cy="28%" r="52%">
            <stop offset="0%" stopColor="#FB923C" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#FB923C" stopOpacity="0" />
          </radialGradient>
          {/* Yellow glow — bottom center */}
          <radialGradient id="v5b3" cx="50%" cy="90%" r="45%">
            <stop offset="0%" stopColor="#FCD34D" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#FCD34D" stopOpacity="0" />
          </radialGradient>
          {/* Navy-indigo cool accent — upper edge */}
          <radialGradient id="v5b4" cx="60%" cy="10%" r="45%">
            <stop offset="0%" stopColor="#1E3A5F" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#1E3A5F" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="v5gloss" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.22" />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="v5p" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="30%" stopColor="#FBBF24" />
            <stop offset="65%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#FB923C" />
          </linearGradient>
          <filter id="v5blur">
            <feGaussianBlur stdDeviation="28" />
          </filter>
          <filter id="v5pglow">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id="v5clip">
            <rect width="300" height="300" rx={R} />
          </clipPath>
        </defs>
        <g clipPath="url(#v5clip)">
          <rect width="300" height="300" fill="url(#v5bg)" />
          <rect
            width="300"
            height="300"
            fill="url(#v5b1)"
            filter="url(#v5blur)"
          />
          <rect
            width="300"
            height="300"
            fill="url(#v5b2)"
            filter="url(#v5blur)"
          />
          <rect
            width="300"
            height="300"
            fill="url(#v5b3)"
            filter="url(#v5blur)"
          />
          <rect
            width="300"
            height="300"
            fill="url(#v5b4)"
            filter="url(#v5blur)"
          />
          <rect width="300" height="160" fill="url(#v5gloss)" />
        </g>
        <rect
          width="300"
          height="300"
          rx={R}
          fill="none"
          stroke="rgba(253,230,138,0.2)"
          strokeWidth="1.5"
        />
        <g transform="translate(30, 30) scale(2.4)">
          <path
            d={P}
            stroke="url(#v5p)"
            strokeWidth="11"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#v5pglow)"
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
        Option 5 — Midnight Gold
      </div>
    </div>
  );
}
