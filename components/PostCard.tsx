import Image from 'next/image'

interface PostCardProps {
  title: string
  imageSrc: string
  href?: string
}

export default function PostCard({ title, imageSrc, href }: PostCardProps) {
  return (
    <div className="transform transition-all duration-200 hover:scale-[1.02]">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-[#dfdfdf] rounded-lg overflow-hidden"
      >
        <div className="relative w-full h-72">
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
    </div>
  )
}