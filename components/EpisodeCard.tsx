'use client'

import { useState } from 'react'
import SmartThumbnail from '@/components/SmartThumbnail'
import { Play, Calendar, Lock } from 'lucide-react'

interface Episode {
  id: string
  title: string
  description: string
  duration: string
  publishDate: string
  thumbnail: string
  thumbnailFallbacks?: string[]
  category: 'ai-now' | 'ai-now-educate' | 'ai-now-commercial' | 'ai-now-conceptual' | 'ai-now-reviews'
  isPremium: boolean
  audioUrl?: string
  videoUrl?: string
  isNew?: boolean
  r2Key?: string
  fileSize?: number
  lastModified?: string
}

interface EpisodeCardProps {
  episode: Episode
  userSubscription: 'free' | 'premium'
  viewMode?: 'popup' | 'slideIn' | 'sidebar' | 'theater' | 'fullscreen'
}

export default function EpisodeCard({
  episode,
  userSubscription,
  viewMode = 'popup',
}: EpisodeCardProps) {
  const canAccess = !episode.isPremium || userSubscription === 'premium'
  const [isPlayingInline, setIsPlayingInline] = useState(false)
  const [secureMediaUrl, setSecureMediaUrl] = useState<string | null>(null)
  const [loadingSecureUrl, setLoadingSecureUrl] = useState(false)

  const getCategoryColor = (category: Episode['category']) => {
    switch (category) {
      case 'ai-now':
        return 'bg-blue-500'
      case 'ai-now-educate':
        return 'bg-green-500'
      case 'ai-now-commercial':
        return 'bg-purple-500'
      case 'ai-now-conceptual':
        return 'bg-orange-500'
      case 'ai-now-reviews':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const formatCategory = (category: Episode['category']) =>
    category
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

  // Start playing inline immediately
  const handlePlayClick = async () => {
    if (!canAccess) {
      alert('Premium subscription required for this episode!')
      return
    }
    
    if (!episode.videoUrl && !episode.audioUrl) return
    
    // For premium content, get secure URL first
    if (episode.isPremium && userSubscription === 'premium') {
      setLoadingSecureUrl(true)
      try {
        // Use credentials: 'include' to send cookies instead of localStorage token
        const mediaPath = episode.videoUrl || episode.audioUrl
        const response = await fetch(`/api/r2/private/${mediaPath}`, {
          credentials: 'include'
        })

        if (response.ok) {
          const data = await response.json() as { url: string; success: boolean }
          if (data.success && data.url) {
            setSecureMediaUrl(data.url)
            setIsPlayingInline(true)
          } else {
            alert('Unable to access premium content')
          }
        } else {
          alert('Access denied - please check your subscription')
        }
      } catch (err) {
        console.error('Premium content access error:', err)
        alert('Error accessing premium content')
      } finally {
        setLoadingSecureUrl(false)
      }
    } else {
      // Public content - play directly
      setIsPlayingInline(true)
    }
  }

  return (
    <div
      onClick={handlePlayClick}
      className={`transform transition-all duration-200 hover:scale-[1.02] bg-[#dfdfdf] rounded-lg overflow-hidden group cursor-pointer ${
        !canAccess ? 'opacity-75 cursor-not-allowed' : ''
      }`}
    >
      {/* Thumbnail */}
      <div className="relative w-full h-48 bg-gray-200 overflow-hidden">
        <SmartThumbnail
          src={episode.thumbnail}
          fallbacks={episode.thumbnailFallbacks || []}
          alt={episode.title}
          fill
          sizes="(max-width: 640px) 100vw, 33vw"
        />

        {/* Category Badge */}
        <div className="absolute top-2 left-2 z-30">
          <span
            className={`${getCategoryColor(
              episode.category
            )} text-white text-xs px-2 py-1 rounded-full font-medium`}
          >
            {formatCategory(episode.category)}
          </span>
        </div>

        {/* New Badge */}
        {episode.isNew && (
          <div className="absolute top-2 right-2 z-30">
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">NEW</span>
          </div>
        )}

        {/* Premium Badge */}
        {episode.isPremium && (
          <div className="absolute bottom-2 right-2 z-30">
            <span className="bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-medium flex items-center">
              <Lock className="w-3 h-3 mr-1" />
              Premium
            </span>
          </div>
        )}

        {/* Click to Play Overlay */}
        {!isPlayingInline && !loadingSecureUrl && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
            <div className="bg-white/90 rounded-full p-3">
              {canAccess ? (
                <Play className="w-8 h-8 text-gray-800" />
              ) : (
                <Lock className="w-8 h-8 text-gray-800" />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-medium text-sm text-gray-800 mb-3 leading-tight"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
              borderRadius: '6px',
              padding: '6px 10px',
              margin: '-2px -6px 10px -6px',
              fontSize: '13px',
              lineHeight: '1.3',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
        >
          {episode.title}
        </h3>

        {/* Metadata - Only show publish date */}
        <div className="flex items-center text-xs text-gray-500 mb-4">
          <Calendar className="w-3 h-3 mr-1" />
          {episode.publishDate}
        </div>

        {/* Inline Player */}
        {isPlayingInline && canAccess && (
          <div className="mt-3 p-3 bg-gray-800 rounded-lg relative">
            {/* Close button */}
            <button 
              onClick={(e) => {
                e.stopPropagation()
                setIsPlayingInline(false)
                setSecureMediaUrl(null)
              }}
              className="absolute top-2 right-2 text-white hover:text-gray-300 z-10"
              title="Close player"
            >
              ✕
            </button>
            {episode.videoUrl ? (
              <video
                controls
                autoPlay
                className="w-full rounded-lg"
                onPlay={() => setIsPlayingInline(true)}
                onPause={() => setIsPlayingInline(false)}
                onEnded={() => {
                  setIsPlayingInline(false)
                  setSecureMediaUrl(null)
                }}
              >
                <source src={episode.isPremium ? secureMediaUrl || episode.videoUrl : episode.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : episode.audioUrl ? (
              <audio
                controls
                autoPlay
                className="w-full"
                onPlay={() => setIsPlayingInline(true)}
                onPause={() => setIsPlayingInline(false)}
                onEnded={() => {
                  setIsPlayingInline(false)
                  setSecureMediaUrl(null)
                }}
              >
                <source src={episode.isPremium ? secureMediaUrl || episode.audioUrl : episode.audioUrl} type="audio/mpeg" />
                Your browser does not support the audio tag.
              </audio>
            ) : null}
          </div>
        )}

      </div>
    </div>
  )
}
