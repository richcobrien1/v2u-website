interface CTAButtonProps {
  label: string
  href?: string
  onClick?: () => void
  iconRight?: React.ReactNode
  variant: 'dark' | 'light'
  className?: string
}

export default function CTAButton({
  label,
  href,
  onClick,
  iconRight,
  variant,
  className = '',
}: CTAButtonProps) {
  const baseStyle =
    variant === 'dark'
      ? 'bg-white text-black hover:bg-gray-200'
      : 'bg-black text-white hover:bg-gray-800'

  const button = (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium transition ${baseStyle} ${className}`}
    >
      {label}  {iconRight}
    </button>
  )

  return href ? <a href={href}>{button}</a> : button
}