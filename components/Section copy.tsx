interface SectionProps {
  id?: string
  title?: string | React.ReactNode
  body?: React.ReactNode
  children?: React.ReactNode
  variant: 'dark' | 'light' | 'green' | 'red' | 'blue'
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

  //Added HSL but having issues on main page title and heading colors when hover and in light mode.

  const variantStylesMap: Record<string, string> = {
    dark: 'bg-[hsl(0,0%,7%)] text-white hover:bg-[hsl(0,0%,7%)]',
    light: 'bg-[hsl(0,0%,97%)] text-black hover:bg-[hsl(0,0%,90%)]',
    green: 'bg-[hsl(140,80%,45%)] text-white hover:bg-[hsl(140,80%,35%)]',
    red: 'bg-[hsl(0,100%,50%)] text-white hover:bg-[hsl(0,100%,40%)]',
    blue: 'bg-[hsl(210,100%,50%)] text-white hover:bg-[hsl(210,100%,40%)]',
  }

  const variantStyles = variantStylesMap[variant] || variantStylesMap.dark

  const bgStyle = background
    ? `bg-gradient-to-b from-[${background.from}] to-[${background.to}]`
    : variantStyles

  return (
    <section
      id={id}
      className={`w-full py-12 px-4 ${bgStyle} ${cornerStyle} transition-colors duration-300`}
    >
      <div className="max-w-5xl mx-auto">
        {title && <h2 className="text-2xl font-bold mb-4">{title}</h2>}
        {body && <div className="text-base font-normal opacity-80 mb-6">{body}</div>}
        {children}
      </div>
    </section>
  )
}
