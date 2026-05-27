export function IconV1NavyGlass() {
  const S = 300;
  const R = 66; // corner radius (22% of 300)
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
            "0 32px 80px rgba(77,124,255,0.45), 0 8px 24px rgba(0,0,0,0.8)",
        }}
      >
        <defs>
          {/* Base background */}
          <linearGradient id="v1bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#050C1A" />
            <stop offset="100%" stopColor="#0D1E40" />
          </linearGradient>
          {/* Blob 1 — mid-left blue glow */}
          <radialGradient id="v1b1" cx="30%" cy="55%" r="55%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
          </radialGradient>
          {/* Blob 2 — top-right indigo */}
          <radialGradient id="v1b2" cx="75%" cy="30%" r="50%">
            <stop offset="0%" stopColor="#6366F1" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
          </radialGradient>
          {/* Blob 3 — bottom-right purple */}
          <radialGradient id="v1b3" cx="80%" cy="80%" r="45%">
            <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
          </radialGradient>
          {/* Top glass highlight */}
          <linearGradient id="v1gloss" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.22" />
            <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
          {/* Inner edge shimmer */}
          <linearGradient id="v1edge" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.18" />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.06" />
          </linearGradient>
          {/* P gradient */}
          <linearGradient id="v1p" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#93C5FD" />
            <stop offset="35%" stopColor="#4D7CFF" />
            <stop offset="70%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#A259FF" />
          </linearGradient>
          <filter id="v1blur">
            <feGaussianBlur stdDeviation="28" />
          </filter>
          <filter id="v1pglow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id="v1clip">
            <rect width="300" height="300" rx={R} />
          </clipPath>
        </defs>

        <g clipPath="url(#v1clip)">
          {/* Base */}
          <rect width="300" height="300" fill="url(#v1bg)" />
          {/* Blobs */}
          <rect
            width="300"
            height="300"
            fill="url(#v1b1)"
            filter="url(#v1blur)"
          />
          <rect
            width="300"
            height="300"
            fill="url(#v1b2)"
            filter="url(#v1blur)"
          />
          <rect
            width="300"
            height="300"
            fill="url(#v1b3)"
            filter="url(#v1blur)"
          />
          {/* Glass top highlight panel */}
          <rect width="300" height="180" fill="url(#v1gloss)" />
          {/* Edge shimmer overlay */}
          <rect width="300" height="300" fill="url(#v1edge)" />
        </g>

        {/* Border */}
        <rect
          width="300"
          height="300"
          rx={R}
          fill="none"
          stroke="white"
          strokeOpacity="0.14"
          strokeWidth="1.5"
        />

        {/* P letterform — scaled to fill icon */}
        <g transform="translate(30, 30) scale(2.4)">
          <path
            d={P}
            stroke="url(#v1p)"
            strokeWidth="11"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#v1pglow)"
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
        Option 1 — Navy Glass
      </div>
    </div>
  );
}
