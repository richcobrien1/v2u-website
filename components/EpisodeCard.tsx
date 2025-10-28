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

  const handlePlay = () => {
    if (canAccess && (episode.videoUrl || episode.audioUrl)) {
      openPlayer(episode, viewMode)
    }
  }

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

        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-transparent pointer-events-none flex items-center justify-center">
          <div
            className={`transform transition-all duration-200 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 w-16 h-16 rounded-full flex items-center justify-center ${
              canAccess ? 'bg-blue-600' : 'bg-gray-600'
            }`}
          >
            {canAccess ? <Play className="w-8 h-8 text-white ml-1" /> : <Lock className="w-8 h-8 text-white" />}
          </div>
        </div>

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

        {/* Action Buttons */}
        <div className="mt-4 space-y-2">
          {/* Main Play Button */}
          <button
            onClick={handlePlay}
            disabled={!canAccess}
            className={`w-full py-2 px-4 rounded-lg text-sm font-medium text-center transition-colors ${
              canAccess ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {canAccess ? (
              <div className="flex items-center justify-center">
                <Play className="w-4 h-4 mr-2" />
                Play Episode
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Lock className="w-4 h-4 mr-2" />
                Premium Required
              </div>
            )}
          </button>

          {/* View Mode Buttons - Desktop/Tablet Only */}
          {canAccess && (
            <div className="hidden sm:flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  openPlayer(episode, 'popup')
                }}
                className="flex-1 py-2 px-3 bg-gray-200 hover:bg-gray-300 rounded-lg text-xs font-medium transition-colors"
                title="Popup Player"
              >
                Popup
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  openPlayer(episode, 'slideIn')
                }}
                className="flex-1 py-2 px-3 bg-gray-200 hover:bg-gray-300 rounded-lg text-xs font-medium transition-colors"
                title="Picture-in-Picture"
              >
                PiP
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  openPlayer(episode, 'theater')
                }}
                className="flex-1 py-2 px-3 bg-gray-200 hover:bg-gray-300 rounded-lg text-xs font-medium transition-colors"
                title="Theater Mode"
              >
                Theater
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  openPlayer(episode, 'fullscreen')
                }}
                className="flex-1 py-2 px-3 bg-gray-200 hover:bg-gray-300 rounded-lg text-xs font-medium transition-colors"
                title="Fullscreen"
              >
                Full
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
