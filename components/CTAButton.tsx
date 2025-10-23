import React from 'react';

interface CTAButtonProps {
  label: string;
  href?: string;
  onClick?: () => void;
  iconRight?: React.ReactNode;
  variant: 'dark' | 'light';
  className?: string;
  type?: 'button' | 'submit' | 'reset'; // 🔥 add this
}

export default function CTAButton({
  label,
  href,
  onClick,
  iconRight,
  variant,
  className = '',
  type = 'button', // default so it doesn’t accidentally submit forms
}: CTAButtonProps) {
  const baseStyle =
    variant === 'dark'
      ? 'bg-white text-black hover:bg-gray-200'
      : 'bg-black text-white hover:bg-gray-800';

  const button = (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium transition ${baseStyle} ${className}`}
    >
      {label} {iconRight}
    </button>
  );

  return href ? (
    <a href={href} className="inline-block">
      {button}
    </a>
  ) : (
    button
  );
}
