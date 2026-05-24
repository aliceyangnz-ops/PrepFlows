import { useId } from "react";

interface LogoProps {
  size?: number;
  className?: string;
}

/**
 * PrepFlows gradient flow mark.
 * Dark rounded square + 3 narrowing gradient bars (blue→cyan→indigo) with neon glow.
 * Unique SVG IDs via React useId to avoid conflicts when multiple instances coexist.
 */
export function Logo({ size = 32, className = "" }: LogoProps) {
  const uid = useId().replace(/:/g, "p");
  const gradId = `${uid}g`;
  const glowId = `${uid}w`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="PrepFlows logo"
      role="img"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="40" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#3B82F6" />
          <stop offset="55%"  stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#818CF8" />
        </linearGradient>
        <filter id={glowId} x="-120%" y="-120%" width="340%" height="340%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background — deep black square */}
      <rect width="40" height="40" rx="10" fill="#0A0A0A" />

      {/* Subtle inner glow behind bars */}
      <rect x="7" y="9" width="24" height="22" rx="4" fill={`url(#${gradId})`} opacity="0.06" />

      {/* Flow bars — gradient + glow */}
      <rect x="8" y="11"   width="22" height="3.5" rx="1.75" fill={`url(#${gradId})`} filter={`url(#${glowId})`} />
      <rect x="8" y="18.5" width="15" height="3.5" rx="1.75" fill={`url(#${gradId})`} filter={`url(#${glowId})`} opacity="0.78" />
      <rect x="8" y="26"   width="9"  height="3.5" rx="1.75" fill={`url(#${gradId})`} filter={`url(#${glowId})`} opacity="0.48" />
    </svg>
  );
}
