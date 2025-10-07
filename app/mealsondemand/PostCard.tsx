import Image from 'next/image'

interface PostCardProps {
  title: string
  imageSrc: string
  href?: string
}

export default function CardDeck({ title, imageSrc, href }: PostCardProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300"
    >
      <div className="relative w-full h-120">
        <Image
          src={imageSrc}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-cover"
          priority
        />
      </div>
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      </div>
    </a>
  )
}