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
  const bgClass = variant === 'dark' ? 'bg-[#212121ff]' : variant === 'light' ? 'bg-[#dfdfdfff]' : 'bg-transparent'
  const textClass = variant === 'dark' ? 'text-white' : 'text-black'

  return (
    <div
      className={`rounded-xl p-6 mb-4 ${bgClass} ${textClass} transition-colors duration-300 ${className}`}
      style={{ boxShadow: 'none' }}
    >
      {children}
    </div>
  )
}
