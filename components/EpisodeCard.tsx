'use client'

import SmartThumbnail from '@/components/SmartThumbnail'
import { Play, Calendar, Lock } from 'lucide-react'
import { useVideoPlayerContext } from '@/components/VideoPlayer/VideoPlayerProvider'

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
  const { openPlayer } = useVideoPlayerContext()
  const canAccess = !episode.isPremium || userSubscription === 'premium'
  
  // Use viewMode parameter
  const handlePlay = () => {
    if (canAccess && (episode.videoUrl || episode.audioUrl)) {
      openPlayer(episode, viewMode)
    }
  }

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

  return (
    <div
      onClick={handlePlay}
      className={`transform transition-all duration-200 hover:scale-[1.02] bg-[#dfdfdf] rounded-lg overflow-hidden group ${
        canAccess ? 'hover:scale-105 cursor-pointer' : 'cursor-not-allowed opacity-75'
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
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-3 line-clamp-2 leading-tight">{episode.title}</h3>

        {/* Metadata - Only show publish date */}
        <div className="flex items-center text-xs text-gray-500 mb-4">
          <Calendar className="w-3 h-3 mr-1" />
          {episode.publishDate}
        </div>

        {/* Play Indicator */}
        {!canAccess && (
          <div className="mt-4">
            <div className="flex items-center justify-center py-2 px-4 bg-gray-200 text-gray-600 rounded-lg text-sm font-medium">
              <Lock className="w-4 h-4 mr-2" />
              Premium Required
            </div>
          </div>
        )}
        
        {canAccess && (
          <div className="mt-4 flex items-center justify-center text-gray-500 text-sm">
            <Play className="w-4 h-4 mr-1" />
            Click to play
          </div>
        )}
      </div>
    </div>
  )
}
