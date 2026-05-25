import { useId } from "react";

interface LogoProps {
  size?: number;
  className?: string;
}

/**
 * PrepFlows "P" mark — clean stroke letterform with a blue-to-purple
 * gradient. Transparent background; floats on any surface.
 * Web SVG with feGaussianBlur glow for polish.
 */
export function Logo({ size = 32, className = "" }: LogoProps) {
  const uid = useId().replace(/:/g, "p");
  const gradId = `${uid}g`;
  const filterId = `${uid}f`;

  const P_PATH =
    "M 36 78 L 36 26 C 36 17 46 13 56 13 C 72 13 78 25 78 37 C 78 51 68 59 54 59 L 36 59";

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
        {/* Sky blue → royal blue → indigo → purple */}
        <linearGradient id={gradId} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#93C5FD" />
          <stop offset="30%" stopColor="#4D7CFF" />
          <stop offset="65%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#A259FF" />
        </linearGradient>

        {/* Glow filter */}
        <filter id={filterId} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <path
        d={P_PATH}
        stroke={`url(#${gradId})`}
        strokeWidth="11"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#${filterId})`}
      />
    </svg>
  );
}
