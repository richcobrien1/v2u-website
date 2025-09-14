interface PanelWrapperProps {
  children: React.ReactNode
  className?: string
  variant?: 'dark' | 'light'
}

export default function PanelWrapper({
  children,
  className = '',
  variant = 'light',
}: PanelWrapperProps) {
  const bgClass = variant === 'dark' ? 'bg-[#212121ff]' : 'bg-[#dfdfdfff]'
  const textClass = variant === 'dark' ? 'text-white' : 'text-black'

  return (
    <div
      className={`rounded-xl p-4 mb-4 ${bgClass} ${textClass} transition-colors duration-300 ${className}`}
    >
      {children}
    </div>
  )
}
