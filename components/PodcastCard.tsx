import React from 'react'
import Image from 'next/image'

interface PodcastCardProps {
  title: string
  imageSrc: string
  href?: string
  embedUrl?: string
  embedType?: 'youtube' | 'spotify' | 'twitter' | 'linkedin' | 'rumble' | 'facebook' | 'instagram'
}

export default function PodcastCard({ title, imageSrc, href, embedUrl, embedType }: PodcastCardProps) {
  const [embedError, setEmbedError] = React.useState(false)

  React.useEffect(() => {
    if (embedUrl && embedType) {
      // Set a timeout to fallback to image if embed doesn't load within 5 seconds
      const timer = setTimeout(() => {
        setEmbedError(true)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [embedUrl, embedType])

  const renderEmbed = () => {
    if (!embedUrl || !embedType || embedError) return null

    const handleEmbedError = () => setEmbedError(true)

    switch (embedType) {
      case 'youtube':
        return (
          <iframe
            src={embedUrl}
            title={title}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onError={handleEmbedError}
            onLoad={() => {
              // Clear any pending timeout when iframe loads successfully
              const timer = setTimeout(() => setEmbedError(false), 100)
              clearTimeout(timer)
            }}
          />
        )
      case 'spotify':
        return (
          <iframe
            src={embedUrl}
            title={title}
            className="w-full h-full"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            onError={handleEmbedError}
            onLoad={() => {
              // Clear any pending timeout when iframe loads successfully
              const timer = setTimeout(() => setEmbedError(false), 100)
              clearTimeout(timer)
            }}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="transform transition-all duration-200 hover:scale-[1.02]">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-[#dfdfdf] rounded-lg overflow-hidden"
      >
        <div className="relative w-full h-48">
          {embedUrl && embedType && !embedError ? (
            renderEmbed()
          ) : (
            <Image
              src={imageSrc}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className="object-cover"
              priority
            />
          )}
        </div>
        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        </div>
      </a>
    </div>
  )
}