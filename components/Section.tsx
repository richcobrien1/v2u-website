interface SectionProps {
  id?: string
  title?: string | React.ReactNode
  body?: string
  children?: React.ReactNode
  variant: 'dark' | 'light'
  reverse?: boolean
  background?: {
    from: string
    to: string
    angle?: number
  }
  rounded?: boolean
}

export default function Section({
  id,
  title,
  body,
  children,
  variant,
  background,
  rounded = false,
}: SectionProps) {
  const cornerStyle = rounded ? 'rounded-xl' : ''

  const bgStyle = background
    ? `bg-gradient-to-b from-[${background.from}] to-[${background.to}]`
    : variant === 'dark'
    ? '#444444'
    : '#dfdfdf'

  const textColor = variant === 'dark' 
    ? 'text-white'
    : 'text-black'

  return (
    <section
      id={id}
      className={`w-full py-12 px-4 ${bgStyle} ${textColor} ${cornerStyle} transition-colors duration-300`}
    >
      <div className="max-w-5xl mx-auto">
        {title && <h2 className="text-2xl font-bold mb-4">{title}</h2>}
        {body && <p className="text-base font-normal opacity-80 mb-6">{body}</p>}
        {children}
      </div>
    </section>
  )
}