'use client'

import { useState, useEffect } from 'react'
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
  const [resolvedVideoUrl, setResolvedVideoUrl] = useState<string | null>(null)
  const [resolvedAudioUrl, setResolvedAudioUrl] = useState<string | null>(null)
  const [loadingPremium, setLoadingPremium] = useState(false)

  // Fetch premium URLs when component mounts for premium content
  useEffect(() => {
    if (episode.isPremium && userSubscription === 'premium' && canAccess) {
      const fetchPremiumUrls = async () => {
        setLoadingPremium(true)
        try {
          if (episode.videoUrl) {
            const response = await fetch(episode.videoUrl, { credentials: 'include' })
            if (response.ok) {
              const data = await response.json() as { url: string; success: boolean }
              if (data.success && data.url) {
                setResolvedVideoUrl(data.url)
              }
            }
          }
          
          if (episode.audioUrl) {
            const response = await fetch(episode.audioUrl, { credentials: 'include' })
            if (response.ok) {
              const data = await response.json() as { url: string; success: boolean }
              if (data.success && data.url) {
                setResolvedAudioUrl(data.url)
              }
            }
          }
        } catch (err) {
          console.error('Premium content access error:', err)
        } finally {
          setLoadingPremium(false)
        }
      }
      
      fetchPremiumUrls()
    } else {
      // For non-premium content, use original URLs
      setResolvedVideoUrl(episode.videoUrl || null)
      setResolvedAudioUrl(episode.audioUrl || null)
    }
  }, [episode.isPremium, episode.videoUrl, episode.audioUrl, userSubscription, canAccess])

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

  const handleCardClick = () => {
    if (canAccess && (episode.videoUrl || episode.audioUrl)) {
      openPlayer(episode, viewMode)
    }
  }

  return (
    <div
      onClick={handleCardClick}
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

        {/* Always Visible Inline Player */}
        {canAccess && (episode.videoUrl || episode.audioUrl) && (
          <div 
            className="mt-3 p-3 bg-gray-800 rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {loadingPremium && (
              <div className="text-white text-center py-2">Loading premium content...</div>
            )}
            {episode.videoUrl && (
              <video
                controls
                className="w-full rounded-lg"
              >
                <source src={resolvedVideoUrl || episode.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
            {episode.audioUrl && (
              <audio
                controls
                className="w-full"
              >
                <source src={resolvedAudioUrl || episode.audioUrl} type="audio/mpeg" />
                Your browser does not support the audio tag.
              </audio>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
