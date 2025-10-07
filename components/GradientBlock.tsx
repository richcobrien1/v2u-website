import Link from 'next/link'

type GradientBlockProps = {
  label: string
  href?: string
  gradient?: string
  subtle?: boolean
  heightClass?: string
}

export default function GradientBlock({
  label,
  href,
  gradient = 'bg-[#0F8378FF]',
  subtle = false,
  heightClass = 'h-28',
}: GradientBlockProps) {
  const block = (
    <div
      className={`${gradient} ${heightClass} w-full rounded-xl p-6 text-white transition-transform hover:scale-[1.02] ${
        subtle ? 'opacity-90' : ''
      } flex items-center justify-center text-center`}
    >
      {label}
    </div>
  )

  return href ? <Link href={href}>{block}</Link> : block
}