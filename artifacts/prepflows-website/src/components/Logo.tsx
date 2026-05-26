import logoSrc from "@assets/087EDDDA-D524-4C13-B632-5D34B7AC927E_1779795965505.png";

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
