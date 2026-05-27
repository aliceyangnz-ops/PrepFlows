export function IconV2AuroraBlue() {
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
            "0 32px 80px rgba(99,102,241,0.5), 0 8px 24px rgba(0,0,0,0.8)",
        }}
      >
        <defs>
          <linearGradient id="v2bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#040818" />
            <stop offset="50%" stopColor="#0C0B2E" />
            <stop offset="100%" stopColor="#100520" />
          </linearGradient>
          {/* Aurora band 1 — cyan-blue horizontal sweep */}
          <radialGradient id="v2a1" cx="20%" cy="40%" r="70%">
            <stop offset="0%" stopColor="#00E0FF" stopOpacity="0.5" />
            <stop offset="60%" stopColor="#3B82F6" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
          </radialGradient>
          {/* Aurora band 2 — indigo-purple diagonal */}
          <radialGradient id="v2a2" cx="75%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#6366F1" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
          </radialGradient>
          {/* Aurora band 3 — pink bottom accent */}
          <radialGradient id="v2a3" cx="55%" cy="85%" r="50%">
            <stop offset="0%" stopColor="#EC4899" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#EC4899" stopOpacity="0" />
          </radialGradient>
          {/* Aurora band 4 — top blue */}
          <radialGradient id="v2a4" cx="50%" cy="10%" r="60%">
            <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#60A5FA" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="v2gloss" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.28" />
            <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="v2p" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E0F2FE" />
            <stop offset="40%" stopColor="#93C5FD" />
            <stop offset="100%" stopColor="#C4B5FD" />
          </linearGradient>
          <filter id="v2blur">
            <feGaussianBlur stdDeviation="30" />
          </filter>
          <filter id="v2pglow">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id="v2clip">
            <rect width="300" height="300" rx={R} />
          </clipPath>
        </defs>
        <g clipPath="url(#v2clip)">
          <rect width="300" height="300" fill="url(#v2bg)" />
          <rect
            width="300"
            height="300"
            fill="url(#v2a1)"
            filter="url(#v2blur)"
          />
          <rect
            width="300"
            height="300"
            fill="url(#v2a2)"
            filter="url(#v2blur)"
          />
          <rect
            width="300"
            height="300"
            fill="url(#v2a3)"
            filter="url(#v2blur)"
          />
          <rect
            width="300"
            height="300"
            fill="url(#v2a4)"
            filter="url(#v2blur)"
          />
          <rect width="300" height="160" fill="url(#v2gloss)" />
        </g>
        <rect
          width="300"
          height="300"
          rx={R}
          fill="none"
          stroke="white"
          strokeOpacity="0.16"
          strokeWidth="1.5"
        />
        <g transform="translate(30, 30) scale(2.4)">
          <path
            d={P}
            stroke="url(#v2p)"
            strokeWidth="11"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#v2pglow)"
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
        Option 2 — Aurora Blue
      </div>
    </div>
  );
}
