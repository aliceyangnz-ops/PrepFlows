export function IconV3CosmicPurple() {
  const S = 300;
  const R = 66;
  const P = "M 36 78 L 36 26 C 36 17 46 13 56 13 C 72 13 78 25 78 37 C 78 51 68 59 54 59 L 36 59";

  return (
    <div style={{ minHeight: "100vh", background: "#030810", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, fontFamily: "Inter, sans-serif" }}>
      <svg width={S} height={S} viewBox="0 0 300 300" style={{ borderRadius: R, display: "block", boxShadow: "0 32px 80px rgba(162,89,255,0.5), 0 8px 24px rgba(0,0,0,0.8)" }}>
        <defs>
          <linearGradient id="v3bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0A0714" />
            <stop offset="50%" stopColor="#120A24" />
            <stop offset="100%" stopColor="#1A0A30" />
          </linearGradient>
          {/* Deep violet orb — left center */}
          <radialGradient id="v3b1" cx="25%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#A259FF" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#A259FF" stopOpacity="0" />
          </radialGradient>
          {/* Pink-magenta — top right */}
          <radialGradient id="v3b2" cx="80%" cy="25%" r="55%">
            <stop offset="0%" stopColor="#FF5ECB" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#FF5ECB" stopOpacity="0" />
          </radialGradient>
          {/* Blue accent — bottom */}
          <radialGradient id="v3b3" cx="60%" cy="90%" r="50%">
            <stop offset="0%" stopColor="#6366F1" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
          </radialGradient>
          {/* Micro star glow */}
          <radialGradient id="v3star" cx="70%" cy="40%" r="15%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="v3gloss" x1="0%" y1="0%" x2="10%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.25" />
            <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="v3p" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#F0ABFC" />
            <stop offset="40%" stopColor="#C084FC" />
            <stop offset="70%" stopColor="#A259FF" />
            <stop offset="100%" stopColor="#FF5ECB" />
          </linearGradient>
          <filter id="v3blur">
            <feGaussianBlur stdDeviation="28" />
          </filter>
          <filter id="v3pglow">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <clipPath id="v3clip">
            <rect width="300" height="300" rx={R} />
          </clipPath>
        </defs>
        <g clipPath="url(#v3clip)">
          <rect width="300" height="300" fill="url(#v3bg)" />
          <rect width="300" height="300" fill="url(#v3b1)" filter="url(#v3blur)" />
          <rect width="300" height="300" fill="url(#v3b2)" filter="url(#v3blur)" />
          <rect width="300" height="300" fill="url(#v3b3)" filter="url(#v3blur)" />
          <rect width="300" height="300" fill="url(#v3star)" />
          <rect width="300" height="165" fill="url(#v3gloss)" />
        </g>
        <rect width="300" height="300" rx={R} fill="none" stroke="white" strokeOpacity="0.14" strokeWidth="1.5" />
        <g transform="translate(30, 30) scale(2.4)">
          <path d={P} stroke="url(#v3p)" strokeWidth="11" fill="none" strokeLinecap="round" strokeLinejoin="round" filter="url(#v3pglow)" />
        </g>
      </svg>
      <div style={{ color: "#A0B4D0", fontSize: 15, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>Option 3 — Cosmic Purple</div>
    </div>
  );
}
