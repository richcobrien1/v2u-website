'use client';

import { useState, useRef } from 'react';
import { X } from 'lucide-react';

export type ViewMode = 'popup' | 'slideIn' | 'sidebar' | 'theater' | 'fullscreen';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title: string;
  description?: string;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export default function VideoPlayerModal({
  isOpen,
  onClose,
  videoUrl,
  title,
  description
}: VideoPlayerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="relative bg-black rounded-lg overflow-hidden max-w-4xl w-full mx-4">
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={onClose}
            className="p-2 bg-black/50 rounded-lg hover:bg-black/70 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
        
        <div className="absolute top-4 left-4 z-10">
          <h3 className="text-white font-semibold text-lg">{title}</h3>
          {description && (
            <p className="text-gray-300 text-sm mt-1">{description}</p>
          )}
        </div>

        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full aspect-video"
          controls
          autoPlay
        />
      </div>
    </div>
  );
}
