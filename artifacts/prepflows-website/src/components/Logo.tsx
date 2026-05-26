import { useId } from "react";

interface LogoProps {
  size?: number;
  className?: string;
}

/**
 * PrepFlows "P" — liquid glass icon badge.
 * Dark glass rounded square with blue-to-indigo P letterform,
 * top specular highlight, caustic band, and rim light.
 */
export function Logo({ size = 32, className = "" }: LogoProps) {
  const uid = useId().replace(/:/g, "p");

  const ids = {
    bg:          `${uid}-bg`,
    glass:       `${uid}-gl`,
    specTop:     `${uid}-st`,
    specLeft:    `${uid}-sl`,
    pGrad:       `${uid}-pg`,
    glowBg:      `${uid}-gb`,
    pShine:      `${uid}-ps`,
    glow:        `${uid}-gw`,
    rim:         `${uid}-rm`,
    innerShadow: `${uid}-is`,
    clip:        `${uid}-cl`,
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="PrepFlows logo"
      role="img"
    >
      <defs>
        <linearGradient id={ids.bg} x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#0C1828" />
          <stop offset="100%" stopColor="#060D18" />
        </linearGradient>

        <linearGradient id={ids.glass} x1="50" y1="0" x2="50" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#1A3A6B" stopOpacity="0.55" />
          <stop offset="60%"  stopColor="#0E1F40" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#060D18" stopOpacity="0.10" />
        </linearGradient>

        <radialGradient id={ids.specTop} cx="50%" cy="-8%" r="68%" gradientUnits="objectBoundingBox">
          <stop offset="0%"   stopColor="white" stopOpacity="0.32" />
          <stop offset="55%"  stopColor="white" stopOpacity="0.07" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>

        <linearGradient id={ids.specLeft} x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
          <stop offset="0%"  stopColor="white" stopOpacity="0.18" />
          <stop offset="18%" stopColor="white" stopOpacity="0" />
        </linearGradient>

        <linearGradient id={ids.pGrad} x1="28" y1="12" x2="82" y2="88" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#D1EEFF" />
          <stop offset="28%"  stopColor="#60A5FA" />
          <stop offset="62%"  stopColor="#818CF8" />
          <stop offset="100%" stopColor="#A78BFA" />
        </linearGradient>

        <radialGradient id={ids.glowBg} cx="54%" cy="42%" r="42%">
          <stop offset="0%"   stopColor="#4D7CFF" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#4D7CFF" stopOpacity="0" />
        </radialGradient>

        <linearGradient id={ids.pShine} x1="30" y1="12" x2="60" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="white" stopOpacity="0.60" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>

        <filter id={ids.glow} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <linearGradient id={ids.rim} x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0%"   stopColor="white"   stopOpacity="0.35" />
          <stop offset="40%"  stopColor="white"   stopOpacity="0.08" />
          <stop offset="100%" stopColor="#4D7CFF" stopOpacity="0.22" />
        </linearGradient>

        <linearGradient id={ids.innerShadow} x1="50" y1="60" x2="50" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="black" stopOpacity="0" />
          <stop offset="100%" stopColor="black" stopOpacity="0.28" />
        </linearGradient>

        <clipPath id={ids.clip}>
          <rect width="100" height="100" rx="22" />
        </clipPath>
      </defs>

      {/* 1. Base */}
      <rect width="100" height="100" rx="22" fill={`url(#${ids.bg})`} />

      {/* 2. Glass body tint */}
      <rect width="100" height="100" rx="22" fill={`url(#${ids.glass})`} />

      {/* 3. Glow bloom behind P */}
      <rect width="100" height="100" rx="22" fill={`url(#${ids.glowBg})`} />

      {/* 4. Caustic band */}
      <g clipPath={`url(#${ids.clip})`}>
        <path
          d="M -10 18 Q 28 8 52 22 Q 76 36 112 18 L 112 -4 Q 76 14 52 2 Q 28 -10 -10 6 Z"
          fill="white" fillOpacity="0.055"
        />
      </g>

      {/* 5. Top specular glare */}
      <rect width="100" height="100" rx="22" fill={`url(#${ids.specTop})`} />

      {/* 6. Left edge glare */}
      <rect width="100" height="100" rx="22" fill={`url(#${ids.specLeft})`} />

      {/* 7. Bottom inner shadow */}
      <rect width="100" height="100" rx="22" fill={`url(#${ids.innerShadow})`} />

      {/* 8. P letterform with glow */}
      <path
        d="M 32 82 L 32 20 C 32 14 42 10 53 10 C 70 10 80 21 80 35 C 80 51 69 60 52 60 L 32 60"
        stroke={`url(#${ids.pGrad})`}
        strokeWidth="12.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#${ids.glow})`}
      />

      {/* 9. P top shine */}
      <path
        d="M 32 20 C 32 14 42 10 53 10 C 70 10 80 21 80 35"
        stroke={`url(#${ids.pShine})`}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
      />

      {/* 10. Rim */}
      <rect width="100" height="100" rx="22" stroke={`url(#${ids.rim})`} strokeWidth="1.5" fill="none" />

      {/* 11. Inner rim */}
      <rect x="1.5" y="1.5" width="97" height="97" rx="21"
            stroke="white" strokeOpacity="0.06" strokeWidth="1" fill="none" />
    </svg>
  );
}
