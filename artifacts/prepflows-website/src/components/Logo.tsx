import { useId } from "react";

interface LogoProps {
  size?: number;
  className?: string;
}

/**
 * PrepFlows mark — fluid organic blob with liquid-glass shading.
 * Yellow-gold at the specular highlight, flowing to deep forest green
 * at the shadowed edges. White "P" letterform on top.
 * Web SVG with Gaussian glow filter on the "P" for extra polish.
 */
export function Logo({ size = 32, className = "" }: LogoProps) {
  const uid = useId().replace(/:/g, "p");
  const bgId = `${uid}bg`;
  const blobId = `${uid}blob`;
  const glowId = `${uid}glow`;
  const filterId = `${uid}f`;

  const BLOB =
    "M 57 13 C 78 11, 89 29, 87 52 C 85 73, 69 88, 49 86 C 29 84, 13 67, 14 46 C 15 26, 36 15, 57 13 Z";
  const SPEC =
    "M 32 26 C 39 17, 59 16, 66 25 C 71 32, 57 20, 45 21 C 37 21, 30 31, 32 26 Z";
  const SPEC2 =
    "M 36 33 C 41 25, 51 24, 55 29 C 47 23, 37 29, 36 33 Z";
  const P_PATH =
    "M 37 72 L 37 28 Q 37 22 43 22 L 55 22 Q 67 22 67 35 L 67 44 Q 67 57 55 57 L 37 57";

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
          <stop offset="0%" stopColor="#0B0E14" />
          <stop offset="100%" stopColor="#060809" />
        </linearGradient>

        {/* Blob: near-white highlight → brand yellow → amber → deep forest green */}
        <radialGradient id={blobId} cx="33%" cy="27%" r="75%">
          <stop offset="0%" stopColor="#FEFCE8" />
          <stop offset="12%" stopColor="#FDE047" />
          <stop offset="36%" stopColor="#EAB308" />
          <stop offset="62%" stopColor="#CA8A04" />
          <stop offset="82%" stopColor="#14532D" />
          <stop offset="100%" stopColor="#052E16" />
        </radialGradient>

        <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#EAB308" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#EAB308" stopOpacity="0" />
        </radialGradient>

        {/* Glow filter for the "P" letterform */}
        <filter id={filterId} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background */}
      <rect width="100" height="100" rx="22" fill={`url(#${bgId})`} />

      {/* Ambient yellow glow */}
      <rect width="100" height="100" rx="22" fill={`url(#${glowId})`} />

      {/* Main fluid blob */}
      <path d={BLOB} fill={`url(#${blobId})`} />

      {/* Specular crescent — primary liquid-glass reflection */}
      <path d={SPEC} fill="white" opacity="0.48" />

      {/* Micro inner highlight — brightest point */}
      <path d={SPEC2} fill="white" opacity="0.65" />

      {/* "P" letterform — clean white with subtle glow */}
      <path
        d={P_PATH}
        stroke="white"
        strokeWidth="8.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#${filterId})`}
      />
    </svg>
  );
}
