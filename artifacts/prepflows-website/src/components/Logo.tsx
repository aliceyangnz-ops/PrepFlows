import logoSrc from "@assets/F05F2FD9-CE9B-4179-AA06-CFB58422178D_1779802862293.png";

interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 32, className = "" }: LogoProps) {
  return (
    <img
      src={logoSrc}
      alt="PrepFlows logo"
      width={size}
      height={size}
      className={className}
      style={{ borderRadius: size * 0.22, objectFit: "cover" }}
    />
  );
}
