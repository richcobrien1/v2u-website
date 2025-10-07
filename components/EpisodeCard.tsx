 'use client';

import SmartThumbnail from '@/components/SmartThumbnail';
import { Play, Clock, Calendar, Lock } from 'lucide-react';
import { useVideoPlayerContext } from '@/components/VideoPlayer/VideoPlayerProvider';

interface Episode {
  id: string;
  title: string;
  description: string;
  duration: string;
  publishDate: string;
  thumbnail: string;
  thumbnailFallbacks?: string[]; // Add fallback thumbnails
  category: 'ai-now' | 'ai-now-educate' | 'ai-now-commercial' | 'ai-now-conceptual' | 'ai-now-reviews';
  isPremium: boolean;
  audioUrl?: string;
  videoUrl?: string;
  isNew?: boolean;
  r2Key?: string;
  fileSize?: number;
}

interface EpisodeCardProps {
  episode: Episode;
  userSubscription: 'free' | 'premium';
  viewMode?: 'popup' | 'slideIn' | 'sidebar' | 'theater' | 'fullscreen';
}

export default function EpisodeCard({ episode, userSubscription, viewMode = 'popup' }: EpisodeCardProps) {
  const { openPlayer } = useVideoPlayerContext();
  const canAccess = !episode.isPremium || userSubscription === 'premium';

  const getCategoryColor = (category: Episode['category']) => {
    switch (category) {
      case 'ai-now':
        return 'bg-blue-500';
      case 'ai-now-educate':
        return 'bg-green-500';
      case 'ai-now-commercial':
        return 'bg-purple-500';
      case 'ai-now-conceptual':
        return 'bg-orange-500';
      case 'ai-now-reviews':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatCategory = (category: Episode['category']) => {
    return category.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const handlePlay = () => {
    if (canAccess && (episode.videoUrl || episode.audioUrl)) {
      openPlayer(episode, viewMode);
    }
  };

  return (
    <div 
      onClick={handlePlay}
      className={`transform transition-all duration-200 hover:scale-[1.02] bg-[#dfdfdf] rounded-lg overflow-hidden group cursor-pointer ${
        canAccess ? 'hover:scale-105' : 'cursor-not-allowed opacity-75'
      }`}
    >
      {/* Thumbnail */}
      <div className="relative w-full h-48 bg-gray-200 overflow-hidden">
        <SmartThumbnail src={episode.thumbnail} fallbacks={episode.thumbnailFallbacks || []} alt={episode.title} fill sizes="(max-width: 640px) 100vw, 33vw" />
        
        {/* Play Button Overlay - disabled unless hovered */}
        <div className="absolute inset-0 bg-transparent pointer-events-none flex items-center justify-center">
          <div
            className={
              `transform transition-all duration-200 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 w-16 h-16 rounded-full flex items-center justify-center ${canAccess ? 'bg-blue-600' : 'bg-gray-600'}`
            }
          >
            {canAccess ? <Play className="w-8 h-8 text-white ml-1" /> : <Lock className="w-8 h-8 text-white" />}
          </div>
        </div>

        {/* Category Badge */}
        <div className="absolute top-2 left-2 z-30">
          <span className={`${getCategoryColor(episode.category)} text-white text-xs px-2 py-1 rounded-full font-medium`}>
            {formatCategory(episode.category)}
          </span>
        </div>

        {/* New Badge */}
        {episode.isNew && (
          <div className="absolute top-2 right-2 z-30">
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              NEW
            </span>
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
        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 leading-tight">
          {episode.title}
        </h3>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {episode.description}
        </p>

        {/* Episode Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {episode.duration}
            </div>
            <div className="flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              {episode.publishDate}
            </div>
          </div>
          
          {episode.fileSize && (
            <div className="text-gray-400">
              {(episode.fileSize / (1024 * 1024)).toFixed(1)}MB
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex space-x-2">
          <div className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium text-center ${canAccess ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-500'}`}>
            {canAccess ? 'Click to Play Episode' : 'Premium Required'}
          </div>
          
          {/* View Mode Quick Actions */}
          <div className="flex space-x-1">
            <button
              onClick={(e) => {
                  e.stopPropagation();
                  if (canAccess) {
                    openPlayer(episode, 'slideIn');
                  }
                }}
              disabled={!canAccess}
              className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg disabled:opacity-50"
              title="Picture-in-Picture"
            >
              <div className="w-4 h-3 border-2 border-gray-600 rounded"></div>
            </button>
            <button
              onClick={(e) => {
                  e.stopPropagation();
                  if (canAccess) {
                    openPlayer(episode, 'theater');
                  }
                }}
              disabled={!canAccess}
              className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg disabled:opacity-50"
              title="Theater Mode"
            >
              <div className="w-4 h-3 border-2 border-gray-600 rounded border-t-4"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}