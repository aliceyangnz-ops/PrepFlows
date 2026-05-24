import { useId } from "react";

interface LogoProps {
  size?: number;
  className?: string;
}

/**
 * PrepFlows mark — fluid gradient "P" letterform with neon glow.
 * Thick rounded-stroke path on a deep dark square background.
 * Unique SVG IDs via React useId to avoid conflicts when multiple instances coexist.
 */
export function Logo({ size = 32, className = "" }: LogoProps) {
  const uid = useId().replace(/:/g, "p");
  const bgId = `${uid}bg`;
  const gradId = `${uid}g`;
  const radGlowId = `${uid}r`;
  const glowFilterId = `${uid}f`;

  const P_PATH =
    "M 30 82 L 30 18 Q 30 8 42 8 L 57 8 Q 73 8 73 28 L 73 40 Q 73 58 57 58 L 30 58";

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
        <linearGradient id={bgId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0D1520" />
          <stop offset="100%" stopColor="#060A10" />
        </linearGradient>
        <linearGradient id={gradId} x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="45%" stopColor="#22D3EE" />
          <stop offset="100%" stopColor="#A78BFA" />
        </linearGradient>
        <radialGradient id={radGlowId} cx="52%" cy="38%" r="48%">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
        </radialGradient>
        <filter id={glowFilterId} x="-70%" y="-70%" width="240%" height="240%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background */}
      <rect width="100" height="100" rx="22" fill={`url(#${bgId})`} />

      {/* Ambient radial glow */}
      <rect width="100" height="100" rx="22" fill={`url(#${radGlowId})`} />

      {/* P letterform with glow filter */}
      <path
        d={P_PATH}
        stroke={`url(#${gradId})`}
        strokeWidth="13"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#${glowFilterId})`}
      />
    </svg>
  );
}
