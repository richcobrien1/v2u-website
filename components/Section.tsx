interface SectionProps {
  id?: string
  title?: string | React.ReactNode
  body?: string
  children?: React.ReactNode
  variant?: 'dark' | 'light'
  reverse?: boolean
  background?: {
    from: string
    to: string
    angle?: number
  }
  rounded?: boolean
  className?: string
}

export default function Section({
  id,
  title,
  body,
  children,
  variant,
  background,
  rounded = false,
  className = '',
}: SectionProps) {
  const cornerStyle = rounded ? 'rounded-xl' : ''

  const bgStyle = '' // PanelWrapper handles background now

  const textColor = variant === 'dark' 
    ? 'text-white'
    : variant === 'light'
    ? 'text-black'
    : ''

  return (
    <section
      id={id}
      className={`w-full py-6 px-0 ${bgStyle} ${textColor} ${cornerStyle} transition-colors duration-300 ${className}`}
    >
      <div className="max-w-5xl mx-auto">
        {title && <h2 className={`text-2xl font-bold mb-4 ${textColor}`}>{title}</h2>}
        {body && <p className={`text-base font-normal opacity-80 mb-6 ${textColor}`}>{body}</p>}
        {children}
      </div>
    </section>
  )
}