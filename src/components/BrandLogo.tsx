import React from 'react';

interface BrandLogoProps extends React.SVGProps<SVGSVGElement> {
  withBackground?: boolean;
  size?: number;
}

/**
 * BrandLogo – logo padrão reutilizável (chart line) com opção de fundo.
 * Usa currentColor para herdar cor do texto quando sem background.
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({ withBackground = false, size = 32, className = '', ...rest }) => {
  // Em dark mode queremos branco puro sobre fundo; em light herdamos primary/foreground.
  const stroke = withBackground ? '#FFFFFF' : 'currentColor';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role="img"
      aria-label="Logo investorion"
      className={className}
      {...rest}
    >
      {withBackground && <rect width="24" height="24" rx="4" className="fill-[hsl(var(--foreground))] dark:fill-[#0F172A]" />}
      <path d="M3 3v16a2 2 0 0 0 2 2h16" fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <path d="m19 9-5 5-4-4-3 3" fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export default BrandLogo;
